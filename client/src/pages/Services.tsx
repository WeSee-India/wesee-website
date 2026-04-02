import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearch } from "wouter";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { services, categories } from "@/data/services";
import SectionLabel from "@/components/SectionLabel";

import RotorGallery from "@/components/RotorGallery";

import ParticleWrapper from "@/components/ParticleWrapper";
import CustomCursor from "@/components/CustomCursor";
import { useFinePointer } from "@/hooks/useFinePointer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Category-based image mapping — images are mapped to categories semantically
 * Each category has a pool of relevant images that cycle through services in that category
 */
const SERVICE_IMAGES: string[] = [
  "/services/ailab.jpg",
  "/services/codescreen.jpg",
  "/services/ailab.jpg",
  "/services/laptop.jpg",
  "/services/cloudinfra.jpg",
  "/services/abstractdata.png",
  "/services/office.jpg",
  "/services/revenue.jpg",
  "/services/workspace.jpg",
  "/services/abstractdata.png",
  "/services/laptop.jpg",
  "/services/socialmedia.jpg",
  "/services/marketing.jpg",
  "/services/coding.jpg",
  "/services/content.jpg",
  "/services/blog.jpg",
  "/services/blog.jpg",
  "/services/email.jpg",
  "/services/message.jpg",
  "/services/chat.jpg",
  "/services/communication.jpg",
  "/services/designdesk.jpg",
  "/services/branding.jpg",
  "/services/webui.jpg",
  "/services/designtool.jpg",
  "/services/creative.jpg",
  "/services/ecommerce.png",
  "/services/shopping.jpg",
  "/services/marketplace.jpg",
  "/services/store.jpg",
  "/services/packing.jpg",
  "/services/salesoffice.jpg",
  "/services/crm.jpg",
  "/services/teammeeting.jpg",
  "/services/revenue.jpg",
  "/services/cloudinfra.jpg",
  "/services/datacenter.jpg",
  "/services/operations.jpg",
  "/services/hrteam.jpg",
  "/services/personlaptop.jpg",
  "/services/codescreen.jpg",
  "/services/codescreen.jpg",
  "/services/macbookcode.jpg",
];

/**
 * Category-based image mapping
 * Maps images to categories semantically based on categoryId
 */
const CATEGORY_IMAGE_MAP: Record<number, number[]> = {
  // Category 1: AI Agents & Conversational AI
  1: [0, 1, 2, 3], // robot, circuit, ai lab, tech
  
  // Category 2: Workflow & Business Process Automation
  2: [4, 5, 6, 8, 9], // server, analytics, office, workspace, abstract data
  
  // Category 3: Performance Marketing & Paid Advertising
  3: [7, 11, 12], // charts, social media, marketing
  
  // Category 4: SEO, Content & Organic Growth
  4: [13, 14, 15, 16], // coding, content, writing, blog
  
  // Category 5: Messaging, Email & Communication
  5: [17, 18, 19, 20], // email, message, chat, communication
  
  // Category 6: Web Design, Branding & Creative
  6: [21, 22, 23, 24, 25], // design desk, branding, web ui, design tool, creative
  
  // Category 7: E-Commerce & Marketplace Growth
  7: [26, 27, 28, 29, 30], // ecommerce, shopping, marketplace, store, packaging
  
  // Category 8: Sales, CRM & Revenue Operations
  8: [31, 32, 33, 34], // sales office, crm, team meeting, revenue
  
  // Category 9: Business Operations & Infrastructure
  9: [35, 36, 37, 38, 39, 40, 41, 42], // cloud infra, data center, operations, hr team, person laptop, code screen, matrix, macbook code
};

/** Returns a category-appropriate image for each service */
export function getServiceImage(service: { id: number; categoryId: number }, index: number, allServices?: Array<{ id: number; categoryId: number }>): string {
  const categoryImages = CATEGORY_IMAGE_MAP[service.categoryId] || [0];
  
  // Calculate the index of this service within its category
  let categoryIndex = 0;
  if (allServices) {
    // Count how many services of the same category appear before this one in the filtered list
    for (let i = 0; i < allServices.length; i++) {
      if (allServices[i].id === service.id) {
        break;
      }
      if (allServices[i].categoryId === service.categoryId) {
        categoryIndex++;
      }
    }
  } else {
    // Fallback: use service ID to create some variation
    categoryIndex = (service.id - 1) % categoryImages.length;
  }
  
  // Cycle through category images based on position within category
  const imageIndex = categoryImages[categoryIndex % categoryImages.length];
  return SERVICE_IMAGES[imageIndex];
}

const industries = ["Healthcare", "Real Estate", "E-Commerce", "SaaS", "Financial Services", "Education", "Hospitality", "Manufacturing", "Legal", "Logistics"];
const engagementSizes = ["Starter", "Growth", "Enterprise"];
const statuses = ["Live", "In Progress", "Case Study"];

