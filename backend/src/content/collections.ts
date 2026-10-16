import type { Prisma } from "@prisma/client";
import { bool, image, imageWithAlt, list, longText, markdown, object, select, strings, text, url, type FieldDef } from "./fields.js";

/**
 * Collections: repeatable content types, one Prisma model each.
 *
 * Every model has the same system columns (id, slug, status, publishedAt,
 * sortOrder, draft, timestamps, createdById, updatedById) plus one column per
 * field below, with the same name. tests/schema.test.ts checks that the two stay in sync.
 */

export const CORE_SERVICES = ["AI Agents", "AI Workflow Automation", "Custom Software & Integrations"] as const;

export type ModelName = Uncapitalize<Prisma.ModelName>;

export interface CollectionDef {
  key: string;
  model: ModelName;
  label: string;
  singular: string;
  description: string;
  /** Field shown as the item's name in lists. */
  titleField: string;
  subtitleField?: string;
  /** Publishable collections have draft/published states; the rest are always live. */
  publishable: boolean;
  /** Slug field generated from this field when left empty. Null when the collection has no URLs. */
  slugFrom: string | null;
  /** manual = drag to reorder; publishedAt = newest first. */
  ordering: "manual" | "publishedAt";
  fields: FieldDef[];
  /** Public URL for an item, for preview links and "view on site". */
  publicPath?: (item: Record<string, unknown>) => string;
  /** Extra columns shown in the admin list. */
  listColumns?: string[];
  /** Roles needed beyond the defaults, e.g. structural collections. */
  adminOnly?: boolean;
}

const seoFields: FieldDef[] = [
  text("seoTitle", "SEO title", { maxLength: 70, help: "Shown in search results and browser tabs. Defaults to the title." }),
  longText("seoDescription", "SEO description", { maxLength: 200, help: "Shown under the title in search results. Defaults to the summary." }),
  image("ogImage", "Social sharing image", { help: "1200×630 works best. Defaults to the cover image or the site default." }),
];

