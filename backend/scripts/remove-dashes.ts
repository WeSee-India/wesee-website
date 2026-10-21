/**
 * Rewrites em dashes (—) and en dashes (–) out of the site's copy.
 *
 *   pnpm --filter @wesee/backend content:remove-dashes           dry run: print what would change
 *   pnpm --filter @wesee/backend content:remove-dashes --apply   write the changes
 *
 * Covers every content table (live values and pending drafts) and settings.
 * Revisions and the audit log are history and are left alone.
 */
import { Prisma, PrismaClient } from "@prisma/client";

/** Words that continue the sentence after a dash, so a comma reads naturally. */
const CONTINUES = new Set(
  "and or but so yet nor including such like especially even plus often usually typically ideally ideal then which who whose where when while whether because since though although without with within across from at in into on onto for to by via as all both each not ensuring making helping giving letting turning keeping saving freeing so-you trained built designed powered handling covering backed tailored ready right just only exactly rather instead never always".split(
    " ",
  ),
);

/** Words that open a new, independent sentence after a dash. */
const STARTS_SENTENCE = new Set("we you your our it it's its they their this that that's these those there there's i most many nothing everything everyone no-one results traffic".split(" "));

const SMALL = new Set(["&", "and", "or", "of", "the", "for", "to", "a", "an", "with", "in", "on", "at", "by", "vs", "via", "per", "from"]);

/** "-ing" and "-ed" words that usually act as nouns, not as a clause continuing the sentence. */
const NOUNISH = new Set(
  "starting pricing timing greeting booking onboarding messaging branding marketing testing tracking routing reporting training setting landing meeting hosting scheduling billing anything something nothing everything speed need feed seed".split(
    " ",
  ),
);

/**
 * "Payout & Commission Management" or "Discovery & crawl analysis": a short label
 * at the start of a line, followed by a capitalised description.
 */
function isLabel(s: string, after: string) {
  const words = s.trim().split(/\s+/);
  if (!s.trim() || words.length > 8 || /[.!?:;,]$/.test(s.trim()) || /[.!?]/.test(s)) return false;
  const content = words.filter((w) => !SMALL.has(w.toLowerCase()));
  if (content.length > 0 && content.every((w) => /^[\p{Lu}\p{N}(₹$"“'‘#@/+]/u.test(w))) return true;
  const sentenceStart = /^(we|you|our|your|it|its|the|a|an|this|that|these|those|most|many|every|each|if|when|how|what|why)$/i.test(words[0]);
  return !sentenceStart && words.length <= 6 && /^\p{Lu}/u.test(words[0]) && /^\p{Lu}/u.test(after.trim()) && !/^I\b/.test(after.trim());
}

const capitalize = (s: string) => s.replace(/^(\W*)(\p{Ll})/u, (_, pre: string, c: string) => pre + c.toUpperCase());
const firstWord = (s: string) => (s.trim().match(/^[\p{L}\p{N}'’-]+/u)?.[0] ?? "").toLowerCase().replace("’", "'");

/** "…issues — saving hours daily", "…customers — engineered for revenue", "— significantly improving…" */
function continuesClause(after: string) {
  const t = after.trim();
  const w = firstWord(t);
  if (!/^\p{Ll}/u.test(t)) return false;
  if (/ly$/.test(w) && w.length > 4) return true;
  if (w.length <= 4 || !/(ing|ed)$/.test(w) || NOUNISH.has(w)) return false;
  // "pricing and availability stay current", "adding a rep … is usually minutes": a noun phrase, not a clause.
  if (/ing$/.test(w) && new RegExp(`^${w}(,| and | or )`).test(t)) return false;
  if (/^\S+ing\s+(?:(?!what\b|that\b|which\b|who\b)\S+\s+){0,6}(is|are|was|takes|means|stays?)\b/.test(t)) return false;
  return /\s/.test(t);
}

/** How to join the text either side of one dash, given the rest of the sentence after it. */
function joiner(before: string, after: string, hasColon: boolean, question: boolean): string {
  const w = firstWord(after);
  if (STARTS_SENTENCE.has(w)) return ". ";
  if (question || CONTINUES.has(w) || continuesClause(after)) return ", ";
  // "qualification — budget, timeline, decision-maker" introduces a list.
  const rest = after.replace(/[.!?]\s*$/, "");
  if (!hasColon && (rest.match(/,/g)?.length ?? 0) >= 2 && rest.split(/\s+/).length <= 20) return ": ";
  // Anything else reads best as its own short sentence: "…in seconds. No lead left waiting."
  return ". ";
}

function fixSentence(sentence: string, hasColon: boolean): string {
  const parts = sentence.split(/\s*—\s*/);
  if (parts.length === 1) return sentence;
  // A leading dash, e.g. an attribution "— Priya"
  if (parts[0].trim() === "") return parts.slice(1).join(", ");
  if (parts.length === 3 && parts[2].trim() !== "") {
    // "A — aside — B": the aside becomes a comma pair (or brackets if it has commas of its own),
    // unless it opens a sentence of its own.
    const aside = parts[1].trim();
    if (!STARTS_SENTENCE.has(firstWord(aside))) {
      const tail = parts[2].trimStart();
      if (aside.includes(",") && !/[()]/.test(aside)) {
        // "If the foundation is broken (slow site, …), even…" and "(carts, sessions), not random blasts"
        const clause = /^(if|when|once|because|while|since|unless|after|before)\b/i.test(parts[0].trim());
        const sep = /^[,.;:!?)]/.test(tail) ? "" : clause || /^\p{Ll}+ing\b/u.test(tail) || /^(not|but|so)\b/.test(tail) ? ", " : " ";
        return `${parts[0]} (${aside})${sep}${tail}`;
      }
      if (!aside.includes(",")) return `${parts[0]}, ${aside}${/^[,.;:!?)]/.test(tail) ? "" : ", "}${tail}`;
    }
  }
  // "How does pricing work — per minute or retainer?"
  const question = /\?\s*$/.test(sentence) && /^\W*(how|what|which|why|who|where|when|do|does|did|can|could|is|are|should|will|would)\b/i.test(parts[0]) && !parts.slice(1).join("").includes(",");
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].trim() === "") continue;
    const j = joiner(out, parts.slice(i).join(" "), hasColon || out.includes(":"), question);
    out = out.replace(/[,;:]\s*$/, "") + j + (j === ". " ? capitalize(parts[i]) : parts[i]);
  }
  return out;
}

/** Phrases the rules below get wrong, rewritten by hand. */
const OVERRIDES: [string, string][] = [
  ["Short-form edits — Reels/Shorts cuts, text overlays, captions — sit here.", "Short-form edits (Reels/Shorts cuts, text overlays, captions) sit here."],
  ["Reached critical mass — 35", "Reached critical mass: 35"],
  ["finding the real problem — the signal", "finding the real problem: the signal"],
  ["Hey — choose", "Hey, choose"],
  ["next steps—if it makes sense", "next steps, if it makes sense"],
];

/** Remove em and en dashes from a piece of copy. */
export function removeDashes(text: string): string {
  if (!/[—–]/.test(text)) return text;
  let s = text;
  for (const [from, to] of OVERRIDES) s = s.replaceAll(from, to);
  // Ranges: "2–3 weeks", "₹2L–15L", "10–20%".
  s = s.replace(/([\p{N}][\p{N}.,]*[%LKkMx+]?)\s*[–—]\s*(?=[₹$]?[\p{N}])/gu, "$1 to ");
  // Other en dashes join words: "highest–leverage", "message–market".
  s = s.replace(/(\S)–(\S)/g, "$1-$2").replace(/\s–\s/g, " — ");
  // Work line by line (markdown), and within a line sentence by sentence.
  return s
    .split("\n")
    .map((line) => {
      // "— Name" attribution or a bare dash as an empty marker.
      if (/^\s*—\s*$/.test(line)) return line;
      // Label-style lines: "Payout & Commission Management — Calculation, approvals…"
      const m = line.match(/^(\s*(?:[-*+]\s+|\d+\.\s+)?(?:\*\*)?)([^—]+?)(\*\*)?\s+—\s+([\s\S]*)$/);
      // A one-word answer: "Yes — we can…" reads as "Yes. We can…"
      if (m && !m[3] && /^(yes|no|both|neither|absolutely|usually|often|sometimes)$/i.test(m[2].trim())) return `${m[1]}${m[2]}. ${fixLine(capitalize(m[4]))}`;
      if (m && isLabel(m[2], m[4])) return `${m[1]}${m[2]}${m[3] ?? ""}: ${fixLine(capitalize(m[4]), true)}`;
      return fixLine(line);
    })
    .join("\n");
}

function fixLine(line: string, hasColon = false) {
  if (!line.includes("—")) return line;
  return line
    .split(/(?<=[.!?…])(\s+)/)
    .map((piece) => (piece.includes("—") ? fixSentence(piece, hasColon) : piece))
    .join("");
}

/** Apply removeDashes to every string inside a JSON-ish value. */
export function deepRemoveDashes<T>(value: T): T {
  if (typeof value === "string") return removeDashes(value) as T;
  if (Array.isArray(value)) return value.map(deepRemoveDashes) as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepRemoveDashes(v)])) as T;
  }
  return value;
}

