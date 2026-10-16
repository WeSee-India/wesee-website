/**
 * Seeds the database with the website's original content.
 *
 *   pnpm db:seed           fill anything empty (safe to re-run; never overwrites edits)
 *   pnpm db:seed --reset   replace ALL content with the original (asks no questions: dev only)
 *
 * Also creates the first owner from SEED_OWNER_* when there are no users.
 */
import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import { collections, type CollectionDef } from "../src/content/collections.js";
import { objectSchema } from "../src/content/fields.js";
import { systemPages } from "../src/content/pages.js";
import { settings } from "../src/content/settings.js";
import { blogSeo, pageSeo, sectionDefaults, settingDefaults } from "./seed/defaults.js";
import { caseStudies } from "./seed/caseStudies.js";
import extracted from "./seed/extracted.json" with { type: "json" };

const prisma = new PrismaClient();
const reset = process.argv.includes("--reset");
const x = extracted;

const json = (v: unknown) => JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;

/** Validate seed values with the same rules as the admin API, so seeded content is always editable. */
function clean(def: CollectionDef, values: Record<string, unknown>) {
  const parsed = objectSchema(def.fields).safeParse(values);
  if (!parsed.success) {
    throw new Error(`Seed data for ${def.key} (${values[def.titleField]}) is invalid: ${JSON.stringify(parsed.error.issues.slice(0, 3))}`);
  }
  const data: Record<string, unknown> = {};
  for (const f of def.fields) {
    const v = (parsed.data as Record<string, unknown>)[f.name];
    data[f.name] = (f.type === "list" || f.type === "object") && v == null ? Prisma.DbNull : v;
  }
  return data;
}

const byKey = (key: string) => collections.find((c) => c.key === key)!;
type Delegate = { count(): Promise<number>; create(args: unknown): Promise<unknown>; deleteMany(): Promise<unknown> };
const model = (def: CollectionDef) => (prisma as unknown as Record<string, Delegate>)[def.model];

async function seedCollection(
  key: string,
  items: Array<{ slug?: string; values: Record<string, unknown>; publishedAt?: Date; extra?: Record<string, unknown> }>,
  opts: { draft?: boolean } = {},
) {
  const def = byKey(key);
  const m = model(def);
  // Validate everything first so a bad record can't leave the table half-filled.
  const rows = items.map((item) => ({ ...item, data: clean(def, item.values) }));
  if (reset) await m.deleteMany();
  else if ((await m.count()) > 0) return console.log(`  ${def.label}: already has content, skipped`);
  for (const [i, item] of rows.entries()) {
    await m.create({
      data: {
        ...(item.slug ? { slug: item.slug } : {}),
        ...item.data,
        ...item.extra,
        status: opts.draft ? "DRAFT" : "PUBLISHED",
        publishedAt: opts.draft ? null : (item.publishedAt ?? new Date()),
        sortOrder: i,
      },
    });
  }
  console.log(`  ${def.label}: ${items.length}`);
}

