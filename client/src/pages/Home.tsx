import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import HoverParticles from "@/components/HoverParticles";
import ParticleWrapper from "@/components/ParticleWrapper";
import InteractiveParticles from "@/components/InteractiveParticles";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories, services as allServices } from "@/data/services";
import { useFinePointer } from "@/hooks/useFinePointer";

gsap.registerPlugin(ScrollTrigger);

/* ─── Dynamic hero words ──────────────────────────────────────── */
const HERO_WORDS = [
  "growth",
  "revenue",
  "operations",
  "customers",
  "automation",
  "efficiency",
  "next level",
  "unstoppable",
];

/* ─── Data ────────────────────────────────────────────────────── */

type ServiceCategoryRow = {
  num: string;
  categoryId: number;
  name: string;
  desc: string;
  href: string;
};

const serviceCategories: ServiceCategoryRow[] = categories.map((c) => ({
  num: String(c.id).padStart(2, "0"),
  categoryId: c.id,
  name: c.name,
  desc: c.summary,
  href: `/services?category=${c.id}`,
}));

type ClientLogo = { name: string; logoSrc: string; h?: number; w?: number };
const clients: ClientLogo[] = [
  { name: "U-Factor", logoSrc: "/client/ufactor.png", h: 24, w: 150 },
  { name: "Tavola", logoSrc: "/client/tavola.png", h: 24, w: 150 },
  { name: "Factorylo", logoSrc: "/client/factorylo.png", h: 24, w: 150 },
  { name: "HealthTech Co", logoSrc: "/client/healthtech.png", h: 22, w: 150 },
  { name: "PropNex", logoSrc: "/client/propnex.png", h: 22, w: 150 },
  { name: "EduLearn", logoSrc: "/client/edulearn.png", h: 22, w: 150 },
  { name: "FinServe", logoSrc: "/client/finserve.png", h: 22, w: 150 },
  { name: "CloudStack", logoSrc: "/client/cloudstack.png", h: 22, w: 150 },
  { name: "RetailMax", logoSrc: "/client/retailmax.png", h: 52, w: 52 },
  { name: "LegalEase", logoSrc: "/client/legalease.png", h: 20, w: 150 },
  { name: "LogiTrack", logoSrc: "/client/logitrack.png", h: 52, w: 150 },
  { name: "AutoDrive", logoSrc: "/client/autodrive.png", h: 22, w: 150 },
  { name: "StartupX", logoSrc: "/client/startupx.png", h: 22, w: 150 },
  { name: "MedConnect", logoSrc: "/client/medconnecy.png", h: 22, w: 150 },
  { name: "GreenEnergy", logoSrc: "/client/greenenergy.png", h: 42, w: 150 },
  { name: "FintechNow", logoSrc: "/client/fintech.png", h: 52, w: 52 },
];

const stats = [
  { display: "35+", label: "Projects Delivered", sub: "End-to-end AI systems shipped" },
  { display: "100+", label: "Automations Deployed", sub: "Workflows running 24/7" },
  { display: "15K+", label: "Hours Saved Monthly", sub: "Manual work eliminated" },
  { display: "50+", label: "Efficiency Increase", sub: "Productivity improvements across clients." },
];

const features = [
  { icon: "◆", title: "AI Agents", desc: "Intelligent AI agents that understand requests, make decisions, and take actions across your business systems." },
  { icon: "⟲", title: "Workflow Automation", desc: "End to end automation that removes manual work, connects your tools, and keeps operations running around the clock." },
  { icon: "◎", title: "Growth Systems", desc: "Data driven marketing and revenue systems designed to attract customers, convert demand, and scale growth." },
  { icon: "⬡", title: "Infrastructure", desc: "Reliable cloud, data, and system architecture that supports your business operations and keeps everything running smoothly." },
];

const workImages = [
  { src: "/aitalent.jpg", h: 220, label: "AI Infrastructure" },
  { src: "/aisoftware.jpg", h: 160, label: "Workspace" },
  { src: "/wesee.png", h: 160, label: "Operations" },
  { src: "/voice.jpg", h: 220, label: "Tech Systems" },
  { src: "/dashboard.jpg", h: 190, label: "Team at Work" },
  { src: "/roi.jpg", h: 190, label: "Cloud Scale" },
];

/* ─── Component ───────────────────────────────────────────────── */

