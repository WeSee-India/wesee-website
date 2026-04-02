import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, company, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are required." });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const toAddress = process.env.CONTACT_TO || "hr@weseegpt.com";

    await resend.emails.send({
      from: "WeSee Contact Form <onboarding@resend.dev>",
      to: toAddress,
      replyTo: `${name} <${email}>`,
      subject: `New message from ${name}${company ? ` (${company})` : ""}`,
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
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;"><a href="mailto:${email}" style="color: #1A1A1A;">${email}</a></td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Company</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;">${company}</td>
              </tr>` : ""}
              ${service ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Service</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1A1A1A; font-size: 15px;">${service}</td>
              </tr>` : ""}
            </table>
            <div style="margin-top: 24px;">
              <div style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Message</div>
              <div style="color: #1A1A1A; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
            </div>
          </div>
          <p style="color: #aaaaaa; font-size: 12px; text-align: center; margin-top: 24px;">WeSee AI Automation · weseegpt.com</p>
        </div>
      `,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}${company ? `\nCompany: ${company}` : ""}${service ? `\nService: ${service}` : ""}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact email error:", err);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }
}
