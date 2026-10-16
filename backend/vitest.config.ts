import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Creates a throwaway database per run and sets DATABASE_URL for the workers.
    globalSetup: ["./tests/globalSetup.ts"],
    env: {
      NODE_ENV: "test",
      SESSION_SECRET: "test-secret-test-secret-test-secret-test",
      SITE_URL: "http://localhost:3000",
      UPLOAD_DIR: "./.test-uploads",
      SEED_OWNER_EMAIL: "owner@test.local",
      SEED_OWNER_NAME: "Test Owner",
      SEED_OWNER_PASSWORD: "test-owner-password-1",
    },
    // Tests share one database; run files one after another.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
