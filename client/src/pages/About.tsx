import { useEffect, useMemo, useRef, useState } from "react";
import InteractiveParticles from "@/components/InteractiveParticles";
import StaggerReveal from "@/components/StaggerReveal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);




const milestones = [
  { year: "2021", title: "Founded in Japan", desc: "WeSee started as a performance marketing agency with a vision for intelligent automation." },
  { year: "2022", title: "First AI systems deployed", desc: "Shipped first AI agents and workflow automations for e-commerce and SaaS clients." },
  { year: "2023", title: "Dubai expansion", desc: "Opened MENA operations to serve regional enterprises and ambitious startups." },
  { year: "2024", title: "35+ projects, 80+ workflows", desc: "Reached critical mass — 35 full-stack projects and over 80 live automation pipelines." },
  { year: "2025", title: "Platform capabilities", desc: "Launched in-house AI stack and dedicated research function for applied LLM engineering." },
];

const values = [
  { num: "01", title: "Signal First", desc: "Every engagement begins by finding the real problem — the signal buried beneath the noise." },
  { num: "02", title: "Build to Own", desc: "We build systems clients own permanently. No vendor lock-in, ever." },
  { num: "03", title: "Outcome-Driven", desc: "We are hired for results, not deliverables. Our metrics are your metrics." },
  { num: "04", title: "Ship & Iterate", desc: "We launch fast, measure everything, and continuously refine for maximum performance." },
];

function parseStatValue(val: string) {
  const raw = val.trim();
  const plus = raw.endsWith("+");
  const cleaned = plus ? raw.slice(0, -1) : raw;
  const upper = cleaned.toUpperCase();
  const k = upper.endsWith("K");
  const base = k ? upper.slice(0, -1) : upper;
  const num = Number(base.replace(/,/g, ""));
  const target = Number.isFinite(num) ? num : 0;
  return { target, plus, k };
}

function formatStatValue(n: number, meta: { plus: boolean; k: boolean }) {
  const rounded = Math.round(n);
  const core = meta.k ? `${rounded}K` : `${rounded}`;
  return meta.plus ? `${core}+` : core;
}

function AboutStatCard({
  index,
  val,
  label,
  bgImg,
}: {
  index: number;
  val: string;
  label: string;
  bgImg: string;
}) {
  const meta = useMemo(() => parseStatValue(val), [val]);
  const [display, setDisplay] = useState(val);
  const startedRef = useRef(false);
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (startedRef.current) return;
        startedRef.current = true;

        const durationMs = 1450;
        const start = performance.now();
        const from = 0;
        const to = meta.target;
        const spinPhase = 0.42;

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          // Slot-like rolling start, then ease to final value.
          if (t < spinPhase) {
            const spinProgress = t / spinPhase;
            const randomBoost = Math.random() * Math.max(6, to * 0.22);
            const rolling = (spinProgress * to * 0.68) + randomBoost;
            setDisplay(formatStatValue(rolling, meta));
          } else {
            const settleT = (t - spinPhase) / (1 - spinPhase);
            const eased = 1 - Math.pow(1 - settleT, 3); // easeOutCubic
            const next = from + (to - from) * eased;
            setDisplay(formatStatValue(next, meta));
          }

          if (t >= 1) {
            setDisplay(formatStatValue(to, meta));
            return;
          }
          if (t < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [meta]);

  return (
    <div
      ref={elRef}
      className="about-stat-card gsap-reveal"
      style={{ "--i": index } as React.CSSProperties}
    >
      <img className="about-stat-bg-img" src={bgImg} alt="" aria-hidden="true" />
      <div className="about-stat-value">{display}</div>
      <div className="about-stat-label">{label}</div>
    </div>
  );
}