type ColumnProps = {
  images: Array<{ src: string; title?: string; subtitle?: string; href?: string }>;
  y: MotionValue<number>;
  isMobile?: boolean;
};

const Column = ({ images, y, isMobile = false }: ColumnProps) => {
  return (
    <motion.div
      className={`relative flex h-full flex-col ${isMobile ? '-top-[45%] first:top-[-45%] [&:nth-child(2)]:top-[-95%]' : '-top-[45%] flex-1 min-w-[280px] gap-[1.5vw] first:top-[-45%] [&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-[-45%] [&:nth-child(4)]:top-[-75%]'}`}
      style={{ 
        y,
        ...(isMobile && { width: "49%", flex: "0 0 49%", gap: "8px" })
      }}
    >
      {images.map((item, i) => {
        const tileStyle = {
          flex: isMobile ? "0 0 auto" : "1 1 auto",
          display: isMobile ? "block" : "flex",
          alignItems: isMobile ? "normal" : "center",
          justifyContent: isMobile ? "normal" : "center",
          marginBottom: isMobile ? "0" : undefined,
        } as const;
        const linkShell =
          "relative w-full min-h-0 overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 " +
          (isMobile ? "block" : "flex h-full flex-1 flex-col");
        const inner = (
          <>
            <img
              src={item.src}
              alt={item.title ? `${item.title} — service` : "Service"}
              className={`pointer-events-none w-full ${isMobile ? "object-contain" : "object-cover"}`}
              style={{ height: isMobile ? "auto" : "100%", minHeight: isMobile ? undefined : undefined, maxHeight: isMobile ? "none" : "none", display: "block", width: "100%" }}
            />
            {item.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                <div className="text-white">
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  {item.subtitle && <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.9 }}>{item.subtitle}</div>}
                </div>
              </div>
            )}
          </>
        );
        return (
          <div key={i} style={tileStyle} className={isMobile ? "w-full" : "min-w-0 flex-1"}>
            {item.href ? (
              <Link
                href={item.href}
                className={linkShell}
                aria-label={item.title ? `Open ${item.title}` : "Open service"}
              >
                {inner}
              </Link>
            ) : (
              <div className={linkShell}>{inner}</div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

const ServicesParallaxGallery = ({ services }: { services: Array<{ image: string; name: string; category: string; slug: string }> }) => {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  useEffect(() => {
    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth < 768);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Distribute all services evenly across columns
  // For mobile: 2 columns with all images
  // For desktop: 4 columns with all images
  const totalServices = services.length;
  
  // Create columns by distributing services evenly
  const col1: Array<{ src: string; title: string; subtitle: string; href: string }> = [];
  const col2: Array<{ src: string; title: string; subtitle: string; href: string }> = [];
  const col3: Array<{ src: string; title: string; subtitle: string; href: string }> = [];
  const col4: Array<{ src: string; title: string; subtitle: string; href: string }> = [];
  
  // Mobile columns (2 columns with all images)
  const mobileCol1: Array<{ src: string; title: string; subtitle: string; href: string }> = [];
  const mobileCol2: Array<{ src: string; title: string; subtitle: string; href: string }> = [];
  
  services.forEach((service, index) => {
    const item = {
      src: service.image,
      title: service.name,
      subtitle: service.category,
      href: `/services/${service.slug}`,
    };
    
    // Desktop: Distribute evenly across 4 columns
    const columnIndex = index % 4;
    if (columnIndex === 0) col1.push(item);
    else if (columnIndex === 1) col2.push(item);
    else if (columnIndex === 2) col3.push(item);
    else col4.push(item);
    
    // Mobile: Distribute images with more in column 2
    // Use a 3-item cycle: 2 items go to col2, 1 item goes to col1
    // This gives approximately 33% to col1 and 67% to col2
    const cyclePosition = index % 3;
    if (cyclePosition === 0) {
      mobileCol1.push(item);
    } else {
      mobileCol2.push(item);
    }
  });
  
  // Ensure column 2 has more images - move any extras from col1 to col2
  while (mobileCol1.length >= mobileCol2.length && mobileCol1.length > 0) {
    const extraImage = mobileCol1.pop();
    if (extraImage) {
      mobileCol2.push(extraImage);
    }
  }
  
  // Duplicate images to fill columns for better parallax effect (ensure each column has at least 5-6 images)
  const imagesPerColumn = Math.ceil(totalServices / 4);
  const minImagesPerColumn = Math.max(imagesPerColumn, 6);
  const duplicateIfNeeded = (col: typeof col1) => {
    if (col.length < minImagesPerColumn) {
      const needed = minImagesPerColumn - col.length;
      const duplicated = [...col];
      for (let i = 0; i < needed; i++) {
        duplicated.push(col[i % col.length]);
      }
      return duplicated;
    }
    return col;
  };
  
  // Desktop columns
  const finalCol1 = duplicateIfNeeded(col1);
  const finalCol2 = duplicateIfNeeded(col2);
  const finalCol3 = duplicateIfNeeded(col3);
  const finalCol4 = duplicateIfNeeded(col4);
  
  // Mobile columns - duplicate to ensure smooth parallax scrolling
  // Each mobile column should have enough images for smooth scrolling
  const mobileImagesPerColumn = Math.ceil(totalServices / 2);
  const minMobileImagesPerColumn = Math.max(mobileImagesPerColumn, 10);
  const duplicateMobileIfNeeded = (col: typeof mobileCol1) => {
    if (col.length < minMobileImagesPerColumn) {
      const needed = minMobileImagesPerColumn - col.length;
      const duplicated = [...col];
      for (let i = 0; i < needed; i++) {
        duplicated.push(col[i % col.length]);
      }
      return duplicated;
    }
    return col;
  };
  
  const finalMobileCol1 = duplicateMobileIfNeeded(mobileCol1);
  const finalMobileCol2 = duplicateMobileIfNeeded(mobileCol2);

  return (
    <div className="w-full bg-[#eee] text-black rounded-3xl overflow-hidden mt-6">
      <div className="font-geist flex min-h-[30vh] sm:h-[25vh] items-center justify-center gap-2 relative py-8 sm:py-0">
        <div className="absolute left-0 top-[50%] -translate-y-1/2 w-full max-w-6xl px-4 container mx-auto">
          <div className="text-left">
            <div style={{ fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15, marginBottom: "clamp(16px, 2vw, 24px)" }}>
              Our services.
            </div>
            <p className="body-text" style={{ maxWidth: "min(640px, 100%)", fontSize: "clamp(14px, 1.8vw, 16px)", color: "#3A3A3A", lineHeight: 1.6 }}>
              9 categories, 43 services — everything your business needs to automate, grow, and scale intelligently.
            </p>
            <div className="md:hidden" style={{ marginTop: 14 }}>
              <SectionLabel number="01" title="SERVICES" />
            </div>
          </div>
        </div>
        <div className="absolute left-1/2 bottom-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-black">
          <span className="services-scroll-hint-text relative max-w-[18ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-white after:to-black after:content-['']">
            scroll down to see
          </span>
        </div>
      </div>

      <div
        ref={gallery}
        className="relative box-border flex overflow-hidden bg-white"
        style={{ 
          height: isMobile ? "350vh" : "300vh",
          gap: isMobile ? "1vw" : "1vw",
          padding: isMobile ? "0" : "1.5vw"
        }}
      >
        {isMobile ? (
          <>
            <Column images={finalMobileCol1} y={y} isMobile={isMobile} />
            <Column images={finalMobileCol2} y={y2} isMobile={isMobile} />
          </>
        ) : (
          <>
            <Column images={finalCol1} y={y} isMobile={isMobile} />
            <Column images={finalCol2} y={y2} isMobile={isMobile} />
            <Column images={finalCol3} y={y3} isMobile={isMobile} />
            <Column images={finalCol4} y={y4} isMobile={isMobile} />
          </>
        )}
      </div>
    </div>
  );
};

// ─── tiny easing helpers (deck: ease-in lift from back, ease-out scale) ─
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}

// ─── types ────────────────────────────────────────────────────────────────────
interface ServiceCard {
  image: string;
  name: string;
  category: string;
  slug: string;
}

// ─── component ────────────────────────────────────────────────────────────────
const ServicesBottomDeck = ({ services }: { services: ServiceCard[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const flyingCardRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [viewport, setViewport] = useState({ vh: 800, vw: 1024, isMobile: false });

  // Avoid an extremely tall sticky section when there are many services.
  const deckServices = useMemo(() => {
    const maxCards = viewport.isMobile ? 7 : 9;
    if (services.length <= maxCards) return services;

    const sampled: ServiceCard[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < maxCards; i++) {
      const idx = Math.round((i * (services.length - 1)) / (maxCards - 1));
      const s = services[idx];
      if (!seen.has(s.slug)) {
        sampled.push(s);
        seen.add(s.slug);
      }
    }
    return sampled;
  }, [services, viewport.isMobile]);

  // ── viewport tracking ─────────────────────────────────────────────────────
  useEffect(() => {
    const update = () =>
      setViewport({
        vh: window.innerHeight,
        vw: window.innerWidth,
        isMobile: window.innerWidth < 768,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── layout constants ──────────────────────────────────────────────────────
  const PX_PER_CARD = viewport.isMobile ? 300 : 250;
  const DECK_PEEK = viewport.isMobile ? 10 : 12;       // px each background card peeks
  const DECK_SIDE_PEEK = viewport.isMobile ? 6 : 9;    // px horizontal offset per depth
  const TOP_DECK_PEEK = viewport.isMobile ? 7 : 9;     // px peek between landed cards
  const TOP_DECK_SIDE_PEEK = viewport.isMobile ? 4 : 6; // px side offset between landed cards
  // Bottom-deck flight depth cues only (keeps top deck logic unchanged).
  const FLIGHT_BACK_OFFSET_Y = viewport.isMobile ? 18 : 24;
  const FLIGHT_BACK_OFFSET_X = viewport.isMobile ? 8 : 12;
  const FLIGHT_BACK_SCALE = viewport.isMobile ? 0.95 : 0.94;
  // Back of deck = largest; front (toward viewer) = smallest — depth via scale only
  const DECK_SCALE_MIN = viewport.isMobile ? 0.86 : 0.88;
  const DECK_SCALE_MAX = 1;

  const totalN = deckServices.length;
  // Total scroll height: one full viewport to "enter" + each card gets PX_PER_CARD to animate
  const scrollHeight = viewport.vh + totalN * PX_PER_CARD + 300;

  // ── GSAP setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || totalN === 0) return;

    const cards = cardRefs.current
      .slice(0, totalN)
      .filter(Boolean) as HTMLDivElement[];
    const flyingCards = flyingCardRefs.current
      .slice(0, totalN)
      .filter(Boolean) as HTMLDivElement[];
    if (cards.length !== totalN || flyingCards.length !== totalN) return;

    const { vh, vw, isMobile } = viewport;

    // ── card dimensions ──────────────────────────────────────────────────
    const isTablet = !isMobile && vw < 1024;
    const isLaptop = vw >= 1024 && vw < 1440;
    const isDesktop = vw >= 1024;
    const desktopWidthScale = isDesktop ? 0.72 : 1;
    const desktopHeightScale = isDesktop ? 0.6 : 1;

    // Responsive sizing across all screens:
    // - mobile: compact
    // - tablet: wider but still stacked comfortably
    // - laptop/desktop: slightly smaller than before
    // - large monitor: balanced max width
    const baseCardW = isMobile
      ? Math.min(vw * 0.92, 390)
      : isTablet
        ? Math.min(vw * 0.9, 860)
        : isLaptop
          ? Math.min(vw * 0.76, 980)
          : Math.min(vw * 0.72, 1100);

    const baseCardH = isMobile ? 280 : isTablet ? 360 : isLaptop ? 380 : 400;
    const cardW = baseCardW * desktopWidthScale;
    const cardH = baseCardH * desktopHeightScale;

    // The deck rests at the bottom-center of the viewport.
    // card[0] is the FRONT (smallest); card[totalN-1] is the BACK (largest).
    // Scroll order: back leaves first (index totalN-1), front last (index 0).
    // "deckBottomY" = translateY that places the card's center near the bottom of the screen.
    // "landedTopY"  = translateY that places the card's center near the top of the screen.
    //
    // All positions are relative to the sticky container's center (50% / 50%).
    // Position cards so their edges are closer to the viewport bounds.
    // We keep image sizing/cropping the same; only the deck offsets change.
    const bottomMargin = isMobile ? 10 : 14;
    // Keep landed cards clear of the fixed header so top content isn't clipped.
    // Mobile previously used a very small margin, which caused the top card to get cut.
    const topMargin = isMobile ? 76 : 88;

    // With `top: 50%` + `yPercent: -50`, `y` is the pixel offset of the card center.
    // cardTop = vh/2 + y - cardH/2
    // cardBottom = vh/2 + y + cardH/2
    // => y = vh/2 - cardH/2 - bottomMargin (resting deck)
    // => y = -vh/2 + cardH/2 + topMargin (landed top)
    const deckBottomY = vh * 0.5 - cardH * 0.5 - bottomMargin;
    const landedTopY = -vh * 0.5 + cardH * 0.5 + topMargin;

    const deckRestingScale = (d: number, remainingInDeck: number): number => {
      if (remainingInDeck <= 1) return DECK_SCALE_MAX;
      const maxD = remainingInDeck - 1;
      return DECK_SCALE_MIN + (d / maxD) * (DECK_SCALE_MAX - DECK_SCALE_MIN);
    };

    // ── initialise all cards ─────────────────────────────────────────────
    // card[0] = front of deck (smallest), card[totalN-1] = back (largest)
    cards.forEach((el, i) => {
      const remainingInDeck = totalN;
      const d = i;
      const initialScale = deckRestingScale(d, remainingInDeck);
      gsap.set(el, {
        position: "absolute",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        width: cardW,
        height: cardH,
        // card[0] is on top → highest zIndex
        zIndex: totalN - i,
        // Each card in the deck peeks below and slightly to the side.
        y: deckBottomY + i * DECK_PEEK,
        x: -i * DECK_SIDE_PEEK,
        scale: initialScale,
        transformOrigin: "center bottom",
        willChange: "transform",
        borderRadius: 22,
        overflow: "hidden",
      });
    });

    flyingCards.forEach((el, i) => {
      const remainingInDeck = totalN;
      const d = i;
      const initialScale = deckRestingScale(d, remainingInDeck);
      gsap.set(el, {
        position: "absolute",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        width: cardW,
        height: cardH,
        y: deckBottomY + i * DECK_PEEK,
        x: -i * DECK_SIDE_PEEK,
        scale: initialScale,
        transformOrigin: "center bottom",
        willChange: "transform",
        borderRadius: 22,
        overflow: "hidden",
        zIndex: 3000,
        opacity: 0,
        pointerEvents: "none",
      });
    });

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        // rawProgress goes 0 → totalN (one unit per card, back → front)
        const rawProgress = self.progress * totalN;
        const landedCount = gsap.utils.clamp(0, totalN, Math.floor(rawProgress));

        cards.forEach((el, i) => {
          const flyingEl = flyingCards[i];
          if (!flyingEl) return;
          // localP: 0 when this card hasn't started yet, 1 when fully landed at top.
          // Segment order: i = totalN-1 first (rawProgress 0→1), …, i = 0 last.
          const localP = gsap.utils.clamp(0, 1, rawProgress - (totalN - 1 - i));
          // Lift from the back: stay low in the stack first, then move up.
          const pMotion = easeInCubic(localP);
          const pScale = easeOutCubic(localP);

          // With back-first removal, indices 0..i-1 always stay above i until i’s turn.
          const cardsAboveInDeck = i;

          const remainingInDeck = totalN - Math.floor(rawProgress);

          // Resting position for this card while still in deck
          const restingY = deckBottomY + cardsAboveInDeck * DECK_PEEK;
          const restingX = -cardsAboveInDeck * DECK_SIDE_PEEK;
          const restingScale = deckRestingScale(i, remainingInDeck);
          const landingOrder = totalN - 1 - i; // 0 = first landed, grows as more cards land
          const isLanded = localP >= 1 && landingOrder < landedCount;
          const isFlying = localP > 0 && localP < 1;
          // Older landed cards get pushed back/down so newest appears on top/front.
          const landedDepth = isLanded ? landedCount - 1 - landingOrder : 0;
          const landedX = landedDepth * TOP_DECK_SIDE_PEEK;
          const landedY = landedTopY + landedDepth * TOP_DECK_PEEK;

          const deckZ = totalN - i;
          const landedZ = 2000 + landingOrder;

          // Base layer: only deck + landed stack; active moving card is hidden here.
          const baseX = isLanded ? landedX : restingX;
          const baseY = isLanded ? landedY : restingY;
          const baseScale = isLanded ? 1 : restingScale;
          const baseZ = isLanded ? landedZ : deckZ;
          gsap.set(el, { x: baseX, y: baseY, scale: baseScale, zIndex: baseZ, opacity: isFlying ? 0 : 1 });

          // Overlay layer: add subtle "from back" depth before coming forward.
          const backDepth = 1 - pMotion;
          const flightStartX = restingX - FLIGHT_BACK_OFFSET_X * backDepth;
          const flightStartY = restingY + FLIGHT_BACK_OFFSET_Y * backDepth;
          const flightStartScale = restingScale * (FLIGHT_BACK_SCALE + (1 - FLIGHT_BACK_SCALE) * pScale);
          const flyingX = flightStartX + (landedX - flightStartX) * (pMotion * 0.2);
          const flyingY = flightStartY + (landedY - flightStartY) * pMotion;
          const flyingScale = flightStartScale + (1 - flightStartScale) * pScale;
          gsap.set(flyingEl, {
            x: flyingX,
            y: flyingY,
            scale: flyingScale,
            zIndex: 3000,
            opacity: isFlying ? 1 : 0,
          });
        });
      },
    });

    return () => {
      st.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckServices, viewport.vh, viewport.vw, viewport.isMobile]);

  const renderServiceCard = (service: ServiceCard) => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 22,
        overflow: "hidden",
        background: "#F3F4F6",
        boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
        border: "1px solid rgba(17,19,23,0.08)",
        display: "flex",
        flexDirection: viewport.isMobile ? "column" : "row",
        alignItems: "stretch",
        gap: viewport.isMobile ? 10 : 14,
        padding: viewport.isMobile ? 10 : 12,
      }}
    >
      <div
        style={{
          flex: viewport.isMobile ? "0 0 54%" : "0 0 56%",
          minWidth: 0,
          borderRadius: 16,
          overflow: "hidden",
          background: "#0f1115",
          position: "relative",
        }}
      >
        <img
          src={service.image}
          alt={`${service.name} — service`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.02) 55%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: viewport.isMobile ? "4px 4px 6px" : "2px 8px 2px 4px",
        }}
      >
        <div
          style={{
            color: "#0B0E14",
            fontSize: viewport.isMobile ? "clamp(18px,4.8vw,22px)" : "clamp(22px,2.05vw,34px)",
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            marginBottom: viewport.isMobile ? 10 : 16,
          }}
        >
          {service.name}
        </div>
        <div
          style={{
            color: "rgba(17,19,23,0.86)",
            fontSize: viewport.isMobile ? "clamp(12px,3.2vw,15px)" : "clamp(14px,1.2vw,22px)",
            fontWeight: 450,
            lineHeight: 1.28,
            letterSpacing: "-0.005em",
            maxWidth: "30ch",
          }}
        >
          {service.category}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={wrapperRef} style={{ height: scrollHeight, position: "relative", width: "100%" }}>
      {/* Sticky container — stays in view while parent scrolls */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Card stack */}
        {deckServices.map((service, i) => (
          <div
            key={service.slug}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          >
            <Link
              href={`/services/${service.slug}`}
              aria-label={`Open ${service.name}`}
              style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
            >
              {renderServiceCard(service)}
            </Link>
          </div>
        ))}

        {/* Flying overlay cards: decoupled from deck and landed stacking. */}
        {deckServices.map((service, i) => (
          <div
            key={`${service.slug}-flying`}
            ref={(el) => {
              flyingCardRefs.current[i] = el;
            }}
            aria-hidden
            style={{ pointerEvents: "none" }}
          >
            {renderServiceCard(service)}
          </div>
        ))}

      
      </div>
    </div>
  );
};

export default function Services() {
  const finePointer = useFinePointer();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 768;
  const initialCategoryParam = params.get("category");

  const [viewMode, setViewMode] = useState<"ring" | "grid">("ring");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    !isMobileViewport && initialCategoryParam ? Number(initialCategoryParam) : null
  );
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [expandedFilter, setExpandedFilter] = useState<string | null>("category");

  useEffect(() => {
    const handler = () => setFilterOpen(prev => !prev);
    window.addEventListener("toggle-filter-panel", handler);
    return () => window.removeEventListener("toggle-filter-panel", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const body = document.body;
    const html = document.documentElement;

    const applyScrollLock = () => {
      const isMobile = window.innerWidth < 768;
      const shouldLock = filterOpen || (viewMode === "ring" && isMobile);
      const overflowValue = shouldLock ? "hidden" : "";
      body.style.overflow = overflowValue;
      html.style.overflow = overflowValue;
    };

    applyScrollLock();
    window.addEventListener("resize", applyScrollLock, { passive: true });
    return () => {
      window.removeEventListener("resize", applyScrollLock);
      body.style.overflow = "";
      html.style.overflow = "";
    };
  }, [filterOpen, viewMode]);

  useEffect(() => {
    const shouldOpenFilter = params.get("openFilter") === "1";
    if (!shouldOpenFilter) return;
    if (typeof window === "undefined" || window.innerWidth >= 768) return;
    setViewMode("ring");
    setFilterOpen(true);
  }, [search]);

  // GSAP reveal for grid view
  useEffect(() => {
    if (viewMode !== "grid") return;
    const localTriggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll(".gsap-reveal");
      reveals.forEach((el) => {
        const anim = gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
        });
        if (anim.scrollTrigger) localTriggers.push(anim.scrollTrigger);
      });
    }, 50);
    return () => { clearTimeout(timer); localTriggers.forEach(t => t.kill()); };
  }, [viewMode]);

  const filtered = useMemo(() => {
    return services.filter(s => {
      if (selectedCategory && s.categoryId !== selectedCategory) return false;
      if (selectedIndustry && !s.industries.some(ind => ind.toLowerCase().includes(selectedIndustry.toLowerCase()))) return false;
      if (selectedSize && s.engagementSize !== selectedSize) return false;
      if (selectedStatus && s.status !== selectedStatus) return false;
      return true;
    });
  }, [selectedCategory, selectedIndustry, selectedSize, selectedStatus]);

  // Dispatch filter count to header
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("update-filter-count", { detail: { count: filtered.length } }));
  }, [filtered.length]);

  // Dispatch view mode to header
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("update-view-mode", { detail: { mode: viewMode } }));
  }, [viewMode]);

  const clearAll = () => {
    setSelectedCategory(null);
    setSelectedIndustry(null);
    setSelectedSize(null);
    setSelectedStatus(null);
  };

  const handleFilterOptionSelect = (onSelect: (value: any) => void, value: any) => {
    onSelect(value);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setFilterOpen(false);
    }
  };

  // Prepare ring items - duplicate to reach 90 items
  const ringItems = useMemo(() => {
    const baseItems = filtered.map((s, i) => ({
      title: s.name,
      image: getServiceImage(s, i, filtered),
      url: `/services/${s.slug}`,
      category: s.category,
      categoryId: s.categoryId,
    }));
    
    // Duplicate items to reach 90 total
    const targetCount = 90;
    const repeatedItems: typeof baseItems = [];
    for (let i = 0; i < targetCount; i++) {
      repeatedItems.push(baseItems[i % baseItems.length]);
    }
    
    return repeatedItems;
  }, [filtered]);

  // Category labels for ring
  const ringCategoryLabels = useMemo(() => {
    const catCounts: Record<number, number> = {};
    filtered.forEach(s => { catCounts[s.categoryId] = (catCounts[s.categoryId] || 0) + 1; });
    const catPositions: { name: string; count: number; angle: number }[] = [];
    let currentIndex = 0;
    const uniqueCats = Array.from(new Set(filtered.map(s => s.categoryId)));
    for (const catId of uniqueCats) {
      const count = catCounts[catId] || 0;
      const cat = categories.find(c => c.id === catId);
      if (!cat || count === 0) continue;
      const midIndex = currentIndex + count / 2;
      const angle = midIndex * ((2 * Math.PI) / filtered.length);
      catPositions.push({ name: cat.name.split("&")[0].trim(), count, angle });
      currentIndex += count;
    }
    return catPositions;
  }, [filtered]);

  const pageCursor =
    !finePointer
      ? "auto"
      : viewMode === "grid" && typeof window !== "undefined" && window.innerWidth >= 768
        ? "auto"
        : "none";

  return (
    <div style={{ cursor: pageCursor }}>
      {finePointer && viewMode !== "grid" ? <CustomCursor /> : null}
      {/* ═══ FILTER PANEL — slides from LEFT with staggered items ═══ */}
      <div
        className="w-full sm:w-80 lg:w-96 pt-20"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "103.2vh",
          background: "#FFFFFF",
          borderRight: "1px solid #EEEEEE",
          zIndex: 100,
          transform: filterOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          overflowY: "auto",
          padding: "70px clamp(16px, 2vw, 24px)",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: "clamp(24px, 3vw, 32px)" }}>
          <div>
            <div style={{ fontSize: "clamp(20px, 2.5vw, 24px)", fontWeight: 600, color: "#1A1A1A" }}>Filter Services ({filtered.length})</div>
            <ParticleWrapper>
              <button onClick={clearAll} className="cta-link" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "#888888", marginTop: "clamp(2px, 0.5vw, 4px)" }}>
                Clear all
              </button>
            </ParticleWrapper>
          </div>
          <ParticleWrapper>
            <button
              onClick={() => setFilterOpen(false)}
              style={{ fontSize: "clamp(20px, 4vw, 24px)", color: "#1A1A1A", padding: "clamp(6px, 1.5vw, 8px)", transition: "transform 0.3s ease", cursor: finePointer ? "none" : "pointer" }}
              onMouseEnter={e => e.currentTarget.style.transform = "rotate(90deg)"}
              onMouseLeave={e => e.currentTarget.style.transform = "rotate(0)"}
            >
              ×
            </button>
          </ParticleWrapper>
        </div>

        {[
          { key: "category", label: "CATEGORY", items: [{ label: "All", value: null as any }, ...categories.map(c => ({ label: c.name, value: c.id }))], selected: selectedCategory, onSelect: setSelectedCategory },
          { key: "industry", label: "INDUSTRY", items: [{ label: "All", value: null as any }, ...industries.map(ind => ({ label: ind, value: ind }))], selected: selectedIndustry, onSelect: setSelectedIndustry },
          { key: "size", label: "ENGAGEMENT SIZE", items: [{ label: "All", value: null as any }, ...engagementSizes.map(s => ({ label: s, value: s }))], selected: selectedSize, onSelect: setSelectedSize },
          { key: "status", label: "STATUS", items: [{ label: "All", value: null as any }, ...statuses.map(s => ({ label: s, value: s }))], selected: selectedStatus, onSelect: setSelectedStatus },
        ].map((group) => (
          <div key={group.key} style={{ borderTop: "1px solid #EEEEEE" }}>
            <ParticleWrapper>
              <button
                onClick={() => setExpandedFilter(expandedFilter === group.key ? null : group.key)}
                className="w-full flex items-center justify-between"
                style={{ padding: "clamp(12px, 2vw, 16px) 0", fontSize: "clamp(10px, 1.8vw, 11px)", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888888", cursor: finePointer ? "none" : "pointer" }}
              >
                {group.label}
                <span style={{ fontSize: "clamp(14px, 2.5vw, 16px)", transition: "transform 0.3s ease", transform: expandedFilter === group.key ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
            </ParticleWrapper>
            <div
              style={{
                maxHeight: expandedFilter === group.key ? "clamp(400px, 80vh, 600px)" : 0,
                overflow: "hidden",
                transition: "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div style={{ paddingBottom: "clamp(12px, 2vw, 16px)" }}>
                {group.items.map((item, i) => (
                  <ParticleWrapper key={i}>
                    <button
                      onClick={() => handleFilterOptionSelect(group.onSelect, item.value)}
                      className="block w-full text-left service-row-hover"
                      style={{
                        padding: "clamp(6px, 1.5vw, 8px) 0",
                        fontSize: "clamp(12px, 2.2vw, 14px)",
                        fontWeight: group.selected === item.value ? 600 : 400,
                        color: group.selected === item.value ? "#1A1A1A" : "#3A3A3A",
                        transition: "all 0.3s ease",
                        cursor: finePointer ? "none" : "pointer",
                      }}
                    >
                      {item.label}
                      {group.selected === item.value && <span style={{ marginLeft: "clamp(6px, 1.5vw, 8px)", fontSize: "clamp(10px, 1.8vw, 11px)" }}>●</span>}
                    </button>
                  </ParticleWrapper>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay with fade */}
      <div
        onClick={() => setFilterOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.15)",
          zIndex: 99,
          opacity: filterOpen ? 1 : 0,
          pointerEvents: filterOpen ? "auto" : "none",
          transition: "opacity 0.4s ease",
        }}
      />

      {/* ═══ RING VIEW ═══ */}
      {viewMode === "ring" && (
        <div style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
          <div className="fixed top-20 sm:top-20 md:top-24 left-3 sm:left-4 md:left-6 lg:left-8 z-[60]">
            <ParticleWrapper>
              <button
                onClick={() => setFilterOpen(true)}
                className="font-medium text-[var(--ink)] tracking-[0.02em] bg-[rgba(248,248,246,0.88)] backdrop-blur-md border border-[rgba(17,19,23,0.12)] rounded-[20px]"
                style={{ 
                  fontSize: "clamp(10px, 2vw, 13px)",
                  padding: "clamp(4px, 1vw, 6px) clamp(10px, 2.5vw, 16px)",
                  cursor: finePointer ? "none" : "pointer",
                }}
              >
                Filter Services +
              </button>
            </ParticleWrapper>
          </div>
          <div className="fixed top-20 sm:top-20 md:top-24 right-3 sm:right-4 md:right-6 lg:right-8 z-[60]">
            <ParticleWrapper>
              <button
                onClick={() => setViewMode("grid")}
                className="font-medium text-[var(--ink)] tracking-[0.02em] bg-[rgba(248,248,246,0.88)] backdrop-blur-md border border-[rgba(17,19,23,0.12)] rounded-[20px]"
                style={{ 
                  fontSize: "clamp(10px, 2vw, 13px)",
                  padding: "clamp(4px, 1vw, 6px) clamp(10px, 2.5vw, 16px)",
                  cursor: finePointer ? "none" : "pointer",
                }}
              >
               Grid view
              </button>
            </ParticleWrapper>
          </div>
          <ParticleWrapper>
            <RotorGallery 
              items={ringItems} 
              gapPx={500}
              speedSec={45}
              camY={5}
              categoryLabels={ringCategoryLabels}
            />
          </ParticleWrapper>
        </div>
      )}

      {/* ═══ BOTTOM DECK VIEW ═══ */}
      {viewMode === "grid" && (
        <div className="pt-10 sm:pt-12 md:pt-16 lg:pt-20">
          <div className="fixed top-20 sm:top-20 md:top-24 right-3 sm:right-4 md:right-6 lg:right-8 z-[60]">
            <ParticleWrapper>
              <button
                onClick={() => setViewMode("ring")}
                className="font-medium text-[var(--ink)] tracking-[0.02em] bg-[rgba(248,248,246,0.88)] backdrop-blur-md border border-[rgba(17,19,23,0.12)] rounded-[20px]"
                style={{ 
                  fontSize: "clamp(10px, 2vw, 13px)",
                  padding: "clamp(4px, 1vw, 6px) clamp(10px, 2.5vw, 16px)",
                  cursor: finePointer ? "none" : "pointer",
                }}
              >
                Ring view ○
              </button>
            </ParticleWrapper>
          </div>

          <div className="section-padding">
            <div className="container">
              <ParticleWrapper>
                <button onClick={() => setFilterOpen(true)} className="md:hidden cta-link" style={{ marginTop: "clamp(16px, 3vw, 24px)", fontSize: "clamp(12px, 2.2vw, 14px)" }}>
                  Filter Services +
                </button>
              </ParticleWrapper>

              {/* Scroll-driven bottom deck of service cards */}
              <ServicesBottomDeck
                services={filtered.map((service, i) => ({
                  image: getServiceImage(service, i, filtered),
                  name: service.name,
                  category: service.category,
                  slug: service.slug,
                }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}