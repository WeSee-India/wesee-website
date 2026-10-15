import { Resend } from "resend";
import { z } from "zod";

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  phone?: string;
  consentNonMarketing?: boolean;
  consentMarketing?: boolean;
}

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "Use 100 characters or fewer for your name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address, like name@company.com.")
    .max(200, "Use 200 characters or fewer for your email."),
  message: z.string().trim().min(1, "Add a short message about what you need.").max(5000, "Keep your message under 5,000 characters."),
  company: optionalText(150),
  service: optionalText(100),
  phone: optionalText(40),
  consentNonMarketing: z.boolean().optional(),
  consentMarketing: z.boolean().optional(),
  // Spam traps. The honeypot is hidden from people; formAge is how long the form was open (ms).
  honeypot: z.string().optional(),
  formAge: z.number().optional(),
});

/** Real people need a moment to fill the form; anything faster than this, or any honeypot content, is a bot. */
const MIN_FORM_AGE_MS = 1000;

function isSpam(data: { honeypot?: string; formAge?: number }): boolean {
  return Boolean(data.honeypot) || (data.formAge !== undefined && data.formAge < MIN_FORM_AGE_MS);
}

export type ContactValidation =
  | { ok: true; payload: ContactPayload; spam?: false }
  | { ok: true; spam: true }
  | { ok: false; error: string; fields: Record<string, string> };

export function validateContactPayload(body: unknown): ContactValidation {
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return { ok: false, error: Object.values(fields)[0] || "Check the form and try again.", fields };
  }
  if (isSpam(parsed.data)) return { ok: true, spam: true };
  // Strip the spam-trap fields before passing the payload on.
  const { honeypot: _honeypot, formAge: _formAge, ...payload } = parsed.data;
  return { ok: true, payload };
}

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

export async function sendContactEmail(payload: ContactPayload) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, company, service, message, phone, consentNonMarketing, consentMarketing } = payload;

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
}
