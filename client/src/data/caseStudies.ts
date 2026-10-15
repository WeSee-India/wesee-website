/**
 * Case studies, shown at /case-studies and /case-studies/:slug.
 *
 * Only add entries that are approved and substantiated: client name only with
 * permission (otherwise an anonymised descriptor), and every result with its
 * baseline, period and how it was measured. No placeholder or invented stories,
 * logos, quotes or numbers. While this list is empty the index page shows a
 * "coming soon" state and is kept out of search (noindex, not in the sitemap).
 */

/** The three core services, in the order and wording used site-wide. */
export type CoreService = "AI Agents" | "AI Workflow Automation" | "Custom Software & Integrations";

export interface CaseStudyResult {
  /** e.g. "Average first response time" */
  metric: string;
  /** e.g. "4 hours → 2 minutes" */
  value: string;
  /** e.g. "First 90 days after launch" */
  period?: string;
  /** How it was measured, e.g. "Helpdesk reports" */
  method?: string;
  /** Mark estimates or client-reported figures as such. */
  note?: "Estimate" | "Client-reported";
}

export interface CaseStudy {
  slug: string;
  /** Client name (with permission) or an anonymised descriptor, e.g. "A Mumbai real-estate developer". */
  client: string;
  sector: string;
  service: CoreService;
  /** Service page slug from services.ts, used for the "related service" link and to preselect the booking form. */
  serviceSlug?: string;
  timeframe?: string;
  /** One sentence for cards and the page description. */
  summary: string;
  /** What was not working, who was affected, constraints. */
  challenge: string[];
  /** What WeSee designed and built, and WeSee's role. */
  solution: string[];
  /** Systems, integrations, channels and human controls. No confidential details. */
  implementation: string[];
  results: CaseStudyResult[];
  /** Approved quote only. */
  quote?: { text: string; name: string; role: string };
  image?: { src: string; alt: string; caption?: string };
}

export const caseStudies: CaseStudy[] = [];