export default function Home() {
  const finePointer = useFinePointer();
  const statsRef = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHeroLogoHovered, setIsHeroLogoHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hoveredServiceIdx, setHoveredServiceIdx] = useState<number | null>(null);
  const [svcPopTop, setSvcPopTop] = useState<number>(0);
  const svcListRef = useRef<HTMLDivElement>(null);
  const svcPopRef = useRef<HTMLDivElement>(null);
  const [revealedClients, setRevealedClients] = useState<boolean[]>(
    () => Array.from({ length: clients.length }, () => false)
  );
  const clientsSectionRef = useRef<HTMLElement | null>(null);
  const [clientsSectionInView, setClientsSectionInView] = useState(false);
  const clientsRevealStartedRef = useRef(false);
  const clientGridConfig = useMemo(() => {
    const cols = isTouchDevice ? 8 : 12;
    const rows = isTouchDevice ? 3 : 4;
    return { cols, rows, total: cols * rows };
  }, [isTouchDevice]);

  const clientLogoCellByIndex = useMemo(() => {
    // Map grid cell -> logo index (or null). Fixed random distribution with a
    // "no touching" constraint so logos don't sit beside each other.
    const { cols, rows, total } = clientGridConfig;

    const getNeighbors = (cellIdx: number) => {
      const r = Math.floor(cellIdx / cols);
      const c = cellIdx % cols;
      const neighbors: number[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const rr = r + dr;
          const cc = c + dc;
          if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
          neighbors.push(rr * cols + cc);
        }
      }
      return neighbors;
    };

    const shuffle = <T,>(arr: T[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const allCells = Array.from({ length: total }, (_, i) => i);
    const logoIndices = Array.from({ length: clients.length }, (_, i) => i);

    // Try multiple times to satisfy constraints; fall back if it somehow fails.
    const MAX_ATTEMPTS = 250;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const cellToLogo: Array<number | null> = Array.from({ length: total }, () => null);
      const used = new Set<number>();

      const cells = shuffle(allCells.slice());
      const logos = shuffle(logoIndices.slice());

      let ok = true;
      for (const logoIdx of logos) {
        let placed = false;
        for (const cellIdx of cells) {
          if (cellToLogo[cellIdx] !== null) continue;
          if (used.has(cellIdx)) continue;
          if (getNeighbors(cellIdx).some((n) => used.has(n))) continue;
          cellToLogo[cellIdx] = logoIdx;
          used.add(cellIdx);
          placed = true;
          break;
        }
        if (!placed) {
          ok = false;
          break;
        }
      }

      if (ok) return cellToLogo;
    }

    // Fallback: still random, just without the strict adjacency rule.
    const fallbackCells = shuffle(allCells.slice());
    const fallbackMap: Array<number | null> = Array.from({ length: total }, () => null);
    for (let i = 0; i < clients.length; i++) fallbackMap[fallbackCells[i]] = i;
    return fallbackMap;
  }, [clientGridConfig, clientGridConfig.total]);

  const serviceNamesByCategoryId = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const s of allServices) {
      const list = map.get(s.categoryId) ?? [];
      list.push(s.name);
      map.set(s.categoryId, list);
    }
    return map;
  }, []);

  const setSvcHover = (idx: number | null, rowEl?: HTMLElement | null) => {
    if (idx === null || !rowEl) {
      setHoveredServiceIdx(null);
      return;
    }
    const containerEl = svcListRef.current;
    if (!containerEl) {
      setHoveredServiceIdx(idx);
      return;
    }
    const rowRect = rowEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    setSvcPopTop(rowRect.top - containerRect.top - 4);
    setHoveredServiceIdx(idx);
  };

  useLayoutEffect(() => {
    if (hoveredServiceIdx === null) return;
    const containerEl = svcListRef.current;
    const popEl = svcPopRef.current;
    if (!containerEl || !popEl) return;

    const containerRect = containerEl.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const popRect = popEl.getBoundingClientRect();
    const popHeight = popRect.height;

    // Clamp so popover stays fully visible inside container.
    // Keep a small padding from container edges for clean look.
    const pad = 10;
    const minTop = pad;
    const maxTop = Math.max(pad, containerHeight - popHeight - pad);
    const nextTop = Math.min(maxTop, Math.max(minTop, svcPopTop));

    if (Math.abs(nextTop - svcPopTop) > 0.5) {
      setSvcPopTop(nextTop);
    }
  }, [hoveredServiceIdx, svcPopTop]);
  /* Typewriter effect for hero headline word */
  useEffect(() => {
    const fullWord = HERO_WORDS[wordIndex];
    const typingSpeed = isDeleting ? 60 : 120;      // ms per character
    const pauseAfterFull = 1400;                    // pause when word fully typed
    const pauseAfterDelete = 500;                   // pause when word fully deleted

    let timeout: number;

    if (!isDeleting && typedText === fullWord) {
      timeout = window.setTimeout(() => {
        setIsDeleting(true);
      }, pauseAfterFull);
    } else if (isDeleting && typedText === "") {
      timeout = window.setTimeout(() => {
        setIsDeleting(false);
        setWordIndex(prev => (prev + 1) % HERO_WORDS.length);
      }, pauseAfterDelete);
    } else {
      timeout = window.setTimeout(() => {
        const nextLength = typedText.length + (isDeleting ? -1 : 1);
        setTypedText(fullWord.slice(0, nextLength));
      }, typingSpeed);
    }

    return () => window.clearTimeout(timeout);
  }, [typedText, isDeleting, wordIndex]);

  const clientRevealOrder = useMemo(() => {
    // Reveal order based on shuffled *grid cell positions* that contain logos.
    // This yields sequences like: cell 1 → cell 8 → cell 17 (organic, non-linear).
    const cellIndicesWithLogos: number[] = [];
    for (let cellIdx = 0; cellIdx < clientLogoCellByIndex.length; cellIdx++) {
      if (clientLogoCellByIndex[cellIdx] !== null) cellIndicesWithLogos.push(cellIdx);
    }

    // Shuffle cell indices (Fisher–Yates)
    for (let i = cellIndicesWithLogos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellIndicesWithLogos[i], cellIndicesWithLogos[j]] = [
        cellIndicesWithLogos[j],
        cellIndicesWithLogos[i],
      ];
    }

    // Convert cell indices to logo indices (non-null by construction)
    return cellIndicesWithLogos.map((cellIdx) => clientLogoCellByIndex[cellIdx] as number);
  }, [clientLogoCellByIndex]);

  /* GSAP scroll reveals */
  useEffect(() => {
    const touchCapable =
      typeof window !== "undefined" &&
      (window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
        "ontouchstart" in window);
    setIsTouchDevice(touchCapable);
    if (touchCapable) {
      // Keep logo formation active on phones/tablets so behavior matches desktop
      // visual state without requiring hover.
      setIsHeroLogoHovered(true);
    }
  }, []);

  useEffect(() => {
    const localTriggers: ScrollTrigger[] = [];
    const t = setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".sr").forEach((el) => {
        const anim = gsap.fromTo(el,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });
    }, 160);
    return () => {
      clearTimeout(t);
      localTriggers.forEach((trigger) => trigger.kill());
    };
  }, []);


  return (
    <div className="home-page">
      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section className="home-hero" style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        paddingTop: 72,
        paddingBottom: 60,
        background: "var(--paper)",
      }}>
        {/* WeSee logo particle formation — same behavior as About hero; mobile: shift layer up so logo reads above headline */}
        <div
          className="home-hero-particle-logo-layer"
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
            isHovered={isHeroLogoHovered}
          />
        </div>
        <style>{`
          @media (max-width: 767px) {
            .home-page .home-hero-particle-logo-layer {
              transform: translateY(clamp(-140px, -14vh, -56px));
            }
          }
        `}</style>

        {/* Decorative blobs — contained in their own overflow:hidden wrapper so they
            don't bleed out of the section, but the wrapper does NOT clip the text */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          {/* Warm radial halo */}
          <div style={{
            position: "absolute", pointerEvents: "none",
            width: 1000, height: 1000, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)",
            top: "50%", left: "50%",
            transform: "translate(-50%,-55%)",
            animation: "blob1 20s ease-in-out infinite",
          }} />
        </div>

        {/* — Main content — */}
        <div
          className="container"
          onMouseEnter={() => {
            if (!isTouchDevice) setIsHeroLogoHovered(true);
          }}
          onMouseLeave={() => {
            if (!isTouchDevice) setIsHeroLogoHovered(false);
          }}
          onTouchStart={() => {
            if (!isTouchDevice) setIsHeroLogoHovered(true);
          }}
          style={{
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center",
          }}>
          {/* Pill badge */}
          {!isTouchDevice && (
            <div
              className="fade-up"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 16px 6px 10px",
                background: "rgba(255,255,255,0.80)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(17,19,23,0.09)",
                borderRadius: 999,
                fontSize: 12.5, fontWeight: 500,
                color: "rgba(17,19,23,0.55)",
                letterSpacing: "0.01em",
                marginBottom: 30,
                animationDelay: "0.1s",
              }}
            >
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: 999,
                background: "rgba(201,168,76,0.15)",
                fontSize: 10, color: "var(--accent)",
              }}>✦</span>
              AI Agents That Work For You 24/7
            </div>
          )}

          {/* Hero headline — responsive single line */}
          <h1
            className="fade-up hero-headline-responsive"
            style={{
              margin: 0,
              fontSize: "clamp(52px, 7.5vw, 102px)",
              fontWeight: 450,
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              color: "var(--ink)",
              animationDelay: "0.18s",
              textAlign: "center",
            }}
          >
            {/* "WeSee your [word] systems." — on mobile: word on second line, slot always reserved */}
            <span className="hero-text-line">

              WeSee
              {" "}
              your{" "}
              <br className="hero-br-mobile" aria-hidden="true" />
              {/* Word slot: min-width reserves space so layout never jumps when word is empty */}
              <span className="hero-word-slot">
                <span
                  className="hero-word-anim"
                >
                  {typedText || "\u00A0"}
                </span>
                <span className="hero-caret" aria-hidden="true" />
              </span>{" "}
            </span>
            <style>{`
              @keyframes wordFlipIn {
                0%   { opacity: 0; transform: translateY(60%) skewY(4deg); }
                100% { opacity: 1; transform: translateY(0%)  skewY(0deg); }
              }
              @keyframes caretBlink {
                0%, 100% { opacity: 0; }
                50%      { opacity: 1; }
              }
              .hero-line { display: block; white-space: nowrap; }
              @media (max-width: 639px) { .hero-line { white-space: normal; } }
              .hero-word-slot {
                display: inline-block;
                position: relative;
                vertical-align: bottom;
              }
              .hero-word-anim {
                display: inline-block;
                font-style: italic;
                font-weight: 300;
                background: linear-gradient(110deg, #9C7A1E 0%, #C9A84C 40%, #E8C870 65%, #C9A84C 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                background-size: 200% auto;
                animation: textShimmer 6s ease infinite;
                letter-spacing: -0.045em;
                padding-right: 0.2em;
                padding-bottom: 0.05em;
                margin-right: -0.2em;
              }
              .hero-caret {
                display: inline-block;
                width: 0.08em;
                margin-left: 0.04em;
                border-right: 1.5px solid rgba(201,168,76,0.85);
                animation: caretBlink 1s step-end infinite;
              }
              .hero-br-mobile { display: none; }
              @media (max-width: 767px) {
                .hero-br-mobile { display: block; }
                .hero-word-slot { min-width: min(13ch, 85vw); }
              }
              .hero-headline-responsive { white-space: normal; }
              .hero-text-line { display: inline; white-space: normal; }
              @media (min-width: 768px) {
                .hero-headline-responsive { white-space: nowrap; }
                .hero-text-line { white-space: nowrap; }
                .hero-br-mobile { display: none; }
              }
            `}</style>
          </h1>

          {/* Subheadline */}
          <p
            className="fade-up"
            style={{
              fontSize: "clamp(15px, 1.6vw, 18px)",
              fontWeight: 400,
              color: "rgba(17,19,23,0.48)",
              marginTop: 22,
              maxWidth: 500,
              lineHeight: 1.72,
              animationDelay: "0.27s",
            }}
          >
            A team of AI engineers, developers, and growth strategists building intelligent systems that automate operations, increase conversions, and scale businesses.
          </p>

          {/* CTA row */}
          <div
            className="fade-up home-hero-cta"
            style={{
              display: "flex", gap: 10, marginTop: 36,
              flexWrap: "wrap", justifyContent: "center",
              animationDelay: "0.35s",
            }}
          >
            <ParticleWrapper>
              <Link
                href="/book-call"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "13px 26px",
                  width: 220,
                  justifyContent: "center",
                  background: "var(--ink)",
                  color: "#fff",
                  fontSize: 13.5, fontWeight: 500,
                  borderRadius: 999, border: "none",
                  textDecoration: "none",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: finePointer ? "none" : "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(17,19,23,0.25)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                Book a Discovery Call
                <span style={{ fontSize: 11, opacity: 0.7 }}>↗</span>
              </Link>
            </ParticleWrapper>
            <ParticleWrapper>
              <Link href="/services" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "13px 26px",
                width: 220,
                justifyContent: "center",
                background: "rgba(255,255,255,0.80)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                color: "var(--ink)",
                fontSize: 13.5, fontWeight: 500,
                borderRadius: 999, border: "1px solid rgba(17,19,23,0.11)",
                textDecoration: "none",
                transition: "background 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
                cursor: finePointer ? "none" : "pointer",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.95)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.80)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                Explore Services
              </Link>
            </ParticleWrapper>
          </div>

          {/* Mini stat row */}
          <div
            className="fade-up home-hero-mini-stats"
            style={{
              display: "flex", gap: 8, marginTop: 56,
              flexWrap: "wrap", justifyContent: "center",
              animationDelay: "0.44s",
            }}
          >
            {[
              { val: "35+", label: "Projects" },
              { val: "100+", label: "Automations" },
              { val: "15K+", label: "Hours Saved " },
            ].map((s) => (
              <div key={s.label} className="home-hero-mini-stat" style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "clamp(10px, 2vw, 14px) clamp(14px, 3vw, 24px)",
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.90)",
                borderRadius: 16,
                boxShadow: "0 2px 16px rgba(17,19,23,0.06)",
                minWidth: 100,
                flex: "1 1 auto",
                maxWidth: 170,
              }}>
                <span style={{ fontSize: 22, fontWeight: 650, color: "var(--ink)", letterSpacing: "-0.045em", lineHeight: 1 }}>
                  {s.val}
                </span>
                <span style={{ fontSize: 10.5, color: "rgba(17,19,23,0.35)", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="home-hero-scroll-hint" style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          zIndex: 1, opacity: 0.4,
        }}>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink)" }}>scroll</span>
          <div style={{ width: 1, height: 28, background: "linear-gradient(to bottom, var(--ink), transparent)", animation: "scrollPulse 2s ease infinite", transformOrigin: "top" }} />
        </div>
      </section>

      {/* ══════════════════════════ WHAT WE DO ══════════════════════════ */}
      <section className="section-pad" style={{ background: "var(--paper-dark)" }}>
        <div className="container">
          {/* Header */}
          <div className="sr" style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="section-label home-what-we-do-label" style={{ justifyContent: "center" }}>What we do</div>
            <h2 style={{
              fontSize: "clamp(30px, 3.8vw, 50px)", fontWeight: 450,
              letterSpacing: "-0.03em", color: "var(--ink)",
              marginTop: 12, lineHeight: 1.1, maxWidth: "30ch", margin: "12px auto 0",
            }}>
              End-to-end automation for modern businesses.
            </h2>
          </div>

          {/* 4 feature cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}>
            {features.map((f, i) => (
              <div
                key={i}
                className="sr feature-card"
                style={{
                  "--delay": `${i * 60}ms`,
                  position: "relative",
                  overflow: "hidden",
                } as React.CSSProperties}
              >
                <HoverParticles />
                {/* Icon */}
                <div style={{
                  width: 46, height: 46,
                  background: "rgba(201,168,76,0.10)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: "var(--accent)",
                  marginBottom: 22,
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 2,
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontSize: 17, fontWeight: 580,
                  color: "var(--ink)", letterSpacing: "-0.025em",
                  marginBottom: 10, lineHeight: 1.2,
                  position: "relative",
                  zIndex: 2,
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: "rgba(17,19,23,0.48)",
                  lineHeight: 1.72,
                  margin: 0,
                  position: "relative",
                  zIndex: 2,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ OUR WORK ══════════════════════════ */}
      <section className="section-pad" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="flex flex-col gap-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
              {/* Text col */}
              <div className="home-our-work-col">
                <div className="section-label sr home-our-work-label">Our Work</div>
                <h2 className="sr" style={{
                  fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 450,
                  letterSpacing: "-0.03em", marginTop: 12, lineHeight: 1.1,
                }}>
                  We build AI that works<em style={{ fontWeight: 300, fontStyle: "italic", color: "rgba(17,19,23,0.45)" }}>.</em>
                </h2>
                <p className="sr" style={{ fontSize: 15, color: "rgba(17,19,23,0.50)", lineHeight: 1.8, marginTop: 20 }}>
                  Our work focuses on the most critical functions in today's businesses sales automation, AI-powered customer engagement, and end-to-end workflow intelligence.
                </p>
                <p className="sr" style={{ fontSize: 15, color: "rgba(17,19,23,0.50)", lineHeight: 1.8, marginTop: 14 }}>
                  We design solutions that place the business outcome at centre stage  building AI agents and automated pipelines that drive revenue, reduce cost, and scale effortlessly.
                </p>
                <ParticleWrapper>
                  <Link href="/services" className="sr inline-flex items-center gap-1.5 mt-8 text-[13.5px] font-medium text-[var(--ink)] no-underline border-b border-[rgba(17,19,23,0.20)] pb-0.5 transition-[border-color] duration-300 ease-in-out hover:border-[var(--ink)]"
                  >
                    View all services →
                  </Link>
                </ParticleWrapper>

                {/* Vertical stats */}
                <div className="flex flex-col gap-0 mt-[52px]">
                  {stats.map((s, i) => (
                    <div key={i} className={`sr flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 py-[18px] border-t border-[rgba(17,19,23,0.08)] ${i === stats.length - 1 ? 'border-b border-[rgba(17,19,23,0.08)]' : ''}`}>
                      <span className="text-[clamp(28px,3vw,40px)] font-[650] text-[var(--accent)] leading-none sm:min-w-[80px]" style={{ letterSpacing: "-0.05em" }}>
                        {s.display}
                      </span>
                      <div>
                        <div className="text-sm font-[520] text-[var(--ink)]" style={{ fontSize: 14, letterSpacing: "-0.02em" }}>{s.label}</div>
                        <div className="text-xs text-[rgba(17,19,23,0.35)] mt-0.5" style={{ fontSize: 12 }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image mosaic */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {workImages.map((img, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl bg-[#E8E8E5]${i >= 4 ? " hidden sm:block" : ""}`}
                      style={{
                        height: 210,
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ ABOUT / DARK ══════════════════════════ */}
      <section className="section-pad" style={{
        background: "var(--ink)",
        position: "relative", overflow: "clip",
      }}>
        {/* Ambient blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", width: 800, height: 800, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)",
            top: "60%", left: "30%", transform: "translate(-50%,-50%)",
            animation: "blob1 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)",
            top: "20%", right: "5%",
            animation: "blob2 22s ease-in-out infinite",
          }} />
        </div>

        <div className="container home-about-wrap" style={{ position: "relative", zIndex: 1 }}>
          {/* Big center quote */}
          <div className="home-about-intro" style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", marginBottom: 80 }}>
            <span className="sr" style={{
              fontSize: 11, fontWeight: 500, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
              display: "block", marginBottom: 28,
            }}>
              Who we are
            </span>
            <h2 className="sr" style={{
              fontSize: "clamp(32px, 4.5vw, 60px)", fontWeight: 400,
              letterSpacing: "-0.035em", lineHeight: 1.15, color: "#FFFFFF", margin: 0,
            }}>
              Every business has a{" "}
              <em style={{
                fontStyle: "italic", fontWeight: 300,
                background: "linear-gradient(110deg, #9C7A1E 0%, #C9A84C 45%, #E8C870 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
                paddingRight: "0.2em",
                paddingBottom: "0.05em",
                marginRight: "-0.2em",
              }}>
                signal
              </em>{" "}
              waiting to be found.
            </h2>
            <p className="sr" style={{
              fontSize: 16, color: "rgba(255,255,255,0.38)",
              lineHeight: 1.82, marginTop: 26,
            }}>
              At WeSee, every engagement begins with finding the signal the unique automation opportunity hidden within every client's operations. It requires deep discovery, rigorous analysis, and bold thinking to uncover. Our job is to find it, amplify it, and build intelligent systems around it.
            </p>
          </div>

          {/* 4-step process grid */}
          <div className="home-about-steps" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { num: "01", title: "Discover & Audit", body: "Map workflows, identify bottlenecks, find the highest leverage automation opportunities." },
              { num: "02", title: "Design & Build", body: "Our AI engineers craft precise, scalable systems custom-built, not out-of-the-box." },
              { num: "03", title: "Deploy & Scale", body: "Launch, monitor, and continuously improve from first automation to enterprise scale." },
              { num: "04", title: "Owned Results", body: "You own every workflow, agent, and dataset. No vendor lock in, ever." },
            ].map((step, i) => (
              <div key={i} className="sr" style={{
                padding: "28px 26px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "background 0.4s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color: "var(--accent)", marginBottom: 14 }}>
                  ({step.num})
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 550, color: "#FFFFFF", letterSpacing: "-0.02em", marginBottom: 10 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.34)", lineHeight: 1.75 }}>
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ SERVICES ══════════════════════════ */}
      <section className="section-pad home-services" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="home-services-head" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 48 }}>
            <div className="home-services-head-main">
              <div className="section-label sr home-our-services-label">Our Services</div>
              <h2
                className="sr"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 450,
                  letterSpacing: "-0.03em", marginTop: 10, lineHeight: 1.1,
                }}
              >
                Built for Growth. Powered by AI. Driven by Automation.
              </h2>
            </div>
            <ParticleWrapper>
              <Link href="/services" className="sr" style={{
                fontSize: 13, fontWeight: 500, color: "rgba(17,19,23,0.48)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(17,19,23,0.15)", paddingBottom: 2,
                transition: "color 0.25s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(17,19,23,0.48)"; }}
              >
                View all →
              </Link>
            </ParticleWrapper>
          </div>

          <div
            ref={svcListRef}
            className="svc-list"
            style={{ position: "relative", overflow: "visible" }}
          >
            {serviceCategories.map((svc, i) => (
              <ParticleWrapper key={i}>
                <Link
                  href={svc.href}
                  className="sr svc-row"
                  style={{
                    display: "flex", alignItems: "flex-start",
                    gap: 20, padding: "20px 0",
                    borderTop: "1px solid rgba(17,19,23,0.08)",
                    borderBottom: i === serviceCategories.length - 1 ? "1px solid rgba(17,19,23,0.08)" : "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "padding-left 0.4s cubic-bezier(0.16,1,0.3,1)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    setSvcHover(i, e.currentTarget);
                    const el = e.currentTarget as HTMLElement;
                    el.style.paddingLeft = "12px";
                    const arrow = el.querySelector(".svc-arrow") as HTMLElement;
                    if (arrow) { arrow.style.transform = "translateX(4px)"; arrow.style.color = "var(--ink)"; }
                  }}
                  onMouseLeave={(e) => {
                    setSvcHover(null);
                    const el = e.currentTarget as HTMLElement;
                    el.style.paddingLeft = "0px";
                    const arrow = el.querySelector(".svc-arrow") as HTMLElement;
                    if (arrow) { arrow.style.transform = "translateX(0)"; arrow.style.color = "rgba(17,19,23,0.20)"; }
                  }}
                  onFocus={(e) => setSvcHover(i, e.currentTarget)}
                  onBlur={() => setSvcHover(null)}
                >
                  <span style={{ fontSize: 10, fontWeight: 650, color: "var(--accent)", letterSpacing: "0.12em", paddingTop: 3.5, flexShrink: 0, width: 22 }}>
                    {svc.num}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 520, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                      {svc.name}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(17,19,23,0.40)", marginTop: 3, lineHeight: 1.55 }}>
                      {svc.desc}
                    </div>
                  </div>
                  <span className="svc-arrow" style={{
                    fontSize: 15, color: "rgba(17,19,23,0.20)",
                    flexShrink: 0, paddingTop: 2,
                    transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), color 0.25s ease",
                    display: "block",
                  }}>→</span>
                </Link>
              </ParticleWrapper>
            ))}

            {hoveredServiceIdx !== null && (
              (() => {
                const svc = serviceCategories[hoveredServiceIdx];
                const names = serviceNamesByCategoryId.get(svc.categoryId) ?? [];
                const shown = names.slice(0, 7);
                const remaining = Math.max(0, names.length - shown.length);
                return (
                  <div
                    ref={svcPopRef}
                    className="svc-pop is-open"
                    role="tooltip"
                    style={{ top: svcPopTop, right: 0 }}
                  >
                    <div className="svc-pop-title">Included services</div>
                    <ul className="svc-pop-list">
                      {shown.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                      {remaining > 0 && (
                        <li className="svc-pop-more">+{remaining} more</li>
                      )}
                    </ul>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CLIENTS FLOATING GRID ══════════════════════════ */}
      <section
        ref={(node) => {
          clientsSectionRef.current = node;
        }}
        className="section-pad home-clients"
        style={{ background: "var(--paper-dark)", overflow: "hidden" }}
      >
        <div className="container" style={{ marginBottom: 52 }}>
          <div className="sr" style={{ textAlign: "center" }}>
            <div className="section-label home-our-clients-label" style={{ justifyContent: "center" }}>Our Clients</div>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 450,
              letterSpacing: "-0.03em", marginTop: 12, lineHeight: 1.1,
            }}>
              We partner with ambitious businesses.
            </h2>
          </div>
        </div>

        <div className="clients-marquee-outer">
          <div className="clients-marquee-rows" aria-label="Client logos marquee">
            {[clients, [...clients].reverse()].map((list, row) => (
              <div
                // overflow hidden masks leaving/entering pills
                key={row}
                className="clients-marquee-row"
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{ display: "flex", gap: 8, width: "max-content", alignItems: "center" }}
                  className={row === 0 ? "animate-marquee-left" : "animate-marquee-right"}
                >
                  {[...list, ...list].map((client, i) => {
                    return (
                      <span
                        key={`${row}-${client.name}-${i}`}
                        className="client-tag"
                        style={{
                          background: row === 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.42)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(17,19,23,0.09)",
                          padding: "9px 20px",
                        }}
                      >
                        <span className="client-tag-icon-wrap" aria-hidden="true">
                          <img
                            className="client-tag-icon"
                            src={client.logoSrc}
                            alt={`${client.name} logo`}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.style.display = "none";
                              const wrap = img.parentElement as HTMLElement | null;
                              if (wrap) wrap.style.display = "none";
                            }}
                          />
                        </span>
                        {client.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ DARK CTA ══════════════════════════ */}
      <section className="section-pad home-dark-cta" style={{
        background: "var(--ink)", textAlign: "center",
        position: "relative", overflow: "clip",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: 800, height: 800, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 60%)",
            top: "50%", left: "38%", transform: "translate(-50%,-50%)",
            animation: "blob1 14s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 60%)",
            top: "20%", right: "-5%",
            animation: "blob2 18s ease-in-out infinite",
          }} />
        </div>

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <span className="sr" style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--accent)", display: "block", marginBottom: 24,
          }}>Get started</span>

          <h2 className="sr" style={{
            fontSize: "clamp(36px, 5.5vw, 68px)",
            fontWeight: 400, letterSpacing: "-0.04em",
            lineHeight: 1.15, color: "#FFFFFF",
            margin: "0 auto", maxWidth: "18ch",
          }}>
            Build a business {" "}
            <em style={{
              fontStyle: "italic", fontWeight: 300, letterSpacing: "-0.05em",
              background: "linear-gradient(110deg, #9C7A1E 0%, #C9A84C 45%, #E8C870 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "inline-block",
              paddingRight: "0.32em",
              paddingLeft: "0.04em",
            }}>that runs itself.</em>
          </h2>

          <p className="sr" style={{
            fontSize: 16, color: "rgba(255,255,255,0.35)",
            marginTop: 22, maxWidth: 500, marginInline: "auto", lineHeight: 1.80,
          }}>
            AI-powered workflows designed to remove bottlenecks and unlock scale for your business.          </p>

          <div className="sr" style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 44, flexWrap: "wrap" }}>
            <ParticleWrapper>
              <Link
                href="/book-call"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "14px 28px",
                  background: "#FFFFFF", color: "var(--ink)",
                  fontSize: 14, fontWeight: 500,
                  borderRadius: 999, border: "none",
                  textDecoration: "none", cursor: finePointer ? "none" : "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                Book a Discovery Call <span style={{ fontSize: 11, opacity: 0.6 }}>↗</span>
              </Link>
            </ParticleWrapper>
            <ParticleWrapper>
              <a
                href="mailto:hr@weseegpt.com"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "13px 24px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.60)",
                  fontSize: 14, fontWeight: 450,
                  borderRadius: 999, textDecoration: "none", cursor: finePointer ? "none" : "pointer",
                  transition: "background 0.3s ease, color 0.3s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.90)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.60)";
                }}
              >
                hr@weseegpt.com
              </a>
            </ParticleWrapper>
          </div>
        </div>
      </section>

      {/* Chat Widget Container */}
      <div
        data-chat-widget
        data-widget-id="69c3c8de13ad14083e68d64e"
        data-location-id="OIRFdfJ7D2iWr89PB0hz"
      />
    </div>
  );
}
