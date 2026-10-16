import request from "supertest";
import { createApp } from "../src/app.js";
import { hashPassword } from "../src/lib/auth.js";
import { prisma } from "../src/db.js";

export const app = createApp();

export const OWNER = { email: "owner@test.local", password: "test-owner-password-1" };

/** A signed-in client: keeps the session cookie and sends the CSRF header on writes. */
export async function signIn(creds = OWNER) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/login").send(creds);
  if (res.status !== 200) throw new Error(`Sign-in failed: ${res.status} ${JSON.stringify(res.body)}`);
  const csrf = res.body.csrfToken as string;
  const withCsrf = <T extends { set(name: string, value: string): T }>(req: T) => req.set("X-CSRF-Token", csrf);
  return {
    agent,
    csrf,
    user: res.body.user,
    get: (url: string) => agent.get(url),
    post: (url: string, body?: object) => withCsrf(agent.post(url)).send(body ?? {}),
    put: (url: string, body: object) => withCsrf(agent.put(url)).send(body),
    patch: (url: string, body: object) => withCsrf(agent.patch(url)).send(body),
    del: (url: string) => withCsrf(agent.delete(url)),
  };
}

export async function createUser(role: "OWNER" | "ADMIN" | "EDITOR", email: string, password = "another-password-123") {
  await prisma.user.upsert({
    where: { email },
    create: { email, name: `${role} user`, role, passwordHash: await hashPassword(password) },
    update: { role, isActive: true, failedLogins: 0, lockedUntil: null, passwordHash: await hashPassword(password) },
  });
  return { email, password };
}

export const pub = (url: string) => request(app).get(`/api/public${url}`);
