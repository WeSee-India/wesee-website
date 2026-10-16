import { Router } from "express";
import rateLimit from "express-rate-limit";
import { sendContactEmail, validateContactPayload } from "../email.js";

/** Discovery-call / contact form. Moved here from the former Vercel function (api/contact.ts). */
export const contactRouter = Router();

contactRouter.post(
  "/",
  rateLimit({ windowMs: 10 * 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many messages from this connection. Try again in a few minutes, or email us directly." } }),
  async (req, res) => {
    const result = validateContactPayload(req.body);
    if (!result.ok) return res.status(400).json({ error: result.error, fields: result.fields });
    // Pretend success so bots get no signal to adapt to; nothing is sent.
    if (result.spam) return res.json({ success: true });
    try {
      await sendContactEmail(result.payload);
      res.json({ success: true });
    } catch (err) {
      console.error("Contact email error:", err);
      res.status(500).json({ error: "We couldn't send your message. Please try again in a moment, or email us directly." });
    }
  },
);
