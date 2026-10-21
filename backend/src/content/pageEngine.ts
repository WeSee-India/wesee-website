import { Prisma, type Page, type PageSection } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { snapshot } from "../lib/audit.js";
import { badRequest, conflict, notFound, zodFields } from "../lib/errors.js";
import { emptyValue, objectSchema } from "./fields.js";
import { RESERVED_PATHS, sectionTypeByType, systemPageByKey, systemPages } from "./pages.js";
import { slugify } from "./engine.js";

/**
 * Pages are edited as a whole working copy (page fields + ordered sections).
 * Saving stores the working copy in `draft`; publishing writes it to the page
 * columns and PageSection rows in one transaction. The public site only ever
 * reads the columns and rows.
 */

export interface SectionState {
  key: string;
  type: string;
  label: string | null;
  visible: boolean;
  content: Record<string, unknown>;
}

export interface PageState {
  title: string;
  path: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noindex: boolean;
  sections: SectionState[];
}

type PageWithSections = Page & { sections: PageSection[] };

export function liveState(page: PageWithSections): PageState {
  return {
    title: page.title,
    path: page.path,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    ogImage: page.ogImage,
    noindex: page.noindex,
    sections: [...page.sections]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({ key: s.key, type: s.type, label: s.label, visible: s.visible, content: (s.content ?? {}) as Record<string, unknown> })),
  };
}

export function workingState(page: PageWithSections): PageState {
  return (page.draft as unknown as PageState | null) ?? liveState(page);
}

export function toAdminPage(page: PageWithSections) {
  const def = page.kind === "SYSTEM" ? systemPageByKey.get(page.key) : undefined;
  return {
    id: page.id,
    key: page.key,
    kind: page.kind,
    status: page.status,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
    description: def?.description ?? null,
    hasPendingChanges: page.draft !== null && page.status === "PUBLISHED",
    hasDraft: page.draft !== null,
    state: workingState(page),
  };
}

/** Public shape: only visible sections, in order. */
export function toPublicPage(page: Pick<Page, "key" | "kind" | "publishedAt" | "updatedAt">, state: PageState) {
  return {
    key: page.key,
    kind: page.kind,
    path: state.path,
    title: state.title,
    seoTitle: state.seoTitle,
    seoDescription: state.seoDescription,
    ogImage: state.ogImage,
    noindex: state.noindex,
    updatedAt: page.updatedAt,
    sections: state.sections.filter((s) => s.visible).map((s) => ({ key: s.key, type: s.type, content: s.content })),
  };
}

const PATH = /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

const baseSchema = z.object({
  title: z.string().trim().min(1, "Give the page a name.").max(120),
  path: z.string().trim().optional(),
  seoTitle: z.preprocess((v) => (v === "" ? null : v), z.string().trim().max(70).nullable().optional()),
  seoDescription: z.preprocess((v) => (v === "" ? null : v), z.string().trim().max(200).nullable().optional()),
  ogImage: z.preprocess((v) => (v === "" ? null : v), z.string().regex(/^(\/(?!\/)|https?:\/\/)/, "Use an uploaded image or an https:// URL.").nullable().optional()),
  noindex: z.boolean().default(false),
  sections: z.array(
    z.object({
      key: z.string().optional(),
      type: z.string(),
      label: z.string().max(80).nullable().optional(),
      visible: z.boolean().default(true),
      content: z.record(z.string(), z.unknown()).default({}),
    }),
  ),
});

async function checkCustomPath(path: string, excludeId?: string) {
  if (!PATH.test(path)) throw badRequest("Use a path like /partners or /events/summit.", { path: "Lowercase letters, numbers, hyphens and slashes, starting with /." });
  if (RESERVED_PATHS.some((r) => path === r || (r !== "/" && path.startsWith(`${r}/`)))) {
    throw badRequest("That path belongs to a built-in page.", { path: "That path belongs to a built-in page." });
  }
  const clash = await prisma.page.findFirst({ where: { path, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } });
  if (clash) throw conflict("Another page already uses that path.", { path: "Already in use." });
}

