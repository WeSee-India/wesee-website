/**
 * One-time step: publish every case study with its [PLACEHOLDER] notes removed.
 *
 * The case studies came from the developer handoff with [CONFIRM: …] notes for the
 * team. The team decided to go live with the information already written and edit
 * later, so this strips the notes (keeping the text around them) and publishes each
 * item through the normal save/publish path, which validates it and records a
 * History entry. It runs from the seed on deploy, once: an audit-log entry marks it done.
 */
import type { PrismaClient } from "@prisma/client";
import { getRow, publishItem, requireCollection, saveItem, workingValues } from "../../src/content/engine.js";

/** Same shape the API uses to block publishing (engine.ts), matched everywhere in a string. */
const PLACEHOLDER = /\s*\[[A-Z]{2,}[A-Z0-9 /&-]*(?:[:,][^\]]*)?\]/g;
const MARKER = "content.caseStudies.placeholdersRemoved";
const BOOKING_PAGE = "/book";

const tidy = (s: string) => s.replace(PLACEHOLDER, "").replace(/\s{2,}/g, " ").replace(/\s+([.,;:])/g, "$1").trim();

function clean(value: unknown): unknown {
  if (typeof value === "string") return tidy(value) || null;
  if (Array.isArray(value)) {
    return value
      .map(clean)
      .filter((v) => v !== null)
      // A paragraph, feature or result whose main text was only a placeholder goes.
      .filter((v) => !(v && typeof v === "object" && ("text" in v || "value" in v) && !(v as Record<string, unknown>).text && !(v as Record<string, unknown>).value));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v)]));
  }
  return value;
}

/** A case study's values with every [PLACEHOLDER] removed and anything left empty dropped. */
export function stripPlaceholders(values: Record<string, unknown>): Record<string, unknown> {
  const out = clean(values) as Record<string, unknown>;
  for (const key of ["tags", "tech", "overview", "challenge", "solution", "features", "delivery", "results"]) out[key] ??= [];
  // The testimonial block hides itself when empty; never publish a half-filled quote.
  const quote = out.quote as Record<string, unknown> | null;
  if (!quote?.text || !quote?.name) out.quote = null;
  const cta = out.cta as Record<string, unknown> | null;
  if (cta && !cta.buttonUrl) cta.buttonUrl = BOOKING_PAGE;
  return out;
}

export async function publishCaseStudiesOnce(prisma: PrismaClient) {
  if (await prisma.auditLog.findFirst({ where: { action: MARKER } })) return;
  const owner = (await prisma.user.findFirst({ where: { role: "OWNER" }, orderBy: { createdAt: "asc" } })) ?? (await prisma.user.findFirst({ orderBy: { createdAt: "asc" } }));
  if (!owner) return;

  const def = requireCollection("caseStudies");
  const rows = await prisma.caseStudy.findMany({ select: { id: true, slug: true } });
  for (const { id, slug } of rows) {
    const values = stripPlaceholders(workingValues(def, await getRow(def, id)));
    await saveItem(def, id, { ...values, slug }, owner.id);
    await publishItem(def, id, owner.id);
    console.log(`  Case study published: ${slug}`);
  }
  await prisma.auditLog.create({
    data: { action: MARKER, entityType: "caseStudies", userId: owner.id, summary: `Removed [PLACEHOLDER] notes and published ${rows.length} case studies` },
  });
}
