import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import gsap from "gsap";

type Phase = "idle" | "typing" | "ready";

export default function GlobalConnectWidget() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const scrollYRef = useRef(0);

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  const whatsappUrl = useMemo(() => {
    const whatsappPhone = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined)?.trim();
    const whatsappMessage = (import.meta.env.VITE_WHATSAPP_MESSAGE as string | undefined)?.trim();
    if (!whatsappPhone) return undefined;
    const digits = whatsappPhone.replace(/[^\d]/g, "");
    if (!digits) return undefined;
    return `https://wa.me/${digits}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ""}`;
  }, []);

  const callHref = useMemo(() => {
    const whatsappPhone = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined)?.trim();
    if (!whatsappPhone) return undefined;
    const digits = whatsappPhone.replace(/[^\d]/g, "");
    if (!digits) return undefined;
    return `tel:+${digits}`;
  }, []);

  // Don't show global widget on Contact page (it already has a bespoke section).
  if (location === "/contact") return null;
  if (!whatsappUrl && !callHref) return null;

  // Dot pulse
  useEffect(() => {
    if (!dotRef.current) return;
    const tl = gsap.to(dotRef.current, {
      scale: 1.8,
      opacity: 0,
      duration: 1.4,
      ease: "power2.out",
      repeat: -1,
      repeatDelay: 0.4,
    });
    return () => {
      tl.kill();
    };
  }, []);

  // Scroll lock while open
  useEffect(() => {
    if (open) {
      scrollYRef.current = window.scrollY;
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflowY = "scroll";
      if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    } else {
      const y = scrollYRef.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflowY = "";
      document.body.style.paddingRight = "";
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    }
    return () => {
      const y = scrollYRef.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflowY = "";
      document.body.style.paddingRight = "";
      if (open) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    };
  }, [open]);

  // Drawer open/close animation
  useEffect(() => {
    const drawer = drawerRef.current;
    const overlay = overlayRef.current;
    if (!drawer || !overlay) return;

    if (open) {
      setPhase("typing");
      gsap.fromTo(
        overlay,
        { opacity: 0, pointerEvents: "none" },
        { opacity: 1, pointerEvents: "auto", duration: 0.35, ease: "power2.out" }
      );
      gsap.fromTo(drawer, { x: "100%", opacity: 0 }, { x: "0%", opacity: 1, duration: 0.6, ease: "expo.out" });
      const t = window.setTimeout(() => setPhase("ready"), 720);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        clearTimeout(t);
        window.removeEventListener("keydown", onKey);
      };
    }

    gsap.to(overlay, { opacity: 0, pointerEvents: "none", duration: 0.28 });
    gsap.to(drawer, { x: "100%", opacity: 0, duration: 0.42, ease: "power3.in" });
    setPhase("idle");
  }, [open]);

  // Stagger CTA buttons in
  useEffect(() => {
    if (phase !== "ready" || !drawerRef.current) return;
    const btns = drawerRef.current.querySelectorAll(".ci-cta-btn");
    gsap.fromTo(btns, { opacity: 0, y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.12, ease: "back.out(1.2)" });
  }, [phase]);

  return (
    <>
      <style>{`
        @keyframes ciDot {
          0%,80%,100% { transform:translateY(0); opacity:.35; }
          40%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes ciSpin { to { transform: rotate(360deg); } }

        .ci-float {
          position: fixed;
          right: max(18px, env(safe-area-inset-right, 0px));
          bottom: max(18px, env(safe-area-inset-bottom, 0px));
          z-index: 9999;
          display: grid;
          place-items: center;
          gap: 8px;
          pointer-events: auto;
        }
        .ci-float button {
          position: relative;
          width: 54px;
          height: 54px;
          border-radius: 999px;
          border: none;
          background: #0F0F0F;
          cursor: pointer;
          display: grid;
          place-items: center;
          box-shadow: 0 18px 44px rgba(0,0,0,0.22);
        }
        .ci-trigger-ring {
          position:absolute; inset:-6px; border-radius:50%;
          border:1px solid rgba(201,168,76,0.26);
          animation: ciSpin 12s linear infinite;
          pointer-events: none;
        }
        .ci-trigger-ring::after {
          content:''; position:absolute; top:-2px; left:50%;
          transform:translateX(-50%);
          width:3px; height:3px; border-radius:50%;
          background:#C9A84C; box-shadow:0 0 10px rgba(201,168,76,0.85);
        }
        @media (max-width: 480px) {
          .ci-float {
            right: max(14px, env(safe-area-inset-right, 0px));
            bottom: max(14px, env(safe-area-inset-bottom, 0px));
          }
          .ci-float button {
            width: 50px;
            height: 50px;
          }
        }
        @media (max-width: 360px) {
          .ci-float {
            right: max(12px, env(safe-area-inset-right, 0px));
            bottom: max(12px, env(safe-area-inset-bottom, 0px));
          }
          .ci-float button {
            width: 46px;
            height: 46px;
          }
        }

        /* Shared drawer styles (same look as Contact) */
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
        .ci-cta-btn.ci-cta-wa > * { position: relative; z-index: 1; }

        .ci-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: clamp(280px, 42vw, 480px);
          max-width: 100vw;
          z-index: 70;
          background:
            radial-gradient(900px 620px at 115% 0%, rgba(201,168,76,0.16), transparent 60%),
            linear-gradient(180deg, #0B0C10 0%, #07080B 100%);
          border-left: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          -webkit-overflow-scrolling: touch;
          text-align: center;
        }
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
        .ci-drawer-content { width: 100%; max-width: 380px; margin-inline: auto; }
        .ci-avatar-row { justify-content: flex-start; }
        .ci-close {
          top: calc(24px + env(safe-area-inset-top, 0px));
          right: calc(24px + env(safe-area-inset-right, 0px));
        }
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
        @media (max-width: 768px) { .ci-drawer { width: min(88vw, 480px); } }
        @media (max-width: 480px) { .ci-drawer { width: 92vw; } }
        @media (max-width: 380px) { .ci-drawer { width: 100vw; border-left: none; } .ci-drawer-content { max-width: 340px; } }
        @media (max-height: 560px) { .ci-drawer-center { align-items: flex-start; } }
      `}</style>

      {portalTarget
        ? createPortal(
            <div className="ci-float">
              <button
                type="button"
                aria-label={open ? "Close connect panel" : "Open connect panel"}
                onClick={() => setOpen((v) => !v)}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.25, ease: "back.out(1.6)" })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.25, ease: "power2.out" })}
              >
                <span className="ci-trigger-ring" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ position: "relative", zIndex: 1 }}>
                  {open ? (
                    <path d="M6 6l12 12M18 6L6 18" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
                  ) : (
                    <>
                      <path
                        d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.55-.29-3.67-.81L3 21l1.31-5.83A8.5 8.5 0 1 1 21 12Z"
                        stroke="#FFFFFF"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.5 10.5h7M8.5 13.5h4.5"
                        stroke="rgba(255,255,255,0.6)"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>,
            portalTarget
          )
        : null}

      {portalTarget
        ? createPortal(
            <>
              <div
                ref={overlayRef}
                onClick={() => setOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 65,
                  background: "rgba(10,10,10,0.52)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  opacity: 0,
                  pointerEvents: "none",
                  cursor: "pointer",
                }}
              />

              <div ref={drawerRef} className="ci-drawer" role="dialog" aria-modal="true" aria-label="Connect options" style={{ transform: "translateX(100%)", opacity: 0 }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    backgroundImage:
                      "radial-gradient(circle at 20% 10%, rgba(201,168,76,0.16), transparent 42%),radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
                    backgroundSize: "auto, 22px 22px",
                    opacity: 0.7,
                    mixBlendMode: "screen",
                  }}
                />

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
                    <path d="M1 1l12 12M13 1L1 13" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                <div className="ci-drawer-center" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                  <div className="ci-drawer-content" style={{ position: "relative" }}>
                    <div className="ci-avatar-row" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, width: "100%" }}>
                      <div className="ci-logo-mark" aria-hidden>
                        <img
                          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663374526873/i7vThuKaRmDbUwRVJzPJ6B/wesee_logo_4739f7bd.gif"
                          alt=""
                          loading="lazy"
                        />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>WeSee</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
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
                                ref={dotRef}
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
                          Hey — choose how you'd like to connect with WeSee.
                        </span>
                      )}
                    </div>

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

