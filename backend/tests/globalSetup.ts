import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

/**
 * Each test run gets its own throwaway database (wesee_test_<timestamp>) on the
 * same server as DATABASE_URL: created here, migrated with `migrate deploy`,
 * seeded with the original content, and dropped when the run ends. The
 * development database is never touched.
 */
const BASE_URL = process.env.TEST_DATABASE_BASE_URL ?? "postgresql://wesee:wesee@localhost:5435/wesee";

export default async function setup() {
  const name = `wesee_test_${Date.now().toString(36)}`;
  const url = new URL(BASE_URL);
  url.pathname = `/${name}`;
  const testUrl = url.toString();

  const admin = new PrismaClient({ datasourceUrl: BASE_URL });
  await admin.$executeRawUnsafe(`CREATE DATABASE "${name}"`);

  const env = {
    ...process.env,
    DATABASE_URL: testUrl,
    NODE_ENV: "test",
    SEED_OWNER_EMAIL: "owner@test.local",
    SEED_OWNER_NAME: "Test Owner",
    SEED_OWNER_PASSWORD: "test-owner-password-1",
  };
  execSync("npx prisma migrate deploy", { env, stdio: "pipe" });
  execSync("npx tsx prisma/seed.ts", { env, stdio: "pipe" });

  // Test workers inherit this.
  process.env.DATABASE_URL = testUrl;

  return async () => {
    await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.$disconnect();
  };
}
