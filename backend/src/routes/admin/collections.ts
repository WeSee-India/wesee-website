import { Router, type Request } from "express";
import { z } from "zod";
import type { CollectionDef } from "../../content/collections.js";
import {
  createItem,
  deleteItem,
  discardDraft,
  getRow,
  listItems,
  publishItem,
  reorderItems,
  requireCollection,
  restoreRevision,
  saveItem,
  toAdmin,
  unpublishItem,
  workingValues,
} from "../../content/engine.js";
import { prisma } from "../../db.js";
import { audit } from "../../lib/audit.js";
import { assertCan } from "../../lib/auth.js";
import { invalidatePublicContent } from "../../lib/cache.js";
import { createPreviewToken } from "../../lib/preview.js";
import { config } from "../../config.js";

export const collectionsRouter = Router();

const nameOf = (def: CollectionDef, values: Record<string, unknown>) => String(values[def.titleField] ?? "Untitled").slice(0, 120);

/** Structural collections (e.g. service categories) need structure rights to change. */
function assertEdit(req: Request, def: CollectionDef) {
  assertCan(req.user!.role, def.adminOnly ? "structure.edit" : "content.edit");
}

collectionsRouter.get("/:key", async (req, res) => {
  const def = requireCollection(req.params.key);
  const q = z
    .object({ q: z.string().max(100).optional(), status: z.enum(["all", "draft", "published", "pending"]).optional(), take: z.coerce.number().int().min(1).max(500).optional(), skip: z.coerce.number().int().min(0).optional() })
    .parse(req.query);
  res.json(await listItems(def, q));
});

collectionsRouter.get("/:key/:id", async (req, res) => {
  const def = requireCollection(req.params.key);
  const row = await getRow(def, req.params.id);
  res.json({ ...toAdmin(def, row), publicPath: def.publicPath?.(workingValues(def, row)) ?? null });
});

collectionsRouter.post("/:key", async (req, res) => {
  const def = requireCollection(req.params.key);
  assertEdit(req, def);
  const row = await createItem(def, req.body, req.user!.id);
  const values = workingValues(def, row);
  await audit(req, { action: "content.create", entityType: def.key, entityId: row.id, summary: `Created ${def.singular.toLowerCase()} “${nameOf(def, values)}”` });
  if (!def.publishable) invalidatePublicContent(`${def.key} created`);
  res.status(201).json(toAdmin(def, row));
});

collectionsRouter.put("/:key/:id", async (req, res) => {
  const def = requireCollection(req.params.key);
  assertEdit(req, def);
  const { row, live } = await saveItem(def, req.params.id, req.body, req.user!.id);
  await audit(req, {
    action: "content.update",
    entityType: def.key,
    entityId: row.id,
    summary: `${live || row.status === "DRAFT" ? "Edited" : "Saved draft changes to"} ${def.singular.toLowerCase()} “${nameOf(def, workingValues(def, row))}”`,
  });
  if (live) invalidatePublicContent(`${def.key} updated`);
  res.json(toAdmin(def, row));
});

collectionsRouter.post("/:key/:id/publish", async (req, res) => {
  const def = requireCollection(req.params.key);
  assertCan(req.user!.role, "content.publish");
  const { publishAt } = z.object({ publishAt: z.coerce.date().nullable().optional() }).parse(req.body ?? {});
  const row = await publishItem(def, req.params.id, req.user!.id, publishAt);
  const scheduled = row.publishedAt && row.publishedAt > new Date();
  await audit(req, {
    action: scheduled ? "content.schedule" : "content.publish",
    entityType: def.key,
    entityId: row.id,
    summary: `${scheduled ? `Scheduled for ${row.publishedAt!.toISOString()}` : "Published"} ${def.singular.toLowerCase()} “${nameOf(def, workingValues(def, row))}”`,
  });
  invalidatePublicContent(`${def.key} published`);
  res.json(toAdmin(def, row));
});

