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
}

/** Shown on every service detail page unless a service sets `growthComparisonChart`. */
export const defaultServiceGrowthComparisonChart: ServiceGrowthComparisonChart = {
  title: "Business growth over six months",
  description:
    "The kind of momentum teams often see within six months—your outcome depends on your market, timing, and how we execute together.",
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

export const categories: Category[] = [
  { id: 1, name: "AI Agents & Conversational AI", summary: "AI-powered agents that talk, think, and act on behalf of businesses — handling sales, support, appointments, and calls 24/7.", icon: "bot" },
  { id: 2, name: "Workflow & Business Process Automation", summary: "Connect your existing tools and eliminate manual work using n8n, Zapier, Make, and custom code.", icon: "workflow" },
  { id: 3, name: "Performance Marketing & Paid Advertising", summary: "ROI-driven advertising across Meta, Google, YouTube, LinkedIn — every rupee tracked and optimized.", icon: "target" },
  { id: 4, name: "SEO, Content & Organic Growth", summary: "Long-term organic visibility through technical SEO, content strategy, and authority building.", icon: "search" },
  { id: 5, name: "Messaging, Email & Communication", summary: "Automated multi-channel communication via WhatsApp, email, SMS, and push notifications.", icon: "mail" },
  { id: 6, name: "Web Design, Branding & Creative", summary: "High-converting websites, brand identities, and video content designed for performance.", icon: "palette" },
  { id: 7, name: "E-Commerce & Marketplace Growth", summary: "Full-stack e-commerce solutions from store setup to marketplace management and optimization.", icon: "shopping-cart" },
  { id: 8, name: "Sales, CRM & Revenue Operations", summary: "Systems that capture, nurture, convert, and retain customers — engineered for revenue.", icon: "trending-up" },
  { id: 9, name: "Business Operations & Infrastructure", summary: "Cloud infrastructure, analytics dashboards, HR automation, and operational excellence.", icon: "settings" },
];

export const services: Service[] = [
  // Category 1 — AI Agents & Conversational AI
  {
    id: 1,
    slug: "ai-sales-agent",
    name: "AI Sales Agent",
    category: "AI Agents & Conversational AI",
    categoryId: 1,
  
    shortDescription:
      "Autonomous AI sales rep across WhatsApp, web chat, and voice calls.",
  
    fullDescription:
      "A fully autonomous AI-powered sales representative that engages every inbound lead instantly — across WhatsApp, your website chat, and even phone calls — qualifying them, handling objections, sharing product information, and booking meetings or pushing orders. Every prospect gets a response in under 3 seconds, 24/7, ensuring no lead is lost due to delays. Your human sales team only interacts with prospects who are already qualified and ready to buy.",
  
    benefits:
      "Most businesses lose 40–60% of inbound leads due to slow response times. An AI Sales Agent responds in under 3 seconds across every channel, ensuring every lead is engaged immediately, qualification happens automatically, and your sales team focuses only on high-intent prospects ready to convert.",
  
    automationPoints: [
      "Instant lead response across all channels",
      "Automated lead qualification based on custom criteria",
      "Smart follow-up and re-engagement sequences",
      "Seamless handoff to human sales reps with full context",
      "Automatic CRM updates with lead data and conversation history"
    ],
  
    deliverables: [
      "WhatsApp AI sales bot with Business API integration",
      "Website chatbot widget for lead capture and booking",
      "Voice AI agent for inbound and outbound calls",
      "Custom lead scoring and qualification logic",
      "CRM integration (HubSpot, Zoho, Salesforce, etc.)",
      "Analytics dashboard with conversion and performance metrics"
    ],
  
    industries: [
      "Real Estate",
      "Healthcare",
      "Education",
      "E-Commerce",
      "SaaS",
      "Financial Services"
    ],
  
    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 2, slug: "ai-customer-support-bot", name: "AI Customer Support Bot", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "An intelligent support agent that handles customer queries, resolves common issues, processes returns, tracks orders, and escalates complex problems — all through chat or voice. Trained on your knowledge base, FAQs, and product documentation, it gives accurate, consistent answers every time. Your human support team only deals with genuinely complex issues — saving hours daily and dramatically improving customer satisfaction.",
    fullDescription: "An intelligent support agent that handles customer queries, resolves common issues, processes returns, tracks orders, and escalates complex problems — all through chat or voice. Trained on your knowledge base, FAQs, and product documentation, it gives accurate, consistent answers every time. Your human support team only deals with genuinely complex issues — saving hours daily and dramatically improving customer satisfaction.",
    benefits: "Resolve 60–80% of support tickets instantly while reducing response time from hours to seconds. Slash support costs, improve customer satisfaction, and free your team to focus on high-value interactions instead of repetitive queries.",
    automationPoints: [
      "Instant resolution of common queries",
      "Multi-channel support (WhatsApp, website, Instagram, email)",
      "Smart escalation to human agents with context",
      "Self-learning from past conversations",
      "Full conversation logging and reporting"
    ],

    deliverables: [
      "Multi-channel support bot deployment",
      "Knowledge base training (FAQs, SOPs, docs)",
      "Ticket escalation workflows",
      "Order tracking integration",
      "Helpdesk integration (Zendesk, Freshdesk, etc.)",
      "Sentiment detection setup",
      "Performance analytics dashboard"
    ],

    industries: [
      "E-Commerce",
      "SaaS",
      "Healthcare",
      "Telecom",
      "Banking"
    ],

    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 3,
    slug: "ai-receptionist", name: "AI Receptionist & Scheduler", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "A virtual receptionist that greets customers, answers FAQs about your business, and books appointments directly into your calendar — via WhatsApp, phone, or web chat. It ensures every enquiry is handled instantly without wait times or missed calls.",
    fullDescription: "A virtual receptionist that greets customers, answers FAQs about your business, and books appointments directly into your calendar — via WhatsApp, phone, or web chat. It ensures every enquiry is handled instantly without wait times or missed calls.",
    benefits: "Ensure zero missed appointments and provide a consistent, professional first impression for every customer interaction — without relying on manual staff availability.",
    automationPoints: [
      "Instant appointment booking",
      "Automated confirmations and reminders",
      "Pre-appointment intake collection",
      "Waitlist and rescheduling handling",
      "Multi-channel communication (phone, chat, WhatsApp)"
    ],

    deliverables: [
      "AI receptionist bot",
      "Calendar integration",
      "Automated reminders",
      "Pre-visit questionnaire setup",
      "Analytics dashboard"
    ],

    industries: [
      "Healthcare",
      "Salons & Spas",
      "Legal Firms",
      "Fitness",
      "Real Estate",
      "Education"
    ],

    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 4,
    slug: "internal-ai-assistant", name: "Internal AI Assistant", category: "AI Agents & Conversational AI", categoryId: 1,


    shortDescription: "An AI-powered internal helpdesk that answers employee questions about policies, leave, IT troubleshooting, onboarding, and more — trained on your documents and SOPs. It provides instant, consistent answers across your organization.",
    fullDescription: "An AI-powered internal helpdesk that answers employee questions about policies, leave, IT troubleshooting, onboarding, and more — trained on your documents and SOPs. It provides instant, consistent answers across your organization.",
    benefits: "Reduce dependency on HR and IT teams for repetitive queries, speed up onboarding, and ensure every employee gets accurate information instantly.",
    automationPoints: [
      "Instant answers to company policies",
      "Automated IT troubleshooting guidance",
      "Guided employee onboarding",
      "Leave and HR query handling via chat",
      "Document retrieval from internal knowledge base"
    ],

    deliverables: [
      "AI assistant trained on company documents",
      "Slack / Teams integration",
      "IT support workflows",
      "Onboarding automation setup",
      "Admin dashboard"
    ],

    industries: [
      "SaaS / Tech",
      "Manufacturing",
      "Enterprises",
      "Agencies",
      "Professional Services"
    ],

    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Enterprise"
  },
  {
    id: 5,
    slug: "voice-ai-ivr",
    name: "Voice AI & IVR Automation",
    category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "AI-powered voice agents that handle inbound and outbound phone calls — from customer service to sales follow-ups — with natural, human-like conversations. It replaces traditional IVR systems with intelligent interaction.",
    fullDescription:
      "AI-powered voice agents that handle inbound and outbound phone calls — from customer service to sales follow-ups — with natural, human-like conversations. It replaces traditional IVR systems with intelligent interaction.",

    benefits:
      "Handle large call volumes without wait times, automate repetitive conversations, and capture every interaction with complete data tracking.",

    automationPoints: [
      "24/7 automated call answering",
      "Intelligent call routing",
      "Outbound reminder and follow-up calls",
      "Full call transcription",
      "Multilingual voice interaction"
    ],

    deliverables: [
      "Voice AI deployment",
      "Custom IVR flow design",
      "Call transcription dashboard",
      "CRM integration",
      "Call recording and compliance setup"
    ],

    industries: [
      "Healthcare",
      "Insurance",
      "Real Estate",
      "Banking",
      "Logistics",
      "Government"
    ],

    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Enterprise"
  },
  // Category 2 — Workflow & Business Process Automation
  {
    id: 6,
    slug: "no-code-workflow", name: "No-Code Workflow Automation", category: "Workflow & Business Process Automation", categoryId: 2,
    shortDescription: "Custom automated workflows that connect your business tools and make them work together without manual intervention. When one action happens, multiple processes are triggered automatically across systems.",
    fullDescription: "Custom automated workflows that connect your business tools and make them work together without manual intervention. When one action happens, multiple processes are triggered automatically across systems.",
    benefits: "Eliminate repetitive manual work, reduce human errors, and save significant operational time while improving efficiency across teams.",
    automationPoints: [
      "Automated multi-step workflows",
      "Real-time data synchronization",
      "Error-free execution of processes",
      "Instant notifications and alerts",
      "Scalable system automation"
    ],

    deliverables: [
      "Workflow audit and mapping",
      "n8n / Zapier / Make setup",
      "Multi-tool integrations",
      "Error handling systems",
      "Documentation and team training"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Starter"

  },
  {
    category: "Workflow & Business Process Automation", categoryId: 2,
    id: 7,
    slug: "document-invoice-automation",
    name: "Document & Invoice Automation",
    shortDescription: "Automated systems that generate proposals, invoices, contracts, and reports from templates — pulling data directly from your CRM or forms and sending them automatically without manual intervention.",
    fullDescription: "Automated systems that generate proposals, invoices, contracts, and reports from templates — pulling data directly from your CRM or forms and sending them automatically without manual intervention.",
    benefits: "Get paid faster, eliminate manual errors, and ensure every document is sent on time with a complete audit trail for compliance and tracking.",
    automationPoints: [
      "Auto-generation of documents from triggers",
      "Zero manual data entry",
      "Multi-channel delivery (email/WhatsApp)",
      "Payment tracking and reminders",
      "Complete audit trail logging"
    ],

    deliverables: [
      "Template design setup",
      "CRM-triggered workflows",
      "Email and WhatsApp delivery system",
      "Payment gateway integration",
      "Automated overdue reminders"
    ],

    industries: [
      "Professional Services",
      "Agencies",
      "Freelancers",
      "E-Commerce",
      "Manufacturing"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Starter"

  },
  {
    category: "Workflow & Business Process Automation", categoryId: 2,
    id: 8,
    slug: "lead-routing",
    name: "Smart Lead Routing & Assignment",
    shortDescription: "Intelligent systems that automatically distribute incoming leads to the right salesperson based on geography, language, product interest, deal size, or availability — ensuring every lead is handled efficiently.",
    fullDescription:
      "Intelligent systems that automatically distribute incoming leads to the right salesperson based on geography, language, product interest, deal size, or availability — ensuring every lead is handled efficiently.",

    benefits:
      "Improve response time, ensure fair distribution across teams, and significantly increase conversion rates by assigning leads instantly to the right person.",

    automationPoints: [
      "Instant lead assignment",
      "Rule-based routing logic",
      "Round-robin distribution",
      "Auto-escalation for missed leads",
      "Real-time performance tracking"
    ],

    deliverables: [
      "Routing logic design",
      "CRM integration setup",
      "Real-time notifications",
      "Escalation workflows",
      "Response time dashboard"
    ],

    industries: [
      "Real Estate",
      "Insurance",
      "Education",
      "Automotive",
      "SaaS"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Growth"

  },
  {
    id: 9,
    slug: "erp-integration",
    name: "ERP & Multi-Tool Integration",
    category: "Workflow & Business Process Automation",
    categoryId: 2,

    shortDescription:
      "Connect ERP, CRM, e-commerce, and accounting tools for seamless real-time data flow.",

    fullDescription:
      "Custom integrations connecting ERPs (Tally, SAP, Oracle), CRMs, e-commerce platforms, accounting tools, and communication apps — ensuring seamless, real-time data synchronization across systems.",

    benefits:
      "Eliminate duplicate data entry, maintain a single source of truth, and automate reconciliation between all business systems.",

    automationPoints: [
      "Real-time data synchronization",
      "Elimination of duplicate data entry",
      "Centralized data system",
      "Automated reconciliation processes",
      "Custom API integrations"
    ],

    deliverables: [
      "Integration architecture design",
      "API development and setup",
      "Real-time sync implementation",
      "Error handling and alert systems",
      "Technical documentation"
    ],

    industries: [
      "Manufacturing",
      "Retail",
      "E-Commerce",
      "Logistics",
      "Healthcare"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Enterprise"
  },
  {
    id: 10,
    slug: "notification-systems",
    name: "Notification & Alert Systems",
    category: "Workflow & Business Process Automation",
    categoryId: 2,

    shortDescription:
      "Real-time alerts for critical business events across WhatsApp, Slack, SMS, email, and more.",

    fullDescription:
      "Smart notification engines that monitor business events and instantly alert the right people through WhatsApp, Slack, SMS, email, or push notifications — ensuring nothing important is missed.",

    benefits:
      "Catch issues instantly, improve team accountability, and respond to critical events before they become bigger problems.",

    automationPoints: [
      "Real-time event monitoring",
      "Multi-channel alert delivery",
      "Escalation chains for missed alerts",
      "Custom trigger thresholds",
      "Daily/weekly summary reports"
    ],

    deliverables: [
      "Alert system setup",
      "Channel integrations (WhatsApp, Slack, etc.)",
      "Escalation workflow design",
      "Custom trigger configuration",
      "Monitoring dashboard"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Starter"
  },
  // Category 3 — Performance Marketing
  {
    id: 11,
    slug: "meta-ads",
    name: "Meta Ads (Facebook + Instagram)",
    category: "Performance Marketing & Paid Advertising",
    categoryId: 3,

    shortDescription:
      "Full-funnel Meta advertising campaigns optimized for conversions and ROI.",

    fullDescription:
      "Full-funnel advertising on Facebook and Instagram — covering awareness, consideration, and conversion stages — with strategy, audience research, creative production, A/B testing, and continuous optimization.",

    benefits:
      "Maximize ROI with structured campaigns that guide users from discovery to purchase — ensuring every rupee spent contributes to measurable results.",

    automationPoints: [
      "Audience segmentation and targeting",
      "Creative A/B testing",
      "Retargeting automation",
      "Budget allocation optimization",
      "Performance tracking and reporting"
    ],

    deliverables: [
      "Campaign strategy and funnel design",
      "Ad creative production",
      "Audience research",
      "Pixel and tracking setup",
      "Monthly performance reports"
    ],

    industries: [
      "E-Commerce",
      "Real Estate",
      "Education",
      "Healthcare",
      "F&B"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 12,
    slug: "google-ads",
    name: "Google Ads (Search + Display + YouTube)",
    category: "Performance Marketing & Paid Advertising",
    categoryId: 3,

    shortDescription:
      "Capture high-intent users actively searching for your products or services.",

    fullDescription:
      "Search, Display, Shopping, and YouTube campaigns targeting high-intent users who are actively searching for your products or services — ensuring visibility at the moment of intent.",

    benefits:
      "Capture demand exactly when users are ready to take action — driving high-quality traffic and maximizing conversion potential.",

    automationPoints: [
      "Keyword research and bidding automation",
      "Ad copy optimization",
      "Quality Score improvement",
      "Conversion tracking setup",
      "Automated campaign rules"
    ],

    deliverables: [
      "Campaign architecture setup",
      "Keyword strategy",
      "Ad copy and extensions",
      "Tracking and conversion setup",
      "Performance dashboard"
    ],

    industries: [
      "SaaS",
      "Healthcare",
      "Education",
      "Legal",
      "E-Commerce"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 13,
    slug: "linkedin-ads",
    name: "LinkedIn B2B Campaigns",
    category: "Performance Marketing & Paid Advertising",
    categoryId: 3,

    shortDescription:
      "Target decision-makers by role, company, and industry for high-quality B2B leads.",

    fullDescription:
      "B2B advertising on LinkedIn targeting decision-makers by job title, company size, industry, and seniority — ideal for lead generation, brand awareness, and thought leadership campaigns.",

    benefits:
      "Reach the exact professionals who influence purchasing decisions and generate highly qualified B2B leads.",

    automationPoints: [
      "Account-based targeting",
      "Lead generation forms",
      "Retargeting campaigns",
      "Content promotion",
      "InMail automation"
    ],

    deliverables: [
      "Campaign strategy",
      "Audience targeting setup",
      "Ad creative development",
      "Lead generation forms",
      "Analytics and reporting"
    ],

    industries: [
      "SaaS",
      "Professional Services",
      "Finance",
      "Manufacturing",
      "Education"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 14,
    slug: "programmatic-ads",
    name: "Programmatic & Display Advertising",
    category: "Performance Marketing & Paid Advertising",
    categoryId: 3,

    shortDescription:
      "Automated ad buying across premium websites, apps, and connected TV.",

    fullDescription:
      "Automated ad buying across premium publisher networks, mobile apps, and connected TV — using real-time bidding and data-driven audience targeting to reach users at scale.",

    benefits:
      "Expand reach across thousands of platforms with precise targeting and optimized media buying.",

    automationPoints: [
      "Real-time bidding automation",
      "Audience segmentation",
      "Cross-device targeting",
      "Frequency capping",
      "Viewability optimization"
    ],

    deliverables: [
      "Media planning",
      "Creative production",
      "Campaign setup",
      "Brand safety controls",
      "Performance reporting"
    ],

    industries: [
      "FMCG",
      "Automotive",
      "Finance",
      "Real Estate",
      "E-Commerce"
    ],

    serviceType: "Paid Ads",
    status: "In Progress",
    engagementSize: "Enterprise"
  },
  {
    id: 15,
    slug: "retargeting",
    name: "Retargeting & Programmatic",
    category: "Performance Marketing & Paid Advertising",
    categoryId: 3,

    shortDescription:
      "Re-engage website visitors and bring them back to convert.",

    fullDescription:
      "Cross-platform retargeting campaigns that re-engage website visitors, cart abandoners, and past customers with personalized ads across multiple channels.",

    benefits:
      "Recover lost conversions by targeting users who already showed interest — significantly improving conversion rates.",

    automationPoints: [
      "Pixel-based retargeting",
      "Dynamic product ads",
      "Sequential messaging",
      "Cross-platform synchronization",
      "Frequency management"
    ],

    deliverables: [
      "Retargeting strategy",
      "Audience segmentation",
      "Dynamic creative setup",
      "Cross-platform campaign setup",
      "ROI tracking dashboard"
    ],

    industries: [
      "E-Commerce",
      "SaaS",
      "Education",
      "Real Estate",
      "Travel"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Starter"
  },
  // Category 4 — SEO, Content & Organic Growth
  {
    id: 16,
    slug: "technical-seo",
    name: "Technical SEO & Site Optimization",
    category: "SEO, Content & Organic Growth",
    categoryId: 4,

    shortDescription:
      "Fix technical issues that prevent your website from ranking on search engines.",

    fullDescription:
      "We fix the technical issues on your website that quietly hurt your rankings — things like slow load times, broken links, missing tags, and crawl errors. These aren't minor problems. They're often why competitors rank higher, even when your content is better. And we don't just point them out — we fix them, test everything, and keep monitoring so issues don't come back.",

    benefits:
      "Most websites quietly lose traffic because of simple technical issues like slow pages, broken links, and crawl errors. We fix these so you stop missing out on easy rankings and start building traffic that grows over time. Unlike ads, this isn't temporary — a strong technical foundation helps every page perform better and keeps working long-term. Since most businesses ignore these basics, fixing them gives you a clear edge over competitors. It also makes your site more stable and less affected by Google updates, so your rankings don't suddenly drop.",

    automationPoints: [],

    deliverables: [
      "Discovery & crawl analysis — Full-site crawl (Screaming Frog, Ahrefs, Search Console) to surface broken links, redirect chains, thin content, and crawl traps — prioritised by impact.",
      "Speed & performance audit — Benchmark Core Web Vitals on mobile and desktop; flag render-blocking assets, heavy images, and slow responses; produce a fix list ordered by effort vs. impact.",
      "Prioritised action plan — A short, plain-English roadmap: what to fix first, rough cost, and expected traffic impact — no jargon or bloated PDFs.",
      "Implementation — We ship the fixes in your stack or alongside your devs: speed work, schema, meta, sitemap & robots, internal links, redirect cleanup, mobile hardening, and security basics.",
      "Validation & submission — Re-crawl to confirm fixes, resubmit sitemaps, request re-indexing for key URLs, and verify Core Web Vitals in Google’s tools.",
      "Ongoing monitoring — Monthly automated crawl checks plus a concise report: site health, rank movement, and any new actions needed."
    ],

    growthComparisonChart: {
      title: "Business growth over six months",
      description:
        "Example gains in visibility, speed, and coverage—your results depend on where you start and what we prioritize first.",
      beforeLabel: "Before",
      afterLabel: "After 6 Months",
      rows: [
        { label: "Organic traffic (index)", before: 42, after: 72 },
        { label: "Mobile speed score", before: 35, after: 90 },
        { label: "Core Web Vitals pass rate", before: 28, after: 95 },
        { label: "Indexed pages (% of site)", before: 52, after: 96 },
        { label: "Crawl health score", before: 32, after: 92 },
        { label: "Rich results coverage", before: 5, after: 82 },
      ],
    },

    faqs: [
      {
        question: "How is this different from content SEO or link building?",
        answer:
          "Technical SEO is the foundation. Content and links build the house. If the foundation is broken — slow site, crawl errors, missing schema — even the best content won't rank. We fix the foundation first; then content and links become two to three times more effective.",
      },
      {
        question: "How long before I see results?",
        answer:
          "Technical fixes often show impact within 2–6 weeks as Google re-crawls and re-indexes your site. Significant traffic gains typically appear within 3–6 months. Unlike paid ads, these gains are durable — they don't stop when the budget runs out.",
      },
      {
        question: "Do I need this if my site is new?",
        answer:
          "Especially if your site is new. Getting the technical foundation right from the start means every blog post, landing page, and product you add can rank faster. It's far cheaper to build it right than to fix it later.",
      },
      {
        question: "Will you work with my existing dev team?",
        answer:
          "Absolutely. We can implement fixes directly if we have access, or provide a developer-ready action plan with exact changes, file-by-file notes, and priority levels. We've worked with in-house teams, freelance developers, and agencies.",
      },
      {
        question: "What tools do you use?",
        answer:
          "Google Search Console, Screaming Frog, Ahrefs, PageSpeed Insights, GTmetrix, Lighthouse, Schema.org Validator, and custom crawl scripts. We use real data, not guesswork.",
      },
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "SEO",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 17,
    slug: "content-seo",
    name: "Content Strategy & SEO Writing",
    category: "SEO, Content & Organic Growth",
    categoryId: 4,

    shortDescription:
      "Keyword-driven content strategy and SEO writing that ranks and converts.",

    fullDescription:
      "Keyword research, content planning, and SEO-optimized article writing that helps your website rank on Google and convert readers into leads or customers.",

    benefits:
      "Build a long-term organic traffic engine that compounds over time and consistently brings in qualified leads.",

    automationPoints: [
      "Keyword research automation",
      "Content calendar planning",
      "SEO-optimized writing",
      "Internal linking strategy",
      "Performance tracking"
    ],

    deliverables: [
      "Keyword strategy",
      "Content calendar",
      "SEO articles",
      "Internal linking plan",
      "Monthly performance reports"
    ],

    industries: [
      "SaaS",
      "Healthcare",
      "Education",
      "Finance",
      "E-Commerce"
    ],

    serviceType: "Content",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 18,
    slug: "local-seo",
    name: "Local SEO & Google Business Profile",
    category: "SEO, Content & Organic Growth",
    categoryId: 4,

    shortDescription:
      "Rank on Google Maps and local search results to drive nearby customers.",

    fullDescription:
      "Optimization of your Google Business Profile, local citations, and reviews — helping your business appear in local search results and Google Maps for your service area.",

    benefits:
      "Drive more local visibility, calls, and footfall by appearing when nearby customers search for your services.",

    automationPoints: [
      "Google Business Profile optimization",
      "Review management",
      "Citation building",
      "Local content optimization",
      "Rank tracking"
    ],

    deliverables: [
      "GBP setup and optimization",
      "Citation audit and setup",
      "Review management strategy",
      "Local content plan",
      "Monthly reports"
    ],

    industries: [
      "Healthcare",
      "Restaurants",
      "Salons",
      "Legal",
      "Retail",
      "Real Estate"
    ],

    serviceType: "SEO",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 19,
    slug: "social-media-management",
    name: "Social Media Management",
    category: "SEO, Content & Organic Growth",
    categoryId: 4,

    shortDescription:
      "End-to-end social media content, scheduling, and engagement management.",

    fullDescription:
      "Complete social media management including content creation, scheduling, community engagement, and analytics across platforms like Instagram, LinkedIn, Facebook, and Twitter.",

    benefits:
      "Build a consistent and engaging brand presence that increases visibility, trust, and organic traffic.",

    automationPoints: [
      "Content scheduling",
      "Community engagement",
      "Performance analytics tracking",
      "Trend monitoring",
      "Hashtag optimization"
    ],

    deliverables: [
      "Content calendar",
      "Post creation",
      "Community management",
      "Monthly analytics reports",
      "Strategy reviews"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Content",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 20,
    slug: "video-content",
    name: "Video Content & YouTube SEO",
    category: "SEO, Content & Organic Growth",
    categoryId: 4,

    shortDescription:
      "Video production and YouTube optimization for growth and engagement.",

    fullDescription:
      "Video content strategy, production, editing, and YouTube SEO optimization — helping you build a strong video presence that drives traffic and authority.",

    benefits:
      "Leverage high-engagement video content to grow your audience and build long-term visibility.",

    automationPoints: [
      "Content planning",
      "YouTube SEO optimization",
      "Thumbnail testing",
      "Analytics tracking",
      "Content distribution automation"
    ],

    deliverables: [
      "Video strategy",
      "Script writing",
      "Production and editing",
      "YouTube SEO setup",
      "Analytics dashboard"
    ],

    industries: [
      "Education",
      "SaaS",
      "Healthcare",
      "E-Commerce",
      "Personal Brands"
    ],

    serviceType: "Content",
    status: "In Progress",
    engagementSize: "Growth"
  },
  // Category 5 — Messaging & Communication
  {
    id: 21,
    slug: "whatsapp-business",
    name: "WhatsApp Business API Automation",
    category: "Messaging, Email & Communication",
    categoryId: 5,

    shortDescription:
      "Automated messaging, campaigns, and customer communication via WhatsApp.",

    fullDescription:
      "Complete WhatsApp Business API setup including broadcast campaigns, drip sequences, order notifications, customer support automation, and interactive catalogs.",

    benefits:
      "Reach customers on a platform with extremely high open rates and drive engagement through direct, personalized communication.",

    automationPoints: [
      "Broadcast messaging campaigns",
      "Drip sequence automation",
      "Order notifications",
      "Interactive product catalogs",
      "Support routing automation"
    ],

    deliverables: [
      "WhatsApp API setup",
      "Message template creation",
      "Automation flow setup",
      "Catalog integration",
      "Analytics dashboard"
    ],

    industries: [
      "E-Commerce",
      "Healthcare",
      "Education",
      "Real Estate",
      "F&B"
    ],

    serviceType: "Messaging",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 22,
    slug: "email-marketing",
    name: "Email Marketing & Drip Campaigns",
    category: "Messaging, Email & Communication",
    categoryId: 5,

    shortDescription:
      "Automated email sequences that nurture leads and drive repeat conversions.",

    fullDescription:
      "Email marketing strategy, template design, automation setup, and campaign management — including welcome sequences, nurture flows, and re-engagement campaigns.",

    benefits:
      "Build automated email systems that continuously nurture leads, increase engagement, and drive repeat purchases.",

    automationPoints: [
      "Welcome email sequences",
      "Behavior-based triggers",
      "Audience segmentation",
      "A/B testing",
      "Deliverability optimization"
    ],

    deliverables: [
      "Email strategy setup",
      "Template design",
      "Automation workflows",
      "List segmentation",
      "Performance reporting"
    ],

    industries: [
      "SaaS",
      "E-Commerce",
      "Education",
      "Professional Services",
      "Healthcare"
    ],

    serviceType: "Messaging",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 23,
    slug: "sms-rcs",
    name: "SMS & RCS Messaging",
    category: "Messaging, Email & Communication",
    categoryId: 5,

    shortDescription:
      "High-open-rate messaging for alerts, campaigns, and transactional communication.",

    fullDescription:
      "SMS and RCS messaging solutions for transactional alerts, promotional campaigns, OTP delivery, and rich media communication with tracking.",

    benefits:
      "Deliver time-sensitive messages instantly with extremely high open and read rates.",

    automationPoints: [
      "Bulk messaging automation",
      "Personalized messaging",
      "Delivery tracking",
      "OTP automation",
      "Rich media messaging (RCS)"
    ],

    deliverables: [
      "SMS gateway setup",
      "Message template creation",
      "Automation workflows",
      "DLT registration",
      "Analytics dashboard"
    ],

    industries: [
      "E-Commerce",
      "Banking",
      "Healthcare",
      "Logistics",
      "Retail"
    ],

    serviceType: "Messaging",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 24,
    slug: "push-notifications",
    name: "Push Notification Systems",
    category: "Messaging, Email & Communication",
    categoryId: 5,

    shortDescription:
      "Web and mobile push notifications for engagement and retention.",

    fullDescription:
      "Web and mobile push notification systems with segmentation and automation for promotions, updates, re-engagement, and transactional alerts.",

    benefits:
      "Engage users even when they are not actively on your platform and increase retention through timely notifications.",

    automationPoints: [
      "Behavior-based triggers",
      "User segmentation",
      "A/B testing",
      "Scheduled notifications",
      "Performance analytics"
    ],

    deliverables: [
      "Push notification setup",
      "Segmentation strategy",
      "Automation workflows",
      "Template creation",
      "Performance tracking"
    ],

    industries: [
      "E-Commerce",
      "Media",
      "SaaS",
      "Education",
      "Gaming"
    ],

    serviceType: "Messaging",
    status: "In Progress",
    engagementSize: "Starter"
  },
  {
    id: 25,
    slug: "omnichannel-inbox",
    name: "Omnichannel Inbox & Routing",
    category: "Messaging, Email & Communication",
    categoryId: 5,

    shortDescription:
      "Unified inbox for WhatsApp, email, social, and chat — with smart routing.",

    fullDescription:
      "A centralized inbox that aggregates messages from WhatsApp, email, Instagram, Facebook, web chat, and SMS — with intelligent routing and assignment for efficient team collaboration.",

    benefits:
      "Never miss a customer message and manage all communication channels from a single platform with improved response efficiency.",

    automationPoints: [
      "Multi-channel message aggregation",
      "Smart routing and assignment",
      "Auto-assignment rules",
      "SLA tracking",
      "Canned responses"
    ],

    deliverables: [
      "Inbox system setup",
      "Channel integrations",
      "Routing rule configuration",
      "SLA setup",
      "Team training"
    ],

    industries: [
      "E-Commerce",
      "Healthcare",
      "SaaS",
      "Education",
      "Professional Services"
    ],

    serviceType: "Messaging",
    status: "Live",
    engagementSize: "Growth"
  },
  // Category 6 — Web Design, Branding & Creative
  {
    id: 26,
    slug: "website-design",
    name: "Business Website Design",
    category: "Web Design, Branding & Creative",
    categoryId: 6,

    shortDescription:
      "Custom-built websites optimized for speed, SEO, and conversions.",

    fullDescription:
      "Custom-designed, mobile-responsive business websites built on modern platforms — optimized for performance, SEO, and lead generation.",

    benefits:
      "Create a strong digital presence that builds trust and converts visitors into leads or customers.",

    automationPoints: [
      "Responsive design implementation",
      "SEO-ready architecture",
      "Performance optimization",
      "CMS integration",
      "Analytics tracking"
    ],

    deliverables: [
      "Custom website design",
      "Mobile optimization",
      "CMS setup",
      "SEO foundation",
      "Analytics integration"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 27,
    slug: "landing-pages",
    name: "Landing Page Design & Optimization",
    category: "Web Design, Branding & Creative",
    categoryId: 6,

    shortDescription:
      "High-converting landing pages built for campaigns and funnels.",

    fullDescription:
      "Conversion-optimized landing pages designed for specific campaigns, offers, or funnels — with A/B testing and analytics built in to maximize performance.",

    benefits:
      "Increase conversion rates significantly by sending traffic to focused, high-performing landing pages instead of generic pages.",

    automationPoints: [
      "A/B testing setup",
      "Heatmap and user behavior tracking",
      "Form optimization",
      "Speed optimization",
      "Conversion tracking"
    ],

    deliverables: [
      "Landing page design",
      "Copywriting",
      "A/B testing setup",
      "Analytics integration",
      "Performance reports"
    ],

    industries: [
      "SaaS",
      "Education",
      "Healthcare",
      "Real Estate",
      "E-Commerce"
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 28,
    slug: "brand-identity",
    name: "Brand Identity & Visual Design",
    category: "Web Design, Branding & Creative",
    categoryId: 6,

    shortDescription:
      "Complete brand identity system including logo, colors, typography, and guidelines.",

    fullDescription:
      "End-to-end brand identity design including logo, color palette, typography, brand guidelines, business cards, and social media templates — ensuring a consistent and recognizable visual presence.",

    benefits:
      "Build a strong, recognizable brand that increases trust, improves perception, and supports premium positioning.",

    automationPoints: [
      "Brand audit and research",
      "Competitor analysis",
      "Design system creation",
      "Template standardization",
      "Asset organization"
    ],

    deliverables: [
      "Logo design",
      "Brand guidelines",
      "Color and typography system",
      "Business stationery",
      "Social media templates"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 29,
    slug: "video-production",
    name: "Video Production & Motion Graphics",
    category: "Web Design, Branding & Creative",
    categoryId: 6,

    shortDescription:
      "Professional video production and motion graphics for marketing and branding.",

    fullDescription:
      "End-to-end video production including concept, shooting, editing, and motion graphics — for ads, explainer videos, social media, and brand storytelling.",

    benefits:
      "Increase engagement and brand recall using high-quality video content that stands out across platforms.",

    automationPoints: [
      "Script-to-video workflows",
      "Template-based editing",
      "Batch content production",
      "Multi-format exports",
      "Distribution workflows"
    ],

    deliverables: [
      "Video production",
      "Motion graphics",
      "Editing and post-production",
      "Multi-format delivery",
      "Brand-aligned visuals"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 30,
    slug: "ui-ux-design",
    name: "UI/UX Design & Prototyping",
    category: "Web Design, Branding & Creative",
    categoryId: 6,

    shortDescription:
      "User-focused design for apps, dashboards, and digital products.",

    fullDescription:
      "User research, wireframing, UI design, and interactive prototyping for web and mobile applications — focused on usability, clarity, and conversion.",

    benefits:
      "Improve user experience and increase conversion rates by designing intuitive and user-friendly interfaces.",

    automationPoints: [
      "User research workflows",
      "Wireframing systems",
      "Design system creation",
      "Prototype testing",
      "Developer handoff processes"
    ],

    deliverables: [
      "User research",
      "Wireframes",
      "UI design screens",
      "Interactive prototypes",
      "Design system"
    ],

    industries: [
      "SaaS",
      "E-Commerce",
      "Healthcare",
      "Finance",
      "Education"
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Growth"
  },
  // Category 7 — E-Commerce
  {
    id: 31,
    slug: "ecommerce-store",
    name: "E-Commerce Store Setup",
    category: "E-Commerce & Marketplace Growth",
    categoryId: 7,

    shortDescription:
      "Complete online store setup with payments, shipping, and product catalog.",

    fullDescription:
      "End-to-end e-commerce store setup including platform selection, design, product catalog setup, payment gateway integration, shipping configuration, and launch.",

    benefits:
      "Launch a fully functional online store quickly and start converting visitors into customers from day one.",

    automationPoints: [
      "Product catalog automation",
      "Inventory synchronization",
      "Order processing workflows",
      "Payment gateway integration",
      "Shipping automation"
    ],

    deliverables: [
      "Store design",
      "Product setup",
      "Payment gateway integration",
      "Shipping setup",
      "Launch checklist"
    ],

    industries: [
      "Retail",
      "Fashion",
      "F&B",
      "Beauty",
      "Electronics"
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 32,
    slug: "marketplace-management",
    name: "Marketplace Management",
    category: "E-Commerce & Marketplace Growth",
    categoryId: 7,

    shortDescription:
      "Sell and scale on Amazon, Flipkart, Meesho, and more with full management.",

    fullDescription:
      "Multi-marketplace management covering product listing optimization, inventory synchronization, pricing strategy, advertising, and review management across platforms like Amazon, Flipkart, and others.",

    benefits:
      "Expand reach to millions of marketplace customers while maintaining control over listings, pricing, and performance.",

    automationPoints: [
      "Listing optimization",
      "Inventory synchronization",
      "Price monitoring",
      "Review management",
      "Advertising optimization"
    ],

    deliverables: [
      "Marketplace account setup",
      "Listing optimization",
      "Inventory sync setup",
      "Ad campaign management",
      "Performance reports"
    ],

    industries: [
      "Retail",
      "Fashion",
      "Electronics",
      "Beauty",
      "Home & Garden"
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 33,
    slug: "cart-abandonment",
    name: "Cart Abandonment Recovery",
    category: "E-Commerce & Marketplace Growth",
    categoryId: 7,

    shortDescription:
      "Recover lost sales with automated cart abandonment sequences.",

    fullDescription:
      "Automated cart abandonment recovery across email, WhatsApp, SMS, and push notifications — triggered when users leave without completing their purchase.",

    benefits:
      "Recover a significant portion of lost revenue by re-engaging users who already showed purchase intent.",

    automationPoints: [
      "Real-time abandonment triggers",
      "Multi-channel recovery sequences",
      "Dynamic product reminders",
      "Incentive-based offers",
      "A/B testing optimization"
    ],

    deliverables: [
      "Recovery strategy setup",
      "Email sequences",
      "WhatsApp flows",
      "SMS campaigns",
      "Performance tracking"
    ],

    industries: [
      "E-Commerce",
      "Retail",
      "Fashion",
      "Electronics",
      "F&B"
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Starter"
  },
  {
    id: 34,
    slug: "product-feed",
    name: "Product Feed & Catalog Automation",
    category: "E-Commerce & Marketplace Growth",
    categoryId: 7,

    shortDescription:
      "Automate product feeds across Google Shopping, Meta, and marketplaces.",

    fullDescription:
      "Automated product feed management for Google Shopping, Meta catalogs, and marketplaces — ensuring pricing, inventory, and product data stay updated across platforms.",

    benefits:
      "Maintain accurate product listings everywhere without manual updates and reduce errors across sales channels.",

    automationPoints: [
      "Automated feed generation",
      "Price synchronization",
      "Stock updates",
      "Error monitoring",
      "Multi-platform distribution"
    ],

    deliverables: [
      "Feed setup",
      "Platform integrations",
      "Automation workflows",
      "Error alert system",
      "Performance tracking"
    ],

    industries: [
      "E-Commerce",
      "Retail",
      "Fashion",
      "Electronics"
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Starter"
  },
  // Category 8 — Sales, CRM & Revenue
  {
    id: 35,
    slug: "crm-setup",
    name: "CRM Setup & Sales Pipeline",
    category: "Sales, CRM & Revenue Operations",
    categoryId: 8,

    shortDescription:
      "Set up CRM systems to track, manage, and convert every lead effectively.",

    fullDescription:
      "Complete CRM implementation including platform selection, pipeline setup, automation rules, and team training — ensuring every lead is tracked and followed up systematically.",

    benefits:
      "Improve visibility, ensure no lead is lost, and automate follow-ups to increase conversion rates.",

    automationPoints: [
      "Pipeline automation",
      "Lead scoring",
      "Follow-up sequences",
      "Reporting automation",
      "System integrations"
    ],

    deliverables: [
      "CRM setup",
      "Pipeline design",
      "Automation workflows",
      "Team training",
      "Custom reports"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 36,
    slug: "sales-funnel",
    name: "Sales Funnel Automation",
    category: "Sales, CRM & Revenue Operations",
    categoryId: 8,

    shortDescription:
      "Automated funnels from lead capture to conversion.",

    fullDescription:
      "End-to-end sales funnel automation covering lead capture, nurturing, qualification, and conversion — with every stage tracked and optimized.",

    benefits:
      "Turn your sales process into a predictable system with clear visibility into conversion performance.",

    automationPoints: [
      "Lead capture automation",
      "Nurture sequences",
      "Lead scoring and qualification",
      "Handoff automation",
      "Conversion tracking"
    ],

    deliverables: [
      "Funnel strategy",
      "Landing pages",
      "Email sequences",
      "CRM integration",
      "Analytics dashboard"
    ],

    industries: [
      "SaaS",
      "Education",
      "Real Estate",
      "Professional Services",
      "Healthcare"
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 37,
    slug: "lead-generation",
    name: "Lead Generation Systems",
    category: "Sales, CRM & Revenue Operations",
    categoryId: 8,

    shortDescription:
      "Generate consistent, high-quality leads through multi-channel strategies.",

    fullDescription:
      "Multi-channel lead generation systems combining ads, landing pages, forms, and automation — designed to attract, capture, and qualify leads consistently.",

    benefits:
      "Build a predictable pipeline of qualified leads and reduce dependency on inconsistent acquisition methods.",

    automationPoints: [
      "Lead capture automation",
      "Multi-channel acquisition",
      "Lead qualification",
      "CRM integration",
      "Performance tracking"
    ],

    deliverables: [
      "Lead generation strategy",
      "Landing pages",
      "Ad campaigns",
      "CRM integration",
      "Analytics dashboard"
    ],

    industries: [
      "SaaS",
      "Real Estate",
      "Education",
      "Healthcare",
      "Finance"
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 38,
    slug: "loyalty-referral",
    name: "Loyalty, Referral & Retention Programs",
    category: "Sales, CRM & Revenue Operations",
    categoryId: 8,

    shortDescription:
      "Loyalty rewards, referral systems, and retention automation to increase lifetime value.",

    fullDescription:
      "Complete customer retention systems including loyalty programs, referral engines, VIP tiers, win-back campaigns, and automated engagement workflows.",

    benefits:
      "Increase repeat purchases, improve customer lifetime value, and acquire new customers through referrals at lower cost.",

    automationPoints: [
      "Points and rewards automation",
      "Referral tracking systems",
      "VIP tier management",
      "Win-back campaigns",
      "Retention analytics"
    ],

    deliverables: [
      "Retention strategy",
      "Loyalty platform setup",
      "Referral program",
      "VIP tier system",
      "Analytics dashboard"
    ],

    industries: [
      "E-Commerce",
      "Hospitality",
      "SaaS",
      "Retail"
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 39,
    slug: "influencer-affiliate",
    name: "Influencer & Affiliate Marketing",
    category: "Sales, CRM & Revenue Operations",
    categoryId: 8,

    shortDescription:
      "Leverage creators and affiliates to scale reach and performance.",

    fullDescription:
      "Influencer and affiliate marketing programs that combine creator partnerships with performance tracking — enabling scalable growth through trusted content and partnerships.",

    benefits:
      "Drive awareness and conversions through trusted creators while maintaining measurable performance and ROI.",

    automationPoints: [
      "Creator onboarding",
      "Affiliate tracking systems",
      "Campaign coordination",
      "Performance tracking",
      "Payout automation"
    ],

    deliverables: [
      "Influencer strategy",
      "Creator sourcing",
      "Campaign management",
      "Affiliate system setup",
      "Performance reports"
    ],

    industries: [
      "E-Commerce",
      "D2C",
      "Fashion",
      "Beauty",
      "Fitness"
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth"
  },
  // Category 9 — Business Operations & Infrastructure
  {
    id: 40,
    slug: "analytics-bi",
    name: "Analytics & BI Dashboards",
    category: "Data, Analytics & Infrastructure",
    categoryId: 9,

    shortDescription:
      "Centralized dashboards for real-time business insights and decision-making.",

    fullDescription:
      "Custom dashboards combining data from marketing, sales, finance, and operations — providing real-time insights and performance tracking in one place.",

    benefits:
      "Make faster, data-driven decisions with complete visibility across your business metrics.",

    automationPoints: [
      "Data integration",
      "Real-time dashboards",
      "Automated reporting",
      "Custom KPIs",
      "Alert systems"
    ],

    deliverables: [
      "Dashboard setup",
      "Data integration",
      "Custom reports",
      "Visualization design",
      "Monitoring systems"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Analytics",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 41,
    slug: "cloud-devops",
    name: "Cloud Infrastructure & DevOps",
    category: "Data, Analytics & Infrastructure",
    categoryId: 9,

    shortDescription:
      "Scalable cloud infrastructure and deployment automation.",

    fullDescription:
      "Cloud infrastructure setup, CI/CD pipelines, deployment automation, and performance monitoring — ensuring scalable and reliable systems.",

    benefits:
      "Improve system reliability, scalability, and deployment speed while reducing downtime and manual intervention.",

    automationPoints: [
      "CI/CD pipelines",
      "Auto-scaling systems",
      "Monitoring and alerts",
      "Backup automation",
      "Deployment workflows"
    ],

    deliverables: [
      "Cloud setup",
      "CI/CD pipelines",
      "Monitoring tools",
      "Deployment automation",
      "Documentation"
    ],

    industries: [
      "SaaS",
      "Fintech",
      "E-Commerce",
      "Startups"
    ],

    serviceType: "Infrastructure",
    status: "In Progress",
    engagementSize: "Enterprise"
  },
  {
    id: 42,
    slug: "hr-automation",
    name: "HR & Internal Process Automation",
    category: "Data, Analytics & Infrastructure",
    categoryId: 9,

    shortDescription:
      "Automate HR processes like onboarding, payroll, and internal workflows.",

    fullDescription:
      "Automation systems for HR and internal operations — including onboarding, payroll processing, attendance tracking, and employee workflows.",

    benefits:
      "Reduce administrative workload, improve efficiency, and standardize internal processes.",

    automationPoints: [
      "Onboarding automation",
      "Payroll workflows",
      "Attendance tracking",
      "Internal approvals",
      "Employee lifecycle management"
    ],

    deliverables: [
      "HR system setup",
      "Workflow automation",
      "Integration with payroll tools",
      "Dashboards",
      "Documentation"
    ],

    industries: [
      "All Industries"
    ],

    serviceType: "Infrastructure",
    status: "Live",
    engagementSize: "Growth"
  },
  {
    id: 43,
    slug: "data-security",
    name: "Data Security & Compliance",
    category: "Data, Analytics & Infrastructure",
    categoryId: 9,

    shortDescription:
      "Protect systems, ensure compliance, and secure business data.",

    fullDescription:
      "Security audits, compliance setup, data protection strategies, and monitoring systems — ensuring your business meets regulatory requirements and stays secure.",

    benefits:
      "Protect sensitive data, avoid compliance risks, and build trust with customers and stakeholders.",

    automationPoints: [
      "Security monitoring",
      "Compliance tracking",
      "Access control systems",
      "Threat detection",
      "Backup systems"
    ],

    deliverables: [
      "Security audit",
      "Compliance setup",
      "Monitoring systems",
      "Access control setup",
      "Incident response plan"
    ],

    industries: [
      "Finance",
      "Healthcare",
      "SaaS",
      "Government",
      "Enterprises"
    ],

    serviceType: "Infrastructure",
    status: "Live",
    engagementSize: "Enterprise"
  },
];

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
