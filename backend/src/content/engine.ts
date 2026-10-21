import { Prisma, type ContentStatus } from "@prisma/client";
import { prisma } from "../db.js";
import { snapshot } from "../lib/audit.js";
import { badRequest, conflict, notFound } from "../lib/errors.js";
import { getCollection, type CollectionDef } from "./collections.js";
import { collectStrings, objectSchema, type FieldDef } from "./fields.js";
import { zodFields } from "../lib/errors.js";

/**
 * Generic operations for every collection: list, validate, save, publish,
 * unpublish, discard pending edits, delete, reorder and restore revisions.
 *
 * Draft workflow:
 * - DRAFT items are edited in place (their columns).
 * - PUBLISHED items keep serving their columns; saving puts the edits in `draft`
 *   until they're published (or discarded). Preview renders the working copy.
 * - A PUBLISHED item with a future publishedAt is scheduled: it is hidden from
 *   the public API until that time.
 */

type Row = Record<string, unknown> & {
  id: string;
  slug: string;
  status: ContentStatus;
  publishedAt: Date | null;
  sortOrder: number;
  draft: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

// Prisma delegates share this shape; the generic engine only needs these calls.
interface Delegate {
  findMany(args?: unknown): Promise<Row[]>;
  findUnique(args: unknown): Promise<Row | null>;
  findFirst(args: unknown): Promise<Row | null>;
  create(args: unknown): Promise<Row>;
  update(args: unknown): Promise<Row>;
  delete(args: unknown): Promise<Row>;
  count(args?: unknown): Promise<number>;
  aggregate(args: unknown): Promise<{ _max: { sortOrder: number | null } }>;
  groupBy(args: unknown): Promise<Array<{ status: ContentStatus; _count: { _all: number } }>>;
}

export const delegate = (def: CollectionDef) => (prisma as unknown as Record<string, Delegate>)[def.model];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function requireCollection(key: string) {
  const def = getCollection(key);
  if (!def) throw notFound("Unknown content type.");
  return def;
}

const isJsonField = (f: FieldDef) => f.type === "list" || f.type === "object";

/** Field values of an item as editors see them: the published columns overlaid with pending edits. */
export function workingValues(def: CollectionDef, row: Row): Record<string, unknown> {
  const pending = (row.draft ?? {}) as Record<string, unknown>;
  const values: Record<string, unknown> = { slug: pending.slug ?? row.slug };
  for (const f of def.fields) values[f.name] = f.name in pending ? pending[f.name] : row[f.name];
  return values;
}

function liveValues(def: CollectionDef, row: Row): Record<string, unknown> {
  const values: Record<string, unknown> = { slug: row.slug };
  for (const f of def.fields) values[f.name] = row[f.name];
  return values;
}

export function isScheduled(row: Pick<Row, "status" | "publishedAt">) {
  return row.status === "PUBLISHED" && !!row.publishedAt && row.publishedAt > new Date();
}

export function toAdmin(def: CollectionDef, row: Row) {
  return {
    id: row.id,
    status: row.status,
    publishedAt: row.publishedAt,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    hasPendingChanges: def.publishable && row.status === "PUBLISHED" && row.draft !== null,
    scheduled: isScheduled(row),
    values: workingValues(def, row),
  };
}

/** Shape served to the public site: field values plus slug and publish date. Never includes drafts or user ids. */
export function toPublic(def: CollectionDef, row: Row, values = liveValues(def, row)) {
  return { ...values, publishedAt: row.publishedAt, updatedAt: row.updatedAt };
}

export function publicWhere(def: CollectionDef) {
  if (!def.publishable) return {};
  return { status: "PUBLISHED" as const, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] };
}

export function orderBy(def: CollectionDef) {
  return def.ordering === "publishedAt"
    ? [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }]
    : [{ sortOrder: "asc" }, { createdAt: "asc" }];
}

/** Validate submitted values. Returns the clean values, including the slug. */
export async function validateValues(def: CollectionDef, input: unknown, currentId?: string) {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const result = objectSchema(def.fields).safeParse(raw);
  if (!result.success) {
    const fields = zodFields(result.error);
    throw badRequest(Object.values(fields)[0] ?? "Check the highlighted fields.", fields);
  }
  const values = result.data as Record<string, unknown>;

  if (def.slugFrom) {
    const given = typeof raw.slug === "string" ? raw.slug.trim().toLowerCase() : "";
    const slug = given || slugify(String(values[def.slugFrom] ?? ""));
    if (!slug || !SLUG.test(slug)) throw badRequest("Use lowercase letters, numbers and hyphens for the URL slug.", { slug: "Use lowercase letters, numbers and hyphens, e.g. my-article." });
    const clash = await delegate(def).findFirst({ where: { slug, ...(currentId ? { NOT: { id: currentId } } : {}) }, select: { id: true } });
    if (clash) throw conflict("Another item already uses that URL slug.", { slug: "Another item already uses this slug." });
    values.slug = slug;
  }

  await checkReferences(def, values);
  await checkUniqueNumbers(def, values, currentId);
  return values;
}

