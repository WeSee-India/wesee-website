import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import TextReveal from "@/components/TextReveal";
import ImageReveal from "@/components/ImageReveal";
import MagneticButton from "@/components/MagneticButton";
import ParticleWrapper from "@/components/ParticleWrapper";
import TiltCard from "@/components/TiltCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const contactTypes = [
  { label: "General enquiries", email: "careers@weseegpt.com", person: "WeSee Team", title: "General", photo: "/client/yuvraj.webp" },
  { label: "Business enquiries", email: "harsh.khanna@weseegpt.com", person: "Harsh Khanna", title: "Founder & CEO", photo: "/client/harsh.webp" },
];

const offices = [
  { city: "Tokyo", country: "Japan", role: "Headquarters", address: "1 Chome-1-17 Nakameguro, Meguro City, Tokyo 153-0061, Japan", phone: "+81 0704 2332 201", map: "https://www.google.com/maps/place/Japan,+%E3%80%92153-0061+Tokyo,+Meguro+City,+Nakameguro,+1-ch%C5%8Dme%E2%88%921%E2%88%9217+%E3%83%9E%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%E6%81%B5%E6%AF%94%E9%A0%88%E8%8B%91+102/@35.6439478,139.7037363,18.85z/data=!4m6!3m5!1s0x60188b47af800cd9:0x20304b16a49a858a!8m2!3d35.6442008!4d139.7034181!16s%2Fg%2F11vzdfqxf4?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw%3D%3D" },
  { city: "Mumbai", country: "India", role: "Operations", address: "Hubtown Viva, 12th Floor, Saraswati Baug, Shankarwadi, Jogeshwari East, Mumbai, Maharashtra 400060", phone: "+91 8604 1091 07", map: "https://www.google.com/maps/place/Hubtown+Viva/@19.1313645,72.8531528,17z/data=!3m2!4b1!5s0x3be7b7d5b663c4ad:0x2f60ba818419208b!4m6!3m5!1s0x3be7b7cecfe0f0fd:0x82655eeb16d16558!8m2!3d19.1313594!4d72.8557277!16s%2Fg%2F11gjhnxbbv?entry=ttu&g_ep=EgoyMDI2MDMzMC4wIKXMDSoASAFQAw%3D%3D" },
];

