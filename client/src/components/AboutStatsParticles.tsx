import { useEffect, useMemo, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
};

export default function AboutStatsParticles({
  className,
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number; inside: boolean }>({
    x: -9999,
    y: -9999,
    inside: false,
  });

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    const particles: Particle[] = [];
    const baseCount = 60; // lightweight
    const maxSpeed = 0.18;
    const attractRadius = 220;
    const attractStrength = 0.028;
    const returnStrength = 0.012;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-seed particles on resize for consistent distribution.
      particles.length = 0;
      const count = Math.round(baseCount * Math.sqrt((w * h) / (900 * 520)));
      for (let i = 0; i < Math.min(110, Math.max(45, count)); i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        particles.push({
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() * 2 - 1) * maxSpeed,
          vy: (Math.random() * 2 - 1) * maxSpeed,
          r: 1 + Math.random() * 2,
          a: 0.12 + Math.random() * 0.16,
        });
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
      pointerRef.current.inside = true;
    };
    const onLeave = () => {
      pointerRef.current.inside = false;
    };

    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseleave", onLeave, { passive: true });

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const p = pointerRef.current;

      for (const dot of particles) {
        // Base drift
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < -20) dot.x = w + 20;
        if (dot.x > w + 20) dot.x = -20;
        if (dot.y < -20) dot.y = h + 20;
        if (dot.y > h + 20) dot.y = -20;

        // Cursor attraction (subtle) + return to original offset
        const dx0 = dot.ox - dot.x;
        const dy0 = dot.oy - dot.y;
        dot.x += dx0 * returnStrength;
        dot.y += dy0 * returnStrength;

        if (p.inside) {
          const dx = p.x - dot.x;
          const dy = p.y - dot.y;
          const dist = Math.hypot(dx, dy);
          if (dist < attractRadius) {
            const f = (1 - dist / attractRadius) * attractStrength;
            dot.x += dx * f;
            dot.y += dy * f;
          }
        }

        // Glow dot
        ctx.beginPath();
        ctx.fillStyle = `rgba(232, 200, 112, ${dot.a})`;
        ctx.shadowColor = "rgba(201,168,76,0.35)";
        ctx.shadowBlur = 8;
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset shadow to avoid affecting other paints
      ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: 0.9,
        }}
      />
    </div>
  );
}

