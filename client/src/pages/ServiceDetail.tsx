import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { services } from "@/data/services";
import { getServiceImage } from "@/pages/Services";
import TextReveal from "@/components/TextReveal";
import ImageReveal from "@/components/ImageReveal";
import TiltCard from "@/components/TiltCard";
import MagneticButton from "@/components/MagneticButton";
import StaggerReveal from "@/components/StaggerReveal";
import FloatingParticles from "@/components/FloatingParticles";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.slug === slug);
  const serviceIndex = services.findIndex((s) => s.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    const localTriggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll(".gsap-reveal");
      reveals.forEach((el) => {
        const anim = gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
        });
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });
      // Animate horizontal rules
      const hrs = document.querySelectorAll(".hr-animate");
      hrs.forEach((hr) => {
        const t = ScrollTrigger.create({
          trigger: hr,
          start: "top 90%",
          once: true,
          onEnter: () => hr.classList.add("visible"),
        });
        localTriggers.push(t);
      });
    }, 50);
    return () => { clearTimeout(timer); localTriggers.forEach(t => t.kill()); };
  }, [slug]);

  if (!service) {
    return (
      <div style={{ paddingTop: 120, textAlign: "center" }}>
        <p className="text-sm md:text-base" style={{ color: "#888888" }}>Service not found.</p>
        <Link href="/services" className="cta-link" style={{ marginTop: 16, display: "inline-block" }}>← All services +</Link>
      </div>
    );
  }

  const heroImage = getServiceImage(service, serviceIndex);

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="section-padding">
        <div className="container">
          <Link href="/services?view=grid" className="cta-link text-xs md:text-[13px]" style={{ color: "#888888" }}>
            ← All services +
          </Link>
          <div className="text-[10px] md:text-[11px]" style={{ marginTop: 24, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888" }}>
            {service.category}
          </div>
          <TextReveal
            as="h1"
            className="text-[clamp(32px,7vw,44px)] md:text-[clamp(48px,6vw,72px)]"
            style={{ fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15, marginTop: 12 }}
            stagger={0.06}
            onScroll={false}
          >
            {service.name}
          </TextReveal>
          <p className="gsap-reveal text-[17px] md:text-[20px]" style={{ fontWeight: 400, color: "#3A3A3A", fontStyle: "italic", maxWidth: 720, marginTop: 20, lineHeight: 1.6 }}>
            {service.shortDescription}
          </p>
        </div>

        {/* Hero image with clip-path reveal and parallax */}
        <div className="mt-12 mx-3 md:mx-0 rounded-2xl md:rounded-none ">
          <ImageReveal
            src={heroImage}
            alt={service.name}
            direction="up"
            duration={1.4}
            parallax
            parallaxAmount={60}
            zoom={false}
            style={{ width: "100%", height: 500 }}
          />
        </div>

        {/* Metadata strip with animated entrance */}
        <div className="container">
          <div className="hr-animate" />
          <StaggerReveal stagger={0.08} y={15}>
            <div className="flex flex-wrap gap-12" style={{ padding: "24px 0" }}>
              {[
                { label: "SERVICE TYPE", value: service.serviceType },
                { label: "INDUSTRIES", value: service.industries.slice(0, 4).join(", ") },
                { label: "ENGAGEMENT SIZE", value: service.engagementSize },
                { label: "STATUS", value: service.status },
                { label: "DELIVERY", value: "Remote" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="text-[10px] md:text-[11px]" style={{ fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888888" }}>{item.label}</div>
                  <div className="text-[13px] md:text-[15px]" style={{ fontWeight: 600, color: "#1A1A1A", marginTop: 4 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </StaggerReveal>
          <div className="hr-animate" />
        </div>

        {/* Body content */}
        <div className="container" style={{ marginTop: 24 }}>
          <div style={{ maxWidth: "65%" }} className="max-md:!max-w-full">
            <div className="gsap-reveal">
              <h3 className="text-xl md:text-2xl" style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 16 }}>What it is</h3>
              <p className="text-sm md:text-base" style={{ fontWeight: 400, color: "#3A3A3A", lineHeight: 1.75 }}>{service.fullDescription}</p>
            </div>

            <div className="gsap-reveal" style={{ marginTop: 48 }}>
              <h3 className="text-xl md:text-2xl" style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 16 }}>The problem it solves</h3>
              <p className="text-sm md:text-base" style={{ fontWeight: 400, color: "#3A3A3A", lineHeight: 1.75 }}>{service.benefits}</p>
            </div>
          </div>
        </div>

        {/* Mid-section atmospheric image */}
        <div className="mt-16 mx-3 md:mx-0 rounded-2xl md:rounded-none ">
          <ImageReveal
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=2000&q=80"
            alt=""
            direction="left"
            parallax
            parallaxAmount={40}
            zoom={false}
            style={{ width: "100%", height: 360 }}
          />
        </div>

        <div className="container" style={{ marginTop: 64 }}>
          <div style={{ maxWidth: "65%" }} className="max-md:!max-w-full">
            <div className="gsap-reveal">
              <h3 className="text-xl md:text-2xl" style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 16 }}>What automation brings</h3>
              <StaggerReveal stagger={0.06} y={10}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {service.automationPoints.map((point, i) => (
                    <li key={i} className="text-[13px] md:text-[15px]" style={{ fontWeight: 400, color: "#3A3A3A", lineHeight: 1.7, padding: "6px 0", borderBottom: "1px solid #F5F5F5" }}>
                      <span style={{ color: "#888888", marginRight: 12 }}>({String(i + 1).padStart(2, "0")})</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </StaggerReveal>
            </div>

            <div className="gsap-reveal" style={{ marginTop: 48 }}>
              <h3 className="text-xl md:text-2xl" style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 16 }}>How we build it</h3>
              <p className="text-sm md:text-base" style={{ fontWeight: 400, color: "#3A3A3A", lineHeight: 1.75 }}>
                At WeSee, we approach {service.name.toLowerCase()} with a rigorous discovery-first methodology. We begin by mapping your current workflows, identifying bottlenecks, and defining clear success metrics before writing a single line of code.
              </p>
              <p className="text-sm md:text-base" style={{ fontWeight: 400, color: "#3A3A3A", lineHeight: 1.75, marginTop: 16 }}>
                Our team of AI engineers and strategists then design, build, and deploy the solution in iterative sprints — with full transparency and client collaboration at every stage. Post-launch, we provide ongoing optimization and support to ensure the system scales with your business.
              </p>
            </div>

            <div className="gsap-reveal" style={{ marginTop: 48 }}>
              <h3 className="text-xl md:text-2xl" style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 16 }}>Deliverables</h3>
              <StaggerReveal stagger={0.06} y={10}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {service.deliverables.map((d, i) => (
                    <li key={i} className="text-[13px] md:text-[15px]" style={{ fontWeight: 400, color: "#3A3A3A", lineHeight: 1.7, padding: "6px 0", borderBottom: "1px solid #F5F5F5" }}>
                      <span style={{ color: "#888888", marginRight: 12 }}>—</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </StaggerReveal>
            </div>
          </div>
        </div>

        {/* Inline CTA with floating particles */}
        <div style={{ background: "#1A1A1A", padding: "clamp(40px, 6vw, 64px) 0", marginTop: "clamp(40px, 8vw, 80px)", position: "relative", overflow: "hidden" }}>
          <FloatingParticles count={20} color="rgba(255, 255, 255, 0.04)" maxSize={2} speed={0.15} />
          <div className="container relative z-10" style={{ textAlign: "center" }}>
            <TextReveal as="h3" className="text-[clamp(22px,5vw,28px)] md:text-[32px]" style={{ fontWeight: 600, color: "#FFFFFF" }} stagger={0.05}>
              Interested in this service?
            </TextReveal>
            <p className="gsap-reveal text-sm md:text-base" style={{ fontWeight: 400, color: "#AAAAAA", marginTop: 16, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.75 }}>
              Book a free discovery call and we'll show you exactly how this can work for your business.
            </p>
            <MagneticButton
              as="a"
              href="/book-call"
              className="btn-fill-sweep-dark text-xs md:text-[13px]"
              style={{ display: "inline-block", marginTop: 24, padding: "16px 32px", background: "#FFFFFF", color: "#1A1A1A", fontWeight: 500, textDecoration: "none" }}
              strength={0.25}
            >
              Book a Call ↗
            </MagneticButton>
          </div>
        </div>

        {/* Related services with TiltCard */}
        <div className="container mt-6 mb-6 md:mt-[clamp(40px,8vw,80px)] md:mb-[clamp(40px,8vw,80px)]">
          <TextReveal as="h3" className="text-xl md:text-2xl" style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 32 }} stagger={0.05}>
            Related services
          </TextReveal>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 2 }}>
            {services.filter(s => s.categoryId === service.categoryId && s.id !== service.id).slice(0, 3).map((s, i) => (
              <TiltCard key={s.id} maxTilt={5} scale={1.01}>
                <Link href={`/services/${s.slug}`} className="block group">
                  <div className="img-hover-zoom" style={{ height: 220 }}>
                    <img src={getServiceImage(s, i)} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                  </div>
                  <div style={{ padding: "16px 0 4px" }}>
                    <div className="text-base md:text-lg group-hover:translate-x-2 transition-transform" style={{ fontWeight: 600, color: "#1A1A1A" }}>{s.name}</div>
                    <div className="text-[11px] md:text-xs" style={{ fontWeight: 400, color: "#888888" }}>{s.category}</div>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
