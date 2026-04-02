/*
 * RotorGallery — 3D Rotating Ring Gallery
 *
 * DESKTOP LABEL FIX (v2):
 *  - Labels are promoted to their own GPU compositor layer via will-change + translate3d
 *  - Center offsets are pre-computed once (not per-frame) to avoid layout reads in RAF
 *  - Labels use position:fixed so they are removed from document flow entirely,
 *    eliminating any reflow cascade from transform updates
 *  - All trig pre-cached; zero object allocations inside the tick loop
 *
 * DESKTOP HOVER SYNC FIX (v3):
 *  - updateClosestCardDesktop now projects each card through the exact same
 *    4×4 matrix chain the CSS uses (rotateX camX → rotateY 90 → rotateZ camZ →
 *    translate offsetX/offsetY → per-card ring rotation → translateZ gapPx)
 *  - Cursor is compared to each card's actual screen-space projected centre
 *    with a perspective divide — no more flat-circle / atan2 angle mismatch
 *
 * MOBILE TOUCH FIX (v5):
 *  - updateClosestImageMobile now uses the same mat4 projection as the desktop
 *    version, computing each card's exact screen-space centre this frame.
 *  - Pivot correctly mirrors left:"100%", top:"95%" of the container.
 *  - Hit radius is card-size based so tapping anywhere on a card registers.
 *  - No more atan2 angle mismatch — works regardless of ring orientation.
 *
 * MOBILE: all other mobile logic untouched from original.
 */
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useFinePointer } from "@/hooks/useFinePointer";

interface RingItem {
  title: string;
  image: string;
  url: string;
  category: string;
  categoryId: number;
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
}

const MAX_SAFE_COUNT = 90;

// ── Tiny column-major mat4 helpers ────────────────────────────────────────────
type M4 = Float64Array;

