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
  /** When set, Related services section shows these slugs in order (max 3 shown). Otherwise same-category services are used. */
  relatedServiceSlugs?: string[];
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
      "A tireless sales rep that qualifies, nurtures, and closes — across WhatsApp, web, and voice — while your team sleeps.",

    fullDescription:
      "A fully autonomous AI-powered sales representative that engages every inbound lead instantly — across WhatsApp, your website chat, and even phone calls — qualifying them, handling objections, sharing product info, and booking meetings or pushing orders. It does not take lunch breaks, forget follow-ups, or have off days. Every prospect gets a sub-3-second response, 24 hours a day, 7 days a week. Your human sales team only talks to prospects who are already warm and ready to buy. Typically we map your sales process in days one to three, build and train the agent across channels in days four to fourteen, connect CRM and tools in days ten to sixteen, test and soft-launch through day eighteen, then go live across channels with monitoring, tuning, and conversion optimisation through the first ninety days.",

    benefits:
      "Studies show most deals go to whoever responds first — your AI Sales Agent replies in under three seconds on every channel while competitors are still checking their inbox. The AI handles repetitive qualification — budget, timeline, decision-maker, needs — and only passes through prospects who meet your criteria, so reps spend their time closing, not qualifying. Hiring salespeople is expensive and slow; an AI agent handles unlimited concurrent conversations for a fraction of the cost, with consistent performance every time.",

    automationPoints: [
      "Instant Lead Response — Every enquiry answered in under three seconds — no lead left waiting, no opportunity wasted.",
      "Intelligent Qualification — Custom scoring filters out tyre-kickers automatically — your reps only see ready-to-buy prospects.",
      "Multi-Channel Presence — WhatsApp, website chat, and voice — one AI agent covers every channel your prospects prefer.",
      "Smart Follow-Ups — If a prospect goes cold, the agent re-engages with personalised nudges — no manual chasing needed.",
      "Full CRM Integration — Every conversation, score, and handoff logged automatically — zero manual data entry for your team.",
    ],

    deliverables: [
      "WhatsApp AI Sales Bot — Business API integration, conversation flows, product catalogue, and payment links inside WhatsApp.",
      "Website Chat Widget — Embedded AI chat on your site — greeting, qualification, meeting booking, and lead capture.",
      "Voice AI Agent — Natural-sounding inbound/outbound phone agent for sales calls, with recording and transcription.",
      "Lead Scoring Logic — Custom qualification framework based on your ICP — BANT or your own criteria.",
      "CRM Integration — Auto-push leads, scores, and conversation history to HubSpot, Zoho, Salesforce, Pipedrive, or Notion.",
      "Follow-Up Sequences — Automated re-engagement for cold leads — timed nudges via WhatsApp and email.",
      "Analytics Dashboard — Conversion metrics, response times, qualification rates, and pipeline attribution in real time.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — your funnel and ad spend profile will shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Lead response speed (score)", before: 14, after: 98 },
        { label: "Lead-to-meeting conversion (index)", before: 38, after: 78 },
        { label: "Lead follow-up coverage", before: 66, after: 100 },
        { label: "Cost per qualified lead (efficiency)", before: 32, after: 70 },
        { label: "After-hours lead capture", before: 10, after: 100 },
      ],
    },

    faqs: [
      {
        question: "Will it sound robotic?",
        answer:
          "No. Modern LLM-powered agents sound natural. We fine-tune tone, personality, and vocabulary to match your brand — many prospects do not realise they are talking to AI.",
      },
      {
        question: "Can it handle complex sales conversations?",
        answer:
          "It handles qualification, objection handling, and product education very well. For complex negotiations or custom pricing, it performs a warm handoff to your human rep with full context.",
      },
      {
        question: "What happens if the AI gets confused?",
        answer:
          "We build fallback logic — if the agent cannot answer confidently, it hands off to a human with the full transcript. No awkward dead-ends.",
      },
      {
        question: "How does it integrate with my existing CRM?",
        answer:
          "Native-style integrations with HubSpot, Zoho, Salesforce, Pipedrive, and Notion. For other stacks we use API connectors via n8n or Make. Leads, scores, and transcripts sync automatically.",
      },
    ],

    industries: [
      "Real Estate",
      "Education",
      "E-Commerce",
      "SaaS",
      "Healthcare",
      "Professional Services"
    ],

    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["voice-ai-ivr", "ai-receptionist", "custom-ai-agent-development"],
  },
  {
    id: 2, slug: "ai-customer-support-bot", name: "AI Customer Support Bot", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "An intelligent support agent that handles customer queries, resolves common issues, processes returns, tracks orders, and escalates complex problems — all through chat or voice. Trained on your knowledge base, FAQs, and product documentation, it gives accurate, consistent answers every time. Your human support team only deals with genuinely complex issues — saving hours daily and dramatically improving customer satisfaction.",
    fullDescription: "An intelligent support agent that handles customer queries, resolves common issues, processes returns, tracks orders, and escalates complex problems — all through chat or voice. Trained on your knowledge base, FAQs, and product documentation, it gives accurate, consistent answers every time. Your human support team only deals with genuinely complex issues — saving hours daily and dramatically improving customer satisfaction.",
    benefits: "Resolve 60–80% of support tickets instantly while reducing response time from hours to seconds. Slash support costs, improve customer satisfaction, and free your team to focus on high-value interactions instead of repetitive queries.",
    automationPoints: [
      "Instant Resolution — Common queries resolved in under 10 seconds — no wait times, no ticket queues.",
      "Multi-Channel Coverage — WhatsApp, website, Instagram, Facebook Messenger, email — one bot covers all.",
      "Smart Escalation — Detects frustration, complexity, or VIP customers and routes to humans with full context.",
      "Self-Improving — Learns from resolved tickets and human corrections — gets smarter over time without manual retraining.",
      "Full Audit Trail — Every conversation logged, searchable, and reportable — strong fit for compliance and QA.",
    ],

    deliverables: [
      "Multi-Channel Support Bot — Deployed on WhatsApp, website, Instagram, Messenger — unified AI across channels.",
      "Knowledge Base Training — Trained on your FAQs, product docs, SOPs, and past ticket history for accuracy.",
      "Ticket Escalation Workflows — Routing to human agents with full context, sentiment tags, and priority scoring.",
      "Order Tracking Integration — Real-time order and shipment status from Shopify, WooCommerce, or your backend.",
      "Helpdesk Integration — Connects to Freshdesk, Zendesk, Intercom, or your existing ticketing system.",
      "Sentiment Detection — Frustrated customers flagged and fast-tracked to human agents automatically.",
      "Performance Dashboard — Resolution rate, CSAT, average response time, deflection rate, and escalation analytics.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — ticket mix and channels will shift your baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Resolution speed (automated queries)", before: 22, after: 94 },
        { label: "Tickets deflected by AI", before: 6, after: 72 },
        { label: "CSAT (score index)", before: 68, after: 88 },
        { label: "Team focus on complex work (score)", before: 38, after: 90 },
        { label: "After-hours coverage", before: 12, after: 100 },
      ],
    },

    faqs: [
      {
        question: "What if the AI gives a wrong answer?",
        answer:
          "We set confidence thresholds — if the AI is not sure, it says so and escalates to a human. Human-in-the-loop review in the first 30 days helps catch and correct edge cases.",
      },
      {
        question: "Can it handle multiple languages?",
        answer:
          "Yes. We deploy multilingual support — English, Hindi, and regional languages — with automatic language detection.",
      },
      {
        question: "How is this different from a basic chatbot?",
        answer:
          "Basic chatbots follow rigid trees. Our AI understands natural language, handles unexpected questions, remembers context within a conversation, and learns from corrections.",
      },
      {
        question: "Can it process refunds or cancellations?",
        answer:
          "Yes, with the right backend integration. The AI can initiate refunds, process cancellations, and update order statuses according to your business rules.",
      },
    ],

    industries: [
      "E-Commerce",
      "SaaS",
      "Healthcare",
      "Telecom",
      "Banking",
      "Professional Services"
    ],

    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["voice-ai-ivr", "internal-ai-assistant", "ai-sales-agent"],
  },
  {
    id: 3,
    slug: "ai-receptionist", name: "AI Receptionist & Scheduler", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "A virtual receptionist that greets customers, answers FAQs about your business, and books appointments directly into your calendar — via WhatsApp, phone, or web chat. It ensures every enquiry is handled instantly without wait times or missed calls.",
    fullDescription: "A virtual receptionist that greets customers, answers FAQs about your business, and books appointments directly into your calendar — via WhatsApp, phone, or web chat. It ensures every enquiry is handled instantly without wait times or missed calls.",
    benefits: "Ensure zero missed appointments and provide a consistent, professional first impression for every customer interaction — without relying on manual staff availability.",
    automationPoints: [
      "24/7 Availability — Bookings at night, on Sundays, and on holidays — you never close for enquiries.",
      "Zero Double-Bookings — Real-time calendar sync keeps slots accurate — no overlaps, no conflicts.",
      "Pre-Visit Data Collection — Intake forms, insurance details, and preferences captured before the visit — less in-person admin.",
      "Waitlist & Backfill — Cancellations are offered to waitlisted clients quickly — recovering revenue that would otherwise be lost.",
      "Multi-Language Support — Greet and book in English, Hindi, or regional languages based on customer preference.",
    ],

    deliverables: [
      "AI Receptionist Bot — Deployed on WhatsApp, web chat, and voice — natural conversational ability.",
      "Calendar Integration — Real-time sync with Google Calendar, Calendly, Cal.com, or your custom booking system.",
      "Automated Reminders — Confirmation and reminder messages via WhatsApp, SMS, and email — timing you control.",
      "Pre-Visit Questionnaires — Intake forms sent before the appointment — collected and stored digitally.",
      "Waitlist Management — Cancellation backfill — open slots offered to waitlisted clients in priority order.",
      "Appointment Analytics — Bookings, no-shows, cancellations, peak hours, and revenue per slot in one dashboard.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 60 days — traffic and seasonality will move your baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~60 days",
      rows: [
        { label: "Enquiry capture (score)", before: 68, after: 100 },
        { label: "Booking conversion (index)", before: 52, after: 84 },
        { label: "No-show control (score)", before: 72, after: 90 },
        { label: "Staff time freed from phones (score)", before: 28, after: 94 },
        { label: "After-hours bookings (share index)", before: 8, after: 82 },
      ],
    },

    faqs: [
      {
        question: "Can it handle walk-ins alongside scheduled appointments?",
        answer:
          "Yes. We can add buffer times between appointments and real-time availability updates so walk-ins do not clash with booked slots.",
      },
      {
        question: "What if a customer wants to talk to a human?",
        answer:
          "The AI can transfer to a staff member with full conversation context. If no one is available, it takes a message and schedules a callback.",
      },
      {
        question: "Can it book for multiple staff members with different schedules?",
        answer:
          "Yes. We set per-person availability, service types, and locations — the assistant routes each booking to the right person automatically.",
      },
      {
        question: "Does it work with my existing booking software?",
        answer:
          "We integrate with Google Calendar, Calendly, Cal.com, Acuity, Fresha, Mindbody, and custom systems. If your tool has an API, we can usually connect it.",
      },
    ],

    industries: [
      "Healthcare",
      "Salons & Spas",
      "Fitness",
      "Legal Firms",
      "Real Estate",
      "Education",
      "Professional Services"
    ],

    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["voice-ai-ivr", "ai-customer-support-bot", "ai-sales-agent"],
  },
  {
    id: 4,
    slug: "internal-ai-assistant",
    name: "Internal Knowledge AI (HR / IT / Ops)",
    category: "AI Agents & Conversational AI",
    categoryId: 1,

    shortDescription: "An AI-powered internal helpdesk that answers employee questions about policies, leave, IT troubleshooting, onboarding, and more — trained on your documents and SOPs. It provides instant, consistent answers across your organization.",
    fullDescription: "An AI-powered internal helpdesk that answers employee questions about policies, leave, IT troubleshooting, onboarding, and more — trained on your documents and SOPs. It provides instant, consistent answers across your organization.",
    benefits: "Reduce dependency on HR and IT teams for repetitive queries, speed up onboarding, and ensure every employee gets accurate information instantly.",
    automationPoints: [
      "Instant Policy Answers — “What’s the WFH policy?” answered in seconds instead of waiting for an HR reply.",
      "IT Self-Service — Password resets, VPN setup, and software access requests resolved without raising a ticket.",
      "Guided Onboarding — Personalised, step-by-step onboarding journeys without constant manager hand-holding.",
      "Knowledge Gap Detection — Analytics surface what employees ask most, revealing documentation gaps you did not know you had.",
      "Always Current — Update the source doc in Notion, Drive, or Confluence; the assistant reflects the change when it syncs.",
    ],

    deliverables: [
      "AI Assistant Deployment — Trained on your SOPs, policies, wikis, and handbooks — deployed on Slack, Teams, or web.",
      "Knowledge Base Ingestion — Structured ingestion from Notion, Confluence, Google Drive, SharePoint, or PDFs.",
      "IT Troubleshooting Flows — Guided decision trees for password resets, VPN, access requests, printer setup, and similar issues.",
      "Onboarding Automation — Personalised journeys triggered when a new hire joins Slack or Teams.",
      "Leave & HR Query Handling — Leave balance checks, policy lookups, and reimbursement guidance in chat.",
      "Admin Dashboard — Query analytics, knowledge gaps, most-asked questions, and usage trends.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — your baseline depends on team size, ticket volume, and how complete your docs are to start.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Self-service resolution rate", before: 22, after: 72 },
        { label: "Internal answer speed (score)", before: 18, after: 96 },
        { label: "Onboarding acceleration (score)", before: 42, after: 88 },
        { label: "Policy consistency & trust (score)", before: 48, after: 92 },
        { label: "Employee support satisfaction (score)", before: 55, after: 88 },
      ],
    },

    faqs: [
      {
        question: "What if our documentation is messy or incomplete?",
        answer:
          "We help clean and structure it during the knowledge audit. The assistant also reveals gaps through analytics — showing what people ask that is not documented yet.",
      },
      {
        question: "Is our internal data secure?",
        answer:
          "Yes. We deploy on enterprise-grade infrastructure with encryption at rest and in transit. The AI only accesses documents you explicitly provide, and we support on-premise deployment when you need it.",
      },
      {
        question: "Can different departments have different access levels?",
        answer:
          "Yes. Role-based access control keeps finance-only policies away from engineering and vice versa — you decide who can ask what.",
      },
      {
        question: "How do we update the knowledge base?",
        answer:
          "Update your source documents in Notion, Google Drive, or elsewhere; the assistant syncs from there. No full retraining for routine content updates.",
      },
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
    engagementSize: "Growth"
  },
  {
    id: 5,
    slug: "voice-ai-ivr",
    name: "Voice AI & Smart IVR",
    category: "AI Agents & Conversational AI",
    categoryId: 1,
    shortDescription: "AI-powered voice agents that handle inbound and outbound phone calls — from customer service to sales follow-ups — with natural, human-like conversations. It replaces traditional IVR systems with intelligent interaction.",
    fullDescription:
      "AI-powered voice agents that handle inbound and outbound phone calls — from customer service to sales follow-ups — with natural, human-like conversations. It replaces traditional IVR systems with intelligent interaction.",

    benefits:
      "Handle large call volumes without wait times, automate repetitive conversations, and capture every interaction with complete data tracking.",

    automationPoints: [
      "Natural Conversation — LLM-powered voice that sounds human; handles interruptions, accents, and context switches naturally.",
      "Intelligent Routing — Intent-based routing to the right department or person — no more IVR menu trees.",
      "Outbound Automation — Reminder calls, appointment confirmations, payment follow-ups, and surveys — all automated.",
      "Full Transcription — Every call transcribed, summarised, and logged in your CRM — searchable and auditable.",
      "Multilingual — English, Hindi, and regional Indian languages — detected and switched automatically.",
    ],

    deliverables: [
      "Voice AI Agent — Inbound + outbound AI phone agent with natural conversational ability.",
      "Custom IVR Flows — Intelligent call routing based on caller intent, not button presses.",
      "Call Transcription — Real-time transcription with speaker identification and topic tagging.",
      "CRM Integration — Call logs, transcripts, and summaries auto-pushed to your CRM.",
      "Outbound Campaigns — Automated reminder, follow-up, and survey calling campaigns.",
      "Analytics Dashboard — Call volume, resolution rate, sentiment, average duration, and peak-hour analysis.",
      "Compliance Recording — Call recording, archival, and consent management for regulated industries.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — exact numbers depend on call volume, queues, and how many flows you automate first.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Call answer rate (index)", before: 72, after: 100 },
        { label: "Wait / hold experience (score)", before: 18, after: 96 },
        { label: "Cost per interaction (efficiency index)", before: 32, after: 90 },
        { label: "End-to-end automation rate", before: 8, after: 74 },
        { label: "After-hours coverage (score)", before: 12, after: 98 },
      ],
    },

    faqs: [
      {
        question: "Will this work with our existing phone system or cloud PBX?",
        answer:
          "Yes. We connect the voice agent to your carrier or CPaaS (Twilio, Exotel, etc.) and map it to your numbers, queues, and business hours. You keep your current provider where it makes sense; we handle the AI layer, routing logic, and integrations.",
      },
      {
        question: "What happens when the AI cannot resolve a call?",
        answer:
          "We configure clear escalation rules: transfer to the right team or queue, schedule a callback, or capture a structured ticket with transcript and context so agents pick up without asking everything again. You control thresholds and which intents always go to humans.",
      },
      {
        question: "How do you handle recording, consent, and regulated industries?",
        answer:
          "We implement consent prompts, recording policies, retention, and archival to match your jurisdiction and industry rules (BFSI, healthcare, etc.). Compliance recording and audit-friendly logs are part of the deliverable set — not an afterthought.",
      },
      {
        question: "Which languages and accents are supported?",
        answer:
          "We support English, Hindi, and major regional Indian languages, with automatic language detection where needed. Accents and code-switching are handled by the conversational model; we tune prompts and test on real caller samples during rollout.",
      },
      {
        question: "How does pricing work — per minute or retainer?",
        answer:
          "Most engagements combine a one-time setup for flows, integrations, and go-live with ongoing usage: either per-minute/concurrency-based for variable volume or a monthly retainer for predictable support and iteration. After discovery we recommend the model that matches your call profile.",
      },
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
    engagementSize: "Growth"
  },
  {
    id: 44,
    slug: "custom-ai-agent-development",
    name: "Custom AI Agent Development",
    category: "AI Agents & Conversational AI",
    categoryId: 1,

    shortDescription:
      "Bespoke AI agents built for your unique workflow — when off-the-shelf solutions aren't enough and your process demands something purpose-built.",

    fullDescription:
      "A purpose-built AI agent designed specifically for your business process — whether that is a real-estate property matching engine, a healthcare triage bot, a legal document analyser, an investment screening tool, or an operations coordinator that manages complex multi-step workflows. This is not a chatbot template. It is a custom-engineered AI system that understands your domain, integrates with your data sources, and performs tasks that would otherwise require skilled human effort — at scale, consistently, and around the clock. Typical delivery runs discovery and scoping in weeks one to two, architecture and design in week two to three, agile build sprints with weekly demos through week eight, then testing and hardening before production deployment, team training, and thirty days of supervised operation with rapid iteration.",

    benefits:
      "Your business has unique processes — generic tools force you to bend your workflow to their limits. A custom agent bends to you, with exactly the logic, data, and decisions you need. We encode your best people's domain expertise into a system that runs around the clock without fatigue or inconsistency. When competitors use the same off-the-shelf products, your agent becomes proprietary IP — speed and accuracy they cannot copy.",

    automationPoints: [
      "Purpose-Built Logic — Every decision tree, scoring model, and workflow is designed around your specific business rules.",
      "Deep Integration — Connects to your databases, APIs, ERPs, CRMs, and third-party services — not just surface-level.",
      "Multi-Step Reasoning — Handles complex workflows with multiple decision points, data lookups, and conditional logic.",
      "Proprietary IP — You own the agent. It is your competitive advantage — not a shared SaaS feature everyone has access to.",
      "Scalable & Upgradeable — Modular architecture so you can add capabilities, retrain on new data, or expand to new use cases over time.",
    ],

    deliverables: [
      "Discovery & Spec Document — Detailed requirements, workflow mapping, data architecture, and success criteria before we write a line of code.",
      "Custom AI Agent Build — LLM-powered agent with domain-specific training, tool use, and multi-step reasoning capabilities.",
      "Data Pipeline & Integration — Connect to your databases, APIs, and external services — structured for real-time retrieval and action.",
      "User Interface — Chat-based, dashboard-based, or API-only — depending on who uses the agent and how.",
      "Testing & Validation — Rigorous testing against edge cases, adversarial inputs, and real-world scenarios.",
      "Documentation & Handover — Complete technical documentation, admin guide, and team training.",
      "Ongoing Maintenance — Model updates, data retraining, bug fixes, and capability expansion on retainer.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Directional improvements after deployment — baselines depend on how manual and variable your process is today.",
      beforeLabel: "Before",
      afterLabel: "After deployment",
      rows: [
        { label: "Process speed (score)", before: 18, after: 94 },
        { label: "Consistency / error control (score)", before: 52, after: 93 },
        { label: "Concurrent throughput (score)", before: 28, after: 96 },
        { label: "Availability (score)", before: 22, after: 99 },
        { label: "Cost per task (efficiency index)", before: 25, after: 90 },
      ],
    },

    faqs: [
      {
        question: "How do you handle data privacy?",
        answer:
          "We follow enterprise security standards — encryption, access control, and audit trails. For sensitive industries, we support on-premise or private cloud deployment.",
      },
      {
        question: "Can we modify the agent after delivery?",
        answer:
          "Yes. The agent is built on modular architecture with clear documentation. Your team can maintain it, or we offer a retainer for ongoing updates.",
      },
      {
        question: "What LLMs do you use?",
        answer:
          "We are model-agnostic — GPT-4o, Claude, Gemini, Llama, Mistral, or domain-specific fine-tuned models. We choose based on your accuracy, speed, cost, and privacy requirements.",
      },
      {
        question: "How do you price custom agents?",
        answer:
          "Project-based pricing after the discovery phase. Typical range is roughly ₹2L–15L depending on complexity. We provide a detailed quote with milestone payments.",
      },
    ],

    industries: [
      "Real Estate",
      "Healthcare",
      "Legal",
      "Financial Services",
      "Logistics",
      "Professional Services"
    ],

    serviceType: "AI Agents",
    status: "Live",
    engagementSize: "Growth"
  },
  // Category 2 — Workflow & Business Process Automation
  {
    id: 6,
    slug: "no-code-workflow", name: "No-Code Workflow Automation", category: "Workflow & Business Process Automation", categoryId: 2,
    shortDescription: "Custom automated workflows that connect your business tools and make them work together without manual intervention. When one action happens, multiple processes are triggered automatically across systems.",
    fullDescription: "Custom automated workflows that connect your business tools and make them work together without manual intervention. When one action happens, multiple processes are triggered automatically across systems.",
    benefits: "Eliminate repetitive manual work, reduce human errors, and save significant operational time while improving efficiency across teams.",
    automationPoints: [
      "Real-Time Data Sync — CRM, email, calendar, payments, and sheets stay aligned automatically — less lag and fewer duplicates.",
      "Trigger-Based Actions — New lead? Auto-assign, notify the rep, add to CRM, and send a welcome email — often in seconds.",
      "Error Handling Built In — Failures trigger retries, logs, and alerts — nothing fails silently.",
      "No Vendor Lock-In — Built on n8n, Make, or Zapier — you own the workflows and can change them when you need to.",
      "Documented & Trainable — Every workflow ships with documentation so your team can understand, maintain, and extend it.",
    ],

    deliverables: [
      "Workflow Audit & Opportunity Map — We map manual processes and prioritise what to automate first for maximum impact.",
      "Workflow Design & Build — Custom workflows on n8n, Make, or Zapier — designed, built, tested, and deployed.",
      "Multi-Tool Integrations — CRM, email, calendar, payments, sheets, and messaging connected end to end.",
      "Error Handling & Fallback Logic — Retries, error logging, and alerts so issues are visible and recoverable.",
      "Documentation & Training — Clear docs per workflow plus a session so your team can manage and extend them.",
      "Ongoing Optimisation — Monthly review of performance, speed, and reliability with tuning as your business changes.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 60 days — stack complexity and volume will shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~60 days",
      rows: [
        { label: "Manual task volume (burden index)", before: 82, after: 12 },
        { label: "Data entry error rate (inverse score)", before: 70, after: 96 },
        { label: "Team time reclaimed (score)", before: 18, after: 78 },
        { label: "Process completion speed (score)", before: 35, after: 93 },
        { label: "Cross-tool sync latency (score)", before: 28, after: 96 },
      ],
    },

    faqs: [
      {
        question: "Which platform do you recommend — n8n, Make, or Zapier?",
        answer:
          "It depends on complexity and budget. Zapier suits simpler flows, Make for mid-complexity, n8n for advanced or self-hosted setups. We recommend based on your stack and requirements.",
      },
      {
        question: "Can you automate processes across tools that don't have native integrations?",
        answer:
          "Usually yes. If a product exposes an API, we can connect it. Otherwise we use webhooks, email parsing, or controlled browser automation as fallbacks.",
      },
      {
        question: "What happens if a workflow breaks?",
        answer:
          "Each workflow includes error handling — retries, fallbacks, and real-time alerts. On a maintenance retainer we prioritise fixes quickly (often within 24 hours depending on SLA).",
      },
      {
        question: "Can my team modify workflows after you build them?",
        answer:
          "Yes. You get documentation and a training session. These no-code platforms are meant to be editable without engineering.",
      },
    ],

    industries: [
      "Professional Services",
      "E-Commerce",
      "SaaS",
      "Financial Services",
      "Marketing & Advertising",
      "Retail"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["document-invoice-automation", "erp-integration", "lead-routing"],
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
      "Instant Generation — Deal marked won → invoice generated and sent in seconds — no copy-paste.",
      "Zero Errors — Data pulled from your CRM — fewer typos, wrong amounts, or missing line items.",
      "Automated Reminders — Overdue invoices trigger polite, escalating reminders via email and WhatsApp.",
      "Multi-Channel Delivery — Email, WhatsApp, or client portal — PDF and payment link in one flow.",
      "Payment Tracking — Live view of paid, pending, and overdue across clients.",
    ],

    deliverables: [
      "Template Design — Branded invoices, proposals, contracts, and receipts — consistent and professional.",
      "CRM-Triggered Generation — Documents when deal stage changes, orders land, or milestones hit.",
      "Multi-Channel Delivery — Automated sending via email, WhatsApp, and client portal with PDFs.",
      "Payment Gateway Integration — Razorpay, Stripe, or PayU links embedded in invoices.",
      "Overdue Reminder Sequences — Escalating reminders (e.g. day 3, 7, 14, 30) — tone and cadence you control.",
      "Payment Tracking Dashboard — Generated, sent, viewed, paid, and overdue — in one place.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 60 days — volume and payment behaviour will vary by client base.",
      beforeLabel: "Before",
      afterLabel: "After ~60 days",
      rows: [
        { label: "Invoice generation speed (score)", before: 22, after: 96 },
        { label: "On-time invoice send rate", before: 72, after: 100 },
        { label: "Payment collection speed (score)", before: 48, after: 78 },
        { label: "Manual document error rate (inverse)", before: 68, after: 98 },
        { label: "Overdue follow-up discipline (score)", before: 42, after: 96 },
      ],
    },

    faqs: [
      {
        question: "Can it handle different currencies and tax structures?",
        answer:
          "Yes — GST, IGST, multi-currency, and country-specific tax formatting are supported where your stack allows.",
      },
      {
        question: "Can I customise the reminder tone?",
        answer:
          "Yes — from gentle nudges to firmer reminders. You control copy, frequency, and escalation.",
      },
      {
        question: "Does it integrate with my accounting software?",
        answer:
          "We integrate with tools like Tally, Zoho Books, QuickBooks, and Xero so data can flow both ways and you avoid double entry.",
      },
      {
        question: "Can clients sign documents digitally?",
        answer:
          "Yes — we can wire in e-signature tools such as DocuSign, SignNow, or Digio for contracts and agreements.",
      },
    ],

    industries: [
      "Agencies",
      "Freelancers",
      "Professional Services",
      "Legal",
      "Financial Services",
      "E-Commerce",
      "Manufacturing"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["no-code-workflow", "erp-integration", "notification-systems"],
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
      "Instant Assignment — Lead arrives → assigned in seconds — no shared inbox triage.",
      "Rule-Based Intelligence — Route by geography, language, product, deal size, or custom fields you define.",
      "Auto-Escalation — If a rep misses your SLA (e.g. five minutes), the lead moves to the next available person automatically.",
      "Multi-Channel Notification — WhatsApp, Slack, SMS, or email — wherever your team responds fastest.",
      "Full Accountability — Assignment-to-response and outcomes visible per rep for coaching and reporting.",
    ],

    deliverables: [
      "Routing Logic Design — Rules aligned to territories, products, deal size, round-robin, or weighted distribution.",
      "CRM Integration — Assignment fields, status tracking, and pipeline updates in your CRM.",
      "Real-Time Notifications — Instant alerts to the assigned rep across your chosen channels.",
      "Escalation Workflows — Timed escalation when nobody acts within X minutes — backup path included.",
      "Response Time Dashboard — Assignment-to-first-response for every rep, lead, and day.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 30 days — lead volume and team size will shift your baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~30 days",
      rows: [
        { label: "Lead assignment speed (score)", before: 28, after: 96 },
        { label: "First response time (score)", before: 22, after: 88 },
        { label: "Leads lost / unassigned (burden index)", before: 72, after: 8 },
        { label: "Lead-to-conversion lift (index)", before: 50, after: 72 },
        { label: "Workload balance (score)", before: 42, after: 86 },
      ],
    },

    faqs: [
      {
        question: "Can it handle leads from multiple sources?",
        answer:
          "Yes — website forms, ads, WhatsApp, email, marketplaces, and referrals can all feed one routing layer so rules stay consistent.",
      },
      {
        question: "What if a rep is on leave?",
        answer:
          "Availability is part of the design. Unavailable reps are skipped and leads route to the next eligible person.",
      },
      {
        question: "Can I change routing rules myself?",
        answer:
          "Yes. We build for admins — adding a rep or changing territories is usually minutes, not a rebuild.",
      },
    ],

    industries: [
      "Real Estate",
      "Education",
      "Insurance",
      "Financial Services",
      "SaaS",
      "Professional Services"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["no-code-workflow", "notification-systems", "ai-sales-agent"],
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
      "Real-Time Sync — Data moves between systems without batch jobs or daily exports — keep every app current.",
      "Zero Duplicate Entry — Capture once; updates propagate to ERP, CRM, commerce, and accounting automatically.",
      "Custom API Bridges — Connect products that do not offer native integrations via bespoke connectors.",
      "Error Handling — Failed syncs retry, log, and alert — issues do not fail silently.",
      "Scalable Architecture — Designed for growing order volume and master data without constant rework.",
    ],

    deliverables: [
      "System Audit & Architecture — Map tools, data flows, and bottlenecks — produce an integration blueprint.",
      "API Development — Custom connectors where off-the-shelf links do not exist.",
      "Real-Time Data Sync — Bi-directional sync across ERP, CRM, e-commerce, and accounting stacks.",
      "Error Handling & Logging — Retries, structured logs, and alerting for operations teams.",
      "Data Mapping & Transformation — Field mapping, units, currencies, and validation between schemas.",
      "Documentation & Maintenance — Technical runbooks plus an optional retainer for changes and incidents.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — stack size and transaction volume will move the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Manual reconciliation burden (index)", before: 78, after: 12 },
        { label: "Cross-system sync latency (score)", before: 32, after: 94 },
        { label: "Duplicate entry incidents (inverse)", before: 65, after: 96 },
        { label: "Reporting freshness (score)", before: 48, after: 98 },
        { label: "Connected ecosystem (score)", before: 35, after: 92 },
      ],
    },

    faqs: [
      {
        question: "Do you work with Tally?",
        answer:
          "Yes. We regularly integrate Tally Prime with CRMs, e-commerce, and custom dashboards — including vouchers, ledgers, and stock where scope allows.",
      },
      {
        question: "What if our ERP is legacy or doesn't have an API?",
        answer:
          "We use the right pattern for the system — database-level links, scheduled file sync (CSV/XML), or controlled RPA when APIs are not available.",
      },
      {
        question: "How do you handle data conflicts between systems?",
        answer:
          "We agree a source-of-truth order during architecture, then encode conflict rules so every field has a clear winner when values disagree.",
      },
    ],

    industries: [
      "Manufacturing",
      "E-Commerce",
      "Retail",
      "Healthcare",
      "Professional Services",
      "Logistics"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Enterprise",

    relatedServiceSlugs: ["no-code-workflow", "document-invoice-automation", "notification-systems"],
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
      "Real-Time Alerts — Critical events fire notifications in seconds — not after the next stand-up.",
      "Multi-Channel Delivery — WhatsApp, Slack, SMS, email, push — use the channel each person actually checks.",
      "Escalation Chains — Person A → Person B → manager with timeouts so ownership never goes missing.",
      "Custom Thresholds — Inventory floors, SLA burn, stale deals, payment failures — you define what “urgent” means.",
      "Daily/Weekly Digests — Leaders get summaries of volume, responses, and what still needs a human.",
    ],

    deliverables: [
      "Alert Trigger Mapping — Catalogue critical events, prioritise by impact, and agree monitoring scope.",
      "Multi-Channel Notification Setup — Per-event routing across WhatsApp, Slack, SMS, email, and push.",
      "Escalation Chain Design — Tiered paths with configurable timeouts and fallbacks.",
      "Digest & Summary Reports — Automated daily or weekly leadership rollups of signal vs noise.",
      "Alert History Dashboard — Who was notified, when, and what action was taken — full audit trail.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 30 days — event mix and team size will shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~30 days",
      rows: [
        { label: "Critical events missed (burden index)", before: 68, after: 6 },
        { label: "Response time to critical events (score)", before: 30, after: 90 },
        { label: "SLA breach exposure (index)", before: 65, after: 24 },
        { label: "Leadership visibility (proactive score)", before: 38, after: 88 },
      ],
    },

    faqs: [
      {
        question: "Can I customise which events trigger which alerts?",
        answer:
          "Yes — event types, thresholds, channels, and recipients are all configurable and can be changed as you learn.",
      },
      {
        question: "Will this create notification fatigue?",
        answer:
          "We tier severity and batch low-urgency items into digests so only true emergencies interrupt in real time.",
      },
      {
        question: "Can it trigger actions, not just notifications?",
        answer:
          "Yes — alerts can kick off automations such as pausing spend, opening tickets, or reassigning work, depending on your stack.",
      },
    ],

    industries: [
      "E-Commerce",
      "SaaS",
      "Healthcare",
      "Logistics",
      "Professional Services"
    ],

    serviceType: "Workflow Automation",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["no-code-workflow", "lead-routing", "erp-integration"],
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
      "Full-Funnel Architecture — Awareness, consideration, and conversion campaigns wired to work together.",
      "AI Creative Testing — Run many variants in parallel so winners surface faster and scale sooner.",
      "Lookalike Audiences — Blend Meta signals with your first-party data to find more high-fit prospects.",
      "Real-Time Lead Delivery — Leads land in CRM and WhatsApp instantly — no CSV limbo.",
      "Transparent Reporting — Weekly views of CPL, ROAS, creative performance, and what we change next.",
    ],

    deliverables: [
      "Campaign Strategy & Funnel Design — Audience research, funnel build, budget split, and KPIs.",
      "Ad Creative Production — Static, carousel, video, and UGC-style ads — typically 10–20 variants per month in scope.",
      "Campaign Build & Launch — Ads Manager setup: targeting, placements, bidding, and tracking.",
      "A/B Testing Framework — Structured tests across audiences, creatives, copy, and landing experiences.",
      "CRM & Lead Delivery Integration — Instant push to CRM plus WhatsApp alerts for sales.",
      "Weekly Performance Reports — CPL, CPA, ROAS, creative breakdown, and optimisation notes.",
      "Monthly Strategy Reviews — Deeper readouts, new audience tests, and next-month plan.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 60–90 days of optimisation — offer, spend, and creative volume all move the baseline.",
      beforeLabel: "Before (typical)",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Cost per lead efficiency (score)", before: 35, after: 78 },
        { label: "ROAS / return on ad spend (index)", before: 42, after: 82 },
        { label: "Creative win rate (AI-tested)", before: 28, after: 68 },
        { label: "Lead quality / funnel fit (score)", before: 52, after: 84 },
        { label: "Reporting clarity (score)", before: 45, after: 90 },
      ],
    },

    faqs: [
      {
        question: "What's the minimum ad budget you work with?",
        answer:
          "We usually recommend at least roughly ₹30,000/month in media for enough signal to optimise. Management fees are quoted separately.",
      },
      {
        question: "Do you create the ad creatives too?",
        answer:
          "Yes — images, carousels, video, and copy are in scope, including UGC-style tests that often beat overly polished assets.",
      },
      {
        question: "How quickly will I see results?",
        answer:
          "First leads often appear within 48–72 hours of launch. Stable, profitable performance typically needs about 4–8 weeks of iteration on real data.",
      },
      {
        question: "Will you manage the ad account or do I need to give access?",
        answer:
          "We operate inside your Meta ad account so you keep ownership. We use partner access — not a full admin takeover — so you stay in control.",
      },
    ],

    industries: [
      "E-Commerce",
      "Real Estate",
      "Education",
      "Healthcare",
      "F&B",
      "Retail",
      "Professional Services"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["google-ads", "retargeting", "linkedin-ads"],
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
      "Intent-Based Traffic — Reach people actively searching — often the warmest traffic in paid media.",
      "Negative Keyword Management — Continuous pruning of junk queries so spend goes to plausible buyers.",
      "Smart Bidding — Let Google’s bidding models chase conversions or target ROAS within guardrails we set.",
      "Shopping Feed Automation — Merchant Center and product data stay accurate and synced from your store.",
      "Conversion Tracking — Calls, forms, purchases, and key micro-conversions wired for real attribution.",
    ],

    deliverables: [
      "Keyword Research & Strategy — High-intent terms, competitor view, and sensible campaign structure.",
      "Campaign Build (Search + Display + Shopping) — Ad groups, match types, extensions, and bid strategies.",
      "Ad Copy & Extensions — Headlines, descriptions, sitelinks, callouts, and structured snippets.",
      "Conversion Tracking Setup — Full-funnel measurement across the actions that matter to you.",
      "Shopping Feed Management — Merchant Center setup, feed hygiene, and ongoing sync with your commerce stack.",
      "Landing Page Recommendations — Quality Score levers: relevance, speed, and CTA alignment.",
      "Monthly Optimisation & Reporting — Bid and keyword work, creative refreshes, and clear performance readouts.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — category, geography, and spend level all shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Cost per conversion efficiency (score)", before: 42, after: 72 },
        { label: "Wasted spend / irrelevant clicks (burden index)", before: 68, after: 18 },
        { label: "ROAS (e-commerce index)", before: 48, after: 82 },
        { label: "Quality Score (avg index)", before: 52, after: 78 },
        { label: "Conversion coverage (tracked)", before: 55, after: 100 },
      ],
    },

    faqs: [
      {
        question: "How does Google Ads compare to Meta Ads?",
        answer:
          "Google captures existing demand from search; Meta often creates demand with creative in feed. Strong accounts usually blend both — Google for high-intent capture, Meta for scale and prospecting.",
      },
      {
        question: "What's the minimum budget?",
        answer:
          "We typically suggest about ₹50,000+/month for meaningful Search learning, and about ₹30,000+/month minimum for Shopping — below that, optimisation data gets thin.",
      },
      {
        question: "Do you manage Google Shopping feeds?",
        answer:
          "Yes — Merchant Center setup, feed optimisation, and ongoing sync with your e-commerce platform are in scope.",
      },
      {
        question: "Can you improve my Quality Score?",
        answer:
          "Yes — we work expected CTR, ad relevance, and landing page experience, which are the main inputs Google uses and which flow through to CPC efficiency.",
      },
    ],

    industries: [
      "Healthcare",
      "Legal",
      "SaaS",
      "E-Commerce",
      "Education",
      "Professional Services"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["meta-ads", "retargeting", "linkedin-ads"],
  },
  {
    id: 45,
    slug: "youtube-ads",
    name: "YouTube Video Advertising",
    category: "Performance Marketing & Paid Advertising",
    categoryId: 3,

    shortDescription:
      "In-stream, bumper, and Shorts ads that build brand recall and drive action — from script to screen to optimisation.",

    fullDescription:
      "End-to-end YouTube advertising — from scripting and video production to campaign setup, audience targeting, and performance optimisation. We create skippable in-stream ads, six-second bumpers, discovery placements, and Shorts ads built for recall and measurable action. YouTube is one of the largest video surfaces in the market; video routinely earns higher engagement than static units, and a tight production pipeline keeps creative iteration affordable.",

    benefits:
      "Video builds emotional connection and memory — strong creative lifts brand recall, direct searches, and purchase intent versus static alone. You get TV-scale reach with digital-style targeting at a fraction of linear TV cost. Campaigns are optimised for outcomes, not vanity: view-through and click-through attribution show how exposure drives site visits, sign-ups, and sales even when people do not click the ad.",

    automationPoints: [
      "Multi-Format Coverage — In-stream, bumper, discovery, and Shorts — matched to funnel stage.",
      "Intent-Based Targeting — Layer Google search signals and interests so video hits people with relevant intent.",
      "Sequential Storytelling — Awareness → consideration → conversion narratives across placements.",
      "Full Production Pipeline — Script, storyboard, shoot or animate, edit, and format for each surface.",
      "View-Through Attribution — Measure impact when viewers convert without clicking the ad.",
    ],

    deliverables: [
      "Video Ad Production — Scripting, storyboarding, filming or animation, editing, and platform-specific cuts.",
      "Campaign Setup — In-stream, bumper, discovery, and Shorts live in Google Ads with correct structures.",
      "Audience Targeting — Custom audiences, in-market segments, search-intent signals, and remarketing lists.",
      "Conversion Tracking — View-through and click-through goals wired for honest attribution.",
      "A/B Testing — Thumbnails, CTAs, lengths, and hooks tested on a clear learning agenda.",
      "Performance Reporting — Views, VTR, CPV, conversions, brand-lift style reads where available, and creative next steps.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — category, creative volume, and spend level all move the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Brand search lift (index)", before: 48, after: 68 },
        { label: "CPV efficiency (score)", before: 42, after: 82 },
        { label: "View-through rate (score)", before: 38, after: 72 },
        { label: "Ad recall / memorability (index)", before: 50, after: 76 },
        { label: "Site traffic from YouTube (score)", before: 28, after: 78 },
      ],
    },

    faqs: [
      {
        question: "Do I need professional video? Can we use phone-shot content?",
        answer:
          "Both can work. Authentic UGC-style phone footage often wins in tests; we produce what fits the brief and let performance pick the winners.",
      },
      {
        question: "What's the minimum ad budget for YouTube?",
        answer:
          "We usually suggest about ₹50,000+/month in media for enough reach and learning. CPV on YouTube is often efficient versus other video buys, but optimisation still needs volume.",
      },
      {
        question: "Can YouTube ads drive direct sales, not just awareness?",
        answer:
          "Yes — with solid conversion tracking and retargeting, YouTube drives measurable outcomes. View-through attribution credits conversions after exposure even when there is no click.",
      },
    ],

    industries: [
      "Education",
      "E-Commerce",
      "SaaS",
      "Real Estate",
      "Healthcare",
      "Professional Services"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["google-ads", "meta-ads", "retargeting"],
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
      "Precision Targeting — Title, seniority, company size, industry, and skills — tight fit to your ICP.",
      "Pre-Filled Lead Forms — One-tap submits with profile data; fewer drop-offs than long landing-page forms.",
      "Thought Leadership Ads — Put guides, reports, and POV content in front of the right buyers.",
      "Account-Based Targeting — Upload target accounts and reach people who work there.",
      "CRM Sync — Leads land in your CRM with firmographic context — minimal CSV cleanup.",
    ],

    deliverables: [
      "LinkedIn Ad Strategy — Audience blueprint, campaign architecture, content plan, and budget split.",
      "Sponsored Content Campaigns — Single image, carousel, video, and document ads for offers and content.",
      "Lead Gen Form Campaigns — Native forms that capture decision-maker data with low friction.",
      "Ad Creative Production — Creative and copy tuned for professional contexts.",
      "CRM Integration — Instant delivery to HubSpot, Salesforce, Zoho, Pipedrive, or similar with full fields.",
      "Monthly Performance Reviews — CPL, pipeline value, lead-quality readouts, and next optimisations.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — ICP narrowness and deal size will shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Lead quality / ICP match (score)", before: 52, after: 86 },
        { label: "Cost per qualified lead (efficiency)", before: 36, after: 72 },
        { label: "Pipeline value vs. ad spend (index)", before: 44, after: 78 },
        { label: "Visibility among ICP (score)", before: 34, after: 74 },
      ],
    },

    faqs: [
      {
        question: "LinkedIn ads are expensive — is it worth it?",
        answer:
          "CPL is usually higher than Meta, but B2B quality is often much stronger — a verified decision-maker lead can outweigh many low-intent social leads at a lower sticker price.",
      },
      {
        question: "What's the minimum budget?",
        answer:
          "We typically recommend about ₹75,000+/month in media so the algorithm gets enough signal. LinkedIn tends to reward consistent spend and learning time.",
      },
      {
        question: "Can you target specific companies?",
        answer:
          "Yes — list-based Account-Based Marketing lets you upload target companies and reach their employees with matched messaging.",
      },
    ],

    industries: [
      "SaaS",
      "Professional Services",
      "Manufacturing",
      "Education",
      "Finance",
      "Staffing & Recruitment"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["google-ads", "meta-ads", "youtube-ads"],
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
      "Audience Segmentation — Different messages for cart abandoners, pricing viewers, homepage visitors, and engagers.",
      "Dynamic Product Ads — Show the exact SKUs people browsed — pricing and availability stay current.",
      "Cross-Platform Reach — Google Display, Meta, and programmatic inventory so warm traffic sees you again.",
      "Frequency Capping — Caps and sequencing so reminders feel helpful, not spammy.",
      "Full Attribution — See which retargeting paths assist conversions and shift budget to what works.",
    ],

    deliverables: [
      "Pixel & Tracking Setup — Meta Pixel, Google tags, and programmatic pixels installed, tested, and trusted.",
      "Audience Segmentation — Visitors, engagers, cart and form abandoners, buyers (exclusions), and custom rules.",
      "Dynamic Product Ads — Feed-linked creative for viewed products with live pricing where supported.",
      "Cross-Platform Campaigns — Unified retargeting across Display, Meta, and programmatic partners.",
      "Frequency & Attribution Management — Caps, sequential stories, and conversion modelling you can act on.",
      "Performance Reporting — Return-visitor lift, recovery rates, ROAS, and channel-level attribution reads.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 60 days — traffic quality, catalog size, and offer all shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~60 days",
      rows: [
        { label: "Return visitor conversion (score)", before: 28, after: 68 },
        { label: "Cart abandonment recovery (index)", before: 8, after: 52 },
        { label: "CPA vs. cold traffic (efficiency)", before: 45, after: 78 },
        { label: "Multi-touch brand recall (score)", before: 38, after: 76 },
      ],
    },

    faqs: [
      {
        question: "Isn't retargeting creepy?",
        answer:
          "When frequency and creative match real intent, it feels like a useful reminder. We cap impressions, refresh creative, and avoid chasing people with irrelevant angles.",
      },
      {
        question: "How does this work with privacy changes (iOS, cookies)?",
        answer:
          "We lean on first-party data, server-side tagging where appropriate, and platform-native audiences so remarketing stays useful as identifiers change.",
      },
      {
        question: "What's the minimum website traffic needed?",
        answer:
          "Roughly 1,000+ monthly visitors is a practical floor — smaller pools often cannot exit learning mode or segment cleanly.",
      },
    ],

    industries: [
      "E-Commerce",
      "SaaS",
      "Education",
      "Real Estate",
      "Professional Services"
    ],

    serviceType: "Paid Ads",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["meta-ads", "google-ads", "programmatic-ads"],
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
      "Keyword-Driven Topics — Every brief ties to real search demand — not random editorial ideas.",
      "Pillar + Cluster Architecture — Hub-and-spoke structures that reinforce topical authority.",
      "Link-Worthy Content — Original angles, data, and assets designed to earn citations.",
      "Consistent Publishing — Roughly four to eight quality pieces per month so momentum compounds.",
      "Multi-Format Distribution — Repurpose long-form into social, email, and LinkedIn touchpoints.",
    ],

    deliverables: [
      "Content Audit & Gap Analysis — Inventory what you have, what competitors cover, and where you can win.",
      "Keyword & Topic Strategy — Clustering, prioritisation, and a six-month editorial calendar.",
      "Content Creation (4–8/month) — SEO-led blogs, guides, listicles, and authority pieces.",
      "On-Page SEO — Titles, meta, internal links, schema where it fits, and media hygiene.",
      "Link Building Outreach — Guest posts, digital PR, and resource outreach for authoritative links.",
      "Monthly Performance Reports — Rankings, traffic, backlinks, winners, and next-month focus.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly twelve months — niche difficulty and starting authority move the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~12 months",
      rows: [
        { label: "Organic traffic (index)", before: 32, after: 78 },
        { label: "Top-10 keyword coverage (index)", before: 28, after: 72 },
        { label: "Domain authority / strength (score)", before: 38, after: 68 },
        { label: "Content-attributed pipeline (score)", before: 30, after: 70 },
        { label: "Quality backlinks earned (index)", before: 25, after: 72 },
      ],
    },

    faqs: [
      {
        question: "How is this different from just hiring a writer?",
        answer:
          "A writer executes pages. We run the system — what to publish, why it matters for revenue, and how each piece connects to clusters, links, and measurement.",
      },
      {
        question: "How long before content drives meaningful traffic?",
        answer:
          "Early rankings often appear in two to three months; compounding traffic more commonly builds from month four to six onward as authority accrues.",
      },
      {
        question: "Can we use AI for content creation?",
        answer:
          "We may use AI for research and first drafts, but everything ships human-edited, fact-checked, and enriched with original insight — quality beats volume for durable rankings.",
      },
    ],

    industries: [
      "SaaS",
      "Professional Services",
      "E-Commerce",
      "Healthcare",
      "Finance",
      "Manufacturing"
    ],

    serviceType: "Content",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["technical-seo", "local-seo", "social-media-management"],
  },
  {
    id: 46,
    slug: "ai-powered-content",
    name: "AI-Powered Content at Scale",
    category: "SEO, Content & Organic Growth",
    categoryId: 4,

    shortDescription:
      "Produce 50–100 SEO-optimised pages per month — research-backed, human-edited, and brand-consistent — at a fraction of traditional content costs.",

    fullDescription:
      "An AI-assisted content production system that can deliver dozens to 100+ SEO-led articles, landing pages, and product descriptions each month. Every piece is keyword-targeted, checked for factual issues, human-edited, and prepared for your CMS. We build custom workflows with brand voice training, structured prompts, and editorial gates so output ranks, reads well, and supports conversion — not generic filler.",

    benefits:
      "Cover large keyword sets in months instead of years while competitors are still planning. Cut production cost versus traditional per-article agency pricing while keeping QA, voice, and SEO standards. Volume runs through a defined quality path — fact-checking, brand alignment, optimisation, and human polish — so scale does not mean sloppy.",

    automationPoints: [
      "Massive Output — Fifty to 100+ pages per month when the brief and approvals keep pace — built to blanket your keyword universe faster.",
      "Brand Voice Trained — Models and prompts tuned on your guidelines, tone, and examples so drafts start on-brand.",
      "Human QA Layer — Editors review, tighten, and verify before anything ships.",
      "SEO-First — Keyword targets, internal links, meta, and schema baked into templates.",
      "CMS-Ready — Structured for WordPress, Webflow, or your stack — formatting, links, and media hooks included.",
    ],

    deliverables: [
      "Content Pipeline Setup — Workflow design, voice training, prompt library, and quality gates.",
      "Keyword & Topic Research — Opportunity mapping by template type (blog, landing, PDP, FAQ).",
      "AI Content Generation — High-volume drafts for blogs, landings, product copy, and FAQs within agreed scope.",
      "Human Editing & QA — Fact-checking, readability, brand review, and SEO verification.",
      "CMS Upload & Formatting — Publish-ready markup, internal links, meta, and imagery where supplied.",
      "Performance Tracking — Monthly views on traffic, rankings, and per-asset performance.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly six months — starting library size and crawl budget change the curve.",
      beforeLabel: "Before",
      afterLabel: "After ~6 months",
      rows: [
        { label: "Content published per month (index)", before: 22, after: 88 },
        { label: "Keyword coverage (score)", before: 30, after: 82 },
        { label: "Organic traffic lift (index)", before: 35, after: 78 },
        { label: "Cost per article (efficiency index)", before: 28, after: 76 },
        { label: "Time to publish (speed score)", before: 40, after: 85 },
      ],
    },

    faqs: [
      {
        question: "Will Google penalise AI content?",
        answer:
          "Google targets low-quality or unhelpful pages, not the tool used to draft. Human editing, fact-checking, and clear value alignment keep pages within helpful-content expectations.",
      },
      {
        question: "How do you maintain brand voice across 100 articles?",
        answer:
          "Voice docs, exemplar content, and prompt rules set the baseline; editors enforce consistency on every batch.",
      },
      {
        question: "Can you handle technical or niche topics?",
        answer:
          "Yes — we combine domain research and SME review where needed. AI handles structure and speed; specialists guard accuracy.",
      },
    ],

    industries: [
      "E-Commerce",
      "Marketplaces",
      "Media & Publishing",
      "SaaS",
      "Agencies"
    ],

    serviceType: "Content",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["content-seo", "technical-seo", "social-media-management"],
  },
  {
    id: 47,
    slug: "answer-engine-optimisation",
    name: "Answer Engine Optimisation (AEO)",
    category: "SEO, Content & Organic Growth",
    categoryId: 4,

    shortDescription:
      "Get your business cited by ChatGPT, Perplexity, Google AI Overviews, and Siri — because the future of search is answers, not links.",

    fullDescription:
      "Optimisation for answer engines: structured data, FAQ and HowTo schema, conversational Q&A content, entity signals, and citation planning so your brand can surface in AI summaries, overviews, and voice answers. Search interfaces are shifting; brands that make facts machine-readable and well-sourced are more likely to be recommended when users ask for the “best” option in a category.",

    benefits:
      "Being named in an AI overview or assistant response is a strong trust shortcut — often more memorable than a blue link alone. Investing in AEO alongside classic SEO hedges the shift toward AI-mediated discovery. Citations and structured answers also compound: clearer entities and sources make every future query a little easier to win.",

    automationPoints: [
      "AI Answer Visibility — Aim for presence in tools and surfaces people use for recommendations, not only ten-blue-links SERPs.",
      "Featured Snippets — Content and markup shaped for position-zero style extraction.",
      "Entity Authority — Strengthen how clearly machines understand who you are and what you do.",
      "Voice Search Ready — Direct, conversational phrasing that matches how people ask aloud.",
      "Future-Proof Layer — Builds on SEO fundamentals with formats engines already prefer to quote.",
    ],

    deliverables: [
      "AEO Audit — How you show up in AI-style answers today versus competitors.",
      "Schema & Structured Data — FAQ, HowTo, Organization, Product, Review, and related markup where relevant.",
      "Conversational Content — Question-and-answer pages and sections tuned for extraction.",
      "Entity Building — Wikipedia, Wikidata, Crunchbase, and Knowledge Panel hygiene within policy and notability rules.",
      "Citation Strategy — Earn mentions on sources models and crawlers frequently reuse.",
      "Monthly Tracking — Manual platform checks, monitoring, and referral reads with competitor context.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly six months — category, competition, and corpus size all move the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~6 months",
      rows: [
        { label: "AI / overview citations (score)", before: 18, after: 68 },
        { label: "Featured snippets (index)", before: 25, after: 72 },
        { label: "Schema coverage on key pages", before: 42, after: 100 },
        { label: "Voice / assistant visibility (score)", before: 22, after: 62 },
        { label: "Brand search interest (index)", before: 45, after: 62 },
      ],
    },

    faqs: [
      {
        question: "Can you guarantee we'll appear in ChatGPT answers?",
        answer:
          "No ethical partner can guarantee a specific placement. We stack the inputs models lean on — structure, entities, citations, and helpful content — which correlates with being referenced more often.",
      },
      {
        question: "Is AEO different from SEO?",
        answer:
          "AEO extends SEO. Classic SEO wins rankings; AEO targets being quoted inside AI-generated answers and overviews that increasingly sit above traditional results.",
      },
      {
        question: "How do you track AI citations?",
        answer:
          "We combine periodic manual prompts across major assistants, brand monitoring where useful, and referral or landing-page signals to infer when AI-sourced traffic appears.",
      },
    ],

    industries: [
      "SaaS",
      "E-Commerce",
      "Professional Services",
      "Healthcare",
      "Finance"
    ],

    serviceType: "SEO",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["technical-seo", "content-seo", "ai-powered-content"],
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
      "Map Pack Rankings — Target visibility in the top Google Maps results for your priority services and areas.",
      "Review Generation — Systematic requests that build proof and support local ranking signals.",
      "Citation Consistency — NAP aligned across dozens of listings so Google trusts your location data.",
      "Local Content — Area and service pages that reinforce relevance for “near me” intent.",
      "Competitor Tracking — Monthly checks against your top local rivals so gaps are visible early.",
    ],

    deliverables: [
      "Google Business Profile Optimisation — Categories, attributes, photos, posts, Q&A, products and services.",
      "Local Keyword Strategy — “Near me” and geo-specific research with competitive context.",
      "Citation Building & Cleanup — Fifty-plus directory coverage with inconsistent NAP corrected.",
      "Review Management System — WhatsApp/SMS request flows, response templates, and monitoring.",
      "Local Link Building — Citations, chambers, community, and other locally relevant links.",
      "Monthly Rank Reports — Map Pack, organic local visibility, competitor snapshots, and review metrics.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly six months — competition and market density will shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~6 months",
      rows: [
        { label: "Google Maps views (index)", before: 38, after: 78 },
        { label: "Calls from listing (score)", before: 42, after: 72 },
        { label: "Map Pack keyword coverage (index)", before: 28, after: 68 },
        { label: "Review volume & rating (score)", before: 48, after: 88 },
        { label: "Direction requests (score)", before: 36, after: 70 },
      ],
    },

    faqs: [
      {
        question: "How long before I see results?",
        answer:
          "Profile engagement and visibility often move within four to six weeks. Competitive Map Pack gains usually need roughly three to six months of sustained work.",
      },
      {
        question: "Can you help with negative reviews?",
        answer:
          "Yes — we help with professional, empathetic responses and a steady flow of positive reviews so one-off negatives carry less weight.",
      },
      {
        question: "Do you cover multiple locations?",
        answer:
          "Yes — we can run multi-location GBP setups and location-specific landing pages per branch.",
      },
    ],

    industries: [
      "Healthcare",
      "Restaurants",
      "Salons",
      "Real Estate",
      "Legal",
      "Professional Services",
      "Home Services",
      "Retail"
    ],

    serviceType: "SEO",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["technical-seo", "content-seo", "social-media-management"],
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
      "98% Open Rates — Messages are read — not buried like typical email inboxes.",
      "Catalogue Selling — Browse, shortlist, and pay without leaving the thread.",
      "Broadcast Campaigns — Segmented sends with personalisation and strong reply rates when opt-in is clean.",
      "Payment Collection — UPI, Razorpay, and gateway links inside the chat for low-friction checkout.",
      "CRM Integration — Threads and customer context flow into HubSpot, Zoho, Shopify, or your stack.",
    ],

    deliverables: [
      "API Setup & Green Tick — Business API onboarding, verification support, and official account hygiene.",
      "Automated Conversation Flows — Welcome, FAQ, order tracking, booking, and support paths.",
      "Broadcast System — Segmentation, scheduling, template governance, and personalisation fields.",
      "Catalogue Integration — Product feed sync from your commerce platform into WhatsApp.",
      "Payment Integration — In-chat payment links via Razorpay, UPI, and other supported gateways.",
      "CRM & Tool Sync — Bi-directional data with HubSpot, Zoho, Shopify, and custom connectors where needed.",
      "Analytics Dashboard — Delivery, read and reply rates, funnel conversion, and campaign ROI.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 60 days — list quality, offer, and template mix all shift outcomes.",
      beforeLabel: "Before",
      afterLabel: "After ~60 days",
      rows: [
        { label: "Message open rate vs. email (score)", before: 32, after: 96 },
        { label: "Campaign response rate (score)", before: 28, after: 72 },
        { label: "Support automation coverage", before: 12, after: 78 },
        { label: "Revenue via WhatsApp (index)", before: 8, after: 58 },
        { label: "Customer satisfaction (score)", before: 52, after: 82 },
      ],
    },

    faqs: [
      {
        question: "What's the difference between WhatsApp Business App and API?",
        answer:
          "The free app suits very small teams on one number with limited automation. The API scales devices, templates, broadcasts, deep automation, CRM links, and in-chat payments.",
      },
      {
        question: "How much does the WhatsApp API cost?",
        answer:
          "Meta bills per conversation (roughly ₹0.30–0.75 depending on category). Our implementation and management fees are quoted separately — total cost still often beats heavy SMS or call-centre load for the same outcomes.",
      },
      {
        question: "Can I send bulk promotions without getting blocked?",
        answer:
          "Yes when lists are opted-in, templates are approved, and send patterns respect quality rules. We design for compliance, velocity limits, and ongoing health monitoring.",
      },
    ],

    industries: [
      "E-Commerce",
      "D2C",
      "F&B",
      "Healthcare",
      "Education",
      "Real Estate",
      "Retail"
    ],

    serviceType: "Messaging",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["email-marketing", "sms-rcs", "omnichannel-inbox"],
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
      "Automated Drip Sequences — Welcome, nurture, onboarding, win-back, and re-engagement — running without constant manual sends.",
      "Smart Segmentation — Behaviour, funnel stage, interest, and engagement tiers so each cohort gets relevant copy.",
      "Revenue Attribution — Tie sends to purchases and pipeline, not only opens and clicks.",
      "Deliverability Optimisation — SPF, DKIM, DMARC, warm-up, and hygiene so mail lands in the inbox.",
      "Beautiful Templates — Branded, responsive layouts that read well on mobile and support your CTAs.",
    ],

    deliverables: [
      "ESP Setup & Migration — Brevo, Mailchimp, ConvertKit, ActiveCampaign, or your chosen stack.",
      "Deliverability Setup — Authentication, warm-up, and list cleaning for maximum inbox placement.",
      "Drip Sequence Design — Welcome, nurture, onboarding, re-engagement, and win-back flows.",
      "Template Design — Branded templates for campaigns and automations, mobile-first.",
      "Campaign Management — Roughly four to eight broadcasts per month per scope — promos, newsletters, launches.",
      "Performance Analytics — Opens, clicks, conversions, revenue attribution, and A/B test results.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — list quality, send frequency, and offer mix all shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Email open rate (score)", before: 38, after: 72 },
        { label: "Click-through rate (score)", before: 28, after: 62 },
        { label: "Revenue share from email (index)", before: 22, after: 58 },
        { label: "Lead nurture consistency (score)", before: 35, after: 82 },
        { label: "Inbox placement / deliverability", before: 62, after: 96 },
      ],
    },

    faqs: [
      {
        question: "Which email platform do you recommend?",
        answer:
          "It depends on stack and complexity — Brevo for blended transactional plus marketing, Mailchimp for simplicity, ConvertKit for creator-style journeys, ActiveCampaign for deep automation. We pick after your data model and integrations are clear.",
      },
      {
        question: "My emails go to spam — can you fix that?",
        answer:
          "Usually yes — authentication fixes, list hygiene, domain warm-up, and sending-pattern tuning resolve most issues. We treat deliverability as a system, not a one-off DNS tweak.",
      },
      {
        question: "How often should we send emails?",
        answer:
          "Broadly two to four per week for many e-commerce brands and one to two for B2B — we validate with frequency tests and engagement curves so you do not burn the list.",
      },
    ],

    industries: [
      "E-Commerce",
      "SaaS",
      "Education",
      "Professional Services",
      "Coaching",
      "Manufacturing"
    ],

    serviceType: "Messaging",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["whatsapp-business", "sms-rcs", "omnichannel-inbox"],
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
      "Universal Reach — SMS works on every handset — including users who do not use WhatsApp or email daily.",
      "Instant Delivery — Sub-minute reads for SMS; ideal for OTPs, alerts, and time-bound offers.",
      "RCS Rich Media — Images, carousels, buttons, and branded senders on supported Android devices.",
      "DLT Compliant — India DLT registration, sender IDs, and approved templates handled end to end.",
      "Automation Ready — Event-triggered SMS for payments, shipping, reminders, and lifecycle touches.",
    ],

    deliverables: [
      "DLT Registration & Setup — Entity registration, sender ID, template approval, and compliance configuration.",
      "SMS Gateway Integration — CRM, commerce, or backend hooks for transactional and batch sends.",
      "RCS Setup & Creative — Branded profiles, rich assets, and interactive layouts where carriers support RCS.",
      "Campaign Management — Promotional sends with segmentation, scheduling, and A/B tests.",
      "Automation Flows — OTPs, confirmations, reminders, and alerts wired to your systems.",
      "Delivery & Performance Reports — Delivery, reads (RCS), clicks, and ROI views.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 60 days — carrier mix, template mix, and list quality all shift outcomes.",
      beforeLabel: "Before",
      afterLabel: "After ~60 days",
      rows: [
        { label: "Message open rate (SMS / RCS score)", before: 42, after: 94 },
        { label: "RCS click-through rate (score)", before: 25, after: 68 },
        { label: "Delivery rate (DLT-compliant)", before: 78, after: 96 },
        { label: "OTP delivery speed (score)", before: 58, after: 92 },
      ],
    },

    faqs: [
      {
        question: "What's the difference between SMS and RCS?",
        answer:
          "SMS is plain text everywhere. RCS adds rich layouts — images, buttons, carousels, branding — on supported Android inboxes. SMS remains the universal fallback.",
      },
      {
        question: "Is DLT registration mandatory?",
        answer:
          "Yes for commercial SMS in India — entities, headers, and templates must be registered. We run the registration and approval workflow with your team.",
      },
      {
        question: "Can SMS work alongside WhatsApp?",
        answer:
          "Yes — SMS for universal, urgent, or OTP-style delivery; WhatsApp for richer commerce and support. Most stacks use both.",
      },
    ],

    industries: [
      "E-Commerce",
      "Banking",
      "Healthcare",
      "Logistics",
      "Retail",
      "Restaurants"
    ],

    serviceType: "Messaging",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["whatsapp-business", "email-marketing", "omnichannel-inbox"],
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
      "Behaviour-Triggered — Fires on what users do or skip — carts, sessions, milestones — not random blasts.",
      "Personalisation — Names, viewed items, locations, and segments in the payload when data allows.",
      "Rich Media — Images, actions, and deep links that move people to the right screen.",
      "A/B Testing — Copy, timing, and creative tuned with structured experiments.",
      "Web + Mobile — Browser and native app channels so you reach users outside the session.",
    ],

    deliverables: [
      "Infrastructure Setup — OneSignal, Firebase, CleverTap, or your stack — web and mobile push wired correctly.",
      "Segmentation & Audiences — Lifecycle, behaviour, geo, and engagement tiers.",
      "Automation Flows — Onboarding, abandonment, win-back, upsell, and transactional paths.",
      "In-App Messages — Banners, modals, and carousels triggered inside the product.",
      "A/B Testing Framework — Tests for copy, creative, send time, and CTAs.",
      "Analytics Dashboard — Delivery, opens, clicks, and downstream conversions by campaign and trigger.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 60 days — product type, baseline opt-in, and offer strength all move the curve.",
      beforeLabel: "Before",
      afterLabel: "After ~60 days",
      rows: [
        { label: "Push opt-in rate (score)", before: 32, after: 62 },
        { label: "Re-engagement rate (index)", before: 25, after: 68 },
        { label: "30-day retention lift (score)", before: 45, after: 72 },
        { label: "Cart abandonment recovery (index)", before: 8, after: 42 },
      ],
    },

    faqs: [
      {
        question: "Won't users find push notifications annoying?",
        answer:
          "Irrelevant or excessive sends cause fatigue. We lean on triggers, personalisation, and frequency caps so messages feel helpful reminders, not spam.",
      },
      {
        question: "Do web push notifications work on all browsers?",
        answer:
          "Chrome, Firefox, and Edge have broad support; Safari has constraints. We design prompts and fallbacks to maximise coverage on your audience mix.",
      },
      {
        question: "Can we send push notifications without a native app?",
        answer:
          "Yes — web push works from browsers after opt-in. Native apps add richer channels but are not required for web push.",
      },
    ],

    industries: [
      "E-Commerce",
      "SaaS",
      "Media",
      "Gaming",
      "Retail"
    ],

    serviceType: "Messaging",
    status: "In Progress",
    engagementSize: "Starter",

    relatedServiceSlugs: ["email-marketing", "whatsapp-business", "omnichannel-inbox"],
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
      "All Channels, One Dashboard — WhatsApp, Instagram, email, web chat, SMS, and more in one queue.",
      "AI-Assisted Replies — Suggested answers from your FAQs and past resolutions — humans stay in control.",
      "Team Routing & Assignment — Route by topic, language, channel, time window, or round-robin.",
      "Customer 360° View — Orders, history, tags, and notes beside the active thread — no re-asking.",
      "SLA Tracking — Response and resolution targets with visibility for managers.",
    ],

    deliverables: [
      "Platform Setup — Deploy on tools such as Respond.io, Trengo, or Interakt — configured to your stack.",
      "Channel Integration — WhatsApp, Instagram, Facebook Messenger, email, web chat, SMS, and phone transcripts where supported.",
      "Routing Rules — Auto-assignment by topic, language, channel, time of day, or round-robin.",
      "AI Reply Suggestions — Train suggestions on FAQs and approved macros for safer, faster replies.",
      "CRM Integration — HubSpot, Zoho, Salesforce, Pipedrive, or your CRM surfaced next to each thread.",
      "SLA & Performance Dashboard — Response and resolution metrics, workload, and team performance.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 30 days — volume, staffing, and channel mix will shift the baseline.",
      beforeLabel: "Before",
      afterLabel: "After ~30 days",
      rows: [
        { label: "Average response time (score)", before: 28, after: 88 },
        { label: "Missed / dropped conversations (burden index)", before: 62, after: 8 },
        { label: "Team efficiency (score)", before: 38, after: 78 },
        { label: "Channel visibility (unified index)", before: 32, after: 92 },
      ],
    },

    faqs: [
      {
        question: "Which platforms do you integrate?",
        answer:
          "Typically WhatsApp Business API, Instagram DMs, Facebook Messenger, email (major providers), web chat, SMS, Telegram, and phone transcripts. If a product exposes an API or webhook, we can usually connect it.",
      },
      {
        question: "Can multiple team members use it simultaneously?",
        answer:
          "Yes — multi-agent queues, roles, assignments, and internal notes so teams can collaborate without stepping on each other.",
      },
      {
        question: "Does it work with our existing CRM?",
        answer:
          "We integrate with HubSpot, Zoho, Salesforce, Pipedrive, and similar stacks so customer records sit beside the conversation.",
      },
    ],

    industries: [
      "E-Commerce",
      "Agencies",
      "Healthcare",
      "Hospitality",
      "SaaS",
      "Professional Services"
    ],

    serviceType: "Messaging",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["whatsapp-business", "email-marketing", "sms-rcs"],
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
      "Sub-2s Load Times — Performance budgets, media discipline, and hosting tuned so visits feel instant.",
      "Mobile-First Design — Layouts and interactions tested from small screens up.",
      "SEO-Ready Architecture — Semantic structure, metadata, and schema hooks from day one.",
      "CMS-Powered Content — Collections so marketing can ship pages without engineering for every edit.",
      "Conversion-Engineered UX — Sections, proof, and CTAs sequenced to support your funnel goals.",
    ],

    deliverables: [
      "Discovery & Strategy Workshop — Brand read, competitor scan, sitemap, and conversion plan before design.",
      "UI/UX Design (Figma) — Responsive frames for desktop, tablet, and mobile with clickable review prototypes.",
      "Development & Build — Webflow, Framer, or Next.js — animations, CMS, and integrations as scoped.",
      "Copywriting & Content — Benefit-led copy, CTAs, meta, and image alt text aligned to SEO.",
      "Analytics & Tracking Setup — GA4, GTM, Meta Pixel, and heatmaps (e.g. Hotjar or Clarity) with conversion events.",
      "Performance Optimisation — Images, lazy loading, CDN, and Core Web Vitals tuning toward strong PageSpeed scores.",
      "Launch & Handover — DNS/SSL, redirects, sitemap submission, and a content handover session for your team.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly 90 days — traffic mix, offer, and measurement must be in place for fair reads. Values are shown as percentages (scores and rates) as used by the chart below.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Mobile PageSpeed score", before: 40, after: 92 },
        { label: "Conversion rate", before: 1.5, after: 4.5 },
        { label: "Bounce rate", before: 72, after: 38 },
        { label: "Organic traffic (vs baseline)", before: 50, after: 85 },
      ],
    },

    faqs: [
      {
        question: "Why Webflow/Framer instead of WordPress?",
        answer:
          "For many marketing sites, Webflow and Framer pair visual editing with leaner front-ends, fewer plugin risks, and solid global hosting — often faster and simpler to operate than heavy WordPress stacks.",
      },
      {
        question: "Can I edit the site myself after launch?",
        answer:
          "Yes — Webflow and Framer include visual editors; we train your team and leave documentation. Next.js builds use a headless CMS (Notion, Sanity, Contentful, etc.) so content stays editable without code.",
      },
      {
        question: "Do you write the copy too?",
        answer:
          "Yes — conversion-focused copy is in scope: research-backed headlines, body copy, CTAs, and meta aligned to your positioning.",
      },
      {
        question: "What about e-commerce?",
        answer:
          "Full catalog commerce is usually scoped under our e-commerce storefront work. Smaller product-led or lead-gen sites with a few SKUs can still fit this engagement when we agree the scope up front.",
      },
    ],

    industries: [
      "Startups",
      "D2C",
      "SaaS",
      "E-Commerce",
      "Professional Services",
      "Retail"
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["landing-pages", "brand-identity", "ui-ux-design"],
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
      "Campaign-Specific Design — Each page matches a single audience, offer, and traffic source — not a generic template.",
      "A/B Testing Built In — Headlines, CTAs, layouts, and forms tested on a schedule so conversion compounds month on month.",
      "Speed-Optimised — Performance budgets and lean assets so mobile loads stay in the sub-1.5s range where it matters.",
      "Heatmap & Scroll Analytics — Click, scroll, and drop-off visibility so decisions follow behaviour, not opinions.",
      "Lead Routing & CRM Sync — Forms flow into your CRM, WhatsApp, and nurture sequences without manual forwarding.",
    ],

    deliverables: [
      "Conversion Research — Audience read, competitor landing audit, and offer positioning before design starts.",
      "Landing Page Design & Build — Responsive, high-converting build on Webflow, Framer, or Unbounce — ready for paid traffic.",
      "Persuasive Copywriting — Headlines, objection handling, proof blocks, and urgency aligned to the campaign.",
      "A/B Testing Setup — Split-test stack (Google Optimize, VWO, or native tools) with room for several variants per month.",
      "Analytics & Heatmaps — GA4 plus Hotjar or Clarity heatmaps, scroll maps, and session replay for full behavioural insight.",
      "Form & CRM Integration — Conditional logic, auto-responders, and sync into HubSpot, Zoho, Salesforce, or similar.",
      "Monthly CRO Reports — Dashboards for conversion rate, CPL, test outcomes, and the next optimisation priorities.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Directional benchmarks after roughly 90 days of focused landing pages plus systematic testing — volume and offer quality still drive actuals.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Landing page conversion rate", before: 3.5, after: 12 },
        { label: "Bounce rate", before: 72, after: 33 },
        { label: "Form completion rate", before: 15, after: 42 },
        { label: "Ad ROAS (index)", before: 100, after: 160 },
      ],
    },

    faqs: [
      {
        question: "How is this different from a regular website page?",
        answer:
          "A landing page has one goal, one audience, and one primary CTA — minimal navigation and no competing messages. It is built for a specific campaign; most site pages serve several intents and journeys at once.",
      },
      {
        question: "How many landing pages do I need?",
        answer:
          "Typically one per campaign, segment, or offer. If you run different creatives or audiences, separate pages keep message–market match tight and make reporting honest.",
      },
      {
        question: "How long before I see results from A/B testing?",
        answer:
          "First readable test readouts often land in two to four weeks, depending on traffic. Many teams see roughly 20–40% conversion lift within the first 90 days once testing is systematic.",
      },
      {
        question: "Can you optimise my existing landing pages?",
        answer:
          "Yes — we start with an audit: analytics, heatmaps, and a conversion teardown, then ship the highest-impact changes first.",
      },
    ],

    industries: [
      "SaaS",
      "Education",
      "Real Estate",
      "E-Commerce",
      "Retail",
      "Professional Services",
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["website-design", "ui-ux-design", "brand-identity"],
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
      "Strategic Foundation — Positioning, audience insight, and differentiation before any visual exploration.",
      "Complete Visual System — Logo, colours, typography, iconography, photography direction, and layout grids — all documented.",
      "Ready-to-Use Templates — Social, decks, email headers, stationery — create on-brand assets from day one.",
      "Cross-Platform Consistency — Rules so web, social, print, packaging, and signage stay visually aligned.",
      "Scalable for Growth — Add products, markets, and channels without diluting the system.",
    ],

    deliverables: [
      "Brand Strategy Workshop — Positioning, personas, personality, voice & tone, and competitive landscape.",
      "Logo System — Primary mark, secondary, favicon, monogram, and responsive lockups for real-world use.",
      "Colour Palette — Primary, secondary, and accent with HEX, RGB, CMYK, and Pantone plus usage rules.",
      "Typography System — Heading, body, and accent stacks with scales, line heights, and pairing for web and print.",
      "Visual Elements — Icons, illustration style, photography direction, patterns, and texture guidance.",
      "Template Kit — Social templates (Canva/Figma), pitch deck, email signature, business cards, and letterhead.",
      "Brand Guidelines Document — PDF or Notion reference so anyone can ship on-brand work correctly.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Directional outcomes after a full brand launch — consistency, speed, and perceived value compound as templates and guidelines are adopted.",
      beforeLabel: "Before",
      afterLabel: "After launch",
      rows: [
        { label: "Brand consistency (score)", before: 38, after: 100 },
        { label: "Asset creation speed (index)", before: 32, after: 88 },
        { label: "Perceived brand value (index)", before: 35, after: 85 },
        { label: "Revenue impact (index)", before: 100, after: 123 },
      ],
    },

    faqs: [
      {
        question: "How many logo concepts will I see?",
        answer:
          "Expect two to three distinct creative directions in the first review — each with logo, palette, and type preview. After you pick a direction, we refine through a few structured revision rounds.",
      },
      {
        question: "Can you work with an existing logo I want to keep?",
        answer:
          "Yes — we can anchor the system around a mark you want to retain and build colour, type, templates, and guidelines to elevate it.",
      },
      {
        question: "What if I need packaging or signage design?",
        answer:
          "The identity system is the foundation. Packaging, signage, and environmental work are natural extensions and stay on-brand when scoped separately.",
      },
      {
        question: "Do you provide the actual font files?",
        answer:
          "We specify Google Fonts or licensed families depending on needs. For paid fonts we help you purchase correctly; usage rules and file guidance sit in the guidelines.",
      },
    ],

    industries: [
      "Startups",
      "D2C",
      "E-Commerce",
      "Retail",
      "Professional Services",
      "SaaS",
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["website-design", "landing-pages", "ui-ux-design"],
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
      "Full-Stack Production — Brief, script, storyboard, shoot or animate, edit, grade, and deliver — one accountable team.",
      "Platform-Native Formats — Exports matched to aspect ratio, length, and spec for each channel you ship to.",
      "Motion Graphics & Animation — Explain products, data, or flows without a live shoot when animation fits best.",
      "Rapid Turnaround — Standard projects target first cuts in roughly five to seven days; rush paths when campaigns demand it.",
      "Content Multiplication — One production run becomes many cuts — Reels, Shorts, Stories, web heroes, and ads.",
    ],

    deliverables: [
      "Creative Brief & Script — Concept, script, storyboard, and shot list aligned to brand voice and campaign goals.",
      "Video Production / Animation — Location or studio capture, or full animation with professional picture and sound.",
      "Post-Production & Editing — Colour grade, sound design, licensed music, subtitles or captions, and final polish.",
      "Motion Graphics Package — Logos, lower thirds, data visuals, transitions, and kinetic type as needed.",
      "Multi-Format Export — 9:16, 1:1, 16:9, and custom sizes tuned for each platform’s compression and specs.",
      "Thumbnail & Cover Design — YouTube and social covers built for click-through, not decoration.",
      "Content Repurposing Pack — Long-form cut into Reels, Shorts, Stories, GIFs, and quote cards — typically ten to twenty assets.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional gains once video is embedded in landing pages, social, and ads — creative quality and posting cadence still drive the curve.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Social engagement (index)", before: 32, after: 100 },
        { label: "Landing conversion with video (index)", before: 100, after: 180 },
        { label: "Monthly video asset output (index)", before: 35, after: 85 },
        { label: "Brand perception (index)", before: 38, after: 86 },
      ],
    },

    faqs: [
      {
        question: "Do you do live-action shooting or just animation?",
        answer:
          "Both — on-location and studio shoots plus a full motion and animation lane. Many projects blend live footage with animated overlays.",
      },
      {
        question: "Can you work with footage I already have?",
        answer:
          "Yes — we can edit, grade, add motion graphics, captions, and repurpose existing raws into a full asset pack, often the most cost-effective path.",
      },
      {
        question: "How many revisions do I get?",
        answer:
          "Two structured revision rounds are included. Heavy-upfront briefs usually keep changes small; extra rounds are available for complex work.",
      },
      {
        question: "What about music and licensing?",
        answer:
          "We source from royalty-free libraries (e.g. Epidemic Sound, Artlist) and clear usage so strikes stay off your channels. Custom scores are available for premium scopes.",
      },
    ],

    industries: [
      "D2C",
      "E-Commerce",
      "SaaS",
      "Hospitality",
      "Real Estate",
      "Education",
      "Retail",
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["brand-identity", "landing-pages", "website-design"],
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
      "Research-Backed Design — Personas, journeys, and competitive insight so screens aren’t guesswork.",
      "Interactive Prototypes — Click-through Figma flows for stakeholders and tests before engineering starts.",
      "Scalable Design System — Components, tokens, and patterns that stay consistent as the product grows.",
      "Dev-Ready Handoff — Auto-layout, specs, and exports so builds match intent with less back-and-forth.",
      "Usability Validated — Critical paths tested with real users so launch risk drops before code ships.",
    ],

    deliverables: [
      "UX Research & Discovery — Interviews, competitor audit, personas, and journey maps as the decision base.",
      "Information Architecture — Sitemap, navigation model, and hierarchy so users find tasks without hunting.",
      "Wireframes — Low-fidelity flows for every screen — structure signed off before visual polish.",
      "High-Fidelity UI Design — Mockups for screens, states, and breakpoints — ready for implementation.",
      "Interactive Prototypes — Clickable Figma prototypes for demos, pitches, and moderated tests.",
      "Design System & Component Library — Buttons, inputs, cards, modals, type scales, and colour tokens in a living library.",
      "Usability Testing Report — Five to eight tests with recordings and findings you can act on before build.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after a redesign and validation cycle — traffic, pricing, and product maturity still shape your numbers.",
      beforeLabel: "Before",
      afterLabel: "After redesign",
      rows: [
        { label: "Onboarding completion", before: 42, after: 78 },
        { label: "Support ticket volume", before: 72, after: 38 },
        { label: "Development rework (of sprint)", before: 35, after: 9 },
        { label: "Feature adoption (index)", before: 38, after: 88 },
      ],
    },

    faqs: [
      {
        question: "Do you do development too?",
        answer:
          "Design and prototyping are the core. We can introduce trusted build partners or embed with your engineers — handoff is built for smooth collaboration.",
      },
      {
        question: "What tools do you use?",
        answer:
          "Primarily Figma for UI and prototypes, FigJam for workshops, Maze or UserTesting for usability studies, and Notion for documentation and project tracking.",
      },
      {
        question: "Can you redesign an existing product?",
        answer:
          "Yes — we open with heuristics and research to find the highest-impact pain points, then ship incremental fixes or a full redesign depending on goals and constraints.",
      },
      {
        question: "How do you handle design–dev collaboration?",
        answer:
          "We ship annotated Figma with auto-layout and tokens, join planning where useful, and support design QA in early sprints so shipped UI matches the spec.",
      },
    ],

    industries: [
      "SaaS",
      "E-Commerce",
      "Professional Services",
      "Retail",
      "Technology",
      "Education",
      "Healthcare",
      "Finance",
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["website-design", "landing-pages", "brand-identity"],
  },
  {
    id: 48,
    slug: "social-media-creative",
    name: "Social Media Creative & Content Design",
    category: "Web Design, Branding & Creative",
    categoryId: 6,

    shortDescription:
      "Branded post templates, story kits, and captions — planned, designed, and scheduled so your brand shows up consistently.",

    fullDescription:
      "Strategy, design, copy, and scheduling in one engine — Instagram, LinkedIn, Facebook, and X — so your brand posts on-brand every week without your team living in Canva. You review and approve a monthly batch; we handle calendars, specs, and publishing.",

    benefits:
      "Consistent posting compounds reach; a retainer beats expensive one-off posts; pillars and CTAs turn attention into site visits and enquiries instead of hollow likes.",

    automationPoints: [
      "Branded Template System — Reusable Canva/Figma layouts so in-house edits stay on-brand.",
      "Multi-Platform Optimisation — Correct aspect ratios and specs per channel — no awkward crops.",
      "Content Calendar — Full month planned up front — pillars, themes, times, and hashtag direction.",
      "Copy + Design Together — Captions tuned per platform — LinkedIn depth versus Instagram punch — not one blob pasted everywhere.",
      "Performance Reporting — Monthly read on what worked, engagement, follower trend, and next-month bets.",
    ],

    deliverables: [
      "Social Media Strategy — Pillars, personas, tone, hashtags, and competitor benchmarks.",
      "Monthly Content Calendar — Thirty-day plan with types, themes, draft copy, and dates — for sign-off before the month runs.",
      "Graphic Design (Posts & Stories) — Posts, carousels, Stories, and covers — on-brand and channel-ready.",
      "Copywriting & Captions — CTAs, hashtags, and emoji rhythm per platform — written, not generic filler.",
      "Branded Template Library — Ten to twenty Canva/Figma templates your team can reuse fast.",
      "Scheduling & Publishing — Buffer, Later, or Meta Business Suite — posted at the windows that fit your audience.",
      "Monthly Performance Report — Engagement, follower growth, top posts, and data-led tweaks for the next cycle.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Directional benchmarks over roughly ninety days once cadence and creative are live — niche and ad spend still move the numbers.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Engagement rate", before: 0.8, after: 4.5 },
        { label: "Follower growth (index)", before: 100, after: 200 },
        { label: "Brand consistency (score)", before: 38, after: 100 },
        { label: "Posting cadence (index)", before: 28, after: 88 },
      ],
    },

    faqs: [
      {
        question: "Do you manage posting and community engagement too?",
        answer:
          "Retainers include scheduling and publishing. Community management — comments, DMs, mentions — is an add-on when you want full-service coverage.",
      },
      {
        question: "Can I use the templates to create my own posts?",
        answer:
          "Yes — the library is yours. Canva or Figma files are built so your team can ship quick, on-brand pieces anytime.",
      },
      {
        question: "Do you handle video content for social?",
        answer:
          "Short-form edits — Reels/Shorts cuts, text overlays, captions — sit here. Full production, filming, or heavy motion is a better fit for our video production service.",
      },
      {
        question: "How many posts per month?",
        answer:
          "Plans often start around fifteen posts monthly and scale past sixty. Many teams begin in the twenty-to-thirty range, then adjust from performance data.",
      },
    ],

    industries: [
      "D2C",
      "E-Commerce",
      "Restaurants",
      "Hospitality",
      "Professional Services",
      "Real Estate",
      "Retail",
      "SaaS",
    ],

    serviceType: "Web / Design",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["brand-identity", "video-production", "landing-pages"],
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
    id: 49,
    slug: "d2c-brand-launch",
    name: "D2C Brand Launch & Growth",
    category: "E-Commerce & Marketplace Growth",
    categoryId: 7,

    shortDescription:
      "From zero to revenue — store, brand, launch campaign, and retention loops in one integrated package.",

    fullDescription:
      "A full go-to-market system: brand, e-commerce store, launch campaign, email and WhatsApp flows, and retention — built and wired so revenue can start from day one. We map awareness through first purchase, repeat purchase, and referral so touchpoints lift lifetime value, not only first orders.",

    benefits:
      "Ship in weeks what often takes agencies months to stitch together — brand, store, automation, and campaigns in one stack. The launch path aims for early revenue via waitlists and timed ads, while email, WhatsApp, loyalty, and referral loops are in place from the start so retention is not an afterthought.",

    automationPoints: [
      "Complete Launch System — Brand, store, campaigns, automation, and retention in one programme instead of five vendors.",
      "Speed to Market — Launch-ready in roughly six to ten weeks versus multi-month agency timelines for similar scope.",
      "Pre-Launch Revenue Engine — Waitlists, seeding, and early offers so momentum and sales start before the official drop.",
      "Built-In Retention — Email, WhatsApp, loyalty, and referral mechanics scoped as launch features, not phase-two add-ons.",
      "Data-Driven Growth — GA4, pixels, attribution, and unit economics visible from launch week so decisions follow numbers.",
    ],

    deliverables: [
      "Brand Identity Package — Logo, colour, type, packaging guidance, and voice — ready for D2C shelves and screens.",
      "E-Commerce Store Build — Shopify or headless front — catalog, checkout, Razorpay/UPI, and shipping integrations.",
      "Product Photography Direction — Shot list, styling notes, and retouching direction for hero, lifestyle, and catalogue.",
      "Launch Campaign — Meta and Google, influencer seeding, waitlist, and launch promos — managed for the first thirty days.",
      "Email & WhatsApp Flows — Welcome, abandoned cart, post-purchase, reviews, and win-back — automated from go-live.",
      "Retention & Loyalty Setup — Points, referrals, subscriptions or VIP tiers — structured to lift LTV early.",
      "Analytics & Reporting — GA4, Meta Pixel, server-side tracking where needed, and a KPI view for ROAS, CAC, LTV, and AOV.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Benchmarks for a net-new D2C launch — product, margin, and channel mix still set your ceiling.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Launch ROAS (index)", before: 100, after: 380 },
        { label: "Repeat purchase rate", before: 0, after: 20 },
        { label: "Owned email list (index)", before: 5, after: 72 },
        { label: "Measurement & CAC clarity (index)", before: 18, after: 82 },
      ],
    },

    faqs: [
      {
        question: "I already have a product but no brand. Can you help?",
        answer:
          "Yes — identity, packaging direction, and a D2C-ready visual system are core to this package.",
      },
      {
        question: "What platform do you build on?",
        answer:
          "Most brands launch on Shopify for speed and ecosystem coverage. Heavier custom needs can use headless commerce on Next.js with Shopify or another solid backend.",
      },
      {
        question: "Do you manage ads after launch?",
        answer:
          "The launch scope includes about thirty days of managed paid social and search. After that, a monthly growth retainer keeps campaigns and creative iterating.",
      },
      {
        question: "What about marketplace selling alongside D2C?",
        answer:
          "We often pair marketplace listings for discovery with a D2C store for margin and first-party data — our marketplace onboarding work can run in parallel when you want both.",
      },
    ],

    industries: [
      "D2C",
      "FMCG",
      "Beauty",
      "F&B",
      "E-Commerce",
      "Retail",
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["marketplace-management", "product-feed", "ecommerce-store"],
  },
  {
    id: 32,
    slug: "marketplace-management",
    name: "Marketplace Onboarding & Management",
    category: "E-Commerce & Marketplace Growth",
    categoryId: 7,

    shortDescription:
      "Sell and scale on Amazon, Flipkart, Meesho, and more with full management.",

    fullDescription:
      "Multi-marketplace management covering product listing optimization, inventory synchronization, pricing strategy, advertising, and review management across platforms like Amazon, Flipkart, and others.",

    benefits:
      "Expand reach to millions of marketplace customers while maintaining control over listings, pricing, and performance.",

    automationPoints: [
      "Multi-Platform Presence — Amazon, Flipkart, Meesho, JioMart, and category-specific marketplaces — listed and tuned for each algorithm.",
      "Search-Optimised Listings — Titles, bullets, backend terms, and media structured for marketplace search.",
      "Managed Marketplace Ads — Sponsored Products, Brands, and display — bids and targets tuned for profitable scale.",
      "Centralised Inventory — One operational view of stock across channels to cut oversells and surprise stockouts.",
      "Performance Analytics — Sales, ad spend, BSR, conversion, and margin visibility per SKU and per platform.",
    ],

    deliverables: [
      "Account Setup & Registration — Seller accounts with GST, FSSAI where needed, brand registry, and compliance paperwork.",
      "Product Listing & Optimisation — Search-led titles, bullets, A+, lifestyle assets, and enhanced brand content.",
      "Marketplace Advertising — Campaign build, keyword targets, bid rules, and daily optimisation across ad products.",
      "Inventory & Order Management — Synced stock, FBA/FBF/self-ship setup, and automated order flows.",
      "Pricing Strategy — Competitive scans, repricing rules, and guardrails that protect margin across platforms.",
      "Review & Rating Management — Solicitation rhythm, response playbooks for negatives, and rating uplift tactics.",
      "Monthly Performance Reports — Sales, ACOS, ROAS, BSR trends, and SKU-level actions for the next cycle.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Directional benchmarks after roughly ninety days of listing and ad work — category competitiveness and stock depth still move outcomes.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Listing conversion rate", before: 6.5, after: 16 },
        { label: "Advertising ACOS", before: 44, after: 20 },
        { label: "Category rank (index)", before: 22, after: 88 },
        { label: "Verified reviews (index)", before: 5, after: 72 },
      ],
    },

    faqs: [
      {
        question: "Which marketplaces should I be on?",
        answer:
          "It depends on category and buyer. Amazon and Flipkart are core for many brands; Meesho fits value-led and Tier 2/3 reach; JioMart often fits grocery and essentials. We recommend the mix in strategy.",
      },
      {
        question: "Can I sell on marketplaces AND my own D2C store?",
        answer:
          "Yes — marketplaces for discovery and volume, D2C for margin and first-party data. We help align pricing and inventory across both.",
      },
      {
        question: "What about Brand Registry?",
        answer:
          "We support Amazon Brand Registry, Flipkart Brand Store, and trademark steps where required — unlocking A+, analytics, and stronger IP controls.",
      },
      {
        question: "How do you handle returns and customer service?",
        answer:
          "We configure policies, automated replies, and escalations. FBA/FBF returns stay on marketplace rails; self-ship programmes get a clear returns SOP.",
      },
    ],

    industries: [
      "D2C",
      "FMCG",
      "Retail",
      "Manufacturing",
      "E-Commerce",
      "Fashion",
      "Electronics",
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["product-feed", "ecommerce-storefront-design", "d2c-brand-launch"],
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
      "Keyword-Optimised Titles — Search terms grounded in marketplace and Google data — not guesswork.",
      "Benefit-Driven Copy — Outcomes and triggers for your buyer — not spec dumps.",
      "A+ / Enhanced Content — Rich modules, comparison tables, brand story, and lifestyle-led proof.",
      "Image Optimisation — Shot lists, overlays, and lifestyle direction so visuals sell as hard as copy.",
      "Pricing Intelligence — Competitor monitoring and positioning so you stay sharp without a race to the bottom.",
    ],

    deliverables: [
      "Keyword Research (per SKU) — Volume, competition, and mapping into titles, bullets, and backend fields.",
      "Title Optimisation — Keyword-rich titles that still read clean in search and on the shelf.",
      "Bullet Points & Descriptions — Benefit-led bullets, long descriptions, and FAQs that handle objections.",
      "A+ / Enhanced Brand Content — Modules with lifestyle assets, comparisons, and feature breakdowns.",
      "Image Guidelines & Infographics — Shot lists, overlay specs, and lifestyle direction for your shoots.",
      "Competitive Pricing Analysis — Benchmarks across platforms, MAP notes, and dynamic pricing guidance.",
      "SEO & Backend Optimisation — Search terms, category nodes, and attributes completed for ranking lift.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional gains after roughly sixty days of listing work — category demand and traffic mix still set the ceiling.",
      beforeLabel: "Before",
      afterLabel: "After ~60 days",
      rows: [
        { label: "Listing conversion rate", before: 7.5, after: 18 },
        { label: "Organic impressions (index)", before: 100, after: 148 },
        { label: "Click-through rate (index)", before: 100, after: 240 },
        { label: "A+ content coverage", before: 18, after: 100 },
      ],
    },

    faqs: [
      {
        question: "How many SKUs can you optimise?",
        answer:
          "From ten to ten thousand plus. Large catalogues use tiers — hero SKUs get full manual passes while long-tail SKUs use assisted workflows with human review.",
      },
      {
        question: "Do you create the product photography?",
        answer:
          "We deliver shot lists, styling notes, and infographic overlays. For capture we can introduce photographers or brief your team.",
      },
      {
        question: "Will this work for my own D2C store too?",
        answer:
          "Yes — the same content principles lift conversion on Shopify, WooCommerce, and marketplaces; we adapt formats to each platform’s rules.",
      },
      {
        question: "How do you measure success?",
        answer:
          "We track conversion rate, ranking and impression share, CTR, and revenue per SKU — baselined before work and reviewed after launch.",
      },
    ],

    industries: [
      "E-Commerce",
      "D2C",
      "Retail",
      "Fashion",
      "Electronics",
      "Beauty",
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Starter",

    relatedServiceSlugs: ["marketplace-management", "ecommerce-storefront-design", "d2c-brand-launch"],
  },
  {
    id: 50,
    slug: "ecommerce-storefront-design",
    name: "E-Commerce Storefront Design",
    category: "E-Commerce & Marketplace Growth",
    categoryId: 7,

    shortDescription:
      "Shopify, WooCommerce, or headless — conversion-optimised stores with one-click upsells and mobile-first checkout.",

    fullDescription:
      "A conversion-led store on Shopify, WooCommerce, or a headless stack — not a logo-stamped template, but shopping flows tuned to your products, audience, and model. Product pages through checkout and post-purchase are built to lift conversion rate and AOV, with speed, mobile UX, and trust signals baked into the design.",

    benefits:
      "Small conversion gains compound across revenue — we optimise for speed, presentation, checkout friction, and trust. Mobile-first builds match how most shoppers browse in India, while upsells, bundles, and cart prompts lift AOV without extra ad spend.",

    automationPoints: [
      "Conversion-Optimised Design — Patterns for collections, PDPs, cart, and checkout that match how people actually buy.",
      "One-Click Upsells & Bundles — Post-add and post-purchase upsells to grow AOV without adding checkout friction.",
      "Sub-3s Page Loads — Media discipline, lazy loading, and lean front-ends so performance supports conversion.",
      "Seamless Indian Payments — Razorpay, UPI, wallets, COD, EMI — configured for the payment mix your customers expect.",
      "CMS for Easy Management — You run products, collections, promos, and inventory without a ticket to engineering.",
    ],

    deliverables: [
      "Store Design (Custom Theme) — Homepage, collections, PDP, cart, and checkout — on-brand and pixel-finished.",
      "Product Page Optimisation — Galleries, size guides, reviews, trust badges, and urgency elements that support conversion.",
      "Upsell & Cross-Sell Setup — Post-purchase upsells, bundles, cart upsells, and “frequently bought together” flows.",
      "Payment & Shipping Integration — Razorpay/UPI/COD, Shiprocket/Delhivery-style flows, tracking, and customer notifications.",
      "SEO & Speed Optimisation — Schema, meta, compression, lazy loading, and Core Web Vitals work.",
      "Analytics & Tracking — GA4, Meta Pixel, server-side tracking where needed, and purchase funnel events.",
      "Training & Documentation — Walkthroughs and guides so your team can run catalog, orders, and content day to day.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly ninety days — traffic quality and catalogue depth still set your ceiling.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Conversion rate", before: 1.5, after: 4 },
        { label: "Average order value (index)", before: 100, after: 123 },
        { label: "Cart abandonment rate", before: 75, after: 50 },
        { label: "Mobile performance score", before: 38, after: 86 },
      ],
    },

    faqs: [
      {
        question: "Shopify, WooCommerce, or headless — which should I choose?",
        answer:
          "Shopify fits most D2C brands for speed and apps. WooCommerce works when WordPress is already your stack. Headless (e.g. Next.js with Shopify backend) is for brands that need maximum performance or deep custom flows.",
      },
      {
        question: "Can you migrate my existing store?",
        answer:
          "Yes — products, customers, orders, URLs, and SEO are migrated with redirects and checks so you minimise downtime and ranking loss.",
      },
      {
        question: "Do you handle product photography?",
        answer:
          "We provide direction and post-production guidance. For shoots we can introduce trusted product photographers or brief your in-house team.",
      },
      {
        question: "What about marketplace integration?",
        answer:
          "We can sync Shopify inventory with Amazon, Flipkart, and other channels for central stock. For full marketplace programmes, see Marketplace Onboarding & Management.",
      },
    ],

    industries: [
      "D2C",
      "Retail",
      "E-Commerce",
      "Fashion",
      "Beauty",
      "Electronics",
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["d2c-brand-launch", "cart-abandonment", "marketplace-management"],
  },
  {
    id: 51,
    slug: "subscription-recurring-revenue",
    name: "Subscription & Recurring Revenue Systems",
    category: "E-Commerce & Marketplace Growth",
    categoryId: 7,

    shortDescription:
      "Membership boxes, SaaS billing, and auto-replenishment flows — predictable revenue, baked into your business model.",

    fullDescription:
      "Subscription products, billing automation, subscriber portal, and retention: we wire the stack that turns one-time buyers into recurring revenue — boxes, replenishment, SaaS-style billing, or memberships. You get model design plus the flows that reduce passive churn and keep subscribers month after month.",

    benefits:
      "Recurring revenue compounds your baseline and improves LTV versus one-off sales. Dunning, card updates, and engagement automations recover revenue that would otherwise leak to failed payments or quiet cancels.",

    automationPoints: [
      "Flexible Subscription Models — Subscribe-and-save, build-a-box, fixed cadence, tiers, or SaaS billing — matched to how you sell.",
      "Self-Service Customer Portal — Skip, pause, swap, and billing updates without flooding support.",
      "Smart Dunning & Recovery — Retries, reminders, and sequences that claw back a large share of failed payments.",
      "Retention Automation — Milestones, usage nudges, rewards, and win-back paths that keep accounts active.",
      "Subscription Analytics — MRR, churn, LTV, cohorts, and health signals in one place for decisions.",
    ],

    deliverables: [
      "Subscription Model Design — Tiers, cadence, discounts, and commitment structures tuned for uptake and retention.",
      "Technical Setup — Recharge, Bold, Chargebee, or Stripe Billing — configured with your store and gateway.",
      "Customer Portal — Self-serve plan changes, skip/pause, swaps, and payment details.",
      "Dunning & Payment Recovery — Retry rules, expiry prompts, and dunning email or WhatsApp sequences.",
      "Retention Marketing Flows — Onboarding, renewals, pre-bill reminders, and save offers before cancel.",
      "Churn Prevention System — Surveys, pause-not-cancel, win-back, and re-engagement automations.",
      "Subscription Dashboard — MRR/ARR, churn, LTV, cohort retention, and subscriber health monitoring.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Directional benchmarks after roughly six months — category, price point, and acquisition still set your range.",
      beforeLabel: "Before",
      afterLabel: "After ~6 months",
      rows: [
        { label: "Recurring revenue share (index)", before: 0, after: 32 },
        { label: "Customer LTV (index)", before: 100, after: 350 },
        { label: "Monthly churn rate", before: 11, after: 4.5 },
        { label: "Failed payment recovery rate", before: 6, after: 42 },
      ],
    },

    faqs: [
      {
        question: "What subscription platform do you recommend?",
        answer:
          "Recharge or Bold for Shopify, Chargebee when you span channels or SaaS, Stripe Billing for custom stacks — we pick for your complexity, budget, and roadmap.",
      },
      {
        question: "How do I convince customers to subscribe?",
        answer:
          "Subscribe-and-save discounts, subscriber-only perks, flexible skip/pause, and proof — we shape the offer and the UX together with the build.",
      },
      {
        question: "What's a good churn rate to target?",
        answer:
          "Physical subs often land around 8–12% monthly with best-in-class under 5%; SaaS often targets under 3% monthly. We benchmark your category and iterate.",
      },
      {
        question: "Can I offer subscriptions alongside one-time purchases?",
        answer:
          "Yes — subscribe-and-save beside one-time checkout is usually the highest-converting pattern; customers pick the path that fits.",
      },
    ],

    industries: [
      "D2C",
      "SaaS",
      "E-Commerce",
      "Retail",
      "Media",
      "Professional Services",
      "Beauty",
      "F&B",
    ],

    serviceType: "E-Commerce",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["ecommerce-storefront-design", "d2c-brand-launch", "loyalty-referral"],
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
      "Centralised Lead Capture — Forms, ads, WhatsApp, phone, and email land in one pipeline with owners and rules.",
      "Automated Follow-Ups — Tasks, email, and WhatsApp nudges so prospects do not go cold between touches.",
      "Custom Pipeline Stages — Your process mapped end-to-end with clear stage exit criteria.",
      "Deal Scoring & Prioritisation — Scoring so reps open with the highest-intent opportunities first.",
      "Real-Time Dashboards — Pipeline value, velocity, win rate, and activity without spreadsheet archaeology.",
    ],

    deliverables: [
      "Sales Process Mapping — Current flow documented, leaks found, and target pipeline designed.",
      "CRM Configuration — Fields, stages, deal properties, segmentation, roles, and permissions.",
      "Lead Source Integration — Web forms, Meta and Google leads, WhatsApp, email, and telephony into auto-created records.",
      "Automation Workflows — Assignment, sequences, stage tasks, SLAs, and escalations.",
      "Email & WhatsApp Templates — First touch, follow-up, proposal, and close — ready for your tone.",
      "Dashboards & Reports — Pipeline, funnel, rep activity, forecast, and conversion views.",
      "Team Training & SOPs — Live sessions, recordings, and playbooks so adoption sticks.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional improvements after roughly ninety days — team discipline and offer quality still drive closes.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Lead follow-up coverage", before: 62, after: 100 },
        { label: "First-response speed (index)", before: 28, after: 90 },
        { label: "Deal close rate (index)", before: 100, after: 132 },
        { label: "Weekly sales admin time (index)", before: 100, after: 18 },
      ],
    },

    faqs: [
      {
        question: "Which CRM do you recommend?",
        answer:
          "HubSpot fits many SMBs; Zoho is strong on value in India; Salesforce for enterprise complexity; Pipedrive when the team lives in pure sales motions. We match stack, budget, and integrations.",
      },
      {
        question: "Can you fix our existing messy CRM?",
        answer:
          "Yes — audits, deduping, field clean-up, workflow repair, and re-training are common. We stabilise data, then simplify what reps see day to day.",
      },
      {
        question: "Will my team actually use it?",
        answer:
          "Adoption wins when the CRM removes work instead of adding it — fewer tabs than spreadsheets, automations that log activity, and training tied to real deals.",
      },
      {
        question: "Can it connect to WhatsApp?",
        answer:
          "Yes — WhatsApp Business API can sit inside the CRM so threads, capture, and follow-ups stay in one place with full history.",
      },
    ],

    industries: [
      "SaaS",
      "Real Estate",
      "Education",
      "Healthcare",
      "Professional Services",
      "Finance",
      "Retail",
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["sales-funnel", "lead-generation", "whatsapp-business"],
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
      "End-to-End Automation — From first click through payment — stages tracked, measured, and improved.",
      "Multi-Channel Nurture — Email, WhatsApp, SMS, and retargeting so prospects progress where they actually engage.",
      "Behaviour-Based Triggers — Paths branch on visits, opens, clicks, and submissions — not one static blast.",
      "Cart & Lead Recovery — Abandoned carts and partial sign-ups get sequenced follow-up — often recovering a double-digit share of lost revenue.",
      "Upsell & Cross-Sell Flows — Post-purchase paths for repeat buys, upgrades, and referrals to lift LTV.",
    ],

    deliverables: [
      "Funnel Strategy & Mapping — Journey map, architecture, offer stack, and conversion goals.",
      "Landing Pages — Opt-in, sales, checkout, upsell, and thank-you experiences per stage.",
      "Lead Magnets & Offer Design — Ebooks, webinars, tools, trials, or promos matched to the right intent.",
      "Email Nurture Sequences — Five to twelve emails per stage — education, objection handling, and urgency where appropriate.",
      "WhatsApp Follow-Up Flows — Personal, high-open messages at decision points inside the same logic as email.",
      "Cart/Lead Recovery Automation — Email plus WhatsApp plus retargeting for carts and dropped forms.",
      "Analytics & Funnel Dashboard — Stage conversion, drop-offs, attribution, and what to test next.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional gains after roughly ninety days — traffic volume, offer strength, and sales capacity still set the ceiling.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Lead-to-customer conversion", before: 3.5, after: 11 },
        { label: "Cart/lead recovery rate", before: 2, after: 24 },
        { label: "Revenue per lead (index)", before: 100, after: 250 },
        { label: "Sales cycle speed (index)", before: 32, after: 78 },
      ],
    },

    faqs: [
      {
        question: "What tools do you use to build funnels?",
        answer:
          "Landing on Webflow, Framer, or focused funnel builders where it fits. Automation through n8n, Make, or CRM-native workflows. Email on Brevo, Mailchimp, ActiveCampaign, or similar. WhatsApp via Business API. Payments through Razorpay or Stripe.",
      },
      {
        question: "How is this different from just having a landing page?",
        answer:
          "A page is one step. A funnel is the full path — capture, nurture, convert, upsell, recover, and retain — wired and measured end to end.",
      },
      {
        question: "Can you build funnels for high-ticket B2B services?",
        answer:
          "Yes — lead magnets, webinar or asset-led nurture, multi-touch email, LinkedIn retargeting, and a clean handoff to sales for longer, higher-value cycles.",
      },
      {
        question: "How long before I see results?",
        answer:
          "First conversions often appear in week one when traffic already exists. Meaningful optimisation usually needs sixty to ninety days of volume and structured tests.",
      },
    ],

    industries: [
      "SaaS",
      "Education",
      "Real Estate",
      "Professional Services",
      "Healthcare",
      "E-Commerce",
      "Finance",
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["crm-setup", "lead-generation", "landing-pages"],
  },
  {
    id: 37,
    slug: "lead-generation",
    name: "Lead Generation — Inbound & Outbound",
    category: "Sales, CRM & Revenue Operations",
    categoryId: 8,

    shortDescription:
      "Generate consistent, high-quality leads through multi-channel strategies.",

    fullDescription:
      "Multi-channel lead generation systems combining ads, landing pages, forms, and automation — designed to attract, capture, and qualify leads consistently.",

    benefits:
      "Build a predictable pipeline of qualified leads and reduce dependency on inconsistent acquisition methods.",

    automationPoints: [
      "Inbound + Outbound Together — Outbound for near-term conversations; inbound for compounding authority and capture.",
      "ICP-Targeted Prospecting — Lists enriched by industry, size, title, stack, and stage — not spray-and-pray.",
      "Multi-Channel Outreach — Cold email, LinkedIn, and call paths in sequenced plays your buyers actually use.",
      "Lead Magnet & Content Engine — SEO-led articles, gated assets, and webinars that pull demand 24/7.",
      "CRM-Integrated Pipeline — Source, score, and history attached so sales works a clean queue.",
    ],

    deliverables: [
      "ICP & Buyer Persona Definition — Triggers, committees, and channel preferences mapped.",
      "Prospect List Building — Verified lists via Apollo, ZoomInfo, Sales Nav, and careful enrichment — volume scaled monthly.",
      "Cold Email Campaigns — Multi-step sequences, A/B subjects, warm-up, and deliverability hygiene.",
      "LinkedIn Outreach — Requests, InMails, and engagement plays aimed at decision-makers.",
      "Lead Magnets & Content — Ebooks, calculators, templates, webinars — gated to capture inbound leads.",
      "SEO & Blog Strategy — Keyword-led articles that rank and feed the inbound engine over time.",
      "Pipeline Reporting — Weekly view of leads, meetings, pipeline value, and channel mix.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Typical directional gains after roughly ninety days — ICP tightness, offer, and sales capacity still set the ceiling.",
      beforeLabel: "Before",
      afterLabel: "After ~90 days",
      rows: [
        { label: "Qualified leads/month (index)", before: 28, after: 88 },
        { label: "Meetings booked/month", before: 8, after: 35 },
        { label: "Pipeline value (index)", before: 100, after: 380 },
        { label: "Active lead channels (index)", before: 28, after: 82 },
      ],
    },

    faqs: [
      {
        question: "Is cold email legal?",
        answer:
          "Yes when executed responsibly — business context, verified contacts, clear identity, and working opt-out. We align with common-sense compliance (e.g. CAN-SPAM-style rules, GDPR where it applies, and Indian norms) and protect sender reputation.",
      },
      {
        question: "How quickly will I see results?",
        answer:
          "Outbound often shows first replies in one to two weeks and meetings in three to four. Inbound content typically needs sixty to ninety days to compound; lead magnets convert as soon as qualified traffic lands.",
      },
      {
        question: "Do you handle the sales calls too?",
        answer:
          "We focus on lists, messaging, and booked meetings — your team runs calls. If you need automated qualification, our AI Sales Agent service can bridge the gap.",
      },
      {
        question: "What industries do you specialise in?",
        answer:
          "The playbook is industry-agnostic; we have repeated wins in real estate, IT services, education, healthcare, SaaS, and professional services.",
      },
    ],

    industries: [
      "SaaS",
      "Real Estate",
      "Education",
      "Healthcare",
      "Finance",
      "Professional Services",
      "Technology",
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["crm-setup", "sales-funnel", "ai-sales-agent"],
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
      "Points & Rewards System — Earn on purchases, reviews, referrals, and shares — redeem for discounts, products, or experiences.",
      "VIP Tier Program — Escalating perks that pull spend toward the next tier without gimmicks.",
      "Referral Engine — Tracked codes or links with automated rewards — “give X, get X” style mechanics.",
      "Win-Back Automation — Lapse triggers with personalised offers before the relationship is gone.",
      "Retention Analytics — Cohorts, LTV, churn risk, and programme ROI so incentives follow data.",
    ],

    deliverables: [
      "Retention Strategy — Segments, behaviours, programme design, and reward economics.",
      "Loyalty Platform Setup — Smile.io, LoyaltyLion, Yotpo, or custom — wired to store, CRM, and payments.",
      "Referral Program — Codes, links, rewards, and basic fraud guardrails ready to scale.",
      "VIP Tier Structure — Tier rules, benefits, upgrade triggers, and exclusive perks.",
      "Win-Back Campaigns — Email, WhatsApp, and SMS paths for lapsed buyers with history-aware offers.",
      "Engagement Automation — Birthdays, anniversaries, milestones, and review incentives on a calendar.",
      "Retention Dashboard — Repeat rate, LTV, referral revenue, tier mix, and programme ROI in one place.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Directional benchmarks after roughly six months — category and margin still set what “good” looks like.",
      beforeLabel: "Before",
      afterLabel: "After ~6 months",
      rows: [
        { label: "Repeat purchase rate", before: 18, after: 42 },
        { label: "Customer LTV (index)", before: 100, after: 132 },
        { label: "Referral share of new customers", before: 0, after: 20 },
        { label: "Program engagement rate", before: 0, after: 52 },
      ],
    },

    faqs: [
      {
        question: "What loyalty platform do you recommend?",
        answer:
          "Smile.io or LoyaltyLion are common on Shopify; Yotpo suits larger stacks wanting reviews plus loyalty; custom fits unusual flows. We match platform, budget, and roadmap.",
      },
      {
        question: "How do I fund the rewards without losing margin?",
        answer:
          "We model economics so reward cost sits against lift in frequency and AOV — many programmes land near a few points of revenue while repeat spend moves much more.",
      },
      {
        question: "Can this work for a service business, not just products?",
        answer:
          "Yes — visit-based rewards, referral credits, and VIP perks work for salons, gyms, restaurants, clinics, and professional services.",
      },
      {
        question: "How do you prevent referral fraud?",
        answer:
          "Layered checks — unique tracking, sensible purchase minimums, velocity limits, and manual review on high-value payouts — designed in from day one.",
      },
    ],

    industries: [
      "E-Commerce",
      "D2C",
      "Hospitality",
      "SaaS",
      "Retail",
      "Healthcare",
      "Beauty",
      "Professional Services",
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["subscription-recurring-revenue", "ecommerce-storefront-design", "crm-setup"],
  },
  {
    id: 39,
    slug: "influencer-affiliate",
    name: "Influencer & Affiliate Program Management",
    category: "Sales, CRM & Revenue Operations",
    categoryId: 8,

    shortDescription:
      "Leverage creators and affiliates to scale reach and performance.",

    fullDescription:
      "Influencer and affiliate marketing programs that combine creator partnerships with performance tracking — enabling scalable growth through trusted content and partnerships.",

    benefits:
      "Drive awareness and conversions through trusted creators while maintaining measurable performance and ROI.",

    automationPoints: [
      "Managed Scouting & Onboarding — Partners sourced, vetted, and onboarded so your team is not cold-DMing creators.",
      "Performance Tracking — Clicks, leads, and sales attributed per partner — clear numbers, fewer arguments.",
      "Commission Automation — Tiers, bonuses, and payouts triggered from performance with partner-facing dashboards.",
      "Content & Brief Management — Briefs, approvals, and asset libraries so creative stays on-brand at volume.",
      "Relationship Management — Cadence, reviews, and incentives that keep strong partners active.",
    ],

    deliverables: [
      "Program Strategy & Design — Commission model, tiers, guardrails, guidelines, and promo calendar.",
      "Platform Setup — Tracking via Impact, PartnerStack, Refersion, or custom — wired to store and CRM.",
      "Partner Scouting & Outreach — Monthly recruitment volume aligned to your ICP and category.",
      "Onboarding & Asset Kit — Welcome flow, brand kit, links, and portal access for partners.",
      "Campaign Management — Briefs, review cycles, publishing coordination, and per-campaign performance.",
      "Payout & Commission Management — Calculation, approvals, and payout rhythm — monthly or milestone-based.",
      "Performance Reporting — Revenue and ROAS by partner, content outcomes, and programme health reviews.",
    ],

    growthComparisonChart: {
      title: "Results you can expect",
      description:
        "Directional benchmarks after roughly six months — category, margin, and partner quality still set the range.",
      beforeLabel: "Before",
      afterLabel: "After ~6 months",
      rows: [
        { label: "Partner revenue share (index)", before: 0, after: 23 },
        { label: "Active partners (index)", before: 8, after: 78 },
        { label: "Partner-channel efficiency (index)", before: 40, after: 85 },
        { label: "Program ROI (index)", before: 100, after: 450 },
      ],
    },

    faqs: [
      {
        question: "What's the difference between influencers and affiliates?",
        answer:
          "Influencers lead with content — often fixed fees plus or instead of commission. Affiliates lead with links across their channels and earn on performance. We run both under one operating model where it helps.",
      },
      {
        question: "How do you find the right partners?",
        answer:
          "We combine platform signals — engagement, audience fit, content quality — with niche relevance and brand fit. A smaller roster of active partners usually beats a long list of inactive ones.",
      },
      {
        question: "What commission rates should I offer?",
        answer:
          "Rough bands: about 10–20% on physical goods, 20–40% on digital or SaaS, and flat bounties for qualified leads when that fits. We model unit economics before anything goes live.",
      },
      {
        question: "Can you combine this with paid media?",
        answer:
          "Yes — the best creator assets are often amplified with paid (e.g. Meta partnership or spark-style placements). We coordinate with your paid team or our Meta ads work so trust and scale stack.",
      },
    ],

    industries: [
      "E-Commerce",
      "D2C",
      "SaaS",
      "Education",
      "Fashion",
      "Beauty",
      "Food & Beverage",
      "Health & Wellness",
    ],

    serviceType: "Sales / CRM",
    status: "Live",
    engagementSize: "Growth",

    relatedServiceSlugs: ["meta-ads", "lead-generation", "loyalty-referral"],
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
