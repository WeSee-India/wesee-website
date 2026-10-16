import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/db.js";
import { app, pub, signIn } from "./helpers.js";

type Client = Awaited<ReturnType<typeof signIn>>;
let owner: Client;

beforeAll(async () => {
  owner = await signIn();
});
afterAll(() => prisma.$disconnect());

async function homePage() {
  const pages = (await owner.get("/api/admin/pages")).body as Array<{ id: string; key: string; state: { sections: Array<{ key: string; content: Record<string, unknown>; visible: boolean }> } }>;
  return pages.find((p) => p.key === "home")!;
}

describe("pages: edit, preview, publish", () => {
  it("serves the original homepage copy from the seed", async () => {
    const res = await pub("/pages/home");
    expect(res.status).toBe(200);
    const hero = res.body.sections.find((s: { key: string }) => s.key === "hero");
    expect(hero.content.headlinePrefix).toBe("WeSee your");
    expect(hero.content.rotatingWords).toContain("automation");
  });

  it("keeps edits private until published, shows them in preview, then goes live", async () => {
    const page = await homePage();
    const state = structuredClone(page.state);
    state.sections.find((s) => s.key === "hero")!.content.subheading = "A brand new subheading.";

    const saved = await owner.put(`/api/admin/pages/${page.id}`, state);
    expect(saved.status).toBe(200);
    expect(saved.body.hasPendingChanges).toBe(true);

    // Public site still serves the published version.
    const before = await pub("/pages/home");
    expect(before.body.sections.find((s: { key: string }) => s.key === "hero").content.subheading).not.toBe("A brand new subheading.");

    // Preview token shows the draft.
    const preview = await owner.post(`/api/admin/pages/${page.id}/preview`);
    expect(preview.status).toBe(200);
    const draft = await pub(`/preview?token=${encodeURIComponent(preview.body.token)}`);
    expect(draft.status).toBe(200);
    expect(draft.body.item.sections.find((s: { key: string }) => s.key === "hero").content.subheading).toBe("A brand new subheading.");
    expect(draft.headers["cache-control"]).toBe("no-store");

    const published = await owner.post(`/api/admin/pages/${page.id}/publish`);
    expect(published.status).toBe(200);
    const after = await pub("/pages/home");
    expect(after.body.sections.find((s: { key: string }) => s.key === "hero").content.subheading).toBe("A brand new subheading.");
  });

  it("hides and reorders sections on the public page", async () => {
    const page = await homePage();
    const state = structuredClone(page.state);
    state.sections.find((s) => s.key === "clients")!.visible = false;
    const faq = state.sections.splice(state.sections.findIndex((s) => s.key === "faq"), 1)[0];
    state.sections.splice(1, 0, faq);
    expect((await owner.put(`/api/admin/pages/${page.id}`, state)).status).toBe(200);
    expect((await owner.post(`/api/admin/pages/${page.id}/publish`)).status).toBe(200);

    const keys = (await pub("/pages/home")).body.sections.map((s: { key: string }) => s.key);
    expect(keys).not.toContain("clients");
    expect(keys.slice(0, 2)).toEqual(["hero", "faq"]);
  });

  it("refuses to add or remove sections on built-in pages", async () => {
    const page = await homePage();
    const state = structuredClone(page.state);
    state.sections.pop();
    const res = await owner.put(`/api/admin/pages/${page.id}`, state);
    expect(res.status).toBe(400);
  });

  it("rejects an invalid section field with a field-level error", async () => {
    const page = await homePage();
    const state = structuredClone(page.state);
    (state.sections.find((s) => s.key === "hero")!.content.primaryCta as { href: string }).href = "javascript:alert(1)";
    const res = await owner.put(`/api/admin/pages/${page.id}`, state);
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields)[0]).toMatch(/^sections\.\d+\.content\.primaryCta\.href$/);
  });

  it("creates, publishes and unpublishes a custom page", async () => {
    const created = await owner.post("/api/admin/pages", { title: "Partners", path: "/partners" });
    expect(created.status).toBe(201);
    expect((await pub("/pages")).body.map((p: { path: string }) => p.path)).not.toContain("/partners");

    await owner.post(`/api/admin/pages/${created.body.id}/publish`);
    expect((await pub("/pages")).body.map((p: { path: string }) => p.path)).toContain("/partners");

    await owner.post(`/api/admin/pages/${created.body.id}/unpublish`);
    expect((await pub("/pages")).body.map((p: { path: string }) => p.path)).not.toContain("/partners");
  });

  it("does not let a custom page take a built-in path", async () => {
    const res = await owner.post("/api/admin/pages", { title: "Blog copy", path: "/blog/thing" });
    expect(res.status).toBe(400);
  });
});

