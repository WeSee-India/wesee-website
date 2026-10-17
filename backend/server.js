// Vercel entry point. Vercel's Express preset serves the default-exported app as a
// serverless function; src/index.ts (app.listen) stays the entry for local dev and Render.
// Imports the tsc output (`pnpm build`) so Vercel doesn't re-typecheck the sources.
import { createApp } from "./dist/app.js";
import { ensureSystemPages } from "./dist/content/pageEngine.js";
import { ensureUploadDir } from "./dist/lib/storage.js";

await ensureUploadDir();
await ensureSystemPages();

export default createApp();
