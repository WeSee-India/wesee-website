import { image, imageWithAlt, link, list, longText, object, strings, text, url, type FieldDef } from "./fields.js";
import type { SectionTypeDef, SystemPageDef } from "./pageTypes.js";

/** Section types and layouts for the built-in pages other than Home. */

const HIGHLIGHT_HELP = "Wrap words in *asterisks* to show them in the gold highlight style.";
const heading = (name = "heading", label = "Heading", required = false): FieldDef => text(name, label, { maxLength: 200, help: HIGHLIGHT_HELP, required });
const paragraphs = (name: string, label: string) => strings(name, label, { itemLabel: "Paragraph", maxLength: 3000 });
const titled = (extra: FieldDef[] = []) => [text("title", "Title", { required: true, maxLength: 80 }), longText("description", "Text", { maxLength: 500 }), ...extra];

export const siteSectionTypes: SectionTypeDef[] = [
  // About
  { type: "about.hero", label: "Hero", fields: [text("badge", "Badge", { maxLength: 60 }), heading("heading", "Heading", true), longText("body", "Text", { maxLength: 600 })] },
  { type: "about.mission", label: "Mission", fields: [heading("heading", "Heading", true), paragraphs("paragraphs", "Paragraphs")] },
  { type: "about.image", label: "Team photo", fields: [imageWithAlt("image", "Image", { required: true })] },
  {
    type: "about.timeline",
    label: "Timeline",
    fields: [heading("heading", "Heading", true), list("milestones", "Milestones", [text("year", "Year", { required: true, maxLength: 10 }), ...titled()], { itemLabel: "Milestone", titleField: "title", maxItems: 12 })],
  },
  {
    type: "about.stats",
    label: "Impact stats",
    fields: [
      heading("heading", "Heading", true),
      text("subheading", "Subheading", { maxLength: 200 }),
      list("stats", "Stats", [text("value", "Value", { required: true, maxLength: 10, help: "Numbers animate. Use a trailing + or K, e.g. 35+ or 15K+.", width: "half" }), text("label", "Label", { required: true, maxLength: 60, width: "half" }), image("image", "Background image")], {
        itemLabel: "Stat",
        titleField: "label",
        maxItems: 6,
      }),
    ],
  },
  { type: "about.values", label: "Values", fields: [heading("heading", "Heading", true), list("items", "Values", titled(), { itemLabel: "Value", titleField: "title", maxItems: 8 })] },

  // Team
  {
    type: "team.hero",
    label: "Hero",
    fields: [
      heading("heading", "Heading", true),
      longText("body", "Text", { maxLength: 500 }),
      text("disciplines", "Small caps line", { maxLength: 120 }),
      list("collage", "Photo collage", [image("src", "Image", { required: true }), text("alt", "Alt text", { maxLength: 200 }), text("position", "Focus point", { maxLength: 30, help: "CSS object-position, e.g. center 40%." })], {
        itemLabel: "Photo",
        titleField: "alt",
        maxItems: 4,
      }),
    ],
  },
  { type: "team.leadership", label: "Leadership", description: "Shows team members in the Leadership group.", fields: [heading("heading", "Heading", true)] },
  { type: "team.marquee", label: "Team strip", description: "Shows team members in the Team group.", fields: [text("eyebrow", "Eyebrow", { maxLength: 80 }), heading("heading", "Heading", true), longText("body", "Text", { maxLength: 500 })] },
  { type: "team.cta", label: "Join us link", fields: [link("button", "Button", { required: true })] },

  // Careers
  { type: "careers.hero", label: "Hero", fields: [text("kicker", "Kicker", { maxLength: 60 }), heading("heading", "Heading", true), image("image", "Background image")] },
  {
    type: "careers.teams",
    label: "Teams",
    description: "Open-role counts come from Careers.",
    fields: [
      heading("heading", "Heading", true),
      longText("body", "Text", { maxLength: 400 }),
      list("teams", "Teams", [text("name", "Team name", { required: true, maxLength: 60, help: "Must match the Team on job openings." }), longText("blurb", "Description", { maxLength: 300 })], { itemLabel: "Team", titleField: "name", maxItems: 8 }),
      text("openTitle", "Open application title", { maxLength: 60 }),
      text("openLabel", "Open application label", { maxLength: 60 }),
      longText("openBody", "Open application text", { maxLength: 300 }),
    ],
  },
  { type: "careers.roles", label: "Open roles", description: "Lists published job openings.", fields: [heading("heading", "Heading", true), text("emptyText", "Empty-state text", { maxLength: 200 })] },
  {
    type: "careers.apply",
    label: "How to apply",
    fields: [
      text("kicker", "Kicker", { maxLength: 60 }),
      heading("heading", "Heading", true),
      list("steps", "Steps", titled(), { itemLabel: "Step", titleField: "title", maxItems: 5, help: "{email} is replaced with the HR email from Settings → Contact." }),
    ],
  },

  // Blog
  { type: "blog.hero", label: "Hero", fields: [heading("heading", "Heading", true), longText("subheading", "Subheading", { maxLength: 300 })] },
  { type: "blog.articleCta", label: "Article call to action", description: "Shown beside every article.", fields: [text("title", "Title", { maxLength: 120 }), longText("body", "Text", { maxLength: 300 }), link("button", "Button")] },

  // Projects
  {
    type: "projects.cover",
    label: "Cover",
    fields: [
      text("eyebrow", "Eyebrow", { maxLength: 60, help: HIGHLIGHT_HELP }),
      heading("heading", "Heading", true),
      longText("summary", "Summary", { maxLength: 500 }),
      image("coverImage", "Cover image"),
      strings("groupOrder", "Group order", { itemLabel: "Group", help: "Project groups in display order. Groups not listed come after, alphabetically." }),
    ],
  },
  { type: "projects.empty", label: "Coming-soon panel", description: "Shown while no projects are published.", fields: [text("title", "Title", { maxLength: 120 }), longText("body", "Text", { maxLength: 500 })] },

  // Case studies
  { type: "caseStudies.header", label: "Header", fields: [text("eyebrow", "Eyebrow", { maxLength: 60 }), heading("heading", "Heading", true), longText("body", "Intro", { maxLength: 800 }), longText("subline", "Sub-line", { maxLength: 300 })] },
  { type: "caseStudies.empty", label: "Coming-soon panel", description: "Shown while no case studies are published.", fields: [text("title", "Title", { maxLength: 120 }), longText("body", "Text", { maxLength: 500 })] },
  {
    type: "caseStudies.next",
    label: "Case study page",
    description: "Shared parts of every case study page.",
    fields: [
      heading("heading", "“More case studies” heading", true),
      text("footerLine", "Footer line", { maxLength: 160 }),
      text("footerEmail", "Footer email", { maxLength: 120 }),
    ],
  },

  // Services
  { type: "services.ring", label: "Ring heading", fields: [heading("heading", "Heading", true)] },
  {
    type: "services.detail",
    label: "Service page template",
    description: "Shared copy on every /services/<slug> page. {service} is replaced with the service name.",
    fields: [
      text("deliveryHeading", "Delivery heading", { maxLength: 120 }),
      paragraphs("deliveryParagraphs", "Delivery paragraphs"),
      text("ctaKicker", "CTA kicker", { maxLength: 60 }),
      heading("ctaHeading", "CTA heading"),
      longText("ctaBody", "CTA text", { maxLength: 300 }),
      text("ctaButton", "CTA button label", { maxLength: 60 }),
      object("defaultChart", "Default growth chart", [
        text("title", "Title", { required: true, maxLength: 160 }),
        longText("description", "Description", { maxLength: 600 }),
        text("beforeLabel", "Before label", { maxLength: 40, width: "half" }),
        text("afterLabel", "After label", { maxLength: 40, width: "half" }),
        list("rows", "Rows", [
          text("label", "Label", { required: true, maxLength: 80 }),
          { type: "number", name: "before", label: "Before", required: true, min: 0, width: "half" },
          { type: "number", name: "after", label: "After", required: true, min: 0, width: "half" },
        ], { itemLabel: "Row", titleField: "label", maxItems: 8 }),
      ], { help: "Used when a service has no chart of its own." }),
      list("defaultFaqs", "Default FAQs", [text("question", "Question", { required: true, maxLength: 300 }), longText("answer", "Answer", { required: true, maxLength: 3000 })], {
        itemLabel: "FAQ",
        titleField: "question",
        help: "Used when a service has no FAQs of its own.",
      }),
    ],
  },

  // Contact
  { type: "contact.hero", label: "Hero", fields: [heading("heading", "Heading", true), image("bannerImage", "Banner image"), image("closingImage", "Closing image")] },
  {
    type: "contact.cards",
    label: "Contact cards",
    fields: [
      list("cards", "Cards", [text("label", "Label", { required: true, maxLength: 60, width: "half" }), text("email", "Email", { required: true, maxLength: 120, width: "half" }), text("person", "Person", { maxLength: 80, width: "half" }), text("title", "Person's title", { maxLength: 80, width: "half" }), image("photo", "Photo")], {
        itemLabel: "Card",
        titleField: "label",
        maxItems: 4,
      }),
    ],
  },
  {
    type: "contact.offices",
    label: "Offices",
    fields: [
      heading("heading", "Heading", true),
      list("offices", "Offices", [
        text("city", "City", { required: true, maxLength: 60, width: "half" }),
        text("country", "Country", { required: true, maxLength: 60, width: "half" }),
        text("role", "Role", { maxLength: 60, width: "half" }),
        text("phone", "Phone", { maxLength: 40, width: "half" }),
        longText("address", "Address", { maxLength: 300 }),
        url("mapUrl", "Map link"),
      ], { itemLabel: "Office", titleField: "city", maxItems: 8 }),
    ],
  },
  {
    type: "contact.connect",
    label: "Quick chat",
    description: "Shown when a WhatsApp number is set in Settings → Contact. The same copy is used by the floating widget.",
    fields: [heading("heading", "Heading"), text("subheading", "Subheading", { maxLength: 200 }), text("message", "Greeting bubble", { maxLength: 200 }), text("footnote", "Footnote", { maxLength: 200 })],
  },

  // Book a call
  { type: "book.header", label: "Header", fields: [heading("heading", "Heading", true), longText("body", "Text", { maxLength: 500 })] },
  { type: "book.expect", label: "What to expect", fields: [text("kicker", "Kicker", { maxLength: 60 }), strings("items", "Checklist", { itemLabel: "Item", maxItems: 8 })] },
  { type: "book.info", label: "Info card", fields: [strings("chips", "Chips", { itemLabel: "Chip", maxItems: 4, maxLength: 40 }), text("email", "Email", { maxLength: 120, help: "Shown as “Prefer email instead?” and in form error messages." })] },
  { type: "book.form", label: "Form heading", fields: [text("kicker", "Kicker", { maxLength: 60 }), text("heading", "Heading", { maxLength: 120 })] },
];

