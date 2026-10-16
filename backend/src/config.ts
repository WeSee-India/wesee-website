import path from "node:path";
import { z } from "zod";

const list = z
  .string()
  .default("")
  .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  /** Public site origin, used for preview links, sitemap and absolute URLs. */
  SITE_URL: z.string().default("https://www.weseegpt.com"),
  /** Origins allowed to call the API from a browser (client site and admin). */
  CORS_ORIGINS: list,
  /** Where the admin app lives, for links in responses. */
  ADMIN_URL: z.string().default("http://localhost:3001"),

  /** Secret for signing preview tokens. Required in production. */
  SESSION_SECRET: z.string().min(32).optional(),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(12),
  /** lax works when admin and API share a site (admin.example.com + api.example.com, or one origin). Use none for cross-site. */
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  COOKIE_DOMAIN: z.string().optional(),
  /** Set when running behind a proxy (Railway, Vercel) so client IPs and secure cookies work. */
  TRUST_PROXY: z.coerce.number().int().default(1),

  UPLOAD_DIR: z.string().default(path.resolve(process.cwd(), "uploads")),
  UPLOAD_MAX_MB: z.coerce.number().positive().default(10),

  /** Optional Vercel deploy hook, called (debounced) after publishing so prerendered SEO pages refresh. */
  CLIENT_DEPLOY_HOOK_URL: z.string().url().optional(),
  DEPLOY_HOOK_DEBOUNCE_SECONDS: z.coerce.number().int().nonnegative().default(60),

  RESEND_API_KEY: z.string().optional(),
  CONTACT_TO: z.string().default("harsh.khanna@weseegpt.com"),
  RESEND_FROM: z.string().default("WeSee Contact Form <onboarding@resend.dev>"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

const env = parsed.data;

if (env.NODE_ENV === "production" && !env.SESSION_SECRET) {
  console.error("SESSION_SECRET (32+ characters) is required in production.");
  process.exit(1);
}

export const config = {
  ...env,
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  sessionSecret: env.SESSION_SECRET ?? "dev-only-secret-change-me-dev-only-secret",
  uploadMaxBytes: Math.round(env.UPLOAD_MAX_MB * 1024 * 1024),
};