async function main() {
  console.log(reset ? "Resetting content to the original site…" : "Seeding empty content…");

  if (reset) {
    // Children before parents.
    await prisma.blogPost.deleteMany();
    await prisma.service.deleteMany();
    await prisma.page.deleteMany();
    await prisma.setting.deleteMany();
  }

  // ── Collections ──
  await seedCollection(
    "serviceCategories",
    x.categories.map((c) => ({ values: { name: c.name, number: c.id, icon: c.icon, summary: c.summary } })),
  );

  await seedCollection(
    "services",
    x.services.map((s) => {
      const svc = s as typeof s & { faqs?: unknown[]; growthComparisonChart?: unknown; relatedServiceSlugs?: string[] };
      return {
        slug: s.slug,
        values: {
          name: s.name,
          number: s.id,
          categoryNumber: s.categoryId,
          shortDescription: s.shortDescription,
          definition: (x.definitions as Record<string, string>)[s.slug] ?? null,
          fullDescription: s.fullDescription,
          benefits: s.benefits,
          automationPoints: s.automationPoints,
          deliverables: s.deliverables,
          industries: s.industries,
          serviceType: s.serviceType,
          stage: s.status,
          engagementSize: s.engagementSize,
          image: null,
          faqs: svc.faqs ?? [],
          growthComparisonChart: svc.growthComparisonChart ?? null,
          relatedServiceSlugs: svc.relatedServiceSlugs ?? [],
        },
      };
    }),
  );

  await seedCollection(
    "projects",
    x.projects.map((p) => {
      const proj = p as typeof p & { year?: string; image?: { src: string; alt: string }; caseStudySlug?: string; url?: string };
      return {
        slug: p.slug,
        values: {
          title: p.title,
          client: p.client,
          category: p.category,
          group: p.group,
          service: p.service,
          stage: p.status,
          year: proj.year ?? null,
          summary: p.summary,
          scope: p.scope,
          tags: p.tags,
          image: proj.image ?? null,
          caseStudySlug: proj.caseStudySlug ?? null,
          url: proj.url ?? null,
        },
      };
    }),
  );

  // Case studies from the developer handoff. They still contain [PLACEHOLDERS] to confirm, so they start as drafts.
  await seedCollection("caseStudies", caseStudies, { draft: true });

  // Authors before articles.
  let authorId: string | undefined;
  if (reset || (await prisma.author.count()) === 0) {
    if (reset) await prisma.author.deleteMany();
    const author = await prisma.author.create({ data: { slug: "wesee", name: "WeSee", role: null, status: "PUBLISHED", publishedAt: new Date() } });
    authorId = author.id;
    console.log("  Authors: 1");
  }
  authorId ??= (await prisma.author.findFirst({ orderBy: { sortOrder: "asc" } }))?.id;

  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const detail = x.blogDetail as Record<string, { image: string; question: string; quote: string; content: string[] }>;
  await seedCollection(
    "blogPosts",
    x.blogList.map((a) => {
      const [mon, year] = a.date.split(" ");
      const d = detail[a.slug];
      return {
        slug: a.slug,
        publishedAt: new Date(Date.UTC(Number(year), months[mon], 1, 9)),
        values: {
          title: a.title,
          excerpt: a.excerpt,
          category: a.category,
          authorId: authorId ?? null,
          tags: [],
          coverImage: d.image,
          coverAlt: null,
          featured: Boolean((a as { featured?: boolean }).featured),
          question: d.question,
          quote: d.quote,
          body: d.content.join("\n\n"),
          ...blogSeo[a.slug],
        },
      };
    }),
  );

  await seedCollection(
    "jobs",
    x.jobs.map((j) => ({
      slug: j.slug,
      values: {
        title: j.title,
        team: j.team,
        employmentType: j.type,
        location: j.location,
        applyUrl: null,
        skills: j.skills,
        intro: j.intro,
        responsibilities: j.role,
        requirements: j.requirements,
        bonus: j.bonus,
        closing: j.closing,
      },
    })),
  );

  await seedCollection("faqs", x.faqs.map((f) => ({ values: { question: f.q, answer: f.a, topic: f.topic, placements: ["home"] } })));

  await seedCollection("teamMembers", [
    ...x.directors.map((d) => {
      const dir = d as typeof d & { linkedin?: string; twitter?: string };
      return { values: { name: d.name, title: d.title, group: "Leadership", photo: d.photo, bio: d.bio, linkedin: dir.linkedin ?? null, twitter: dir.twitter ?? null } };
    }),
    ...x.engineeringTeam.map((m) => ({ values: { name: m.name.trim(), title: m.title, group: "Team", photo: m.photo, bio: null, linkedin: null, twitter: null } })),
  ]);

  // ── Pages ──
  for (const def of systemPages) {
    if (!reset && (await prisma.page.findUnique({ where: { key: def.key } }))) continue;
    await prisma.page.create({
      data: {
        key: def.key,
        path: def.path,
        title: def.title,
        kind: "SYSTEM",
        status: "PUBLISHED",
        publishedAt: new Date(),
        ...pageSeo[def.key],
        sections: {
          create: def.sections.map((s, i) => ({ key: s.key, type: s.type, label: s.label, sortOrder: i, content: json(sectionDefaults[def.key]?.[s.key] ?? {}) })),
        },
      },
    });
    console.log(`  Page: ${def.title}`);
  }

  // ── Settings ──
  for (const s of settings) {
    const value = settingDefaults[s.key];
    if (!value) continue;
    const parsed = objectSchema(s.fields).safeParse(value);
    if (!parsed.success) throw new Error(`Settings ${s.key} seed is invalid: ${JSON.stringify(parsed.error.issues.slice(0, 3))}`);
    if (!reset && (await prisma.setting.findUnique({ where: { key: s.key } }))) continue;
    await prisma.setting.upsert({ where: { key: s.key }, create: { key: s.key, value: json(parsed.data) }, update: { value: json(parsed.data) } });
    console.log(`  Settings: ${s.label}`);
  }

  // ── First owner ──
  if ((await prisma.user.count()) === 0) {
    const { SEED_OWNER_EMAIL: email, SEED_OWNER_NAME: name, SEED_OWNER_PASSWORD: password } = process.env;
    if (email && password && password.length >= 12) {
      await prisma.user.create({
        data: { email: email.toLowerCase(), name: name || "Owner", role: "OWNER", passwordHash: await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 }) },
      });
      console.log(`  Owner account: ${email}`);
    } else {
      console.log("  No users yet. Set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD (12+ characters) and re-run, or use `pnpm user:create`.");
    }
  }
}

main()
  .then(() => console.log("Done."))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
