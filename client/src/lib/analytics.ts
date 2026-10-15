/**
 * Analytics events pushed to the GTM dataLayer.
 *
 * Privacy rule: payloads carry only coarse, non-identifying labels (which button, which
 * form, which kind of error). Never put names, emails, phone numbers, message text or
 * free-text field values in here.
 */

type Primitive = string | number | boolean;
type EventParams = Record<string, Primitive | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const payload: Record<string, unknown> = { event };
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) payload[key] = value;
  }
  (window.dataLayer = window.dataLayer || []).push(payload);
}

export type CtaKind = "book" | "contact" | "whatsapp" | "phone" | "email";

/** Maps a link target to a CTA kind, or null when the link isn't a conversion action. */
export function ctaKindForHref(href: string): CtaKind | null {
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "email";
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) return "whatsapp";
  let path = href;
  if (/^https?:\/\//.test(href)) {
    try {
      const url = new URL(href);
      if (url.origin !== window.location.origin) return null;
      path = url.pathname;
    } catch {
      return null;
    }
  }
  path = path.split(/[?#]/)[0].replace(/\/+$/, "");
  if (path === "/book") return "book";
  if (path === "/contact") return "contact";
  return null;
}

/** Where on the page a click came from, so the same CTA can be compared across placements. */
export function ctaLocation(el: Element): string {
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("main")) return "main";
  return "other";
}