const SKIP = new Set(["id", "slug", "key", "path", "status", "kind", "type", "image", "ogImage", "coverImage", "logo", "url", "href", "email", "createdById", "updatedById", "passwordHash"]);

async function main() {
  const apply = process.argv.includes("--apply");
  const prisma = new PrismaClient();
  const models = ["page", "pageSection", "project", "caseStudy", "author", "blogPost", "faq", "job", "service", "serviceCategory", "teamMember", "mediaAsset"] as const;
  let changedRows = 0;
  type Delegate = { findMany(): Promise<Record<string, unknown>[]>; update(args: unknown): Promise<unknown> };
  const db = prisma as unknown as Record<string, Delegate>;

  for (const name of models) {
    for (const row of await db[name].findMany()) {
      const data: Record<string, unknown> = {};
      for (const [field, value] of Object.entries(row)) {
        if (SKIP.has(field) || value == null || value instanceof Date) continue;
        if (typeof value !== "string" && typeof value !== "object") continue;
        const next = deepRemoveDashes(value);
        if (JSON.stringify(next) !== JSON.stringify(value)) data[field] = next as Prisma.InputJsonValue;
      }
      if (!Object.keys(data).length) continue;
      changedRows++;
      console.log(`${name} ${String(row.slug ?? row.key ?? row.name ?? row.id)}: ${Object.keys(data).join(", ")}`);
      if (apply) await db[name].update({ where: { id: row.id }, data });
    }
  }

  for (const s of await prisma.setting.findMany()) {
    const next = deepRemoveDashes(s.value);
    if (JSON.stringify(next) === JSON.stringify(s.value)) continue;
    changedRows++;
    console.log(`setting ${s.key}`);
    if (apply) await prisma.setting.update({ where: { key: s.key }, data: { value: next as Prisma.InputJsonValue } });
  }

  console.log(`${changedRows} rows ${apply ? "updated" : "would change (dry run; pass --apply to write)"}.`);
  await prisma.$disconnect();
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/remove-dashes.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
