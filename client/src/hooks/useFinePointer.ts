import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

const COARSE_TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

/** Touch-capable hardware (phones, tablets, most touch laptops). */
function hasTouchCapability(): boolean {
  return (typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0) > 0;
}

/**
 * True when we should use the custom cursor + cursor:none UX.
 * Touch devices are excluded even if some browsers mis-report hover/pointer media queries.
 * Users who ask for reduced motion keep their native cursor.
 */
function computeFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  if (hasTouchCapability()) return false;
  return !window.matchMedia(COARSE_TOUCH_QUERY).matches;
}

export function useFinePointer(): boolean {
  const [fine, setFine] = useState(() =>
    typeof window !== "undefined" ? computeFinePointer() : false
  );

  useEffect(() => {
    const queries = [window.matchMedia(COARSE_TOUCH_QUERY), window.matchMedia("(prefers-reduced-motion: reduce)")];
    const sync = () => setFine(computeFinePointer());
    sync();
    queries.forEach((q) => q.addEventListener("change", sync));
    return () => queries.forEach((q) => q.removeEventListener("change", sync));
  }, []);

  return fine;
}
