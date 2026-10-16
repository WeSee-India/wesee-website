import extracted from "./extracted.json" with { type: "json" };

/**
 * Initial content for pages and settings: the copy the site shipped with
 * before it became editable, verbatim. Collections (projects, services, blog,
 * jobs, …) are seeded from extracted.json, which was lifted directly from the
 * former hardcoded client data.
 */

const x = extracted;
const link = (label: string, href: string) => ({ label, href });

export const pageSeo: Record<string, { seoTitle: string; seoDescription: string }> = {
  home: {
    seoTitle: "WeSee — AI Agents, Automation & Software",
    seoDescription:
      "WeSee designs, builds, and ships AI agents, automation, and custom software for ambitious businesses — from lead generation and marketing to internal operations. From Tokyo to Mumbai.",
  },
  services: {
    seoTitle: "Services — AI Agents, Automation, Marketing & Web | WeSee",
    seoDescription: "Explore 50+ WeSee services: AI agents and voice bots, workflow automation, performance marketing, SEO, web and e-commerce development, CRM, analytics and more.",
  },
  "case-studies": {
    seoTitle: "Case Studies | WeSee: AI Agents, Automation & Custom Software",
    seoDescription: "See what WeSee has built: AI finance tools, cloud platforms, trading products and brand sites for clients in Japan and beyond.",
  },
  projects: {
    seoTitle: "Projects — AI Agents, Automations & Apps We Have Built | WeSee",
    seoDescription: "A portfolio of AI agents, workflow automations, apps and dashboards designed and shipped by WeSee, with the tools and platforms behind each one.",
  },
  about: {
    seoTitle: "About WeSee — AI & Engineering Studio, Tokyo to Mumbai",
    seoDescription: "Meet WeSee, a senior product, engineering and AI studio helping ambitious companies automate operations and grow, with teams in Tokyo and Mumbai.",
  },
  team: {
    seoTitle: "Our Team — The People Behind WeSee",
    seoDescription: "The engineers, designers, marketers and AI specialists at WeSee who design, build and ship software, automation and growth systems for our clients.",
  },
  contact: {
    seoTitle: "Contact WeSee — Talk to Our AI & Automation Team",
    seoDescription: "Get in touch with WeSee about AI agents, workflow automation, marketing or custom software. Tell us what you want to build and we will reply quickly.",
  },
  blog: {
    seoTitle: "Blog — AI, Automation & Growth Insights | WeSee",
    seoDescription: "Practical articles from WeSee on AI sales agents, chatbots, workflow automation and AI-driven paid advertising for growing businesses.",
  },
  careers: {
    seoTitle: "Careers at WeSee — Join Our AI & Engineering Studio",
    seoDescription: "Explore open roles at WeSee and help build AI agents, automation and software for ambitious companies. Teams in Tokyo and Mumbai.",
  },
  book: {
    seoTitle: "Book a Free Strategy Call | WeSee",
    seoDescription: "Book a free call with WeSee to map out how AI agents, automation and software can save time and grow your business. No obligation.",
  },
};

export const blogSeo: Record<string, { seoTitle: string; seoDescription: string; ogImage: string }> = {
  "ai-sales-agents-replacing-sdr-teams": {
    seoTitle: "How AI Sales Agents Are Replacing SDR Teams in 2025 | WeSee",
    seoDescription: "The traditional SDR model is breaking. AI sales agents can now qualify leads, book meetings, and follow up — at a fraction of the cost.",
    ogImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
  },
  "hidden-cost-manual-workflows": {
    seoTitle: "The Hidden Cost of Manual Workflows | WeSee",
    seoDescription: "Most businesses underestimate how much manual work costs them. We break down the real numbers and what automation can recover.",
    ogImage: "/cost.jpg",
  },
  "meta-ads-2025-ai-optimization": {
    seoTitle: "Meta Ads in 2025: How AI Is Changing Paid Advertising | WeSee",
    seoDescription: "From Advantage+ campaigns to AI-generated creatives, the Meta ad platform is evolving fast. Here is how to optimise paid advertising with AI.",
    ogImage: "/metaad.jpg",
  },
  "building-first-ai-chatbot-indian-smes": {
    seoTitle: "Building Your First AI Chatbot: A Guide for Indian SMEs | WeSee",
    seoDescription: "A practical, no-jargon guide to building and deploying your first AI chatbot for Indian businesses, from use case to WhatsApp rollout.",
    ogImage: "/chatbot.jpg",
  },
};