/** Validate a submitted working copy against the page's allowed sections. */
export async function validatePageState(page: Page, input: unknown): Promise<PageState> {
  const parsed = baseSchema.safeParse(input);
  if (!parsed.success) {
    const fields = zodFields(parsed.error);
    throw badRequest(Object.values(fields)[0] ?? "Check the page and try again.", fields);
  }
  const data = parsed.data;

  let path = page.path;
  if (page.kind === "CUSTOM") {
    path = (data.path ?? page.path).toLowerCase();
    await checkCustomPath(path, page.id);
  }

  const system = page.kind === "SYSTEM" ? systemPageByKey.get(page.key) : undefined;
  const sections: SectionState[] = [];
  const seen = new Set<string>();
  for (const [index, raw] of data.sections.entries()) {
    const typeDef = sectionTypeByType.get(raw.type);
    if (!typeDef) throw badRequest(`Unknown section type “${raw.type}”.`);

    let key = raw.key?.trim() || "";
    if (system) {
      const expected = system.sections.find((s) => s.key === key);
      if (!expected || expected.type !== raw.type) throw badRequest("Sections on built-in pages can be reordered and hidden, but not added or removed.");
    } else {
      if (!typeDef.generic) throw badRequest(`“${typeDef.label}” sections can only be used on their built-in page.`);
      key = slugify(key) || `${raw.type.toLowerCase()}-${index + 1}`;
    }
    if (seen.has(key)) throw badRequest("Two sections share the same key.");
    seen.add(key);

    const content = objectSchema(typeDef.fields).safeParse(raw.content);
    if (!content.success) {
      const fields = Object.fromEntries(Object.entries(zodFields(content.error)).map(([k, v]) => [`sections.${index}.content.${k}`, v]));
      throw badRequest(`${raw.label ?? typeDef.label}: ${Object.values(fields)[0]}`, fields);
    }
    sections.push({ key, type: raw.type, label: raw.label ?? null, visible: raw.visible, content: content.data as Record<string, unknown> });
  }

  if (system) {
    const missing = system.sections.filter((s) => !seen.has(s.key));
    if (missing.length) throw badRequest("Sections on built-in pages can be reordered and hidden, but not added or removed.");
  }

  return {
    title: data.title,
    path,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    ogImage: data.ogImage ?? null,
    noindex: data.noindex,
    sections,
  };
}

const json = (v: unknown) => JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;

export async function getPage(id: string) {
  const page = await prisma.page.findUnique({ where: { id }, include: { sections: true } });
  if (!page) throw notFound("That page doesn't exist or was deleted.");
  return page;
}

export async function savePage(id: string, input: unknown, userId: string) {
  const page = await getPage(id);
  const state = await validatePageState(page, input);
  return prisma.page.update({ where: { id }, data: { draft: json(state), updatedById: userId }, include: { sections: true } });
}

export async function publishPage(id: string, userId: string) {
  const page = await getPage(id);
  // Validate again: section definitions may have changed since the draft was saved.
  const state = await validatePageState(page, workingState(page));
  await prisma.$transaction([
    prisma.pageSection.deleteMany({ where: { pageId: id } }),
    prisma.page.update({
      where: { id },
      data: {
        title: state.title,
        path: state.path,
        seoTitle: state.seoTitle,
        seoDescription: state.seoDescription,
        ogImage: state.ogImage,
        noindex: state.noindex,
        status: "PUBLISHED",
        publishedAt: page.publishedAt ?? new Date(),
        draft: Prisma.DbNull,
        updatedById: userId,
        sections: {
          create: state.sections.map((s, i) => ({ key: s.key, type: s.type, label: s.label, visible: s.visible, sortOrder: i, content: json(s.content) })),
        },
      },
    }),
  ]);
  await snapshot("page", id, "published", state, userId);
  return getPage(id);
}