const s = (key: string, type: string, label: string) => ({ key, type, label });

export const sitePages: SystemPageDef[] = [
  {
    key: "about",
    path: "/about",
    title: "About",
    description: "The company story, timeline, impact and values.",
    sections: [s("hero", "about.hero", "Hero"), s("mission", "about.mission", "Mission"), s("image", "about.image", "Team photo"), s("timeline", "about.timeline", "Timeline"), s("stats", "about.stats", "Impact stats"), s("values", "about.values", "Values")],
  },
  {
    key: "team",
    path: "/team",
    title: "Team",
    description: "Leadership and the people behind WeSee.",
    sections: [s("hero", "team.hero", "Hero"), s("leadership", "team.leadership", "Leadership"), s("marquee", "team.marquee", "Team strip"), s("cta", "team.cta", "Join us link")],
  },
  {
    key: "careers",
    path: "/careers",
    title: "Careers",
    description: "Teams, open roles and how to apply.",
    sections: [s("hero", "careers.hero", "Hero"), s("teams", "careers.teams", "Teams"), s("roles", "careers.roles", "Open roles"), s("apply", "careers.apply", "How to apply")],
  },
  { key: "blog", path: "/blog", title: "Blog", description: "The blog index and article template.", sections: [s("hero", "blog.hero", "Hero"), s("articleCta", "blog.articleCta", "Article call to action")] },
  { key: "projects", path: "/projects", title: "Projects", description: "The project portfolio.", sections: [s("cover", "projects.cover", "Cover"), s("empty", "projects.empty", "Coming-soon panel")] },
  {
    key: "case-studies",
    path: "/case-studies",
    title: "Case studies",
    description: "The case study index and detail template.",
    sections: [s("header", "caseStudies.header", "Header"), s("empty", "caseStudies.empty", "Coming-soon panel"), s("next", "caseStudies.next", "Case study page")],
  },
  { key: "services", path: "/services", title: "Services", description: "The service catalogue and service page template.", sections: [s("ring", "services.ring", "Ring heading"), s("detail", "services.detail", "Service page template")] },
  {
    key: "contact",
    path: "/contact",
    title: "Contact",
    description: "Contact cards, offices and quick chat.",
    sections: [s("hero", "contact.hero", "Hero"), s("cards", "contact.cards", "Contact cards"), s("offices", "contact.offices", "Offices"), s("connect", "contact.connect", "Quick chat")],
  },
  { key: "book", path: "/book", title: "Book a call", description: "The discovery call booking page.", sections: [s("header", "book.header", "Header"), s("expect", "book.expect", "What to expect"), s("info", "book.info", "Info card"), s("form", "book.form", "Form heading")] },
];
