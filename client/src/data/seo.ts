import { services } from "./services";
import { serviceDefinitions } from "./serviceDefinitions";
import content from "../generated/content.json";
import type { CaseStudy } from "../content/types";

type CmsSeo = { seoTitle?: string | null; seoDescription?: string | null; ogImage?: string | null };
type CmsPage = CmsSeo & { path: string; noindex?: boolean };
type CmsBlogPost = CmsSeo & { slug: string; title: string; excerpt?: string | null; coverImage?: string | null };

const snapshot = content as unknown as {
  pages: Record<string, CmsPage>;
  collections: { caseStudies?: CaseStudy[]; projects?: { slug: string }[]; blogPosts?: CmsBlogPost[] };
};

/** Published content from the CMS snapshot the build bundles (scripts/fetch-content.mjs). */
const caseStudies = (snapshot.collections.caseStudies ?? []) as CaseStudy[];
const projects = snapshot.collections.projects ?? [];
const cmsPages = new Map(Object.values(snapshot.pages ?? {}).map((p) => [p.path, p]));

export const SITE_URL = "https://www.weseegpt.com";
export const SITE_NAME = "WeSee";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/landing/assets/og-image.png`;

export interface RouteMeta {
  title: string;
  description: string;
  /** Absolute or site-relative URL; falls back to the default share image. */
  image?: string;
  /** Path used for canonical/og:url. */
  path: string;
  noindex?: boolean;
}

const pages: Record<string, Omit<RouteMeta, "path">> = {
  "/": {
    title: "WeSee: AI Agents, Automation & Software",
    description:
      "WeSee designs, builds, and ships AI agents, automation, and custom software for ambitious businesses, from lead generation and marketing to internal operations. From Tokyo to Mumbai.",
  },
  "/services": {
    title: "Services: AI Agents, Automation, Marketing & Web | WeSee",
    description:
      "Explore 50+ WeSee services: AI agents and voice bots, workflow automation, performance marketing, SEO, web and e-commerce development, CRM, analytics and more.",
  },
  "/case-studies": {
    title: "Case Studies | WeSee: AI Agents, Automation & Custom Software",
    description:
      "See what WeSee has built: AI finance tools, cloud platforms, trading products and brand sites for clients in Japan and beyond.",
  },
  "/projects": {
    title: "Projects: AI Agents, Automations & Apps We Have Built | WeSee",
    description:
      "A portfolio of AI agents, workflow automations, apps and dashboards designed and shipped by WeSee, with the tools and platforms behind each one.",
  },
  "/about": {
    title: "About WeSee: AI & Engineering Studio, Tokyo to Mumbai",
    description:
      "Meet WeSee, a senior product, engineering and AI studio helping ambitious companies automate operations and grow, with teams in Tokyo and Mumbai.",
  },
  "/team": {
    title: "Our Team: The People Behind WeSee",
    description:
      "The engineers, designers, marketers and AI specialists at WeSee who design, build and ship software, automation and growth systems for our clients.",
  },
  "/contact": {
    title: "Contact WeSee: Talk to Our AI & Automation Team",
    description:
      "Get in touch with WeSee about AI agents, workflow automation, marketing or custom software. Tell us what you want to build and we will reply quickly.",
  },
  "/blog": {
    title: "Blog: AI, Automation & Growth Insights | WeSee",
    description:
      "Practical articles from WeSee on AI sales agents, chatbots, workflow automation and AI-driven paid advertising for growing businesses.",
  },
  "/careers": {
    title: "Careers at WeSee: Join Our AI & Engineering Studio",
    description:
      "Explore open roles at WeSee and help build AI agents, automation and software for ambitious companies. Teams in Tokyo and Mumbai.",
  },
  "/book": {
    title: "Book a Free Strategy Call | WeSee",
    description:
      "Book a free call with WeSee to map out how AI agents, automation and software can save time and grow your business. No obligation.",
  },
};

const blogPosts: Record<string, { title: string; description: string; image: string }> = {
  "ai-sales-agents-replacing-sdr-teams": {
    title: "How AI Sales Agents Are Replacing SDR Teams in 2025 | WeSee",
    description:
      "The traditional SDR model is breaking. AI sales agents can now qualify leads, book meetings, and follow up, at a fraction of the cost.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
  },
  "hidden-cost-manual-workflows": {
    title: "The Hidden Cost of Manual Workflows | WeSee",
    description:
      "Most businesses underestimate how much manual work costs them. We break down the real numbers and what automation can recover.",
    image: "/cost.jpg",
  },
  "meta-ads-2025-ai-optimization": {
    title: "Meta Ads in 2025: How AI Is Changing Paid Advertising | WeSee",
    description:
      "From Advantage+ campaigns to AI-generated creatives, the Meta ad platform is evolving fast. Here is how to optimise paid advertising with AI.",
    image: "/metaad.jpg",
  },
  "building-first-ai-chatbot-indian-smes": {
    title: "Building Your First AI Chatbot: A Guide for Indian SMEs | WeSee",
    description:
      "A practical, no-jargon guide to building and deploying your first AI chatbot for Indian businesses, from use case to WhatsApp rollout.",
    image: "/chatbot.jpg",
  },
};

// Articles come from the CMS; the hand-written entries above are only used when the snapshot has none.
const cmsPosts = snapshot.collections.blogPosts ?? [];
if (cmsPosts.length) for (const slug of Object.keys(blogPosts)) if (!cmsPosts.some((p) => p.slug === slug)) delete blogPosts[slug];
for (const post of cmsPosts) {
  blogPosts[post.slug] = {
    title: post.seoTitle || `${post.title} | WeSee`,
    description: post.seoDescription || post.excerpt || blogPosts[post.slug]?.description || "",
    image: post.ogImage || post.coverImage || blogPosts[post.slug]?.image || "",
  };
}

/** A built-in page's title and description, as set under Pages → SEO in the admin when filled in. */
function staticPageMeta(path: string): Omit<RouteMeta, "path"> {
  const cms = cmsPages.get(path);
  const base = pages[path];
  return {
    ...base,
    title: cms?.seoTitle || base.title,
    description: cms?.seoDescription || base.description,
    image: cms?.ogImage || base.image,
    noindex: cms?.noindex || undefined,
  };
}

export const notFoundMeta =(path: string): RouteMeta => ({
  title: "Page not found | WeSee",
  description: "The page you are looking for does not exist or has moved.",
  path,
  noindex: true,
});

function truncate(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—-]+$/, "") + "…";
}

export function absoluteUrl(urlOrPath: string): string {
  return /^https?:\/\//.test(urlOrPath)
    ? urlOrPath
    : `${SITE_URL}${urlOrPath.startsWith("/") ? "" : "/"}${urlOrPath}`;
}

export function getRouteMeta(rawPath: string): RouteMeta {
  const path = rawPath.split(/[?#]/)[0].replace(/\/+$/, "") || "/";

  // Collection pages stay out of search until they have approved entries.
  if (path === "/case-studies" && caseStudies.length === 0) return { ...staticPageMeta(path), path, noindex: true };
  if (path === "/projects" && projects.length === 0) return { ...staticPageMeta(path), path, noindex: true };
  if (pages[path]) return { ...staticPageMeta(path), path };

  const caseMatch = path.match(/^\/case-studies\/([^/]+)$/);
  if (caseMatch) {
    const cs = caseStudies.find((c) => c.slug === caseMatch[1]);
    if (cs) {
      return {
        title: cs.seoTitle || `${cs.title} | WeSee Case Study`,
        description: truncate(cs.seoDescription || cs.summary),
        image: cs.ogImage || cs.image?.src,
        path,
      };
    }
  }

  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const service = services.find((s) => s.slug === serviceMatch[1]);
    if (service) {
      return {
        title: service.seoTitle || `${service.name}: ${service.category} | WeSee`,
        description: truncate(service.seoDescription || service.definition || serviceDefinitions[service.slug] || service.shortDescription),
        path,
      };
    }
  }

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch && blogPosts[blogMatch[1]]) {
    return { ...blogPosts[blogMatch[1]], path };
  }

  return notFoundMeta(path);
}

/** Every indexable route, used by the build step to emit per-route HTML. */
export function getAllIndexableRoutes(): string[] {
  return [
    ...Object.keys(pages).filter(
      (p) => !(p === "/case-studies" && caseStudies.length === 0) && !(p === "/projects" && projects.length === 0),
    ),
    ...caseStudies.map((c) => `/case-studies/${c.slug}`),
    ...services.map((s) => `/services/${s.slug}`),
    ...Object.keys(blogPosts).map((s) => `/blog/${s}`),
  ];
}

export interface Crumb {
  name: string;
  path: string;
}

/** Breadcrumb trail for pages that show one. Used for both the visible nav and the JSON-LD. */
export function getBreadcrumbs(rawPath: string): Crumb[] | null {
  const path = rawPath.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const home: Crumb = { name: "Home", path: "/" };

  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const service = services.find((s) => s.slug === serviceMatch[1]);
    if (service) return [home, { name: "Services", path: "/services" }, { name: service.name, path }];
  }

  const caseMatch = path.match(/^\/case-studies\/([^/]+)$/);
  if (caseMatch) {
    const cs = caseStudies.find((c) => c.slug === caseMatch[1]);
    if (cs) return [home, { name: "Case Studies", path: "/case-studies" }, { name: cs.title, path }];
  }

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch && blogPosts[blogMatch[1]]) {
    const name = blogPosts[blogMatch[1]].title.replace(/ \| WeSee$/, "");
    return [home, { name: "Blog", path: "/blog" }, { name, path }];
  }

  return null;
}

// Mirrors the footer: Japan (HQ) and Mumbai (operations), and the same social links.
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "WeSee AI Automation",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/wesee.jpg`,
  description:
    "AI automation and engineering studio building custom AI agents, automation, web platforms, and software for ambitious companies.",
  sameAs: [
    "https://www.linkedin.com/company/wesee-agi",
    "https://www.instagram.com/weseeventures",
    "https://x.com/weseeventures",
  ],
  address: [
    { "@type": "PostalAddress", addressCountry: "JP" },
    { "@type": "PostalAddress", addressLocality: "Mumbai", addressCountry: "IN" },
  ],
};

/** JSON-LD objects for a route. Organization only on the home page; breadcrumbs only where shown. */
export function getStructuredData(rawPath: string): object[] {
  const path = rawPath.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const data: object[] = [];
  if (path === "/") data.push(organization);

  const crumbs = getBreadcrumbs(path);
  if (crumbs) {
    data.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: `${SITE_URL}${c.path}`,
      })),
    });
  }
  return data;
}

/** Sitemap entries: every indexable route plus the standalone static pages. */
export function getSitemapEntries(): { path: string; priority: number }[] {
  const priority = (p: string) => (p === "/" ? 1 : p.split("/").length > 2 ? (p.startsWith("/services") ? 0.6 : 0.5) : 0.8);
  return [
    ...getAllIndexableRoutes().map((path) => ({ path, priority: priority(path) })),
    { path: "/landing", priority: 0.5 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ];
}