// ─── Connect Instantly — Full-bleed editorial, no containers ─────────────────
function ConnectInstantly({
  whatsappUrl,
  callHref,
}: {
  whatsappUrl?: string;
  callHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "typing" | "ready">("idle");

  const sectionRef   = useRef<HTMLElement>(null);
  const headlineRef  = useRef<HTMLDivElement>(null);
  const triggerRef   = useRef<HTMLButtonElement>(null);
  const drawerRef    = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const lineLeftRef  = useRef<HTMLSpanElement>(null);
  const lineRightRef = useRef<HTMLSpanElement>(null);
  const dotRef       = useRef<HTMLSpanElement>(null);
  const scrollYRef   = useRef(0);

  // ── entrance animation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const headline = headlineRef.current;
    const trigger  = triggerRef.current;
    const lL       = lineLeftRef.current;
    const lR       = lineRightRef.current;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 82%", toggleActions: "play none none none" },
    });

    gsap.set([headline, trigger], { opacity: 0, y: 28 });
    gsap.set(lL, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(lR, { scaleX: 0, transformOrigin: "right center" });

    tl.to(lL,       { scaleX: 1, duration: 1.1, ease: "expo.out" })
      .to(lR,       { scaleX: 1, duration: 1.1, ease: "expo.out" }, "<")
      .to(headline, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.6")
      .to(trigger,  { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4");

    return () => { tl.kill(); };
  }, []);

  // ── dot pulse
  useEffect(() => {
    if (!dotRef.current) return;
    const tl = gsap.to(dotRef.current, {
      scale: 1.8, opacity: 0, duration: 1.4,
      ease: "power2.out", repeat: -1, repeatDelay: 0.4,
    });
    return () => { tl.kill(); };
  }, []);

  // ── scroll lock — position:fixed technique works on desktop + iOS Safari
  useEffect(() => {
    if (open) {
      scrollYRef.current = window.scrollY;
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.position    = "fixed";
      document.body.style.top         = `-${scrollYRef.current}px`;
      document.body.style.left        = "0";
      document.body.style.right       = "0";
      document.body.style.overflowY   = "scroll";
      if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    } else {
      const y = scrollYRef.current;
      document.body.style.position    = "";
      document.body.style.top         = "";
      document.body.style.left        = "";
      document.body.style.right       = "";
      document.body.style.overflowY   = "";
      document.body.style.paddingRight = "";
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    }
    return () => {
      // cleanup if unmounts while open
      const y = scrollYRef.current;
      document.body.style.position    = "";
      document.body.style.top         = "";
      document.body.style.left        = "";
      document.body.style.right       = "";
      document.body.style.overflowY   = "";
      document.body.style.paddingRight = "";
      if (open) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    };
  }, [open]);

  // ── drawer open/close animation
  useEffect(() => {
    const drawer  = drawerRef.current;
    const overlay = overlayRef.current;
    if (!drawer || !overlay) return;

    if (open) {
      setPhase("typing");
      gsap.fromTo(overlay,
        { opacity: 0, pointerEvents: "none" },
        { opacity: 1, pointerEvents: "auto", duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(drawer,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.65, ease: "expo.out" }
      );
      const t = window.setTimeout(() => setPhase("ready"), 750);
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
      window.addEventListener("keydown", onKey);
      return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
    } else {
      gsap.to(overlay, { opacity: 0, pointerEvents: "none", duration: 0.3 });
      gsap.to(drawer,  { x: "100%", opacity: 0, duration: 0.45, ease: "power3.in" });
      setPhase("idle");
    }
  }, [open]);

  // ── stagger CTA buttons in
  useEffect(() => {
    if (phase !== "ready" || !drawerRef.current) return;
    const btns = drawerRef.current.querySelectorAll(".ci-cta-btn");
    gsap.fromTo(btns,
      { opacity: 0, y: 14, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.12, ease: "back.out(1.2)" }
    );
  }, [phase]);

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <>
      <style>{`
        @keyframes ciDot {
          0%,80%,100% { transform:translateY(0); opacity:.35; }
          40%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes ciSpin { to { transform: rotate(360deg); } }
        @keyframes ciGlide {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes ciFlicker {
          0%,100%{opacity:.9} 48%{opacity:.7} 50%{opacity:1} 92%{opacity:.85}
        }
        .ci-trigger-ring {
          position:absolute; inset:-6px; border-radius:50%;
          border:1px solid rgba(201,168,76,0.25);
          animation: ciSpin 12s linear infinite;
          pointer-events: none;
        }
        .ci-trigger-ring::after {
          content:''; position:absolute; top:-2px; left:50%;
          transform:translateX(-50%);
          width:3px; height:3px; border-radius:50%;
          background:#C9A84C; box-shadow:0 0 8px #C9A84C;
        }
        /* Subtle hover — just a slight brightness, no lift/scale */
        .ci-cta-btn { transition: filter 0.18s ease, opacity 0.18s ease; }
        .ci-cta-btn:hover { filter: brightness(1.08); opacity: 0.92; }
        .ci-cta-btn:active { filter: brightness(0.95); opacity: 1; }
        .ci-cta-btn.ci-cta-wa {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(520px 260px at 20% 0%, rgba(201,168,76,0.22), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
          border: 1px solid rgba(201,168,76,0.28);
          color: rgba(255,255,255,0.92);
          box-shadow: 0 16px 44px rgba(0,0,0,0.42), 0 10px 26px rgba(201,168,76,0.14);
        }
        .ci-cta-btn.ci-cta-wa::before {
          content: "";
          position: absolute;
          inset: -2px;
          background: linear-gradient(110deg, transparent 35%, rgba(245,216,122,0.18) 50%, transparent 65%);
          transform: translateX(-20%);
          opacity: 0.9;
          pointer-events: none;
        }
        .ci-cta-btn.ci-cta-wa > * {
          position: relative;
          z-index: 1;
        }
        /* Drawer — fixed right panel on all screen sizes */
        .ci-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: clamp(280px, 42vw, 480px);
          max-width: 100vw;
          z-index: 50;
          background:
            radial-gradient(900px 620px at 115% 0%, rgba(201,168,76,0.16), transparent 60%),
            linear-gradient(180deg, #0B0C10 0%, #07080B 100%);
          border-left: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          -webkit-overflow-scrolling: touch;
          text-align: center;
        }
        /* This layer is pinned to the drawer viewport and centers content */
        .ci-drawer-center {
          position: absolute;
          inset: 0;
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding:
            calc(clamp(36px,5vw,60px) + env(safe-area-inset-top, 0px))
            calc(clamp(24px,4vw,52px) + env(safe-area-inset-right, 0px))
            calc(clamp(36px,5vw,60px) + env(safe-area-inset-bottom, 0px))
            calc(clamp(24px,4vw,52px) + env(safe-area-inset-left, 0px));
          box-sizing: border-box;
        }
        .ci-drawer-content {
          width: 100%;
          max-width: 380px;
          margin-inline: auto;
        }
        .ci-avatar-row { justify-content: flex-start; }
        .ci-logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          flex-shrink: 0;
          background: linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.08));
          border: 1px solid rgba(201,168,76,0.28);
          box-shadow: 0 10px 22px rgba(0,0,0,0.35), 0 8px 20px rgba(201,168,76,0.12);
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .ci-logo-mark img {
          width: 78%;
          height: 78%;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));
        }
        .ci-close {
          top: calc(24px + env(safe-area-inset-top, 0px));
          right: calc(24px + env(safe-area-inset-right, 0px));
        }
        @media (max-width: 768px) {
          .ci-drawer { width: min(88vw, 480px); }
        }
        @media (max-width: 480px) {
          .ci-drawer { width: 92vw; }
        }
        @media (max-width: 380px) {
          .ci-drawer { width: 100vw; border-left: none; }
          .ci-drawer-content { max-width: 340px; }
        }
        @media (max-height: 560px) {
          .ci-drawer-center {
            align-items: flex-start;
          }
        }
      `}</style>

      {/* ── Full-bleed section ── */}
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#FAFAF8",
          minHeight: "clamp(200px, 30vh, 300px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Architectural horizontal rules (decorative, transparent by default) */}
        <span ref={lineLeftRef} aria-hidden style={{
          position: "absolute", top: "50%", left: 0,
          width: "clamp(60px, 12vw, 160px)", height: 1,
          background: "transparent", transformOrigin: "left center",
        }} />
        <span ref={lineRightRef} aria-hidden style={{
          position: "absolute", top: "50%", right: 0,
          width: "clamp(60px, 12vw, 160px)", height: 1,
          background: "transparent", transformOrigin: "right center",
        }} />

        {/* Main content */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "clamp(48px, 7vw, 80px) clamp(24px, 6vw, 80px)",
          gap: "clamp(28px, 4vw, 44px)",
          textAlign: "center",
        }}>
          {/* Headline */}
          <div ref={headlineRef} style={{ maxWidth: 800, width: "100%" }}>
            <div style={{
              fontSize: "clamp(36px, 6.5vw, 86px)", fontWeight: 900,
              lineHeight: 1.0, letterSpacing: "-0.03em", color: "#0F0F0F",
              animation: "ciFlicker 8s ease-in-out infinite",
            }}>
              Prefer a{" "}
              <span style={{
                background: "linear-gradient(100deg, #C9A84C 0%, #f5d87a 45%, #C9A84C 100%)",
                backgroundSize: "200%",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                animation: "ciGlide 3.5s ease-in-out infinite", display: "inline-block",
              }}>
                quick chat?
              </span>
            </div>
            <p style={{
              marginTop: "clamp(10px, 1.5vw, 16px)", fontSize: "clamp(13px, 1.5vw, 16px)",
              fontWeight: 400, color: "#888", letterSpacing: "0.01em", lineHeight: 1.7,
            }}>
              No forms. No waiting. Just a direct line to the team.
            </p>
          </div>

          {/* Orbital trigger button */}
          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? "Close connect panel" : "Open connect panel"}
            onClick={() => setOpen(v => !v)}
            onMouseEnter={() => triggerRef.current && gsap.to(triggerRef.current, { scale: 1.05, duration: 0.3, ease: "back.out(1.5)" })}
            onMouseLeave={() => triggerRef.current && gsap.to(triggerRef.current, { scale: 1, duration: 0.3, ease: "power2.out" })}
            style={{
              position: "relative",
              width: "clamp(40px, 5vw, 58px)", height: "clamp(40px, 5vw, 58px)",
              borderRadius: "50%", border: "none",
              background: open ? "linear-gradient(135deg, #C9A84C, #f0c96e)" : "#0F0F0F",
              cursor: "pointer", display: "grid", placeItems: "center",
              boxShadow: open ? "0 12px 32px rgba(201,168,76,0.3)" : "0 12px 32px rgba(0,0,0,0.15)",
              transition: "background 0.4s ease, box-shadow 0.4s ease",
            }}
          >
            <span className="ci-trigger-ring" />
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden
              style={{
                transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
                transform: open ? "rotate(45deg)" : "none",
                position: "relative", zIndex: 1,
              }}
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="#0F0F0F" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.55-.29-3.67-.81L3 21l1.31-5.83A8.5 8.5 0 1 1 21 12Z" stroke="#FFFFFF" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M8.5 10.5h7M8.5 13.5h4.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>

          {/* Tap hint */}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: open ? "#C9A84C" : "#BBBBBB",
            transition: "color 0.4s ease",
            marginTop: -18,
          }}>
            {open ? "tap to close" : "tap to connect"}
          </span>
        </div>

        {/* Bottom gold rule */}
        <span aria-hidden style={{
          position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.42) 35%, rgba(201,168,76,0.22) 65%, transparent)",
        }} />
      </section>

      {portalTarget
        ? createPortal(
            <>
              {/* ── Scrim overlay ── */}
              <div
                ref={overlayRef}
                onClick={() => setOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 40,
                  background: "rgba(10,10,10,0.52)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  opacity: 0,
                  pointerEvents: "none",
                  cursor: "pointer",
                }}
              />

              {/* ── Sliding drawer ── */}
              <div
                ref={drawerRef}
                className="ci-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Connect options"
                style={{ transform: "translateX(100%)", opacity: 0 }}
              >
                {/* Subtle grid texture */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    backgroundImage:
                      "radial-gradient(circle at 20% 10%, rgba(201,168,76,0.16), transparent 42%),radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
                    backgroundSize: "auto, auto, 22px 22px",
                    opacity: 0.7,
                    mixBlendMode: "screen",
                  }}
                />

                {/* Gold left accent */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: "12%",
                    bottom: "12%",
                    left: 0,
                    width: 2,
                    background: "linear-gradient(180deg, transparent, #C9A84C 30%, rgba(245,216,122,0.85) 70%, transparent)",
                  }}
                />

                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="ci-close"
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    zIndex: 2,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                <div className="ci-drawer-center" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                  <div className="ci-drawer-content" style={{ position: "relative" }}>
                    {/* Avatar + status */}
                    <div
                      className="ci-avatar-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 28,
                        width: "100%",
                      }}
                    >
                      <div className="ci-logo-mark" aria-hidden>
                        <img
                          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663374526873/i7vThuKaRmDbUwRVJzPJ6B/wesee_logo_4739f7bd.gif"
                          alt=""
                          loading="lazy"
                        />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>WeSee</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.35)",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginTop: 2,
                          }}
                        >
                          {phase === "typing" ? (
                            <>
                              {[0, 0.15, 0.3].map((d, i) => (
                                <span
                                  key={i}
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    background: "rgba(201,168,76,0.75)",
                                    display: "inline-block",
                                    animation: `ciDot 1.1s ${d}s infinite ease-in-out`,
                                  }}
                                />
                              ))}
                              <span>typing…</span>
                            </>
                          ) : (
                            <>
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#C9A84C",
                                  display: "inline-block",
                                  boxShadow: "0 0 7px rgba(201,168,76,0.65)",
                                }}
                              />
                              online now
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Message bubble */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "3px 18px 18px 18px",
                        padding: "14px 18px",
                        marginBottom: 28,
                        minHeight: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      {phase === "typing" ? (
                        <span style={{ display: "flex", gap: 5 }}>
                          {[0, 0.18, 0.36].map((d, i) => (
                            <span
                              key={i}
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.28)",
                                display: "inline-block",
                                animation: `ciDot 1.1s ${d}s infinite ease-in-out`,
                              }}
                            />
                          ))}
                        </span>
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                          Hey — choose how you'd like to connect with WeSee. 👋
                        </span>
                      )}
                    </div>

                    {/* CTAs — plain <a> tags, tap-friendly on all devices, subtle hover only */}
                    {phase === "ready" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ci-cta-btn ci-cta-wa"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              textDecoration: "none",
                              width: "100%",
                              padding: "15px 20px",
                              boxSizing: "border-box",
                              fontSize: 14,
                              fontWeight: 700,
                              borderRadius: 14,
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
                                <path
                                  d="M16 2C8.268 2 2 8.268 2 16c0 2.44.638 4.73 1.752 6.72L2 30l7.538-1.722A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Z"
                                  fill="rgba(255,255,255,0.12)"
                                />
                                <path
                                  d="M22.5 19.5c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.47-2.4-1.5-.89-.8-1.49-1.78-1.66-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.52-.07-.15-.68-1.63-.93-2.23-.25-.6-.5-.52-.68-.53-.18-.01-.38-.01-.58-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.2 5.07 4.48.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.19-.57-.34Z"
                                  fill="rgba(255,255,255,0.92)"
                                />
                              </svg>
                              Connect via WhatsApp
                            </span>
                            <span style={{ fontSize: 15, opacity: 0.8 }}>↗</span>
                          </a>
                        )}
                        {callHref && (
                          <a
                            href={callHref}
                            className="ci-cta-btn"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              textDecoration: "none",
                              width: "100%",
                              padding: "15px 20px",
                              boxSizing: "border-box",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              color: "rgba(255,255,255,0.85)",
                              fontSize: 14,
                              fontWeight: 700,
                              borderRadius: 14,
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M14 2C14 2 16.2 2.2 19 5C21.8 7.8 22 10 22 10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M14.207 5.53564C14.207 5.81849 15.197 5.81849 16.6819 7.30341C18.1668 8.78834 18.4497 9.77829 18.4497 9.77829" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M4.00655 7.93309C3.93421 9.84122 4.41713 13.0817 7.6677 16.3323C8.45191 17.1165 9.23553 17.7396 10 18.2327M5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 10.1147 9.8278 10.1147 9.8278C10.1146 9.82792 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1714 13.8861 14.1722 13.8853C14.1722 13.8853 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C15.2529 20.0243 14.1963 19.9541 13 19.6111" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                              Connect via Call
                            </span>
                            <span style={{ fontSize: 15, opacity: 0.4 }}>↗</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Footnote */}
                    <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", lineHeight: 1.7, fontWeight: 400 }}>
                        Typically responds within a few hours during business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>,
            portalTarget
          )
        : null}
    </>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Contact() {
  const [openOffice, setOpenOffice] = useState<number | null>(null);
  const contactCardsRef = useRef<HTMLDivElement>(null);
  const officeSectionRef = useRef<HTMLDivElement>(null);
  const officeContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const whatsappPhone = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined)?.trim();
  const whatsappMessage = (import.meta.env.VITE_WHATSAPP_MESSAGE as string | undefined)?.trim();
  const callHref = whatsappPhone ? `tel:+${whatsappPhone.replace(/[^\d]/g, "")}` : undefined;

  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace(/[^\d]/g, "")}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ""}`
    : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    const localTriggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll(".gsap-reveal");
      reveals.forEach((el) => {
        const anim = gsap.fromTo(el,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" } }
        );
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });

      if (contactCardsRef.current) {
        const cards = contactCardsRef.current.querySelectorAll(".contact-card");
        cards.forEach((card, i) => {
          const cardImg = card.querySelector("img");
          const cardContent = card.querySelector(".flex-1");
          const anim = gsap.fromTo(card,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none none" } }
          );
          if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
          if (cardImg) gsap.fromTo(cardImg, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, delay: i * 0.12 + 0.2, ease: "power2.out" });
          if (cardContent) gsap.fromTo(cardContent, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay: i * 0.12 + 0.3, ease: "power3.out" });
        });
      }

      if (officeSectionRef.current) {
        const officeItems = officeSectionRef.current.querySelectorAll(".office-item");
        officeItems.forEach((item, i) => {
          const anim = gsap.fromTo(item,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, delay: i * 0.12, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none none" } }
          );
          if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
        });
      }
    }, 50);
    return () => { clearTimeout(timer); localTriggers.forEach(t => t.kill()); };
  }, []);

  useEffect(() => {
    officeContentRefs.current.forEach((el, i) => {
      if (!el) return;
      if (openOffice === i) {
        gsap.fromTo(el, { maxHeight: 0, opacity: 0, y: -20 }, { maxHeight: 360, opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        const children = el.querySelectorAll("div, a");
        children.forEach((child, idx) => {
          gsap.fromTo(child, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.5, delay: idx * 0.1, ease: "power2.out" });
        });
      } else {
        gsap.to(el, { maxHeight: 0, opacity: 0, y: -20, duration: 0.4, ease: "power2.in" });
      }
    });
  }, [openOffice]);

  return (
    <div className="contact-page" style={{ paddingTop: "clamp(48px, 6vw, 64px)" }}>
      <div className="section-padding">
        <div className="container">
          <TextReveal
            as="h1"
            className="contact-hero-title"
            style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15 }}
            stagger={0.06}
            onScroll={false}
          >
            Get in touch.
          </TextReveal>
        </div>
      </div>

      <div style={{ width: "100%", height: "clamp(250px, 45vh, 400px)", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=2000&q=80" alt="City" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
      </div>

      <section className="section-padding">
        <div className="container">
          <div ref={contactCardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {contactTypes.map((ct) => (
              <ParticleWrapper key={ct.label}>
                <TiltCard maxTilt={5} scale={1.01}>
                  <a
                    href={`mailto:${ct.email}`}
                    className="contact-card group flex gap-4 md:gap-6 p-5 md:p-7 rounded-2xl transition-all duration-500 ease-out hover:bg-[#FAFAFA] hover:shadow-xl hover:scale-[1.02]"
                    style={{ cursor: "pointer", textDecoration: "none", background: "#FFFFFF", border: "1px solid #F0F0F0", transformStyle: "preserve-3d" }}
                    onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", duration: 0.4, ease: "power2.out" })}
                    onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.4, ease: "power2.out" })}
                  >
                    <div className="overflow-hidden rounded-xl relative" style={{ width: "clamp(64px, 8vw, 80px)", height: "clamp(64px, 8vw, 80px)", flexShrink: 0 }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                      <img src={ct.photo} alt={ct.person} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "filter 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)" }} className="md:grayscale md:group-hover:!grayscale-0" onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="group-hover:text-[#666666]" style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888", marginBottom: 10, transition: "color 0.3s ease" }} onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 2, duration: 0.3, ease: "power2.out" })} onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.3, ease: "power2.out" })}>{ct.label}</div>
                      <div className="cta-link" style={{ fontSize: "clamp(15px, 1.8vw, 18px)", fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 8, transition: "color 0.3s ease" }} onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.02, x: 3, duration: 0.3, ease: "power2.out" })} onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, x: 0, duration: 0.3, ease: "power2.out" })}>{ct.email}</div>
                      <div style={{ fontSize: "clamp(13px, 1.5vw, 15px)", fontWeight: 400, color: "#666666", lineHeight: 1.6 }}>{ct.person} — {ct.title}</div>
                    </div>
                  </a>
                </TiltCard>
              </ParticleWrapper>
            ))}
          </div>
        </div>
      </section>

      <section className="" style={{ borderTop: "1px solid #EEEEEE" }}>
        <div className="container">
          <TextReveal as="h2" className="section-heading" stagger={0.05} style={{ paddingTop: "clamp(20px, 3vw, 28px)" }}>
            Our offices.
          </TextReveal>
          <div ref={officeSectionRef} style={{ marginTop: "clamp(32px, 4vw, 48px)" }}>
            {offices.map((office, i) => (
              <div key={office.city} className="office-item" style={{ borderTop: i === 0 ? "none" : "1px solid #EEEEEE" }}>
                <ParticleWrapper>
                  <button
                    onClick={() => setOpenOffice(openOffice === i ? null : i)}
                    className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between group relative overflow-hidden"
                    style={{ padding: "clamp(20px, 3vw, 28px) clamp(16px, 2vw, 24px)", cursor: "pointer", background: "none", border: "none", textAlign: "left", transition: "background-color 0.3s ease", borderRadius: "12px" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.02)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <div className="flex-1 flex items-center justify-between sm:block">
                      <div>
                        <span style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 600, color: "#1A1A1A", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)", display: "inline-block" }} className="group-hover:translate-x-1">{office.city}</span>
                        <span style={{ fontSize: "clamp(13px, 1.5vw, 15px)", fontWeight: 400, color: "#888888", marginLeft: 12 }}>{office.country}</span>
                      </div>
                      <span className="sm:hidden" style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 300, color: "#888888", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), color 0.3s ease", transform: openOffice === i ? "rotate(45deg)" : "none" }}>{openOffice === i ? "×" : "+"}</span>
                    </div>
                    <span className="hidden sm:inline" style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 300, color: "#888888", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), color 0.3s ease", transform: openOffice === i ? "rotate(45deg)" : "none", marginTop: "8px", alignSelf: "flex-start" }}>{openOffice === i ? "×" : "+"}</span>
                  </button>
                </ParticleWrapper>
                <div ref={(el) => { officeContentRefs.current[i] = el; }} style={{ maxHeight: openOffice === i ? 360 : 0, overflow: "hidden", opacity: openOffice === i ? 1 : 0 }}>
                  <div style={{ paddingBottom: "clamp(20px, 3vw, 28px)", paddingLeft: "clamp(16px, 2vw, 24px)" }}>
                    <div style={{ fontSize: "clamp(11px, 1.3vw, 13px)", fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{office.role}</div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                      <a href={office.map ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address.trim())}`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${office.city} in maps`} style={{ textDecoration: "none", flexShrink: 0, marginTop: 2, lineHeight: 0, transition: "transform 0.2s ease, opacity 0.2s ease" }} onClick={(e) => e.stopPropagation()} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.opacity = "0.75"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}>
                        <img src="/locationsvg.svg" alt="" width={22} height={22} className="pointer-events-none block" style={{ width: 22, height: 22 }} aria-hidden />
                      </a>
                      <a href={office.map ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address.trim())}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 400, color: "#3A3A3A", lineHeight: 1.6, flex: 1, minWidth: 0, textDecoration: "none", transition: "color 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#1A1A1A"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#3A3A3A"; }}>
                        {office.address.trim()}
                      </a>
                    </div>
                    <a href={`tel:${office.phone.replace(/\s/g, "")}`} style={{ fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 400, color: "#1A1A1A", textDecoration: "none", transition: "color 0.3s ease", display: "inline-flex", alignItems: "center", gap: 8 }} onMouseEnter={(e) => { e.currentTarget.style.color = "#666666"; gsap.to(e.currentTarget, { x: 3, duration: 0.3, ease: "power2.out" }); }} onMouseLeave={(e) => { e.currentTarget.style.color = "#1A1A1A"; gsap.to(e.currentTarget, { x: 0, duration: 0.3, ease: "power2.out" }); }}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" aria-hidden>
                        <path d="M14 2C14 2 16.2 2.2 19 5C21.8 7.8 22 10 22 10" stroke="#252627" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M14.207 5.53564C14.207 5.81849 15.197 5.81849 16.6819 7.30341C18.1668 8.78834 18.4497 9.77829 18.4497 9.77829" stroke="#252627" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M4.00655 7.93309C3.93421 9.84122 4.41713 13.0817 7.6677 16.3323C8.45191 17.1165 9.23553 17.7396 10 18.2327M5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 10.1147 9.8278 10.1147 9.8278C10.1146 9.82792 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1714 13.8861 14.1722 13.8853C14.1722 13.8853 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C15.2529 20.0243 14.1963 19.9541 13 19.6111" stroke="#252627" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>{office.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Connect Instantly ── */}
      {(whatsappUrl || callHref) && (
        <ConnectInstantly whatsappUrl={whatsappUrl} callHref={callHref} />
      )}

      <ImageReveal
        src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2000&q=80"
        alt="City"
        direction="up"
        parallax
        parallaxAmount={40}
        zoom={false}
        style={{ width: "100%", height: "clamp(280px, 35vh, 420px)" }}
      />
    </div>
  );
} 