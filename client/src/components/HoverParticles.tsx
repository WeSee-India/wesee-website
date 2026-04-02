import { useEffect, useRef, useState } from "react";

interface HoverParticlesProps {
  className?: string;
}

export default function HoverParticles({ className = "" }: HoverParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const touchTimeoutRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = parent.clientWidth + "px";
      canvas.style.height = parent.clientHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const spawnParticle = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0,
        targetOpacity: 0.15 + Math.random() * 0.2,
        life: 0,
        maxLife: 150 + Math.random() * 200,
      };
    };

    const parent = canvas.parentElement?.parentElement;
    if (!parent) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onTouchStart = () => {
      setIsHovered(true);
      if (touchTimeoutRef.current) window.clearTimeout(touchTimeoutRef.current);
      // Keep the hover animation visible briefly after tap on touch devices.
      touchTimeoutRef.current = window.setTimeout(() => setIsHovered(false), 1400);
    };
    const onTouchEnd = () => {
      if (touchTimeoutRef.current) window.clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = window.setTimeout(() => setIsHovered(false), 800);
    };

    parent.addEventListener("mousemove", onMouseMove, { passive: true });

    if (isHovered) {
      particlesRef.current = Array.from({ length: 40 }, () => spawnParticle());
    }

    const animate = () => {
      if (!isHovered) {
        particlesRef.current = [];
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      const ps = particlesRef.current;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            const alpha = (1 - dist / 80) * 0.08;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(201,168,76,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.map((p) => {
        p.life++;

        // Mouse repulsion
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (1 - dist / 100) * 0.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Dampen
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Opacity fade in/out
        const lifeRatio = p.life < 30 ? p.life / 30 : p.life > p.maxLife - 30 ? (p.maxLife - p.life) / 30 : 1;
        p.opacity = p.targetOpacity * lifeRatio;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.opacity.toFixed(3)})`;
        ctx.fill();

        // Respawn if dead
        if (p.life > p.maxLife) return spawnParticle();
        return p;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    if (isHovered) {
      animRef.current = requestAnimationFrame(animate);
    }

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);
    parent.addEventListener("touchstart", onTouchStart, { passive: true });
    parent.addEventListener("touchend", onTouchEnd, { passive: true });
    parent.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(animRef.current);
      if (touchTimeoutRef.current) window.clearTimeout(touchTimeoutRef.current);
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", onMouseMove);
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      parent.removeEventListener("touchstart", onTouchStart);
      parent.removeEventListener("touchend", onTouchEnd);
      parent.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isHovered]);

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          borderRadius: "inherit",
        }}
      />
    </div>
  );
}

