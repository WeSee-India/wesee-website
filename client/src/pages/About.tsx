import { imgDims } from "@/data/imageSizes";
import { useSection } from "@/content";
import { useEffect, useMemo, useRef, useState } from "react";
import InteractiveParticles from "@/components/InteractiveParticles";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);




type HeroContent = { badge?: string; heading?: string; body?: string };
type MissionContent = { heading?: string; paragraphs?: string[] };
type TimelineContent = { heading?: string; milestones?: { year: string; title: string; description?: string }[] };
type StatsContent = { heading?: string; subheading?: string; stats?: { value: string; label: string; image?: string | null }[] };
type ValuesContent = { heading?: string; items?: { title: string; description?: string }[] };

/** Renders "*gold*" spans in CMS headings. */
function renderHeading(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
      <span key={i} style={{
        fontStyle: "italic", fontWeight: 300, letterSpacing: "-0.05em",
        background: "linear-gradient(135deg, #B8922E 0%, var(--accent) 48%, #E8C870 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text", backgroundSize: "200% 100%",
        animation: "textShimmer 5s ease infinite",
        paddingRight: "0.1em",
      }}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

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
  bgImg?: string | null;
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
      {bgImg && <img className="about-stat-bg-img" {...imgDims(bgImg)} src={bgImg} alt="" aria-hidden="true" />}
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

  const hero = useSection<HeroContent>("about", "hero");
  const mission = useSection<MissionContent>("about", "mission");
  const timeline = useSection<TimelineContent>("about", "timeline");
  const statsSection = useSection<StatsContent>("about", "stats");
  const valuesSection = useSection<ValuesContent>("about", "values");
  const milestones = timeline?.milestones ?? [];
  const stats = statsSection?.stats ?? [];
  const values = valuesSection?.items ?? [];

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
      {hero && (
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
            {hero.badge}
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
              {hero.heading ? renderHeading(hero.heading) : null}
            </h1>

            <p 
              className="fade-up" 
              style={{
                fontSize: "clamp(16px, 2vw, 18px)", fontWeight: 400, color: "var(--ink-50)",
                marginTop: 24, maxWidth: 540, lineHeight: 1.7,
                animationDelay: "0.25s",
              }}
            >
              {hero.body}
            </p>
          </div>
        </div>
      </section>
      )}

      {/* ══════════════ MISSION ══════════════ */}
      {mission && (
      <section className="ab-mission" aria-labelledby="ab-mission-title">
        <div className="container">
          <div className="ab-mission-head">
            <div className="gsap-reveal">
              <span className="ab-kicker">Our mission</span>
              <h2 id="ab-mission-title" className="ab-title">{mission.heading}</h2>
            </div>
            <div className="ab-mission-copy gsap-reveal">
              {(mission.paragraphs ?? []).map((p, i) => (
                <p key={i} className={i === 0 ? "ab-lead" : undefined}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ══════════════ TIMELINE ══════════════ */}
      {timeline && (
      <section className="ab-timeline" aria-labelledby="ab-timeline-title">
        <div className="container ab-timeline-grid">
          <div className="ab-timeline-head gsap-reveal">
            <span className="ab-kicker">Our story</span>
            <h2 id="ab-timeline-title" className="ab-title">{timeline.heading}</h2>
            <p>From a performance marketing agency in Japan to an applied AI studio across three offices.</p>
          </div>

          <ol className="ab-rail">
            {milestones.map((m, i) => (
              <li
                key={m.year}
                className="ab-rail-item gsap-reveal"
                aria-current={i === milestones.length - 1 ? "step" : undefined}
              >
                <span className="ab-rail-dot" aria-hidden="true" />
                <span className="ab-rail-year">{m.year}</span>
                <div>
                  <h3>
                    {m.title}
                    {i === milestones.length - 1 && <span className="ab-rail-now">Now</span>}
                  </h3>
                  <p>{m.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      )}

      {/* ══════════════ STATS, dark ══════════════ */}
      {statsSection && (
      <section className="section-pad about-impact-section" style={{
        background: "var(--ink)",
        position: "relative", overflow: "hidden",
      }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="about-impact-head gsap-reveal pb-10">
            <h2 className="about-impact-title">{statsSection.heading}</h2>
            {statsSection.subheading && <p className="about-impact-subtitle">{statsSection.subheading}</p>}
          </div>
          <div className="about-impact-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {stats.map((s, i) => (
              <AboutStatCard key={s.label} index={i} val={s.value} label={s.label} bgImg={s.image} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ══════════════ VALUES ══════════════ */}
      {valuesSection && (
      <section className="section-pad" style={{ background: "var(--paper-dark)" }}>
        <div className="container">
          <div className="about-mobile-center-block">
            <h2 className="section-heading gsap-reveal about-mobile-center-title" style={{ marginBottom: 52, marginTop: 0 }}>
              {valuesSection.heading}
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
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
                  color: "var(--accent)", textTransform: "uppercase", marginBottom: 14,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 style={{
                  fontSize: 18, fontWeight: 550, color: "var(--ink)",
                  letterSpacing: "-0.02em", marginBottom: 10,
                }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--ink-50)", lineHeight: 1.7, margin: 0 }}>
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

    </>
  );
}
