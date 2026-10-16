import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import { absoluteUrl, DEFAULT_OG_IMAGE, getAllIndexableRoutes, getRouteMeta, getSitemapEntries, getStructuredData, SITE_URL } from "./src/data/seo";

const PROJECT_ROOT = import.meta.dirname;
const env = loadEnv("development", PROJECT_ROOT, "");

/** In dev, /api/* is proxied to the backend app (backend/), which serves content and the contact form. */
const API_PROXY_TARGET = env.VITE_API_PROXY_TARGET || "http://localhost:4000";

/**
 * Serve the standalone landing page at /landing in dev mode
 */
function vitePluginLandingPage(): Plugin {
  const landingDir = path.join(PROJECT_ROOT, "public", "landing");

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

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginLandingPage(), vitePluginRouteMeta()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "src"),
    },
  },
  envDir: PROJECT_ROOT,
  root: PROJECT_ROOT,
  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Large service catalogue — its own cacheable chunk so it doesn't bloat the app shell.
          if (/[\\/]src[\\/]data[\\/]services/.test(id)) return "services-data";
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
    allowedHosts: ["localhost", "127.0.0.1"],
    proxy: {
      "/api": { target: API_PROXY_TARGET, changeOrigin: true },
      "/uploads": { target: API_PROXY_TARGET, changeOrigin: true },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
