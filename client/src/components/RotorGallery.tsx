/*
 * RotorGallery — 3D Rotating Ring Gallery
 *
 * DESKTOP HOVER FIX (v7 — DOM getBoundingClientRect):
 *  - Replaced all mat4 projection math in updateClosestCardDesktop with
 *    getBoundingClientRect() on each card's inner face div.
 *  - The browser already knows exactly where every card is on screen after
 *    CSS 3D transforms. We just read each rect's center and find the closest
 *    one to the cursor. Zero matrix math, zero offset errors, pixel-perfect.
 *  - RotorItem accepts an `innerRef` callback prop that writes into the
 *    parent's cardInnerRefs array so every card's DOM node is always tracked.
 *  - Cards that are edge-on (width < 2px or height < 2px) are skipped —
 *    they're visually invisible and shouldn't steal hover.
 *
 * MOBILE: pan-y + vertical-move bail-out so the page can scroll to content below the ring.
 */
import { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect } from "react";
import { useLocation } from "wouter";
import { useFinePointer } from "@/hooks/useFinePointer";

interface RingItem {
  title: string;
  image: string;
  url: string;
  category: string;
  categoryId: number;
  shortDescription?: string;
}

interface CategoryLabel {
  name: string;
  count: number;
  angle: number;
}

interface RotorGalleryProps {
  items: RingItem[];
  count?: number;
  cardWidth?: number;
  cardHeight?: number;
  borderRadius?: number;
  speedSec?: number;
  perspective?: number;
  camX?: number;
  camY?: number;
  camZ?: number;
  offsetX?: number;
  offsetY?: number;
  gapPx?: number;
  rotateCardDeg?: number;
  cardRotXDeg?: number;
  cardRotYDeg?: number;
  cardRotZDeg?: number;
  categoryLabels?: CategoryLabel[];
  onItemClick?: (item: RingItem) => void;
  /** When true, no category/title gradient overlay on ring cards (e.g. filtered list). */
  hideRingCardOverlay?: boolean;
}

const MAX_SAFE_COUNT = 90;

/** Mobile drag: degrees per horizontal pixel (linear — easier to tune than atan2 arcs). */
const MOBILE_RING_DX_TO_DEG = 0.052;
/** Clamp each touchmove to avoid rare jumps when events are sparse. */
const MOBILE_RING_DRAG_DEG_CAP = 4.2;
/** Idle auto-rotation multiplier when viewport width < 640px (desktop unchanged). */
const MOBILE_AUTO_SPIN_SCALE = 0.38;

// ── mat4 helpers — kept only for mobile updateClosestImageMobile ──────────────
type M4 = Float64Array;
function m4id(): M4 { const m = new Float64Array(16); m[0]=m[5]=m[10]=m[15]=1; return m; }
function m4mul(a: M4, b: M4): M4 {
  const o = new Float64Array(16);
  for (let c=0;c<4;c++) for (let r=0;r<4;r++) { let s=0; for (let k=0;k<4;k++) s+=a[k*4+r]*b[c*4+k]; o[c*4+r]=s; }
  return o;
}
function m4rx(deg: number): M4 { const m=m4id(),r=(deg*Math.PI)/180,c=Math.cos(r),s=Math.sin(r); m[5]=c;m[9]=-s;m[6]=s;m[10]=c; return m; }
function m4ry(deg: number): M4 { const m=m4id(),r=(deg*Math.PI)/180,c=Math.cos(r),s=Math.sin(r); m[0]=c;m[8]=s;m[2]=-s;m[10]=c; return m; }
function m4rz(deg: number): M4 { const m=m4id(),r=(deg*Math.PI)/180,c=Math.cos(r),s=Math.sin(r); m[0]=c;m[4]=-s;m[1]=s;m[5]=c; return m; }
function m4tr(tx: number, ty: number, tz: number): M4 { const m=m4id(); m[12]=tx;m[13]=ty;m[14]=tz; return m; }
function m4pt(m: M4, x: number, y: number, z: number): [number,number,number,number] {
  return [m[0]*x+m[4]*y+m[8]*z+m[12], m[1]*x+m[5]*y+m[9]*z+m[13], m[2]*x+m[6]*y+m[10]*z+m[14], m[3]*x+m[7]*y+m[11]*z+m[15]];
}