export async function unpublishPage(id: string, userId: string) {
  const page = await getPage(id);
  if (page.kind === "SYSTEM") throw badRequest("Built-in pages can't be unpublished. Hide their sections instead.");
  return prisma.page.update({ where: { id }, data: { status: "DRAFT", draft: json(workingState(page)), updatedById: userId }, include: { sections: true } });
}

export async function discardPageDraft(id: string, userId: string) {
  const page = await getPage(id);
  if (page.status !== "PUBLISHED") throw badRequest("This page has never been published, so there's no live version to go back to.");
  return prisma.page.update({ where: { id }, data: { draft: Prisma.DbNull, updatedById: userId }, include: { sections: true } });
}

export async function createCustomPage(input: { title?: string; path?: string }, userId: string) {
  const title = String(input.title ?? "").trim().slice(0, 120);
  if (!title) throw badRequest("Give the page a name.", { title: "Give the page a name." });
  const path = (input.path?.trim() || `/${slugify(title)}`).toLowerCase();
  await checkCustomPath(path);
  const state: PageState = {
    title,
    path,
    seoTitle: null,
    seoDescription: null,
    ogImage: null,
    noindex: false,
    sections: [{ key: "hero", type: "hero", label: null, visible: true, content: { heading: title } }],
  };
  return prisma.page.create({
    data: { key: `custom-${Date.now().toString(36)}`, path, title, kind: "CUSTOM", draft: json(state), createdById: userId, updatedById: userId },
    include: { sections: true },
  });
}

export async function deleteCustomPage(id: string, userId: string) {
  const page = await getPage(id);
  if (page.kind === "SYSTEM") throw badRequest("Built-in pages can't be deleted.");
  await snapshot("page", id, "deleted", workingState(page), userId);
  await prisma.page.delete({ where: { id } });
  return page;
}

export async function restorePageRevision(id: string, revisionId: string, userId: string) {
  const revision = await prisma.revision.findFirst({ where: { id: revisionId, entityType: "page", entityId: id } });
  if (!revision) throw notFound("That version no longer exists.");
  return savePage(id, revision.data, userId);
}

/** Create any missing built-in pages and sections (new code may add sections). Existing content is never touched. */
export async function ensureSystemPages(defaults: Record<string, Record<string, Record<string, unknown>>> = {}) {
  // Runs on every serverless cold start: one read for all pages, writes only when something is missing.
  const existing = await prisma.page.findMany({ where: { key: { in: systemPages.map((p) => p.key) } }, include: { sections: { select: { key: true } } } });
  const byKey = new Map(existing.map((p) => [p.key, p]));
  for (const def of systemPages) {
    let page = byKey.get(def.key);
    if (!page) {
      page = await prisma.page.create({
        data: { key: def.key, path: def.path, title: def.title, kind: "SYSTEM", status: "PUBLISHED", publishedAt: new Date() },
        include: { sections: true },
      });
    }
    const have = new Set(page.sections.map((s) => s.key));
    const missing = def.sections.filter((s) => !have.has(s.key));
    for (const s of missing) {
      const typeDef = sectionTypeByType.get(s.type)!;
      const empty = Object.fromEntries(typeDef.fields.map((f) => [f.name, emptyValue(f)]));
      const content = { ...empty, ...(defaults[def.key]?.[s.key] ?? {}) };
      const sortOrder = def.sections.findIndex((x) => x.key === s.key);
      await prisma.pageSection.create({ data: { pageId: page.id, key: s.key, type: s.type, label: s.label, sortOrder, content: json(content) } });
    }
  }
}

export async function publicPages() {
  const pages = await prisma.page.findMany({ where: { status: "PUBLISHED" }, include: { sections: true }, orderBy: { sortOrder: "asc" } });
  return pages.map((p) => toPublicPage(p, liveState(p)));
}
