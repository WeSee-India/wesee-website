import { bool, image, imageWithAlt, link, list, longText, markdown, select, strings, text, url, type FieldDef } from "./fields.js";

/**
 * Pages and their sections.
 *
 * System pages are the site's built-in routes. Their section types are
 * bespoke: each maps to a React component in client/src/sections, with the
 * fields below. Editors can change content, hide sections and reorder them,
 * but can't add or remove section types (the layout code is fixed).
 *
 * Custom pages (served at their own path) are built from the generic section
 * types, which can be added, removed and reordered freely.
 */

import type { SectionTypeDef, SystemPageDef } from "./pageTypes.js";
import { sitePages, siteSectionTypes } from "./sitePages.js";

export type { SectionTypeDef, SystemPageDef };

const HIGHLIGHT_HELP = "Wrap words in *asterisks* to show them in the gold highlight style.";
const heading = (name = "heading", label = "Heading", required = false): FieldDef =>
  text(name, label, { maxLength: 200, help: HIGHLIGHT_HELP, required });

// ── Generic section types (custom pages, and reusable on some system pages) ──

const genericSections: SectionTypeDef[] = [
  {
    type: "hero",
    label: "Hero",
    generic: true,
    fields: [
      text("eyebrow", "Eyebrow", { maxLength: 80 }),
      heading("heading", "Heading", true),
      longText("subheading", "Subheading", { maxLength: 500 }),
      link("primaryCta", "Primary button"),
      link("secondaryCta", "Secondary button"),
      imageWithAlt("image", "Image"),
    ],
  },
  {
    type: "richText",
    label: "Text",
    generic: true,
    fields: [heading(), markdown("body", "Body", { required: true })],
  },
  {
    type: "imageText",
    label: "Image and text",
    generic: true,
    fields: [heading(), markdown("body", "Body"), imageWithAlt("image", "Image", { required: true }), select("imagePosition", "Image position", ["left", "right"]), link("cta", "Button")],
  },
  {
    type: "cards",
    label: "Cards",
    generic: true,
    fields: [
      heading(),
      longText("intro", "Intro", { maxLength: 600 }),
      list("items", "Cards", [text("title", "Title", { required: true, maxLength: 120 }), longText("body", "Text", { maxLength: 600 }), url("href", "Link")], {
        itemLabel: "Card",
        titleField: "title",
        maxItems: 12,
      }),
    ],
  },
  {
    type: "faqList",
    label: "Questions and answers",
    generic: true,
    fields: [
      heading(),
      list("items", "Questions", [text("question", "Question", { required: true, maxLength: 300 }), longText("answer", "Answer", { required: true, maxLength: 3000 })], {
        itemLabel: "Question",
        titleField: "question",
      }),
    ],
  },
  {
    type: "cta",
    label: "Call to action",
    generic: true,
    fields: [text("eyebrow", "Eyebrow", { maxLength: 80 }), heading("heading", "Heading", true), longText("body", "Text", { maxLength: 500 }), link("button", "Button")],
  },
];

// ── Home ──

