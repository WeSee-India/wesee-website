// Vercel entry point. Vercel's Express preset serves the default-exported app as a
// serverless function; src/index.ts (app.listen) stays the entry for local dev and Render.
import { createApp } from "./src/app.js";
import { ensureSystemPages } from "./src/content/pageEngine.js";
import { ensureUploadDir } from "./src/lib/storage.js";

await ensureUploadDir();
await ensureSystemPages();

export default createApp();
