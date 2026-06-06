import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import type { ContactPayload } from "./server/email.js";

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
              return res.end(JSON.stringify({ error: result.error }));
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

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginLandingPage(), vitePluginContactApi()];

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
