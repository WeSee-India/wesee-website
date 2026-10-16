import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.js";
import { audit } from "../lib/audit.js";
import { authenticate, createSession, destroySession, destroyUserSessions, hashPassword, requireAuth, requireCsrf, verifyPassword } from "../lib/auth.js";
import { badRequest, unauthorized } from "../lib/errors.js";
import { permissionsFor } from "../lib/permissions.js";

export const authRouter = Router();

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(200, "Use 200 characters or fewer.")
  .refine((p) => /[a-zA-Z]/.test(p) && /[0-9\W_]/.test(p), "Mix letters with numbers or symbols.");

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts from this connection. Try again in 15 minutes." },
});

/** Only these user fields ever leave the server. */
const me = ({ id, email, name, role }: { id: string; email: string; name: string; role: "OWNER" | "ADMIN" | "EDITOR" }, csrfToken: string) => ({
  user: { id, email, name, role, permissions: permissionsFor(role) },
  csrfToken,
});

authRouter.post("/login", loginLimiter, async (req, res) => {
  const body = z.object({ email: z.string().trim().min(1, "Enter your email."), password: z.string().min(1, "Enter your password.") }).parse(req.body);
  const { user, error } = await authenticate(body.email, body.password);
  if (!user) {
    await audit(req, { action: "auth.login_failed", entityType: "user", summary: `Failed sign-in for ${body.email.toLowerCase()}` });
    throw unauthorized(error);
  }
  // Rotate: a new session on every sign-in, and drop any session this browser already had.
  if (req.sessionId) await prisma.session.deleteMany({ where: { id: req.sessionId } });
  const { csrfToken } = await createSession(user, req, res);
  req.user = user;
  await audit(req, { action: "auth.login", entityType: "user", entityId: user.id, summary: `${user.name} signed in` });
  res.json(me(user, csrfToken));
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(me(req.user!, req.csrfToken!));
});

authRouter.post("/logout", requireAuth, requireCsrf, async (req, res) => {
  await audit(req, { action: "auth.logout", entityType: "user", entityId: req.user!.id, summary: `${req.user!.name} signed out` });
  await destroySession(req, res);
  res.json({ ok: true });
});

authRouter.patch("/me", requireAuth, requireCsrf, async (req, res) => {
  const body = z.object({ name: z.string().trim().min(1, "Enter your name.").max(120) }).parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: { name: body.name }, select: { id: true, email: true, name: true, role: true } });
  await audit(req, { action: "user.profile", entityType: "user", entityId: user.id, summary: `${user.name} updated their profile` });
  res.json(me(user, req.csrfToken!));
});

authRouter.post("/password", requireAuth, requireCsrf, async (req, res) => {
  const body = z.object({ currentPassword: z.string().min(1, "Enter your current password."), newPassword: passwordSchema }).parse(req.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (!(await verifyPassword(user.passwordHash, body.currentPassword))) {
    throw badRequest("Your current password is incorrect.", { currentPassword: "This doesn't match your current password." });
  }
  if (body.currentPassword === body.newPassword) throw badRequest("Choose a password you haven't just used.", { newPassword: "Choose a different password." });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.newPassword) } });
  // Sign out every other device.
  await destroyUserSessions(user.id, req.sessionId);
  await audit(req, { action: "user.password", entityType: "user", entityId: user.id, summary: `${user.name} changed their password` });
  res.json({ ok: true });
});