async function checkReferences(def: CollectionDef, values: Record<string, unknown>) {
  for (const f of def.fields) {
    if (f.type !== "reference" || values[f.name] === null || values[f.name] === undefined) continue;
    const target = requireCollection(f.collection);
    const where = f.valueField === "number" ? { number: values[f.name] } : { id: values[f.name] };
    const found = await delegate(target).findFirst({ where, select: { id: true } });
    if (!found) throw badRequest(`Choose an existing ${target.singular.toLowerCase()}.`, { [f.name]: `Choose an existing ${target.singular.toLowerCase()}.` });
  }
}

async function checkUniqueNumbers(def: CollectionDef, values: Record<string, unknown>, currentId?: string) {
  const field = def.fields.find((f) => f.name === "number" && f.type === "number");
  if (!field || values.number === null || values.number === undefined) return;
  const clash = await delegate(def).findFirst({ where: { number: values.number, ...(currentId ? { NOT: { id: currentId } } : {}) }, select: { id: true } });
  if (clash) throw conflict(`Another ${def.singular.toLowerCase()} already uses that number.`, { number: "Already in use." });
}

/** Convert clean values to Prisma column data (Json nulls need Prisma.DbNull). */
function columnData(def: CollectionDef, values: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  if (def.slugFrom && values.slug) data.slug = values.slug;
  for (const f of def.fields) {
    const v = values[f.name];
    data[f.name] = isJsonField(f) && (v === null || v === undefined) ? Prisma.DbNull : v;
  }
  return data;
}

const jsonSafe = (values: Record<string, unknown>) => JSON.parse(JSON.stringify(values)) as Prisma.InputJsonValue;

export async function listItems(def: CollectionDef, opts: { q?: string; status?: string; take?: number; skip?: number }) {
  const where: Record<string, unknown> = {};
  if (opts.status === "draft") where.status = "DRAFT";
  if (opts.status === "published") where.status = "PUBLISHED";
  if (opts.status === "pending") Object.assign(where, { status: "PUBLISHED", NOT: { draft: { equals: Prisma.DbNull } } });
  if (opts.q) {
    const textFields = def.fields.filter((f) => f.type === "text" && !f.multiline).slice(0, 4).map((f) => f.name);
    where.OR = [...textFields, ...(def.slugFrom ? ["slug"] : [])].map((name) => ({ [name]: { contains: opts.q, mode: "insensitive" } }));
  }
  const d = delegate(def);
  const [rows, total] = await Promise.all([d.findMany({ where, orderBy: orderBy(def), take: opts.take ?? 200, skip: opts.skip ?? 0 }), d.count({ where })]);
  return { items: rows.map((r) => toAdmin(def, r)), total };
}

export async function getRow(def: CollectionDef, id: string) {
  const row = await delegate(def).findUnique({ where: { id } });
  if (!row) throw notFound(`That ${def.singular.toLowerCase()} doesn't exist or was deleted.`);
  return row;
}

export async function createItem(def: CollectionDef, input: unknown, userId: string) {
  const values = await validateValues(def, input);
  const max = await delegate(def).aggregate({ _max: { sortOrder: true } });
  return delegate(def).create({
    data: {
      ...columnData(def, values),
      status: def.publishable ? "DRAFT" : "PUBLISHED",
      publishedAt: def.publishable ? null : new Date(),
      sortOrder: def.ordering === "manual" ? (max._max.sortOrder ?? -1) + 1 : 0,
      createdById: userId,
      updatedById: userId,
    },
  });
}

/** Save edits. Returns { row, live } where live says whether the public site changed. */
export async function saveItem(def: CollectionDef, id: string, input: unknown, userId: string) {
  const row = await getRow(def, id);
  const values = await validateValues(def, input, id);
  if (def.publishable && row.status === "PUBLISHED") {
    const updated = await delegate(def).update({ where: { id }, data: { draft: jsonSafe(values), updatedById: userId } });
    return { row: updated, live: false };
  }
  const updated = await delegate(def).update({ where: { id }, data: { ...columnData(def, values), draft: Prisma.DbNull, updatedById: userId } });
  if (!def.publishable) await snapshot(def.key, id, "saved", values, userId);
  return { row: updated, live: !def.publishable };
}

