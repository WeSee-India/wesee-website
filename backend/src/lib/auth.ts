import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import type { Role, User } from "@prisma/client";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { forbidden, unauthorized } from "./errors.js";
import { can, type Permission } from "./permissions.js";

export const SESSION_COOKIE = "wesee_admin_session";
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
      sessionId?: string;
      csrfToken?: string;
    }
  }
}

// argon2id with OWASP-recommended parameters.
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export const hashPassword = (password: string) => hash(password, ARGON);
export const verifyPassword = (passwordHash: string, password: string) => verify(passwordHash, password).catch(() => false);

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const token = () => randomBytes(32).toString("base64url");
let dummyHash: Promise<string> | undefined;

export function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.isProd || config.COOKIE_SAMESITE === "none",
    sameSite: config.COOKIE_SAMESITE,
    domain: config.COOKIE_DOMAIN,
    path: "/",
    maxAge: config.SESSION_TTL_HOURS * 3600 * 1000,
  };
}

export async function createSession(user: User, req: Request, res: Response) {
  const raw = token();
  const csrfToken = token();
  await prisma.session.create({
    data: {
      id: sha256(raw),
      userId: user.id,
      csrfToken,
      expiresAt: new Date(Date.now() + config.SESSION_TTL_HOURS * 3600 * 1000),
      ip: req.ip,
      userAgent: req.get("user-agent")?.slice(0, 300),
    },
  });
  res.cookie(SESSION_COOKIE, raw, cookieOptions());
  return { csrfToken };
}

export async function destroySession(req: Request, res: Response) {
  if (req.sessionId) await prisma.session.deleteMany({ where: { id: req.sessionId } });
  const { maxAge: _maxAge, ...opts } = cookieOptions();
  res.clearCookie(SESSION_COOKIE, opts);
}

/** End every session for a user, optionally keeping the current one (after a password change). */
export async function destroyUserSessions(userId: string, keepSessionId?: string) {
  await prisma.session.deleteMany({ where: { userId, ...(keepSessionId ? { NOT: { id: keepSessionId } } : {}) } });
}

/** Loads the session (if any) onto req. Never rejects; use requireAuth for that. */
export async function loadSession(req: Request, _res: Response, next: NextFunction) {
  const raw = req.cookies?.[SESSION_COOKIE];
  if (typeof raw !== "string" || raw.length < 20) return next();
  const session = await prisma.session.findUnique({
    where: { id: sha256(raw) },
    include: { user: { select: { id: true, email: true, name: true, role: true, isActive: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.user.isActive) return next();

  req.sessionId = session.id;
  req.csrfToken = session.csrfToken;
  const { isActive: _active, ...user } = session.user;
  req.user = user;

  // Sliding expiry, written at most once a minute.
  if (Date.now() - session.lastSeenAt.getTime() > 60_000) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + config.SESSION_TTL_HOURS * 3600 * 1000) },
    });
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  next();
}

/**
 * CSRF protection for cookie-authenticated writes: the admin sends the token it
 * received from /api/auth/me in an X-CSRF-Token header. A cross-site page can't
 * read that token, so it can't forge the header.
 */
export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const sent = req.get("x-csrf-token") ?? "";
  const expected = req.csrfToken ?? "";
  const ok = sent.length > 0 && sent.length === expected.length && timingSafeEqual(Buffer.from(sent), Buffer.from(expected));
  if (!ok) return next(forbidden("Your session token is missing or out of date. Reload the page and try again."));
  next();
}

export const requirePermission = (permission: Permission) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(unauthorized());
  if (!can(req.user.role, permission)) return next(forbidden());
  next();
};

export function assertCan(role: Role, permission: Permission) {
  if (!can(role, permission)) throw forbidden();
}

/** Returns the user if the password matches, applying lockout after repeated failures. */
export async function authenticate(email: string, password: string): Promise<{ user?: User; error?: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  const generic = "That email and password don't match. Check them and try again.";
  if (!user) {
    // Same work as a real check, so response time doesn't reveal which emails exist.
    dummyHash ??= hashPassword(token());
    await verifyPassword(await dummyHash, password);
    return { error: generic };
  }
  if (!user.isActive) return { error: "This account has been deactivated. Ask an owner to restore access." };
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }
  if (!(await verifyPassword(user.passwordHash, password))) {
    const failed = user.failedLogins + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: failed >= MAX_FAILED_LOGINS ? 0 : failed, lockedUntil: failed >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null },
    });
    return { error: generic };
  }
  const updated = await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } });
  return { user: updated };
}

export async function purgeExpiredSessions() {
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
