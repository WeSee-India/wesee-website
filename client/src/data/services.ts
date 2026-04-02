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
}

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
    id: 1, slug: "ai-sales-agent", name: "AI Sales Agent", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "Autonomous AI sales rep across WhatsApp, web chat, and voice calls.",
    fullDescription: "A fully autonomous AI-powered sales representative that engages prospects across WhatsApp, your website chat, and even voice calls. It qualifies leads, shares product info, handles objections, collects details, and books meetings — all without human intervention.",
    benefits: "Most businesses lose 40–60% of inbound leads because they don't respond fast enough. An AI Sales Agent responds in under 3 seconds, 24/7. Every lead gets engaged immediately, qualification happens automatically, and your sales team only speaks to people ready to buy.",
    automationPoints: ["Instant response to every inquiry", "Automatic lead qualification", "Smart follow-up sequences", "Seamless handoff to human reps", "Real-time CRM data push"],
    deliverables: ["WhatsApp AI sales bot", "Website chatbot widget", "Voice AI agent", "Lead scoring logic", "CRM integration", "Analytics dashboard"],
    industries: ["Real Estate", "Healthcare", "Education", "E-Commerce", "SaaS", "Financial Services"],
    serviceType: "AI Agents", status: "Live", engagementSize: "Growth"
  },
  {
    id: 2, slug: "ai-customer-support-bot", name: "AI Customer Support Bot", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "Resolves 80% of support tickets instantly across chat, email, and social — escalating only what truly needs a human.",
    fullDescription: "An intelligent support agent that handles customer queries, resolves common issues, processes returns, tracks orders, and escalates complex problems — through chat or voice.",
    benefits: "Handles 70–80% of repetitive queries instantly. Response times drop from hours to seconds, CSAT goes up, and your human team focuses on complex issues only.",
    automationPoints: ["24/7 instant resolution", "Automatic ticket creation", "Order tracking integration", "Sentiment detection", "Knowledge base integration"],
    deliverables: ["Multi-channel support bot", "FAQ training", "Ticket escalation workflow", "Helpdesk integration", "Performance reports"],
    industries: ["E-Commerce", "SaaS", "Healthcare", "Telecom", "Banking", "Logistics"],
    serviceType: "AI Agents", status: "Live", engagementSize: "Growth"
  },
  {
    id: 3, slug: "ai-receptionist", name: "AI Receptionist & Scheduler", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "Greets callers, answers FAQs, and books appointments directly into your calendar  zero hold music.",
    fullDescription: "A virtual receptionist that greets customers, answers FAQs about your business, and books appointments directly into your calendar — via WhatsApp, phone, or web chat.",
    benefits: "Zero missed appointments, no need for a full-time receptionist, and a professional first impression for every customer interaction.",
    automationPoints: ["Instant appointment booking", "Confirmation & reminder messages", "Pre-appointment intake forms", "Waitlist management", "Multi-language support"],
    deliverables: ["AI receptionist bot", "Calendar integration", "Automated reminders", "Pre-visit questionnaire", "Analytics dashboard"],
    industries: ["Healthcare", "Salons & Spas", "Legal Firms", "Fitness", "Real Estate", "Education"],
    serviceType: "AI Agents", status: "Live", engagementSize: "Starter"
  },
  {
    id: 4, slug: "internal-ai-assistant", name: "Internal AI Assistant", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "A Slack- or Teams-based assistant trained on your SOPs, policies, and wikis — so employees get instant answers.",
    fullDescription: "An AI-powered internal helpdesk that answers employee questions about policies, leave, IT troubleshooting, onboarding, and more — trained on your documents and SOPs.",
    benefits: "Frees HR and IT to focus on strategic work, reduces onboarding time, and ensures consistent answers for every employee.",
    automationPoints: ["Instant policy answers 24/7", "Automated IT troubleshooting", "Guided onboarding", "Leave management via chat", "Document retrieval"],
    deliverables: ["AI assistant on company docs", "Slack/Teams integration", "IT decision trees", "Onboarding automation", "Admin dashboard"],
    industries: ["SaaS / Tech", "Manufacturing", "Enterprises", "Agencies", "Professional Services"],
    serviceType: "AI Agents", status: "Live", engagementSize: "Enterprise"
  },
  {
    id: 5, slug: "voice-ai-ivr", name: "Voice AI & IVR Automation", category: "AI Agents & Conversational AI", categoryId: 1,
    shortDescription: "AI voice agents for inbound/outbound calls and IVR systems.",
    fullDescription: "AI-powered voice agents that handle inbound and outbound phone calls — from customer service to sales follow-ups — sounding natural and human-like.",
    benefits: "Handles thousands of simultaneous calls, never puts anyone on hold, and captures every conversation's data automatically.",
    automationPoints: ["24/7 phone answering", "Intelligent call routing", "Outbound reminder calls", "Full call transcription", "Multilingual support"],
    deliverables: ["Voice AI deployment", "Custom IVR flows", "Transcription dashboard", "CRM integration", "Compliance recording"],
    industries: ["Healthcare", "Insurance", "Real Estate", "Banking", "Logistics", "Government"],
    serviceType: "AI Agents", status: "Live", engagementSize: "Enterprise"
  },
  // Category 2 — Workflow & Business Process Automation
  {
    id: 6, slug: "no-code-workflow", name: "No-Code Workflow Automation", category: "Workflow & Business Process Automation", categoryId: 2,
    shortDescription: "Connect CRMs, email, payments, and spreadsheets with n8n, Make, or Zapier — no developer needed.",
    fullDescription: "Custom automated workflows that connect your business tools and make them work together without manual intervention. When X happens, Y and Z are done automatically.",
    benefits: "Save 10–20 hours per week per team, reduce human error to near-zero, and scale operations without hiring more people.",
    automationPoints: ["Eliminate repetitive processes", "Real-time data sync", "Error-free execution", "Instant notifications", "Scalable infrastructure"],
    deliverables: ["Workflow audit", "n8n/Zapier/Make deployment", "Multi-tool integrations", "Error handling logic", "Documentation & training"],
    industries: ["All Industries"],
    serviceType: "Workflow Automation", status: "Live", engagementSize: "Starter"
  },
  {
    id: 7, slug: "document-invoice-automation", name: "Document & Invoice Automation", category: "Workflow & Business Process Automation", categoryId: 2,
    shortDescription: "Auto-generate proposals, invoices, and contracts the moment a deal closes — and chase late payments automatically.",
    fullDescription: "Automated systems that generate proposals, invoices, contracts, and reports from templates — pulling data from your CRM or forms — and sending them automatically.",
    benefits: "Get paid faster, look more professional, and never forget to send an invoice again. Complete audit trail for compliance.",
    automationPoints: ["Event-triggered generation", "Zero manual data entry", "Multi-channel delivery", "Payment tracking", "Audit trail"],
    deliverables: ["Template design", "CRM-triggered workflows", "Email + WhatsApp delivery", "Payment integration", "Overdue reminders"],
    industries: ["Professional Services", "Agencies", "Freelancers", "E-Commerce", "Manufacturing"],
    serviceType: "Workflow Automation", status: "Live", engagementSize: "Starter"
  },
  {
    id: 8, slug: "lead-routing", name: "Smart Lead Routing & Assignment", category: "Workflow & Business Process Automation", categoryId: 2,
    shortDescription: "Instantly distribute leads by geography, deal size, or availability — with auto-escalation if a rep goes silent.",
    fullDescription: "Intelligent systems that automatically distribute incoming leads to the right salesperson based on geography, language, product interest, deal size, or availability.",
    benefits: "Faster response times, fair workload distribution, and significantly higher conversion rates.",
    automationPoints: ["Instant lead assignment", "Rule-based routing", "Round-robin distribution", "Auto-escalation", "Performance visibility"],
    deliverables: ["Routing logic design", "CRM integration", "Real-time notifications", "Escalation workflows", "Response time dashboard"],
    industries: ["Real Estate", "Insurance", "Education", "Automotive", "SaaS"],
    serviceType: "Workflow Automation", status: "Live", engagementSize: "Growth"
  },
  {
    id: 9, slug: "erp-integration", name: "ERP & Multi-Tool Integration", category: "Workflow & Business Process Automation", categoryId: 2,
    shortDescription: "Bridge Tally, SAP, Shopify, and everything in between so data flows in real time — zero copy-pasting.",
    fullDescription: "Custom integrations connecting ERPs (Tally, SAP, Oracle), CRMs, e-commerce platforms, accounting tools, and communication apps for seamless data flow.",
    benefits: "Single source of truth, eliminate duplicate data entry, and automate reconciliation between all business systems.",
    automationPoints: ["Real-time data sync", "Eliminate duplicate entry", "Single source of truth", "Automated reconciliation", "Custom API connections"],
    deliverables: ["Integration architecture", "API development", "Real-time sync", "Error handling & alerting", "Documentation"],
    industries: ["Manufacturing", "Retail", "E-Commerce", "Logistics", "Healthcare"],
    serviceType: "Workflow Automation", status: "Live", engagementSize: "Enterprise"
  },
  {
    id: 10, slug: "notification-systems", name: "Notification & Alert Systems", category: "Workflow & Business Process Automation", categoryId: 2,
    shortDescription: "Smart alerts for critical business events across all channels.",
    fullDescription: "Smart notification engines that monitor business events and instantly alert the right people through WhatsApp, Slack, SMS, email, or push notifications.",
    benefits: "Nothing slips through the cracks, team accountability improves, and problems are caught before they become crises.",
    automationPoints: ["Real-time critical alerts", "Multi-channel delivery", "Escalation chains", "Custom thresholds", "Digest summaries"],
    deliverables: ["Alert engine setup", "Channel integrations", "Escalation workflows", "Custom triggers", "Dashboard"],
    industries: ["All Industries"],
    serviceType: "Workflow Automation", status: "Live", engagementSize: "Starter"
  },
  // Category 3 — Performance Marketing
  {
    id: 11, slug: "meta-ads", name: "Meta Ads (Facebook + Instagram)", category: "Performance Marketing & Paid Advertising", categoryId: 3,
    shortDescription: "Full-funnel campaigns from awareness to conversion — with AI-assisted creative testing that finds winners 3× faster.",
    fullDescription: "Full-funnel advertising on Facebook and Instagram — from awareness to conversion. Strategy, audience research, creative production, A/B testing, and daily optimization.",
    benefits: "Proper campaign architectures with cold audiences at top, retargeting in middle, and conversion at bottom — so every rupee works harder.",
    automationPoints: ["Audience segmentation", "Creative A/B testing", "Retargeting automation", "Budget optimization", "Performance reporting"],
    deliverables: ["Campaign strategy", "Ad creative production", "Audience research", "Pixel & tracking setup", "Monthly reports"],
    industries: ["E-Commerce", "Real Estate", "Education", "Healthcare", "F&B"],
    serviceType: "Paid Ads", status: "Live", engagementSize: "Growth"
  },
  {
    id: 12, slug: "google-ads", name: "Google Ads (Search + Display + YouTube)", category: "Performance Marketing & Paid Advertising", categoryId: 3,
    shortDescription: "Capture high-intent buyers the moment they search — with precision targeting that eliminates wasted spend.",
    fullDescription: "Search, Display, Shopping, and YouTube campaigns targeting high-intent users actively searching for your products or services.",
    benefits: "Capture demand at the moment of intent. Every click is from someone actively looking for what you sell.",
    automationPoints: ["Keyword research & bidding", "Ad copy optimization", "Quality Score improvement", "Conversion tracking", "Automated rules"],
    deliverables: ["Campaign architecture", "Keyword strategy", "Ad copy & extensions", "Tracking setup", "Performance dashboard"],
    industries: ["SaaS", "Healthcare", "Education", "Legal", "E-Commerce"],
    serviceType: "Paid Ads", status: "Live", engagementSize: "Growth"
  },
  {
    id: 13, slug: "linkedin-ads", name: "LinkedIn B2B Campaigns", category: "Performance Marketing & Paid Advertising", categoryId: 3,
    shortDescription: "Reach decision-makers by title, company, and seniority — and fill your pipeline with qualified B2B leads.",
    fullDescription: "B2B advertising on LinkedIn targeting decision-makers by job title, company size, industry, and seniority — for lead generation, brand awareness, and thought leadership.",
    benefits: "Reach the exact people who make buying decisions. No other platform offers this level of B2B targeting precision.",
    automationPoints: ["Account-based targeting", "Lead gen forms", "Retargeting campaigns", "Content promotion", "InMail automation"],
    deliverables: ["Campaign strategy", "Audience targeting", "Ad creative", "Lead gen forms", "Analytics"],
    industries: ["SaaS", "Professional Services", "Finance", "Manufacturing", "Education"],
    serviceType: "Paid Ads", status: "Live", engagementSize: "Growth"
  },
  {
    id: 14, slug: "programmatic-ads", name: "Programmatic & Display Advertising", category: "Performance Marketing & Paid Advertising", categoryId: 3,
    shortDescription: "Automated ad buying across premium publisher networks.",
    fullDescription: "Automated ad buying across premium publisher networks, apps, and connected TV — using data-driven targeting and real-time bidding.",
    benefits: "Reach audiences across thousands of premium websites and apps with precise targeting at scale.",
    automationPoints: ["Real-time bidding", "Audience segmentation", "Cross-device targeting", "Frequency capping", "Viewability optimization"],
    deliverables: ["Media plan", "Creative production", "Campaign setup", "Brand safety controls", "Performance reports"],
    industries: ["FMCG", "Automotive", "Finance", "Real Estate", "E-Commerce"],
    serviceType: "Paid Ads", status: "In Progress", engagementSize: "Enterprise"
  },
  {
    id: 15, slug: "retargeting", name: "Retargeting & Programmatic", category: "Performance Marketing & Paid Advertising", categoryId: 3,
    shortDescription: "Follow your warmest prospects across the web and bring them back to convert — the highest-ROI media spend.",
    fullDescription: "Cross-platform retargeting campaigns that re-engage website visitors, cart abandoners, and past customers with personalized ads.",
    benefits: "Retargeted visitors are 70% more likely to convert. Recover lost revenue from people who already showed interest.",
    automationPoints: ["Pixel-based retargeting", "Dynamic product ads", "Sequential messaging", "Cross-platform sync", "Frequency management"],
    deliverables: ["Retargeting strategy", "Audience segmentation", "Dynamic creatives", "Cross-platform setup", "ROI tracking"],
    industries: ["E-Commerce", "SaaS", "Education", "Real Estate", "Travel"],
    serviceType: "Paid Ads", status: "Live", engagementSize: "Starter"
  },
  // Category 4 — SEO, Content & Organic Growth
  {
    id: 16, slug: "technical-seo", name: "Technical SEO & Site Optimization", category: "SEO, Content & Organic Growth", categoryId: 4,
    shortDescription: "Fix technical issues that prevent Google from ranking your site.",
    fullDescription: "Comprehensive technical SEO audits and fixes — site speed, mobile optimization, crawlability, indexing, schema markup, and Core Web Vitals.",
    benefits: "Fix the invisible problems that prevent Google from ranking your site. Technical SEO is the foundation everything else builds on.",
    automationPoints: ["Automated crawl monitoring", "Speed optimization", "Schema implementation", "Index management", "Core Web Vitals tracking"],
    deliverables: ["Technical audit", "Speed optimization", "Schema markup", "XML sitemap", "Monthly monitoring"],
    industries: ["All Industries"],
    serviceType: "SEO", status: "Live", engagementSize: "Starter"
  },
  {
    id: 17, slug: "content-seo", name: "Content Strategy & SEO Writing", category: "SEO, Content & Organic Growth", categoryId: 4,
    shortDescription: "A research-backed editorial engine that ranks on Google and positions your brand as the go-to expert.",
    fullDescription: "Keyword research, content planning, and SEO-optimized article writing that ranks on Google and converts readers into leads.",
    benefits: "Build a content engine that generates organic traffic month after month, compounding over time.",
    automationPoints: ["Keyword research automation", "Content calendar", "AI-assisted writing", "Internal linking", "Performance tracking"],
    deliverables: ["Keyword strategy", "Content calendar", "SEO articles", "Internal linking plan", "Monthly reports"],
    industries: ["SaaS", "Healthcare", "Education", "Finance", "E-Commerce"],
    serviceType: "Content", status: "Live", engagementSize: "Growth"
  },
  {
    id: 18, slug: "local-seo", name: "Local SEO & Google Business Profile", category: "SEO, Content & Organic Growth", categoryId: 4,
    shortDescription: "Dominate near me searches and Google Maps — more walk-ins, more calls, more bookings from free traffic.",
    fullDescription: "Optimize your Google Business Profile, build local citations, manage reviews, and rank in the local pack for your service area.",
    benefits: "Appear in Google Maps and local search results when nearby customers search for your services.",
    automationPoints: ["GBP optimization", "Review management", "Citation building", "Local content", "Rank tracking"],
    deliverables: ["GBP setup & optimization", "Citation audit", "Review strategy", "Local content plan", "Monthly reports"],
    industries: ["Healthcare", "Restaurants", "Salons", "Legal", "Retail", "Real Estate"],
    serviceType: "SEO", status: "Live", engagementSize: "Starter"
  },
  {
    id: 19, slug: "social-media-management", name: "Social Media Management", category: "SEO, Content & Organic Growth", categoryId: 4,
    shortDescription: "Strategic social media presence across all platforms.",
    fullDescription: "End-to-end social media management — content creation, scheduling, community management, and analytics across Instagram, LinkedIn, Twitter, and Facebook.",
    benefits: "Build a consistent, engaging social presence that builds brand authority and drives organic traffic.",
    automationPoints: ["Content scheduling", "Community management", "Analytics tracking", "Trend monitoring", "Hashtag strategy"],
    deliverables: ["Content calendar", "Post creation", "Community management", "Monthly analytics", "Strategy reviews"],
    industries: ["All Industries"],
    serviceType: "Content", status: "Live", engagementSize: "Starter"
  },
  {
    id: 20, slug: "video-content", name: "Video Content & YouTube SEO", category: "SEO, Content & Organic Growth", categoryId: 4,
    shortDescription: "Video production and YouTube channel optimization.",
    fullDescription: "Video content strategy, production, editing, and YouTube SEO optimization to build a video presence that drives traffic and authority.",
    benefits: "Video content gets 50x more engagement than text. Build a YouTube presence that compounds over time.",
    automationPoints: ["Content planning", "SEO optimization", "Thumbnail A/B testing", "Analytics tracking", "Distribution automation"],
    deliverables: ["Video strategy", "Script writing", "Production & editing", "YouTube SEO", "Analytics dashboard"],
    industries: ["Education", "SaaS", "Healthcare", "E-Commerce", "Personal Brands"],
    serviceType: "Content", status: "In Progress", engagementSize: "Growth"
  },
  // Category 5 — Messaging & Communication
  {
    id: 21, slug: "whatsapp-business", name: "WhatsApp Business API Automation", category: "Messaging, Email & Communication", categoryId: 5,
    shortDescription: "Broadcasts, drip sequences, AI chatbots, catalogues, and payments — all inside the app your customers already use.",
    fullDescription: "Full WhatsApp Business API setup and automation — broadcast campaigns, drip sequences, order notifications, support routing, and interactive catalogs.",
    benefits: "WhatsApp has 98% open rates in India. Reach customers where they already are, with messages they actually read.",
    automationPoints: ["Broadcast campaigns", "Drip sequences", "Order notifications", "Interactive catalogs", "Support routing"],
    deliverables: ["API setup", "Template messages", "Automation flows", "Catalog integration", "Analytics dashboard"],
    industries: ["E-Commerce", "Healthcare", "Education", "Real Estate", "F&B"],
    serviceType: "Messaging", status: "Live", engagementSize: "Starter"
  },
  {
    id: 22, slug: "email-marketing", name: "Email Marketing & Drip Campaigns", category: "Messaging, Email & Communication", categoryId: 5,
    shortDescription: "Segmented, behaviour-triggered sequences that nurture, recover carts, and drive repeat purchases on autopilot.",
    fullDescription: "Email marketing strategy, template design, automation setup, and campaign management — from welcome sequences to re-engagement campaigns.",
    benefits: "Email delivers $42 for every $1 spent. Build automated sequences that nurture leads while you sleep.",
    automationPoints: ["Welcome sequences", "Behavioral triggers", "Segmentation", "A/B testing", "Deliverability optimization"],
    deliverables: ["Email strategy", "Template design", "Automation setup", "List management", "Performance reports"],
    industries: ["SaaS", "E-Commerce", "Education", "Professional Services", "Healthcare"],
    serviceType: "Messaging", status: "Live", engagementSize: "Starter"
  },
  {
    id: 23, slug: "sms-rcs", name: "SMS & RCS Messaging", category: "Messaging, Email & Communication", categoryId: 5,
    shortDescription: "Transactional and promotional SMS/RCS messaging at scale.",
    fullDescription: "SMS and RCS messaging for transactional alerts, promotional campaigns, OTP delivery, and rich media messaging with tracking.",
    benefits: "SMS has 98% open rates and 90% read within 3 minutes. Perfect for time-sensitive communications.",
    automationPoints: ["Bulk messaging", "Personalization", "Delivery tracking", "OTP automation", "Rich media (RCS)"],
    deliverables: ["SMS gateway setup", "Template creation", "Automation flows", "DLT registration", "Analytics"],
    industries: ["E-Commerce", "Banking", "Healthcare", "Logistics", "Retail"],
    serviceType: "Messaging", status: "Live", engagementSize: "Starter"
  },
  {
    id: 24, slug: "push-notifications", name: "Push Notification Systems", category: "Messaging, Email & Communication", categoryId: 5,
    shortDescription: "Web and mobile push notifications for engagement and retention.",
    fullDescription: "Web and mobile push notification setup, segmentation, and automation — for re-engagement, promotions, updates, and transactional alerts.",
    benefits: "Reach users even when they're not on your site. Push notifications have 7x higher engagement than email.",
    automationPoints: ["Behavioral triggers", "Segmentation", "A/B testing", "Scheduling", "Analytics"],
    deliverables: ["Push setup", "Segmentation strategy", "Automation flows", "Template library", "Performance tracking"],
    industries: ["E-Commerce", "Media", "SaaS", "Education", "Gaming"],
    serviceType: "Messaging", status: "In Progress", engagementSize: "Starter"
  },
  {
    id: 25, slug: "omnichannel-inbox", name: "Omnichannel Inbox & Routing", category: "Messaging, Email & Communication", categoryId: 5,
    shortDescription: "WhatsApp, Instagram, email, web chat, and SMS — all in one screen, with full context and team collaboration.",
    fullDescription: "A single unified inbox that aggregates messages from WhatsApp, email, Instagram, Facebook, web chat, and SMS — with intelligent routing and assignment.",
    benefits: "Never miss a customer message again. One inbox, all channels, intelligent routing to the right team member.",
    automationPoints: ["Channel aggregation", "Smart routing", "Auto-assignment", "SLA tracking", "Canned responses"],
    deliverables: ["Inbox setup", "Channel integrations", "Routing rules", "SLA configuration", "Team training"],
    industries: ["E-Commerce", "Healthcare", "SaaS", "Education", "Professional Services"],
    serviceType: "Messaging", status: "Live", engagementSize: "Growth"
  },
  // Category 6 — Web Design, Branding & Creative
  {
    id: 26, slug: "website-design", name: "Business Website Design", category: "Web Design, Branding & Creative", categoryId: 6,
    shortDescription: "Custom-built on Webflow, Framer, or Next.js — fast, beautiful, and engineered to convert.",
    fullDescription: "Custom-designed, mobile-responsive business websites built on modern platforms — optimized for speed, SEO, and lead generation.",
    benefits: "A well-designed website builds trust, communicates value clearly, and converts visitors into leads or customers.",
    automationPoints: ["Responsive design", "SEO optimization", "Speed optimization", "CMS integration", "Analytics setup"],
    deliverables: ["Custom website design", "Mobile optimization", "CMS setup", "SEO foundation", "Analytics integration"],
    industries: ["All Industries"],
    serviceType: "Web / Design", status: "Live", engagementSize: "Growth"
  },
  {
    id: 27, slug: "landing-pages", name: "Landing Page Design & Optimization", category: "Web Design, Branding & Creative", categoryId: 6,
    shortDescription: "Single-purpose pages built for ad campaigns — with continuous A/B testing to squeeze every percent of conversion.",
    fullDescription: "Conversion-optimized landing pages designed for specific campaigns, offers, or funnels — with A/B testing and analytics built in.",
    benefits: "A dedicated landing page converts 2–5x better than sending traffic to your homepage.",
    automationPoints: ["A/B testing", "Heatmap tracking", "Form optimization", "Speed optimization", "Conversion tracking"],
    deliverables: ["Landing page design", "Copywriting", "A/B test setup", "Analytics integration", "Performance reports"],
    industries: ["SaaS", "Education", "Healthcare", "Real Estate", "E-Commerce"],
    serviceType: "Web / Design", status: "Live", engagementSize: "Starter"
  },
  {
    id: 28, slug: "brand-identity", name: "Brand Identity & Visual Design", category: "Web Design, Branding & Creative", categoryId: 6,
    shortDescription: "Logo, colour, typography, templates, and guidelines — a complete visual language that commands premium pricing.",
    fullDescription: "Complete brand identity design — logo, color palette, typography, brand guidelines, business cards, and social media templates.",
    benefits: "A strong brand identity builds recognition, trust, and premium perception. It's the foundation of all marketing.",
    automationPoints: ["Brand audit", "Competitor analysis", "Design system creation", "Template automation", "Asset management"],
    deliverables: ["Logo design", "Brand guidelines", "Color & typography", "Business cards", "Social templates"],
    industries: ["All Industries"],
    serviceType: "Web / Design", status: "Live", engagementSize: "Starter"
  },
  {
    id: 29, slug: "video-production", name: "Video Production & Motion Graphics", category: "Web Design, Branding & Creative", categoryId: 6,
    shortDescription: "Professional video content and animated graphics.",
    fullDescription: "Professional video production, editing, motion graphics, and animation — for ads, explainers, social media, and brand storytelling.",
    benefits: "Video content gets 1200% more shares than text and images combined. Stand out with professional video.",
    automationPoints: ["Script-to-video pipeline", "Template-based editing", "Batch rendering", "Multi-format export", "Distribution automation"],
    deliverables: ["Video production", "Motion graphics", "Editing & post", "Multi-format delivery", "Brand consistency"],
    industries: ["All Industries"],
    serviceType: "Web / Design", status: "Live", engagementSize: "Growth"
  },
  {
    id: 30, slug: "ui-ux-design", name: "UI/UX Design & Prototyping", category: "Web Design, Branding & Creative", categoryId: 6,
    shortDescription: "User-centred interfaces for apps, dashboards, and SaaS products — wireframed, prototyped, and tested.",
    fullDescription: "User research, wireframing, UI design, and interactive prototyping for web and mobile applications — focused on usability and conversion.",
    benefits: "Every $1 invested in UX returns $100. Good design isn't just pretty — it directly impacts revenue.",
    automationPoints: ["User research", "Wireframing", "Design system", "Prototype testing", "Handoff automation"],
    deliverables: ["User research", "Wireframes", "UI designs", "Interactive prototypes", "Design system"],
    industries: ["SaaS", "E-Commerce", "Healthcare", "Finance", "Education"],
    serviceType: "Web / Design", status: "Live", engagementSize: "Growth"
  },
  // Category 7 — E-Commerce
  {
    id: 31, slug: "ecommerce-store", name: "E-Commerce Store Setup", category: "E-Commerce & Marketplace Growth", categoryId: 7,
    shortDescription: "Complete online store setup on Shopify, WooCommerce, or custom.",
    fullDescription: "End-to-end e-commerce store setup — platform selection, design, product catalog, payment gateway, shipping integration, and launch.",
    benefits: "Get selling online in weeks, not months. A properly set up store converts visitors into buyers from day one.",
    automationPoints: ["Product catalog automation", "Inventory sync", "Order processing", "Payment integration", "Shipping automation"],
    deliverables: ["Store design", "Product setup", "Payment gateway", "Shipping integration", "Launch checklist"],
    industries: ["Retail", "Fashion", "F&B", "Beauty", "Electronics"],
    serviceType: "E-Commerce", status: "Live", engagementSize: "Growth"
  },
  {
    id: 32, slug: "marketplace-management", name: "Marketplace Management", category: "E-Commerce & Marketplace Growth", categoryId: 7,
    shortDescription: "Get listed, optimised, and selling on Amazon, Flipkart, Meesho, and more — with managed ads and inventory sync.",
    fullDescription: "Multi-marketplace management — listing optimization, inventory sync, pricing strategy, advertising, and review management across Amazon, Flipkart, and more.",
    benefits: "Expand your reach to millions of marketplace shoppers while maintaining control over pricing, inventory, and brand.",
    automationPoints: ["Listing optimization", "Inventory sync", "Price monitoring", "Review management", "Ad optimization"],
    deliverables: ["Marketplace setup", "Listing optimization", "Inventory sync", "Ad campaigns", "Performance reports"],
    industries: ["Retail", "Fashion", "Electronics", "Beauty", "Home & Garden"],
    serviceType: "E-Commerce", status: "Live", engagementSize: "Growth"
  },
  {
    id: 33, slug: "cart-abandonment", name: "Cart Abandonment Recovery", category: "E-Commerce & Marketplace Growth", categoryId: 7,
    shortDescription: "Recover lost sales with automated abandonment sequences.",
    fullDescription: "Multi-channel cart abandonment recovery — email, WhatsApp, SMS, and push notification sequences triggered when customers leave without buying.",
    benefits: "Recover 15–30% of abandoned carts. That's pure revenue you're currently leaving on the table.",
    automationPoints: ["Real-time triggers", "Multi-channel sequences", "Dynamic product content", "Incentive logic", "A/B testing"],
    deliverables: ["Recovery strategy", "Email sequences", "WhatsApp flows", "SMS campaigns", "Performance tracking"],
    industries: ["E-Commerce", "Retail", "Fashion", "Electronics", "F&B"],
    serviceType: "E-Commerce", status: "Live", engagementSize: "Starter"
  },
  {
    id: 34, slug: "product-feed", name: "Product Feed & Catalog Automation", category: "E-Commerce & Marketplace Growth", categoryId: 7,
    shortDescription: "Automated product feeds for Google Shopping and social commerce.",
    fullDescription: "Automated product feed management for Google Shopping, Meta Catalog, and marketplace listings — keeping prices, stock, and descriptions synced.",
    benefits: "Ensure your products are always accurately listed everywhere you sell, without manual updates.",
    automationPoints: ["Feed generation", "Price sync", "Stock updates", "Error monitoring", "Multi-platform distribution"],
    deliverables: ["Feed setup", "Platform integration", "Sync automation", "Error alerts", "Performance tracking"],
    industries: ["E-Commerce", "Retail", "Fashion", "Electronics"],
    serviceType: "E-Commerce", status: "Live", engagementSize: "Starter"
  },
  // Category 8 — Sales, CRM & Revenue
  {
    id: 35, slug: "crm-setup", name: "CRM Setup & Sales Pipeline", category: "Sales, CRM & Revenue Operations", categoryId: 8,
    shortDescription: "HubSpot, Zoho, Salesforce, or Pipedrive — configured so every lead is tracked, followed up, and never lost.",
    fullDescription: "Full CRM implementation and optimization — platform selection, pipeline configuration, automation rules, and team training.",
    benefits: "Every lead tracked from first touch to closed deal. Follow-ups happen automatically, and management has real-time visibility.",
    automationPoints: ["Pipeline automation", "Lead scoring", "Follow-up sequences", "Reporting automation", "Integration sync"],
    deliverables: ["CRM setup", "Pipeline design", "Automation rules", "Team training", "Custom reports"],
    industries: ["All Industries"],
    serviceType: "Sales / CRM", status: "Live", engagementSize: "Growth"
  },
  {
    id: 36, slug: "sales-funnel", name: "Sales Funnel Automation", category: "Sales, CRM & Revenue Operations", categoryId: 8,
    shortDescription: "Automated journeys from first click to payment — landing pages, nurture sequences, upsells, and cart recovery.",
    fullDescription: "Complete sales funnel design and automation — from lead capture to nurturing to conversion, with every step tracked and optimized.",
    benefits: "Turn your sales process into a predictable machine. Know exactly how many leads become customers and where to improve.",
    automationPoints: ["Lead capture", "Nurture sequences", "Scoring & qualification", "Handoff automation", "Conversion tracking"],
    deliverables: ["Funnel strategy", "Landing pages", "Email sequences", "CRM integration", "Analytics dashboard"],
    industries: ["SaaS", "Education", "Real Estate", "Professional Services", "Healthcare"],
    serviceType: "Sales / CRM", status: "Live", engagementSize: "Growth"
  },
  {
    id: 37, slug: "lead-generation", name: "Lead Generation Systems", category: "Sales, CRM & Revenue Operations", categoryId: 8,
    shortDescription: "SEO, lead magnets, cold email, LinkedIn outreach, and data scraping — a predictable top-of-funnel machine.",
    fullDescription: "Multi-channel lead generation systems combining content, ads, SEO, referrals, and outbound to create a consistent flow of qualified leads.",
    benefits: "Never worry about where the next customer is coming from. Build a predictable lead generation engine.",
    automationPoints: ["Multi-channel capture", "Lead scoring", "Qualification automation", "Pipeline enrichment", "Attribution tracking"],
    deliverables: ["Lead gen strategy", "Channel setup", "Capture forms", "Scoring logic", "Attribution reports"],
    industries: ["All Industries"],
    serviceType: "Sales / CRM", status: "Live", engagementSize: "Growth"
  },
  {
    id: 38, slug: "referral-loyalty", name: "Referral & Loyalty Programs", category: "Sales, CRM & Revenue Operations", categoryId: 8,
    shortDescription: "Points, tiers, referral codes, and win-back campaigns — because keeping a customer costs 5× less than finding one.",
    fullDescription: "Automated referral programs and loyalty systems that incentivize existing customers to bring new ones and keep coming back.",
    benefits: "Referred customers have 37% higher retention. Turn your best customers into your best salespeople.",
    automationPoints: ["Referral tracking", "Reward automation", "Points management", "Tier progression", "Analytics"],
    deliverables: ["Program design", "Platform setup", "Reward logic", "Communication flows", "Performance tracking"],
    industries: ["E-Commerce", "F&B", "Beauty", "SaaS", "Education"],
    serviceType: "Sales / CRM", status: "In Progress", engagementSize: "Growth"
  },
  {
    id: 39, slug: "influencer-affiliate", name: "Influencer & Affiliate Management", category: "Sales, CRM & Revenue Operations", categoryId: 8,
    shortDescription: "Manage influencer partnerships and affiliate programs at scale.",
    fullDescription: "End-to-end influencer and affiliate program management — recruitment, tracking, commission management, and performance optimization.",
    benefits: "Scale word-of-mouth marketing systematically. Track every influencer's ROI and optimize spend accordingly.",
    automationPoints: ["Recruitment automation", "Link tracking", "Commission calculation", "Content approval", "Performance analytics"],
    deliverables: ["Program setup", "Recruitment strategy", "Tracking system", "Commission management", "Reports"],
    industries: ["E-Commerce", "Fashion", "Beauty", "SaaS", "F&B"],
    serviceType: "Sales / CRM", status: "In Progress", engagementSize: "Growth"
  },
  // Category 9 — Business Operations & Infrastructure
  {
    id: 40, slug: "analytics-dashboards", name: "Analytics & BI Dashboards", category: "Business Operations & Infrastructure", categoryId: 9,
    shortDescription: "Live dashboards in Looker Studio, Metabase, or Tableau — KPIs, marketing ROI, and sales metrics at a glance.",
    fullDescription: "Custom analytics dashboards and BI solutions that consolidate data from all sources into clear, actionable visualizations for decision-making.",
    benefits: "Stop guessing, start knowing. See your entire business performance in one place, updated in real-time.",
    automationPoints: ["Data consolidation", "Real-time updates", "Custom visualizations", "Automated reports", "Alert triggers"],
    deliverables: ["Dashboard design", "Data integration", "Custom reports", "Automated alerts", "Team training"],
    industries: ["All Industries"],
    serviceType: "Analytics", status: "Live", engagementSize: "Growth"
  },
  {
    id: 41, slug: "cloud-infrastructure", name: "Cloud Infrastructure & DevOps", category: "Business Operations & Infrastructure", categoryId: 9,
    shortDescription: "Scalable cloud setup, deployment pipelines, and monitoring.",
    fullDescription: "Cloud infrastructure setup, CI/CD pipelines, monitoring, and optimization on AWS, GCP, or Azure — built for reliability and scale.",
    benefits: "Infrastructure that scales automatically, deploys reliably, and costs only what you use.",
    automationPoints: ["Auto-scaling", "CI/CD pipelines", "Monitoring & alerting", "Cost optimization", "Security automation"],
    deliverables: ["Architecture design", "Cloud setup", "CI/CD pipeline", "Monitoring", "Documentation"],
    industries: ["SaaS", "E-Commerce", "Healthcare", "Finance", "Education"],
    serviceType: "Cloud", status: "Live", engagementSize: "Enterprise"
  },
  {
    id: 42, slug: "hr-recruitment", name: "HR & Recruitment Automation", category: "Business Operations & Infrastructure", categoryId: 9,
    shortDescription: "AI resume screening, auto-scheduling, candidate comms, and day-1-to-30 onboarding — hire faster, onboard smoother.",
    fullDescription: "End-to-end HR automation — job posting distribution, applicant tracking, interview scheduling, onboarding workflows, and employee management.",
    benefits: "Reduce time-to-hire by 50%, automate onboarding, and free HR to focus on people instead of paperwork.",
    automationPoints: ["Job distribution", "Resume screening", "Interview scheduling", "Onboarding automation", "Employee self-service"],
    deliverables: ["ATS setup", "Job posting automation", "Interview scheduling", "Onboarding flows", "HR dashboard"],
    industries: ["All Industries"],
    serviceType: "HR / Ops", status: "Live", engagementSize: "Growth"
  },
  {
    id: 43, slug: "data-security", name: "Data Security & Compliance", category: "Business Operations & Infrastructure", categoryId: 9,
    shortDescription: "Protect business data and ensure regulatory compliance.",
    fullDescription: "Data security audits, compliance implementation, backup automation, and access control — ensuring your business data is protected and compliant.",
    benefits: "Protect your business from data breaches, ensure regulatory compliance, and build customer trust.",
    automationPoints: ["Security audits", "Access control", "Backup automation", "Compliance monitoring", "Incident response"],
    deliverables: ["Security audit", "Policy implementation", "Backup setup", "Compliance documentation", "Training"],
    industries: ["Healthcare", "Finance", "SaaS", "E-Commerce", "Government"],
    serviceType: "Cloud", status: "Live", engagementSize: "Enterprise"
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