/**
 * Content handoffs mark unconfirmed facts like "[REGION: confirm …]" or "[CLIENT QUOTE: to be collected]".
 * Two or more capitals after the bracket, then ":" "," or "]", so markdown links like [Read more](…) don't match.
 */
const PLACEHOLDER = /\[[A-Z]{2,}[A-Z0-9 /&-]*(?:[:,][^\]]*)?\]/;

/** Labels of the fields that still contain a placeholder. */
export function placeholderFields(def: CollectionDef, values: Record<string, unknown>) {
  return def.fields.filter((f) => collectStrings(values[f.name]).some((s) => PLACEHOLDER.test(s)));
}

export async function publishItem(def: CollectionDef, id: string, userId: string, publishAt?: Date | null) {
  if (!def.publishable) throw badRequest(`${def.label} are always live.`);
  const row = await getRow(def, id);
  // Re-validate: referenced items or uniqueness may have changed since the edits were saved.
  const values = await validateValues(def, workingValues(def, row), id);
  const pending = placeholderFields(def, values);
  if (pending.length) {
    throw badRequest(
      `Replace the [PLACEHOLDERS] in ${pending.map((f) => f.label).join(", ")} before publishing.`,
      Object.fromEntries(pending.map((f) => [f.name, "Still has a [PLACEHOLDER]. Fill it in, or remove it."])),
    );
  }
  const publishedAt = publishAt ?? (row.status === "PUBLISHED" && row.publishedAt ? row.publishedAt : new Date());
  const updated = await delegate(def).update({
    where: { id },
    data: { ...columnData(def, values), draft: Prisma.DbNull, status: "PUBLISHED", publishedAt, updatedById: userId },
  });
  await snapshot(def.key, id, "published", values, userId);
  return updated;
}

export async function unpublishItem(def: CollectionDef, id: string, userId: string) {
  if (!def.publishable) throw badRequest(`${def.label} can't be unpublished.`);
  const row = await getRow(def, id);
  // Once offline, edits apply in place again, so fold any pending edits into the columns.
  const values = workingValues(def, row);
  return delegate(def).update({ where: { id }, data: { ...columnData(def, values), draft: Prisma.DbNull, status: "DRAFT", updatedById: userId } });
}

export async function discardDraft(def: CollectionDef, id: string, userId: string) {
  await getRow(def, id);
  return delegate(def).update({ where: { id }, data: { draft: Prisma.DbNull, updatedById: userId } });
}

export async function deleteItem(def: CollectionDef, id: string, userId: string) {
  const row = await getRow(def, id);
  await snapshot(def.key, id, "deleted", workingValues(def, row), userId);
  await delegate(def).delete({ where: { id } });
  return row;
}

export async function reorderItems(def: CollectionDef, ids: string[]) {
  if (def.ordering !== "manual") throw badRequest(`${def.label} are ordered by date.`);
  const d = delegate(def);
  await prisma.$transaction(ids.map((id, index) => d.update({ where: { id }, data: { sortOrder: index } }) as unknown as Prisma.PrismaPromise<unknown>));
}

export async function restoreRevision(def: CollectionDef, id: string, revisionId: string, userId: string) {
  const revision = await prisma.revision.findFirst({ where: { id: revisionId, entityType: def.key, entityId: id } });
  if (!revision) throw notFound("That version no longer exists.");
  // Restored values go through the normal save path: into `draft` if the item is live.
  return saveItem(def, id, revision.data, userId);
}

export async function statusCounts(def: CollectionDef) {
  const d = delegate(def);
  const [groups, pending, scheduled] = await Promise.all([
    d.groupBy({ by: ["status"], _count: { _all: true } }),
    def.publishable ? d.count({ where: { status: "PUBLISHED", NOT: { draft: { equals: Prisma.DbNull } } } }) : 0,
    def.publishable ? d.count({ where: { status: "PUBLISHED", publishedAt: { gt: new Date() } } }) : 0,
  ]);
  const by = Object.fromEntries(groups.map((g) => [g.status, g._count._all]));
  return { draft: by.DRAFT ?? 0, published: (by.PUBLISHED ?? 0) - scheduled, scheduled, pending };
}
