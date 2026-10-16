import { Router } from "express";
import { collections } from "../content/collections.js";
import { delegate, orderBy, publicWhere, requireCollection, toPublic, workingValues } from "../content/engine.js";
import { getPage, liveState, publicPages, toPublicPage, workingState } from "../content/pageEngine.js";
import { allSettings } from "../content/settingsStore.js";
import { prisma } from "../db.js";
import { contentVersion, sendCached } from "../lib/cache.js";
import { notFound } from "../lib/errors.js";
import { readPreviewToken } from "../lib/preview.js";

/**
 * Read-only API for the public site. Only published content, only public
 * fields: no drafts, user ids or settings meant for admins.
 */

export const publicRouter = Router();

async function publicCollection(key: string) {
  const def = requireCollection(key);
  const rows = await delegate(def).findMany({ where: publicWhere(def), orderBy: orderBy(def) });
  if (key === "blogPosts") {
    const authors = await prisma.author.findMany({ select: { id: true, name: true, role: true, avatar: true, slug: true } });
    const byId = new Map(authors.map((a) => [a.id, a]));
    return rows.map((r) => ({ ...toPublic(def, r), author: r.authorId ? (byId.get(String(r.authorId)) ?? null) : null }));
  }
  return rows.map((r) => toPublic(def, r));
}

export async function buildSnapshot() {
  const [settings, pages, ...lists] = await Promise.all([allSettings(), publicPages(), ...collections.map((c) => publicCollection(c.key))]);
  return {
    version: contentVersion(),
    generatedAt: new Date().toISOString(),
    settings,
    pages: Object.fromEntries(pages.map((p) => [p.key, p])),
    collections: Object.fromEntries(collections.map((c, i) => [c.key, lists[i]])),
  };
}

/** Everything published, in one document. Used by the client build and as a fallback. */
publicRouter.get("/snapshot", (req, res) => sendCached(req, res, buildSnapshot));

publicRouter.get("/settings", (req, res) => sendCached(req, res, allSettings));

publicRouter.get("/pages", (req, res) => sendCached(req, res, publicPages));

publicRouter.get("/pages/:key", (req, res) =>
  sendCached(req, res, async () => {
    const page = await prisma.page.findFirst({ where: { key: req.params.key, status: "PUBLISHED" }, include: { sections: true } });
    if (!page) throw notFound("Page not found.");
    return toPublicPage(page, liveState(page));
  }),
);

publicRouter.get("/collections/:key", (req, res) => sendCached(req, res, () => publicCollection(req.params.key)));

publicRouter.get("/collections/:key/:slug", (req, res) =>
  sendCached(req, res, async () => {
    const def = requireCollection(req.params.key);
    const row = await delegate(def).findFirst({ where: { ...publicWhere(def), slug: req.params.slug } });
    if (!row) throw notFound("Not found.");
    return toPublic(def, row);
  }),
);

/**
 * Draft preview, authorised by a short-lived signed token from the admin
 * (not by a login, so it works on the public site's origin).
 */
publicRouter.get("/preview", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  const claims = typeof req.query.token === "string" ? readPreviewToken(req.query.token) : null;
  if (!claims) throw notFound("This preview link has expired. Open a new preview from the admin.");

  if (claims.kind === "page") {
    const page = await getPage(claims.id);
    return res.json({ kind: "page", item: toPublicPage(page, workingState(page)) });
  }
  const def = requireCollection(claims.kind);
  const row = await delegate(def).findUnique({ where: { id: claims.id } });
  if (!row) throw notFound("This item was deleted.");
  let item: Record<string, unknown> = toPublic(def, row, workingValues(def, row));
  if (claims.kind === "blogPosts" && item.authorId) {
    item = { ...item, author: await prisma.author.findUnique({ where: { id: String(item.authorId) }, select: { id: true, name: true, role: true, avatar: true, slug: true } }) };
  }
  res.json({ kind: claims.kind, item });
});
