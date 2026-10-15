import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  maxSize?: number;
  speed?: number;
  className?: string;
}

/**
 * FloatingParticles — Subtle floating dots/particles in the background.
 * Inspired by Antigravity Google's canvas particle effects.
 * Uses canvas for GPU-accelerated rendering.
 */
export default function FloatingParticles({
  count = 50,
  color = "rgba(26, 26, 26, 0.06)",
  maxSize = 3,
  speed = 0.3,
  className = "",
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    // Particles
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * maxSize + 0.5,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const reduced = prefersReducedMotion();
    let visible = true;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
        }

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      // Reduced motion: paint one still frame. Otherwise only animate while on screen.
      if (!reduced && visible) raf.current = requestAnimationFrame(animate);
    };

    animate();

    const observer = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible && !reduced) raf.current = requestAnimationFrame(animate);
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, color, maxSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
