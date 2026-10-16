import { useEffect, useRef, useState } from "react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(true);
  const completedRef = useRef(false);

  const safeSessionGet = (key: string) => {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const safeSessionSet = (key: string, value: string) => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // ignore (storage can be unavailable in some contexts)
    }
  };

  useEffect(() => {
    const completeOnce = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    };

    if (safeSessionGet("wesee-loaded")) {
      setVisible(false);
      completeOnce();
      return;
    }

    // Respect reduced-motion: skip the animated intro entirely.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(false);
      safeSessionSet("wesee-loaded", "true");
      completeOnce();
      return;
    }

    const timeouts: number[] = [];
    timeouts.push(window.setTimeout(() => setPhase(1), 200));
    timeouts.push(window.setTimeout(() => setPhase(2), 600));
    timeouts.push(window.setTimeout(() => setPhase(3), 900));

    let current = 0;
    const DURATION = 1800;
    const STEPS = 100;
    const id = window.setInterval(() => {
      current++;
      setProgress(current);
      if (current >= 100) {
        clearInterval(id);
        timeouts.push(window.setTimeout(() => {
          setFadeOut(true);
          timeouts.push(window.setTimeout(() => {
            setVisible(false);
            safeSessionSet("wesee-loaded", "true");
            completeOnce();
          }, 600));
        }, 200));
      }
    }, DURATION / STEPS);

    return () => {
      clearInterval(id);
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "var(--paper, #F7F8FA)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1)",
      pointerEvents: fadeOut ? "none" : "auto",
      overflow: "hidden",
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: "absolute",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        animation: "blob1 14s ease-in-out infinite",
      }} />

      {/* Top-left label */}
      <div style={{ position: "absolute", top: 28, left: 36 }}>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(17,19,23,0.25)" }}>
          Loading
        </span>
      </div>

      {/* Progress percentage — top right */}
      <div style={{
        position: "absolute", top: 24, right: 36,
        fontSize: 12, fontWeight: 500, color: "rgba(17,19,23,0.20)",
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
        opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease",
      }}>
        {String(progress).padStart(2, "0")}
      </div>

      {/* Wordmark */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            fontSize: "clamp(48px, 9vw, 88px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "var(--ink, #111317)",
            lineHeight: 1,
            transform: phase >= 1 ? "translateY(0)" : "translateY(110%)",
            opacity: phase >= 1 ? 1 : 0,
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease",
          }}>
            WeSee<span style={{ color: "var(--accent, #C9A84C)", fontWeight: 700 }}>.</span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            fontSize: "clamp(11px, 1.5vw, 13px)",
            fontWeight: 400,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(17,19,23,0.35)",
            transform: phase >= 3 ? "translateY(0)" : "translateY(100%)",
            opacity: phase >= 3 ? 1 : 0,
            transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.08s, opacity 0.6s ease 0.08s",
          }}>
            AI Automation Agency
          </div>
        </div>
      </div>

      {/* Progress bar — bottom edge */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 2,
        background: "rgba(17,19,23,0.06)",
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, rgba(201,168,76,0.5) 0%, rgba(201,168,76,1) 100%)",
          transition: "width 0.04s linear",
        }} />
      </div>

      {/* Bottom labels */}
      <div style={{
        position: "absolute", bottom: 20, left: 36, right: 36,
        display: "flex", justifyContent: "space-between",
        opacity: phase >= 2 ? 1 : 0,
        transition: "opacity 0.5s ease 0.3s",
      }}>
        <span style={{ fontSize: 11, color: "rgba(17,19,23,0.18)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          WeSee — {new Date().getFullYear()}
        </span>
        <span style={{ fontSize: 11, color: "rgba(17,19,23,0.18)", letterSpacing: "0.1em" }}>
          Loading assets
        </span>
      </div>
    </div>
  );
}