collectionsRouter.post("/:key/:id/unpublish", async (req, res) => {
  const def = requireCollection(req.params.key);
  assertCan(req.user!.role, "content.publish");
  const row = await unpublishItem(def, req.params.id, req.user!.id);
  await audit(req, { action: "content.unpublish", entityType: def.key, entityId: row.id, summary: `Unpublished ${def.singular.toLowerCase()} “${nameOf(def, workingValues(def, row))}”` });
  invalidatePublicContent(`${def.key} unpublished`);
  res.json(toAdmin(def, row));
});

collectionsRouter.post("/:key/:id/discard", async (req, res) => {
  const def = requireCollection(req.params.key);
  assertEdit(req, def);
  const row = await discardDraft(def, req.params.id, req.user!.id);
  await audit(req, { action: "content.discard", entityType: def.key, entityId: row.id, summary: `Discarded unpublished changes to “${nameOf(def, workingValues(def, row))}”` });
  res.json(toAdmin(def, row));
});

collectionsRouter.delete("/:key/:id", async (req, res) => {
  const def = requireCollection(req.params.key);
  assertCan(req.user!.role, def.adminOnly ? "structure.edit" : "content.delete");
  const row = await deleteItem(def, req.params.id, req.user!.id);
  await audit(req, { action: "content.delete", entityType: def.key, entityId: row.id, summary: `Deleted ${def.singular.toLowerCase()} “${nameOf(def, workingValues(def, row))}”` });
  invalidatePublicContent(`${def.key} deleted`);
  res.json({ ok: true });
});

collectionsRouter.post("/:key/reorder", async (req, res) => {
  const def = requireCollection(req.params.key);
  assertEdit(req, def);
  const { ids } = z.object({ ids: z.array(z.string()).min(1).max(1000) }).parse(req.body);
  await reorderItems(def, ids);
  await audit(req, { action: "content.reorder", entityType: def.key, summary: `Reordered ${def.label.toLowerCase()}` });
  invalidatePublicContent(`${def.key} reordered`);
  res.json({ ok: true });
});

collectionsRouter.post("/:key/:id/preview", async (req, res) => {
  const def = requireCollection(req.params.key);
  const row = await getRow(def, req.params.id);
  const path = def.publicPath?.(workingValues(def, row));
  if (!path) return res.status(400).json({ error: `${def.label} don't have a page to preview.` });
  const { token, expiresAt } = createPreviewToken(def.key, row.id);
  const sep = path.includes("?") ? "&" : "?";
  const [base, hash] = path.split("#");
  res.json({ url: `${config.SITE_URL}${base}${sep}preview=${encodeURIComponent(token)}${hash ? `#${hash}` : ""}`, path: base, token, expiresAt });
});

collectionsRouter.get("/:key/:id/revisions", async (req, res) => {
  const def = requireCollection(req.params.key);
  const revisions = await prisma.revision.findMany({ where: { entityType: def.key, entityId: req.params.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const users = await prisma.user.findMany({ where: { id: { in: revisions.map((r) => r.userId).filter((v): v is string => !!v) } }, select: { id: true, name: true } });
  const names = new Map(users.map((u) => [u.id, u.name]));
  res.json(revisions.map((r) => ({ id: r.id, action: r.action, createdAt: r.createdAt, user: r.userId ? (names.get(r.userId) ?? "Deleted user") : null, data: r.data })));
});

collectionsRouter.post("/:key/:id/revisions/:revisionId/restore", async (req, res) => {
  const def = requireCollection(req.params.key);
  assertEdit(req, def);
  const { row, live } = await restoreRevision(def, req.params.id, req.params.revisionId, req.user!.id);
  await audit(req, { action: "content.restore", entityType: def.key, entityId: row.id, summary: `Restored an earlier version of “${nameOf(def, workingValues(def, row))}”` });
  if (live) invalidatePublicContent(`${def.key} restored`);
  res.json(toAdmin(def, row));
});
