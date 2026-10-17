/** The three core services, in the order and wording used site-wide. */
export type CoreService = "AI Agents" | "AI Workflow Automation" | "Custom Software & Integrations";

/**
 * Projects portfolio, shown at /projects. A lighter gallery than case studies:
 * what was built, for which kind of client, and with what.
 *
 * Only list real work. Name a client only with permission (otherwise use a
 * descriptor), use screenshots only with the client's OK, and never show a
 * prospect's name or figures from a pitch. Prototypes are labelled as such.
 * While this list is empty the page shows a "coming soon" state and is kept
 * out of search.
 */

export const projectGroups = ["Operations & AI", "Trading & finance", "Platforms & admin", "Brand & commerce"] as const;
export type ProjectGroup = (typeof projectGroups)[number];

export interface Project {
  slug: string;
  title: string;
  /** Client name (with permission) or a descriptor, e.g. "D2C skincare brand". */
  client: string;
  /** Short category line, e.g. "Luxury property, Japan". */
  category: string;
  group: ProjectGroup;
  service: CoreService;
  /** Live: in production. In development: being built with the client. Prototype: working demo, not client production. */
  status: "Live" | "In development" | "Prototype";
  year?: string;
  /** One or two sentences on what was built and why. */
  summary: string;
  /** What was delivered, two or three short lines. */
  scope: string[];
  /** Short capability tags. */
  tags: string[];
  image?: { src: string; alt: string };
  /** Slug of a published case study in the CMS, when a full write-up exists. */
  caseStudySlug?: string;
  /** Public live URL, only if the client is happy for it to be linked. */
  url?: string;
}

