import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const root = import.meta.dirname;
const env = loadEnv("development", root, "");
const API = env.VITE_API_PROXY_TARGET || "http://localhost:4000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(root, "src") } },
  server: {
    port: 3001,
    strictPort: true,
    // Same-origin API in development, so the session cookie is first-party.
    proxy: { "/api": { target: API, changeOrigin: true }, "/uploads": { target: API, changeOrigin: true } },
  },
  preview: { port: 3001 },
  build: { outDir: "dist", sourcemap: true },
});
