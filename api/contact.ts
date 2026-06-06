import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

// NOTE: This Vercel serverless function is intentionally self-contained (it does
// not import from ../server) so it bundles/deploys in isolation. The validation
// and escaping logic mirrors server/email.ts — keep the two in sync.

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: z.string().trim().email("A valid email is required.").max(200),
  message: z.string().trim().min(1, "Message is required.").max(5000),
  company: optionalText(150),
  service: optionalText(100),
  phone: optionalText(40),
  consentNonMarketing: z.boolean().optional(),
  consentMarketing: z.boolean().optional(),
  // Honeypot — bots fill it, humans never see it. Must be empty.
  honeypot: z.string().max(0).optional(),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Strip CR/LF to prevent email header (subject / replyTo) injection.
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

const ALLOWED_ORIGINS = ["https://weseegpt.com", "https://www.weseegpt.com"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Defence-in-depth origin check. A missing Origin (non-browser clients) is allowed.
  const origin = req.headers.origin;
  if (
    origin &&
    !ALLOWED_ORIGINS.includes(origin) &&
    !origin.endsWith(".vercel.app") &&
    !origin.startsWith("http://localhost")
  ) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return res.status(400).json({ error: first?.message || "Name, email and message are required." });
  }

  const { name, email, company, service, message, phone, consentNonMarketing, consentMarketing } = parsed.data;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const toAddress = process.env.CONTACT_TO || "harsh.khanna@weseegpt.com";
    const fromAddress = process.env.RESEND_FROM || "WeSee Contact Form <onboarding@resend.dev>";

    const eName = escapeHtml(name);
    const eEmail = escapeHtml(email);
    const eCompany = company ? escapeHtml(company) : "";
    const eService = service ? escapeHtml(service) : "";
    const ePhone = phone ? escapeHtml(phone) : "";
    const eMessage = escapeHtml(message);

    await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: sanitizeHeader(`${name} <${email}>`),
      subject: sanitizeHeader(`New message from ${name}${company ? ` (${company})` : ""}`),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9f9;">
          <div style="background: #1A1A1A; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">New Contact Form Submission</h2>
            <p style="color: #888888; margin: 6px 0 0; font-size: 13px;">via weseegpt.com</p>
          </div>
          <div style="background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; width: 120px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px; font-weight: 600;">${eName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;"><a href="mailto:${eEmail}" style="color: #1A1A1A;">${eEmail}</a></td>
              </tr>
              ${eCompany ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Company</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;">${eCompany}</td>
              </tr>` : ""}
              ${eService ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Service</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;">${eService}</td>
              </tr>` : ""}
              ${ePhone ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;">${ePhone}</td>
              </tr>` : ""}
              ${consentNonMarketing !== undefined ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Non-marketing SMS</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;">${consentNonMarketing ? "Yes" : "No"}</td>
              </tr>` : ""}
              ${consentMarketing !== undefined ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Marketing SMS</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;">${consentMarketing ? "Yes" : "No"}</td>
              </tr>` : ""}
            </table>
            <div style="margin-top: 24px;">
              <div style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Message</div>
              <div style="color: #1A1A1A; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${eMessage}</div>
            </div>
          </div>
          <p style="color: #aaaaaa; font-size: 12px; text-align: center; margin-top: 24px;">WeSee AI Automation · weseegpt.com</p>
        </div>
      `,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}${company ? `\nCompany: ${company}` : ""}${service ? `\nService: ${service}` : ""}${phone ? `\nPhone: ${phone}` : ""}${consentNonMarketing !== undefined ? `\nNon-marketing SMS: ${consentNonMarketing ? "Yes" : "No"}` : ""}${consentMarketing !== undefined ? `\nMarketing SMS: ${consentMarketing ? "Yes" : "No"}` : ""}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact email error:", err);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }
}
