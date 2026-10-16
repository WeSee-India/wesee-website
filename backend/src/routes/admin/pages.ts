import { Router } from "express";
import { z } from "zod";
import { config } from "../../config.js";
import {
  createCustomPage,
  deleteCustomPage,
  discardPageDraft,
  getPage,
  publishPage,
  restorePageRevision,
  savePage,
  toAdminPage,
  unpublishPage,
  workingState,
} from "../../content/pageEngine.js";
import { prisma } from "../../db.js";
import { audit } from "../../lib/audit.js";
import { assertCan } from "../../lib/auth.js";
import { invalidatePublicContent } from "../../lib/cache.js";
import { createPreviewToken } from "../../lib/preview.js";

export const pagesRouter = Router();

pagesRouter.get("/", async (_req, res) => {
  const pages = await prisma.page.findMany({ include: { sections: true }, orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }] });
  res.json(pages.map(toAdminPage));
});

pagesRouter.get("/:id", async (req, res) => {
  res.json(toAdminPage(await getPage(req.params.id)));
});

pagesRouter.post("/", async (req, res) => {
  assertCan(req.user!.role, "structure.edit");
  const body = z.object({ title: z.string().optional(), path: z.string().optional() }).parse(req.body);
  const page = await createCustomPage(body, req.user!.id);
  await audit(req, { action: "page.create", entityType: "page", entityId: page.id, summary: `Created page “${page.title}” at ${page.path}` });
  res.status(201).json(toAdminPage(page));
});

pagesRouter.put("/:id", async (req, res) => {
  assertCan(req.user!.role, "content.edit");
  const page = await savePage(req.params.id, req.body, req.user!.id);
  await audit(req, { action: "page.update", entityType: "page", entityId: page.id, summary: `Saved changes to page “${workingState(page).title}”` });
  res.json(toAdminPage(page));
});

pagesRouter.post("/:id/publish", async (req, res) => {
  assertCan(req.user!.role, "content.publish");
  const page = await publishPage(req.params.id, req.user!.id);
  await audit(req, { action: "page.publish", entityType: "page", entityId: page.id, summary: `Published page “${page.title}”` });
  invalidatePublicContent(`page ${page.key} published`);
  res.json(toAdminPage(page));
});

pagesRouter.post("/:id/unpublish", async (req, res) => {
  assertCan(req.user!.role, "content.publish");
  const page = await unpublishPage(req.params.id, req.user!.id);
  await audit(req, { action: "page.unpublish", entityType: "page", entityId: page.id, summary: `Unpublished page “${page.title}”` });
  invalidatePublicContent(`page ${page.key} unpublished`);
  res.json(toAdminPage(page));
});

pagesRouter.post("/:id/discard", async (req, res) => {
  assertCan(req.user!.role, "content.edit");
  const page = await discardPageDraft(req.params.id, req.user!.id);
  await audit(req, { action: "page.discard", entityType: "page", entityId: page.id, summary: `Discarded unpublished changes to page “${page.title}”` });
  res.json(toAdminPage(page));
});

pagesRouter.delete("/:id", async (req, res) => {
  assertCan(req.user!.role, "structure.edit");
  const page = await deleteCustomPage(req.params.id, req.user!.id);
  await audit(req, { action: "page.delete", entityType: "page", entityId: page.id, summary: `Deleted page “${page.title}”` });
  invalidatePublicContent(`page ${page.key} deleted`);
  res.json({ ok: true });
});

pagesRouter.post("/:id/preview", async (req, res) => {
  const page = await getPage(req.params.id);
  const { token, expiresAt } = createPreviewToken("page", page.id);
  const path = workingState(page).path;
  res.json({ url: `${config.SITE_URL}${path}?preview=${encodeURIComponent(token)}`, path, token, expiresAt });
});

pagesRouter.get("/:id/revisions", async (req, res) => {
  const revisions = await prisma.revision.findMany({ where: { entityType: "page", entityId: req.params.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const users = await prisma.user.findMany({ where: { id: { in: revisions.map((r) => r.userId).filter((v): v is string => !!v) } }, select: { id: true, name: true } });
  const names = new Map(users.map((u) => [u.id, u.name]));
  res.json(revisions.map((r) => ({ id: r.id, action: r.action, createdAt: r.createdAt, user: r.userId ? (names.get(r.userId) ?? "Deleted user") : null, data: r.data })));
});

pagesRouter.post("/:id/revisions/:revisionId/restore", async (req, res) => {
  assertCan(req.user!.role, "content.edit");
  const page = await restorePageRevision(req.params.id, req.params.revisionId, req.user!.id);
  await audit(req, { action: "page.restore", entityType: "page", entityId: page.id, summary: `Restored an earlier version of page “${page.title}” as a draft` });
  res.json(toAdminPage(page));
});
