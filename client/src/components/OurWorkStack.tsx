import { useLayoutEffect, useRef } from "react";
import { Link } from "wouter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleWrapper from "@/components/ParticleWrapper";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export type OurWorkStat = { display: string; label: string; sub: string };

/** Card colourways and resting tilt, in scroll order. */
const CARD_TONES = ["ow-card--sand", "ow-card--ink", "ow-card--champagne", "ow-card--ivory"];
const CARD_TILT = [-4, 3, -2.5, 4.5];

/** "We build AI that works*.*" → three lines of two, two and the rest; a trailing "." becomes the accent. */
function headingLines(heading: string) {
  const words = heading.replace(/\*/g, "").trim().split(/\s+/);
  const last = words.slice(4).join(" ") || words.slice(-1).join(" ");
  const dot = last.endsWith(".");
  return { l: words.slice(0, 2), r: words.slice(2, 4), c: dot ? last.slice(0, -1) : last, dot };
}

/**
 * "We build AI that works." — giant headline pinned in place while stat cards
 * slide up over it, tilted, and the headline blurs behind them.
 * Reduced motion: the headline and cards render as a static grid.
 *
 * The stage uses CSS `position: sticky` inside a tall track rather than a GSAP
 * pin: #page-content keeps a transform from its enter animation, which breaks
 * pinning (position: fixed) and left the viewport blank mid-scroll.
 */
export default function OurWorkStack({
  stats,
  heading = "We build AI that works*.*",
  body = "AI agents and automated pipelines for sales, customer engagement and day-to-day operations, each one built around a single business outcome.",
  cta = { href: "/services", label: "Explore our services" },
}: {
  stats: OurWorkStat[];
  heading?: string;
  body?: string;
  cta?: { href: string; label: string } | null;
}) {
  const lines = headingLines(heading);
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useLayoutEffect(() => {
    if (reduced || !trackRef.current) return;
    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
      const mid = (cards.length - 1) / 2;

      cards.forEach((card, i) => {
        gsap.set(card, { y: () => window.innerHeight * 0.75 + card.offsetHeight, rotation: CARD_TILT[i] * 3 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      tl.to(bgRef.current, { filter: "blur(14px)", opacity: 0.32, duration: 1 }, 0);

      cards.forEach((card, i) => {
        tl.to(card, {
          y: (i - mid) * 14,
          rotation: CARD_TILT[i],
          duration: 1,
          ease: "power2.out",
        }, i);
        // Earlier cards settle back as the next one lands on top.
        if (i > 0) {
          tl.to(cards.slice(0, i), { scale: "-=0.035", duration: 1 }, i);
        }
      });

      tl.to({}, { duration: 0.3 });
    }, trackRef);

    return () => ctx.revert();
  }, [reduced, stats.length]);

  return (
    <section className={`ow${reduced ? " ow--static" : ""}`} aria-labelledby="ow-title">
      <div ref={trackRef} className="ow-track" style={reduced ? undefined : { height: `${100 + stats.length * 85 + 30}vh` }}>
      <div ref={stageRef} className="ow-stage">
        <h2 ref={bgRef} id="ow-title" className="ow-bg">
          <span className="ow-bg-line ow-bg-line--l">{lines.l.map((w, i) => <span key={i}>{i > 0 && " "}{w}</span>)}</span>
          <span className="ow-bg-line ow-bg-line--r">{lines.r.map((w, i) => <span key={i}>{i > 0 && " "}{w}</span>)}</span>
          <span className="ow-bg-line ow-bg-line--c">{lines.c}{lines.dot && <em>.</em>}</span>
        </h2>

        <div className="ow-cards">
          {stats.map((s, i) => (
            <article
              key={s.label}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`ow-card ${CARD_TONES[i % CARD_TONES.length]}`}
              style={{ zIndex: i + 1 }}
            >
              <div>
                <h3 className="ow-card-title">{s.label}</h3>
                <p className="ow-card-sub">{s.sub}</p>
              </div>
              <div className="ow-card-foot">
                <span className="ow-card-index">N° {String(i + 1).padStart(2, "0")}</span>
                <span className="ow-card-num">{s.display}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      </div>

      <div className="container ow-outro">
        {body && <p>{body}</p>}
        {cta?.label && (
          <ParticleWrapper>
            <Link href={cta.href || "/services"} className="ow-cta">
              {cta.label.replace(/\s*[→↗]\s*$/, "")} <span aria-hidden="true">→</span>
            </Link>
          </ParticleWrapper>
        )}
      </div>
    </section>
  );
}
