import { bool, image, link, list, longText, select, text, url, type FieldDef } from "./fields.js";

/**
 * Global settings documents. Each is one row in the Setting table, validated
 * against these fields. Settings apply as soon as they are saved (every change
 * is kept in the revision history and can be restored).
 */

export interface SettingDef {
  key: string;
  label: string;
  description: string;
  fields: FieldDef[];
}

const navLink = [text("label", "Label", { required: true, maxLength: 60, width: "half" }), url("href", "Link", { required: true, width: "half" })];

export const settings: SettingDef[] = [
  {
    key: "site",
    label: "Site & SEO",
    description: "Brand basics and the SEO defaults used when a page doesn't set its own.",
    fields: [
      text("siteName", "Site name", { required: true, maxLength: 60, width: "half" }),
      url("siteUrl", "Site URL", { required: true, help: "Canonical origin, e.g. https://www.weseegpt.com", width: "half" }),
      image("logo", "Logo", { help: "Used in the header and structured data.", width: "half" }),
      image("favicon", "Favicon", { help: "Square PNG, at least 192×192.", width: "half" }),
      text("defaultTitle", "Default page title", { required: true, maxLength: 70 }),
      longText("defaultDescription", "Default description", { required: true, maxLength: 200 }),
      image("defaultOgImage", "Default social sharing image", { required: true, help: "1200×630." }),
      longText("organizationDescription", "Organisation description", { maxLength: 400, help: "Used in the Organization structured data." }),
      text("organizationAlternateName", "Organisation alternate name", { maxLength: 120 }),
    ],
  },
  {
    key: "navigation",
    label: "Navigation",
    description: "Header links and the Services mega menu.",
    fields: [
      list("headerLinks", "Header links", [...navLink, bool("servicesMenu", "Opens the services menu")], { itemLabel: "Link", titleField: "label", maxItems: 10 }),
      list(
        "servicesMenu",
        "Services menu groups",
        [
          text("name", "Group name", { required: true, maxLength: 80 }),
          longText("description", "Description", { maxLength: 300 }),
          list(
            "items",
            "Links",
            [
              text("label", "Label", { required: true, maxLength: 80 }),
              text("serviceSlug", "Service slug", { maxLength: 120, help: "Links to /services/<slug>.", width: "half" }),
              { type: "number", name: "categoryNumber", label: "…or category number", integer: true, help: "Links to /services?category=<n> when there is no service page.", width: "half" },
            ],
            { itemLabel: "Link", titleField: "label" },
          ),
        ],
        { itemLabel: "Group", titleField: "name" },
      ),
    ],
  },
  {
    key: "footer",
    label: "Footer",
    description: "The closing call to action, tagline and link columns at the bottom of every page.",
    fields: [
      text("ctaEyebrow", "CTA eyebrow", { maxLength: 60, width: "half" }),
      text("ctaHeading", "CTA heading", { maxLength: 60, width: "half" }),
      text("ctaEmail", "CTA email", { maxLength: 120, help: "Shown under the heading as a mailto link." }),
      longText("tagline", "Tagline", { maxLength: 300 }),
      list("columns", "Link columns", [text("title", "Column title", { required: true, maxLength: 60 }), list("links", "Links", navLink, { itemLabel: "Link", titleField: "label" })], {
        itemLabel: "Column",
        titleField: "title",
        maxItems: 4,
      }),
      list("legalLinks", "Legal links", navLink, { itemLabel: "Link", titleField: "label", maxItems: 6 }),
      text("copyright", "Copyright line", { maxLength: 200, help: "{year} is replaced with the current year." }),
      longText("entityDisclosure", "Operating entity disclosure", { maxLength: 600 }),
    ],
  },
  {
    key: "contact",
    label: "Contact details",
    description: "Email addresses, phone numbers, offices and the floating WhatsApp/call widget.",
    fields: [
      text("email", "General email", { maxLength: 120, width: "half" }),
      text("careersEmail", "Careers email", { maxLength: 120, width: "half" }),
      text("hrEmail", "HR email (job applications)", { maxLength: 120, width: "half" }),
      text("phone", "Phone", { maxLength: 40, help: "International format, e.g. +91 98…", width: "half" }),
      text("whatsappPhone", "WhatsApp number", { maxLength: 40, help: "Digits with country code, no + or spaces. Leave empty to hide the floating widget.", width: "half" }),
      text("whatsappMessage", "WhatsApp prefilled message", { maxLength: 300, width: "half" }),
      list("offices", "Offices", [
        text("label", "Label", { required: true, maxLength: 80, help: "e.g. “Headquarters”.", width: "half" }),
        text("locality", "City", { maxLength: 80, width: "half" }),
        text("country", "Country", { required: true, maxLength: 80, width: "half" }),
        text("countryCode", "Country code", { maxLength: 2, help: "ISO code, e.g. JP, IN. Used in structured data.", width: "half" }),
      ], { itemLabel: "Office", titleField: "label", maxItems: 6 }),
    ],
  },
  {
    key: "social",
    label: "Social links",
    description: "Profiles shown in the footer and in structured data.",
    fields: [list("links", "Profiles", navLink, { itemLabel: "Profile", titleField: "label", maxItems: 10 })],
  },
  {
    key: "announcement",
    label: "Announcement banner",
    description: "An optional banner above the header on every page.",
    fields: [
      bool("enabled", "Show the banner"),
      text("message", "Message", { maxLength: 200 }),
      link("link", "Link"),
      select("tone", "Style", ["neutral", "accent", "dark"]),
      bool("dismissible", "Visitors can dismiss it"),
    ],
  },
  {
    key: "appearance",
    label: "Appearance",
    description: "Site-wide visual options the design supports.",
    fields: [
      bool("showLoadingScreen", "Show the intro loading animation on first visit"),
      bool("showGrain", "Show the film-grain overlay"),
    ],
  },
];

export const settingByKey = new Map(settings.map((s) => [s.key, s]));

/** Extra validation that doesn't fit the field types. */
export function settingRefinements(key: string, value: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (key === "announcement" && value.enabled && !value.message) {
    errors.message = "Add a message or turn the banner off.";
  }
  return errors;
}
