import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { config } from "../../config.js";
import { prisma } from "../../db.js";
import { audit } from "../../lib/audit.js";
import { assertCan } from "../../lib/auth.js";
import { invalidatePublicContent } from "../../lib/cache.js";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { deleteUpload, publicUrlFor, replaceUpload, saveUpload } from "../../lib/storage.js";

export const mediaRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.uploadMaxBytes, files: 20 } });

const toMedia = (m: { id: string; url: string; originalName: string; mimeType: string; size: number; width: number | null; height: number | null; alt: string | null; version: number; createdAt: Date; updatedAt: Date }) => ({
  ...m,
  /** Versioned URL for previews, so a replaced file shows its new content immediately. */
  previewUrl: `${m.url}?v=${m.version}`,
});

mediaRouter.get("/", async (req, res) => {
  const q = z.object({ q: z.string().max(100).optional(), type: z.enum(["image", "document"]).optional(), take: z.coerce.number().int().min(1).max(200).default(60), skip: z.coerce.number().int().min(0).default(0) }).parse(req.query);
  const where = {
    ...(q.q ? { OR: [{ originalName: { contains: q.q, mode: "insensitive" as const } }, { alt: { contains: q.q, mode: "insensitive" as const } }] } : {}),
    ...(q.type === "image" ? { mimeType: { startsWith: "image/" } } : q.type === "document" ? { NOT: { mimeType: { startsWith: "image/" } } } : {}),
  };
  const [items, total] = await Promise.all([prisma.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" }, take: q.take, skip: q.skip }), prisma.mediaAsset.count({ where })]);
  res.json({ items: items.map(toMedia), total });
});

mediaRouter.post("/", upload.array("files", 20), async (req, res) => {
  assertCan(req.user!.role, "media.upload");
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) throw badRequest("Choose at least one file to upload.");
  const created = [];
  const errors: { file: string; error: string }[] = [];
  for (const file of files) {
    try {
      const stored = await saveUpload(file.buffer, file.originalname);
      const asset = await prisma.mediaAsset.create({
        data: { ...stored, url: publicUrlFor(stored.storageKey), originalName: file.originalname.slice(0, 200), uploadedById: req.user!.id },
      });
      created.push(toMedia(asset));
      await audit(req, { action: "media.upload", entityType: "media", entityId: asset.id, summary: `Uploaded ${asset.originalName}` });
    } catch (err) {
      errors.push({ file: file.originalname, error: err instanceof Error ? err.message : "Upload failed." });
    }
  }
  res.status(created.length ? 201 : 400).json({ items: created, errors, error: created.length ? undefined : errors[0]?.error });
});

mediaRouter.patch("/:id", async (req, res) => {
  assertCan(req.user!.role, "media.upload");
  const body = z.object({ alt: z.string().trim().max(300).nullable().optional(), originalName: z.string().trim().min(1).max(200).optional() }).parse(req.body);
  const asset = await prisma.mediaAsset.update({ where: { id: req.params.id }, data: body });
  res.json(toMedia(asset));
});

/** Replace the file behind an asset, keeping its URL so every page that uses it updates. */
mediaRouter.post("/:id/replace", upload.single("file"), async (req, res) => {
  assertCan(req.user!.role, "media.upload");
  const asset = await prisma.mediaAsset.findUnique({ where: { id: String(req.params.id) } });
  if (!asset) throw notFound("That file no longer exists.");
  if (!req.file) throw badRequest("Choose a file to upload.");
  const stored = await replaceUpload(asset.storageKey, asset.mimeType, req.file.buffer);
  const updated = await prisma.mediaAsset.update({ where: { id: asset.id }, data: { ...stored, version: { increment: 1 } } });
  await audit(req, { action: "media.replace", entityType: "media", entityId: asset.id, summary: `Replaced the file for ${asset.originalName}` });
  invalidatePublicContent("media replaced");
  res.json(toMedia(updated));
});

/** Where a file is used: every content row, section and setting that mentions its URL. */
export async function findMediaUsage(url: string) {
  const pattern = `%${url.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const tables: { table: string; label: string; kind: string; title: string }[] = [
    { table: "Project", label: "Project", kind: "projects", title: "title" },
    { table: "CaseStudy", label: "Case study", kind: "caseStudies", title: "client" },
    { table: "BlogPost", label: "Article", kind: "blogPosts", title: "title" },
    { table: "Author", label: "Author", kind: "authors", title: "name" },
    { table: "Job", label: "Job opening", kind: "jobs", title: "title" },
    { table: "Service", label: "Service", kind: "services", title: "name" },
    { table: "TeamMember", label: "Team member", kind: "teamMembers", title: "name" },
  ];
  const usage: { kind: string; id: string; label: string; title: string }[] = [];
  for (const t of tables) {
    // Table and column names come from the fixed list above, never from input.
    const rows = await prisma.$queryRawUnsafe<{ id: string; title: string }[]>(
      `SELECT id, "${t.title}" AS title FROM "${t.table}" t WHERE row_to_json(t)::text LIKE $1 LIMIT 50`,
      pattern,
    );
    usage.push(...rows.map((r) => ({ kind: t.kind, id: r.id, label: t.label, title: r.title })));
  }
  const pages = await prisma.$queryRawUnsafe<{ id: string; title: string }[]>(
    `SELECT DISTINCT p.id, p.title FROM "Page" p LEFT JOIN "PageSection" s ON s."pageId" = p.id WHERE s.content::text LIKE $1 OR p.draft::text LIKE $1 OR p."ogImage" LIKE $1`,
    pattern,
  );
  usage.push(...pages.map((p) => ({ kind: "page", id: p.id, label: "Page", title: p.title })));
  const settings = await prisma.$queryRawUnsafe<{ key: string }[]>(`SELECT key FROM "Setting" WHERE value::text LIKE $1`, pattern);
  usage.push(...settings.map((s) => ({ kind: "setting", id: s.key, label: "Settings", title: s.key })));
  return usage;
}

mediaRouter.get("/:id/usage", async (req, res) => {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
  if (!asset) throw notFound("That file no longer exists.");
  res.json(await findMediaUsage(asset.url));
});

mediaRouter.delete("/:id", async (req, res) => {
  assertCan(req.user!.role, "media.delete");
  const asset = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
  if (!asset) throw notFound("That file no longer exists.");
  const usage = await findMediaUsage(asset.url);
  if (usage.length && req.query.force !== "true") {
    throw conflict(`This file is used in ${usage.length} place${usage.length === 1 ? "" : "s"}. Remove it from there first, or delete anyway.`);
  }
  await prisma.mediaAsset.delete({ where: { id: asset.id } });
  await deleteUpload(asset.storageKey);
  await audit(req, { action: "media.delete", entityType: "media", entityId: asset.id, summary: `Deleted ${asset.originalName}${usage.length ? ` (was used in ${usage.length} places)` : ""}` });
  res.json({ ok: true });
});