export const collections: CollectionDef[] = [
  {
    key: "projects",
    model: "project",
    label: "Projects",
    singular: "Project",
    description: "Portfolio entries on /projects.",
    titleField: "title",
    subtitleField: "client",
    publishable: true,
    slugFrom: "title",
    ordering: "manual",
    listColumns: ["group", "stage"],
    publicPath: () => "/projects",
    fields: [
      text("title", "Title", { required: true, maxLength: 120 }),
      text("client", "Client", { required: true, maxLength: 120, help: "Client name (with permission) or a descriptor, e.g. “D2C skincare brand”.", width: "half" }),
      text("category", "Category line", { required: true, maxLength: 160, help: "e.g. “Operations console, AI dispatch”.", width: "half" }),
      text("group", "Group", {
        required: true,
        maxLength: 60,
        suggestions: ["Operations & AI", "Trading & finance", "Platforms & admin", "Brand & commerce"],
        help: "Projects are grouped under this heading. Group order is set on the Projects page.",
        width: "half",
      }),
      select("service", "Service", CORE_SERVICES, { required: true, width: "half" }),
      select("stage", "Stage", ["Live", "In development", "Prototype"], {
        required: true,
        help: "Live: in production. In development: being built with the client. Prototype: working demo, not client production.",
        width: "half",
      }),
      text("year", "Year", { maxLength: 20, width: "half" }),
      longText("summary", "Summary", { required: true, maxLength: 600, help: "One or two sentences on what was built and why." }),
      strings("scope", "What was delivered", { itemLabel: "Line", maxItems: 6 }),
      strings("tags", "Capability tags", { itemLabel: "Tag", maxItems: 8, maxLength: 60 }),
      imageWithAlt("image", "Screenshot", { help: "Only with the client's OK." }),
      text("caseStudySlug", "Case study slug", { maxLength: 120, help: "Links the card to /case-studies/<slug> when a write-up exists.", width: "half" }),
      url("url", "Live URL", { help: "Only if the client is happy for it to be linked.", width: "half" }),
    ],
  },
  {
    key: "caseStudies",
    model: "caseStudy",
    label: "Case studies",
    singular: "Case study",
    description: "Full write-ups at /case-studies/<slug>. Only approved, substantiated stories.",
    titleField: "client",
    subtitleField: "sector",
    publishable: true,
    slugFrom: "client",
    ordering: "manual",
    listColumns: ["service"],
    publicPath: (i) => `/case-studies/${i.slug}`,
    fields: [
      text("client", "Client", { required: true, maxLength: 120, help: "Client name (with permission) or an anonymised descriptor." }),
      text("sector", "Sector", { required: true, maxLength: 120, width: "half" }),
      select("service", "Service", CORE_SERVICES, { required: true, width: "half" }),
      text("serviceSlug", "Related service slug", { maxLength: 120, help: "Used for the related-service link and to preselect the booking form.", width: "half" }),
      text("timeframe", "Timeframe", { maxLength: 80, width: "half" }),
      longText("summary", "Summary", { required: true, maxLength: 400, help: "One sentence for cards and the page description." }),
      strings("challenge", "Challenge", { itemLabel: "Paragraph", maxLength: 2000 }),
      strings("solution", "Solution", { itemLabel: "Paragraph", maxLength: 2000 }),
      strings("implementation", "Implementation", { itemLabel: "Paragraph", maxLength: 2000 }),
      list(
        "results",
        "Results",
        [
          text("metric", "Metric", { required: true, maxLength: 120, width: "half" }),
          text("value", "Value", { required: true, maxLength: 80, help: "e.g. “4 hours → 2 minutes”.", width: "half" }),
          text("period", "Period", { maxLength: 120, width: "half" }),
          text("method", "How it was measured", { maxLength: 200, width: "half" }),
          select("note", "Note", ["Estimate", "Client-reported"]),
        ],
        { itemLabel: "Result", titleField: "metric" },
      ),
      object("quote", "Client quote", [
        longText("text", "Quote", { required: true, maxLength: 600 }),
        text("name", "Name", { required: true, maxLength: 120, width: "half" }),
        text("role", "Role", { maxLength: 120, width: "half" }),
      ], { help: "Approved quotes only." }),
      imageWithAlt("image", "Image", { caption: true }),
      ...seoFields,
    ],
  },
  {
    key: "blogPosts",
    model: "blogPost",
    label: "Blog",
    singular: "Article",
    description: "Articles at /blog and /blog/<slug>. Schedule by publishing with a future date.",
    titleField: "title",
    subtitleField: "category",
    publishable: true,
    slugFrom: "title",
    ordering: "publishedAt",
    listColumns: ["category", "featured"],
    publicPath: (i) => `/blog/${i.slug}`,
    fields: [
      text("title", "Title", { required: true, maxLength: 160 }),
      longText("excerpt", "Excerpt", { required: true, maxLength: 400, help: "Shown on cards and under the title." }),
      text("category", "Category", { required: true, maxLength: 60, suggestions: ["AI Agents", "Workflow Automation", "Performance Marketing"], width: "half" }),
      { type: "reference", name: "authorId", label: "Author", collection: "authors", width: "half" },
      strings("tags", "Tags", { itemLabel: "Tag", maxItems: 10, maxLength: 40 }),
      image("coverImage", "Cover image", { required: true }),
      text("coverAlt", "Cover alt text", { maxLength: 300, help: "Leave empty if the image is decorative." }),
      bool("featured", "Feature at the top of the blog", { help: "The newest featured article is shown large." }),
      text("question", "Body heading", { maxLength: 200, help: "Heading above the article body, phrased as the reader's question." }),
      text("quote", "Pull quote", { maxLength: 300, help: "A line from the article, shown as the closing pull quote." }),
      markdown("body", "Article body", {
        required: true,
        help: "Markdown: blank line between paragraphs, ## for headings, - for lists, **bold**, *italic*, [links](https://…). HTML is not rendered.",
      }),
      ...seoFields,
    ],
  },
  {
    key: "authors",
    model: "author",
    label: "Authors",
    singular: "Author",
    description: "Blog authors.",
    titleField: "name",
    subtitleField: "role",
    publishable: false,
    slugFrom: "name",
    ordering: "manual",
    fields: [
      text("name", "Name", { required: true, maxLength: 120, width: "half" }),
      text("role", "Role", { maxLength: 120, width: "half" }),
      image("avatar", "Photo"),
      longText("bio", "Bio", { maxLength: 1000 }),
    ],
  },
  {
    key: "faqs",
    model: "faq",
    label: "FAQs",
    singular: "FAQ",
    description: "Questions and answers. Choose where each one appears; drag to reorder.",
    titleField: "question",
    subtitleField: "topic",
    publishable: true,
    slugFrom: null,
    ordering: "manual",
    listColumns: ["topic", "placements"],
    publicPath: () => "/#home-faq-title",
    fields: [
      text("question", "Question", { required: true, maxLength: 300 }),
      longText("answer", "Answer", { required: true, maxLength: 3000, help: "Plain text, shown in full on the page." }),
      text("topic", "Topic", { required: true, maxLength: 60, suggestions: ["General", "Process & pricing", "Tools & industries"], help: "Questions are filtered by topic. Topic order follows question order.", width: "half" }),
      { type: "multiselect", name: "placements", label: "Show on", options: ["home"], width: "half", help: "Where this question appears." },
    ],
  },
  {
    key: "jobs",
    model: "job",
    label: "Careers",
    singular: "Job opening",
    description: "Openings listed on /careers.",
    titleField: "title",
    subtitleField: "team",
    publishable: true,
    slugFrom: "title",
    ordering: "manual",
    listColumns: ["team", "employmentType", "location"],
    publicPath: () => "/careers",
    fields: [
      text("title", "Job title", { required: true, maxLength: 120 }),
      text("team", "Team", { required: true, maxLength: 60, suggestions: ["Engineering", "Marketing", "Content"], help: "Teams and their descriptions are set on the Careers page.", width: "half" }),
      select("employmentType", "Type", ["Full time", "Part time", "Internship", "Contract"], { required: true, width: "half" }),
      text("location", "Location", { required: true, maxLength: 120, width: "half" }),
      url("applyUrl", "Application link", { help: "Defaults to an email to the HR address in Settings → Contact.", width: "half" }),
      strings("skills", "Skills", { itemLabel: "Skill", maxItems: 12, maxLength: 60 }),
      longText("intro", "Introduction", { required: true, maxLength: 2000 }),
      strings("responsibilities", "The role", { itemLabel: "Responsibility" }),
      strings("requirements", "Requirements", { itemLabel: "Requirement" }),
      strings("bonus", "Bonus points", { itemLabel: "Item" }),
      longText("closing", "Closing line", { maxLength: 600 }),
    ],
  },
  {
    key: "services",
    model: "service",
    label: "Services",
    singular: "Service",
    description: "The service catalogue at /services and each /services/<slug> page.",
    titleField: "name",
    subtitleField: "categoryNumber",
    publishable: true,
    slugFrom: "name",
    ordering: "manual",
    listColumns: ["categoryNumber", "stage", "engagementSize"],
    publicPath: (i) => `/services/${i.slug}`,
    fields: [
      text("name", "Name", { required: true, maxLength: 120 }),
      { type: "number", name: "number", label: "Service number", required: true, integer: true, min: 1, help: "Stable ID used for default imagery. Must be unique.", width: "half" },
      { type: "reference", name: "categoryNumber", label: "Category", collection: "serviceCategories", valueField: "number", required: true, width: "half" },
      longText("shortDescription", "Short description", { required: true, maxLength: 600 }),
      longText("definition", "One-sentence definition", { maxLength: 400, help: "Plain-language definition near the top of the service page." }),
      longText("fullDescription", "Full description", { required: true, maxLength: 5000 }),
      longText("benefits", "Benefits", { maxLength: 3000 }),
      strings("automationPoints", "What gets automated", { itemLabel: "Point" }),
      strings("deliverables", "Deliverables", { itemLabel: "Deliverable" }),
      strings("industries", "Industries", { itemLabel: "Industry", maxLength: 80 }),
      text("serviceType", "Service type", { maxLength: 120, width: "half" }),
      select("stage", "Status badge", ["Live", "In Progress", "Case Study"], { required: true, width: "half" }),
      select("engagementSize", "Engagement size", ["Starter", "Growth", "Enterprise"], { required: true, width: "half" }),
      image("image", "Image override", { help: "Leave empty to use the default artwork.", width: "half" }),
      list("faqs", "FAQs", [text("question", "Question", { required: true, maxLength: 300 }), longText("answer", "Answer", { required: true, maxLength: 3000 })], {
        itemLabel: "FAQ",
        titleField: "question",
        help: "Leave empty to use the default questions.",
      }),
      object("growthComparisonChart", "Growth chart", [
        text("title", "Title", { required: true, maxLength: 160 }),
        longText("description", "Description", { maxLength: 600 }),
        text("beforeLabel", "Before label", { maxLength: 40, width: "half" }),
        text("afterLabel", "After label", { maxLength: 40, width: "half" }),
        list("rows", "Rows", [
          text("label", "Label", { required: true, maxLength: 80 }),
          { type: "number", name: "before", label: "Before", required: true, min: 0, width: "half" },
          { type: "number", name: "after", label: "After", required: true, min: 0, width: "half" },
        ], { itemLabel: "Row", titleField: "label", maxItems: 8 }),
      ], { help: "Leave empty to use the default chart." }),
      strings("relatedServiceSlugs", "Related services (slugs)", { itemLabel: "Slug", maxItems: 6, help: "Shown in order, up to 3. Defaults to the same category." }),
      ...seoFields,
    ],
  },
  {
    key: "serviceCategories",
    model: "serviceCategory",
    label: "Service categories",
    singular: "Service category",
    description: "Groups for the service catalogue, shown on the homepage and services page.",
    titleField: "name",
    publishable: false,
    slugFrom: null,
    ordering: "manual",
    adminOnly: true,
    fields: [
      text("name", "Name", { required: true, maxLength: 120 }),
      { type: "number", name: "number", label: "Category number", required: true, integer: true, min: 1, help: "Used in /services?category=<number> links. Must be unique.", width: "half" },
      select("icon", "Icon", ["bot", "workflow", "target", "search", "mail", "palette", "shopping-cart", "trending-up", "settings", "database", "cloud", "shield", "code", "sparkles"], { required: true, width: "half" }),
      longText("summary", "Summary", { required: true, maxLength: 400 }),
    ],
  },
  {
    key: "teamMembers",
    model: "teamMember",
    label: "Team",
    singular: "Team member",
    description: "People on /team.",
    titleField: "name",
    subtitleField: "title",
    publishable: true,
    slugFrom: null,
    ordering: "manual",
    listColumns: ["group"],
    publicPath: () => "/team",
    fields: [
      text("name", "Name", { required: true, maxLength: 120, width: "half" }),
      text("title", "Job title", { required: true, maxLength: 120, width: "half" }),
      select("group", "Group", ["Leadership", "Team"], { required: true, help: "Leadership shows with a bio; Team shows in the moving strip.", width: "half" }),
      image("photo", "Photo", { width: "half" }),
      longText("bio", "Bio", { maxLength: 1500 }),
      url("linkedin", "LinkedIn", { width: "half" }),
      url("twitter", "X / Twitter", { width: "half" }),
    ],
  },
];

export const collectionByKey = new Map(collections.map((c) => [c.key, c]));

export function getCollection(key: string): CollectionDef | undefined {
  return collectionByKey.get(key);
}
