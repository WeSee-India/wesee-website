import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { collections } from "../../content/collections.js";
import { statusCounts } from "../../content/engine.js";
import { pageFields, sectionTypes, systemPages } from "../../content/pages.js";
import { settings } from "../../content/settings.js";
import { allSettings, requireSetting, updateSetting } from "../../content/settingsStore.js";
import { prisma } from "../../db.js";
import { audit } from "../../lib/audit.js";
import { destroyUserSessions, hashPassword, requireAuth, requireCsrf, requirePermission } from "../../lib/auth.js";
import { invalidatePublicContent } from "../../lib/cache.js";
import { deployHookState } from "../../lib/deployHook.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { PERMISSIONS } from "../../lib/permissions.js";
import { config } from "../../config.js";
import { passwordSchema } from "../auth.js";
import { collectionsRouter } from "./collections.js";
import { mediaRouter } from "./media.js";
import { pagesRouter } from "./pages.js";

export const adminRouter = Router();

// Every admin route needs a session; every write also needs the CSRF header.
adminRouter.use(requireAuth, requireCsrf);
adminRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

/** Field definitions the admin renders its forms from. */
adminRouter.get("/schema", (_req, res) => {
  res.json({
    siteUrl: config.SITE_URL,
    collections: collections.map(({ publicPath, ...c }) => ({ ...c, hasPublicPage: !!publicPath })),
    sectionTypes,
    systemPages,
    pageFields,
    settings,
    permissions: PERMISSIONS,
  });
});

adminRouter.use("/collections", collectionsRouter);
adminRouter.use("/pages", pagesRouter);
adminRouter.use("/media", mediaRouter);

// ── Settings ──

adminRouter.get("/settings", async (_req, res) => {
  res.json(await allSettings());
});

adminRouter.put("/settings/:key", requirePermission("settings.edit"), async (req, res) => {
  const def = requireSetting(String(req.params.key));
  const value = await updateSetting(def.key, req.body, req.user!.id);
  await audit(req, { action: "settings.update", entityType: "setting", entityId: def.key, summary: `Updated ${def.label} settings` });
  invalidatePublicContent(`settings ${def.key}`);
  res.json(value);
});

adminRouter.get("/settings/:key/revisions", async (req, res) => {
  requireSetting(req.params.key);
  const revisions = await prisma.revision.findMany({ where: { entityType: "setting", entityId: req.params.key }, orderBy: { createdAt: "desc" }, take: 30 });
  res.json(revisions);
});

// ── Dashboard ──

adminRouter.get("/dashboard", async (_req, res) => {
  const counts = await Promise.all(collections.map(async (c) => ({ key: c.key, label: c.label, publishable: c.publishable, ...(await statusCounts(c)) })));
  const [recent, pagesPending, media, scheduled] = await Promise.all([
    prisma.auditLog.findMany({ where: { action: { notIn: ["auth.login", "auth.logout", "auth.login_failed"] } }, orderBy: { createdAt: "desc" }, take: 15, include: { user: { select: { name: true } } } }),
    prisma.page.findMany({ where: { NOT: { draft: { equals: Prisma.DbNull } } }, select: { id: true, title: true, updatedAt: true } }),
    prisma.mediaAsset.count(),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { gt: new Date() } }, select: { id: true, title: true, publishedAt: true }, orderBy: { publishedAt: "asc" }, take: 10 }),
  ]);
  res.json({
    counts,
    media,
    pagesPending,
    scheduled,
    recent: recent.map((r) => ({ id: r.id, action: r.action, summary: r.summary, entityType: r.entityType, entityId: r.entityId, createdAt: r.createdAt, user: r.user?.name ?? null })),
    rebuild: { configured: !!config.CLIENT_DEPLOY_HOOK_URL, ...deployHookState },
  });
});

// ── Activity log ──

