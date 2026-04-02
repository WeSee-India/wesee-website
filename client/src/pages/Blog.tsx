import { useEffect } from "react";
import { Link } from "wouter";
import SectionLabel from "@/components/SectionLabel";
import TextReveal from "@/components/TextReveal";
import TiltCard from "@/components/TiltCard";
import StaggerReveal from "@/components/StaggerReveal";
import ParticleWrapper from "@/components/ParticleWrapper";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const articles = [
  {
    slug: "ai-sales-agents-replacing-sdr-teams",
    title: "How AI Sales Agents Are Replacing SDR Teams in 2025",
    category: "AI Agents",
    date: "Feb 2026",
    excerpt: "The traditional SDR model is breaking. AI sales agents can now qualify leads, book meetings, and follow up — at a fraction of the cost. Here's how companies are making the switch.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
    featured: true,
  },
  {
    slug: "hidden-cost-manual-workflows",
    title: "The Hidden Cost of Manual Workflows: Why Automation ROI Is Always Higher Than You Think",
    category: "Workflow Automation",
    date: "Jan 2026",
    excerpt: "Most businesses underestimate how much manual work costs them. We break down the real numbers — and show why automation ROI compounds over time.",
    image: "/cost.jpg",
  },
  {
    slug: "meta-ads-2025-ai-optimization",
    title: "Meta Ads in 2025: How AI is Changing Paid Advertising Optimization",
    category: "Performance Marketing",
    date: "Dec 2025",
    excerpt: "From Advantage+ campaigns to AI-generated creatives, Meta's ad platform is evolving fast. Here's what marketers need to know.",
    image: "/metaad.jpg",
  },
  {
    slug: "building-first-ai-chatbot-indian-smes",
    title: "Building Your First AI Chatbot: A Guide for Indian SMEs",
    category: "AI Agents",
    date: "Nov 2025",
    excerpt: "A practical, no-jargon guide to building and deploying your first AI chatbot — tailored for Indian small and medium businesses.",
    image: "/chatbot.jpg",
  },
];

export default function Blog() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const localTriggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      // Featured block: staggered reveal (image then text)
      const featured = document.querySelector(".blog-featured");
      if (featured) {
        const featuredEls = featured.querySelectorAll(".blog-featured-reveal");
        const anim = gsap.fromTo(featuredEls, { opacity: 0, y: 28 }, {
          opacity: 1, y: 0, duration: 0.75, stagger: 0.14, ease: "power2.out",
          scrollTrigger: { trigger: featured, start: "top 82%", toggleActions: "play none none none" }
        });
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      }
      // Rest of page
      const reveals = document.querySelectorAll(".gsap-reveal");
      reveals.forEach((el) => {
        const anim = gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
        });
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });
    }, 50);
    return () => { clearTimeout(timer); localTriggers.forEach(t => t.kill()); };
  }, []);

  const featured = articles.find(a => a.featured);
  const grid = articles.filter(a => !a.featured);

  return (
    <div className="blog-route" style={{ paddingTop: 44 }}>
      <div style={{ paddingTop: 30, paddingBottom: 40 }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <span
              className="hidden md:inline-block"
              style={{
                width: 24,
                height: 1,
                background: "#C9A84C",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#999999",
              }}
            >
              (01) BLOG
            </span>
          </div>
          <TextReveal as="h1" style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15 }} stagger={0.06} onScroll={false}>
            Insights & ideas.
          </TextReveal>
          <p className="body-text gsap-reveal" style={{ marginTop: 16, maxWidth: 640 }}>Practical guides, case studies, and thought pieces on AI automation, marketing, and building smarter businesses.</p>
        </div>
      </div>

      {featured && (
        <section style={{ paddingTop: 0, paddingBottom: 30 }}>
          <div className="container blog-featured">
            <Link href={`/blog/${featured.slug}`} className="block">
              <div className="blog-featured-reveal img-hover-zoom overflow-hidden rounded-2xl" style={{ height: "clamp(250px, 45vh, 400px)", borderRadius: 16 }}>
                <img
                  src={featured.image}
                  alt={featured.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  className="group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="blog-featured-reveal" style={{ marginTop: 24 }}>
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888" }}>{featured.category}</span>
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#888888" }}>({featured.date})</span>
                </div>
                <h2 style={{ fontSize: 40, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.15, marginTop: 12, maxWidth: 720, transition: "transform 0.3s ease" }} className="group-hover:translate-x-3">{featured.title}</h2>
                <p style={{ fontSize: 16, fontWeight: 400, color: "#3A3A3A", lineHeight: 1.7, marginTop: 12, maxWidth: 600 }}>{featured.excerpt}</p>
                <span className="cta-link" style={{ marginTop: 16, display: "inline-block" }}>Read article ↗</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section style={{ paddingTop: 10, paddingBottom: 40, borderTop: "1px solid #EEEEEE" }}>
        <div className="container">
          <StaggerReveal stagger={0.15} y={30}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ gap: 32 }}>
              {grid.map((article) => (
                <ParticleWrapper key={article.slug}>
                  <TiltCard maxTilt={5} scale={1.01}>
                    <Link href={`/blog/${article.slug}`} className="block">
                      <div
                        className="img-hover-zoom"
                        style={{ height: 240, overflow: "hidden" }}
                      >
                        <img
                          src={article.image}
                          alt={article.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          loading="lazy"
                        />
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <div className="flex items-center gap-4">
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 400,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: "#888888",
                            }}
                          >
                            {article.category}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: "#888888",
                            }}
                          >
                            {article.date}
                          </span>
                        </div>
                        <h3
                          className="blog-card-title group-hover:translate-x-2"
                          style={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: "#1A1A1A",
                            lineHeight: 1.3,
                            marginTop: 8,
                            transition: "transform 0.3s ease",
                          }}
                        >
                          {article.title}
                        </h3>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 400,
                            color: "#3A3A3A",
                            lineHeight: 1.6,
                            marginTop: 8,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {article.excerpt}
                        </p>
                        <span
                          className="cta-link"
                          style={{
                            marginTop: 12,
                            display: "inline-block",
                            fontSize: 13,
                          }}
                        >
                          Read article ↗
                        </span>
                      </div>
                    </Link>
                  </TiltCard>
                </ParticleWrapper>
              ))}
            </div>
          </StaggerReveal>
        </div>
      </section>
    </div>
  );
}