/** Mobile-only: ring slot closest to a screen point (same projection as touch hit-test). */
function computeMobileClosestRingIndex(
  angleDeg: number,
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  p: {
    perspective: number;
    camZ: number;
    offsetY: number;
    ringGapPx: number;
    cardRotXDeg: number;
    cardRotYDeg: number;
    cardRotZDeg: number;
    rotateCardDeg: number;
    safeCount: number;
    listLen: number;
  }
): number {
  const vw = window.innerWidth;
  const pivotX = containerRect.left + containerRect.width;
  const pivotY = containerRect.top + containerRect.height * 0.95;
  const mobileOffsetX = vw * 0.4;
  const sceneMatrix = m4mul(m4mul(m4mul(m4rx(0), m4ry(90)), m4rz(p.camZ)), m4tr(mobileOffsetX, p.offsetY, 0));
  const baseCardRotX = p.cardRotXDeg + p.rotateCardDeg;
  let bestIndex = 0;
  let bestDist = Infinity;
  const n = Math.min(p.safeCount, Math.max(0, p.listLen));
  const denom = Math.max(1, p.safeCount);
  for (let i = 0; i < n; i++) {
    const itemAngle = (i / denom) * 360;
    const ringAngle = angleDeg - itemAngle;
    const cardMatrix = m4mul(m4mul(m4mul(m4mul(m4rx(ringAngle), m4tr(0, 0, p.ringGapPx)), m4rx(baseCardRotX)), m4ry(p.cardRotYDeg)), m4rz(p.cardRotZDeg));
    const fullMatrix = m4mul(sceneMatrix, cardMatrix);
    const [wx, wy, wz] = m4pt(fullMatrix, 0, 0, 0);
    const pz = p.perspective + wz;
    if (pz <= 0) continue;
    const scale = p.perspective / pz;
    const sx = pivotX + wx * scale;
    const sy = pivotY + wy * scale;
    const dist = Math.sqrt((clientX - sx) ** 2 + (clientY - sy) ** 2);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  return bestIndex;
}
// ─────────────────────────────────────────────────────────────────────────────

// RotorItem accepts a setInnerRef callback to wire the inner face div into the parent's ref array
function RotorItem({
  item,
  index,
  total,
  borderRadius,
  cardWidth,
  cardHeight,
  gapPx,
  zOffsetPx,
  baseCardRotX,
  baseCardRotY,
  baseCardRotZ,
  cardOpacity,
  isHovered,
  finePointer,
  setInnerRef,
  hideRingCardOverlay,
}: {
  item: RingItem;
  index: number;
  total: number;
  borderRadius: number;
  cardWidth: number;
  cardHeight: number;
  gapPx: number;
  zOffsetPx: number;
  baseCardRotX: number;
  baseCardRotY: number;
  baseCardRotZ: number;
  cardOpacity: number;
  isHovered: boolean;
  finePointer: boolean;
  setInnerRef?: (el: HTMLDivElement | null) => void;
  hideRingCardOverlay?: boolean;
}) {
  const itemAngle = (index / total) * 360;
  const thicknessPx = 1;
  const half = thicknessPx / 2;

  const ringTransform = `
    rotateX(calc(var(--global-rotation) - ${itemAngle}deg))
    translateZ(${gapPx + index * zOffsetPx}px)
    rotateX(${baseCardRotX}deg)
    rotateY(${baseCardRotY}deg)
    rotateZ(${baseCardRotZ}deg)
  `;

  const scale = isHovered ? 1.15 : 1;
  const opacity = isHovered ? 1 : cardOpacity;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: ringTransform,
        transformStyle: "preserve-3d",
        willChange: "transform",
        pointerEvents: "none",
        cursor: finePointer ? "none" : "grab",
      }}
    >
      {/* ref={setInnerRef} — this is the element we call getBoundingClientRect on */}
      <div
        ref={setInnerRef}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          background: "#E8E8E5",
          transform: `rotateZ(90deg) translateZ(${half}px) scale(${scale})`,
          opacity,
          overflow: "hidden",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          boxShadow: isHovered
            ? "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)"
            : "0 4px 16px rgba(0,0,0,0.10)",
        }}
      >
        <img
          src={item.image}
          alt={item.title}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
            backfaceVisibility: "hidden",
            transform: isHovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        {!hideRingCardOverlay && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "55%",
              background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function RotorGallery({
  items,
  count = 90,
  cardWidth = 100,
  cardHeight = 80,
  borderRadius = 12,
  speedSec = 31,
  perspective = 2500,
  camX = -25,
  camY = 5,
  camZ = -100,
  offsetX = 0,
  offsetY = 30,
  gapPx = 250,
  rotateCardDeg = 90,
  cardRotXDeg = 0,
  cardRotYDeg = 0,
  cardRotZDeg = 0,
  categoryLabels = [],
  onItemClick,
  hideRingCardOverlay = false,
}: RotorGalleryProps) {
  const finePointer = useFinePointer();
  const safeCount = Math.min(MAX_SAFE_COUNT, count);
  const sceneRef = useRef<HTMLDivElement>(null);
  const revealSceneRef = useRef<HTMLDivElement>(null);
  const revealLayerRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);

  // ── Per-card inner face DOM refs for getBoundingClientRect hit-testing ───────
  const cardInnerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const labelElemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelSizeRefs = useRef<{ halfW: number; halfH: number }[]>([]);
  const labelCenterRef = useRef({ x: 0, y: 0 });

  const activeCardIndexRef = useRef<number>(-1);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(-1);
  const [isRevealVisible, setIsRevealVisible] = useState<boolean>(false);

  const previewLockedRef = useRef(false);
  const [previewLocked, setPreviewLocked] = useState(false);

  /** Mobile: front slot facing the hero reveal (updated from ring angle each frame). */
  const mobileFrontIndexRafRef = useRef(0);
  const [mobileFrontIndex, setMobileFrontIndex] = useState(0);
  const mobileProjRef = useRef({
    perspective: 2500,
    camZ: -100,
    offsetY: 30,
    ringGapPx: 200,
    cardRotXDeg: 0,
    cardRotYDeg: 0,
    cardRotZDeg: 0,
    rotateCardDeg: 90,
    safeCount: 0,
    listLen: 0,
  });

  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [, navigate] = useLocation();

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0, time: 0 });
  const velocityRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetAngleRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const lastMouseUpdateRef = useRef(0);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const isHoveringRef = useRef(false);
  const touchStartedOnRingRef = useRef(false);

  const isMobile = dimensions.w < 640;
  const list = useMemo(() => items.slice(0, safeCount), [items, safeCount]);

  const itemsKey = useMemo(() => items.map((it) => it.url).join("|"), [items]);

  const desktopFitScale = useMemo(() => {
    if (isMobile) return 1;
    const vw = dimensions.w || window.innerWidth;
    const vh = dimensions.h || window.innerHeight;
    const widthScale = vw / 1536;
    const heightScale = vh / 864;
    return Math.max(0.72, Math.min(1, Math.min(widthScale, heightScale)));
  }, [isMobile, dimensions.w, dimensions.h]);

  const desktopRadiusScale = useMemo(() => {
    if (isMobile) return 1;
    const vw = dimensions.w || window.innerWidth;
    const vh = dimensions.h || window.innerHeight;
    const widthScale = vw / 1536;
    const heightScale = vh / 864;
    const viewportScale = Math.min(widthScale, heightScale);
    return Math.max(0.72, Math.min(1, 0.86 + (viewportScale - 0.72) * 0.38));
  }, [isMobile, dimensions.w, dimensions.h]);

  const LABEL_OFFSET_X_PX = 50;
  const LABEL_OFFSET_Y_PX = 6;
  const effectiveCardWidth = isMobile ? cardWidth * 0.6 : cardWidth * desktopFitScale;
  const effectiveCardHeight = isMobile ? cardHeight * 0.6 : cardHeight * desktopFitScale;
  const effectiveGapPx = isMobile ? gapPx * 0.45 : gapPx * desktopFitScale * desktopRadiusScale;

  const ringRadius = useMemo(() => {
    if (categoryLabels.length === 0 || isMobile) return 0;
    const cardDiagonal = Math.sqrt(effectiveCardWidth ** 2 + effectiveCardHeight ** 2);
    const maxCardScale = 1.15;
    return effectiveGapPx + (cardDiagonal * maxCardScale) / 2;
  }, [categoryLabels.length, isMobile, effectiveCardWidth, effectiveCardHeight, effectiveGapPx]);

  useEffect(() => {
    const update = () => {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
      labelCenterRef.current = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (isMobile || categoryLabels.length === 0) return;
    const updateLabelSizes = () => {
      labelSizeRefs.current = categoryLabels.map((_, i) => {
        const el = labelElemRefs.current[i];
        if (!el) return { halfW: 110, halfH: 18 };
        const rect = el.getBoundingClientRect();
        return { halfW: Math.max(80, rect.width * 0.5), halfH: Math.max(14, rect.height * 0.5) };
      });
    };
    updateLabelSizes();
    window.addEventListener("resize", updateLabelSizes, { passive: true });
    return () => window.removeEventListener("resize", updateLabelSizes);
  }, [categoryLabels, isMobile]);

  const RING_SCALE = 0.85;
  const ringGapPx = effectiveGapPx * RING_SCALE;
  const sceneCardWidth = effectiveCardWidth;
  const sceneCardHeight = effectiveCardHeight;
  const revealImageWidth = isMobile ? sceneCardWidth * 3.8 : sceneCardWidth * 2.5;
  const revealImageHeight = isMobile ? sceneCardHeight * 2.6 : sceneCardHeight * 1.6;
  const revealImageTopVh = isMobile ? 0.35 : 0.45;

  useLayoutEffect(() => {
    mobileProjRef.current = {
      perspective,
      camZ,
      offsetY,
      ringGapPx,
      cardRotXDeg,
      cardRotYDeg,
      cardRotZDeg,
      rotateCardDeg,
      safeCount,
      listLen: list.length,
    };
  }, [
    perspective,
    camZ,
    offsetY,
    ringGapPx,
    cardRotXDeg,
    cardRotYDeg,
    cardRotZDeg,
    rotateCardDeg,
    safeCount,
    list.length,
  ]);

  useEffect(() => {
    mobileFrontIndexRafRef.current = 0;
    setMobileFrontIndex(0);
  }, [itemsKey]);

  useEffect(() => {
    setMobileFrontIndex((i) => (list.length === 0 ? 0 : Math.min(i, list.length - 1)));
  }, [list.length]);

  // ── Main animation loop ───────────────────────────────────────────────────
  useEffect(() => {
    let last = performance.now();
    const speed = 360 / (speedSec * 1000);
    let raf: number;
    const camXRads = (camX * Math.PI) / 180;
    const baseEllipseRatio = Math.cos(camXRads);
    const finalEllipseRatio = Math.max(0.55, Math.min(0.75, baseEllipseRatio * 0.75));
    const labelRadiusX = ringRadius + LABEL_OFFSET_X_PX;
    const labelRadiusY = ringRadius + LABEL_OFFSET_Y_PX;
    const baseAngles = categoryLabels.map((l) => l.angle);
    const labelCount = categoryLabels.length;

    const tick = (t: number) => {
      const dt = Math.min(t - last, 16.67);
      last = t;

      if (!isDraggingRef.current && !isHoveringRef.current && targetAngleRef.current === null) {
        const spinMul = window.innerWidth < 640 ? MOBILE_AUTO_SPIN_SCALE : 1;
        angleRef.current += speed * dt * spinMul;
      }
      if (Math.abs(velocityRef.current) > 0.01 && targetAngleRef.current === null && !isHoveringRef.current) {
        angleRef.current += velocityRef.current * dt;
        velocityRef.current *= 0.95;
      } else if (isHoveringRef.current) {
        velocityRef.current = 0;
      }
      if (targetAngleRef.current !== null) {
        angleRef.current += (targetAngleRef.current - angleRef.current) * 0.08;
        if (Math.abs(targetAngleRef.current - angleRef.current) < 0.1) {
          angleRef.current = targetAngleRef.current;
        }
      }

      const rotVal = `${angleRef.current}deg`;
      if (sceneRef.current) sceneRef.current.style.setProperty("--global-rotation", rotVal);

      // Mobile: keep hero preview in sync with ring rotation / auto-spin / drag (no desktop change).
      const vw = window.innerWidth;
      if (vw < 640 && mobileProjRef.current.listLen > 0) {
        const cont = containerRef.current;
        if (cont) {
          const rect = cont.getBoundingClientRect();
          const cx = vw * 0.5;
          const cy = window.innerHeight * 0.35;
          const idx = computeMobileClosestRingIndex(angleRef.current, cx, cy, rect, mobileProjRef.current);
          if (idx !== mobileFrontIndexRafRef.current) {
            mobileFrontIndexRafRef.current = idx;
            setMobileFrontIndex(idx);
          }
        }
      }

      if (labelCount > 0 && !isMobile && ringRadius > 0) {
        const rotationRad = (angleRef.current * Math.PI) / 180;
        const cx = labelCenterRef.current.x;
        const cy = labelCenterRef.current.y;
        const pad = 10;
        const maxX = window.innerWidth - pad;
        const maxY = window.innerHeight - pad;
        for (let i = 0; i < labelCount; i++) {
          const el = labelElemRefs.current[i];
          if (!el) continue;
          const totalAngle = baseAngles[i] + rotationRad;
          const rawX = cx + Math.cos(totalAngle) * labelRadiusX + offsetX;
          const rawY = cy + Math.sin(totalAngle) * labelRadiusY * finalEllipseRatio + offsetY;
          const size = labelSizeRefs.current[i] || { halfW: 110, halfH: 18 };
          const tx = Math.min(maxX - size.halfW, Math.max(pad + size.halfW, rawX));
          const ty = Math.min(maxY - size.halfH, Math.max(pad + size.halfH, rawY));
          el.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speedSec, categoryLabels, isMobile, ringRadius, offsetX, offsetY, camX]);

  const handleItemClick = useCallback(
    (item: RingItem) => {
      if (hasDraggedRef.current) return;
      if (onItemClick) { onItemClick(item); } else if (item.url) { navigate(item.url); }
    },
    [onItemClick, navigate]
  );

  // ── Desktop hover — getBoundingClientRect on each card's inner div (v7) ──────
  //
  // Why this works perfectly:
  //   The browser computes each card's final screen position after all CSS 3D
  //   transforms (camX, camZ, rotateX ring, rotateZ card, perspective, etc).
  //   getBoundingClientRect() returns THAT result directly. We just find whose
  //   center is closest to the cursor. No matrix math needed, no offset drift.
  //
  // Hit threshold: half the card diagonal (~65%). Cards rotated edge-on have
  //   near-zero rect size so they're naturally skipped (width < 2px guard).
  // ─────────────────────────────────────────────────────────────────────────────
  const updateClosestCardDesktop = useCallback(
    (clientX: number, clientY: number): boolean => {
      if (isMobile) return false;

      const hitThreshold = Math.sqrt(sceneCardWidth ** 2 + sceneCardHeight ** 2) * 0.65;

      let bestIndex = -1;
      let bestDist  = Infinity;

      for (let i = 0; i < list.length; i++) {
        const el = cardInnerRefs.current[i];
        if (!el) continue;

        const r = el.getBoundingClientRect();

        // Card is edge-on and essentially invisible — skip it
        if (r.width < 2 || r.height < 2) continue;

        const cx = r.left + r.width  * 0.5;
        const cy = r.top  + r.height * 0.5;
        const dist = Math.sqrt((clientX - cx) ** 2 + (clientY - cy) ** 2);

        if (dist < bestDist) {
          bestDist  = dist;
          bestIndex = i;
        }
      }

      if (bestIndex < 0 || bestDist > hitThreshold) {
        if (activeCardIndexRef.current >= 0) {
          activeCardIndexRef.current = -1;
          setActiveCardIndex(-1);
          setIsRevealVisible(false);
          isHoveringRef.current = false;
        }
        return false;
      }

      if (bestIndex !== activeCardIndexRef.current) {
        activeCardIndexRef.current = bestIndex;
        setActiveCardIndex(bestIndex);
      }
      return true;
    },
    [list.length, sceneCardWidth, sceneCardHeight, isMobile]
  );
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleStart = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      setIsDragging(true);
      velocityRef.current = 0;
      targetAngleRef.current = null;
      lastPosRef.current = { x: clientX, y: clientY, time: performance.now() };
      dragStartPosRef.current = { x: clientX, y: clientY };
      hasDraggedRef.current = false;
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const now = performance.now();
      const dt = Math.max(now - lastPosRef.current.time, 1);
      const rect = container.getBoundingClientRect();
      let rotationDelta: number;
      if (isMobile) {
        const dx = clientX - lastPosRef.current.x;
        rotationDelta = dx * MOBILE_RING_DX_TO_DEG;
        rotationDelta = Math.max(-MOBILE_RING_DRAG_DEG_CAP, Math.min(MOBILE_RING_DRAG_DEG_CAP, rotationDelta));
      } else {
        const refX = rect.left + rect.width / 2;
        const refY = rect.top + rect.height / 2;
        const currentAngle = Math.atan2(clientY - refY, clientX - refX);
        const prevAngle = Math.atan2(lastPosRef.current.y - refY, lastPosRef.current.x - refX);
        let angleDelta = currentAngle - prevAngle;
        if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
        if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;
        rotationDelta = angleDelta * (180 / Math.PI);
      }
      angleRef.current += rotationDelta;
      targetAngleRef.current = null;
      velocityRef.current = rotationDelta / (dt / 1000);
      if (dragStartPosRef.current) {
        const totalDx = clientX - dragStartPosRef.current.x;
        const totalDy = clientY - dragStartPosRef.current.y;
        if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > 5) hasDraggedRef.current = true;
      }
      lastPosRef.current = { x: clientX, y: clientY, time: now };
      if (sceneRef.current) sceneRef.current.style.setProperty("--global-rotation", `${angleRef.current}deg`);
      if (revealSceneRef.current) revealSceneRef.current.style.setProperty("--global-rotation", `${angleRef.current}deg`);
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      velocityRef.current = 0;
      targetAngleRef.current = null;
      if (hasDraggedRef.current) {
        setTimeout(() => { hasDraggedRef.current = false; dragStartPosRef.current = null; }, 100);
      } else {
        dragStartPosRef.current = null;
      }
    };

    // ── Mobile: closest card on ring (projection hit test) ───────────────────
    const updateClosestImageMobile = (clientX: number, clientY: number): boolean => {
      if (!isMobile) return false;
      const now = performance.now();
      if (now - lastMouseUpdateRef.current < 16) return activeCardIndexRef.current >= 0;
      lastMouseUpdateRef.current = now;
      const rect = container.getBoundingClientRect();
      const vw = dimensions.w || window.innerWidth;
      const pivotX = rect.left + rect.width;
      const pivotY = rect.top  + rect.height * 0.95;
      const mobileOffsetX = vw * 0.4;
      const sceneMatrix = m4mul(m4mul(m4mul(m4rx(0), m4ry(90)), m4rz(camZ)), m4tr(mobileOffsetX, offsetY, 0));
      const baseCardRotX = cardRotXDeg + rotateCardDeg;
      const HIT_RADIUS_PX = Math.max(sceneCardWidth, sceneCardHeight) * 1.1;
      let bestIndex = -1;
      let bestDist  = Infinity;
      for (let i = 0; i < safeCount; i++) {
        const itemAngle = (i / safeCount) * 360;
        const ringAngle = angleRef.current - itemAngle;
        const cardMatrix = m4mul(m4mul(m4mul(m4mul(m4rx(ringAngle), m4tr(0, 0, ringGapPx)), m4rx(baseCardRotX)), m4ry(cardRotYDeg)), m4rz(cardRotZDeg));
        const fullMatrix = m4mul(sceneMatrix, cardMatrix);
        const [wx, wy, wz] = m4pt(fullMatrix, 0, 0, 0);
        const pz = perspective + wz;
        if (pz <= 0) continue;
        const scale = perspective / pz;
        const sx = pivotX + wx * scale;
        const sy = pivotY + wy * scale;
        const dist = Math.sqrt((clientX - sx) ** 2 + (clientY - sy) ** 2);
        if (dist < bestDist) { bestDist = dist; bestIndex = i; }
      }
      if (bestIndex < 0 || bestDist > HIT_RADIUS_PX) {
        if (!previewLockedRef.current && activeCardIndexRef.current >= 0) {
          activeCardIndexRef.current = -1; setActiveCardIndex(-1); setIsRevealVisible(false); isHoveringRef.current = false;
        }
        return false;
      }
      mousePosRef.current = { x: clientX, y: clientY };
      if (activeCardIndexRef.current !== bestIndex) { activeCardIndexRef.current = bestIndex; setActiveCardIndex(bestIndex); }
      return true;
    };
    // ── end mobile hit test ────────────────────────────────────────────────────

    const isTouchOnPreview = (clientX: number, clientY: number): boolean => {
      const vw = window.innerWidth; const vh = window.innerHeight; const centerX = vw * 0.5; const centerY = vh * revealImageTopVh;
      return clientX >= centerX - revealImageWidth / 2 && clientX <= centerX + revealImageWidth / 2 && clientY >= centerY - revealImageHeight / 2 && clientY <= centerY + revealImageHeight / 2;
    };
    const isTouchOnCategoryLabel = (clientX: number, clientY: number): boolean => {
      const vw = window.innerWidth; const vh = window.innerHeight; const centerX = vw * 0.5;
      const pillTop = vh * revealImageTopVh + revealImageHeight / 2 + 20; const pillHeight = isMobile ? 44 : 52; const halfW = isMobile ? 200 : 240;
      return clientX >= centerX - halfW && clientX <= centerX + halfW && clientY >= pillTop && clientY <= pillTop + pillHeight;
    };
    const isTouchOnPreviewOrCategoryLabel = (cx: number, cy: number): boolean => isTouchOnPreview(cx, cy) || isTouchOnCategoryLabel(cx, cy);

    const onMouseDown = (e: MouseEvent) => { e.preventDefault(); handleStart(e.clientX, e.clientY); };
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) { e.preventDefault(); handleMove(e.clientX, e.clientY); return; }
      if (!isMobile) {
        const onRing = updateClosestCardDesktop(e.clientX, e.clientY);
        if (onRing) { isHoveringRef.current = true; setIsRevealVisible(true); }
        else { isHoveringRef.current = false; setIsRevealVisible(false); }
      }
    };
    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => {
      if (previewLockedRef.current) return;
      isHoveringRef.current = false; velocityRef.current = 0; mousePosRef.current = null;
      targetAngleRef.current = null; activeCardIndexRef.current = -1; setActiveCardIndex(-1); setIsRevealVisible(false);
    };
    const onContainerClick = (e: MouseEvent) => {
      if (isMobile) return; if (hasDraggedRef.current) return;
      const activeIndex = activeCardIndexRef.current;
      if (activeIndex >= 0 && activeIndex < list.length) handleItemClick(list[activeIndex]);
    };

    // ── Mobile touch handlers ──
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (previewLockedRef.current) {
        if (isTouchOnPreviewOrCategoryLabel(touch.clientX, touch.clientY)) {
          const idx = activeCardIndexRef.current;
          previewLockedRef.current = false; setPreviewLocked(false); isHoveringRef.current = false;
          activeCardIndexRef.current = -1; setActiveCardIndex(-1); setIsRevealVisible(false);
          if (idx >= 0 && idx < list.length) handleItemClick(list[idx]);
        } else {
          const nearRing = updateClosestImageMobile(touch.clientX, touch.clientY);
          touchStartedOnRingRef.current = nearRing;
          if (nearRing) { isHoveringRef.current = true; setIsRevealVisible(true); }
          else { previewLockedRef.current = false; setPreviewLocked(false); isHoveringRef.current = false; activeCardIndexRef.current = -1; setActiveCardIndex(-1); setIsRevealVisible(false); }
        }
        dragStartPosRef.current = { x: touch.clientX, y: touch.clientY }; hasDraggedRef.current = false; return;
      }
      const nearRing = updateClosestImageMobile(touch.clientX, touch.clientY);
      touchStartedOnRingRef.current = nearRing;
      if (nearRing) { isHoveringRef.current = true; setIsRevealVisible(true); }
      else { isHoveringRef.current = false; setIsRevealVisible(false); }
      dragStartPosRef.current = { x: touch.clientX, y: touch.clientY }; hasDraggedRef.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      if (isDraggingRef.current) { e.preventDefault(); handleMove(touch.clientX, touch.clientY); return; }
      if (touchStartedOnRingRef.current && dragStartPosRef.current) {
        const dx = touch.clientX - dragStartPosRef.current.x;
        const dy = touch.clientY - dragStartPosRef.current.y;
        if (Math.hypot(dx, dy) > 8) {
          // Mobile: vertical drag = page scroll (touch-action: pan-y); do not capture as ring rotation.
          if (isMobile && Math.abs(dy) > Math.abs(dx)) {
            touchStartedOnRingRef.current = false;
            dragStartPosRef.current = null;
            return;
          }
          if (previewLockedRef.current) { previewLockedRef.current = false; setPreviewLocked(false); }
          isHoveringRef.current = false; setIsRevealVisible(false); activeCardIndexRef.current = -1; setActiveCardIndex(-1);
          handleStart(touch.clientX, touch.clientY); hasDraggedRef.current = true; touchStartedOnRingRef.current = false; return;
        }
      }
      if (touchStartedOnRingRef.current) {
        const nearRing = updateClosestImageMobile(touch.clientX, touch.clientY);
        if (nearRing) { isHoveringRef.current = true; setIsRevealVisible(true); }
        else if (!previewLockedRef.current) { isHoveringRef.current = false; setIsRevealVisible(false); }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      const wasDragging = hasDraggedRef.current;
      if (previewLockedRef.current) { touchStartedOnRingRef.current = false; handleEnd(); return; }
      if (!wasDragging && touchStartedOnRingRef.current) {
        const activeIndex = activeCardIndexRef.current;
        if (activeIndex >= 0 && activeIndex < list.length) {
          previewLockedRef.current = true; setPreviewLocked(true); isHoveringRef.current = true; setIsRevealVisible(true);
          touchStartedOnRingRef.current = false; handleEnd(); return;
        }
      }
      isHoveringRef.current = false; touchStartedOnRingRef.current = false; activeCardIndexRef.current = -1; setActiveCardIndex(-1); setIsRevealVisible(false); handleEnd();
    };

    const onWindowMouseMove = (e: MouseEvent) => { if (isDraggingRef.current) onMouseMove(e); };

    container.addEventListener("mouseleave", onMouseLeave as EventListener);
    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", onContainerClick);
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("click", onContainerClick);
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [safeCount, camY, list, handleItemClick, isMobile, ringGapPx, offsetX, offsetY,
      revealImageWidth, revealImageHeight, revealImageTopVh, updateClosestCardDesktop,
      dimensions.w, camZ, cardRotXDeg, cardRotYDeg, cardRotZDeg, rotateCardDeg,
      perspective, sceneCardWidth, sceneCardHeight]);

  const mobileOffsetX = isMobile ? (dimensions.w || window.innerWidth) * 0.4 : offsetX;
  const mobileLeft = isMobile ? "100%" : "50%";
  const mobileTop = isMobile ? "95%" : "50%";
  const mobileCamX = isMobile ? 0 : camX;

  const revealRadius = 600;
  const revealImageTop = isMobile ? "35vh" : "45vh";
  const revealMaskY = isMobile ? "35vh" : "45vh";

  const sceneTransform = `
    translate(-50%, -50%)
    rotateX(${mobileCamX}deg)
    rotateY(90deg)
    rotateZ(${camZ}deg)
    translate(${isMobile ? mobileOffsetX : offsetX}px, ${offsetY}px)
  `;

  const showReveal = activeCardIndex >= 0 && activeCardIndex < list.length;

  const revealIndexForDisplay = useMemo(() => {
    if (!isMobile || list.length === 0) return activeCardIndex;
    if (previewLocked && activeCardIndex >= 0 && activeCardIndex < list.length) return activeCardIndex;
    if (activeCardIndex >= 0 && (isRevealVisible || isDragging)) return activeCardIndex;
    return mobileFrontIndex;
  }, [isMobile, list.length, previewLocked, activeCardIndex, isRevealVisible, isDragging, mobileFrontIndex]);

  const displayRevealIdx =
    isMobile && list.length > 0
      ? Math.max(0, Math.min(list.length - 1, revealIndexForDisplay))
      : activeCardIndex;

  const revealLayerOpaque = isMobile ? list.length > 0 : showReveal || isRevealVisible;

  const showRevealContent =
    isMobile
      ? list.length > 0 && displayRevealIdx >= 0 && displayRevealIdx < list.length
      : showReveal;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        perspective,
        overflow: isMobile ? "hidden" : "visible",
        overflowX: "hidden",
        background: "var(--paper)",
        position: "relative",
        cursor: finePointer ? "none" : "grab",
        userSelect: "none",
        touchAction: isMobile ? "pan-y" : "none",
      }}
    >
      {/* REVEAL LAYER */}
      <div
        ref={revealLayerRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 400,
          pointerEvents: "none",
          opacity: revealLayerOpaque ? 1 : 0,
          transition: "opacity 0.2s ease",
          WebkitMaskImage: `radial-gradient(circle ${revealRadius}px at 50vw ${revealMaskY}, white 0%, white 90%, transparent 100%)`,
          maskImage: `radial-gradient(circle ${revealRadius}px at 50vw ${revealMaskY}, white 0%, white 90%, transparent 100%)`,
          cursor: finePointer ? "none" : "grab",
          mixBlendMode: "normal",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showRevealContent && (
          <>
            <div
              ref={revealSceneRef}
              role={isMobile ? "link" : undefined}
              aria-label={isMobile ? `Open ${list[displayRevealIdx].title}` : undefined}
              tabIndex={isMobile ? 0 : undefined}
              onKeyDown={
                isMobile
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleItemClick(list[displayRevealIdx]);
                      }
                    }
                  : undefined
              }
              onClick={
                isMobile
                  ? (e) => {
                      e.stopPropagation();
                      handleItemClick(list[displayRevealIdx]);
                    }
                  : undefined
              }
              onTouchStart={isMobile ? (e) => e.stopPropagation() : undefined}
              onTouchEnd={isMobile ? (e) => e.stopPropagation() : undefined}
              style={{
                position: "fixed",
                top: revealImageTop,
                left: "50vw",
                width: revealImageWidth,
                height: revealImageHeight,
                transform: "translate(-50%, -50%)",
                borderRadius: borderRadius,
                overflow: "hidden",
                pointerEvents: isMobile ? "auto" : "none",
                touchAction: isMobile ? "manipulation" : undefined,
                cursor: isMobile ? "pointer" : undefined,
                WebkitTapHighlightColor: isMobile ? "transparent" : undefined,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
                outline: previewLocked ? "2.5px solid rgba(255,255,255,0.6)" : "none",
                transition: "outline 0.2s ease",
              }}
            >
              <img
                src={list[displayRevealIdx].image}
                alt={list[displayRevealIdx].title}
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none", display: "block", pointerEvents: "none" }}
              />
              {previewLocked && (
                <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }} />
              )}
            </div>

            <div
              style={{
                position: "fixed",
                top: isMobile ? `calc(35vh + ${revealImageHeight / 2}px + 20px)` : `calc(45vh + ${revealImageHeight / 2}px + 20px)`,
                left: "50vw",
                transform: "translateX(-50%)",
                zIndex: 401,
                pointerEvents: isMobile ? "none" : "auto",
                cursor: finePointer && isMobile ? undefined : "pointer",
                textAlign: "center",
                display: isMobile ? "flex" : "block",
                flexDirection: isMobile ? "column" : undefined,
                alignItems: isMobile ? "center" : undefined,
                gap: isMobile ? 10 : undefined,
                width: isMobile ? "min(92vw, 380px)" : undefined,
                maxWidth: isMobile ? "min(92vw, 380px)" : undefined,
                padding: isMobile ? "0 12px" : undefined,
                boxSizing: "border-box",
              }}
              onMouseDown={isMobile ? undefined : (e) => e.stopPropagation()}
              onClick={isMobile ? undefined : (e) => {
                e.stopPropagation();
                const idx = activeCardIndex;
                if (idx >= 0 && idx < list.length) handleItemClick(list[idx]);
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? 11 : 14,
                  fontWeight: 600,
                  color: "#111317",
                  letterSpacing: "-0.02em",
                  display: "inline-block",
                  background: "rgba(248,248,246,0.95)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  padding: isMobile ? "6px 14px" : "8px 18px",
                  borderRadius: 20,
                  border: "1px solid rgba(17,19,23,0.15)",
                }}
              >
                {list[displayRevealIdx].title}
              </span>
              {isMobile && list[displayRevealIdx].shortDescription ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: "clamp(11px, 3.1vw, 13px)",
                    fontWeight: 400,
                    lineHeight: 1.45,
                    color: "rgba(17,19,23,0.62)",
                    letterSpacing: "0.01em",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                    textAlign: "center",
                  }}
                >
                  {list[displayRevealIdx].shortDescription}
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* "We are WeSee" fallback (desktop only — mobile always shows a service when `list` is non-empty) */}
      {!isMobile && !showReveal && !isRevealVisible && (
        <div
          style={{
            position: "fixed",
            top: revealImageTop,
            left: "50vw",
            transform: "translate(-50%, -50%)",
            zIndex: 350,
            pointerEvents: "none",
            textAlign: "center",
            opacity: 1,
            transition: "opacity 0.3s ease",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 64px)",
              fontWeight: 450,
              color: "var(--ink)",
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              whiteSpace: "nowrap",
              margin: 0,
            }}
          >
            We are{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                background: "linear-gradient(135deg, #B8922E 0%, #C9A84C 48%, #E8C870 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% 100%",
                animation: "textShimmer 5s ease infinite",
              }}
            >
              WeSee.
            </em>
          </h1>
        </div>
      )}

      {/* Main 3D scene */}
      <div
        ref={sceneRef}
        style={{
          position: "absolute",
          top: mobileTop,
          left: mobileLeft,
          width: sceneCardWidth,
          height: sceneCardHeight,
          transform: sceneTransform,
          transformStyle: "preserve-3d",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        {list.map((item, i) => (
          <RotorItem
            key={i}
            item={item}
            index={i}
            total={safeCount}
            borderRadius={borderRadius}
            cardWidth={sceneCardWidth}
            cardHeight={sceneCardHeight}
            gapPx={ringGapPx}
            zOffsetPx={0}
            baseCardRotX={cardRotXDeg + rotateCardDeg}
            baseCardRotY={cardRotYDeg}
            baseCardRotZ={cardRotZDeg}
            cardOpacity={1}
            isHovered={(isMobile ? displayRevealIdx : activeCardIndex) === i}
            finePointer={finePointer}
            setInnerRef={(el) => { cardInnerRefs.current[i] = el; }}
            hideRingCardOverlay={hideRingCardOverlay}
          />
        ))}
      </div>

      {/* DESKTOP CATEGORY LABELS */}
      {categoryLabels.length > 0 && !isMobile && ringRadius > 0 &&
        categoryLabels.map((label, i) => (
          <div
            key={`label-${i}`}
            ref={(el) => { labelElemRefs.current[i] = el; }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              willChange: "transform",
              transform: "translate3d(0px,0px,0) translate(-50%,-50%)",
              zIndex: 500,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#111317",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "inline-block",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid rgba(17,19,23,0.15)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                whiteSpace: "nowrap",
              }}
            >
              {label.name} ({label.count})
            </span>
          </div>
        ))
      }

      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 600,
          textAlign: "center",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}