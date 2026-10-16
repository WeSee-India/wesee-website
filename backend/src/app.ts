import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { loadSession } from "./lib/auth.js";
import { errorHandler, notFoundHandler } from "./lib/errors.js";
import { adminRouter } from "./routes/admin/index.js";
import { authRouter } from "./routes/auth.js";
import { contactRouter } from "./routes/contact.js";
import { publicRouter } from "./routes/public.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.TRUST_PROXY);

  app.use(
    helmet({
      // Uploaded images are embedded by the public site on another origin.
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    }),
  );

  const allowed = new Set(config.CORS_ORIGINS);
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || allowed.has(origin) || (!config.isProd && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "X-CSRF-Token"],
      maxAge: 600,
    }),
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  app.get("/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  });

  // Uploaded media. Names are random and replacements bump ?v=, so a short shared cache is safe.
  app.use(
    "/uploads",
    express.static(config.UPLOAD_DIR, {
      index: false,
      dotfiles: "deny",
      maxAge: "1h",
      setHeaders: (res) => {
        res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    }),
  );

  // A broad limit for everything under /api; auth and contact have stricter ones of their own.
  app.use("/api", rateLimit({ windowMs: 60_000, limit: 600, standardHeaders: "draft-8", legacyHeaders: false }));

  app.use("/api/public", publicRouter);
  app.use("/api/contact", contactRouter);

  app.use("/api/auth", loadSession, authRouter);
  app.use("/api/admin", loadSession, adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
