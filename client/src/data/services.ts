import bundledContent from "../generated/content.json";
import bundledServices from "../generated/services.json";

/** Optional impact metrics on service detail: headline outcomes with before/after context. */
export interface ServiceGrowthComparisonChart {
  title: string;
  description?: string;
  beforeLabel?: string;
  afterLabel?: string;
  rows: { label: string; before: number; after: number }[];
}

export interface Service {
  id: number;
  slug: string;
  name: string;
  category: string;
  categoryId: number;
  shortDescription: string;
  /** One-sentence plain-language definition shown near the top of the service page. */
  definition?: string;
  fullDescription: string;
  benefits: string;
  automationPoints: string[];
  deliverables: string[];
  industries: string[];
  serviceType: string;
  status: "Live" | "In Progress" | "Case Study";
  engagementSize: "Starter" | "Growth" | "Enterprise";
  /** Optional per-service FAQs; when omitted, ServiceDetail uses sensible defaults. */
  faqs?: { question: string; answer: string }[];
  /** Optional override for the growth chart; defaults to `defaultServiceGrowthComparisonChart`. */
  growthComparisonChart?: ServiceGrowthComparisonChart;
  /** When set, Related services section shows these slugs in order (max 3 shown). Otherwise same-category services are used. */
  relatedServiceSlugs?: string[];
  /** Search result title and description set in the admin; seo.ts falls back to generated ones. */
  seoTitle?: string;
  seoDescription?: string;
}

/** Shown on every service detail page unless a service sets `growthComparisonChart`. */
export const defaultServiceGrowthComparisonChart: ServiceGrowthComparisonChart = {
  title: "Business growth over six months",
  description:
    "The kind of momentum teams often see within six months. Your outcome depends on your market, timing, and how we execute together.",
  beforeLabel: "Before",
  afterLabel: "After 6 Months",
  rows: [
    { label: "Repeat Purchase Rate", before: 17.5, after: 42.5 },
    { label: "Customer Lifetime Value Increase", before: 0, after: 32.5 },
    { label: "Referral-driven Customers", before: 0, after: 20 },
    { label: "Churn Recovery", before: 0, after: 15 },
    { label: "Program Engagement", before: 0, after: 50 },
  ],
};

export interface Category {
  id: number;
  name: string;
  summary: string;
  icon: string;
}

/** A service as the CMS publishes it (backend/src/content/collections.ts, "services"). */
export interface CmsService {
  slug: string;
  name: string;
  number: number;
  categoryNumber: number;
  shortDescription: string;
  definition?: string | null;
  fullDescription: string;
  benefits?: string | null;
  automationPoints?: string[];
  deliverables?: string[];
  industries?: string[];
  serviceType?: string | null;
  stage: string;
  engagementSize: string;
  faqs?: { question: string; answer: string }[] | null;
  growthComparisonChart?: ServiceGrowthComparisonChart | null;
  relatedServiceSlugs?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
}

/** A service category as the CMS publishes it ("serviceCategories"). */
export interface CmsServiceCategory {
  name: string;
  number: number;
  icon: string;
  summary: string;
}

export function toCategories(rows: CmsServiceCategory[]): Category[] {
  return [...rows].sort((a, b) => a.number - b.number).map((c) => ({ id: c.number, name: c.name, summary: c.summary, icon: c.icon }));
}

export function toServices(rows: CmsService[], cats: Category[]): Service[] {
  const categoryName = new Map(cats.map((c) => [c.id, c.name]));
  return [...rows]
    .sort((a, b) => a.number - b.number)
    .map((s) => ({
      id: s.number,
      slug: s.slug,
      name: s.name,
      category: categoryName.get(s.categoryNumber) ?? "",
      categoryId: s.categoryNumber,
      shortDescription: s.shortDescription,
      definition: s.definition ?? undefined,
      fullDescription: s.fullDescription,
      benefits: s.benefits ?? "",
      automationPoints: s.automationPoints ?? [],
      deliverables: s.deliverables ?? [],
      industries: s.industries ?? [],
      serviceType: s.serviceType ?? "",
      status: s.stage as Service["status"],
      engagementSize: s.engagementSize as Service["engagementSize"],
      faqs: s.faqs?.length ? s.faqs : undefined,
      growthComparisonChart: s.growthComparisonChart ?? undefined,
      relatedServiceSlugs: s.relatedServiceSlugs?.length ? s.relatedServiceSlugs : undefined,
      seoTitle: s.seoTitle ?? undefined,
      seoDescription: s.seoDescription ?? undefined,
    }));
}

// The catalogue as published in the CMS when the site was built (scripts/fetch-content.mjs).
// Pages read the live version through useServices() / useServiceCategories() (./useServices.ts),
// so an edit in the admin shows without a rebuild; these are the build-time copies used for
// prerendering (seo.ts) and as the first paint.
export const categories: Category[] = toCategories(
  ((bundledContent as unknown as { collections: { serviceCategories?: CmsServiceCategory[] } }).collections.serviceCategories ?? []),
);

export const services: Service[] = toServices(bundledServices as unknown as CmsService[], categories);

export const serviceTypes = [
  "AI Agents", "Workflow Automation", "Paid Ads", "SEO", "Content",
  "Messaging", "Web / Design", "E-Commerce", "Sales / CRM", "Analytics", "Cloud", "HR / Ops"
];

export const industryFilters = [
  "Healthcare", "Real Estate", "E-Commerce", "Education", "Finance",
  "F&B / Hospitality", "SaaS / Tech", "Manufacturing", "Government",
  "Legal", "Logistics", "Retail", "Beauty / Wellness"
];

export const statusFilters = ["Live", "In Progress", "Case Study"];
export const engagementFilters = ["Starter", "Growth", "Enterprise"];
