import { createHash } from "node:crypto";
import type { Request, Response } from "express";
import { config } from "../config.js";
import { scheduleClientRebuild } from "./deployHook.js";

/**
 * Public content cache.
 *
 * Public responses are cached in memory per URL and tagged with a global
 * content version. Any admin write calls invalidatePublicContent(), which bumps
 * the version and empties the cache, so the next request reads fresh data.
 * Responses carry an ETag (304 for unchanged content) and a short
 * Cache-Control so browsers and CDNs revalidate quickly.
 *
 * Entries also expire after CACHE_TTL_MS, which bounds how late a scheduled
 * article (published with a future date) can appear.
 */

const CACHE_TTL_MS = 60_000;
const MAX_ENTRIES = 500;

let version = Date.now();
const store = new Map<string, { body: string; etag: string; expires: number }>();

export function contentVersion() {
  return version;
}

export function invalidatePublicContent(reason: string) {
  version = Date.now();
  store.clear();
  if (!config.isTest) scheduleClientRebuild(reason);
}

/** Send a cached JSON response for public reads, building it with `load` on a miss. */
export async function sendCached(req: Request, res: Response, load: () => Promise<unknown>) {
  const key = req.originalUrl;
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || entry.expires < now) {
    const body = JSON.stringify(await load());
    entry = { body, etag: `"${createHash("sha1").update(body).digest("base64url")}"`, expires: now + CACHE_TTL_MS };
    if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value!);
    store.set(key, entry);
  }
  res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
  res.setHeader("ETag", entry.etag);
  res.setHeader("X-Content-Version", String(version));
  if (req.get("if-none-match") === entry.etag) return res.status(304).end();
  res.type("application/json").send(entry.body);
}
