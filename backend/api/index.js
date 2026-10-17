// Vercel serverless entry: every request is rewritten here (see vercel.json).
// Imports the tsc output from `pnpm build`, so Vercel has no TypeScript to re-check;
// src/index.ts (app.listen) stays the entry for local dev.
import { createApp } from "../dist/app.js";
import { ensureSystemPages } from "../dist/content/pageEngine.js";
import { ensureUploadDir } from "../dist/lib/storage.js";

await ensureUploadDir();
await ensureSystemPages();

export default createApp();
