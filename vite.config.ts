import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import type { ContactPayload } from "./server/email.js";
import { absoluteUrl, DEFAULT_OG_IMAGE, getAllIndexableRoutes, getRouteMeta, getSitemapEntries, getStructuredData, SITE_URL } from "./client/src/data/seo";

// Load .env into process.env so server-side code (Resend) can access it in dev
const env = loadEnv("development", process.cwd(), "");
Object.assign(process.env, env);

const PROJECT_ROOT = import.meta.dirname;

/**
 * Serve the standalone landing page at /landing in dev mode
 */
function vitePluginLandingPage(): Plugin {
  const landingDir = path.join(PROJECT_ROOT, "client", "public", "landing");

  return {
    name: "landing-page",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const landingRoutes: Record<string, string> = {
          "/landing": "index.html",
          "/landing/": "index.html",
          "/privacy": "privacy.html",
          "/privacy/": "privacy.html",
          "/terms": "terms.html",
          "/terms/": "terms.html",
        };
        const fileName = landingRoutes[url];
        if (fileName) {
          const file = path.join(landingDir, fileName);
          if (fs.existsSync(file)) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            fs.createReadStream(file).pipe(res);
            return;
          }
        }
        if (url === "/landing/privacy.html") {
          res.writeHead(301, { Location: "/privacy" });
          res.end();
          return;
        }
        if (url === "/landing/terms.html") {
          res.writeHead(301, { Location: "/terms" });
          res.end();
          return;
        }
        next();
      });
    },
  };
}

/**
 * Vite plugin to handle /api/contact in dev mode.
 * The email module (which initialises Resend) is imported lazily inside the
 * request handler so it is never evaluated during a production build.
 */
function vitePluginContactApi(): Plugin {
  return {
    name: "contact-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/contact", (req, res, next) => {
        if (req.method !== "POST") return next();

        let body = "";
        req.on("data", (chunk) => { body += chunk.toString(); });
        req.on("end", async () => {
          try {
            const { sendContactEmail, validateContactPayload } = await import("./server/email.js");
            const parsed = JSON.parse(body) as ContactPayload & { honeypot?: string };
            const result = validateContactPayload(parsed);
            if (!result.ok) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: result.error, fields: result.fields }));
            }
            if (result.spam) {
              res.writeHead(200, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ success: true }));
            }
            await sendContactEmail(result.payload);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            console.error("Contact email error:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to send message. Please try again." }));
          }
        });
      });
    },
  };
}

const escapeAttr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * After build, emit one HTML file per route with its own title, description,
 * canonical and share tags so crawlers and link previews (which don't run JS) see them.
 */
function vitePluginRouteMeta(): Plugin {
  let outDir = "";
  return {
    name: "route-meta",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const template = fs.readFileSync(path.join(outDir, "index.html"), "utf-8");
      const setContent = (html: string, selector: RegExp, value: string) =>
        html.replace(selector, (_m, pre: string, post: string) => `${pre}${value}${post}`);
      for (const route of getAllIndexableRoutes()) {
        const m = getRouteMeta(route);
        const url = `${SITE_URL}${route === "/" ? "/" : route}`;
        const image = m.image ? absoluteUrl(m.image) : DEFAULT_OG_IMAGE;
        const t = escapeAttr(m.title);
        const d = escapeAttr(m.description);
        let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
        html = setContent(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, d);
        html = setContent(html, /(<link rel="canonical" href=")[^"]*(")/, url);
        html = setContent(html, /(<meta property="og:title"\s+content=")[^"]*(")/, t);
        html = setContent(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, d);
        html = setContent(html, /(<meta property="og:url" content=")[^"]*(")/, url);
        html = setContent(html, /(<meta property="og:image" content=")[^"]*(")/, image);
        html = setContent(html, /(<meta name="twitter:title"\s+content=")[^"]*(")/, t);
        html = setContent(html, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, d);
        html = setContent(html, /(<meta name="twitter:image" content=")[^"]*(")/, image);
        const ld = getStructuredData(route)
          .map((o) => `    <script type="application/ld+json" data-route-ld>${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`)
          .join("\n");
        if (ld) html = html.replace("</head>", () => `${ld}\n  </head>`);
        if (route === "/") {
          fs.writeFileSync(path.join(outDir, "index.html"), html);
        } else {
          const dir = path.join(outDir, route);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, "index.html"), html);
        }
      }
      // Sitemap lists exactly the canonical, live URLs above plus the standalone static pages.
      const urls = getSitemapEntries()
        .map((e) => `  <url>\n    <loc>${SITE_URL}${e.path === "/" ? "/" : e.path}</loc>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`)
        .join("\n");
      fs.writeFileSync(
        path.join(outDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
    },
  };
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginLandingPage(), vitePluginContactApi(), vitePluginRouteMeta()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Large service catalogue — its own cacheable chunk so it doesn't bloat the app shell.
          if (id.includes("client/src/data/services")) return "services-data";
          if (id.includes("node_modules")) {
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react-vendor";
            if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils|gsap)[\\/]/.test(id)) return "motion-vendor";
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      "penny-dramatic-perfect-accountability.trycloudflare.com",
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