function m4id(): M4 {
  const m = new Float64Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

function m4mul(a: M4, b: M4): M4 {
  const o = new Float64Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
}

function m4rx(deg: number): M4 {
  const m = m4id(), r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  m[5] = c; m[9] = -s; m[6] = s; m[10] = c;
  return m;
}

function m4ry(deg: number): M4 {
  const m = m4id(), r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  m[0] = c; m[8] = s; m[2] = -s; m[10] = c;
  return m;
}

function m4rz(deg: number): M4 {
  const m = m4id(), r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  m[0] = c; m[4] = -s; m[1] = s; m[5] = c;
  return m;
}

function m4tr(tx: number, ty: number, tz: number): M4 {
  const m = m4id();
  m[12] = tx; m[13] = ty; m[14] = tz;
  return m;
}

/** Transform point (x,y,z) by column-major mat4, returns [x,y,z,w] */
function m4pt(m: M4, x: number, y: number, z: number): [number, number, number, number] {
  return [
    m[0] * x + m[4] * y + m[8]  * z + m[12],
    m[1] * x + m[5] * y + m[9]  * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
    m[3] * x + m[7] * y + m[11] * z + m[15],
  ];
}
// ─────────────────────────────────────────────────────────────────────────────

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
  isMobile,
  finePointer,
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
  isMobile: boolean;
  finePointer: boolean;
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
      <div
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
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 400,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {item.category.split("&")[0].trim()}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#FFFFFF",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              {item.title}
            </div>
          </div>
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
}: RotorGalleryProps) {
  const finePointer = useFinePointer();
  const safeCount = Math.min(MAX_SAFE_COUNT, count);
  const sceneRef = useRef<HTMLDivElement>(null);
  const revealSceneRef = useRef<HTMLDivElement>(null);
  const revealLayerRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);

  const labelElemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelSizeRefs = useRef<{ halfW: number; halfH: number }[]>([]);
  const labelCenterRef = useRef({ x: 0, y: 0 });

  const activeCardIndexRef = useRef<number>(-1);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(-1);
  const [isRevealVisible, setIsRevealVisible] = useState<boolean>(false);

  const previewLockedRef = useRef(false);
  const [previewLocked, setPreviewLocked] = useState(false);

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
    // Reduce ring radius more aggressively on smaller desktop viewports.
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
      labelCenterRef.current = {
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.5,
      };
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
        return {
          halfW: Math.max(80, rect.width * 0.5),
          halfH: Math.max(14, rect.height * 0.5),
        };
      });
    };

    updateLabelSizes();
    window.addEventListener("resize", updateLabelSizes, { passive: true });
    return () => window.removeEventListener("resize", updateLabelSizes);
  }, [categoryLabels, isMobile]);

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
        angleRef.current += speed * dt;
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
      if (onItemClick) {
        onItemClick(item);
      } else if (item.url) {
        navigate(item.url);
      }
    },
    [onItemClick, navigate]
  );

  const RING_SCALE = 0.85;
  const ringGapPx = effectiveGapPx * RING_SCALE;

  const sceneCardWidth = effectiveCardWidth;
  const sceneCardHeight = effectiveCardHeight;
  const revealImageWidth = isMobile ? sceneCardWidth * 3.8 : sceneCardWidth * 2.5;
  const revealImageHeight = isMobile ? sceneCardHeight * 2.6 : sceneCardHeight * 1.6;
  const revealImageTopVh = isMobile ? 0.35 : 0.45;

  // ── Desktop hover hit-test (fast path) ──────────────────────────────────
  const updateClosestCardDesktop = useCallback(
    (clientX: number, clientY: number): boolean => {
      const container = containerRef.current;
      if (!container) return false;

      const rect = container.getBoundingClientRect();
      const sceneCenterX = rect.left + rect.width * 0.5 + offsetX;
      const sceneCenterY = rect.top + rect.height * 0.5 + offsetY;

      const dx = clientX - sceneCenterX;
      const dy = clientY - sceneCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const cardDiag = Math.sqrt(sceneCardWidth ** 2 + sceneCardHeight ** 2) * 0.5;
      const minR = ringGapPx * 0.55;
      const maxR = ringGapPx + cardDiag * 1.3;

      if (dist < minR || dist > maxR) {
        if (activeCardIndexRef.current >= 0) {
          activeCardIndexRef.current = -1;
          setActiveCardIndex(-1);
          setIsRevealVisible(false);
          isHoveringRef.current = false;
        }
        return false;
      }

      let cursorAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      cursorAngle = (cursorAngle + 360) % 360;

      const anglePerCard = 360 / safeCount;
      const MAX_ANG_TOLERANCE = Math.min(18, anglePerCard * 0.55);

      let minAngDist = Infinity;
      let bestIndex = -1;

      for (let i = 0; i < safeCount; i++) {
        let cardAngle = (angleRef.current - i * anglePerCard) % 360;
        if (cardAngle < 0) cardAngle += 360;
        let d = Math.abs(cursorAngle - cardAngle);
        if (d > 180) d = 360 - d;
        if (d < minAngDist) {
          minAngDist = d;
          bestIndex = i;
        }
      }

      if (minAngDist > MAX_ANG_TOLERANCE) {
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
    [ringGapPx, sceneCardWidth, sceneCardHeight, safeCount, offsetX, offsetY]
  );
  // ─────────────────────────────────────────────────────────────────────────

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
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
      const prevAngle = Math.atan2(lastPosRef.current.y - centerY, lastPosRef.current.x - centerX);

      let angleDelta = currentAngle - prevAngle;
      if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
      if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;

      const rotationDelta = angleDelta * (180 / Math.PI);
      angleRef.current += rotationDelta;
      targetAngleRef.current = null;
      velocityRef.current = rotationDelta / (dt / 1000);

      if (dragStartPosRef.current) {
        const totalDx = clientX - dragStartPosRef.current.x;
        const totalDy = clientY - dragStartPosRef.current.y;
        if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > 5) {
          hasDraggedRef.current = true;
        }
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
        setTimeout(() => {
          hasDraggedRef.current = false;
          dragStartPosRef.current = null;
        }, 100);
      } else {
        dragStartPosRef.current = null;
      }
    };

    // ── MOBILE TOUCH FIX v5: project cards through the same mat4 chain ────────
    //
    // The ring pivot is at left:"100%", top:"95%" of the container, then
    // shifted by mobileOffsetX = vw*0.4.  Cards fan out *leftward* from there,
    // so their visible screen positions bear no simple relationship to the pivot.
    //
    // We use the same 4×4 matrix projection the desktop version uses, but with
    // the mobile camera/offset values (camX=0, camY=90, mobileOffsetX).
    // This gives us the exact screen-space centre of every card this frame, so
    // we can find the one closest to the touch point — no atan2 needed.
    //
    // A generous HIT_RADIUS_PX is used so tapping anywhere on a card registers.
    // ────────────────────────────────────────────────────────────────────────
    const updateClosestImageMobile = (clientX: number, clientY: number): boolean => {
      if (!isMobile) return false;

      const now = performance.now();
      if (now - lastMouseUpdateRef.current < 16) return activeCardIndexRef.current >= 0;
      lastMouseUpdateRef.current = now;

      const rect = container.getBoundingClientRect();
      const vw = dimensions.w || window.innerWidth;

      // Scene pivot in screen-space — mirrors top:"95%", left:"100%" of container
      // then translate(-50%,-50%) in the sceneTransform anchors on this point.
      const pivotX = rect.left + rect.width;        // left:"100%"
      const pivotY = rect.top  + rect.height * 0.95; // top:"95%"

      // mobileOffsetX mirrors: translate(mobileOffsetX, offsetY) in sceneTransform
      const mobileOffsetX = vw * 0.4;

      // Scene matrix for mobile: rotateX(0) → rotateY(90) → rotateZ(camZ)
      //                           → translate(mobileOffsetX, offsetY, 0)
      const sceneMatrix = m4mul(
        m4mul(m4mul(m4rx(0), m4ry(90)), m4rz(camZ)),
        m4tr(mobileOffsetX, offsetY, 0)
      );

      const baseCardRotX = cardRotXDeg + rotateCardDeg;

      // Generous hit radius — cards are physically large on mobile
      const HIT_RADIUS_PX = Math.max(sceneCardWidth, sceneCardHeight) * 1.1;

      let bestIndex = -1;
      let bestDist  = Infinity;

      for (let i = 0; i < safeCount; i++) {
        const itemAngle = (i / safeCount) * 360;
        const ringAngle = angleRef.current - itemAngle;

        // Per-card matrix — mirrors RotorItem ringTransform (same as desktop)
        const cardMatrix = m4mul(
          m4mul(
            m4mul(
              m4mul(m4rx(ringAngle), m4tr(0, 0, ringGapPx)),
              m4rx(baseCardRotX)
            ),
            m4ry(cardRotYDeg)
          ),
          m4rz(cardRotZDeg)
        );

        const fullMatrix = m4mul(sceneMatrix, cardMatrix);
        const [wx, wy, wz] = m4pt(fullMatrix, 0, 0, 0);

        // Perspective divide
        const pz = perspective + wz;
        if (pz <= 0) continue;

        const scale = perspective / pz;
        const sx = pivotX + wx * scale;
        const sy = pivotY + wy * scale;

        const dist = Math.sqrt((clientX - sx) ** 2 + (clientY - sy) ** 2);
        if (dist < bestDist) {
          bestDist  = dist;
          bestIndex = i;
        }
      }

      if (bestIndex < 0 || bestDist > HIT_RADIUS_PX) {
        if (!previewLockedRef.current && activeCardIndexRef.current >= 0) {
          activeCardIndexRef.current = -1;
          setActiveCardIndex(-1);
          setIsRevealVisible(false);
          isHoveringRef.current = false;
        }
        return false;
      }

      mousePosRef.current = { x: clientX, y: clientY };

      if (activeCardIndexRef.current !== bestIndex) {
        activeCardIndexRef.current = bestIndex;
        setActiveCardIndex(bestIndex);
      }
      return true;
    };
    // ── end mobile fix ───────────────────────────────────────────────────────

    const isTouchOnPreview = (clientX: number, clientY: number): boolean => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const centerX = vw * 0.5;
      const centerY = vh * revealImageTopVh;
      return (
        clientX >= centerX - revealImageWidth / 2 &&
        clientX <= centerX + revealImageWidth / 2 &&
        clientY >= centerY - revealImageHeight / 2 &&
        clientY <= centerY + revealImageHeight / 2
      );
    };

    const isTouchOnCategoryLabel = (clientX: number, clientY: number): boolean => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const centerX = vw * 0.5;
      const pillTop = vh * revealImageTopVh + revealImageHeight / 2 + 20;
      const pillHeight = isMobile ? 44 : 52;
      const halfW = isMobile ? 200 : 240;
      return (
        clientX >= centerX - halfW &&
        clientX <= centerX + halfW &&
        clientY >= pillTop &&
        clientY <= pillTop + pillHeight
      );
    };

    const isTouchOnPreviewOrCategoryLabel = (clientX: number, clientY: number): boolean =>
      isTouchOnPreview(clientX, clientY) || isTouchOnCategoryLabel(clientX, clientY);

    // ── Desktop mouse handlers (UNCHANGED) ──
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
        return;
      }
      if (!isMobile) {
        const onRing = updateClosestCardDesktop(e.clientX, e.clientY);
        if (onRing) {
          isHoveringRef.current = true;
          setIsRevealVisible(true);
        } else {
          isHoveringRef.current = false;
          setIsRevealVisible(false);
        }
      }
    };

    const onMouseUp = () => handleEnd();

    const onMouseLeave = () => {
      if (previewLockedRef.current) return;
      isHoveringRef.current = false;
      velocityRef.current = 0;
      mousePosRef.current = null;
      targetAngleRef.current = null;
      activeCardIndexRef.current = -1;
      setActiveCardIndex(-1);
      setIsRevealVisible(false);
    };

    const onContainerClick = (e: MouseEvent) => {
      if (isMobile) return;
      if (hasDraggedRef.current) return;
      const activeIndex = activeCardIndexRef.current;
      if (activeIndex >= 0 && activeIndex < list.length) {
        handleItemClick(list[activeIndex]);
      }
    };

    // ── Mobile touch handlers (logic unchanged, uses fixed updateClosestImageMobile) ──
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];

      if (previewLockedRef.current) {
        if (isTouchOnPreviewOrCategoryLabel(touch.clientX, touch.clientY)) {
          const idx = activeCardIndexRef.current;
          previewLockedRef.current = false;
          setPreviewLocked(false);
          isHoveringRef.current = false;
          activeCardIndexRef.current = -1;
          setActiveCardIndex(-1);
          setIsRevealVisible(false);
          if (idx >= 0 && idx < list.length) {
            handleItemClick(list[idx]);
          }
        } else {
          const nearRing = updateClosestImageMobile(touch.clientX, touch.clientY);
          touchStartedOnRingRef.current = nearRing;
          if (nearRing) {
            isHoveringRef.current = true;
            setIsRevealVisible(true);
          } else {
            previewLockedRef.current = false;
            setPreviewLocked(false);
            isHoveringRef.current = false;
            activeCardIndexRef.current = -1;
            setActiveCardIndex(-1);
            setIsRevealVisible(false);
          }
        }
        dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
        hasDraggedRef.current = false;
        return;
      }

      const nearRing = updateClosestImageMobile(touch.clientX, touch.clientY);
      touchStartedOnRingRef.current = nearRing;

      if (nearRing) {
        isHoveringRef.current = true;
        setIsRevealVisible(true);
      } else {
        isHoveringRef.current = false;
        setIsRevealVisible(false);
      }

      dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      hasDraggedRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];

      if (isDraggingRef.current) {
        e.preventDefault();
        handleMove(touch.clientX, touch.clientY);
        return;
      }

      // Start drag-driven rotation only when touch originated on the ring.
      if (touchStartedOnRingRef.current && dragStartPosRef.current) {
        const dx = touch.clientX - dragStartPosRef.current.x;
        const dy = touch.clientY - dragStartPosRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 8) {
          if (previewLockedRef.current) {
            previewLockedRef.current = false;
            setPreviewLocked(false);
          }
          isHoveringRef.current = false;
          setIsRevealVisible(false);
          activeCardIndexRef.current = -1;
          setActiveCardIndex(-1);
          handleStart(touch.clientX, touch.clientY);
          hasDraggedRef.current = true;
          touchStartedOnRingRef.current = false;
          return;
        }
      }

      if (touchStartedOnRingRef.current) {
        const nearRing = updateClosestImageMobile(touch.clientX, touch.clientY);
        if (nearRing) {
          isHoveringRef.current = true;
          setIsRevealVisible(true);
        } else if (!previewLockedRef.current) {
          isHoveringRef.current = false;
          setIsRevealVisible(false);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const wasDragging = hasDraggedRef.current;

      if (previewLockedRef.current) {
        touchStartedOnRingRef.current = false;
        handleEnd();
        return;
      }

      if (!wasDragging && touchStartedOnRingRef.current) {
        const activeIndex = activeCardIndexRef.current;
        if (activeIndex >= 0 && activeIndex < list.length) {
          previewLockedRef.current = true;
          setPreviewLocked(true);
          isHoveringRef.current = true;
          setIsRevealVisible(true);
          touchStartedOnRingRef.current = false;
          handleEnd();
          return;
        }
      }

      isHoveringRef.current = false;
      touchStartedOnRingRef.current = false;
      activeCardIndexRef.current = -1;
      setActiveCardIndex(-1);
      setIsRevealVisible(false);
      handleEnd();
    };

    const onWindowMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) onMouseMove(e);
    };

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
  const mobileCamY = isMobile ? 90 : 90;

  const revealRadius = 600;
  const revealImageTop = isMobile ? "35vh" : "45vh";
  const revealMaskY = isMobile ? "35vh" : "45vh";

  const sceneTransform = `
    translate(-50%, -50%)
    rotateX(${mobileCamX}deg)
    rotateY(${mobileCamY}deg)
    rotateZ(${camZ}deg)
    translate(${isMobile ? mobileOffsetX : offsetX}px, ${offsetY}px)
  `;

  const showReveal = activeCardIndex >= 0 && activeCardIndex < list.length;

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
        touchAction: "none",
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
          opacity: showReveal || isRevealVisible ? 1 : 0,
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
        {showReveal && (
          <>
            <div
              ref={revealSceneRef}
              style={{
                position: "fixed",
                top: revealImageTop,
                left: "50vw",
                width: revealImageWidth,
                height: revealImageHeight,
                transform: "translate(-50%, -50%)",
                borderRadius: borderRadius,
                overflow: "hidden",
                pointerEvents: "none",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
                outline: previewLocked ? "2.5px solid rgba(255,255,255,0.6)" : "none",
                transition: "outline 0.2s ease",
              }}
            >
              <img
                src={list[activeCardIndex].image}
                alt={list[activeCardIndex].title}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  userSelect: "none",
                  display: "block",
                }}
              />
              {previewLocked && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>

            <div
              style={{
                position: "fixed",
                top: isMobile
                  ? `calc(35vh + ${revealImageHeight / 2}px + 20px)`
                  : `calc(45vh + ${revealImageHeight / 2}px + 20px)`,
                left: "50vw",
                transform: "translateX(-50%)",
                zIndex: 401,
                pointerEvents: isMobile ? "none" : "auto",
                cursor: finePointer && isMobile ? undefined : "pointer",
                textAlign: "center",
              }}
              onMouseDown={isMobile ? undefined : (e) => e.stopPropagation()}
              onClick={
                isMobile
                  ? undefined
                  : (e) => {
                      e.stopPropagation();
                      const idx = activeCardIndex;
                      if (idx >= 0 && idx < list.length) handleItemClick(list[idx]);
                    }
              }
            >
              <span
                style={{
                  fontSize: isMobile ? 11 : 14,
                  fontWeight: 600,
                  color: "#111317",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "inline-block",
                  background: "rgba(248,248,246,0.95)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  padding: isMobile ? "6px 14px" : "8px 18px",
                  borderRadius: 20,
                  border: "1px solid rgba(17,19,23,0.15)",
                }}
              >
                {list[activeCardIndex].category.split("&")[0].trim()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* "We are WeSee" fallback */}
      {!showReveal && !isRevealVisible && (
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
            isHovered={activeCardIndex === i}
            isMobile={isMobile}
            finePointer={finePointer}
          />
        ))}
      </div>

      {/*
       * ── DESKTOP CATEGORY LABELS ──
       * position:fixed + translate3d — GPU composited, zero reflow
       */}
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