export const sectionDefaults: Record<string, Record<string, Record<string, unknown>>> = {
  home: {
    hero: {
      badge: "AI Agents That Work For You 24/7",
      headlinePrefix: "WeSee your",
      rotatingWords: x.heroWords,
      subheading: "WeSee is an AI automation and software studio that builds custom AI agents, workflow automation, and web platforms for growing businesses.",
      primaryCta: link("Explore Services", "/services"),
      miniStats: [
        { value: "35+", label: "Projects" },
        { value: "100+", label: "Automations" },
        { value: "15K+", label: "Hours Saved" },
      ],
    },
    features: {
      heading: "End-to-end automation for modern businesses.",
      items: x.features.map((f) => ({ icon: f.icon, title: f.title, description: f.desc })),
    },
    work: {
      heading: "We build AI that works*.*",
      stats: x.stats,
      body: "AI agents and automated pipelines for sales, customer engagement and day-to-day operations, each one built around a single business outcome.",
      cta: link("Explore our services →", "/services"),
    },
    about: {
      eyebrow: "Who we are",
      heading: "Every business has a *signal* waiting to be found.",
      body: "At WeSee, every engagement begins with finding the signal the unique automation opportunity hidden within every client's operations. It requires deep discovery, rigorous analysis, and bold thinking to uncover. Our job is to find it, amplify it, and build intelligent systems around it.",
      steps: [
        { title: "Discover & Audit", body: "Map workflows, identify bottlenecks, find the highest leverage automation opportunities." },
        { title: "Design & Build", body: "Our AI engineers craft precise, scalable systems custom-built, not out-of-the-box." },
        { title: "Deploy & Scale", body: "Launch, monitor, and continuously improve from first automation to enterprise scale." },
        { title: "Owned Results", body: "You own every workflow, agent, and dataset. No vendor lock in, ever." },
      ],
    },
    services: {
      heading: "Built for Growth. Powered by AI. Driven by Automation.",
      link: link("View all →", "/services"),
      popoverTitle: "Included services",
    },
    clients: {
      heading: "We partner with ambitious businesses.",
      logos: x.clients.map((c) => ({ name: c.name, logo: c.logoSrc, width: c.w ?? null, height: c.h ?? null })),
    },
    faq: {
      eyebrow: "Before you book",
      heading: "What do people ask before working with WeSee?",
      moreText: "Still have a question?",
      moreLink: link("Book a free call →", "/book"),
    },
    cta: {
      eyebrow: "Get started",
      heading: "Build a business *that runs itself.*",
      body: "AI-powered workflows designed to remove bottlenecks and unlock scale for your business.",
      button: link("careers@weseegpt.com", "mailto:careers@weseegpt.com"),
    },
  },
  about: {
    hero: {
      badge: "Founded 2021 · Japan",
      heading: "*WeSee* beyond the obvious.",
      body: "India's leading AI automation agency  a cross-functional team of AI engineers, operators, and growth strategists building the intelligent systems modern business runs on.",
    },
    mission: {
      heading: "Automation that changes how business works.",
      paragraphs: [
        "At WeSee, we believe the gap between great companies and average ones is increasingly determined by how intelligently they operate. We exist to close that gap — using AI and automation to give ambitious businesses the operational leverage that was once only available to tech giants.",
        "Every system we build is designed to eliminate manual work, accelerate decision-making, and create compounding business value that grows with our clients.",
      ],
    },
    image: { image: { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=70", alt: "" } },
    timeline: { heading: "Building for the long run.", milestones: x.milestones.map((m) => ({ year: m.year, title: m.title, description: m.desc })) },
    stats: {
      heading: "The Impact We've Delivered",
      subheading: "Real results from the systems we build",
      stats: [
        { value: "35+", label: "Projects Delivered", image: "/aisoftware.jpg" },
        { value: "80+", label: "Automations Deployed", image: "/aitalent.jpg" },
        { value: "15K+", label: "Hours Saved Monthly", image: "/digital.webp" },
        { value: "3", label: "Office Locations", image: "/roi.jpg" },
      ],
    },
    values: { heading: "How we operate.", items: x.values.map((v) => ({ title: v.title, description: v.desc })) },
  },
  team: {
    hero: {
      heading: "We are a community of builders.",
      body: "We ship intelligent systems with an ambitious, collaborative spirit — across industries, time zones, and disciplines.",
      disciplines: "Engineering · Design · Operations",
      collage: [
        { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80", alt: "Team collaborating around a table", position: "center 38%" },
        { src: "/tropy.webp", alt: "Discussion and gestures in a meeting", position: "center 55%" },
        { src: "/team.jpg", alt: "WeSee team celebrating a win", position: "center 42%" },
        { src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80", alt: "Colleagues working together", position: "center 40%" },
      ],
    },
    leadership: { heading: "Leadership." },
    marquee: {
      eyebrow: "Meet the people behind WeSee",
      heading: "Build with a team that ships.",
      body: "From leadership to engineering and design, we combine craft and automation so your product moves forward without friction.",
    },
    cta: { button: link("Join our team +", "/careers") },
  },
  careers: {
    hero: { kicker: "Careers at WeSee", heading: "Build the AI systems businesses run on.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=70" },
    teams: {
      heading: "Choose your team",
      body: "Small teams, real ownership. Every role ships work that clients use, from Mumbai.",
      teams: x.teams,
      openTitle: "Open application",
      openLabel: "Any team",
      openBody: "Don't see your role? Send us your CV and portfolio anyway.",
    },
    roles: { heading: "Roles you may be interested in", emptyText: "No open roles in this team right now." },
    apply: {
      kicker: "How it works",
      heading: "Easiest way to apply",
      steps: [
        { title: "Find your role", description: "Pick a role above, or send an open application if nothing fits yet." },
        { title: "Send your application", description: "Email your CV, a short motivation letter and your portfolio to {email}" },
        { title: "Meet the team", description: "If there's a fit, we'll set up a conversation with the people you'd work with." },
      ],
    },
  },
  blog: {
    hero: { heading: "The Blog", subheading: "Practical guides and ideas on AI agents,\nautomation and building smarter businesses" },
    articleCta: {
      title: "Want results like this for your business?",
      body: "Book a free discovery call and we will show you exactly how AI and automation can work for you.",
      button: link("Book a free discovery call →", "/book"),
    },
  },
  projects: {
    cover: {
      eyebrow: "WeSee *Selected work*",
      heading: "Projects",
      summary: "AI agents, automations, trading platforms, apps and brand sites we have designed and shipped. Live work links to the real thing; prototypes are marked as such.",
      coverImage: "/projects/takumi.webp",
      groupOrder: x.projectGroups,
    },
    empty: {
      title: "Our project gallery is being put together.",
      body: "We are collecting screenshots and write-ups from recent work, with our clients' permission. Book a call and we will show you examples close to what you need.",
    },
  },
  "case-studies": {
    header: {
      eyebrow: "Case studies",
      heading: "Work we've built",
      body: "Every project starts with friction. It might be a finance team matching bank lines by hand, a platform nobody can explain to the board, or a brand that needs to win trust in a second language. We find where the work gets stuck, then we build the system that fixes it. Here are five of them.",
      subline: "Engineering in Mumbai. Operations across Japan and India. We build for founders who want working software, not slide decks.",
    },
    empty: {
      title: "Our first case studies are on the way.",
      body: "We are writing them up with our clients' approval, with real numbers and how they were measured. Until then, we are happy to walk you through relevant work on a call.",
    },
    next: {
      heading: "More case studies",
      footerLine: "WeSee the Friction. We Engineer the Flow.",
      footerEmail: "support@weseegpt.com",
    },
  },
  services: {
    ring: { heading: "We are *WeSee.*" },
    detail: {
      deliveryHeading: "How does WeSee deliver this?",
      deliveryParagraphs: [
        "At WeSee, we approach {service} with a rigorous discovery-first methodology. We begin by mapping your current workflows, identifying bottlenecks, and defining clear success metrics before writing a single line of code.",
        "Our team of AI engineers and strategists then design, build, and deploy the solution in iterative sprints — with full transparency and client collaboration at every stage. Post-launch, we provide ongoing optimization and support to ensure the system scales with your business.",
      ],
      ctaKicker: "Next step",
      ctaHeading: "Interested in this service?",
      ctaBody: "Book a free discovery call and we'll show you exactly how this can work for your business.",
      ctaButton: "Book a free discovery call →",
      defaultChart: x.defaultChart,
      defaultFaqs: [
        {
          question: "How long does it take to implement {service}?",
          answer: "Timelines depend on scope, integrations, and your team’s availability. Most engagements begin with discovery followed by sprint-based delivery. After a discovery call we’ll give you a clear timeline and milestones.",
        },
        {
          question: "What do we need from you to get started?",
          answer: "Usually access to stakeholders for discovery, your current workflows, and the tools you use (CRM, ads, helpdesk, etc.). We align on success metrics and priorities before we build.",
        },
        {
          question: "Can this work with our existing systems?",
          answer: "Yes. We design integrations around your stack and document what’s in scope for your engagement, so data flows where you already work.",
        },
        {
          question: "Do you offer support after launch?",
          answer: "We offer ongoing optimization and support options so the solution keeps performing as your business grows. What’s included is spelled out in your proposal.",
        },
        {
          question: "How does pricing work for {service}?",
          answer: "Pricing reflects scope, integrations, and timeline. Book a free discovery call and we’ll walk through your needs and a tailored estimate.",
        },
      ],
    },
  },
  contact: {
    hero: {
      heading: "Get in touch.",
      bannerImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=70",
      closingImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&q=70",
    },
    cards: { cards: x.contactTypes },
    offices: {
      heading: "Our offices.",
      offices: x.offices.map((o) => ({ city: o.city, country: o.country, role: o.role, phone: o.phone, address: o.address, mapUrl: o.map })),
    },
    connect: {
      heading: "Prefer a *quick chat?*",
      subheading: "No forms. No waiting. Just a direct line to the team.",
      message: "Hey — choose how you'd like to connect with WeSee.",
      footnote: "Typically responds within a few hours during business days.",
    },
  },
  book: {
    header: {
      heading: "Let's map the *signal* inside your business.",
      body: "In 30 minutes, we'll understand your current systems, identify your highest–leverage automation opportunities, and outline a clear path to implementation.",
    },
    expect: {
      kicker: "In this call",
      items: [
        "Quick walkthrough of your current tools, workflows, and bottlenecks.",
        "Identify 2–3 concrete automation or AI-agent opportunities.",
        "Discuss feasibility, timelines, and potential ROI.",
        "Decide together on next steps—if it makes sense for both sides.",
      ],
    },
    info: { chips: ["30 min discovery", "Free. No obligation."], email: "harsh.khanna@weseegpt.com" },
    form: { kicker: "Contact us", heading: "Request a discovery call" },
  },
};

export const settingDefaults: Record<string, Record<string, unknown>> = {
  site: {
    siteName: "WeSee",
    siteUrl: "https://www.weseegpt.com",
    logo: "/wesee.jpg",
    favicon: "/favicon.png",
    defaultTitle: "WeSee — AI Agents, Automation & Software",
    defaultDescription: "We design, build, and ship the AI agents, automation, and software ambitious companies run on.",
    defaultOgImage: "/landing/assets/og-image.png",
    organizationDescription: "AI automation and engineering studio building custom AI agents, automation, web platforms, and software for ambitious companies.",
    organizationAlternateName: "WeSee AI Automation",
  },
  navigation: {
    headerLinks: x.navItems.map((n) => ({ label: n.label, href: n.href, servicesMenu: n.hasDropdown })),
    servicesMenu: x.servicesMenu.map((g) => ({
      name: g.name,
      description: g.description,
      items: g.subServices.map((s) => ({ label: s.label, serviceSlug: "slug" in s ? s.slug : null, categoryNumber: "categoryId" in s ? s.categoryId : null })),
    })),
  },
  footer: {
    ctaEyebrow: "Ready to start?",
    ctaHeading: "Let's Talk",
    ctaEmail: "careers@weseegpt.com",
    tagline: "India's leading AI automation agency  building intelligent systems that help businesses operate smarter, faster, and at scale.",
    columns: [
      { title: "Services", links: x.footerServiceLinks },
      { title: "Company", links: x.footerCompanyLinks },
    ],
    legalLinks: [link("Terms", "/terms"), link("Privacy", "/privacy")],
    copyright: "© {year} WeSee AI Automation. All rights reserved.",
    entityDisclosure: null,
  },
  contact: {
    email: "careers@weseegpt.com",
    careersEmail: "careers@weseegpt.com",
    hrEmail: "hr@weseegpt.com",
    phone: null,
    // Previously the VITE_WHATSAPP_* build variables; the client still falls back to them while these are empty.
    whatsappPhone: null,
    whatsappMessage: null,
    offices: [
      { label: "HQ", locality: null, country: "Japan", countryCode: "JP" },
      { label: "Operations", locality: "Mumbai", country: "India", countryCode: "IN" },
    ],
  },
  social: { links: x.socials },
  announcement: { enabled: false, message: null, link: null, tone: "accent", dismissible: true },
  appearance: { showLoadingScreen: true, showGrain: true },
};
