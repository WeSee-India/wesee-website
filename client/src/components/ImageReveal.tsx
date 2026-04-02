import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ImageRevealProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
  parallax?: boolean;
  parallaxAmount?: number;
  zoom?: boolean;
  /**
   * When true, the reveal is tied to scroll position (scrub)
   * so it opens as you scroll down and closes again as you scroll up.
   */
  loopOnScroll?: boolean;
}

/**
 * ImageReveal — Images that reveal with a clip-path wipe animation on scroll.
 * Optional parallax effect and hover zoom.
 * Inspired by CLOU Architects and Antigravity Google.
 */
export default function ImageReveal({
  src,
  alt = "",
  style,
  className = "",
  direction = "up",
  delay = 0,
  duration = 1.2,
  parallax = false,
  parallaxAmount = 60,
  zoom = true,
  loopOnScroll = false,
}: ImageRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !imgRef.current) return;

    const wrap = wrapRef.current;
    const img = imgRef.current;
    const overlay = overlayRef.current;

    const clipStart: Record<string, string> = {
      left: "inset(0 100% 0 0)",
      right: "inset(0 0 0 100%)",
      up: "inset(100% 0 0 0)",
      down: "inset(0 0 100% 0)",
    };

    let triggers: ScrollTrigger[] = [];

    if (loopOnScroll && overlay) {
      // Scroll-linked dark overlay that slides away to reveal the image.
      gsap.set(overlay, { xPercent: 0 });
      const tl = gsap.timeline({
        delay,
        scrollTrigger: {
          trigger: wrap,
          start: "top 85%",
          end: "bottom 20%",
          scrub: true,
        },
      });

      // Slide overlay based on direction; default is left wipe.
      const toConfig: gsap.TweenVars = { duration, ease: "power3.inOut" };
      if (direction === "left") {
        toConfig.xPercent = -105;
      } else if (direction === "right") {
        toConfig.xPercent = 105;
      } else if (direction === "up") {
        toConfig.yPercent = -105;
      } else if (direction === "down") {
        toConfig.yPercent = 105;
      }

      tl.to(overlay, toConfig);

      tl.fromTo(
        img,
        { scale: 1.05 },
        { scale: 1, duration: duration + 0.4, ease: "power2.out" },
        0
      );

      if (tl.scrollTrigger) {
        triggers.push(tl.scrollTrigger);
      }
    } else {
      // One-time reveal on first scroll into view using clip-path.
      gsap.set(wrap, { clipPath: clipStart[direction] });
      gsap.set(img, { scale: 1.3 });

      const revealTrigger = ScrollTrigger.create({
        trigger: wrap,
        start: "top 85%",
        onEnter: () => {
          gsap.to(wrap, {
            clipPath: "inset(0 0 0 0)",
            duration,
            ease: "power3.inOut",
          });
          gsap.to(img, {
            scale: 1,
            duration: duration + 0.4,
            ease: "power2.out",
          });
        },
      });

      triggers.push(revealTrigger);
    }

    // Parallax
    if (parallax) {
      const parallaxTrigger = ScrollTrigger.create({
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          gsap.to(img, {
            y: -parallaxAmount * self.progress,
            overwrite: "auto",
            ease: "none",
          });
        },
      });
      triggers.push(parallaxTrigger);
    }

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [direction, delay, duration, parallax, parallaxAmount, loopOnScroll]);

  return (
    <div
      ref={wrapRef}
      className={`overflow-hidden ${zoom ? "img-hover-zoom" : ""} ${className}`}
      style={{ ...style, position: "relative", willChange: "clip-path" }}
    >
      {/* Dark overlay layer that can slide away on scroll when loopOnScroll is true */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "#14171b",
          mixBlendMode: "normal",
          zIndex: 2,
          borderRadius: style?.borderRadius,
          pointerEvents: "none",
          opacity: loopOnScroll ? 1 : 0,
        }}
      />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          willChange: "transform",
          position: "relative",
          zIndex: 1,
        }}
        loading="lazy"
      />
    </div>
  );
}
