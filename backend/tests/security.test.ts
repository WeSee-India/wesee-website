import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/db.js";
import { app, createUser, OWNER, signIn } from "./helpers.js";

afterAll(() => prisma.$disconnect());

describe("authentication", () => {
  it("rejects a wrong password without saying which part was wrong", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: OWNER.email, password: "nope-nope-nope" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/don't match/);
  });

  it("never returns password hashes", async () => {
    const owner = await signIn();
    expect(JSON.stringify(owner.user)).not.toMatch(/argon2|passwordHash/);
    const users = await owner.get("/api/admin/users");
    expect(JSON.stringify(users.body)).not.toMatch(/argon2|passwordHash/);
  });

  it("sets an httpOnly session cookie", async () => {
    const res = await request(app).post("/api/auth/login").send(OWNER);
    const cookie = ([] as string[]).concat(res.headers["set-cookie"] ?? []).join(";");
    expect(cookie).toMatch(/wesee_admin_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it("blocks admin routes without a session", async () => {
    expect((await request(app).get("/api/admin/dashboard")).status).toBe(401);
    expect((await request(app).get("/api/admin/collections/blogPosts")).status).toBe(401);
    expect((await request(app).get("/api/auth/me")).status).toBe(401);
  });

  it("requires the CSRF header on writes", async () => {
    const owner = await signIn();
    const res = await owner.agent.post("/api/admin/collections/faqs").send({ question: "q", answer: "a", topic: "General" });
    expect(res.status).toBe(403);
    const wrong = await owner.agent.post("/api/admin/collections/faqs").set("X-CSRF-Token", "x".repeat(owner.csrf.length)).send({ question: "q", answer: "a", topic: "General" });
    expect(wrong.status).toBe(403);
  });

  it("ends the session on logout", async () => {
    const owner = await signIn();
    expect((await owner.post("/api/auth/logout")).status).toBe(200);
    expect((await owner.get("/api/auth/me")).status).toBe(401);
  });

  it("locks an account after repeated failures", async () => {
    const creds = await createUser("EDITOR", "lockout@test.local");
    for (let i = 0; i < 5; i++) await request(app).post("/api/auth/login").send({ email: creds.email, password: "wrong-password-x" });
    const res = await request(app).post("/api/auth/login").send(creds);
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Too many failed attempts/);
  });

  it("changes a password and signs out other sessions", async () => {
    const creds = await createUser("EDITOR", "pw-change@test.local");
    const a = await signIn(creds);
    const b = await signIn(creds);
    const weak = await a.post("/api/auth/password", { currentPassword: creds.password, newPassword: "short" });
    expect(weak.status).toBe(400);
    const ok = await a.post("/api/auth/password", { currentPassword: creds.password, newPassword: "a-much-better-password-9" });
    expect(ok.status).toBe(200);
    expect((await a.get("/api/auth/me")).status).toBe(200);
    expect((await b.get("/api/auth/me")).status).toBe(401);
  });
});

describe("roles", () => {
  it("lets editors write and publish but not delete, change settings or manage users", async () => {
    const editor = await signIn(await createUser("EDITOR", "editor@test.local"));
    const created = await editor.post("/api/admin/collections/faqs", { question: "Editor question?", answer: "Yes.", topic: "General", placements: ["home"] });
    expect(created.status).toBe(201);
    expect((await editor.post(`/api/admin/collections/faqs/${created.body.id}/publish`)).status).toBe(200);
    expect((await editor.del(`/api/admin/collections/faqs/${created.body.id}`)).status).toBe(403);
    expect((await editor.put("/api/admin/settings/site", {})).status).toBe(403);
    expect((await editor.get("/api/admin/users")).status).toBe(403);
    expect((await editor.get("/api/admin/audit")).status).toBe(403);
    expect((await editor.post("/api/admin/collections/serviceCategories", { name: "x", number: 99, icon: "bot", summary: "x" })).status).toBe(403);
    expect((await editor.post("/api/admin/pages", { title: "Nope" })).status).toBe(403);
  });

  it("lets admins delete content but not manage users", async () => {
    const admin = await signIn(await createUser("ADMIN", "admin@test.local"));
    const faq = (await admin.get("/api/admin/collections/faqs?q=Editor")).body.items[0];
    expect((await admin.del(`/api/admin/collections/faqs/${faq.id}`)).status).toBe(200);
    expect((await admin.post("/api/admin/users", { email: "x@test.local", name: "x", role: "OWNER", password: "a-strong-password-1" })).status).toBe(403);
  });

  it("always keeps at least one active owner", async () => {
    const owner = await signIn();
    const self = owner.user.id;
    expect((await owner.patch(`/api/admin/users/${self}`, { role: "EDITOR" })).status).toBe(400);
    expect((await owner.del(`/api/admin/users/${self}`)).status).toBe(400);
  });

  it("signs a deactivated user out immediately", async () => {
    const creds = await createUser("EDITOR", "deactivate@test.local");
    const victim = await signIn(creds);
    const owner = await signIn();
    expect((await owner.patch(`/api/admin/users/${victim.user.id}`, { isActive: false })).status).toBe(200);
    expect((await victim.get("/api/auth/me")).status).toBe(401);
    expect((await request(app).post("/api/auth/login").send(creds)).status).toBe(401);
  });
});

describe("public API", () => {
  it("does not expose drafts, preview without a valid token, or admin data", async () => {
    expect((await request(app).get("/api/public/preview?token=forged.token")).status).toBe(404);
    const snap = await request(app).get("/api/public/snapshot");
    const text = JSON.stringify(snap.body);
    expect(text).not.toMatch(/"draft"|createdById|updatedById|passwordHash/);
  });

  it("validates the contact form and quietly drops bots", async () => {
    const bad = await request(app).post("/api/contact").send({ name: "", email: "nope", message: "" });
    expect(bad.status).toBe(400);
    expect(bad.body.fields.email).toBeDefined();
    const bot = await request(app).post("/api/contact").send({ name: "Bot", email: "bot@example.com", message: "hi", honeypot: "filled" });
    expect(bot.status).toBe(200);
  });

  it("sends security headers", async () => {
    const res = await request(app).get("/api/public/settings");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
