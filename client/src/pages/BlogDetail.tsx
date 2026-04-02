import { useEffect } from "react";
import { Link, useParams } from "wouter";
import TextReveal from "@/components/TextReveal";
import MagneticButton from "@/components/MagneticButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const articles: Record<string, {
    title: string;
    category: string;
    date: string;
    excerpt: string;
    image: string;
    content: string[];
}> = {
    "ai-sales-agents-replacing-sdr-teams": {
        title: "How AI Sales Agents Are Replacing SDR Teams in 2025",
        category: "AI Agents",
        date: "Feb 2026",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=2000&q=80",
        excerpt: "The traditional SDR model is breaking. AI sales agents can now qualify leads, book meetings, and follow up — at a fraction of the cost.",
        content: [
            "The traditional Sales Development Representative (SDR) model is under pressure. Costs are rising, turnover is high, and outreach volume demands are growing faster than most companies can hire.",
            "AI sales agents are changing this equation entirely. Modern conversational AI — trained on product knowledge, sales frameworks, and real objection-handling scripts — can now engage inbound leads instantly, qualify them by asking the right questions, and book meetings directly into a sales rep's calendar. All at 3am, on a Sunday, across any channel.",
            "The key shift is not that AI is replacing human relationships. It's that AI is replacing the repetitive, low-value work that was never truly human to begin with: sending the first email, following up three times, asking 'What's your budget?' and 'When are you looking to buy?'",
            "Businesses that have deployed AI sales agents report 40–60% more leads engaged per month, response times dropping from hours to seconds, and sales teams that now spend 80% of their time speaking to qualified prospects — not chasing cold leads.",
            "This isn't a future prediction. WeSee has deployed these systems for clients across healthcare, real estate, education, and SaaS. The results are consistent: AI outreach plus smart qualification plus human closing is the winning formula for 2025 and beyond.",
        ],
    },
    "hidden-cost-manual-workflows": {
        title: "The Hidden Cost of Manual Workflows",
        category: "Workflow Automation",
        date: "Jan 2026",
            image: "/cost.jpg",
            excerpt: "Most businesses underestimate how much manual work costs them. We break down the real numbers.",
        content: [
            "Every business has manual workflows. The question is: do you know how much they really cost you?",
            "The obvious costs are easy to calculate — the salary of the person doing the work. But the hidden costs are far larger: the errors they make (and the time spent fixing them), the delays caused by waiting for human input, the opportunities missed because the process was too slow, and the mental overhead of managing it all.",
            "A mid-sized e-commerce business processing 200 orders per day, with manual data entry between their store, warehouse, and accounting system, typically loses 3–4 hours of staff time per day to pure data transfer. At ₹500/hour, that's ₹5,000–6,000/day — or about ₹15–18 lakhs per year. In error costs (wrong orders, reconciliation issues), add another 20–30%.",
            "Automation ROI compounds. Not just because it eliminates the ongoing cost, but because it enables scale. A business that runs on manual workflows can't grow beyond what its team can manually process. A business running on automation can 10x volume without 10x headcount.",
            "At WeSee, we've run detailed automation ROI analyses for dozens of clients. In every case, the return on a well-designed automation exceeds the cost within 90 days. Often within 45.",
        ],
    },
    "meta-ads-2025-ai-optimization": {
        title: "Meta Ads in 2025: How AI is Changing Paid Advertising Optimization",
        category: "Performance Marketing",
        date: "Dec 2025",
        image: "/metaad.jpg",
        excerpt: "From Advantage+ campaigns to AI-generated creatives, Meta's ad platform is evolving fast.",
        content: [
            "Meta's advertising platform has changed more in the past 18 months than in the previous five years combined. The shift from manual campaign control to AI-driven optimization is accelerating, and advertisers who embrace it are seeing radically better results than those still clinging to the old playbook.",
            "Advantage+ campaigns — where Meta's AI controls audience, placement, and creative selection — are outperforming manually controlled campaigns for most e-commerce and lead generation advertisers. The data from our client accounts consistently shows 30–50% lower cost per result when Advantage+ is properly set up with strong creative inputs.",
            "The critical insight: with AI controlling optimization, the marketer's job shifts from tweaking bid strategies and audience exclusions to producing excellent creative. Creative is now the primary variable that drives performance. Volume, variety, and quality of ad creative is what separates winning accounts from losing ones.",
            "AI-generated creative is also emerging as a practical tool in 2025. Not as a replacement for brand-led creative thinking, but as a way to scale testing. Text variations, background swaps, and copy iterations that would have taken a designer days can now be produced in minutes — and tested automatically.",
            "The advertisers who will win in 2025 are those who understand that their role is to feed the machine great inputs, and trust the machine to find the best outcomes.",
        ],
    },
    "building-first-ai-chatbot-indian-smes": {
        title: "Building Your First AI Chatbot: A Guide for Indian SMEs",
        category: "AI Agents",
        date: "Nov 2025",
        image: "/chatbot.jpg",
        excerpt: "A practical, no-jargon guide to building and deploying your first AI chatbot for Indian businesses.",
        content: [
            "If you run a small or medium business in India and you're thinking about building an AI chatbot, this guide is for you. Not the theoretical version — the practical one.",
            "First, the good news: building an AI chatbot for your business has never been more accessible. The underlying technology (large language models) is now available as APIs, and the cost of running them is low enough for businesses of any size. You don't need to train your own AI — you need to configure and deploy one.",
            "Step one is always defining the job. What do you want the chatbot to do? Answer FAQs about your products? Qualify leads? Book appointments? Take orders on WhatsApp? The clearer you are about the specific job, the better your chatbot will perform.",
            "Step two is choosing your deployment channel. In India, WhatsApp is almost always the answer. 500 million+ users, familiar interface, no app download required. For higher-ticket or B2B businesses, a website chat widget works well alongside WhatsApp.",
            "Step three is connecting the AI to your knowledge base — your product catalogue, FAQs, pricing, policies, and processes. This is what turns a generic chatbot into one that actually knows about your business.",
            "WeSee has built AI chatbots for clients ranging from 10-person local businesses to 200-crore enterprises. The process is the same — what changes is the complexity of the knowledge base and the integrations required.",
        ],
    },
};

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const article = slug ? articles[slug] : undefined;

    useEffect(() => {
        window.scrollTo(0, 0);
        const localTriggers: ScrollTrigger[] = [];
        const timer = setTimeout(() => {
            const reveals = document.querySelectorAll(".gsap-reveal");
            reveals.forEach((el) => {
                const anim = gsap.fromTo(el, { opacity: 0, y: 30 }, {
                    opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
                    scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
                });
                if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
            });
            // Stagger body paragraphs when content block enters view
            const contentBlock = document.querySelector(".blog-detail-content");
            if (contentBlock) {
                const anim = gsap.fromTo(contentBlock.querySelectorAll("p"), { opacity: 0, y: 20 }, {
                    opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out",
                    scrollTrigger: { trigger: contentBlock, start: "top 82%", toggleActions: "play none none none" },
                });
                if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
            }
        }, 50);
        return () => { clearTimeout(timer); localTriggers.forEach(t => t.kill()); };
    }, [slug]);

    if (!article) {
        return (
            <div style={{ paddingTop: 120, textAlign: "center" }}>
                <p style={{ fontSize: 48, fontWeight: 700, color: "#1A1A1A", marginBottom: 16 }}>404</p>
                <p style={{ fontSize: 16, color: "#888888" }}>Article not found.</p>
                <Link href="/blog" className="cta-link" style={{ marginTop: 16, display: "inline-block" }}>← All articles</Link>
            </div>
        );
    }

    return (
        <div className="blog-route" style={{ paddingTop: 64 }}>
            <div className="section-padding">
                <div className="container">
                    <Link href="/blog" className="cta-link" style={{ fontSize: 13, color: "#888888" }}>
                        ← All articles
                    </Link>
                    <div className="blog-detail-meta" style={{ marginTop: 24, fontSize: 11, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888" }}>
                        {article.category} · {article.date}
                    </div>
                    <TextReveal
                        as="h1"
                        className="blog-detail-title"
                        style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15, marginTop: 12, maxWidth: 800 }}
                        stagger={0.04}
                        onScroll={false}
                    >
                        {article.title}
                    </TextReveal>
                    <p className="gsap-reveal blog-detail-excerpt" style={{ fontSize: 20, fontWeight: 400, color: "#3A3A3A", fontStyle: "italic", maxWidth: 720, marginTop: 20, lineHeight: 1.6 }}>
                        {article.excerpt}
                    </p>
                </div>

                <div className="gsap-reveal" style={{ marginTop: 48, width: "100%", overflow: "hidden" }}>
                    <img
                        className="blog-detail-hero-img"
                        src={article.image}
                        alt={article.title}
                        style={{ width: "100%", height: 480, objectFit: "cover", display: "block" }}
                        loading="eager"
                    />
                </div>

                <div className="container" style={{ marginTop: 64 }}>
                    <div className="blog-detail-content" style={{ maxWidth: 680 }}>
                        {article.content.map((paragraph, i) => (
                            <p
                                key={i}
                                style={{
                                    fontSize: 17,
                                    fontWeight: 400,
                                    color: "#3A3A3A",
                                    lineHeight: 1.82,
                                    marginBottom: 28,
                                }}
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dark CTA */}
            <div style={{ background: "#1A1A1A", padding: "64px 0", marginTop: 64 }}>
                <div className="container" style={{ textAlign: "center" }}>
                    <TextReveal as="h3" className="blog-detail-cta-title" style={{ fontSize: 32, fontWeight: 600, color: "#FFFFFF" }} stagger={0.05}>
                        Want results like this for your business?
                    </TextReveal>
                    <p className="gsap-reveal" style={{ fontSize: 16, fontWeight: 400, color: "#AAAAAA", marginTop: 16, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.75 }}>
                        Book a free discovery call and we'll show you exactly how AI and automation can work for you.
                    </p>
                    <MagneticButton
                        as="a"
                        href="/book-call"
                        className="btn-fill-sweep-dark"
                        style={{ display: "inline-block", marginTop: 24, padding: "16px 32px", background: "#FFFFFF", color: "#1A1A1A", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                        strength={0.25}
                    >
                        Book a Call ↗
                    </MagneticButton>
                </div>
            </div>
        </div>
    );
}
