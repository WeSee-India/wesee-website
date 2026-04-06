import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
  /** "words" splits by word, "lines" splits by line */
  splitBy?: "words" | "chars";
  /** If true, animation triggers on scroll. If false, plays immediately */
  onScroll?: boolean;
}

/**
 * TextReveal — Splits text into words/chars and animates them in
 * with a staggered slide-up + fade effect.
 * Inspired by Antigravity Google's text entrance animations.
 */
export default function TextReveal({
  children,
  as: Tag = "h2",
  className = "",
  style,
  delay = 0,
  stagger = 0.04,
  splitBy = "words",
  onScroll = true,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const text = el.textContent || "";

    // Split text
    const units = splitBy === "words" ? text.split(/\s+/) : text.split("");

    // Build HTML with spans
    // Use padding on the overflow-hidden wrapper so ascenders, descenders (g, p, y, q, j),
    // and capital letter tops are not clipped by the overflow:hidden needed for the reveal animation.
    // padding-top prevents top clipping, padding-bottom prevents descender clipping.
    // Negative margins compensate so layout spacing is unaffected.
    el.innerHTML = units
      .map(
        (unit) =>
          `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-top:0.2em;padding-bottom:0.2em;margin-top:-0.2em;margin-bottom:-0.2em"><span class="text-reveal-unit" style="display:inline-block;transform:translateY(110%);opacity:0;will-change:transform">${unit}</span></span>`
      )
      .join(splitBy === "words" ? " " : "");

    const unitEls = el.querySelectorAll(".text-reveal-unit");

    if (onScroll) {
      gsap.to(unitEls, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    } else {
      gsap.to(unitEls, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger,
        delay,
        ease: "power3.out",
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [children, delay, stagger, splitBy, onScroll]);

  return (
    <Tag
      ref={containerRef as any}
      className={className}
      style={{ ...style, overflow: "visible" }}
    >
      {children}
    </Tag>
  );
}
