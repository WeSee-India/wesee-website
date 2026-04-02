import { useEffect, useState } from "react";

const COARSE_TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

/** Touch-capable hardware (phones, tablets, most touch laptops). */
function hasTouchCapability(): boolean {
  return (typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0) > 0;
}

/**
 * True when we should use the custom cursor + cursor:none UX.
 * Touch devices are excluded even if some browsers mis-report hover/pointer media queries.
 */
function computeFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  if (hasTouchCapability()) return false;
  return !window.matchMedia(COARSE_TOUCH_QUERY).matches;
}

export function useFinePointer(): boolean {
  const [fine, setFine] = useState(() =>
    typeof window !== "undefined" ? computeFinePointer() : false
  );

  useEffect(() => {
    const mql = window.matchMedia(COARSE_TOUCH_QUERY);
    const sync = () => setFine(computeFinePointer());
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return fine;
}