adminRouter.get("/audit", requirePermission("audit.view"), async (req, res) => {
  const q = z.object({ entityType: z.string().optional(), entityId: z.string().optional(), userId: z.string().optional(), action: z.string().optional(), take: z.coerce.number().int().min(1).max(200).default(50), skip: z.coerce.number().int().min(0).default(0) }).parse(req.query);
  const where = {
    ...(q.entityType ? { entityType: q.entityType } : {}),
    ...(q.entityId ? { entityId: q.entityId } : {}),
    ...(q.userId ? { userId: q.userId } : {}),
    ...(q.action ? { action: { startsWith: q.action } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: q.take, skip: q.skip, include: { user: { select: { name: true, email: true } } } }),
    prisma.auditLog.count({ where }),
  ]);
  res.json({ items, total });
});

// ── Users ──

const userSelect = { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } as const;

adminRouter.get("/users", requirePermission("users.manage"), async (_req, res) => {
  res.json(await prisma.user.findMany({ select: userSelect, orderBy: { createdAt: "asc" } }));
});

adminRouter.post("/users", requirePermission("users.manage"), async (req, res) => {
  const body = z
    .object({
      email: z.email("Enter a valid email address.").transform((e) => e.toLowerCase()),
      name: z.string().trim().min(1, "Enter a name.").max(120),
      role: z.enum(["OWNER", "ADMIN", "EDITOR"]),
      password: passwordSchema,
    })
    .parse(req.body);
  const user = await prisma.user.create({ data: { email: body.email, name: body.name, role: body.role, passwordHash: await hashPassword(body.password) }, select: userSelect });
  await audit(req, { action: "user.create", entityType: "user", entityId: user.id, summary: `Added ${user.role.toLowerCase()} ${user.name} (${user.email})` });
  res.status(201).json(user);
});

/** Refuse changes that would leave the site with no active owner. */
async function assertOwnerRemains(userId: string, change: { role?: string; isActive?: boolean; deleting?: boolean }) {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw notFound("That user no longer exists.");
  const losesOwner = target.role === "OWNER" && target.isActive && (change.deleting || change.isActive === false || (change.role && change.role !== "OWNER"));
  if (losesOwner) {
    const owners = await prisma.user.count({ where: { role: "OWNER", isActive: true } });
    if (owners <= 1) throw badRequest("There must always be at least one active owner. Make someone else an owner first.");
  }
  return target;
}

adminRouter.patch("/users/:id", requirePermission("users.manage"), async (req, res) => {
  const body = z
    .object({ name: z.string().trim().min(1).max(120).optional(), role: z.enum(["OWNER", "ADMIN", "EDITOR"]).optional(), isActive: z.boolean().optional(), password: passwordSchema.optional() })
    .parse(req.body);
  await assertOwnerRemains(String(req.params.id), body);
  const { password, ...rest } = body;
  const user = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { ...rest, ...(password ? { passwordHash: await hashPassword(password), failedLogins: 0, lockedUntil: null } : {}) },
    select: userSelect,
  });
  // Deactivation, role changes and password resets take effect immediately.
  if (body.isActive === false || body.role || password) await destroyUserSessions(user.id, user.id === req.user!.id ? req.sessionId : undefined);
  const changes = [body.name && "name", body.role && `role → ${body.role.toLowerCase()}`, body.isActive !== undefined && (body.isActive ? "reactivated" : "deactivated"), password && "password reset"].filter(Boolean).join(", ");
  await audit(req, { action: "user.update", entityType: "user", entityId: user.id, summary: `Updated ${user.name}: ${changes || "no changes"}` });
  res.json(user);
});

adminRouter.delete("/users/:id", requirePermission("users.manage"), async (req, res) => {
  if (req.params.id === req.user!.id) throw badRequest("You can't delete your own account.");
  const target = await assertOwnerRemains(String(req.params.id), { deleting: true });
  await prisma.user.delete({ where: { id: target.id } });
  await audit(req, { action: "user.delete", entityType: "user", entityId: target.id, summary: `Removed ${target.name} (${target.email})` });
  res.json({ ok: true });
});

