import { services } from "./services";

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
    title: "WeSee — AI Agents, Automation & Software",
    description:
      "WeSee designs, builds, and ships AI agents, automation, and custom software for ambitious businesses — from lead generation and marketing to internal operations. From Tokyo to Mumbai.",
  },
  "/services": {
    title: "Services — AI Agents, Automation, Marketing & Web | WeSee",
    description:
      "Explore 50+ WeSee services: AI agents and voice bots, workflow automation, performance marketing, SEO, web and e-commerce development, CRM, analytics and more.",
  },
  "/about": {
    title: "About WeSee — AI & Engineering Studio, Tokyo to Mumbai",
    description:
      "Meet WeSee, a senior product, engineering and AI studio helping ambitious companies automate operations and grow, with teams in Tokyo and Mumbai.",
  },
  "/team": {
    title: "Our Team — The People Behind WeSee",
    description:
      "The engineers, designers, marketers and AI specialists at WeSee who design, build and ship software, automation and growth systems for our clients.",
  },
  "/contact": {
    title: "Contact WeSee — Talk to Our AI & Automation Team",
    description:
      "Get in touch with WeSee about AI agents, workflow automation, marketing or custom software. Tell us what you want to build and we will reply quickly.",
  },
  "/blog": {
    title: "Blog — AI, Automation & Growth Insights | WeSee",
    description:
      "Practical articles from WeSee on AI sales agents, chatbots, workflow automation and AI-driven paid advertising for growing businesses.",
  },
  "/careers": {
    title: "Careers at WeSee — Join Our AI & Engineering Studio",
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
      "The traditional SDR model is breaking. AI sales agents can now qualify leads, book meetings, and follow up — at a fraction of the cost.",
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

export const notFoundMeta = (path: string): RouteMeta => ({
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

  if (pages[path]) return { ...pages[path], path };

  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const service = services.find((s) => s.slug === serviceMatch[1]);
    if (service) {
      return {
        title: `${service.name} — ${service.category} | WeSee`,
        description: truncate(service.shortDescription),
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
    ...Object.keys(pages),
    ...services.map((s) => `/services/${s.slug}`),
    ...Object.keys(blogPosts).map((s) => `/blog/${s}`),
  ];
}
