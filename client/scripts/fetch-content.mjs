// Writes the content the site is built with to src/generated/ (gitignored):
//   content.json   everything published except services (bundled with the app shell)
//   services.json  the service catalogue (bundled with the pages that use it)
//
// Source: the backend's /api/public/snapshot at CONTENT_API_URL (default VITE_API_URL).
// With no API configured, or the API unreachable, it falls back to the committed
// src/content/fallback.json. CONTENT_STRICT=1 turns that fallback into a build failure
// (recommended in production, so a deploy never ships stale content silently).
//
// Usage: node scripts/fetch-content.mjs          fetch if an API is configured
//        node scripts/fetch-content.mjs --offline only create the files if missing (dev)
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "src", "generated");
const fallbackFile = path.join(root, "src", "content", "fallback.json");
const env = { ...loadEnv(process.env.NODE_ENV === "development" ? "development" : "production", root, ""), ...process.env };
const offline = process.argv.includes("--offline");
const strict = env.CONTENT_STRICT === "1" || env.CONTENT_STRICT === "true";
const apiUrl = (env.CONTENT_API_URL || env.VITE_API_URL || "").replace(/\/+$/, "");

function write(snapshot, source) {
  const { services = [], ...rest } = snapshot.collections ?? {};
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "content.json"), JSON.stringify({ ...snapshot, collections: rest }));
  fs.writeFileSync(path.join(outDir, "services.json"), JSON.stringify(services));
  console.log(`[content] ${source} (version ${snapshot.version ?? "?"}, ${services.length} services)`);
}

const fallback = () => JSON.parse(fs.readFileSync(fallbackFile, "utf8"));

if (offline) {
  if (!fs.existsSync(path.join(outDir, "content.json")) || !fs.existsSync(path.join(outDir, "services.json"))) {
    write(fallback(), "created from fallback.json");
  }
} else if (!apiUrl) {
  if (strict) throw new Error("[content] CONTENT_STRICT is set but no CONTENT_API_URL / VITE_API_URL is configured.");
  write(fallback(), "no API configured, using fallback.json");
} else {
  try {
    const res = await fetch(`${apiUrl}/api/public/snapshot`, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    write(await res.json(), `fetched from ${apiUrl}`);
  } catch (err) {
    const msg = `[content] could not fetch ${apiUrl}/api/public/snapshot: ${err instanceof Error ? err.message : err}`;
    if (strict) throw new Error(msg);
    console.warn(`${msg}. Using fallback.json.`);
    write(fallback(), "fallback.json");
  }
}