export default function About() {
  const [isTextHovered, setIsTextHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const touchCapable =
      typeof window !== "undefined" &&
      (window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
        "ontouchstart" in window);
    setIsTouchDevice(touchCapable);
    if (touchCapable) {
      setIsTextHovered(true);
    }
  }, []);

  const stats = useMemo(
    () => [
      { val: "35+", label: "Projects Delivered", bgImg: "/aisoftware.jpg" },
      { val: "80+", label: "Automations Deployed", bgImg: "/aitalent.jpg" },
      { val: "15K+", label: "Hours Saved Monthly", bgImg: "/digital.jpg" },
      { val: "3", label: "Office Locations", bgImg: "/roi.jpg" },
    ],
    []
  );

  useEffect(() => {
    const localTriggers: ScrollTrigger[] = [];
    const t = setTimeout(() => {
      document.querySelectorAll(".gsap-reveal").forEach((el) => {
        const anim = gsap.fromTo(el,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
          }
        );
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });
    }, 100);
    return () => { clearTimeout(t); localTriggers.forEach(t => t.kill()); };
  }, []);

  return (
    <>
     
      <section
        className="about-hero"
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          paddingTop: 72,
          paddingBottom: 60,
          background: "var(--paper)",
        }}
      >
        {/* Same particle layer + mobile offset as Home.tsx home-hero-particle-logo-layer */}
        <div
          className="about-hero-particle-logo-layer"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <InteractiveParticles
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
            isHovered={isTextHovered}
          />
        </div>
        <style>{`
          @media (max-width: 767px) {
            .about-hero .about-hero-particle-logo-layer {
              transform: translateY(clamp(-140px, -14vh, -56px));
            }
          }
        `}</style>

        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", pointerEvents: "none",
            width: 1000, height: 1000, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -55%)",
            animation: "blob1 20s ease-in-out infinite",
          }} />
        </div>

        <div className="container" style={{
          position: "relative", zIndex: 1, textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div className="badge-pill fade-up" style={{ marginBottom: 28 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--accent)", display: "inline-block",
              animation: "glowPulse 2.5s ease infinite",
            }} />
            Founded 2021 · Japan
          </div>

          <div
            onMouseEnter={() => { if (!isTouchDevice) setIsTextHovered(true); }}
            onMouseLeave={() => { if (!isTouchDevice) setIsTextHovered(false); }}
            onTouchStart={() => { if (!isTouchDevice) setIsTextHovered(true); }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
          >
            <h1 
              className="fade-up" 
              style={{
                fontSize: "clamp(40px, 8vw, 100px)",
                fontWeight: 450, letterSpacing: "-0.04em", lineHeight: 1.12,
                color: "var(--ink)", maxWidth: "14ch", textAlign: "center",
                animationDelay: "0.15s", margin: 0,
              }}
            >
              We are{" "}
              <span style={{
                fontStyle: "italic", fontWeight: 300, letterSpacing: "-0.05em",
                background: "linear-gradient(135deg, #B8922E 0%, var(--accent) 48%, #E8C870 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", backgroundSize: "200% 100%",
                animation: "textShimmer 5s ease infinite",
                paddingRight: "0.1em",
              }}>
                WeSee.
              </span>
              {" "} 
            </h1>

            <p 
              className="fade-up" 
              style={{
                fontSize: "clamp(16px, 2vw, 18px)", fontWeight: 400, color: "var(--ink-50)",
                marginTop: 24, maxWidth: 540, lineHeight: 1.7,
                animationDelay: "0.25s",
              }}
            >
              India's leading AI automation agency  a cross-functional team of AI engineers, operators, and growth strategists building the intelligent systems modern business runs on.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════ MISSION ══════════════ */}
      <section className="section-pad" style={{ background: "var(--paper-dark)" }}>
        <div className="container">
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "clamp(28px, 5vw, 60px)", alignItems: "start",
          }}>
            <div className="about-mobile-center-block">
              <span className="section-label gsap-reveal about-mobile-center-label">(01) Our Mission</span>
              <h2 className="section-heading gsap-reveal about-mobile-center-title" style={{ marginTop: 12 }}>
                Automation that changes how business works.
              </h2>
            </div>
            <div>
              <p className="body-text gsap-reveal" style={{ marginTop: 0, fontSize: 16 }}>
                At WeSee, we believe the gap between great companies and average ones is increasingly determined by how intelligently they operate. We exist to close that gap — using AI and automation to give ambitious businesses the operational leverage that was once only available to tech giants.
              </p>
              <p className="body-text gsap-reveal" style={{ marginTop: 16, fontSize: 16 }}>
                Every system we build is designed to eliminate manual work, accelerate decision-making, and create compounding business value that grows with our clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TEAM PHOTO ══════════════ */}
      <section style={{ background: "var(--paper-dark)" }}>
        <div className="container" style={{ paddingBottom: 80 }}>
          <div className="img-zoom gsap-reveal" style={{ height: "clamp(220px, 40vw, 420px)", borderRadius: "24px !important" }}>
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=2000&q=80"
              alt="WeSee Team"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ══════════════ TIMELINE ══════════════ */}
      <section className="section-pad" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="about-mobile-center-block">
            <span className="section-label gsap-reveal about-mobile-center-label">(02) Our Journey</span>
            <h2 className="section-heading gsap-reveal about-mobile-center-title" style={{ marginTop: 12, marginBottom: 60 }}>
              Building for the long run.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {milestones.map((m, i) => (
              <div
                key={i}
                className="gsap-reveal"
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  gap: 24,
                  paddingBottom: 36,
                  borderBottom: i < milestones.length - 1 ? "1px solid var(--ink-12)" : "none",
                  marginBottom: i < milestones.length - 1 ? 36 : 0,
                  alignItems: "start",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)", letterSpacing: "0.04em", paddingTop: 3 }}>
                  {m.year}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 8 }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--ink-50)", lineHeight: 1.7 }}>
                    {m.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS — dark ══════════════ */}
      <section className="section-pad about-impact-section" style={{
        background: "var(--ink)",
        position: "relative", overflow: "hidden",
      }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="about-impact-head gsap-reveal pb-10">
            <h2 className="about-impact-title">The Impact We've Delivered</h2>
            <p className="about-impact-subtitle">Real results from the systems we build</p>
          </div>
          <div className="about-impact-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {stats.map((s, i) => (
              <AboutStatCard key={s.label} index={i} val={s.val} label={s.label} bgImg={s.bgImg} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ VALUES ══════════════ */}
      <section className="section-pad" style={{ background: "var(--paper-dark)" }}>
        <div className="container">
          <div className="about-mobile-center-block">
            <span className="section-label gsap-reveal about-mobile-center-label" style={{ marginBottom: 8 }}>(03) Our Values</span>
            <h2 className="section-heading gsap-reveal about-mobile-center-title" style={{ marginBottom: 52, marginTop: 12 }}>
              How we operate.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {values.map((v, i) => (
              <div key={i} className="feature-card gsap-reveal" style={{ position: "relative", overflow: "hidden" }}>
                {/* Ghost number */}
                <div style={{
                  position: "absolute", right: 12, bottom: -12,
                  fontSize: 80, fontWeight: 800, color: "var(--ink)",
                  opacity: 0.035, lineHeight: 1, userSelect: "none",
                  letterSpacing: "-0.06em", pointerEvents: "none",
                }}>
                  {v.num}
                </div>

                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
                  color: "var(--accent)", textTransform: "uppercase", marginBottom: 14,
                }}>
                  {v.num}
                </div>
                <h3 style={{
                  fontSize: 18, fontWeight: 550, color: "var(--ink)",
                  letterSpacing: "-0.02em", marginBottom: 10,
                }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--ink-50)", lineHeight: 1.7, margin: 0 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
