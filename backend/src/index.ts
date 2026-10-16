import { createApp } from "./app.js";
import { config } from "./config.js";
import { ensureSystemPages } from "./content/pageEngine.js";
import { prisma } from "./db.js";
import { purgeExpiredSessions } from "./lib/auth.js";
import { ensureUploadDir } from "./lib/storage.js";

async function main() {
  await ensureUploadDir();
  // Built-in pages always exist, even on a fresh database without seed content.
  await ensureSystemPages();

  const app = createApp();
  const server = app.listen(config.PORT, () => {
    console.log(`WeSee API listening on http://localhost:${config.PORT}`);
  });

  const purge = setInterval(() => purgeExpiredSessions().catch((err) => console.error("Session purge failed", err)), 60 * 60_000);
  purge.unref();

  const shutdown = () => {
    server.close(() => {
      prisma.$disconnect().finally(() => process.exit(0));
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