const homeSections: SectionTypeDef[] = [
  {
    type: "home.hero",
    label: "Hero",
    fields: [
      text("badge", "Badge", { maxLength: 80, help: "Small pill above the headline (hidden on touch devices)." }),
      text("headlinePrefix", "Headline", { required: true, maxLength: 60, help: "The animated word is typed after this text." }),
      strings("rotatingWords", "Animated words", { required: true, itemLabel: "Word", maxItems: 12, maxLength: 24 }),
      longText("subheading", "Subheading", { maxLength: 400 }),
      link("primaryCta", "Button"),
      list("miniStats", "Mini stats", [text("value", "Value", { required: true, maxLength: 12, width: "half" }), text("label", "Label", { required: true, maxLength: 30, width: "half" })], {
        itemLabel: "Stat",
        titleField: "label",
        maxItems: 4,
      }),
    ],
  },
  {
    type: "home.features",
    label: "What we do",
    fields: [
      heading("heading", "Heading", true),
      list("items", "Feature cards", [
        text("icon", "Icon", { maxLength: 4, help: "A single symbol, e.g. ◆", width: "half" }),
        text("title", "Title", { required: true, maxLength: 60, width: "half" }),
        longText("description", "Description", { required: true, maxLength: 300 }),
      ], { itemLabel: "Card", titleField: "title", maxItems: 8 }),
    ],
  },
  {
    type: "home.work",
    label: "Our work (stacked cards)",
    fields: [
      heading("heading", "Heading", true),
      list("stats", "Stats", [
        text("display", "Value", { required: true, maxLength: 12, width: "half" }),
        text("label", "Label", { required: true, maxLength: 60, width: "half" }),
        text("sub", "Detail", { maxLength: 120 }),
      ], { itemLabel: "Stat", titleField: "label", maxItems: 6 }),
      longText("body", "Closing text", { maxLength: 600 }),
      link("cta", "Closing link"),
    ],
  },
  {
    type: "home.about",
    label: "Who we are",
    fields: [
      text("eyebrow", "Eyebrow", { maxLength: 80 }),
      heading("heading", "Heading", true),
      longText("body", "Text", { maxLength: 1200 }),
      list("steps", "Process steps", [text("title", "Title", { required: true, maxLength: 60 }), longText("body", "Text", { required: true, maxLength: 300 })], {
        itemLabel: "Step",
        titleField: "title",
        maxItems: 6,
      }),
    ],
  },
  {
    type: "home.services",
    label: "Service categories",
    description: "Lists the service categories (managed under Services → Categories).",
    fields: [heading("heading", "Heading", true), link("link", "Link"), text("popoverTitle", "Hover panel title", { maxLength: 60 })],
  },
  {
    type: "home.clients",
    label: "Client logos",
    fields: [
      heading("heading", "Heading", true),
      list("logos", "Logos", [
        text("name", "Client name", { required: true, maxLength: 60 }),
        image("logo", "Logo", { required: true }),
        { type: "number", name: "width", label: "Width (px)", integer: true, min: 8, max: 400, width: "half" },
        { type: "number", name: "height", label: "Height (px)", integer: true, min: 8, max: 200, width: "half" },
      ], { itemLabel: "Logo", titleField: "name", maxItems: 40 }),
    ],
  },
  {
    type: "home.faq",
    label: "FAQ",
    description: "Shows FAQs whose “Show on” includes Home (managed under FAQs).",
    fields: [text("eyebrow", "Eyebrow", { maxLength: 60 }), heading("heading", "Heading", true), text("moreText", "Footer text", { maxLength: 120 }), link("moreLink", "Footer link")],
  },
  {
    type: "home.cta",
    label: "Closing call to action",
    fields: [
      text("eyebrow", "Eyebrow", { maxLength: 60 }),
      heading("heading", "Heading", true),
      longText("body", "Text", { maxLength: 400 }),
      link("button", "Button"),
    ],
  },
];

export const sectionTypes: SectionTypeDef[] = [...genericSections, ...homeSections, ...siteSectionTypes];

export const systemPages: SystemPageDef[] = [
  {
    key: "home",
    path: "/",
    title: "Home",
    description: "The homepage.",
    sections: [
      { key: "hero", type: "home.hero", label: "Hero" },
      { key: "features", type: "home.features", label: "What we do" },
      { key: "work", type: "home.work", label: "Our work" },
      { key: "about", type: "home.about", label: "Who we are" },
      { key: "services", type: "home.services", label: "Service categories" },
      { key: "clients", type: "home.clients", label: "Client logos" },
      { key: "faq", type: "home.faq", label: "FAQ" },
      { key: "cta", type: "home.cta", label: "Closing call to action" },
    ],
  },
  ...sitePages,
];

export const sectionTypeByType = new Map(sectionTypes.map((s) => [s.type, s]));
export const systemPageByKey = new Map(systemPages.map((p) => [p.key, p]));

/** Paths a custom page may not take (built-in routes and app prefixes). */
export const RESERVED_PATHS = [
  "/",
  "/services",
  "/case-studies",
  "/projects",
  "/about",
  "/team",
  "/contact",
  "/blog",
  "/careers",
  "/book",
  "/404",
  "/landing",
  "/privacy",
  "/terms",
  "/api",
  "/uploads",
  "/admin",
];

export const pageFields: FieldDef[] = [
  text("title", "Page name", { required: true, maxLength: 120 }),
  text("seoTitle", "SEO title", { maxLength: 70, help: "Browser tab and search result title." }),
  longText("seoDescription", "SEO description", { maxLength: 200 }),
  image("ogImage", "Social sharing image"),
  bool("noindex", "Hide from search engines"),
];