export const projects: Project[] = [
  /* ── Operations & AI: working prototypes for a regional distribution business ── */
  {
    slug: "control-tower",
    title: "Control Tower",
    client: "Regional distribution business",
    category: "Operations console, AI dispatch",
    group: "Operations & AI",
    service: "AI Agents",
    status: "Prototype",
    summary:
      "An operations command centre: orders, trucks and exceptions on one screen, with an AI dispatcher that explains every assignment it makes.",
    scope: [
      "Live order pipeline, corridor map and event stream on one screen",
      "A dispatch agent that assigns loads and shows the alternatives it rejected",
      "Delay root-cause tracing across WhatsApp, ERP, weighbridge and vehicle tracking",
    ],
    tags: ["Autonomous dispatch", "Reasoning trace", "Exception queue"],
    image: { src: "/projects/control-tower.webp", alt: "Control Tower live ops screen with the order pipeline, corridor map and live event stream" },
  },
  {
    slug: "automation-studio",
    title: "Automation Studio",
    client: "Regional distribution business",
    category: "AI automation, low-code tooling",
    group: "Operations & AI",
    service: "AI Workflow Automation",
    status: "Prototype",
    summary:
      "Paste a messy WhatsApp order, even in Kinyarwanda, and watch it become an ERP-ready sales order. The node graph behind it can be opened, rewired and re-run.",
    scope: [
      "Free-text WhatsApp orders parsed into structured, priced sales orders",
      "A node graph composing LLM, ERP, payment and messaging steps",
      "Live execution with branch pruning, human approval gates and replay",
    ],
    tags: ["WhatsApp order capture", "Human approval gate", "Run history and replay"],
    image: { src: "/projects/automation-studio.webp", alt: "Automation Studio workflow builder turning a WhatsApp order into a verified sales order" },
  },
  {
    slug: "cloudops-console",
    title: "CloudOps Console",
    client: "Regional distribution business",
    category: "Cloud architecture, DevOps, SRE",
    group: "Operations & AI",
    service: "Custom Software & Integrations",
    status: "Prototype",
    summary:
      "How a logistics platform is built, hosted, secured, monitored and shipped, and where its data physically lives, made explorable for the client's IT team.",
    scope: [
      "Pipelines, canary rollout, guardrails and one-click rollback",
      "Incident response from alert through mitigation to postmortem",
      "Reference architecture, integration contracts, RBAC and data residency",
    ],
    tags: ["CI/CD pipelines", "Canary and rollback", "RBAC and residency"],
    image: { src: "/projects/cloudops.webp", alt: "CloudOps Console pipelines screen with workflow runs, build stages and logs" },
  },
  {
    slug: "driver-app",
    title: "Driver App",
    client: "Regional distribution business",
    category: "Mobile app, field operations",
    group: "Operations & AI",
    service: "Custom Software & Integrations",
    status: "Prototype",
    summary:
      "Driver, depot and customer in one handset, sharing one live state, so what one role does changes what the other two see.",
    scope: [
      "Weighbridge, proof of delivery, signature capture and mobile-money collection",
      "Offline-first queueing with conflict resolution on reconnect",
      "Customer ordering that lands straight in the depot yard",
    ],
    tags: ["Three linked roles", "Offline sync", "Signature capture"],
    image: { src: "/projects/driver-app.webp", alt: "Driver App field screen showing a driver's assigned load and trip steps" },
  },

  /* ── Trading & finance ── */
  {
    slug: "reconciliation-ai",
    title: "Reconciliation AI",
    client: "Regional distribution business",
    category: "Finance automation, AI matching",
    group: "Trading & finance",
    service: "AI Workflow Automation",
    status: "Prototype",
    summary:
      "Finds the gap between till revenue and recorded transactions, breaks it down by cause, matches what it can prove and routes the rest to a person.",
    scope: [
      "Three-way matching across ERP, bank feeds and tax receipts",
      "Confidence banding with an evidence panel and a human approval lane",
      "Month-end close tracking and a hash-chained, replayable audit ledger",
    ],
    tags: ["Gap decomposition", "Three-way matching", "Audit ledger"],
    image: { src: "/projects/reconciliation-ai.webp", alt: "Reconciliation AI summary screen breaking down the reconciliation gap by cause" },
  },
  {
    slug: "jmarkets",
    title: "JMarkets",
    client: "JMarkets",
    category: "CFD trading, Japan",
    group: "Trading & finance",
    service: "Custom Software & Integrations",
    status: "Live",
    summary: "A leveraged CFD trading platform covering markets, campaigns and client support, built for a Japanese audience.",
    scope: [
      "Leveraged CFD trading across market instruments",
      "Campaign and promotion management",
      "Client support tooling",
    ],
    tags: ["Trading", "Campaigns", "Client support"],
    image: { src: "/projects/jmarkets.webp", alt: "JMarkets trading platform home screen" },
    url: "https://jmarket-jet.vercel.app/",
  },
  {
    slug: "bitzaurus",
    title: "Bitzaurus",
    client: "Bitzaurus",
    category: "Social trading app",
    group: "Trading & finance",
    service: "Custom Software & Integrations",
    status: "In development",
    summary:
      "Invest in the news. Every headline becomes an index that opens at 100 cents, with the callers behind each move one tap away.",
    scope: [
      "Headline indexes that open at 100 cents and move with the story",
      "Callers, stories and a social feed, with one-tap copy trading",
      "Leverage from 1x to 10x with live liquidation pricing, in English and Japanese",
    ],
    tags: ["Trading", "Social", "EN / JA"],
    image: { src: "/projects/bitzaurus.webp", alt: "Bitzaurus app intro screen: Every headline is a trade" },
  },
  {
    slug: "society-super-app",
    title: "Society Super App",
    client: "Society",
    category: "DeFi super app",
    group: "Trading & finance",
    service: "AI Agents",
    status: "In development",
    summary:
      "Stake SOC, put assets to work through a natural-language DeFi agent and trade the news, all from one wallet in one app.",
    scope: [
      "Portal: SOC staking with voting power, epoch rewards and a discount pool",
      "Society AI: swaps, cross-chain moves and yield by chat, simulated before you sign",
      "Trade: news-driven markets, non-custodial, with every step signed by the user",
    ],
    tags: ["DeFi", "AI agent", "Web3"],
    image: { src: "/projects/society.webp", alt: "Society Super App dashboard with Portal, Society AI, Trade and Wallet tabs" },
  },

  /* ── Platforms & admin ── */
  {
    slug: "reverse",
    title: "Reverse",
    client: "Reverse",
    category: "Web3 gaming",
    group: "Platforms & admin",
    service: "Custom Software & Integrations",
    status: "In development",
    summary: "A crypto gacha and trading-card platform: a user app, a secondary marketplace and a full admin console behind it.",
    scope: [
      "Crypto gacha draws and trading-card collection",
      "A secondary marketplace for card trading",
      "A full admin console for operations",
    ],
    tags: ["Web3", "Marketplace", "Admin"],
  },

  /* ── Brand & commerce ── */
  {
    slug: "umito",
    title: "UMITO",
    client: "UMITO",
    category: "Luxury property, Japan",
    group: "Brand & commerce",
    service: "Custom Software & Integrations",
    status: "Live",
    summary: "Shared-ownership seaside villas and small luxury hotels, sold across Atami, Okinawa and Kamakura.",
    scope: [
      "A bilingual property portfolio covering locations on sale and in planning",
      "Brochure requests, online consultations and site-visit bookings",
      "A member portal and a full admin back-office",
    ],
    tags: ["Bilingual", "Lead capture", "Admin"],
    image: { src: "/projects/umito.webp", alt: "UMITO website home page" },
    url: "https://umito.jp/",
  },
  {
    slug: "arashiyama-takumi",
    title: "Arashiyama Takumi",
    client: "Arashiyama Takumi",
    category: "Experience commerce, Kyoto",
    group: "Brand & commerce",
    service: "Custom Software & Integrations",
    status: "Live",
    summary: "A premium cultural-experience venue site for Kyoto, with booking and scheduling for timed experiences.",
    scope: [
      "A premium venue site for cultural experiences in Arashiyama",
      "Booking and scheduling for timed experiences",
    ],
    tags: ["Booking", "Commerce"],
    image: { src: "/projects/takumi.webp", alt: "Arashiyama Takumi experience venue website" },
    url: "https://takumi-experience-arashiyama.jp/",
  },
  {
    slug: "twenty-cents",
    title: "Twenty Cents",
    client: "Twenty Cents",
    category: "Creative production studio, Japan",
    group: "Brand & commerce",
    service: "Custom Software & Integrations",
    status: "Live",
    summary: "The website for an integrated creative and production studio in Japan.",
    scope: ["An integrated creative and production studio site", "Built and delivered for a Japanese studio"],
    tags: ["Brand", "Creative"],
    image: { src: "/projects/twentycents.webp", alt: "Twenty Cents studio website" },
    url: "https://www.20cent-jp.com/",
  },
  {
    slug: "takeyani",
    title: "Takeyani",
    client: "Takeyani Co.",
    category: "Corporate brand site",
    group: "Brand & commerce",
    service: "Custom Software & Integrations",
    status: "Live",
    summary: "A bold corporate brand site built around the Future Nexus Forge identity.",
    scope: ["A corporate brand site built around the Future Nexus Forge identity"],
    tags: ["Brand", "Web"],
    image: { src: "/projects/takeyani.webp", alt: "Takeyani website hero reading Future Nexus Forge" },
    url: "https://takeyani.com/",
  },
  {
    slug: "nagamori",
    title: "Nagamori",
    client: "Nagamori",
    category: "Beauty brand",
    group: "Brand & commerce",
    service: "Custom Software & Integrations",
    status: "Live",
    summary: "An artmake beauty brand site covering the service range, schedule and appointment booking.",
    scope: ["A brand site covering the full artmake service range", "Schedule and booking for appointments"],
    tags: ["Brand", "Booking"],
    image: { src: "/projects/nagamori.webp", alt: "Nagamori artmake beauty website" },
    url: "https://www.nagamoriart-make.com/",
  },
];
