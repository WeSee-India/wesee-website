import fs from "node:fs/promises";
import sharp from "sharp";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/db.js";
import { app, signIn } from "./helpers.js";

type Client = Awaited<ReturnType<typeof signIn>>;
let owner: Client;
const png = (color: string) => sharp({ create: { width: 40, height: 20, channels: 3, background: color } }).png().toBuffer();

beforeAll(async () => {
  owner = await signIn();
});
afterAll(async () => {
  await fs.rm("./.test-uploads", { recursive: true, force: true });
  await prisma.$disconnect();
});

const upload = (name: string, data: Buffer) => owner.agent.post("/api/admin/media").set("X-CSRF-Token", owner.csrf).attach("files", data, name);

describe("media library", () => {
  let asset: { id: string; url: string; version: number };

  it("uploads an image and records its dimensions", async () => {
    const res = await upload("Hero Shot.png", await png("#c9a84c"));
    expect(res.status).toBe(201);
    asset = res.body.items[0];
    expect(res.body.items[0]).toMatchObject({ mimeType: "image/png", width: 40, height: 20 });
    expect(asset.url).toMatch(/^\/uploads\/.+-hero-shot\.png$/);

    const served = await request(app).get(asset.url);
    expect(served.status).toBe(200);
    expect(served.headers["content-type"]).toBe("image/png");
    expect(served.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("checks the real file type, not the name", async () => {
    const fake = await upload("evil.png", Buffer.from("<script>alert(1)</script>"));
    expect(fake.status).toBe(400);
    const svg = await upload("logo.svg", Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'));
    expect(svg.status).toBe(400);
  });

  it("finds where a file is used and blocks deleting it", async () => {
    const project = (await owner.get("/api/admin/collections/projects")).body.items[0];
    await owner.put(`/api/admin/collections/projects/${project.id}`, { ...project.values, image: { src: asset.url, alt: "Screenshot" } });

    const usage = await owner.get(`/api/admin/media/${asset.id}/usage`);
    expect(usage.body).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "projects", id: project.id })]));

    const blocked = await owner.del(`/api/admin/media/${asset.id}`);
    expect(blocked.status).toBe(409);
  });

  it("replaces a file in place, keeping its URL", async () => {
    const res = await owner.agent
      .post(`/api/admin/media/${asset.id}/replace`)
      .set("X-CSRF-Token", owner.csrf)
      .attach("file", await png("#111317"), "new.png");
    expect(res.status).toBe(200);
    expect(res.body.url).toBe(asset.url);
    expect(res.body.version).toBe(asset.version + 1);

    const jpeg = await sharp({ create: { width: 4, height: 4, channels: 3, background: "#fff" } }).jpeg().toBuffer();
    const wrongType = await owner.agent.post(`/api/admin/media/${asset.id}/replace`).set("X-CSRF-Token", owner.csrf).attach("file", jpeg, "x.jpg");
    expect(wrongType.status).toBe(400);
  });

  it("deletes a used file only when forced", async () => {
    const res = await owner.del(`/api/admin/media/${asset.id}?force=true`);
    expect(res.status).toBe(200);
    expect((await request(app).get(asset.url)).status).toBe(404);
  });
});
