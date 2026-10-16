/**
 * The five case studies from the developer handoff ("WeSee Case Studies:
 * Developer Handoff"), verbatim. Anything in [SQUARE BRACKETS] is a
 * placeholder the team still has to confirm; the API refuses to publish an
 * item while one is left, so these are seeded as drafts.
 *
 * Content rules from the handoff: no metric, client name or quote here was
 * supplied by a client, so none are added. Reconciliation AI and CloudOps
 * Console clients stay anonymous. Images are added in the admin once the
 * clients approve publishing screenshots. JMarkets, Twenty Cents and Nagamori use the
 * screenshots already published on /projects; the other two use illustrative site photos.
 */

const p = (lead: string | null, text: string) => ({ lead, text });
const BOOKING = "[BOOKING URL: confirm https://cal.com/wesee/30min]";
const result = (metric: string) => ({ value: "[RESULT: confirm with client]", metric, period: null, method: null, note: null });

export const caseStudies = [
  {
    slug: "reconciliation-ai",
    values: {
      title: "Reconciliation AI",
      category: "AI & Automation",
      tags: ["Finance", "AI matching", "ERP integration"],
      summary: "An AI tool that matches ERP, bank and tax records, sends only the unclear items to a person, and logs every decision.",
      image: { src: "/services/analytics.jpg", alt: "Illustration of a rising financial chart over an office (not a product screenshot)" },
      headline: "Reconciliation AI: month-end close without the spreadsheet marathon",
      lede: "We built an AI matching tool that ties every sale to its payment and its tax receipt. It shows where the gap comes from and puts each decision on record.",
      client: "Distribution company (not named)",
      sector: "Distribution / Finance operations",
      region: '[REGION: confirm what can be shown, or use "Not disclosed"]',
      service: "AI Workflow Automation · Custom Software & Integrations",
      timeframe: "[TIMELINE: e.g. X weeks, confirm]",
      team: "[TEAM SIZE: e.g. X engineers + 1 designer, confirm]",
      tech: ["ERP (Tally)", "Bank feeds", "Mobile-money wallets", "Tax e-receipt records", "AI matching engine", "React web app"],
      overview: [
        "The client is a distribution business that sells across several depots. Customers pay by bank transfer, mobile money and cash. The finance team closes the books every month in their ERP, and every sale has to match a government tax receipt.",
      ],
      challenge: [
        p("Three systems, no single answer.", "The ERP, the bank statements and the tax records each told part of the story. Nothing linked them."),
        p("A gap nobody could explain fast.", "Sales at the till didn't match what reached the ERP. Finding out why meant going row by row."),
        p("Messy payments.", "Bank charges, split payments and customer names spelled five different ways broke simple matching rules."),
        p("Weak audit trail.", "Credit notes and write-offs needed a named approver and a record no one could edit later."),
        p("A slow close.", "One open item could hold up every task after it."),
      ],
      solution: [
        p(null, "We built a reconciliation workbench. The machine does the matching. People make the calls."),
        p(
          "The AI never closes an item on its own.",
          "Each proposed match gets a confidence score and lands in one of three bands: certain, probable or needs review. The team can approve the certain band in one go. Anything less goes to a review lane, with an evidence panel that shows which records matched and why.",
        ),
        p(
          "The confidence comes from the evidence, not from the model.",
          "A match scores high only when the supporting records actually line up. If the tool can't prove part of the gap, it says so. It does not guess.",
        ),
        p(
          "It starts with the size of the problem.",
          "The tool takes the total unexplained gap and breaks it into causes: missing imports, sales with no tax receipt, unusual credit notes, high refunds. Finance can see where the money went before opening a single row.",
        ),
        p(
          "Every action goes into a hash-chained audit log.",
          "Each entry links to the one before it. Change one entry and every entry after it breaks, so tampering shows.",
        ),
      ],
      features: [
        p(null, "Three-way matching across ERP entries, bank and mobile-money feeds, and tax receipts."),
        p(null, "Confidence bands (certain, probable, review), with bulk approval for the certain band."),
        p(null, "Fuzzy name matching that handles spelling differences, bank charges and split payments."),
        p(null, "Evidence panel on every match, so reviewers see the reason, not just a score."),
        p(null, "Gap breakdown chart showing how much of the gap each cause explains."),
        p(null, "Anomaly flags for odd credit notes, missing receipts and high refund rates."),
        p("Approval limits.", "Write-offs above a set amount need a second approver."),
        p(null, "Month-end close tracker that shows which tasks each open item is blocking."),
        p(null, "Tamper-evident audit log you can replay. It records who did what, and when."),
      ],
      delivery: [
        p("Started from the client's own figures.", "We worked from their real period data, not sample data, so the tool showed their actual problem from day one."),
        p("Set the rules with finance.", "Confidence bands, tolerances and approval limits were agreed with the people who sign off the books."),
        p("Built the full flow.", "Gap, match, exception, approval, close and audit, all in one web app."),
        p(null, "[CONFIRM: rollout stage, e.g. which sites or months are running on it, connected to which live systems]"),
      ],
      results: [
        result("Transactions auto-matched in the “certain” band"),
        result("Month-end close time, before vs. after (days)"),
        result("Finance hours saved per month on manual matching"),
        result("Share of the unexplained gap traced to a cause"),
      ],
      quote: {
        text: "[CLIENT QUOTE: to be collected]",
        name: "[NAME, TITLE, e.g. Head of Finance]",
        role: null,
        company: '[COMPANY, or "Finance lead, distribution company" if anonymous]',
      },
      cta: {
        heading: "Is your month-end close still a matching exercise?",
        body: "Send us one month of exports. We'll show you what matches, what doesn't, and why.",
        buttonLabel: "Book a 30-minute call",
        buttonUrl: BOOKING,
      },
      serviceSlug: null,
      seoTitle: "Reconciliation AI: Faster Month-End Close | WeSee Case Study",
      seoDescription:
        "How WeSee built an AI matching tool that reconciles ERP, bank and tax records, flags what it can't prove, and keeps a tamper-evident audit trail.",
      ogImage: null,
    },
  },
  {
    slug: "cloudops-console",
    values: {
      title: "CloudOps Console",
      category: "Platforms & Cloud",
      tags: ["DevOps & SRE", "Cloud architecture", "Integrations"],
      summary: "One console that shows how a distribution platform is built, shipped, watched and secured, and where its data lives.",
      image: { src: "/services/datacenter.jpg", alt: "Illustration of a data centre server aisle (not a product screenshot)" },
      headline: "CloudOps Console: a platform you can explain to your board and run at 3 a.m.",
      lede: "We built the operations console behind a distribution platform. It covers releases, monitoring, incidents, security and data residency in one place.",
      client: "Distribution company (not named)",
      sector: "Distribution / Logistics",
      region: '[REGION: confirm what can be shown, or use "Not disclosed"]',
      service: "Custom Software & Integrations · Cloud architecture, DevOps & SRE",
      timeframe: "[TIMELINE: confirm]",
      team: "[TEAM SIZE: confirm]",
      tech: [
        "Node.js / TypeScript",
        "PostgreSQL (row-level security)",
        "Redis",
        "Kafka / NATS JetStream",
        "Kubernetes",
        "Terraform",
        "Argo CD",
        "Docker",
        "Prometheus",
        "Grafana",
        "Playwright",
        "Vitest",
        "Signed images (cosign)",
        "SBOM scanning (Syft, Grype)",
        "WhatsApp Business Cloud API",
        "Tally ERP",
        "Bank APIs",
        "Mobile money",
        "Tax e-receipts",
        "GPS telematics",
        "Weighbridges",
        "[CONFIRM: stack list before publishing]",
      ],
      overview: [
        "The client runs orders, dispatch and deliveries across several depots and a truck fleet. Their platform talks to an ERP, banks, mobile money, a tax authority, GPS trackers and weighbridges at the depot gates. Some of their data must, by law, stay in the country.",
      ],
      challenge: [
        p(
          "Nobody could explain the platform.",
          "Leadership was asking simple questions with no clear answers. How is it built? Where is it hosted? Who can see what? Where does the data actually sit?",
        ),
        p(
          "Integrations fail in ordinary ways.",
          "ERP calls time out. Bank APIs go down for maintenance. Payment providers send the same callback twice. Depot gates lose signal.",
        ),
        p("Releases were risky.", "One bad release could stop orders across every depot."),
        p("Data residency rules.", "Tax and customer records had to stay in the country, with a clear record of where everything else went."),
      ],
      solution: [
        p(null, "We built a single console for the people who run the platform, plus the architecture behind it."),
        p(
          "Our rule: an outage can delay a message, never lose it.",
          "Every incoming order, payment and GPS ping is written to a durable event log before anything else happens. If the ERP is down, orders queue in their original order and post when it comes back. Finance sees a queue length, not missing data.",
        ),
        p(
          "Releases go out in small steps.",
          "Each release goes to a small share of traffic first. If errors pass a set limit, it rolls back on its own. Production needs a named approval, and every approval is logged.",
        ),
        p(
          "Every part of the system is documented the same way.",
          "What it runs on, how it scales, how it fails, and what still works when it's down. The client's IT team gets real sample payloads for each integration, ready to hand to their ERP, bank and tax contacts.",
        ),
        p(
          "AI is one step in the pipeline, not a black box.",
          "Wherever AI reads documents or orders, it gives a confidence score. A person checks anything below the bar.",
        ),
      ],
      features: [
        p(
          "CI/CD pipeline view.",
          "Lint, type checks, tests, a software bill of materials and a vulnerability scan that blocks high and critical issues. Images are signed.",
        ),
        p(null, "Production approval gate with a named approver and an audit record."),
        p(null, "Staged (canary) rollouts with automatic error-rate guardrails and one-click rollback. Rollbacks need a second approver."),
        p(null, "Monitoring and alerts with service-level objectives and error budgets."),
        p(null, "Incident response from first alert to mitigation to a blameless postmortem, all on one timeline."),
        p(null, "Service map with regions, replicas and replication lag."),
        p(null, "Reference architecture and integration contracts with real payload examples."),
        p(null, "Role-based access by role and depot. If the depot context is missing, the system shows nothing rather than the wrong data."),
        p(null, "Data residency map showing where each class of data lives, and what never leaves the country."),
        p(null, "Hash-chained audit trail for every ingest, change and action, with safe replay that never touches live data."),
        p(null, "Cloud cost view with spend by service and savings suggestions."),
      ],
      delivery: [
        p("Mapped every integration.", "For each external system we wrote down how it fails and what the platform does when it does."),
        p("Designed for the worst place first.", "The depot gate has the weakest signal, so gate hardware buffers locally and syncs when the link returns."),
        p("Wrote the security and residency model.", "Encryption, access, key storage and data location were set per data class, not per service."),
        p(null, "Built the console on top, so operators, IT and leadership all look at the same picture."),
        p(null, "[CONFIRM: rollout stage and environments in use]"),
      ],
      results: [
        result("Deployment frequency or lead time, before vs. after"),
        result("Mean time to recover from incidents"),
        result("Messages or transactions lost during outages (target: zero)"),
        result("Recovery objectives (RPO / RTO) agreed and tested"),
        result("Monthly cloud cost change after savings recommendations"),
      ],
      quote: {
        text: "[CLIENT QUOTE: to be collected]",
        name: "[NAME, TITLE, e.g. CTO / Head of IT]",
        role: null,
        company: '[COMPANY, or "Technology lead, distribution company" if anonymous]',
      },
      cta: {
        heading: "Can you explain how your platform runs, and what happens when it breaks?",
        body: "We'll review your architecture and integrations and show you where the risk is.",
        buttonLabel: "Book a 30-minute call",
        buttonUrl: BOOKING,
      },
      serviceSlug: null,
      seoTitle: "CloudOps Console: Ship, Monitor and Secure a Logistics Platform | WeSee",
      seoDescription:
        "How WeSee built one console to ship, monitor, secure and explain a distribution platform, from canary releases to incident response and data residency.",
      ogImage: null,
    },
  },
  {
    slug: "jmarkets",
    values: {
      title: "JMarkets",
      category: "Fintech",
      tags: ["Fintech", "Trading", "Japanese market"],
      summary: "A Japanese-language CFD trading platform that takes traders from sign-up to their first trade, with support and campaigns built in.",
      image: { src: "/projects/jmarkets.webp", alt: "JMarkets trading platform home screen" },
      headline: "JMarkets: a CFD trading platform built for Japanese-speaking traders",
      lede: "We built JMarkets' trading platform. It covers account opening, MT4/MT5 access, market content, campaigns and client support, all in Japanese.",
      client: "JMarkets [CONFIRM: permission to name]",
      sector: "Fintech / Online brokerage (CFD)",
      region: "Japanese-speaking market [CONFIRM: exact target region]",
      service: "Custom Software & Integrations",
      timeframe: "[TIMELINE: confirm]",
      team: "[TEAM SIZE: confirm]",
      tech: ["Next.js", "Hosted on Vercel", "MetaTrader 4 / 5 access", "[CONFIRM: back-end, KYC and payment integrations]"],
      overview: [
        "JMarkets is an online broker. Its customers trade CFDs on currencies, indices and commodities. It serves Japanese-speaking traders.",
        "[CONFIRM/EXPAND: client background and stage]",
      ],
      challenge: [
        p("Trust comes first.", "Trading platforms are a target for scams. A new broker has to look credible from the first screen."),
        p("Beginners need help.", "Many visitors don't know what a spread is, or how margin works. Without plain explanations, they leave."),
        p(
          "Too many separate tools.",
          "Account opening, trading access, marketing campaigns and support often live in different systems. That adds friction for traders and staff.",
        ),
        p(
          "It has to feel Japanese.",
          "A translated English site doesn't work. Layout, tone and content need to match how Japanese traders read and decide.",
        ),
      ],
      solution: [
        p(null, "We built a platform that takes a trader from “what is a CFD?” to their first trade, in Japanese, without sending them anywhere else."),
        p(
          "A short path to the first trade.",
          "Account opening is three clear steps: create an account, verify identity (KYC), then fund and trade on MT4 or MT5. Each step says what happens next.",
        ),
        p(
          "Education sits next to the trade.",
          "Short, plain answers explain CFDs, spreads and margin risk, with a nudge to try the demo first. Traders learn before they put money in.",
        ),
        p("Market context in one place.", "An economic calendar, market news, analysis and a glossary help traders understand why prices moved."),
        p("Risk is visible, not hidden.", "Risk disclosures and scam warnings appear across the site, not buried in the footer."),
        p("The business side is built in.", "Staff run campaigns and promotions and handle client support from the same platform."),
      ],
      features: [
        p(null, "Japanese-first design and copy across the whole platform."),
        p(null, "Three-step account opening with identity verification (KYC)."),
        p(null, "MT4 / MT5 access on desktop (Windows, Mac) and mobile (iOS, Android)."),
        p(null, "Beginner Q&A on CFDs, spreads and margin, plus a route to the demo."),
        p(null, "Market information hub: economic calendar, news, analysis and a glossary."),
        p(null, "Campaign and promotion management for the marketing team."),
        p(null, "Client support: FAQ, login help and support tools."),
        p(null, "Risk disclosures and fraud warnings on every page."),
      ],
      delivery: [
        p(null, "Mapped the trader journey from first visit to first trade, and cut every step that wasn't needed."),
        p("Wrote for beginners and experts.", "Short answers up front, with detail one click away."),
        p(null, "Built the site and staff tools on one platform, so campaigns and support don't need separate systems."),
        p(null, "[CONFIRM: QA, compliance review and launch approach]"),
      ],
      results: [
        result("Account sign-ups or KYC completion rate"),
        result("Time from sign-up to first funded account"),
        result("Drop in support tickets after the FAQ and login help went live"),
        result("Time from kickoff to launch"),
      ],
      quote: {
        text: "[CLIENT QUOTE: to be collected]",
        name: "[NAME, TITLE, e.g. CEO / Head of Marketing]",
        role: null,
        company: "JMarkets [CONFIRM]",
      },
      cta: {
        heading: "Launching a financial product in Japan?",
        body: "We build Japanese-first platforms that earn trust fast. Tell us what you're launching.",
        buttonLabel: "Book a 30-minute call",
        buttonUrl: BOOKING,
      },
      serviceSlug: null,
      seoTitle: "JMarkets: Japanese-Language CFD Trading Platform | WeSee Case Study",
      seoDescription:
        "How WeSee built JMarkets, a Japanese-language CFD trading platform with account opening, MT4/MT5 access, market content, campaigns and client support.",
      ogImage: null,
    },
  },
  {
    slug: "twenty-cents",
    values: {
      title: "Twenty Cents",
      category: "Web & Brand",
      tags: ["Creative studio", "Web", "Japan"],
      summary: "A website for a Japanese creative studio that sells video, design and development as one offer and explains how it works.",
      image: { src: "/projects/twentycents.webp", alt: "Twenty Cents studio website" },
      headline: "Twenty Cents: one site for a studio that does video, design and code",
      lede: "We built the website for Twenty Cents, a creative studio in Japan. It shows a wide service range as one offer and makes the next step obvious.",
      client: "Twenty Cents (20 Cents Inc.) [CONFIRM: permission to name]",
      sector: "Creative production / Marketing",
      region: "Japan",
      service: "Custom Software (web)",
      timeframe: "[TIMELINE: confirm]",
      team: "[TEAM SIZE: confirm]",
      tech: ["Next.js", "Hosted on Vercel", "[CONFIRM: CMS / forms]"],
      overview: [
        "Twenty Cents is an integrated creative studio in Japan. It makes music videos, commercials and short dramas. It also does brand design, UI/UX and systems development. Its teams work across Tokyo, Paris and Mumbai, handing work across time zones so production keeps moving around the clock.",
        "[CONFIRM: describe any business relationship between Twenty Cents and WeSee, and disclose if related]",
      ],
      challenge: [
        p(
          "A wide offer is hard to read.",
          "Video, VFX, social content, design, localisation and software. Listed one by one, it looks like a scattered agency, not one studio.",
        ),
        p(
          "Two audiences.",
          "Japanese companies want a creative partner at home. Overseas companies want help selling in Japan. Each needs to find its own path.",
        ),
        p(
          "A new way of working.",
          "The studio splits work between people and AI on purpose. People handle ideas and direction. AI handles repetitive production. That had to be explained simply, without sounding like a gimmick.",
        ),
        p("Craft has to show.", "A template site would undercut a studio whose product is quality."),
      ],
      solution: [
        p(null, "We built a site that tells one story: one studio, one team, everything joined up."),
        p(
          "Clear strengths up front.",
          "Four points lead the page: a one-stop team, senior creators, round-the-clock production across three cities, and a deliberate split between human and AI work.",
        ),
        p("Services split by audience.", "The service list is grouped into Japan-focused and international offers. Each visitor finds their part quickly."),
        p("The work does the talking.", "A showcase of short PR ads sits high on the page, so visitors see the output before reading about it."),
        p(
          "A simple path to start.",
          "Four steps: get in touch, get a quote, see a quick demo or storyboard, then start. The site ends with the studio's major clients and a contact point.",
        ),
      ],
      features: [
        p(null, "Strengths section covering the one-stop team, senior creators, follow-the-sun production and the AI/human split."),
        p(null, "Short PR ad showcase."),
        p(null, "Service lineup grouped into Japan-focused and international."),
        p(null, "“How we use AI” section explaining what AI does and what people do."),
        p(null, "Four-step engagement flow from enquiry to kickoff."),
        p(null, "Client logo section and contact."),
        p(null, "Language switch [CONFIRM: languages supported]."),
        p(null, "Legal pages: company profile, privacy policy, terms, copyright and Japan's commercial transactions disclosure."),
      ],
      delivery: [
        p("Organised the offer first.", "We sorted a long service list into a structure a buyer can scan in seconds."),
        p("Designed around the work.", "Visuals lead and copy supports."),
        p(null, "Built on a modern web stack for fast loading and easy updates."),
        p(null, "[CONFIRM: delivery steps, review rounds and launch date]"),
      ],
      results: [
        result("Enquiries per month after launch"),
        result("Page load time or Core Web Vitals scores"),
        result("Share of enquiries from overseas vs. Japan"),
      ],
      quote: {
        text: "[CLIENT QUOTE: to be collected]",
        name: "[NAME, TITLE, e.g. Founder / CEO]",
        role: null,
        company: "Twenty Cents [CONFIRM]",
      },
      cta: {
        heading: "Does your website explain what you actually do?",
        body: "We build sites that make a complex offer simple, in Japanese, English or both.",
        buttonLabel: "Book a 30-minute call",
        buttonUrl: BOOKING,
      },
      serviceSlug: null,
      seoTitle: "Twenty Cents: Website for a Tokyo Creative Studio | WeSee Case Study",
      seoDescription:
        "How WeSee built the website for Twenty Cents, an integrated creative studio in Japan, presenting video, design and development as one clear offer.",
      ogImage: null,
    },
  },
  {
    slug: "nagamori",
    values: {
      title: "Nagamori",
      category: "Web & Brand",
      tags: ["Beauty", "Booking", "Japan"],
      summary: "A brand site for an artmake specialist that builds trust with clear treatment pages and turns visitors into bookings.",
      image: { src: "/projects/nagamori.webp", alt: "Nagamori artmake beauty website" },
      headline: "Nagamori: turning expertise into trust, and trust into bookings",
      lede: "We built the website for Nagamori, a semi-permanent makeup (artmake) specialist. It explains each treatment clearly, shows the artist's credentials and makes booking easy.",
      client: "Nagamori [CONFIRM: permission to name]",
      sector: "Beauty / Aesthetics (artmake)",
      region: "Japan",
      service: "Custom Software (web)",
      timeframe: "[TIMELINE: confirm]",
      team: "[TEAM SIZE: confirm]",
      tech: ["Hosted on Vercel", "Booking via LINE", "[CONFIRM: framework and scheduling tool]"],
      overview: [
        "Nagamori is the brand of an artmake artist in Japan with a nursing background. Artmake is semi-permanent makeup for brows, eyeliner, lips and hairline. It is a medical-adjacent treatment, so clients look hard at skill, safety and credentials before they book.",
      ],
      challenge: [
        p("Trust decides the booking.", "The treatment lasts for years. Clients need to believe in the artist before they commit."),
        p("Techniques are hard to explain.", "The differences between methods matter, but they're technical. Most clients don't know what to ask."),
        p("Risks must be stated honestly.", "Clients need to know about healing, fading and side effects up front."),
        p("Booking by phone and message took time.", "Back-and-forth slowed the step from interest to appointment."),
      ],
      solution: [
        p(null, "We built a calm, premium site where every section answers one question a new client has."),
        p(
          "One page per treatment.",
          "Brows, tail eyeline, shadow eyeline, lips and hairline each get a plain explanation of the technique and what to expect.",
        ),
        p(
          "Credentials up front.",
          "The artist's background, training and awards sit next to endorsements from medical professionals. Trust is built before the booking button.",
        ),
        p(
          "Honest about risk.",
          "The site explains how colour settles, how long results last, and the possible side effects. Clients book knowing what to expect.",
        ),
        p(
          "Booking where clients already are.",
          "Enquiries and bookings run through LINE, the messaging app most Japanese clients use every day. [CONFIRM: whether an on-site schedule/booking tool is also part of the build]",
        ),
      ],
      features: [
        p(null, "Treatment pages for brows, tail eyeline, shadow eyeline, lips and hairline."),
        p(null, "Artist profile with background, training and awards."),
        p(null, "Endorsements section for medical professionals' comments."),
        p(null, "Treatment menu with clear service listings."),
        p(null, "Risk and aftercare information."),
        p(null, "Artist schedule page showing working days, plus appointment booking [CONFIRM: scope]."),
        p(null, "LINE booking and enquiries."),
      ],
      delivery: [
        p("Started with the client's questions.", "We listed what a first-time client worries about, then built a section for each."),
        p("Designed for a premium feel.", "Clean layout, careful typography and room to breathe."),
        p(null, "Put booking one tap away on every page."),
        p(null, "[CONFIRM: delivery steps and launch date]"),
      ],
      results: [
        result("Bookings or LINE enquiries per month after launch"),
        result("Time spent arranging appointments, before vs. after"),
        result("Share of bookings from new clients"),
      ],
      quote: {
        text: "[CLIENT QUOTE: to be collected]",
        name: "[NAME, TITLE]",
        role: null,
        company: "Nagamori [CONFIRM]",
      },
      cta: {
        heading: "Selling a service where trust decides the sale?",
        body: "We build sites that explain your expertise clearly and make booking easy.",
        buttonLabel: "Book a 30-minute call",
        buttonUrl: BOOKING,
      },
      serviceSlug: null,
      seoTitle: "Nagamori: Website and Booking for an Artmake Specialist | WeSee Case Study",
      seoDescription:
        "How WeSee built the site for Nagamori, an artmake (semi-permanent makeup) specialist in Japan, with treatment pages, credentials and simple booking.",
      ogImage: null,
    },
  },
];
