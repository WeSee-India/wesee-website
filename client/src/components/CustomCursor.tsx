import { useEffect, useRef } from "react";
import { useFinePointer } from "@/hooks/useFinePointer";

interface CursorState {
  x: number;
  y: number;
  ringX: number;
  ringY: number;
  scale: number;
  hover: boolean;
  text: string;
  dark: boolean;
}

export default function CustomCursor() {
  const finePointer = useFinePointer();
  const dotRef = useRef<HTMLDivElement>(null);
  const state = useRef<CursorState>({
    x: -200, y: -200, ringX: -200, ringY: -200,
    scale: 1, hover: false, text: "", dark: false,
  });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!finePointer) return;

    const pointer = { x: -200, y: -200 };

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      const el = e.target as HTMLElement;

      // Detect dark sections for dot color
      const isDark = el.closest("[data-dark-section]") !== null ||
        el.closest("footer, [style*='background: var(--ink)'], [style*='background:var(--ink)']") !== null;

      state.current.dark = isDark;
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    const animate = () => {
      const s = state.current;
      s.x = pointer.x;
      s.y = pointer.y;

      const dot = dotRef.current;
      if (!dot) { rafRef.current = requestAnimationFrame(animate); return; }

      // Dot
      dot.style.left = `${s.x}px`;
      dot.style.top = `${s.y}px`;
      dot.style.background = s.dark ? "#ffffff" : "rgba(201,168,76) ";

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  return (
    <>
      <div ref={dotRef} style={{
        position: "fixed",
        width: 10, height: 10,
        borderRadius: "50%",
        background: "rgba(201,168,76) ",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        zIndex: 99999,
        mixBlendMode: "normal",
        transition: "background 0.3s ease",
      }} />
    </>
  );
}
