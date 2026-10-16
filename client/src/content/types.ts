/** Shapes of the public CMS content (backend/src/routes/public.ts). */

type Meta = { slug: string; publishedAt: string | null; updatedAt: string };

export type Link = { href: string; label: string };

export type Faq = Meta & {
  question: string;
  answer: string;
  topic: string;
  placements: string[];
};

export type Job = Meta & {
  title: string;
  team: string;
  employmentType: "Full time" | "Part time" | "Internship" | "Contract";
  location: string;
  applyUrl: string | null;
  skills: string[];
  intro: string;
  responsibilities: string[];
  requirements: string[];
  bonus: string[];
  closing: string;
};

export type TeamMember = Meta & {
  name: string;
  title: string;
  group: string;
  photo: string | null;
  bio: string | null;
  linkedin: string | null;
  twitter: string | null;
};

/** A paragraph or list item with an optional bold lead-in. */
export type Point = { lead: string | null; text: string };

export type CaseStudy = Meta & {
  title: string;
  category: string;
  tags: string[];
  summary: string;
  image: { src: string; alt: string; caption?: string | null } | null;
  headline: string;
  lede: string;
  client: string;
  sector: string;
  region: string | null;
  service: string;
  timeframe: string | null;
  team: string | null;
  tech: string[];
  overview: string[];
  challenge: Point[];
  solution: Point[];
  features: Point[];
  delivery: Point[];
  results: { value: string; metric: string; period: string | null; method: string | null; note: string | null }[];
  quote: { text: string; name: string; role: string | null; company: string | null } | null;
  cta: { heading: string; body: string | null; buttonLabel: string; buttonUrl: string } | null;
  serviceSlug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
};

export type Author = Meta & { name: string; role: string | null; avatar: string | null; bio: string | null };

export type Collections = {
  faqs: Faq[];
  jobs: Job[];
  teamMembers: TeamMember[];
  authors: Author[];
  // Typed as they are wired into pages.
  caseStudies: CaseStudy[];
  projects: (Meta & Record<string, unknown>)[];
  blogPosts: (Meta & Record<string, unknown>)[];
  serviceCategories: (Meta & Record<string, unknown>)[];
};

export type Section = { key: string; type: string; content: Record<string, unknown> };

export type Page = {
  key: string;
  kind: "SYSTEM" | "CUSTOM";
  path: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noindex: boolean;
  updatedAt: string;
  sections: Section[];
};

export type Settings = {
  site: Record<string, unknown>;
  navigation: Record<string, unknown>;
  footer: Record<string, unknown>;
  contact: {
    email: string | null;
    careersEmail: string | null;
    hrEmail: string | null;
    phone: string | null;
    whatsappPhone: string | null;
    whatsappMessage: string | null;
    offices: { label: string; country: string; locality: string | null; countryCode: string }[];
  };
  social: Record<string, unknown>;
  announcement: Record<string, unknown>;
  appearance: Record<string, unknown>;
};

export type ContentSnapshot = {
  version: number;
  generatedAt: string;
  settings: Settings;
  pages: Record<string, Page>;
  collections: Collections;
};