describe("collections: blog workflow", () => {
  let id: string;

  it("creates articles as drafts that the public can't see", async () => {
    const authors = (await owner.get("/api/admin/collections/authors")).body.items;
    const res = await owner.post("/api/admin/collections/blogPosts", {
      title: "Testing the publishing flow",
      excerpt: "An article written by the test suite.",
      category: "AI Agents",
      authorId: authors[0].id,
      coverImage: "/cost.jpg",
      body: "First paragraph.\n\nSecond paragraph.",
      unexpected: "stripped",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("DRAFT");
    expect(res.body.values.slug).toBe("testing-the-publishing-flow");
    expect(res.body.values.unexpected).toBeUndefined();
    id = res.body.id;

    const list = await pub("/collections/blogPosts");
    expect(list.body.map((p: { slug: string }) => p.slug)).not.toContain("testing-the-publishing-flow");
    expect((await pub("/collections/blogPosts/testing-the-publishing-flow")).status).toBe(404);
  });

  it("publishes to the listing and the article route", async () => {
    const res = await owner.post(`/api/admin/collections/blogPosts/${id}/publish`);
    expect(res.status).toBe(200);
    const list = await pub("/collections/blogPosts");
    const post = list.body.find((p: { slug: string }) => p.slug === "testing-the-publishing-flow");
    expect(post.author.name).toBe("WeSee");
    expect(post).not.toHaveProperty("draft");
    expect(post).not.toHaveProperty("createdById");
    expect((await pub("/collections/blogPosts/testing-the-publishing-flow")).status).toBe(200);
  });

  it("holds edits to a live article as pending changes until published", async () => {
    const current = (await owner.get(`/api/admin/collections/blogPosts/${id}`)).body;
    const res = await owner.put(`/api/admin/collections/blogPosts/${id}`, { ...current.values, title: "Testing the publishing flow, revised" });
    expect(res.body.hasPendingChanges).toBe(true);
    expect((await pub("/collections/blogPosts/testing-the-publishing-flow")).body.title).toBe("Testing the publishing flow");

    await owner.post(`/api/admin/collections/blogPosts/${id}/publish`);
    expect((await pub("/collections/blogPosts/testing-the-publishing-flow")).body.title).toBe("Testing the publishing flow, revised");
  });

  it("discards pending changes", async () => {
    const current = (await owner.get(`/api/admin/collections/blogPosts/${id}`)).body;
    await owner.put(`/api/admin/collections/blogPosts/${id}`, { ...current.values, excerpt: "Never published." });
    const discarded = await owner.post(`/api/admin/collections/blogPosts/${id}/discard`);
    expect(discarded.body.hasPendingChanges).toBe(false);
    expect(discarded.body.values.excerpt).toBe("An article written by the test suite.");
  });

  it("hides scheduled articles until their date", async () => {
    const future = new Date(Date.now() + 7 * 86400_000).toISOString();
    const res = await owner.post(`/api/admin/collections/blogPosts/${id}/publish`, { publishAt: future });
    expect(res.body.scheduled).toBe(true);
    expect((await pub("/collections/blogPosts/testing-the-publishing-flow")).status).toBe(404);
  });

  it("removes unpublished articles from the public site", async () => {
    await owner.post(`/api/admin/collections/blogPosts/${id}/publish`, { publishAt: new Date().toISOString() });
    expect((await pub("/collections/blogPosts/testing-the-publishing-flow")).status).toBe(200);
    await owner.post(`/api/admin/collections/blogPosts/${id}/unpublish`);
    expect((await pub("/collections/blogPosts/testing-the-publishing-flow")).status).toBe(404);
    expect((await pub("/collections/blogPosts")).body.map((p: { slug: string }) => p.slug)).not.toContain("testing-the-publishing-flow");
  });

  it("keeps a revision for each publish and restores it as a draft", async () => {
    const revisions = (await owner.get(`/api/admin/collections/blogPosts/${id}/revisions`)).body;
    expect(revisions.length).toBeGreaterThanOrEqual(2);
    const first = revisions[revisions.length - 1];
    const restored = await owner.post(`/api/admin/collections/blogPosts/${id}/revisions/${first.id}/restore`);
    expect(restored.status).toBe(200);
    expect(restored.body.values.title).toBe("Testing the publishing flow");
  });

  it("rejects duplicate slugs and unsafe links", async () => {
    const dup = await owner.post("/api/admin/collections/blogPosts", { title: "Dup", slug: "hidden-cost-manual-workflows", excerpt: "x", category: "x", coverImage: "/cost.jpg", body: "x" });
    expect(dup.status).toBe(409);
    expect(dup.body.fields.slug).toBeDefined();
    const bad = await owner.post("/api/admin/collections/blogPosts", { title: "Bad", excerpt: "x", category: "x", coverImage: "javascript:alert(1)", body: "x" });
    expect(bad.status).toBe(400);
    expect(bad.body.fields.coverImage).toBeDefined();
  });
});

describe("collections: projects, ordering and caching", () => {
  it("reflects a project update on the public list", async () => {
    const list = (await owner.get("/api/admin/collections/projects")).body.items;
    const project = list.find((p: { values: { slug: string } }) => p.values.slug === "control-tower");
    await owner.put(`/api/admin/collections/projects/${project.id}`, { ...project.values, summary: "Updated summary for the test." });
    await owner.post(`/api/admin/collections/projects/${project.id}/publish`);
    const pubList = (await pub("/collections/projects")).body;
    expect(pubList.find((p: { slug: string }) => p.slug === "control-tower").summary).toBe("Updated summary for the test.");
  });

  it("reorders items", async () => {
    const list = (await owner.get("/api/admin/collections/faqs")).body.items as Array<{ id: string; values: { question: string } }>;
    const reversed = [...list].reverse();
    expect((await owner.post("/api/admin/collections/faqs/reorder", { ids: reversed.map((i) => i.id) })).status).toBe(200);
    const pubList = (await pub("/collections/faqs")).body;
    expect(pubList[0].question).toBe(reversed[0].values.question);
  });

  it("answers 304 for unchanged content and refreshes after a publish", async () => {
    const first = await pub("/collections/jobs");
    const etag = first.headers.etag;
    expect((await request(app).get("/api/public/collections/jobs").set("If-None-Match", etag)).status).toBe(304);

    const job = (await owner.get("/api/admin/collections/jobs")).body.items[0];
    await owner.post(`/api/admin/collections/jobs/${job.id}/unpublish`);
    const after = await request(app).get("/api/public/collections/jobs").set("If-None-Match", etag);
    expect(after.status).toBe(200);
    expect(after.body.length).toBe(first.body.length - 1);
    await owner.post(`/api/admin/collections/jobs/${job.id}/publish`);
  });

  it("applies settings immediately", async () => {
    const res = await owner.put("/api/admin/settings/announcement", { enabled: true, message: "We're hiring!", link: { label: "See roles", href: "/careers" }, tone: "accent", dismissible: true });
    expect(res.status).toBe(200);
    expect((await pub("/settings")).body.announcement.message).toBe("We're hiring!");
    const bad = await owner.put("/api/admin/settings/announcement", { enabled: true, message: "" });
    expect(bad.status).toBe(400);
  });

  it("records administrative actions in the activity log", async () => {
    const log = (await owner.get("/api/admin/audit?take=200")).body.items as Array<{ action: string }>;
    const actions = new Set(log.map((l) => l.action));
    for (const a of ["auth.login", "page.publish", "content.create", "content.publish", "content.unpublish", "settings.update"]) expect(actions).toContain(a);
  });
});

describe("case studies: handoff placeholders", () => {
  it("seeds the five handoff case studies as drafts, hidden from the public site", async () => {
    const list = (await owner.get("/api/admin/collections/caseStudies")).body.items as Array<{ status: string; values: { slug: string } }>;
    expect(list.map((i) => i.values.slug)).toEqual(["reconciliation-ai", "cloudops-console", "jmarkets", "twenty-cents", "nagamori"]);
    expect(list.every((i) => i.status === "DRAFT")).toBe(true);
    expect((await pub("/collections/caseStudies")).body).toEqual([]);
  });

  it("refuses to publish while a [PLACEHOLDER] is left, and publishes once they are filled", async () => {
    const list = (await owner.get("/api/admin/collections/caseStudies")).body.items as Array<{ id: string; values: Record<string, unknown> }>;
    const item = list.find((i) => i.values.slug === "nagamori")!;

    const blocked = await owner.post(`/api/admin/collections/caseStudies/${item.id}/publish`, {});
    expect(blocked.status).toBe(400);
    expect(blocked.body.error).toMatch(/Replace the \[PLACEHOLDERS\] in .*Timeline.*Testimonial/);
    expect(blocked.body.fields).toHaveProperty("results");

    const strip = (v: unknown): unknown =>
      typeof v === "string" ? v.replace(/\s*\[[A-Z][^\]]*\]/g, "").trim() : Array.isArray(v) ? v.map(strip) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, strip(x)])) : v;
    const stripped = strip(item.values) as Record<string, unknown>;
    const values = {
      ...stripped,
      // A step that was only a placeholder is removed, as an editor would.
      delivery: (stripped.delivery as Array<{ text: string }>).filter((p) => p.text),
      timeframe: "8 weeks",
      team: "2 engineers + 1 designer",
      results: [],
      quote: null,
      tech: ["Hosted on Vercel", "Booking via LINE"],
      cta: { ...(item.values.cta as object), buttonUrl: "https://cal.com/wesee/30min" },
    };
    const saved = await owner.put(`/api/admin/collections/caseStudies/${item.id}`, values);
    expect(saved.body.error ?? null).toBeNull();

    const published = await owner.post(`/api/admin/collections/caseStudies/${item.id}/publish`, {});
    expect(published.status).toBe(200);
    const live = (await pub("/collections/caseStudies/nagamori")).body;
    expect(live.headline).toBe("Nagamori: turning expertise into trust, and trust into bookings");
    expect(JSON.stringify(live)).not.toMatch(/\[[A-Z]{2,}/);
  });

  it("does not flag ordinary markdown links as placeholders", async () => {
    const posts = (await owner.get("/api/admin/collections/blogPosts")).body.items as Array<{ id: string; values: Record<string, unknown> }>;
    const post = posts[0];
    const body = `${post.values.body}\n\nSee [our services](/services).`;
    expect((await owner.put(`/api/admin/collections/blogPosts/${post.id}`, { ...post.values, body })).status).toBe(200);
    expect((await owner.post(`/api/admin/collections/blogPosts/${post.id}/publish`, {})).status).toBe(200);
  });
});
