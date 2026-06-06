import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { sendContactEmail, type ContactPayload } from "./email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const payload = req.body as ContactPayload;
      if (!payload.name || !payload.email || !payload.message) {
        return res.status(400).json({ error: "Name, email and message are required." });
      }
      await sendContactEmail(payload);
      return res.json({ success: true });
    } catch (err) {
      console.error("Contact email error:", err);
      return res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get(["/landing", "/landing/"], (_req, res) => {
    res.sendFile(path.join(staticPath, "landing", "index.html"));
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
