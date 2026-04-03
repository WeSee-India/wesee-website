import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
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
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80", // 0  robot
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80", // 1  circuit
  "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&q=80", // 2  ai lab
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80", // 3  tech
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80", // 4  server
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", // 5  analytics
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80", // 6  office
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80", // 7  charts
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80", // 8  workspace
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80", // 9  abstract data
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80", // 10 laptop
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80", // 11 social media
  "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80", // 12 marketing
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80", // 13 coding
  "https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?w=600&q=80", // 14 content
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80", // 15 writing
  "https://images.unsplash.com/photo-1542435503-956c469947f6?w=600&q=80", // 16 blog
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80", // 17 email
  "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&q=80", // 18 message
  "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&q=80", // 19 chat
  "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=600&q=80", // 20 communication
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80", // 21 design desk
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80", // 22 branding
  "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&q=80", // 23 web ui
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80", // 24 design tool
  "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&q=80", // 25 creative
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80", // 26 ecommerce
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80", // 27 shopping
  "https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=600&q=80", // 28 marketplace
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80", // 29 store
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80", // 30 packaging
  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600&q=80", // 31 sales office
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80", // 32 crm
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80", // 33 team meeting
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80", // 34 revenue
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", // 35 cloud infra
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80", // 36 data center
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", // 37 operations
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80", // 38 hr team
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", // 39 person laptop
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&q=80", // 40 code screen
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80", // 41 matrix
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80", // 42 macbook code
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

// ─── types ────────────────────────────────────────────────────────────────────
interface ServiceCard {
  image: string;
  name: string;
  category: string;
  slug: string;
}

// ─── Category accent colors for left border ─────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  "AI Agents & Conversational AI": "#6366f1",
  "Workflow & Business Process Automation": "#22c55e",
  "Performance Marketing & Paid Advertising": "#f59e0b",
  "SEO, Content & Organic Growth": "#06b6d4",
  "Messaging, Email & Communication": "#ec4899",
  "Web Design, Branding & Creative": "#8b5cf6",
  "E-Commerce & Marketplace Growth": "#f97316",
  "Sales, CRM & Revenue Operations": "#3b82f6",
  "Business Operations & Infrastructure": "#14b8a6",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "#6366f1";
}


// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 1: Magazine List — editorial list with clip-path image reveal on hover
// ═══════════════════════════════════════════════════════════════════════════════
const MagazineRow = ({ svc, accent }: { svc: ServiceCard; accent: string }) => {
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = rowRef.current;
    if (!el) return;
    const { top, height } = el.getBoundingClientRect();
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 4}deg) translateZ(6px)`;
  };
  const onLeave = () => {
    if (rowRef.current) rowRef.current.style.transform = "perspective(900px) rotateX(0deg) translateZ(0)";
  };

  return (
    <Link href={`/services/${svc.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        ref={rowRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); onLeave(); }}
        onMouseMove={onMove}
        style={{
          display: "flex", alignItems: "center", gap: 0,
          borderBottom: "1px solid #E8E8E5",
          padding: "clamp(16px, 2.5vw, 28px) 0",
          cursor: "pointer",
          position: "relative",
          transition: "transform 0.2s ease",
        }}
      >
        {/* Accent bar */}
        <div style={{ width: 3, alignSelf: "stretch", background: accent, borderRadius: 2, marginRight: "clamp(12px, 2vw, 24px)", flexShrink: 0 }} />

        {/* Image — clip-path wipes in on hover via JS state */}
        <div style={{
          width: "clamp(120px, 22vw, 300px)", height: "clamp(80px, 14vw, 180px)",
          flexShrink: 0, overflow: "hidden", borderRadius: 10, marginRight: "clamp(16px, 3vw, 40px)",
          position: "relative",
        }}>
          <div style={{
            clipPath: hovered ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            transition: "clip-path 600ms cubic-bezier(0.22, 1, 0.36, 1)",
            width: "100%", height: "100%",
          }}>
            <img src={svc.image} alt={svc.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>
            {svc.category}
          </div>
          <div style={{
            fontSize: "clamp(18px, 2.8vw, 34px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.1, letterSpacing: "-0.02em",
            transform: hovered ? "translateX(12px)" : "translateX(0)",
            transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            {svc.name}
          </div>
        </div>

        {/* Arrow */}
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none"
          style={{
            flexShrink: 0, marginLeft: 16,
            transform: hovered ? "translate(4px, -4px)" : "translate(0, 0)",
            transition: "transform 300ms ease",
          }}
        >
          <path d="M5 15L15 5M15 5H7M15 5V13" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
};

const ServicesMagazineList = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ maxWidth: 1400, margin: "0 auto", padding: "80px clamp(16px, 4vw, 48px) 60px" }}>
    {services.map((svc, i) => {
      const accent = getCategoryColor(svc.category);
      return (
        <motion.div
          key={svc.slug}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <MagazineRow svc={svc} accent={accent} />
        </motion.div>
      );
    })}
  </div>
);

// ─── Masonry card with magnetic 3D tilt + glare (Linear / Raycast style) ───────
const MasonryCard3D = ({ svc, tier, accent }: { svc: ServiceCard; tier: string; accent: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;   // –0.5 … 0.5
    const y = (e.clientY - top)  / height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * 13}deg) rotateY(${x * 13}deg) translateZ(14px) scale(1.02)`;
    el.style.boxShadow = `${-x * 20}px ${-y * 20}px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.08)`;
    // parallax image shift
    if (imgRef.current) imgRef.current.style.transform = `scale(1.06) translate(${x * -8}px, ${y * -8}px)`;
    // glare follows cursor
    if (glareRef.current) {
      const gx = (e.clientX - left) / width * 100;
      const gy = (e.clientY - top)  / height * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, transparent 65%)`;
      glareRef.current.style.opacity = "1";
    }
  };

  const onLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = `perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)`;
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
    if (imgRef.current) imgRef.current.style.transform = "scale(1) translate(0,0)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <Link href={`/services/${svc.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          background: "#fff", borderRadius: 14, overflow: "hidden",
          border: "1px solid rgba(17,19,23,0.06)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {/* Image with parallax */}
        <div style={{ aspectRatio: tier, overflow: "hidden", position: "relative" }}>
          <img
            ref={imgRef}
            src={svc.image} alt={svc.name} loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                     transition: "transform 0.18s ease" }}
          />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
                        background: `linear-gradient(to top, ${accent}22, transparent)`, pointerEvents: "none" }} />
        </div>
        {/* Text */}
        <div style={{ padding: "10px 12px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent, flexShrink: 0 }} />
            <div style={{ fontSize: "clamp(9px, 1vw, 11px)", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>{svc.category}</div>
          </div>
          <div style={{ fontSize: "clamp(13px, 1.3vw, 16px)", fontWeight: 600, color: "#1A1A1A", lineHeight: 1.25 }}>{svc.name}</div>
        </div>
        {/* Glare overlay */}
        <div ref={glareRef} style={{ position: "absolute", inset: 0, opacity: 0,
          transition: "opacity 0.25s ease", pointerEvents: "none", borderRadius: 14 }} />
      </div>
    </Link>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 2: Masonry Waterfall — Pinterest-style varying heights with CSS columns
// ═══════════════════════════════════════════════════════════════════════════════
const ServicesMasonryGrid = ({ services }: { services: ServiceCard[] }) => {
  const tiers = ["3/4", "4/3", "16/9"] as const;
  return (
    <div style={{
      maxWidth: 1400, margin: "0 auto",
      padding: "80px clamp(12px, 3vw, 32px) 60px",
      columnCount: 4, columnGap: "clamp(10px, 1.5vw, 18px)",
    }}
    className="max-[1200px]:[column-count:3] max-[768px]:[column-count:2]"
    >
      {services.map((svc, i) => {
        const accent = getCategoryColor(svc.category);
        const tier = tiers[i % 3];
        return (
          <motion.div
            key={svc.slug}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (i % 4) * 0.06 }}
            style={{ breakInside: "avoid", marginBottom: "clamp(10px, 1.5vw, 18px)" }}
          >
            <MasonryCard3D svc={svc} tier={tier} accent={accent} />
          </motion.div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 3: Horizontal Filmstrip — sticky scroll-driven 3D Cover Flow carousel
// ALL transforms applied imperatively in RAF (no React setState → no re-renders)
// ═══════════════════════════════════════════════════════════════════════════════
const ServicesFilmstrip = ({ services }: { services: ServiceCard[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentX = useRef(0);
  const rafId = useRef(0);
  const cardW = typeof window !== "undefined" && window.innerWidth < 768 ? 220 : 280;
  const gap = 20;
  const maxScroll = Math.max(0, services.length * (cardW + gap) - (typeof window !== "undefined" ? window.innerWidth : 1024));
  const wrapperH = (typeof window !== "undefined" ? window.innerHeight : 700) + maxScroll;
  const viewportCenter = typeof window !== "undefined" ? window.innerWidth / 2 : 600;

  // ALL transforms applied directly to DOM — zero React re-renders per frame
  useEffect(() => {
    const accentColors = services.map(s => getCategoryColor(s.category));

    const animate = () => {
      const wrapper = wrapperRef.current;
      const scrolledIn = wrapper ? Math.max(0, -wrapper.getBoundingClientRect().top) : 0;
      const target = Math.min(maxScroll, scrolledIn);
      currentX.current += (target - currentX.current) * 0.08;
      const cx = currentX.current;

      if (stripRef.current) stripRef.current.style.transform = `translateX(${-cx}px)`;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const cardCenter = i * (cardW + gap) + cardW / 2;
        const signedDist = cardCenter - cx - viewportCenter;
        const absDist = Math.abs(signedDist);
        const isCenter = absDist < cardW * 0.6;
        const maxRot = 42;
        const rotY = isCenter ? 0 : Math.sign(signedDist) * Math.min(maxRot, (absDist / (cardW * 1.2)) * maxRot);
        const sc = isCenter ? 1.1 : Math.max(0.78, 1 - absDist / (cardW * 6));
        const tz = isCenter ? 60 : -Math.min(90, absDist / (cardW * 0.6) * 30);
        const op = isCenter ? 1 : Math.max(0.35, 1 - absDist / (cardW * 3.5));
        const accent = accentColors[i];

        card.style.transform = `scale(${sc}) rotateY(${rotY}deg) translateZ(${tz}px)`;
        card.style.opacity = String(op);
        card.style.boxShadow = isCenter
          ? `0 0 80px ${accent}40, 0 30px 60px rgba(0,0,0,0.5)`
          : "0 4px 20px rgba(0,0,0,0.3)";

        const img = card.querySelector("img") as HTMLImageElement | null;
        if (img) img.style.transform = isCenter ? "scale(1.05)" : "scale(1)";

        const bar = card.querySelector("[data-accent-bar]") as HTMLElement | null;
        if (bar) bar.style.opacity = isCenter ? "0.9" : "0";

        const nameEl = card.querySelector("[data-name]") as HTMLElement | null;
        if (nameEl) nameEl.style.fontSize = isCenter ? "17px" : "15px";

        const lineEl = card.querySelector("[data-line]") as HTMLElement | null;
        if (lineEl) lineEl.style.width = isCenter ? "40px" : "24px";
      });

      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [services, cardW, gap, maxScroll, viewportCenter]);

  return (
    // Tall wrapper provides the scroll travel for horizontal movement
    <div ref={wrapperRef} style={{ height: wrapperH, position: "relative" }}>
      {/* Sticky panel — stays in view as you scroll through the wrapper */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#0B0E14",
                    perspective: "1400px", perspectiveOrigin: "50% 50%" }}>
        {/* Strip — translateX drives horizontal movement */}
        <div
          ref={stripRef}
          style={{
            display: "flex", alignItems: "center", gap,
            height: "100%",
            paddingLeft: viewportCenter - cardW / 2,
            paddingRight: viewportCenter - cardW / 2,
            transformStyle: "preserve-3d",
          }}
        >
          {services.map((svc, i) => {
            const accent = getCategoryColor(svc.category);
            return (
              <Link key={svc.slug} href={`/services/${svc.slug}`}
                    style={{ textDecoration: "none", flexShrink: 0, transformStyle: "preserve-3d" }}>
                {/* ref stored in cardRefs — RAF updates all transforms imperatively */}
                <div ref={el => { cardRefs.current[i] = el; }} style={{
                  width: cardW, height: "clamp(320px, 55vh, 480px)",
                  borderRadius: 16, overflow: "hidden", position: "relative",
                  background: "#1a1d24",
                  opacity: 0, // RAF will set initial value on first frame
                  cursor: "pointer",
                }}>
                  <div style={{ width: "100%", height: "70%", overflow: "hidden" }}>
                    <img src={svc.image} alt={svc.name} loading="lazy"
                         style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                                  transition: "transform 0.35s ease" }} />
                  </div>
                  <div style={{ position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(11,14,20,0.95) 0%, rgba(11,14,20,0.25) 45%, transparent 65%)",
                    pointerEvents: "none" }} />
                  {/* Accent bar — shown only on center card, controlled by RAF */}
                  <div data-accent-bar="" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: accent, opacity: 0, borderRadius: "16px 16px 0 0",
                    transition: "opacity 0.3s ease" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px 20px" }}>
                    <div data-name="" style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 6,
                                  transition: "font-size 0.3s ease" }}>{svc.name}</div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: accent, textTransform: "uppercase", letterSpacing: "0.1em" }}>{svc.category}</div>
                    <div data-line="" style={{ width: 24, height: 2, background: accent, borderRadius: 1, marginTop: 10, opacity: 0.7,
                                  transition: "width 0.3s ease" }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", fontSize: 10,
                      letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}>
          scroll to browse
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 4: Diagonal Split — award-winning editorial full-bleed cards (Awwwards)
// Image fills the card, diagonal gradient overlay, glowing accent border on hover
// ═══════════════════════════════════════════════════════════════════════════════
const DiagonalCard = ({ svc, accent, index }: { svc: ServiceCard; accent: string; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "translateY(-8px) scale(1.01)";
      cardRef.current.style.boxShadow = `0 28px 70px rgba(0,0,0,0.18), 0 0 0 2px ${accent}`;
    }
    if (imgRef.current) imgRef.current.style.transform = "scale(1.09)";
    if (glowRef.current) glowRef.current.style.opacity = "1";
  };
  const onLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "translateY(0) scale(1)";
      cardRef.current.style.boxShadow = "0 4px 24px rgba(0,0,0,0.1)";
    }
    if (imgRef.current) imgRef.current.style.transform = "scale(1)";
    if (glowRef.current) glowRef.current.style.opacity = "0";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.09 }}
    >
      <Link href={`/services/${svc.slug}`} style={{ textDecoration: "none", display: "block" }}>
        <div
          ref={cardRef}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{
            borderRadius: 18, overflow: "hidden",
            background: "#0d0d0d",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease",
            cursor: "pointer", position: "relative",
            aspectRatio: "4/5",
          }}
        >
          {/* Full-bleed image */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img
              ref={imgRef}
              src={svc.image} alt={svc.name} loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                       transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </div>

          {/* Diagonal gradient overlay — bottom-heavy */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(165deg, transparent 35%, rgba(5,5,8,0.95) 68%)",
            pointerEvents: "none",
          }} />

          {/* Diagonal accent glow — animates in on hover */}
          <div ref={glowRef} style={{
            position: "absolute", inset: 0, opacity: 0,
            background: `linear-gradient(165deg, transparent 33%, ${accent}30 37%, transparent 42%)`,
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }} />

          {/* Category chip top-left */}
          <div style={{
            position: "absolute", top: 16, left: 16,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)",
            border: `1px solid ${accent}60`,
            borderRadius: 20, padding: "4px 11px",
            fontSize: 9, fontWeight: 700, color: accent,
            textTransform: "uppercase", letterSpacing: "0.12em",
          }}>
            {svc.category.split(" ")[0]}
          </div>

          {/* Bottom text block */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "22px 20px 22px",
          }}>
            <div style={{
              fontSize: "clamp(14px, 1.6vw, 19px)", fontWeight: 700, color: "#fff",
              lineHeight: 1.2, marginBottom: 10,
            }}>{svc.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 2, background: accent, borderRadius: 1, flexShrink: 0 }} />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.42)", textTransform: "uppercase",
                            letterSpacing: "0.1em" }}>
                {svc.category.split("&")[0].trim()}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{
            position: "absolute", bottom: 20, right: 18,
            width: 30, height: 30, borderRadius: "50%",
            border: `1px solid ${accent}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, color: accent,
            transition: "transform 0.3s ease",
          }}>↗</div>
        </div>
      </Link>
    </motion.div>
  );
};

const ServicesDiagonalSplit = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ maxWidth: 1400, margin: "0 auto", padding: "80px clamp(16px, 4vw, 48px) 60px" }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(clamp(240px, 26vw, 320px), 1fr))",
      gap: "clamp(12px, 2vw, 22px)",
    }}>
      {services.map((svc, i) => (
        <DiagonalCard key={svc.slug} svc={svc} accent={getCategoryColor(svc.category)} index={i} />
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 5: Terminal Grid — Vercel/Linear dark monospace with letter-scramble hover
// ═══════════════════════════════════════════════════════════════════════════════
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234789#@$%&";

const useTextScramble = (text: string, active: boolean): string => {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      setDisplay(text);
      frameRef.current = 0;
      return;
    }
    const upper = text.toUpperCase();
    const totalFrames = upper.length * 3 + 6;
    const tick = () => {
      const f = frameRef.current;
      const settled = Math.floor((f / totalFrames) * upper.length);
      const result = upper.split("").map((ch, i) => {
        if (ch === " ") return " ";
        if (i < settled) return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join("");
      setDisplay(result);
      frameRef.current++;
      if (f < totalFrames + 3) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(upper);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, text]);

  return display;
};

const TerminalRow = ({ svc, accent, index }: { svc: ServiceCard; accent: string; index: number }) => {
  const [hovered, setHovered] = useState(false);
  const scrambled = useTextScramble(svc.name, hovered);
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link href={`/services/${svc.slug}`} style={{ textDecoration: "none" }}>
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.38, ease: "easeOut", delay: (index % 10) * 0.03 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 150px 28px",
          alignItems: "center",
          gap: "clamp(10px, 2vw, 24px)",
          padding: "clamp(13px, 1.8vw, 18px) clamp(16px, 3vw, 32px)",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          cursor: "pointer",
          background: hovered ? `${accent}0d` : "transparent",
          transition: "background 0.2s ease",
          position: "relative",
        }}
      >
        {/* Left accent bar on hover */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
          background: accent,
          transform: hovered ? "scaleY(1)" : "scaleY(0)",
          transition: "transform 0.25s ease",
          transformOrigin: "top",
        }} />

        {/* Index */}
        <div style={{
          fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
          fontSize: 10, color: hovered ? accent : "rgba(255,255,255,0.18)",
          letterSpacing: "0.05em", transition: "color 0.2s ease",
        }}>
          {num}
        </div>

        {/* Scramble name */}
        <div style={{
          fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
          fontSize: "clamp(11px, 1.3vw, 14px)",
          fontWeight: 500,
          color: hovered ? "#fff" : "rgba(255,255,255,0.72)",
          letterSpacing: hovered ? "0.07em" : "0.02em",
          transition: "color 0.2s ease, letter-spacing 0.2s ease",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {scrambled}
        </div>

        {/* Category */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%", background: accent,
            flexShrink: 0, boxShadow: hovered ? `0 0 8px ${accent}` : "none",
            transition: "box-shadow 0.25s ease",
          }} />
          <div style={{
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
            letterSpacing: "0.1em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {svc.category.split("&")[0].trim().split(" ").slice(0, 2).join(" ")}
          </div>
        </div>

        {/* Arrow */}
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          border: `1px solid ${hovered ? accent : "rgba(255,255,255,0.12)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: hovered ? accent : "rgba(255,255,255,0.25)",
          transition: "all 0.22s ease",
          transform: hovered ? "translate(2px,-2px)" : "translate(0,0)",
          flexShrink: 0,
        }}>→</div>
      </motion.div>
    </Link>
  );
};

const ServicesTerminalGrid = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ background: "#07090E", minHeight: "100vh", paddingTop: 80, paddingBottom: 60 }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Terminal header bar */}
      <div style={{ padding: "0 clamp(16px, 3vw, 32px) 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 7 }}>
            {["#e74c3c", "#f39c12", "#2ecc71"].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em",
          }}>
            wesee — services ({services.length})
          </div>
        </div>
        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "44px 1fr 150px 28px",
          gap: "clamp(10px, 2vw, 24px)",
          padding: "9px clamp(16px, 3vw, 32px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {["#", "SERVICE", "CATEGORY", ""].map((h, i) => (
            <div key={i} style={{
              fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: 9, color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}>{h}</div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {services.map((svc, i) => (
        <TerminalRow key={svc.slug} svc={svc} accent={getCategoryColor(svc.category)} index={i} />
      ))}

      {/* Footer */}
      <div style={{ padding: "0 clamp(16px, 3vw, 32px)" }}>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginTop: 4 }} />
        <div style={{
          fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
          fontSize: 9, color: "rgba(255,255,255,0.15)", letterSpacing: "0.08em",
          marginTop: 12,
        }}>
          {services.length} services listed · hover to explore
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 6: Stacked Scroll — Stripe / Lusion-style cards that peel off the stack
// Each card is full-viewport; scrolling peels the top card upward revealing the next
// ═══════════════════════════════════════════════════════════════════════════════
const ServicesStackedScroll = ({ services }: { services: ServiceCard[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);

  const count = Math.min(services.length, 14);
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const scrollPerCard = vh * 0.85;
  const totalH = count * scrollPerCard + vh;

  useEffect(() => {
    const animate = () => {
      if (!wrapperRef.current) return;
      const scrolled = Math.max(0, -wrapperRef.current.getBoundingClientRect().top);

      cardEls.current.forEach((card, i) => {
        if (!card) return;
        const start = i * scrollPerCard;
        const progress = Math.max(0, Math.min(1, (scrolled - start) / scrollPerCard));
        const ty = progress * -108;             // slide up 108vh
        const sc = 1 - progress * 0.04;         // subtle scale-down
        const op = progress > 0.82 ? 1 - (progress - 0.82) * 5.5 : 1;
        card.style.transform = `translateY(${ty}%) scale(${sc})`;
        card.style.opacity = String(Math.max(0, op));
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [count, scrollPerCard]);

  return (
    <div ref={wrapperRef} style={{ height: totalH, position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#000" }}>
        {services.slice(0, count).map((svc, i) => {
          const accent = getCategoryColor(svc.category);
          return (
            <div
              key={svc.slug}
              ref={el => { cardEls.current[i] = el; }}
              style={{
                position: "absolute", inset: 0,
                zIndex: count - i,   // first card on top
                overflow: "hidden",
                borderRadius: 0,
              }}
            >
              {/* Full-bleed image */}
              <img
                src={svc.image} alt={svc.name}
                loading={i < 3 ? "eager" : "lazy"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />

              {/* Dark gradient from bottom */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.05) 100%)",
              }} />

              {/* Accent stripe at top */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${accent}, transparent 70%)`,
              }} />

              {/* Bottom content */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "clamp(28px, 5vw, 72px)",
                display: "flex", flexDirection: "column", gap: 0,
              }}>
                <div style={{
                  fontSize: 10, color: accent, textTransform: "uppercase",
                  letterSpacing: "0.18em", fontWeight: 700, marginBottom: 14,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                }}>
                  {svc.category.split("&")[0].trim()}
                </div>

                <div style={{
                  fontSize: "clamp(26px, 4.5vw, 62px)", fontWeight: 800, color: "#fff",
                  lineHeight: 1.05, marginBottom: 28,
                  maxWidth: "min(65%, 700px)",
                  letterSpacing: "-0.02em",
                }}>
                  {svc.name}
                </div>

                <Link href={`/services/${svc.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 40, padding: "11px 24px",
                    fontSize: 12, fontWeight: 600, color: "#fff",
                    letterSpacing: "0.05em", textTransform: "uppercase",
                  }}>
                    Explore <span style={{ fontSize: 16, marginLeft: 2 }}>↗</span>
                  </div>
                </Link>
              </div>

              {/* Card counter */}
              <div style={{
                position: "absolute", top: 22, right: 24,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 11, color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.1em",
              }}>
                {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </div>

              {/* Scroll cue — only on topmost card */}
              {i === 0 && (
                <div style={{
                  position: "absolute", bottom: 28, right: 32,
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 9, color: "rgba(255,255,255,0.22)",
                  textTransform: "uppercase", letterSpacing: "0.14em",
                }}>
                  scroll
                  <div style={{
                    width: 16, height: 24, border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8, position: "relative", overflow: "hidden",
                  }}>
                    <motion.div
                      animate={{ y: [2, 10, 2] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      style={{ width: 3, height: 5, background: "rgba(255,255,255,0.4)",
                               borderRadius: 2, margin: "0 auto" }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 7: Particle Constellation — canvas physics field, one glowing node/service
// Mouse repulsion · pulsing glow · category connection lines · click to navigate
// ═══════════════════════════════════════════════════════════════════════════════
const ServicesParticleField = ({ services }: { services: ServiceCard[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef  = useRef(-1);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const [, navigate] = useLocation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || services.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Resize handler ──────────────────────────────────────────────────────
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Particle positions ───────────────────────────────────────────────────
    type P = { x:number; y:number; vx:number; vy:number; bx:number; by:number; color:string; r:number; phase:number };
    const buildParticles = (): P[] => {
      const cols = Math.max(1, Math.ceil(Math.sqrt(services.length * W / H)));
      const rows = Math.ceil(services.length / cols);
      const cw = W / cols, ch = H / rows;
      return services.map((svc, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const bx = cw * (col + 0.5) + (Math.random() - 0.5) * cw * 0.38;
        const by = ch * (row + 0.5) + (Math.random() - 0.5) * ch * 0.38;
        return { x: bx, y: by, vx: 0, vy: 0, bx, by,
                 color: getCategoryColor(svc.category),
                 r: 7 + Math.random() * 5, phase: Math.random() * Math.PI * 2 };
      });
    };
    let particles = buildParticles();
    window.addEventListener("resize", () => { particles = buildParticles(); });

    // ── Event listeners ──────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onClick = () => {
      if (hoverRef.current >= 0) navigate(`/services/${services[hoverRef.current].slug}`);
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);

    // ── Animation loop ───────────────────────────────────────────────────────
    let frame = 0, raf = 0;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = mouseRef.current;
      frame++;

      // Find hovered particle — generous 70px hit radius
      let hov = -1, minD = 70;
      particles.forEach((p, i) => {
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d < minD) { minD = d; hov = i; }
      });
      hoverRef.current = hov;
      canvas.style.cursor = hov >= 0 ? "pointer" : "default";

      // ── Draw connection lines ──────────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d > 180) continue;
          const alpha = (1 - d / 180) * 0.22;
          const sameCategory = services[i].category === services[j].category;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          if (sameCategory) {
            const hex = Math.round(alpha * 510).toString(16).padStart(2, "0");
            ctx.strokeStyle = particles[i].color + hex;
            ctx.lineWidth = 1;
          } else {
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.55})`;
            ctx.lineWidth = 0.4;
          }
          ctx.stroke();
        }
      }

      // ── Update + draw particles ────────────────────────────────────────────
      particles.forEach((p, i) => {
        // Mouse repulsion field
        const dx = p.x - mx, dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        const repulseR = 110;
        if (d < repulseR && d > 0) {
          const force = ((repulseR - d) / repulseR) * 5.5;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }

        // Spring back to base position + organic drift
        p.vx += (p.bx - p.x) * 0.032 + Math.sin(frame * 0.007 + p.phase) * 0.04;
        p.vy += (p.by - p.y) * 0.032 + Math.cos(frame * 0.007 + p.phase) * 0.04;
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x  += p.vx;
        p.y  += p.vy;

        const isHov  = hov === i;
        const pulse  = Math.sin(frame * 0.045 + p.phase) * 0.5 + 0.5;
        const baseR  = p.r + pulse * 2.2;
        const drawR  = isHov ? baseR * 3.8 : baseR;
        const glowR  = drawR * (isHov ? 5 : 3.2);

        // Outer glow (radial gradient)
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grd.addColorStop(0, p.color + (isHov ? "cc" : "66"));
        grd.addColorStop(0.4, p.color + (isHov ? "44" : "22"));
        grd.addColorStop(1, p.color + "00");
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Always-visible outer orbit ring (pulsing)
        ctx.beginPath();
        ctx.arc(p.x, p.y, baseR * 1.9, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + (isHov ? "cc" : Math.round(40 + pulse * 50).toString(16).padStart(2, "0"));
        ctx.lineWidth = isHov ? 1.5 : 0.8;
        ctx.stroke();

        // Inner ring on hover
        if (isHov) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, drawR * 0.68, 0, Math.PI * 2);
          ctx.strokeStyle = p.color + "99";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Core dot — solid and bright
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHov ? drawR * 0.32 : baseR * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? "#fff" : p.color;
        ctx.fill();

        // Hover label pill
        if (isHov) {
          ctx.save();
          const label    = services[i].name;
          const catLabel = services[i].category.split("&")[0].trim().split(" ").slice(0, 2).join(" ").toUpperCase();
          ctx.font = `700 13px Inter, -apple-system, sans-serif`;
          const tw  = ctx.measureText(label).width;
          const bw  = tw + 24, bh = 30;
          const bx  = p.x - bw / 2;
          const by  = p.y + drawR * 1.6 + 8;

          // Pill bg
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const r6 = 7;
          ctx.moveTo(bx + r6, by);
          ctx.lineTo(bx + bw - r6, by);
          ctx.arcTo(bx + bw, by, bx + bw, by + r6, r6);
          ctx.lineTo(bx + bw, by + bh - r6);
          ctx.arcTo(bx + bw, by + bh, bx + bw - r6, by + bh, r6);
          ctx.lineTo(bx + r6, by + bh);
          ctx.arcTo(bx, by + bh, bx, by + bh - r6, r6);
          ctx.lineTo(bx, by + r6);
          ctx.arcTo(bx, by, bx + r6, by, r6);
          ctx.closePath();
          ctx.fill();

          // Name text
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, p.x, by + bh / 2);

          // Category label below pill
          ctx.font = `500 9px Inter, monospace`;
          ctx.fillStyle = p.color + "aa";
          ctx.fillText(catLabel, p.x, by + bh + 14);
          ctx.restore();
        }
      });

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, [services, navigate]);

  return (
    <div style={{ background: "#07090E", height: "100vh", overflow: "hidden", position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {/* Legend */}
      <div style={{
        position: "absolute", top: 100, right: 24, display: "flex", flexDirection: "column", gap: 6,
        opacity: 0.6,
      }}>
        {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([cat, color]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color,
                          boxShadow: `0 0 8px ${color}` }} />
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)",
                          fontFamily: "monospace", letterSpacing: "0.08em",
                          textTransform: "uppercase" }}>
              {cat.split("&")[0].trim().split(" ").slice(0, 2).join(" ")}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 9, color: "rgba(255,255,255,0.18)",
        textTransform: "uppercase", letterSpacing: "0.2em", pointerEvents: "none",
        whiteSpace: "nowrap",
      }}>
        hover to identify · click to open
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 8: Kinetic Type Wall — BASIC Agency / Resn style massive scrolling text
// Alternating rows at different speeds · mouse 3D tilt · floating cursor image
// ALL animation is imperative — zero React state changes per frame
// ═══════════════════════════════════════════════════════════════════════════════
const ServicesKineticWall = ({ services }: { services: ServiceCard[] }) => {
  const outerRef    = useRef<HTMLDivElement>(null);
  const containerRef= useRef<HTMLDivElement>(null);
  const rowRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const imgRef      = useRef<HTMLDivElement>(null);
  const posRef      = useRef<number[]>([0, 0, 0, 0]);
  const mouseRef    = useRef({ nx: 0.5, ny: 0.5, px: 0, py: 0 });
  const rafRef      = useRef(0);
  const initRef     = useRef(false);

  const ROW_COUNT = 4;
  const SPEEDS    = [0.65, 0.42, 0.55, 0.30];  // px per frame
  const DIRS      = [1, -1, 1, -1] as const;   // 1 = left, -1 = right
  const SIZES     = ["clamp(38px,6vw,88px)", "clamp(20px,3.2vw,46px)", "clamp(28px,4.8vw,70px)", "clamp(16px,2.6vw,38px)"];
  const WEIGHTS   = [900, 300, 800, 400];

  const rows = useMemo(() =>
    Array.from({ length: ROW_COUNT }, (_, r) =>
      services.filter((_, i) => i % ROW_COUNT === r)
    ), [services]);

  useEffect(() => {
    if (rows.every(r => r.length === 0)) return;
    let tiltX = 0, tiltY = 0;

    const animate = () => {
      // Init row positions on first frame (needs DOM to have rendered)
      if (!initRef.current) {
        rows.forEach((_, r) => {
          const el = rowRefs.current[r];
          if (!el) return;
          const halfW = el.scrollWidth / 2;
          posRef.current[r] = DIRS[r] === -1 ? -halfW : 0;
        });
        initRef.current = true;
      }

      // Smooth mouse tilt
      tiltX += ((mouseRef.current.ny - 0.5) * -10 - tiltX) * 0.055;
      tiltY += ((mouseRef.current.nx - 0.5) *  10 - tiltY) * 0.055;
      if (containerRef.current) {
        containerRef.current.style.transform =
          `perspective(1400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }

      // Scroll each row
      rows.forEach((_, r) => {
        const el = rowRefs.current[r];
        if (!el) return;
        const halfW = el.scrollWidth / 2;
        posRef.current[r] -= SPEEDS[r] * DIRS[r];
        if (DIRS[r] ===  1 && posRef.current[r] < -halfW) posRef.current[r] += halfW;
        if (DIRS[r] === -1 && posRef.current[r] > 0)      posRef.current[r] -= halfW;
        el.style.transform = `translateX(${posRef.current[r]}px)`;
      });

      // Float image to cursor
      if (imgRef.current) {
        imgRef.current.style.left = mouseRef.current.px + 30 + "px";
        imgRef.current.style.top  = mouseRef.current.py - 100 + "px";
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      initRef.current = false;
    };
  }, [rows]);

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      nx: (e.clientX - rect.left) / rect.width,
      ny: (e.clientY - rect.top)  / rect.height,
      px: e.clientX, py: e.clientY,
    };
  };

  const onItemEnter = (svc: ServiceCard) => {
    if (!imgRef.current) return;
    imgRef.current.style.backgroundImage = `url(${svc.image})`;
    imgRef.current.style.opacity = "1";
    imgRef.current.style.transform = "scale(1) rotate(-1deg)";
  };
  const onItemLeave = () => {
    if (!imgRef.current) return;
    imgRef.current.style.opacity = "0";
    imgRef.current.style.transform = "scale(0.88) rotate(0deg)";
  };

  return (
    <div
      ref={outerRef}
      style={{ background: "#060810", minHeight: "100vh", overflow: "hidden",
               display: "flex", flexDirection: "column", justifyContent: "center",
               paddingTop: 80, paddingBottom: 40, position: "relative" }}
      onMouseMove={onMouseMove}
    >
      {/* Noise grain overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.035, zIndex: 1,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat", backgroundSize: "200px 200px",
      }} />

      <div ref={containerRef} style={{ width: "100%", zIndex: 2 }}>
        {rows.map((row, r) => {
          if (row.length === 0) return null;
          const doubled = [...row, ...row];
          return (
            <div key={r} style={{ overflow: "hidden", lineHeight: 1.05,
                                  marginBottom: "clamp(2px, 0.5vw, 8px)" }}>
              <div
                ref={el => { rowRefs.current[r] = el; }}
                style={{ display: "flex", gap: "clamp(16px, 2.5vw, 40px)",
                         width: "max-content", alignItems: "center" }}
              >
                {doubled.map((svc, i) => {
                  const accent = getCategoryColor(svc.category);
                  return (
                    <Link
                      key={svc.slug + r + i}
                      href={`/services/${svc.slug}`}
                      style={{ textDecoration: "none", display: "inline-flex",
                               alignItems: "center", gap: 14, flexShrink: 0 }}
                      onMouseEnter={() => onItemEnter(svc)}
                      onMouseLeave={onItemLeave}
                    >
                      <span
                        style={{
                          fontSize: SIZES[r],
                          fontWeight: WEIGHTS[r],
                          color: "transparent",
                          WebkitTextStroke: "1px rgba(255,255,255,0.13)",
                          letterSpacing: "-0.03em",
                          lineHeight: 1,
                          textTransform: "uppercase",
                          userSelect: "none",
                          display: "inline-block",
                          transition: "color 0.18s ease",
                        } as React.CSSProperties}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.color = accent;
                          (el.style as any).WebkitTextStroke = `1px ${accent}`;
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.color = "transparent";
                          (el.style as any).WebkitTextStroke = "1px rgba(255,255,255,0.13)";
                        }}
                      >
                        {svc.name}
                      </span>
                      {/* Category dot separator */}
                      <span style={{
                        width: r % 2 === 0 ? 7 : 4, flexShrink: 0,
                        height: r % 2 === 0 ? 7 : 4,
                        borderRadius: "50%",
                        background: accent + "40",
                        display: "inline-block",
                      }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cursor image */}
      <div ref={imgRef} style={{
        position: "fixed", width: 280, height: 185,
        borderRadius: 14, pointerEvents: "none", zIndex: 9999,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0, transform: "scale(0.88) rotate(0deg)",
        transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: "0 28px 70px rgba(0,0,0,0.6)",
        left: 0, top: 0,
      }} />

      <div style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.15)",
        textTransform: "uppercase", letterSpacing: "0.2em",
        pointerEvents: "none", whiteSpace: "nowrap", zIndex: 3,
      }}>
        hover to preview · click to open
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 9: Vortex Carousel — services orbit in a 3D-illusion circle
// Scroll rotates the ring · front card highlighted · mouse shifts perspective
// Pure CSS transforms (no preserve-3d, no WebGL) — zero GPU layer overhead
// ═══════════════════════════════════════════════════════════════════════════════
const ServicesVortex = ({ services }: { services: ServiceCard[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const centerRef  = useRef<HTMLDivElement>(null);
  const rafRef     = useRef(0);
  const mouseRef   = useRef({ nx: 0.5, ny: 0.5 });

  const count    = Math.min(services.length, 20);
  const RADIUS   = typeof window !== "undefined" ? Math.min(window.innerWidth * 0.37, 400) : 360;
  const VH       = typeof window !== "undefined" ? window.innerHeight : 700;
  const totalH   = VH * 1.2 + count * 90;

  useEffect(() => {
    let rot = 0, shiftX = 0, shiftY = 0;
    let prevFront = -1;

    const animate = () => {
      if (!wrapperRef.current) { rafRef.current = requestAnimationFrame(animate); return; }
      const scrolled = Math.max(0, -wrapperRef.current.getBoundingClientRect().top);
      const targetRot = scrolled * 0.05;
      rot += (targetRot - rot) * 0.08;

      // Mouse-driven perspective shift
      shiftX += ((mouseRef.current.nx - 0.5) * 30 - shiftX) * 0.06;
      shiftY += ((mouseRef.current.ny - 0.5) * 18 - shiftY) * 0.06;

      let frontIdx = 0;
      let frontDepth = -2;

      cardRefs.current.forEach((card, i) => {
        if (!card || i >= count) return;
        const angle = (i / count) * Math.PI * 2 + (rot * Math.PI) / 180;
        const sinA  = Math.sin(angle);
        const cosA  = Math.cos(angle);

        // Fake 3D: depth from cosA (-1=back, +1=front)
        const depth = (cosA + 1) / 2; // 0 → 1
        const x     = sinA * RADIUS + shiftX * (1 - depth);
        const y     = -cosA * RADIUS * 0.3 + shiftY * (1 - depth);
        const scale = 0.42 + depth * 0.68;
        const op    = 0.08 + depth * 0.92;
        const zi    = Math.round(depth * 100);

        card.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        card.style.opacity   = String(op);
        card.style.zIndex    = String(zi);

        if (depth > frontDepth) { frontDepth = depth; frontIdx = i; }
      });

      // Highlight front card
      if (frontIdx !== prevFront) {
        cardRefs.current.forEach((card, i) => {
          if (!card || i >= count) return;
          const isFront = i === frontIdx;
          const accent  = getCategoryColor(services[i].category);
          const bar = card.querySelector("[data-vortex-bar]") as HTMLDivElement | null;
          const name = card.querySelector("[data-vortex-name]") as HTMLDivElement | null;
          if (bar)  bar.style.height  = isFront ? "3px" : "2px";
          if (bar)  bar.style.opacity = isFront ? "1" : "0.3";
          if (name) name.style.color  = isFront ? "#fff" : "rgba(255,255,255,0.55)";
        });
        prevFront = frontIdx;
      }

      // Center label shows current front service
      if (centerRef.current && services[frontIdx]) {
        const acc = getCategoryColor(services[frontIdx].category);
        centerRef.current.innerHTML = `
          <div style="font-size:9px;color:${acc};text-transform:uppercase;letter-spacing:.18em;font-family:monospace;margin-bottom:6px">
            ${services[frontIdx].category.split("&")[0].trim()}
          </div>
          <div style="font-size:clamp(13px,1.6vw,18px);font-weight:700;color:#fff;line-height:1.2">
            ${services[frontIdx].name}
          </div>`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [services, count, RADIUS]);

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      nx: (e.clientX - rect.left) / rect.width,
      ny: (e.clientY - rect.top)  / rect.height,
    };
  };

  return (
    <div ref={wrapperRef} style={{ height: totalH, position: "relative" }}>
      <div
        style={{
          position: "sticky", top: 0, height: "100vh",
          background: "radial-gradient(ellipse at 50% 55%, #16102a 0%, #040609 65%)",
          overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onMouseMove={onMouseMove}
      >
        {/* Ambient center glow rings */}
        {[320, 460, 640].map((r, i) => (
          <div key={r} style={{
            position: "absolute", width: r, height: r * 0.38,
            borderRadius: "50%",
            border: `1px solid rgba(99,102,241,${0.06 - i * 0.015})`,
            pointerEvents: "none",
          }} />
        ))}

        {/* Center info panel */}
        <div ref={centerRef} style={{
          position: "absolute", textAlign: "center",
          zIndex: 50, pointerEvents: "none",
          maxWidth: 220,
        }} />

        {/* Orbital cards */}
        <div style={{ position: "relative", width: 0, height: 0 }}>
          {services.slice(0, count).map((svc, i) => {
            const accent = getCategoryColor(svc.category);
            return (
              <div
                key={svc.slug}
                ref={el => { cardRefs.current[i] = el; }}
                style={{
                  position: "absolute",
                  width: 172, height: 230,
                  marginLeft: -86, marginTop: -115,
                  borderRadius: 14, overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <Link
                  href={`/services/${svc.slug}`}
                  style={{ textDecoration: "none", display: "block", height: "100%" }}
                >
                  <div style={{
                    position: "relative", width: "100%", height: "100%",
                    borderRadius: 14, overflow: "hidden",
                    background: "#0d0f16",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}>
                    <img
                      src={svc.image} alt={svc.name} loading="lazy"
                      style={{ width: "100%", height: "62%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 100%)",
                      height: "62%", pointerEvents: "none",
                    }} />
                    <div data-vortex-bar="" style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      height: 2, background: accent,
                      opacity: 0.3, transition: "height 0.3s ease, opacity 0.3s ease",
                    }} />
                    <div style={{ padding: "9px 11px 10px" }}>
                      <div style={{ fontSize: 8, color: accent, textTransform: "uppercase",
                                    letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4,
                                    fontFamily: "monospace" }}>
                        {svc.category.split(" ")[0]}
                      </div>
                      <div data-vortex-name="" style={{
                        fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)",
                        lineHeight: 1.3, transition: "color 0.3s ease",
                      }}>
                        {svc.name}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)",
          fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase", letterSpacing: "0.2em",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ width: 14, height: 14, border: "1px solid rgba(255,255,255,0.15)",
                     borderTopColor: "rgba(99,102,241,0.6)", borderRadius: "50%" }}
          />
          scroll to rotate
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 11 — GRAVITY FIELD (physics-based canvas masterpiece)
// Cards are physical bodies that attract, repel, and orbit the cursor
// ═══════════════════════════════════════════════════════════════════════════════
const GRAVITY_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7"];

interface GravityCard {
  id: number; slug: string; name: string; category: string; image: string;
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; angle: number; va: number;
  accent: string; img: HTMLImageElement | null; imgLoaded: boolean;
  mass: number;
}

const ServicesGravityField = ({ services }: { services: ServiceCard[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<GravityCard[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, inside: false });
  const modeRef = useRef<"attract" | "repel" | "orbit">("attract");
  const [mode, setMode] = useState<"attract" | "repel" | "orbit">("attract");
  const rafRef = useRef<number>(0);
  const [, navigate] = useLocation();

  const MODE_COLOR = { attract: "#6366f1", repel: "#ef4444", orbit: "#22c55e" };
  const MODE_LABEL = { attract: "ATTRACT", repel: "REPEL", orbit: "ORBIT" };

  // Sync React mode → modeRef so RAF closure always sees latest
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Init physics bodies
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const CW = Math.min(W * 0.18, 180), CH = CW * 1.32;

    cardsRef.current = services.map((svc, i) => {
      const cols = Math.max(1, Math.floor(W / (CW + 20)));
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = (col + 0.5) * (W / cols) + (Math.random() - 0.5) * 60;
      const cy = 120 + row * (CH + 24) + (Math.random() - 0.5) * 40;
      const acc = GRAVITY_ACCENTS[i % GRAVITY_ACCENTS.length];

      const imgEl = new Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.src = svc.image;

      const card: GravityCard = {
        id: i, slug: svc.slug, name: svc.name, category: svc.category, image: svc.image,
        x: cx, y: cy, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
        w: CW, h: CH, angle: (Math.random() - 0.5) * 0.08, va: (Math.random() - 0.5) * 0.0006,
        accent: acc, img: imgEl, imgLoaded: false, mass: 0.8 + Math.random() * 0.4,
      };
      imgEl.onload = () => { card.imgLoaded = true; };
      return card;
    });
  }, [services]);

  // Main RAF loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const { x: mx, y: my, inside } = mouseRef.current;
      const currentMode = modeRef.current;
      const cards = cardsRef.current;
      const DAMP = 0.985;
      const MOUSE_FORCE = 280;

      ctx.clearRect(0, 0, W, H);

      // ── Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#08090c");
      bg.addColorStop(1, "#0f1117");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Connection web
      ctx.save();
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const dx = cards[j].x - cards[i].x, dy = cards[j].y - cards[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 220) {
            const alpha = (1 - d / 220) * 0.18;
            ctx.beginPath();
            ctx.moveTo(cards[i].x, cards[i].y);
            ctx.lineTo(cards[j].x, cards[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // ── Physics + draw each card
      cards.forEach(card => {
        const cx = card.x, cy = card.y;

        // Mouse interaction
        if (inside) {
          const dx = mx - cx, dy = my - cy;
          const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = MOUSE_FORCE / (d * d * 0.008 + 1) / card.mass;

          if (currentMode === "attract") {
            card.vx += (dx / d) * force * 0.012;
            card.vy += (dy / d) * force * 0.012;
          } else if (currentMode === "repel") {
            card.vx -= (dx / d) * force * 0.018;
            card.vy -= (dy / d) * force * 0.018;
          } else if (currentMode === "orbit") {
            // Perpendicular force for orbit
            card.vx += (-dy / d) * force * 0.010;
            card.vy += (dx / d) * force * 0.010;
            // Slight attraction to keep in range
            if (d > 180) { card.vx += (dx / d) * 0.04; card.vy += (dy / d) * 0.04; }
          }
        }

        // Center gravity tether (gentle)
        card.vx += (W * 0.5 - cx) * 0.00045;
        card.vy += (H * 0.5 - cy) * 0.00045;

        // Card-to-card repulsion
        cards.forEach(other => {
          if (other === card) return;
          const dx = cx - other.x, dy = cy - other.y;
          const d2 = dx * dx + dy * dy;
          const minD = card.w * 0.85;
          if (d2 < minD * minD && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = (minD - d) / minD * 0.28;
            card.vx += (dx / d) * push;
            card.vy += (dy / d) * push;
          }
        });

        // Integrate
        card.vx *= DAMP;
        card.vy *= DAMP;
        card.va *= 0.97;
        card.x += card.vx;
        card.y += card.vy;
        card.angle += card.va;

        // Edge bounce
        const hw = card.w / 2, hh = card.h / 2;
        if (card.x < hw + 10) { card.x = hw + 10; card.vx = Math.abs(card.vx) * 0.6; }
        if (card.x > W - hw - 10) { card.x = W - hw - 10; card.vx = -Math.abs(card.vx) * 0.6; }
        if (card.y < hh + 10) { card.y = hh + 10; card.vy = Math.abs(card.vy) * 0.6; }
        if (card.y > H - hh - 10) { card.y = H - hh - 10; card.vy = -Math.abs(card.vy) * 0.6; }

        // Speed glow trail
        const speed = Math.sqrt(card.vx * card.vx + card.vy * card.vy);
        if (speed > 0.6) {
          const trailLen = Math.min(speed * 12, 60);
          const tx = cx - card.vx * trailLen * 0.5;
          const ty = cy - card.vy * trailLen * 0.5;
          const trailGrad = ctx.createLinearGradient(tx, ty, cx, cy);
          trailGrad.addColorStop(0, "transparent");
          trailGrad.addColorStop(1, card.accent + "55");
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = card.w * 0.5;
          ctx.stroke();
        }

        // ── Draw card (rotated)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(card.angle);

        const hw2 = card.w / 2, hh2 = card.h / 2;
        const r = 10;

        // Card shadow / glow
        ctx.shadowColor = card.accent + "66";
        ctx.shadowBlur = 18 + speed * 4;

        // Card bg rounded rect
        ctx.beginPath();
        ctx.moveTo(-hw2 + r, -hh2);
        ctx.lineTo(hw2 - r, -hh2);
        ctx.quadraticCurveTo(hw2, -hh2, hw2, -hh2 + r);
        ctx.lineTo(hw2, hh2 - r);
        ctx.quadraticCurveTo(hw2, hh2, hw2 - r, hh2);
        ctx.lineTo(-hw2 + r, hh2);
        ctx.quadraticCurveTo(-hw2, hh2, -hw2, hh2 - r);
        ctx.lineTo(-hw2, -hh2 + r);
        ctx.quadraticCurveTo(-hw2, -hh2, -hw2 + r, -hh2);
        ctx.closePath();
        ctx.fillStyle = "#13151c";
        ctx.fill();

        // Image clip
        const imgH = card.h * 0.6;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-hw2 + r, -hh2);
        ctx.lineTo(hw2 - r, -hh2);
        ctx.quadraticCurveTo(hw2, -hh2, hw2, -hh2 + r);
        ctx.lineTo(hw2, -hh2 + imgH - r);
        ctx.quadraticCurveTo(hw2, -hh2 + imgH, hw2 - r, -hh2 + imgH);
        ctx.lineTo(-hw2 + r, -hh2 + imgH);
        ctx.quadraticCurveTo(-hw2, -hh2 + imgH, -hw2, -hh2 + imgH - r);
        ctx.lineTo(-hw2, -hh2 + r);
        ctx.quadraticCurveTo(-hw2, -hh2, -hw2 + r, -hh2);
        ctx.closePath();
        ctx.clip();

        if (card.imgLoaded && card.img) {
          const aspect = card.img.naturalWidth / card.img.naturalHeight;
          const dw = card.w, dh = dw / aspect;
          const sy = dh > imgH ? -(dh - imgH) * 0.3 : 0;
          ctx.drawImage(card.img, -hw2, -hh2 + sy, dw, dh);
        } else {
          ctx.fillStyle = card.accent + "33";
          ctx.fillRect(-hw2, -hh2, card.w, imgH);
        }

        // Image gradient fade bottom
        const fadeGrad = ctx.createLinearGradient(0, -hh2 + imgH * 0.55, 0, -hh2 + imgH);
        fadeGrad.addColorStop(0, "transparent");
        fadeGrad.addColorStop(1, "#13151c");
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(-hw2, -hh2, card.w, imgH);
        ctx.restore();

        // Accent bar top
        ctx.fillStyle = card.accent;
        ctx.fillRect(-hw2 + r, -hh2, card.w - r * 2, 2.5);

        // Category label
        ctx.fillStyle = card.accent;
        ctx.font = `600 8px monospace`;
        ctx.textAlign = "left";
        ctx.fillText(card.category.split(" ")[0].toUpperCase(), -hw2 + 9, -hh2 + imgH + 14);

        // Service name — word wrap
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.font = `600 ${Math.max(9, card.w * 0.073)}px sans-serif`;
        ctx.shadowBlur = 0;
        const maxW = card.w - 18;
        const words = card.name.split(" ");
        let line = "", lines: string[] = [];
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (ctx.measureText(test).width > maxW && line) {
            lines.push(line); line = word;
          } else { line = test; }
        }
        if (line) lines.push(line);
        lines = lines.slice(0, 3);
        const lh = card.w * 0.088;
        lines.forEach((l, li) => {
          ctx.fillText(l, -hw2 + 9, -hh2 + imgH + 28 + li * lh);
        });

        ctx.restore();
      });

      // ── Custom cursor ring
      if (inside && mx > 0) {
        const mc = MODE_COLOR[currentMode];
        ctx.save();
        // Outer pulsing ring
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.006);
        ctx.beginPath();
        ctx.arc(mx, my, 18 + pulse * 5, 0, Math.PI * 2);
        ctx.strokeStyle = mc + "cc";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fillStyle = mc;
        ctx.fill();

        // Orbit mode: spiral dots
        if (currentMode === "orbit") {
          for (let k = 0; k < 5; k++) {
            const a = (Date.now() * 0.003) + (k / 5) * Math.PI * 2;
            const dr = 26 + pulse * 3;
            ctx.beginPath();
            ctx.arc(mx + Math.cos(a) * dr, my + Math.sin(a) * dr, 2, 0, Math.PI * 2);
            ctx.fillStyle = mc + "99";
            ctx.fill();
          }
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Click → navigate
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    for (const card of cardsRef.current) {
      const dx = cx - card.x, dy = cy - card.y;
      const hw = card.w / 2 + 8, hh = card.h / 2 + 8;
      if (Math.abs(dx) < hw && Math.abs(dy) < hh) {
        navigate(`/services/${card.slug}`);
        return;
      }
    }
  };

  const modeColor = MODE_COLOR[mode];

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#08090c" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", cursor: "none" }}
        onMouseMove={e => {
          const rect = canvasRef.current!.getBoundingClientRect();
          mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, inside: true };
        }}
        onMouseLeave={() => { mouseRef.current.inside = false; }}
        onClick={handleClick}
      />

      {/* Mode selector */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 8, alignItems: "center",
        background: "rgba(8,9,12,0.8)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 40,
        padding: "8px 16px",
      }}>
        {(["attract","repel","orbit"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "6px 16px", borderRadius: 30, border: "none",
              background: mode === m ? MODE_COLOR[m] : "transparent",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.35)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "monospace",
            }}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      {/* Instruction text */}
      <div style={{
        position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
        fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em",
        color: modeColor + "99", textTransform: "uppercase", whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        move cursor · click card to explore · switch mode below
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 12 — SHOWCASE  (magnetic hover grid — Linear / Framer aesthetic)
// Clean numbered grid, each card magnetically tracks the cursor
// ═══════════════════════════════════════════════════════════════════════════════
const SHOWCASE_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7"];

const ShowcaseCard = ({ svc, index }: { svc: ServiceCard; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const accent = SHOWCASE_ACCENTS[index % SHOWCASE_ACCENTS.length];
  const num = String(index + 1).padStart(2, "0");

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    el.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
    if (imgRef.current) imgRef.current.style.transform = `scale(1.07) translate(${-x * 0.4}px, ${-y * 0.4}px)`;
  };
  const onMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "translate(0,0) scale(1)";
    if (imgRef.current) imgRef.current.style.transform = "scale(1) translate(0,0)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.07 }}
    >
      <Link href={`/services/${svc.slug}`}>
        <div
          ref={cardRef}
          onMouseMove={onMouseMove}
          style={{
            background: "#fff",
            border: "1px solid rgba(17,19,23,0.08)",
            borderRadius: 18,
            overflow: "hidden",
            cursor: "pointer",
            transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, border-color 0.3s ease",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.boxShadow = `0 20px 56px rgba(0,0,0,0.10), 0 0 0 1.5px ${accent}`;
            el.style.borderColor = accent + "55";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
            el.style.borderColor = "rgba(17,19,23,0.08)";
            onMouseLeave();
          }}
        >
          {/* Image */}
          <div style={{ overflow: "hidden", height: 220, position: "relative" }}>
            <img
              ref={imgRef}
              src={svc.image}
              alt={svc.name}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                display: "block",
                transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
            {/* Accent strip at bottom of image */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
            }} />
          </div>

          {/* Content */}
          <div style={{ padding: "20px 22px 22px" }}>
            {/* Number + category row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{
                fontFamily: "monospace", fontSize: 11, fontWeight: 700,
                color: accent, letterSpacing: "0.06em",
              }}>{num}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, color: "#aaa", letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>{svc.category.split(" ").slice(0, 2).join(" ")}</span>
            </div>

            {/* Service name */}
            <div style={{
              fontSize: 16, fontWeight: 700, color: "#111", lineHeight: 1.35,
              letterSpacing: "-0.01em",
            }}>{svc.name}</div>

            {/* Arrow indicator */}
            <div style={{
              marginTop: 14, display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 600, color: accent, letterSpacing: "0.06em",
              transition: "gap 0.3s ease",
            }}>
              Explore
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M6 2l4 4-4 4" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ServicesShowcase = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ padding: "clamp(48px,7vw,88px) clamp(20px,6vw,80px) 80px", background: "#f7f7f5", minHeight: "100vh" }}>
    {/* Section header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: "clamp(32px,5vw,64px)" }}
    >
      <div style={{ fontSize: "clamp(11px,1.5vw,12px)", fontWeight: 600, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: 14 }}>
        {services.length} Services
      </div>
      <div style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
        What We Build
      </div>
    </motion.div>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(clamp(260px,28vw,360px), 1fr))",
      gap: "clamp(14px,2vw,24px)",
    }}>
      {services.map((svc, i) => <ShowcaseCard key={svc.slug} svc={svc} index={i} />)}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 13 — BENTO GRID  (Apple / Vercel bento layout)
// Mixed card sizes in a CSS grid — big feature cards + small detail cells
// ═══════════════════════════════════════════════════════════════════════════════
const BENTO_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];

const BentoCell = ({ svc, index, size }: { svc: ServiceCard; index: number; size: "large" | "tall" | "wide" | "small" }) => {
  const accent = BENTO_ACCENTS[index % BENTO_ACCENTS.length];
  const isLarge = size === "large";
  const isTall = size === "tall";
  const isWide = size === "wide";
  const colSpan = isLarge || isWide ? 2 : 1;
  const rowSpan = isLarge || isTall ? 2 : 1;
  const imgRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 5) * 0.06 }}
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
    >
      <Link href={`/services/${svc.slug}`}>
        <div
          style={{
            height: "100%", minHeight: isLarge ? 420 : isTall ? 380 : isWide ? 200 : 190,
            background: "#0d0e11", borderRadius: 20,
            overflow: "hidden", position: "relative", cursor: "pointer",
            transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease",
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.transform = "translateY(-5px) scale(1.015)";
            el.style.boxShadow = `0 28px 64px rgba(0,0,0,0.32), 0 0 0 1.5px ${accent}66`;
            if (imgRef.current) imgRef.current.style.transform = "scale(1.07)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.transform = "translateY(0) scale(1)";
            el.style.boxShadow = "0 2px 16px rgba(0,0,0,0.18)";
            if (imgRef.current) imgRef.current.style.transform = "scale(1)";
          }}
        >
          {/* Full-bleed image — always clear, zooms on hover */}
          <div
            ref={imgRef}
            style={{
              position: "absolute", inset: 0,
              background: `url(${svc.image}) center/cover no-repeat`,
              transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
            }}
          />

          {/* Dark gradient scrim — bottom-heavy so image is clear at top */}
          <div style={{
            position: "absolute", inset: 0,
            background: isLarge || isTall
              ? "linear-gradient(to top, rgba(8,8,12,0.96) 0%, rgba(8,8,12,0.55) 45%, rgba(8,8,12,0.08) 100%)"
              : "linear-gradient(to top, rgba(8,8,12,0.98) 0%, rgba(8,8,12,0.65) 55%, rgba(8,8,12,0.12) 100%)",
          }} />

          {/* Accent top bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${accent}, ${accent}44)`,
          }} />

          {/* Category tag */}
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: accent + "22", border: `1px solid ${accent}55`,
            backdropFilter: "blur(8px)",
            borderRadius: 30, padding: "4px 10px",
            fontSize: 9, fontWeight: 700, color: accent,
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>
            {svc.category.split(" ")[0]}
          </div>

          {/* Content */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: isLarge || isTall ? "24px 24px 26px" : "14px 16px 16px",
          }}>
            <div style={{
              fontFamily: "monospace", fontSize: isLarge ? 12 : 9, fontWeight: 700,
              color: accent, marginBottom: 7, letterSpacing: "0.1em",
            }}>
              {String(index + 1).padStart(2, "0")}
            </div>
            <div style={{
              fontSize: isLarge ? "clamp(18px,2.2vw,26px)" : isTall ? "clamp(14px,1.7vw,19px)" : "clamp(12px,1.3vw,14px)",
              fontWeight: 800, color: "#ffffff",
              lineHeight: 1.25, letterSpacing: "-0.02em",
            }}>{svc.name}</div>

            {isLarge && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
                fontSize: 11, fontWeight: 600, color: accent + "cc",
              }}>
                Explore
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const BENTO_PATTERN: Array<"large" | "tall" | "wide" | "small"> = [
  "large", "small", "tall", "small", "wide", "small", "small", "tall", "wide", "small",
  "small", "large", "small", "small", "wide", "tall", "small", "small", "small", "wide",
];

const ServicesBento = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ padding: "clamp(48px,7vw,88px) clamp(20px,5vw,72px) 80px", background: "#f0f0ee", minHeight: "100vh" }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: "clamp(28px,4vw,52px)" }}
    >
      <div style={{ fontSize: "clamp(11px,1.5vw,12px)", fontWeight: 600, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: 10 }}>Services — Bento</div>
      <div style={{ fontSize: "clamp(26px,3.8vw,48px)", fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em" }}>Our Capabilities</div>
    </motion.div>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridAutoRows: "180px",
      gap: "clamp(10px,1.4vw,16px)",
    }}>
      {services.map((svc, i) => (
        <BentoCell key={svc.slug} svc={svc} index={i} size={BENTO_PATTERN[i % BENTO_PATTERN.length]} />
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 14 — TIMELINE  (editorial scroll — alternating left/right reveals)
// Elegant vertical timeline with scroll-triggered slide-ins
// ═══════════════════════════════════════════════════════════════════════════════
const TIMELINE_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7"];

const TimelineEntry = ({ svc, index }: { svc: ServiceCard; index: number }) => {
  const isLeft = index % 2 === 0;
  const accent = TIMELINE_ACCENTS[index % TIMELINE_ACCENTS.length];
  const num = String(index + 1).padStart(2, "0");

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 60px 1fr",
      gap: "clamp(16px,2.5vw,32px)",
      alignItems: "center",
      marginBottom: "clamp(28px,4vw,52px)",
      position: "relative",
    }}>
      {/* Left slot */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {isLeft ? (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", maxWidth: 440 }}
          >
            <Link href={`/services/${svc.slug}`}>
              <div
                style={{
                  background: "#fff", borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(17,19,23,0.07)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "transform 0.38s cubic-bezier(0.22,1,0.36,1), box-shadow 0.38s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.10), 0 0 0 1.5px ${accent}55`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{ position: "relative", overflow: "hidden", height: 180 }}>
                  <img src={svc.image} alt={svc.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.55s ease" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)" }} />
                </div>
                <div style={{ padding: "16px 20px 18px" }}>
                  <div style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>{svc.category.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.3, letterSpacing: "-0.01em" }}>{svc.name}</div>
                </div>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
            style={{ textAlign: "right" }}
          >
            <div style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#f0f0ee", letterSpacing: "-0.04em", lineHeight: 1, userSelect: "none" }}>{num}</div>
            <div style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 4 }}>{svc.category.split(" ")[0]}</div>
          </motion.div>
        )}
      </div>

      {/* Center dot + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", position: "relative" }}>
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 280, damping: 22 }}
          style={{
            width: 14, height: 14, borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 0 4px ${accent}22, 0 0 0 8px ${accent}0a`,
            flexShrink: 0, zIndex: 2,
          }}
        />
      </div>

      {/* Right slot */}
      <div>
        {!isLeft ? (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", maxWidth: 440 }}
          >
            <Link href={`/services/${svc.slug}`}>
              <div
                style={{
                  background: "#fff", borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(17,19,23,0.07)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "transform 0.38s cubic-bezier(0.22,1,0.36,1), box-shadow 0.38s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.10), 0 0 0 1.5px ${accent}55`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{ position: "relative", overflow: "hidden", height: 180 }}>
                  <img src={svc.image} alt={svc.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.55s ease" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)" }} />
                </div>
                <div style={{ padding: "16px 20px 18px" }}>
                  <div style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>{svc.category.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.3, letterSpacing: "-0.01em" }}>{svc.name}</div>
                </div>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          >
            <div style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#f0f0ee", letterSpacing: "-0.04em", lineHeight: 1, userSelect: "none" }}>{num}</div>
            <div style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 4 }}>{svc.category.split(" ")[0]}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ServicesTimeline = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ padding: "clamp(48px,7vw,88px) clamp(20px,5vw,72px) 80px", background: "#fafaf8", minHeight: "100vh", position: "relative" }}>
    {/* Section header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: "center", marginBottom: "clamp(40px,6vw,80px)" }}
    >
      <div style={{ fontSize: "clamp(11px,1.5vw,12px)", fontWeight: 600, letterSpacing: "0.18em", color: "#999", textTransform: "uppercase", marginBottom: 12 }}>Journey Through</div>
      <div style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em" }}>Our Services</div>
    </motion.div>

    {/* Vertical line */}
    <div style={{
      position: "absolute",
      left: "50%", top: "clamp(180px,20vw,260px)", bottom: 80,
      width: 1, background: "linear-gradient(to bottom, transparent, rgba(17,19,23,0.1) 6%, rgba(17,19,23,0.1) 94%, transparent)",
      transform: "translateX(-50%)",
    }} />

    <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
      {services.map((svc, i) => <TimelineEntry key={svc.slug} svc={svc} index={i} />)}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW SWITCHER — pill bar with icons
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 15 — CARD DECK  (3D swipe deck — one card full-screen at a time)
// Swipe or click arrows to flip through services with dramatic 3D rotation
// ═══════════════════════════════════════════════════════════════════════════════
const DECK_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7"];

const ServicesCardDeck = ({ services }: { services: ServiceCard[] }) => {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [animating, setAnimating] = useState(false);
  const total = services.length;

  const go = (d: 1 | -1) => {
    if (animating) return;
    setDir(d);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c + d + total) % total);
      setAnimating(false);
    }, 420);
  };

  const svc = services[current];
  const next = services[(current + 1) % total];
  const prev = services[(current - 1 + total) % total];
  const accent = DECK_ACCENTS[current % DECK_ACCENTS.length];

  // Drag swipe
  const dragStart = useRef(0);
  const onDragEnd = () => {
    // handled via dragConstraints / onPanEnd via onPointerUp delta
  };

  return (
    <div style={{
      position: "relative", width: "100%", height: "100vh", overflow: "hidden",
      background: "#060608", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${accent}18 0%, transparent 70%)`,
        transition: "background 0.8s ease",
      }} />

      {/* Background peek cards */}
      {[-1, 1].map(offset => {
        const idx = (current + offset + total) % total;
        const s = services[idx];
        const isNext = offset === 1;
        return (
          <div key={idx} style={{
            position: "absolute",
            width: "clamp(240px,36vw,480px)", height: "clamp(320px,52vh,640px)",
            borderRadius: 24, overflow: "hidden",
            transform: `translateX(${isNext ? "54%" : "-54%"}) translateY(2%) scale(0.88)`,
            opacity: 0.35, pointerEvents: "none",
            filter: "blur(1.5px)",
          }}>
            <img src={s.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(6,6,8,0.5)" }} />
          </div>
        );
      })}

      {/* Main card */}
      <motion.div
        key={current}
        initial={{ opacity: 0, rotateY: dir * 90, scale: 0.8, z: -200 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1, z: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1400 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_e, info) => {
          if (info.offset.x < -60) go(1);
          else if (info.offset.x > 60) go(-1);
        }}
      >
        <Link href={`/services/${svc.slug}`}>
          <div style={{
            width: "clamp(280px,40vw,540px)", height: "clamp(380px,58vh,720px)",
            borderRadius: 28, overflow: "hidden", position: "relative", cursor: "grab",
            boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px ${accent}33`,
          }}>
            {/* Full image */}
            <img src={svc.image} alt={svc.name} style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              transition: "transform 6s ease",
            }} />
            {/* Scrim */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(4,4,8,0.97) 0%, rgba(4,4,8,0.4) 45%, rgba(4,4,8,0.05) 100%)",
            }} />
            {/* Accent bar top */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />

            {/* Content */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 32px 36px" }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.18em",
                textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10,
              }}>
                {svc.category.split(" ").slice(0,3).join(" ")}
              </div>
              <div style={{
                fontSize: "clamp(22px,3vw,38px)", fontWeight: 900, color: "#fff",
                lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 20,
              }}>{svc.name}</div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: accent, borderRadius: 40,
                padding: "9px 20px", fontSize: 12, fontWeight: 700,
                color: "#fff", letterSpacing: "0.04em",
              }}>
                Explore Service →
              </div>
            </div>

            {/* Card index */}
            <div style={{
              position: "absolute", top: 20, right: 20,
              fontFamily: "monospace", fontSize: 11, fontWeight: 700,
              color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em",
            }}>
              {String(current + 1).padStart(2,"0")} / {String(total).padStart(2,"0")}
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Nav arrows */}
      {(["prev","next"] as const).map(side => (
        <button
          key={side}
          onClick={() => go(side === "next" ? 1 : -1)}
          style={{
            position: "absolute", [side === "next" ? "right" : "left"]: "clamp(16px,4vw,56px)",
            top: "50%", transform: "translateY(-50%)",
            width: 52, height: 52, borderRadius: "50%", border: `1px solid ${accent}44`,
            background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)",
            color: "#fff", fontSize: 20, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = accent + "33"; e.currentTarget.style.borderColor = accent; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = accent + "44"; }}
        >
          {side === "next" ? "→" : "←"}
        </button>
      ))}

      {/* Dot indicators */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 7, alignItems: "center",
      }}>
        {services.map((_, i) => (
          <div
            key={i}
            onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
            style={{
              width: i === current ? 24 : 6, height: 6, borderRadius: 4,
              background: i === current ? accent : "rgba(255,255,255,0.2)",
              cursor: "pointer", transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Hint */}
      <div style={{
        position: "absolute", bottom: 68, left: "50%", transform: "translateX(-50%)",
        fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em",
        color: "rgba(255,255,255,0.18)", textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        drag · arrow keys · click dots
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 16 — GLITCH  (dark neon grid with RGB split + scanlines on hover)
// ═══════════════════════════════════════════════════════════════════════════════
const GLITCH_ACCENTS = ["#ff2d55","#0af","#39ff14","#ff6b00","#bf00ff","#00e5ff","#ff0099","#ffe600"];

const GlitchCard = ({ svc, index }: { svc: ServiceCard; index: number }) => {
  const accent = GLITCH_ACCENTS[index % GLITCH_ACCENTS.length];
  const cardRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const glitchTimer = useRef<number>(0);

  const startGlitch = () => {
    const card = cardRef.current;
    const red = redRef.current;
    const blue = blueRef.current;
    const scan = scanRef.current;
    if (!card || !red || !blue || !scan) return;

    card.style.boxShadow = `0 0 0 1px ${accent}, 0 0 30px ${accent}55, 0 0 80px ${accent}22`;
    scan.style.opacity = "1";

    let frame = 0;
    const tick = () => {
      frame++;
      const glitchX = (Math.random() - 0.5) * 6;
      const glitchY = (Math.random() - 0.5) * 2;
      red.style.transform = `translate(${glitchX + 3}px, ${glitchY}px)`;
      blue.style.transform = `translate(${-glitchX - 3}px, ${glitchY}px)`;
      red.style.opacity = frame % 4 === 0 ? "0" : "0.5";
      blue.style.opacity = frame % 3 === 0 ? "0" : "0.5";
      if (frame < 60) glitchTimer.current = requestAnimationFrame(tick);
    };
    glitchTimer.current = requestAnimationFrame(tick);
  };

  const stopGlitch = () => {
    cancelAnimationFrame(glitchTimer.current);
    const card = cardRef.current;
    const red = redRef.current;
    const blue = blueRef.current;
    const scan = scanRef.current;
    if (!card || !red || !blue || !scan) return;
    card.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.06)";
    red.style.transform = "translate(0,0)";
    blue.style.transform = "translate(0,0)";
    red.style.opacity = "0";
    blue.style.opacity = "0";
    scan.style.opacity = "0";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.05 }}
    >
      <Link href={`/services/${svc.slug}`}>
        <div
          ref={cardRef}
          onMouseEnter={startGlitch}
          onMouseLeave={stopGlitch}
          style={{
            position: "relative", overflow: "hidden", borderRadius: 12, cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
            background: "#08090c",
            transition: "box-shadow 0.2s ease",
          }}
        >
          {/* Main image */}
          <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
            <img src={svc.image} alt={svc.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(0.7) brightness(0.75)" }}
            />
            {/* RGB split layers */}
            <div ref={redRef} style={{
              position: "absolute", inset: 0, opacity: 0, mixBlendMode: "screen",
              background: `url(${svc.image}) center/cover`, filter: "url(#red-channel)",
              transition: "opacity 0.05s",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(255,0,60,0.5)", mixBlendMode: "multiply" }} />
            </div>
            <div ref={blueRef} style={{
              position: "absolute", inset: 0, opacity: 0, mixBlendMode: "screen",
              background: `url(${svc.image}) center/cover`, filter: "url(#blue-channel)",
              transition: "opacity 0.05s",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,180,255,0.5)", mixBlendMode: "multiply" }} />
            </div>
            {/* Scanlines */}
            <div ref={scanRef} style={{
              position: "absolute", inset: 0, opacity: 0, pointerEvents: "none",
              backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
              transition: "opacity 0.15s ease",
            }} />
            {/* Accent top line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
          </div>

          {/* Content */}
          <div style={{ padding: "13px 16px 16px", background: "#08090c" }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: accent, letterSpacing: "0.2em",
              textTransform: "uppercase", fontFamily: "monospace", marginBottom: 6,
            }}>&gt; {svc.category.split(" ")[0]}</div>
            <div style={{
              fontSize: 13, fontWeight: 800, color: "#fff",
              lineHeight: 1.3, letterSpacing: "-0.01em",
            }}>{svc.name}</div>
            <div style={{
              marginTop: 10, fontSize: 9, color: "rgba(255,255,255,0.2)",
              fontFamily: "monospace", letterSpacing: "0.1em",
            }}>
              {"_".repeat(Math.min(svc.name.length, 22))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ServicesGlitch = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ padding: "clamp(48px,7vw,88px) clamp(20px,5vw,64px) 80px", background: "#06060a", minHeight: "100vh" }}>
    {/* SVG filters for RGB split */}
    <svg style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <filter id="red-channel"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>
        <filter id="blue-channel"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>
      </defs>
    </svg>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      style={{ marginBottom: "clamp(28px,4vw,52px)" }}
    >
      <div style={{
        fontSize: "clamp(9px,1.3vw,11px)", fontFamily: "monospace",
        color: "#ff2d55", letterSpacing: "0.22em", marginBottom: 10,
        textTransform: "uppercase",
      }}>&gt;&gt; SYSTEM.SERVICES — LOADING</div>
      <div style={{
        fontSize: "clamp(30px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.04em",
        color: "#fff", lineHeight: 1.05,
        textShadow: "3px 0 0 rgba(255,45,85,0.6), -3px 0 0 rgba(0,170,255,0.6)",
      }}>
        GLITCH MODE
      </div>
    </motion.div>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(clamp(200px,22vw,300px), 1fr))",
      gap: "clamp(8px,1.2vw,14px)",
    }}>
      {services.map((svc, i) => <GlitchCard key={svc.slug} svc={svc} index={i} />)}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 17 — CURTAIN  (full-screen curtain reveal — scroll snaps between services)
// Each service occupies full viewport, image reveals behind a splitting curtain
// ═══════════════════════════════════════════════════════════════════════════════
const CURTAIN_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];

const ServicesCurtain = ({ services }: { services: ServiceCard[] }) => {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const total = services.length;

  useEffect(() => {
    // Trigger curtain open after mount
    const t = setTimeout(() => setCurtainOpen(true), 80);
    return () => clearTimeout(t);
  }, [active]);

  const navigate_to = (idx: number) => {
    if (idx === active) return;
    setCurtainOpen(false);
    setPrev(active);
    setTimeout(() => {
      setActive(idx);
      setCurtainOpen(false);
      setTimeout(() => setCurtainOpen(true), 60);
    }, 380);
  };

  const svc = services[active];
  const accent = CURTAIN_ACCENTS[active % CURTAIN_ACCENTS.length];

  return (
    <div style={{
      position: "relative", width: "100%", height: "100vh",
      overflow: "hidden", background: "#000",
      display: "flex",
    }}>
      {/* Full-bleed background image */}
      <motion.div
        key={active + "-img"}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: curtainOpen ? 1 : 1.08, opacity: curtainOpen ? 1 : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute", inset: 0,
          background: `url(${svc.image}) center/cover no-repeat`,
        }}
      />

      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)",
      }} />

      {/* Left curtain panel */}
      <motion.div
        animate={{ scaleX: curtainOpen ? 0 : 1 }}
        transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
        style={{
          position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
          background: "#0a0a0f", transformOrigin: "left center", zIndex: 10,
        }}
      />
      {/* Right curtain panel */}
      <motion.div
        animate={{ scaleX: curtainOpen ? 0 : 1 }}
        transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1], delay: 0.04 }}
        style={{
          position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
          background: "#0a0a0f", transformOrigin: "right center", zIndex: 10,
        }}
      />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 5, display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: "clamp(32px,5vw,72px)",
        paddingBottom: "clamp(48px,7vw,88px)", width: "100%", maxWidth: 800,
      }}>
        <motion.div
          key={active + "-content"}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: curtainOpen ? 1 : 0, y: curtainOpen ? 0 : 40 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          {/* Category + index */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 2, background: accent, borderRadius: 2,
            }} />
            <div style={{
              fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.2em",
              textTransform: "uppercase", fontFamily: "monospace",
            }}>
              {String(active + 1).padStart(2,"0")} — {svc.category.split(" ").slice(0,2).join(" ")}
            </div>
          </div>

          {/* Massive title */}
          <div style={{
            fontSize: "clamp(32px,6vw,84px)", fontWeight: 900, color: "#fff",
            lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 28,
          }}>
            {svc.name}
          </div>

          {/* CTA */}
          <Link href={`/services/${svc.slug}`}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: accent, borderRadius: 50, padding: "12px 28px",
              fontSize: 13, fontWeight: 700, color: "#fff",
              cursor: "pointer", letterSpacing: "0.04em",
              boxShadow: `0 8px 32px ${accent}55`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              View Service
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Right side — vertical service list */}
      <div style={{
        position: "absolute", right: "clamp(24px,4vw,56px)", top: "50%",
        transform: "translateY(-50%)", zIndex: 5,
        display: "flex", flexDirection: "column", gap: 10,
        maxHeight: "70vh", overflowY: "auto",
      }}>
        {services.map((s, i) => {
          const ac = CURTAIN_ACCENTS[i % CURTAIN_ACCENTS.length];
          return (
            <button
              key={s.slug}
              onClick={() => navigate_to(i)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "none", border: "none", cursor: "pointer", textAlign: "left",
                padding: "6px 0", opacity: i === active ? 1 : 0.4,
                transition: "opacity 0.3s ease",
              }}
              onMouseEnter={e => { if (i !== active) (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
              onMouseLeave={e => { if (i !== active) (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
            >
              <div style={{
                width: i === active ? 28 : 14, height: 2, borderRadius: 2,
                background: i === active ? ac : "rgba(255,255,255,0.4)",
                transition: "width 0.4s ease, background 0.3s ease", flexShrink: 0,
              }} />
              <div style={{
                fontSize: 11, fontWeight: i === active ? 700 : 400,
                color: i === active ? "#fff" : "rgba(255,255,255,0.55)",
                letterSpacing: i === active ? "-0.01em" : "0",
                whiteSpace: "nowrap", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis",
              }}>{s.name}</div>
            </button>
          );
        })}
      </div>

      {/* Progress bar at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: "rgba(255,255,255,0.08)", zIndex: 5,
      }}>
        <motion.div
          animate={{ width: `${((active + 1) / total) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
          style={{ height: "100%", background: accent }}
        />
      </div>

      {/* Keyboard hint */}
      <div style={{
        position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
        fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.2)",
        letterSpacing: "0.18em", textTransform: "uppercase", zIndex: 5,
      }}>
        click list → navigate
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 18 — ORB  (Fibonacci sphere of service cards — the INSANE one)
// Cards distributed on a 3D sphere via Fibonacci algorithm. Drag to rotate.
// Perspective projection, depth-sorted painter's algorithm — zero preserve-3d.
// ═══════════════════════════════════════════════════════════════════════════════
const SPHERE_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7","#22d3ee","#fb7185"];

const ServicesOrb = ({ services }: { services: ServiceCard[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const rotX = useRef(0.28);
  const rotY = useRef(0);
  const velY = useRef(0.006);
  const velX = useRef(0);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: -9999, y: -9999 });
  const hoveredRef = useRef(-1);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const ptsRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const [, navigate] = useLocation();

  // Init sphere points + images
  useEffect(() => {
    const N = services.length;
    const golden = (1 + Math.sqrt(5)) / 2;
    ptsRef.current = Array.from({ length: N }, (_, i) => {
      const theta = 2 * Math.PI * i / golden;
      const phi = Math.acos(1 - 2 * (i + 0.5) / N);
      return { x: Math.sin(phi) * Math.cos(theta), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta) };
    });
    imgsRef.current = services.map(svc => {
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = svc.image; return img;
    });
  }, [services]);

  // RAF loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.36;
      const CW = R * 0.40, CH = CW * 0.64;
      const FOV = 1000;

      // Auto-spin momentum
      if (!dragging.current) {
        rotY.current += velY.current;
        velY.current = velY.current * 0.9994 + 0.006 * 0.0006; // drift back toward base
        velX.current *= 0.94;
        rotX.current += velX.current;
        rotX.current = Math.max(-0.72, Math.min(0.72, rotX.current));
      }

      ctx.clearRect(0, 0, W, H);

      // ── Dark space background
      const bg = ctx.createRadialGradient(cx, cy * 0.9, 0, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0, "#0d0f1c");
      bg.addColorStop(0.5, "#07080f");
      bg.addColorStop(1, "#030408");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Star field (static — seeded by index)
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (let i = 0; i < 120; i++) {
        const sx = ((i * 173.7) % W);
        const sy = ((i * 97.3 + 41) % H);
        const sr = 0.5 + (i % 3) * 0.4;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }

      // ── Core glow
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55);
      coreGlow.addColorStop(0, "rgba(99,102,241,0.14)");
      coreGlow.addColorStop(1, "transparent");
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, W, H);

      // ── Equatorial orbit ring (subtle ellipse)
      ctx.save();
      ctx.strokeStyle = "rgba(99,102,241,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.05, R * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const cosY = Math.cos(rotY.current), sinY = Math.sin(rotY.current);
      const cosX = Math.cos(rotX.current), sinX = Math.sin(rotX.current);
      const mx = mouse.current.x, my = mouse.current.y;

      type Proj = { sx: number; sy: number; depth: number; sc: number; idx: number; wx: number; wy: number; wz: number };
      const proj: Proj[] = ptsRef.current.map((pt, i) => {
        // Rotate Y
        const x1 = pt.x * cosY - pt.z * sinY;
        const z1 = pt.x * sinY + pt.z * cosY;
        // Rotate X
        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = pt.y * sinX + z1 * cosX;
        const depth = (z2 + 1) / 2;
        const sc = FOV / (FOV + z2 * R);
        return { sx: cx + x1 * R * sc, sy: cy + y2 * R * sc, depth, sc, idx: i, wx: x1, wy: y2, wz: z2 };
      });

      // Painter's sort back→front
      proj.sort((a, b) => a.depth - b.depth);

      // ── Connection web (angular neighbors)
      ctx.save();
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const pi = proj[i], pj = proj[j];
          const dx = pi.wx - pj.wx, dy = pi.wy - pj.wy, dz = pi.wz - pj.wz;
          const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (d < 0.7) {
            const minD = Math.min(pi.depth, pj.depth);
            if (minD < 0.1) continue;
            const alpha = (1 - d / 0.7) * minD * 0.2;
            ctx.beginPath();
            ctx.moveTo(pi.sx, pi.sy);
            ctx.lineTo(pj.sx, pj.sy);
            ctx.strokeStyle = `rgba(99,102,241,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // ── Draw cards
      let hov = -1, minDst = 9999;

      for (const p of proj) {
        const { sx, sy, depth, sc, idx } = p;
        if (depth < 0.01) continue; // skip fully hidden

        const isHov = hoveredRef.current === idx;
        const fsc = isHov ? sc * 1.18 : sc;
        const cw = CW * fsc, ch = CH * fsc;
        const hw = cw / 2, hh = ch / 2;
        const r = 8 * fsc;
        const opacity = Math.max(0, 0.1 + depth * 0.9);
        const accent = SPHERE_ACCENTS[idx % SPHERE_ACCENTS.length];

        // Hover hit-test
        if (Math.abs(mx - sx) < hw + 10 && Math.abs(my - sy) < hh + 10) {
          const d = Math.hypot(mx - sx, my - sy);
          if (d < minDst) { minDst = d; hov = idx; }
        }

        ctx.save();
        ctx.globalAlpha = opacity;

        // Hover glow
        if (isHov) { ctx.shadowColor = accent + "cc"; ctx.shadowBlur = 28; }

        // Rounded rect card bg
        const rr = (x: number, y: number, w: number, h: number, rad: number) => {
          ctx.beginPath();
          ctx.moveTo(x + rad, y);
          ctx.lineTo(x + w - rad, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
          ctx.lineTo(x + w, y + h - rad);
          ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
          ctx.lineTo(x + rad, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
          ctx.lineTo(x, y + rad);
          ctx.quadraticCurveTo(x, y, x + rad, y);
          ctx.closePath();
        };

        rr(sx - hw, sy - hh, cw, ch, r);
        ctx.fillStyle = "#0c0e18";
        ctx.fill();
        if (isHov) { ctx.strokeStyle = accent; ctx.lineWidth = 1.8; ctx.stroke(); }

        // Image
        const img = imgsRef.current[idx];
        const imgH = ch * 0.58;
        if (img?.complete && img.naturalWidth > 0) {
          ctx.save();
          rr(sx - hw, sy - hh, cw, imgH, r);
          ctx.clip();
          const aspect = img.naturalWidth / img.naturalHeight;
          const iw = cw, ih = iw / aspect;
          ctx.drawImage(img, sx - hw, sy - hh + (ih > imgH ? -(ih - imgH) * 0.25 : 0), iw, Math.max(ih, imgH));
          // Gradient fade
          const fade = ctx.createLinearGradient(0, sy - hh + imgH * 0.45, 0, sy - hh + imgH);
          fade.addColorStop(0, "transparent");
          fade.addColorStop(1, "#0c0e18");
          ctx.fillStyle = fade;
          ctx.fillRect(sx - hw, sy - hh, cw, imgH);
          ctx.restore();
        } else {
          ctx.fillStyle = accent + "22";
          ctx.fillRect(sx - hw, sy - hh, cw, imgH);
        }

        // Accent top bar
        ctx.fillStyle = accent;
        ctx.fillRect(sx - hw + r, sy - hh, cw - r * 2, 2.5 * fsc);

        // Category micro label
        ctx.shadowBlur = 0;
        ctx.fillStyle = accent;
        ctx.font = `700 ${Math.max(6, 7.5 * fsc)}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(services[idx].category.split(" ")[0].toUpperCase(), sx, sy - hh + imgH + 12 * fsc);

        // Service name (word-wrap, max 2 lines)
        ctx.fillStyle = isHov ? "#fff" : `rgba(255,255,255,${0.35 + depth * 0.6})`;
        ctx.font = `${isHov ? "700" : "600"} ${Math.max(7, 9.5 * fsc)}px sans-serif`;
        const maxTW = cw - 12 * fsc;
        const words = services[idx].name.split(" ");
        let line = ""; const lines: string[] = [];
        for (const w of words) {
          const t = line ? `${line} ${w}` : w;
          if (ctx.measureText(t).width > maxTW && line) { lines.push(line); line = w; } else line = t;
        }
        if (line) lines.push(line);
        const lh = 11.5 * fsc;
        lines.slice(0, 2).forEach((l, li) => ctx.fillText(l, sx, sy - hh + imgH + 24 * fsc + li * lh));

        ctx.restore();
      }

      hoveredRef.current = hov;
      canvas.style.cursor = hov >= 0 ? "pointer" : (dragging.current ? "grabbing" : "grab");

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [services]);

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", background: "#030408", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseDown={e => { dragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; }}
        onMouseMove={e => {
          const rect = canvasRef.current!.getBoundingClientRect();
          mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          if (dragging.current) {
            const dx = e.clientX - lastMouse.current.x, dy = e.clientY - lastMouse.current.y;
            rotY.current += dx * 0.005; rotX.current += dy * 0.005;
            rotX.current = Math.max(-0.72, Math.min(0.72, rotX.current));
            velY.current = dx * 0.003; velX.current = dy * 0.003;
            lastMouse.current = { x: e.clientX, y: e.clientY };
          }
        }}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; mouse.current = { x: -9999, y: -9999 }; hoveredRef.current = -1; }}
        onClick={() => { if (hoveredRef.current >= 0) navigate(`/services/${services[hoveredRef.current].slug}`); }}
      />
      <div style={{
        position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)",
        fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.18)",
        letterSpacing: "0.22em", textTransform: "uppercase", pointerEvents: "none",
      }}>drag to rotate · click to explore</div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 19 — WORMHOLE  (space portal with 3 tilted orbital rings of cards)
// Swirling vortex rings in center. Cards orbit on tilted elliptical planes.
// ═══════════════════════════════════════════════════════════════════════════════
const WORMHOLE_ACCENTS = ["#818cf8","#fbbf24","#34d399","#f87171","#c084fc","#22d3ee","#fb923c","#f472b6","#4ade80","#60a5fa"];

const ServicesWormhole = ({ services }: { services: ServiceCard[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const hoveredRef = useRef(-1);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    imgsRef.current = services.map(s => {
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = s.image; return img;
    });
  }, [services]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize(); window.addEventListener("resize", resize);

    // Distribute cards into 3 tilted rings
    const RING_DEF = [
      { r: 0, tilt: 0.38, spd: 0.009 },
      { r: 0, tilt: 0.22, spd: -0.006 },
      { r: 0, tilt: 0.52, spd: 0.012 },
    ];
    const cardRing: { ring: number; baseAngle: number; idx: number }[] = services.map((_, i) => ({
      ring: i % 3, baseAngle: (i / services.length) * Math.PI * 2 * 3, idx: i,
    }));

    const tick = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const cx = W / 2, cy = H / 2;
      const maxR = Math.min(W, H) * 0.41;
      RING_DEF[0].r = maxR; RING_DEF[1].r = maxR * 0.72; RING_DEF[2].r = maxR * 0.52;
      const CW = maxR * 0.185, CH = CW * 0.65;
      const FOV = 900;

      ctx.clearRect(0, 0, W, H);

      // ── Deep space background
      const bg = ctx.createRadialGradient(cx, cy * 0.85, 0, cx, cy, Math.max(W, H));
      bg.addColorStop(0, "#0a0814"); bg.addColorStop(0.55, "#05060e"); bg.addColorStop(1, "#020308");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Stars
      for (let i = 0; i < 200; i++) {
        const a = 0.15 + (i % 5) * 0.12;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc((i*161.8)%W, (i*93.1+31)%H, 0.4 + (i%4)*0.3, 0, Math.PI*2); ctx.fill();
      }

      // ── Vortex portal rings (27 rings, innermost fastest)
      const NR = 27;
      for (let ri = NR; ri >= 0; ri--) {
        const frac = ri / NR;
        const r = maxR * 0.5 * Math.pow(frac, 0.55);
        const angSpeed = t * 0.6 / (frac + 0.08);
        const tilt = 0.36;
        const rx = r;
        const ry = r * Math.sin(tilt);
        const hue = 255 - frac * 55;
        const alpha = frac * 0.26 + (1 - frac) * 0.06;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, angSpeed * 0.08, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 75%, 68%, ${alpha})`;
        ctx.lineWidth = frac < 0.12 ? 2.5 : 0.8 + frac * 1.4;
        ctx.stroke();
        ctx.restore();
      }

      // Core glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.28);
      cg.addColorStop(0, "rgba(130,100,255,0.55)"); cg.addColorStop(0.35, "rgba(80,60,200,0.18)"); cg.addColorStop(1, "transparent");
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);

      // ── Project orbital cards
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      let hov = -1, minD = 9999;
      type OC = { sx: number; sy: number; depth: number; idx: number; cw: number; ch: number };
      const orbCards: OC[] = cardRing.map(cd => {
        const ring = RING_DEF[cd.ring];
        const angle = cd.baseAngle + t * ring.spd;
        const lx = Math.cos(angle) * ring.r;
        const ly = Math.sin(angle) * ring.r * Math.cos(ring.tilt);
        const lz = Math.sin(angle) * ring.r * Math.sin(ring.tilt);
        const depth = (lz + ring.r) / (ring.r * 2);
        const sc = FOV / (FOV + lz);
        return { sx: cx + lx * sc, sy: cy + ly * sc, depth, idx: cd.idx, cw: CW * sc, ch: CH * sc };
      });
      orbCards.sort((a, b) => a.depth - b.depth);

      const drawRR = (sx: number, sy: number, hw: number, hh: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(sx-hw+r, sy-hh); ctx.lineTo(sx+hw-r, sy-hh); ctx.quadraticCurveTo(sx+hw, sy-hh, sx+hw, sy-hh+r);
        ctx.lineTo(sx+hw, sy+hh-r); ctx.quadraticCurveTo(sx+hw, sy+hh, sx+hw-r, sy+hh);
        ctx.lineTo(sx-hw+r, sy+hh); ctx.quadraticCurveTo(sx-hw, sy+hh, sx-hw, sy+hh-r);
        ctx.lineTo(sx-hw, sy-hh+r); ctx.quadraticCurveTo(sx-hw, sy-hh, sx-hw+r, sy-hh); ctx.closePath();
      };

      for (const oc of orbCards) {
        const { sx, sy, depth, idx, cw, ch } = oc;
        const isHov = hoveredRef.current === idx;
        const fsc = isHov ? 1.16 : 1;
        const fw = cw * fsc, fh = ch * fsc;
        const hw = fw / 2, hh = fh / 2;
        const r = 7 * (fw / CW);
        const opacity = Math.max(0, 0.08 + depth * 0.92);
        const accent = WORMHOLE_ACCENTS[idx % WORMHOLE_ACCENTS.length];
        if (Math.abs(mx-sx) < hw+10 && Math.abs(my-sy) < hh+10) { const d = Math.hypot(mx-sx,my-sy); if (d < minD) { minD = d; hov = idx; } }
        ctx.save(); ctx.globalAlpha = opacity;
        if (isHov) { ctx.shadowColor = accent + "cc"; ctx.shadowBlur = 26; }
        drawRR(sx, sy, hw, hh, r); ctx.fillStyle = "#0c0a18"; ctx.fill();
        if (isHov) { ctx.strokeStyle = accent; ctx.lineWidth = 1.8; ctx.stroke(); }
        const img = imgsRef.current[idx]; const imgH = fh * 0.56;
        if (img?.complete && img.naturalWidth > 0) {
          ctx.save(); drawRR(sx, sy, hw, hh, r); ctx.clip();
          ctx.drawImage(img, sx-hw, sy-hh, fw, imgH * 1.1);
          const fd = ctx.createLinearGradient(0, sy-hh+imgH*0.45, 0, sy-hh+imgH);
          fd.addColorStop(0, "transparent"); fd.addColorStop(1, "#0c0a18");
          ctx.fillStyle = fd; ctx.fillRect(sx-hw, sy-hh, fw, imgH); ctx.restore();
        }
        ctx.fillStyle = accent; ctx.fillRect(sx-hw+r, sy-hh, fw-r*2, 2.2*(fw/CW));
        ctx.shadowBlur = 0;
        ctx.fillStyle = isHov ? "#fff" : `rgba(255,255,255,${0.38+depth*0.58})`;
        const fs = Math.max(6, 8.5*(fw/CW)); ctx.font = `600 ${fs}px sans-serif`; ctx.textAlign = "center";
        const words = services[idx].name.split(" "); let line2 = ""; const lines2: string[] = [];
        for (const w of words) { const t2 = line2 ? `${line2} ${w}` : w; if (ctx.measureText(t2).width > fw-10 && line2) { lines2.push(line2); line2 = w; } else line2 = t2; }
        if (line2) lines2.push(line2);
        lines2.slice(0,2).forEach((l, li) => ctx.fillText(l, sx, sy-hh+imgH+13*(fw/CW)+li*(fs+2)));
        ctx.restore();
      }
      hoveredRef.current = hov; canvas.style.cursor = hov >= 0 ? "pointer" : "default";
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [services]);

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", background: "#020308", position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }}
        onMouseMove={e => { const r = canvasRef.current!.getBoundingClientRect(); mouseRef.current = { x: e.clientX-r.left, y: e.clientY-r.top }; }}
        onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; hoveredRef.current = -1; }}
        onClick={() => { if (hoveredRef.current >= 0) navigate(`/services/${services[hoveredRef.current].slug}`); }}
      />
      <div style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", fontFamily: "monospace", fontSize: 9, color: "rgba(160,130,255,0.28)", letterSpacing: "0.24em", textTransform: "uppercase", pointerEvents: "none" }}>
        3 orbital rings · hover to focus · click to explore
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 20 — HELIX  (rotating DNA double helix — scroll to traverse)
// Two intertwined strands with service cards as nodes. Scroll moves the camera.
// ═══════════════════════════════════════════════════════════════════════════════
const ServicesHelix = ({ services }: { services: ServiceCard[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const rotRef = useRef(0);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const hoveredRef = useRef(-1);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    imgsRef.current = services.map(s => { const img = new Image(); img.crossOrigin = "anonymous"; img.src = s.image; return img; });
  }, [services]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize(); window.addEventListener("resize", resize);
    const onWheel = (e: WheelEvent) => { e.preventDefault(); targetScrollRef.current += e.deltaY * 0.9; };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const HRAD = 200, SPACING = 100, FOV = 750;
    const N = services.length;

    const tick = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const cx = W / 2, cy = H / 2;
      const CW = Math.min(W * 0.14, 148), CH = CW * 0.63;

      rotRef.current += 0.008;
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.07;

      ctx.clearRect(0, 0, W, H);
      // Bg gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#050912"); bg.addColorStop(1, "#030609");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // Stars
      for (let i = 0; i < 100; i++) { ctx.fillStyle=`rgba(255,255,255,${0.15+(i%5)*0.08})`; ctx.beginPath(); ctx.arc((i*173.6)%W,(i*89.1+11)%H,0.5+(i%3)*0.25,0,Math.PI*2); ctx.fill(); }

      type Node = { sx: number; sy: number; depth: number; wz: number; wy: number; sc: number; idx: number; strand: number };
      const nodes: Node[] = [];
      for (let i = 0; i < N; i++) {
        for (let s = 0; s < 2; s++) {
          const angle = (i / N) * Math.PI * 6 + rotRef.current + s * Math.PI;
          const wx = Math.cos(angle) * HRAD;
          const wz = Math.sin(angle) * HRAD;
          const wy = i * SPACING - scrollRef.current - N * SPACING / 2;
          const depth = (wz + HRAD) / (HRAD * 2);
          const sc = FOV / (FOV + wz + HRAD * 0.6);
          nodes.push({ sx: cx + wx * sc, sy: cy + wy * sc, depth, wz, wy, sc, idx: i, strand: s });
        }
      }

      // Backbone lines
      for (let s = 0; s < 2; s++) {
        const sns = nodes.filter(n => n.strand === s).sort((a, b) => a.idx - b.idx);
        for (let i = 0; i < sns.length - 1; i++) {
          const a = sns[i], b = sns[i+1];
          if (a.sy < -CH*2 || a.sy > H + CH*2) continue;
          const alpha = Math.min(a.depth, b.depth) * 0.55;
          ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = s === 0 ? `rgba(99,102,241,${alpha})` : `rgba(20,184,166,${alpha})`;
          ctx.lineWidth = 1.8; ctx.stroke();
        }
      }
      // Cross-rungs
      for (let i = 0; i < N; i++) {
        const a = nodes.find(n => n.idx === i && n.strand === 0);
        const b = nodes.find(n => n.idx === i && n.strand === 1);
        if (!a || !b || a.sy < -CH*2 || a.sy > H+CH*2) continue;
        const ad = (a.depth + b.depth) / 2;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = `rgba(180,180,220,${ad * 0.22})`; ctx.lineWidth = 0.8; ctx.stroke();
      }

      // Sort nodes back→front
      const sortedNodes = [...nodes].sort((a, b) => a.depth - b.depth);
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      let hov = -1, minD = 9999;

      for (const n of sortedNodes) {
        if (n.sy < -CH*2 || n.sy > H + CH*2) continue;
        const { sx, sy, depth, sc, idx } = n;
        const cw = CW * sc, ch = CH * sc;
        const hw = cw/2, hh = ch/2, r = 7*sc;
        const isHov = hoveredRef.current === idx;
        const fsc = isHov ? 1.15 : 1;
        const fw = cw*fsc, fh = ch*fsc, fhw = fw/2, fhh = fh/2, fr = r*fsc;
        const opacity = 0.1 + depth * 0.9;
        const accent = SPHERE_ACCENTS[idx % SPHERE_ACCENTS.length];
        if (Math.abs(mx-sx)<fhw+8 && Math.abs(my-sy)<fhh+8) { const d = Math.hypot(mx-sx,my-sy); if(d<minD){minD=d;hov=idx;} }
        ctx.save(); ctx.globalAlpha = opacity;
        if (isHov) { ctx.shadowColor = accent+"bb"; ctx.shadowBlur = 22; }
        const rr2 = (x: number, y: number, w: number, h: number, rd: number) => {
          ctx.beginPath(); ctx.moveTo(x+rd,y); ctx.lineTo(x+w-rd,y); ctx.quadraticCurveTo(x+w,y,x+w,y+rd);
          ctx.lineTo(x+w,y+h-rd); ctx.quadraticCurveTo(x+w,y+h,x+w-rd,y+h); ctx.lineTo(x+rd,y+h);
          ctx.quadraticCurveTo(x,y+h,x,y+h-rd); ctx.lineTo(x,y+rd); ctx.quadraticCurveTo(x,y,x+rd,y); ctx.closePath();
        };
        rr2(sx-fhw, sy-fhh, fw, fh, fr);
        ctx.fillStyle = n.strand === 0 ? "#0c0f1c" : "#0a130f"; ctx.fill();
        if (isHov) { ctx.strokeStyle = accent; ctx.lineWidth = 1.6; ctx.stroke(); }
        const img = imgsRef.current[idx]; const imgH = fh * 0.53;
        if (img?.complete && img.naturalWidth > 0) {
          ctx.save(); rr2(sx-fhw, sy-fhh, fw, imgH, fr); ctx.clip();
          ctx.drawImage(img, sx-fhw, sy-fhh, fw, imgH*1.15);
          const fd = ctx.createLinearGradient(0, sy-fhh+imgH*0.4, 0, sy-fhh+imgH);
          fd.addColorStop(0,"transparent"); fd.addColorStop(1, n.strand===0?"#0c0f1c":"#0a130f");
          ctx.fillStyle=fd; ctx.fillRect(sx-fhw, sy-fhh, fw, imgH); ctx.restore();
        }
        ctx.fillStyle = accent; ctx.fillRect(sx-fhw+fr, sy-fhh, fw-fr*2, 2.2*fsc);
        ctx.shadowBlur = 0; ctx.fillStyle = `rgba(255,255,255,${0.38+depth*0.58})`; ctx.font = `600 ${Math.max(6,8.5*fsc)}px sans-serif`; ctx.textAlign = "center";
        const words = services[idx].name.split(" "); let ln = ""; const lns: string[] = [];
        for (const w of words) { const t = ln?`${ln} ${w}`:w; if(ctx.measureText(t).width>fw-10&&ln){lns.push(ln);ln=w;}else ln=t; }
        if(ln)lns.push(ln); lns.slice(0,2).forEach((l,li)=>ctx.fillText(l,sx,sy-fhh+imgH+12*fsc+li*(9*fsc+2)));
        ctx.restore();
      }
      hoveredRef.current = hov; canvas.style.cursor = hov>=0?"pointer":"default";
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); canvas.removeEventListener("wheel", onWheel); };
  }, [services]);

  return (
    <div style={{ width:"100%", height:"100vh", overflow:"hidden", background:"#030609", position:"relative" }}>
      <canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"100%" }}
        onMouseMove={e => { const r=canvasRef.current!.getBoundingClientRect(); mouseRef.current={x:e.clientX-r.left,y:e.clientY-r.top}; }}
        onMouseLeave={() => { mouseRef.current={x:-9999,y:-9999}; hoveredRef.current=-1; }}
        onClick={() => { if(hoveredRef.current>=0) navigate(`/services/${services[hoveredRef.current].slug}`); }}
      />
      <div style={{ position:"absolute", bottom:26, left:"50%", transform:"translateX(-50%)", fontFamily:"monospace", fontSize:9, color:"rgba(100,200,180,0.28)", letterSpacing:"0.24em", textTransform:"uppercase", pointerEvents:"none" }}>
        scroll to traverse · click to explore
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 21 — RIPPLE  (physics wave grid — click anywhere to send shockwaves)
// Cards ride a sinusoidal wave. Clicks launch ripple physics across the grid.
// ═══════════════════════════════════════════════════════════════════════════════
const RIPPLE_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7"];

interface Ripple { x: number; y: number; born: number; strength: number }

const ServicesRipple = ({ services }: { services: ServiceCard[] }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const grid = gridRef.current; if (!grid) { rafRef.current = requestAnimationFrame(tick); return; }
      const gridRect = grid.getBoundingClientRect();
      const mx = mouseRef.current.x - gridRect.left;
      const my = mouseRef.current.y - gridRect.top + grid.scrollTop;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const ccx = card.offsetLeft + card.offsetWidth / 2;
        const ccy = card.offsetTop + card.offsetHeight / 2;
        let ty = 0, rx = 0;

        // Continuous mouse proximity wave
        const mouseDist = Math.hypot(ccx - mx, ccy - my);
        const mWave = Math.sin(mouseDist * 0.012 - now * 0.0025) * Math.max(0, 1 - mouseDist / 380) * 18;
        ty += mWave; rx += mWave * 0.6;

        // Click ripples
        ripplesRef.current.forEach(rip => {
          const age = (now - rip.born) / 1000;
          if (age > 2.2) return;
          const dist = Math.hypot(ccx - rip.x, ccy - rip.y);
          const front = age * 520;
          const prox = Math.max(0, 1 - Math.abs(dist - front) / 110);
          const decay = Math.max(0, 1 - age / 2.2);
          const s = prox * decay * rip.strength;
          ty += -Math.sin(age * 9) * s * 46;
          rx += Math.sin(age * 9) * s * 14;
        });

        const shd = Math.max(0, ty * 0.45);
        card.style.transform = `translateY(${ty.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) scale(${(1 + Math.abs(ty) * 0.0007).toFixed(4)})`;
        card.style.boxShadow = `0 ${(8 + shd).toFixed(0)}px ${(20 + shd * 2).toFixed(0)}px rgba(0,0,0,${(0.07 + shd * 0.004).toFixed(3)})`;
        card.style.zIndex = ty > 0 ? "2" : "1";
      });

      ripplesRef.current = ripplesRef.current.filter(r => now - r.born < 2200);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [services]);

  const addRipple = (e: React.MouseEvent) => {
    const grid = gridRef.current; if (!grid) return;
    const rect = grid.getBoundingClientRect();
    ripplesRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top + grid.scrollTop, born: Date.now(), strength: 1 });
  };

  return (
    <div style={{ background: "#f6f6f4", minHeight: "100vh", perspective: "1100px" }}>
      <div style={{ padding: "clamp(48px,7vw,88px) clamp(20px,5vw,64px) 0" }}>
        <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease:[0.22,1,0.36,1] }} style={{ marginBottom:"clamp(28px,4vw,52px)" }}>
          <div style={{ fontSize:"clamp(10px,1.4vw,12px)", fontWeight:600, letterSpacing:"0.18em", color:"#aaa", textTransform:"uppercase", marginBottom:10 }}>Click anywhere to send a ripple</div>
          <div style={{ fontSize:"clamp(28px,4.5vw,56px)", fontWeight:900, color:"#0a0a0a", letterSpacing:"-0.04em", lineHeight:1.05 }}>RIPPLE</div>
        </motion.div>
      </div>
      <div
        ref={gridRef}
        onMouseMove={e => { mouseRef.current = { x: e.clientX, y: e.clientY }; }}
        onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; }}
        onClick={addRipple}
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(clamp(200px,22vw,290px), 1fr))",
          gap:"clamp(12px,2vw,22px)",
          padding:"0 clamp(20px,5vw,64px) 80px",
          overflowY:"auto", maxHeight:"80vh",
        }}
      >
        {services.map((svc, i) => {
          const accent = RIPPLE_ACCENTS[i % RIPPLE_ACCENTS.length];
          return (
            <motion.div
              key={svc.slug}
              ref={el => { cardRefs.current[i] = el; }}
              initial={{ opacity:0, y:24 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:(i%5)*0.055, duration:0.5, ease:[0.22,1,0.36,1] }}
              style={{ transformOrigin:"center 80%", transition:"none" }}
            >
              <Link href={`/services/${svc.slug}`}>
                <div style={{
                  background:"#fff", borderRadius:16, overflow:"hidden",
                  border:"1px solid rgba(17,19,23,0.07)", cursor:"pointer",
                }}>
                  <div style={{ height:180, overflow:"hidden", position:"relative" }}>
                    <img src={svc.image} alt={svc.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:accent }} />
                  </div>
                  <div style={{ padding:"14px 16px 16px" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:accent, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:6 }}>{svc.category.split(" ").slice(0,2).join(" ")}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#111", lineHeight:1.3, letterSpacing:"-0.01em" }}>{svc.name}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 22 — EDITORIAL  (luxury magazine spread — Wallpaper* / Monocle aesthetic)
// Alternating full-bleed image + editorial typography. Oversized ghost numbers.
// ═══════════════════════════════════════════════════════════════════════════════
const EDITORIAL_ACCENTS = ["#2563eb","#d97706","#059669","#dc2626","#7c3aed","#0891b2","#ea580c","#db2777"];

const EditorialRow = ({ svc, index }: { svc: ServiceCard; index: number }) => {
  const isLeft = index % 2 === 0;
  const accent = EDITORIAL_ACCENTS[index % EDITORIAL_ACCENTS.length];
  const imgRef = useRef<HTMLImageElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/services/${svc.slug}`}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid #e8e8e8",
            minHeight: "clamp(260px,32vw,420px)",
            cursor: "pointer",
          }}
          onMouseEnter={() => {
            if (imgRef.current) imgRef.current.style.transform = "scale(1.06)";
            if (lineRef.current) lineRef.current.style.width = "72px";
            if (numRef.current) numRef.current.style.color = accent;
          }}
          onMouseLeave={() => {
            if (imgRef.current) imgRef.current.style.transform = "scale(1)";
            if (lineRef.current) lineRef.current.style.width = "36px";
            if (numRef.current) numRef.current.style.color = "#efefef";
          }}
        >
          {/* Image */}
          <div style={{ overflow: "hidden", order: isLeft ? 0 : 1, position: "relative" }}>
            <img
              ref={imgRef}
              src={svc.image} alt={svc.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.75s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </div>

          {/* Content */}
          <div style={{
            order: isLeft ? 1 : 0,
            padding: "clamp(28px,4vw,56px)",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            borderLeft: isLeft ? "none" : "1px solid #e8e8e8",
            borderRight: isLeft ? "1px solid #e8e8e8" : "none",
            position: "relative", overflow: "hidden",
          }}>
            {/* Ghost number */}
            <div
              ref={numRef}
              style={{
                position: "absolute", top: -12, right: isLeft ? 16 : "auto", left: isLeft ? "auto" : 16,
                fontSize: "clamp(80px,14vw,160px)", fontWeight: 900,
                color: "#efefef", lineHeight: 1, letterSpacing: "-0.06em",
                userSelect: "none", pointerEvents: "none",
                transition: "color 0.5s ease",
              }}
            >{String(index + 1).padStart(2, "0")}</div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 18 }}>
                {svc.category.split(" ").slice(0, 3).join(" ")}
              </div>
              <div style={{ fontSize: "clamp(20px,2.4vw,32px)", fontWeight: 800, color: "#0a0a0a", lineHeight: 1.2, letterSpacing: "-0.025em" }}>
                {svc.name}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
              <div ref={lineRef} style={{ width: 36, height: 1.5, background: accent, transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Explore</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ServicesEditorial = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ background: "#fff", minHeight: "100vh" }}>
    {/* Masthead */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: "20px clamp(24px,6vw,80px)",
        borderBottom: "1px solid #e8e8e8",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.24em", color: "#aaa", textTransform: "uppercase", fontWeight: 600 }}>Services — Editorial</div>
      <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#bbb", textTransform: "uppercase" }}>{services.length} entries</div>
    </motion.div>
    {services.map((svc, i) => <EditorialRow key={svc.slug} svc={svc} index={i} />)}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 23 — AGENCY  (bold dark rows — clip-path image reveal — BASIC / Instrument)
// Full-width service rows. Hover drags a full-bleed image across from the left.
// ═══════════════════════════════════════════════════════════════════════════════
const AGENCY_ACCENTS = ["#a78bfa","#fbbf24","#34d399","#f87171","#60a5fa","#f472b6","#4ade80","#fb923c"];

const AgencyRow = ({ svc, index }: { svc: ServiceCard; index: number }) => {
  const accent = AGENCY_ACCENTS[index % AGENCY_ACCENTS.length];
  const imgRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (index % 6) * 0.04 }}
    >
      <Link href={`/services/${svc.slug}`}>
        <div
          style={{
            position: "relative", overflow: "hidden",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer",
          }}
          onMouseEnter={() => {
            if (imgRef.current) imgRef.current.style.clipPath = "inset(0% 0% 0% 0%)";
            if (nameRef.current) { nameRef.current.style.color = "#fff"; nameRef.current.style.letterSpacing = "-0.04em"; }
            if (arrowRef.current) { arrowRef.current.style.opacity = "1"; arrowRef.current.style.transform = "translateX(0)"; }
            if (numRef.current) numRef.current.style.color = accent;
          }}
          onMouseLeave={() => {
            if (imgRef.current) imgRef.current.style.clipPath = "inset(0% 100% 0% 0%)";
            if (nameRef.current) { nameRef.current.style.color = "rgba(255,255,255,0.88)"; nameRef.current.style.letterSpacing = "-0.025em"; }
            if (arrowRef.current) { arrowRef.current.style.opacity = "0"; arrowRef.current.style.transform = "translateX(-12px)"; }
            if (numRef.current) numRef.current.style.color = "rgba(255,255,255,0.18)";
          }}
        >
          {/* Full-bleed image (clip-path slide reveal) */}
          <div
            ref={imgRef}
            style={{
              position: "absolute", inset: 0,
              background: `url(${svc.image}) center/cover no-repeat`,
              clipPath: "inset(0% 100% 0% 0%)",
              transition: "clip-path 0.7s cubic-bezier(0.76,0,0.24,1)",
              opacity: 0.22,
            }}
          />
          {/* Row content */}
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "clamp(18px,2.5vw,32px) clamp(24px,6vw,88px)",
            gap: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(20px,3.5vw,60px)", flex: 1 }}>
              <span
                ref={numRef}
                style={{
                  fontFamily: "monospace", fontSize: "clamp(10px,1.3vw,13px)",
                  color: "rgba(255,255,255,0.18)", fontWeight: 700, letterSpacing: "0.1em",
                  minWidth: 28, transition: "color 0.3s ease",
                }}
              >{String(index + 1).padStart(2, "0")}</span>
              <div
                ref={nameRef}
                style={{
                  fontSize: "clamp(18px,2.6vw,38px)", fontWeight: 800,
                  color: "rgba(255,255,255,0.88)", letterSpacing: "-0.025em",
                  lineHeight: 1.1, transition: "color 0.3s ease, letter-spacing 0.4s ease",
                }}
              >{svc.name}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {svc.category.split(" ")[0]}
              </span>
              <span
                ref={arrowRef}
                style={{
                  fontSize: 18, color: accent, opacity: 0,
                  transform: "translateX(-12px)",
                  transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                }}
              >→</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ServicesAgency = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ background: "#070809", minHeight: "100vh" }}>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ padding: "clamp(48px,7vw,88px) clamp(24px,6vw,88px) clamp(28px,4vw,52px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div style={{ fontSize: "clamp(10px,1.4vw,12px)", fontWeight: 600, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 14 }}>
        What We Do
      </div>
      <div style={{ fontSize: "clamp(32px,5.5vw,72px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
        Services
      </div>
    </motion.div>
    {services.map((svc, i) => <AgencyRow key={svc.slug} svc={svc} index={i} />)}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 24 — PRODUCT  (Apple / Stripe clean card grid — premium minimal)
// White cards on soft grey, strong image, clean hierarchy, micro-animations.
// ═══════════════════════════════════════════════════════════════════════════════
const PRODUCT_ACCENTS = ["#0066cc","#bf5af2","#ff9500","#ff3b30","#34c759","#007aff","#ff2d55","#5ac8fa"];

const ProductCard = ({ svc, index }: { svc: ServiceCard; index: number }) => {
  const accent = PRODUCT_ACCENTS[index % PRODUCT_ACCENTS.length];
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.07 }}
    >
      <Link href={`/services/${svc.slug}`}>
        <div
          ref={cardRef}
          style={{
            background: "#fff", borderRadius: 22, overflow: "hidden", cursor: "pointer",
            transition: "transform 0.42s cubic-bezier(0.22,1,0.36,1), box-shadow 0.42s ease",
          }}
          onMouseEnter={() => {
            if (cardRef.current) { cardRef.current.style.transform = "translateY(-6px) scale(1.01)"; cardRef.current.style.boxShadow = "0 28px 72px rgba(0,0,0,0.12)"; }
            if (imgRef.current) imgRef.current.style.transform = "scale(1.06)";
            if (arrowRef.current) { arrowRef.current.style.transform = "translateX(4px)"; arrowRef.current.style.opacity = "1"; }
          }}
          onMouseLeave={() => {
            if (cardRef.current) { cardRef.current.style.transform = "translateY(0) scale(1)"; cardRef.current.style.boxShadow = "none"; }
            if (imgRef.current) imgRef.current.style.transform = "scale(1)";
            if (arrowRef.current) { arrowRef.current.style.transform = "translateX(0)"; arrowRef.current.style.opacity = "0.55"; }
          }}
        >
          {/* Image */}
          <div style={{ height: "clamp(180px,22vw,260px)", overflow: "hidden", background: "#f2f2f7" }}>
            <img
              ref={imgRef}
              src={svc.image} alt={svc.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </div>

          {/* Content */}
          <div style={{ padding: "20px 22px 24px" }}>
            {/* Category pill */}
            <div style={{
              display: "inline-block", padding: "3px 10px", borderRadius: 20,
              background: accent + "12", border: `1px solid ${accent}28`,
              fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 12,
            }}>{svc.category.split(" ")[0]}</div>

            {/* Name */}
            <div style={{ fontSize: "clamp(15px,1.6vw,19px)", fontWeight: 700, color: "#1d1d1f", lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: 16 }}>
              {svc.name}
            </div>

            {/* CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: accent }}>
              Learn more
              <span
                ref={arrowRef}
                style={{ opacity: 0.55, transition: "transform 0.3s ease, opacity 0.3s ease", display: "inline-block" }}
              >→</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ServicesProduct = ({ services }: { services: ServiceCard[] }) => (
  <div style={{ background: "#f5f5f7", minHeight: "100vh", padding: "clamp(52px,7vw,96px) clamp(20px,5vw,72px) 80px" }}>
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: "clamp(32px,5vw,64px)", textAlign: "center" }}
    >
      <div style={{ fontSize: "clamp(11px,1.4vw,12px)", fontWeight: 600, letterSpacing: "0.2em", color: "#86868b", textTransform: "uppercase", marginBottom: 12 }}>
        {services.length} Services Available
      </div>
      <div style={{ fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 800, color: "#1d1d1f", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
        Everything you need.<br />Nothing you don't.
      </div>
    </motion.div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(240px,26vw,340px),1fr))", gap: "clamp(12px,2vw,20px)" }}>
      {services.map((svc, i) => <ProductCard key={svc.slug} svc={svc} index={i} />)}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 25 — DASHBOARD  (SaaS data table — Linear / Stripe / Vercel aesthetic)
// Stats bar at top. Clean rows with thumbnail + name + category chip + CTA.
// ═══════════════════════════════════════════════════════════════════════════════
const DASH_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7"];

const DashRow = ({ svc, index }: { svc: ServiceCard; index: number }) => {
  const accent = DASH_ACCENTS[index % DASH_ACCENTS.length];
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: (index % 8) * 0.03 }}
    >
      <Link href={`/services/${svc.slug}`}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "48px 52px 1fr 180px 88px",
            gap: "clamp(8px,1.5vw,20px)",
            alignItems: "center",
            padding: "clamp(10px,1.4vw,14px) clamp(16px,3vw,32px)",
            borderBottom: "1px solid #f0f0ef",
            cursor: "pointer",
            transition: "background 0.18s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f9f9f8"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          {/* Index */}
          <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#c4c4c4", letterSpacing: "0.06em" }}>
            {String(index + 1).padStart(2, "0")}
          </div>

          {/* Thumbnail */}
          <div style={{ width: 44, height: 34, borderRadius: 8, overflow: "hidden", border: "1px solid #eee", flexShrink: 0 }}>
            <img src={svc.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>

          {/* Name */}
          <div style={{ fontSize: "clamp(12px,1.3vw,14px)", fontWeight: 600, color: "#0a0a0a", letterSpacing: "-0.01em", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {svc.name}
          </div>

          {/* Category chip */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#555", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {svc.category.split(" ").slice(0,3).join(" ")}
            </span>
          </div>

          {/* Action */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6,
            fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            View
            <span style={{ fontSize: 13 }}>→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ServicesDashboard = ({ services }: { services: ServiceCard[] }) => {
  const catCounts = useMemo(() => {
    const map: Record<string, number> = {};
    services.forEach(s => { const k = s.category.split(" ")[0]; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [services]);

  return (
    <div style={{ background: "#fafaf8", minHeight: "100vh" }}>
      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderBottom: "1px solid #ebebea",
          padding: "clamp(16px,2.5vw,28px) clamp(16px,3vw,32px)",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: "clamp(16px,2vw,22px)", fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
            Services
            <span style={{ fontWeight: 400, color: "#aaa", marginLeft: 10, fontSize: "0.65em" }}>{services.length} total</span>
          </div>
          <div style={{ display: "flex", gap: "clamp(12px,2vw,28px)", flexWrap: "wrap" }}>
            {catCounts.map(([cat, count], i) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: DASH_ACCENTS[i % DASH_ACCENTS.length] }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#444", letterSpacing: "0.02em" }}>{cat}</span>
                <span style={{ fontSize: 11, color: "#bbb", fontFamily: "monospace" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Table header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "48px 52px 1fr 180px 88px",
        gap: "clamp(8px,1.5vw,20px)",
        alignItems: "center",
        padding: "clamp(8px,1.2vw,12px) clamp(16px,3vw,32px)",
        borderBottom: "2px solid #ebebea",
        background: "#fff",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        {["#", "IMG", "Service Name", "Category", ""].map((h, i) => (
          <div key={i} style={{ fontSize: 9, fontWeight: 700, color: "#bbb", letterSpacing: "0.14em", textTransform: "uppercase" }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ background: "#fff" }}>
        {services.map((svc, i) => <DashRow key={svc.slug} svc={svc} index={i} />)}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 26 — SPLIT  (left list + right full-bleed image — Lusion / Locomotive)
// Hover the list on the left → the full-bleed image on the right crossfades.
// Perfect UI. Professional. No wasted space.
// ═══════════════════════════════════════════════════════════════════════════════
const SPLIT_ACCENTS = ["#2563eb","#d97706","#059669","#dc2626","#7c3aed","#0891b2","#ea580c","#db2777","#16a34a","#9333ea"];

const ServicesSplit = ({ services }: { services: ServiceCard[] }) => {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const [fading, setFading] = useState(false);

  const select = (i: number) => {
    if (i === active) return;
    setPrev(active);
    setFading(true);
    setTimeout(() => { setActive(i); setFading(false); }, 10);
  };

  const svc = services[active];
  const accent = SPLIT_ACCENTS[active % SPLIT_ACCENTS.length];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#fff" }}>
      {/* ── Left panel: scrollable service list */}
      <div style={{
        width: "clamp(260px,34vw,440px)", flexShrink: 0,
        borderRight: "1px solid #e8e8e8", overflowY: "auto",
        display: "flex", flexDirection: "column",
      }}>
        {/* Masthead */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #f0f0ef", flexShrink: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "#bbb", fontWeight: 600, marginBottom: 8 }}>Services</div>
          <div style={{ fontSize: "clamp(18px,2.2vw,26px)", fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em" }}>What We Build</div>
        </div>

        {/* Items */}
        {services.map((s, i) => {
          const ac = SPLIT_ACCENTS[i % SPLIT_ACCENTS.length];
          const isActive = i === active;
          return (
            <div
              key={s.slug}
              onMouseEnter={() => select(i)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 28px",
                borderBottom: "1px solid #f5f5f4",
                cursor: "pointer",
                background: isActive ? "#fafaf8" : "transparent",
                transition: "background 0.2s ease",
                position: "relative",
              }}
            >
              {/* Active bar */}
              <div style={{
                position: "absolute", left: 0, top: "20%", bottom: "20%",
                width: 3, borderRadius: "0 2px 2px 0",
                background: isActive ? ac : "transparent",
                transition: "background 0.3s ease",
              }} />

              <div style={{ minWidth: 24 }}>
                <div style={{
                  fontFamily: "monospace", fontSize: 9, fontWeight: 700,
                  color: isActive ? ac : "#ccc", letterSpacing: "0.1em",
                  transition: "color 0.3s ease",
                }}>{String(i + 1).padStart(2, "0")}</div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "clamp(11px,1.1vw,13px)", fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#0a0a0a" : "#555",
                  lineHeight: 1.35, letterSpacing: isActive ? "-0.01em" : "0",
                  transition: "color 0.25s ease, font-weight 0.25s ease",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{s.name}</div>
                <div style={{ fontSize: 9, color: isActive ? ac : "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2, transition: "color 0.3s ease" }}>
                  {s.category.split(" ")[0]}
                </div>
              </div>

              <span style={{ opacity: isActive ? 1 : 0, color: ac, fontSize: 14, transition: "opacity 0.3s ease" }}>→</span>
            </div>
          );
        })}
      </div>

      {/* ── Right panel: full-bleed image */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Previous image (fades out) */}
        <div style={{
          position: "absolute", inset: 0,
          background: `url(${services[prev]?.image}) center/cover no-repeat`,
          opacity: fading ? 0 : 0,
          transition: "opacity 0.55s ease",
        }} />
        {/* Active image */}
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute", inset: 0,
            background: `url(${svc.image}) center/cover no-repeat`,
          }}
        />

        {/* Gradient scrim */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)",
        }} />

        {/* Content */}
        <motion.div
          key={"content-" + active}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "clamp(32px,5vw,64px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 28, height: 2, background: accent, borderRadius: 2 }} />
            <div style={{ fontSize: 9, fontWeight: 700, color: accent, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              {svc.category.split(" ").slice(0, 3).join(" ")}
            </div>
          </div>

          <div style={{ fontSize: "clamp(26px,4.5vw,60px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 28, maxWidth: 640 }}>
            {svc.name}
          </div>

          <Link href={`/services/${svc.slug}`}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: accent, borderRadius: 40, padding: "11px 26px",
              fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer",
              boxShadow: `0 8px 28px ${accent}55`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              Explore Service
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </Link>
        </motion.div>

        {/* Right-edge progress dots */}
        <div style={{
          position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {services.map((_, i) => (
            <div
              key={i}
              onClick={() => select(i)}
              style={{
                width: 4, height: i === active ? 22 : 4, borderRadius: 3,
                background: i === active ? "#fff" : "rgba(255,255,255,0.3)",
                cursor: "pointer", transition: "height 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 27 — REVEAL  (dark name grid + full-screen image hover reveal)
// Minimal dark grid of service names. Hover any row → full-screen image floods in.
// ═══════════════════════════════════════════════════════════════════════════════
const REVEAL_ACCENTS = ["#818cf8","#fbbf24","#34d399","#f87171","#c084fc","#22d3ee","#fb923c","#f472b6","#4ade80","#60a5fa"];

const ServicesReveal = ({ services }: { services: ServiceCard[] }) => {
  const [hovered, setHovered] = useState(-1);
  const [displayed, setDisplayed] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>(0);

  const onEnter = (i: number) => {
    clearTimeout(timeoutRef.current);
    setHovered(i);
    setDisplayed(i);
    if (imgRef.current) imgRef.current.style.opacity = "1";
  };
  const onLeave = () => {
    setHovered(-1);
    if (imgRef.current) imgRef.current.style.opacity = "0";
  };

  const svc = services[displayed];
  const accent = REVEAL_ACCENTS[displayed % REVEAL_ACCENTS.length];

  return (
    <div style={{ background: "#070809", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Full-screen bg image */}
      <div
        ref={imgRef}
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          background: `url(${svc.image}) center/cover no-repeat`,
          opacity: 0, transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: "none",
        }}
      />
      {/* Overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "rgba(7,8,9,0.72)",
        opacity: hovered >= 0 ? 1 : 0, transition: "opacity 0.4s ease",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "clamp(48px,7vw,88px) clamp(24px,6vw,88px) 80px" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: "clamp(32px,5vw,60px)" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 600, marginBottom: 10 }}>
            {services.length} Services
          </div>
          <div style={{ fontSize: "clamp(28px,5vw,64px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            Our Work
          </div>
        </motion.div>

        {/* Name grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(260px,30vw,400px),1fr))", gap: 2 }}>
          {services.map((s, i) => {
            const ac = REVEAL_ACCENTS[i % REVEAL_ACCENTS.length];
            const isHov = hovered === i;
            return (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: (i % 8) * 0.03 }}
              >
                <Link href={`/services/${s.slug}`}>
                  <div
                    onMouseEnter={() => onEnter(i)}
                    onMouseLeave={onLeave}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "clamp(14px,1.8vw,20px) clamp(16px,2.2vw,24px)",
                      border: "1px solid",
                      borderColor: isHov ? ac + "44" : "rgba(255,255,255,0.05)",
                      background: isHov ? ac + "14" : "transparent",
                      cursor: "pointer",
                      transition: "border-color 0.25s ease, background 0.25s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: isHov ? ac : "rgba(255,255,255,0.18)", letterSpacing: "0.1em", minWidth: 24, transition: "color 0.25s ease" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div style={{ fontSize: "clamp(12px,1.2vw,14px)", fontWeight: isHov ? 700 : 500, color: isHov ? "#fff" : "rgba(255,255,255,0.58)", letterSpacing: "-0.01em", transition: "color 0.25s ease", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: isHov ? ac : "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2, transition: "color 0.25s ease" }}>
                          {s.category.split(" ")[0]}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: `1px solid ${isHov ? ac : "rgba(255,255,255,0.08)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isHov ? ac : "rgba(255,255,255,0.18)",
                      fontSize: 13, flexShrink: 0,
                      transition: "all 0.25s ease",
                      transform: isHov ? "translateX(4px)" : "translateX(0)",
                    }}>→</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hovered service name — large floating overlay */}
      {hovered >= 0 && (
        <div style={{
          position: "fixed", bottom: "clamp(24px,4vw,48px)", left: "clamp(24px,6vw,88px)",
          zIndex: 3, pointerEvents: "none",
        }}>
          <motion.div
            key={hovered}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
              {svc.category.split(" ").slice(0, 3).join(" ")}
            </div>
            <div style={{ fontSize: "clamp(18px,3vw,40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, maxWidth: 600 }}>
              {svc.name}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 28 — SNAP  (full-viewport CSS scroll-snap — cinematic slide per service)
// Each service owns the full screen. Scroll snaps between them. Dramatic reveals.
// ═══════════════════════════════════════════════════════════════════════════════
const SNAP_ACCENTS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7"];

const ServicesSnap = ({ services }: { services: ServiceCard[] }) => {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const c = containerRef.current; if (!c) return;
    setCurrent(Math.round(c.scrollTop / c.clientHeight));
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: "100vh", overflowY: "scroll", scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      {services.map((svc, i) => {
        const accent = SNAP_ACCENTS[i % SNAP_ACCENTS.length];
        return (
          <div key={svc.slug} style={{ height: "100vh", scrollSnapAlign: "start", position: "relative", overflow: "hidden" }}>
            {/* Full-bleed image */}
            <div style={{
              position: "absolute", inset: 0,
              background: `url(${svc.image}) center/cover no-repeat`,
            }} />

            {/* Layered scrim: left dark for text, right lighter */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(100deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 42%, rgba(0,0,0,0.18) 100%)",
            }} />

            {/* Accent color stripe on left */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent }} />

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, x: -48 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-15%" }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative", zIndex: 2, height: "100%",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "0 clamp(40px,8vw,120px)",
                maxWidth: 780,
              }}
            >
              {/* Index */}
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginBottom: 28 }}>
                {String(i + 1).padStart(2, "0")} — {String(services.length).padStart(2, "0")}
              </div>

              {/* Category */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 32, height: 2, background: accent }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                  {svc.category.split(" ").slice(0, 3).join(" ")}
                </div>
              </div>

              {/* Title */}
              <div style={{
                fontSize: "clamp(30px,5.5vw,76px)", fontWeight: 900, color: "#fff",
                letterSpacing: "-0.04em", lineHeight: 1.06, marginBottom: 32,
              }}>
                {svc.name}
              </div>

              {/* CTA */}
              <Link href={`/services/${svc.slug}`}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "transparent", border: `1.5px solid ${accent}`,
                  borderRadius: 40, padding: "11px 26px",
                  fontSize: 12, fontWeight: 700, color: accent, cursor: "pointer",
                  transition: "background 0.25s ease, color 0.25s ease",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = accent; el.style.color = "#fff"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = accent; }}
                >
                  Explore Service
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M6.5 2l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </Link>
            </motion.div>

            {/* Bottom: service count + nav hint */}
            <div style={{
              position: "absolute", bottom: 28, left: 0, right: 0,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0 clamp(40px,8vw,120px)",
              zIndex: 2,
            }}>
              {/* Dot progress */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {services.map((_, di) => (
                  <div
                    key={di}
                    onClick={() => { const c = containerRef.current; if (c) c.scrollTo({ top: di * c.clientHeight, behavior: "smooth" }); }}
                    style={{
                      width: di === i ? 20 : 5, height: 5, borderRadius: 3,
                      background: di === i ? accent : "rgba(255,255,255,0.25)",
                      cursor: "pointer", transition: "width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s ease",
                    }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.22)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                scroll ↓
              </div>
            </div>

            {/* Right side: next service preview */}
            {services[i + 1] && (
              <div style={{
                position: "absolute", right: "clamp(24px,4vw,56px)", top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2, maxWidth: 180, textAlign: "right",
              }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>Next</div>
                <div style={{ fontSize: "clamp(11px,1.1vw,13px)", fontWeight: 600, color: "rgba(255,255,255,0.38)", lineHeight: 1.3 }}>
                  {services[i + 1].name}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
type ViewMode = "ring" | "masonry";

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
  { id: "ring",    label: "Ring", icon: "○" },
  { id: "masonry", label: "Grid", icon: "▦" },
];

const ViewSwitcher = ({ active, onChange, cursor }: { active: ViewMode; onChange: (v: ViewMode) => void; cursor: string }) => (
  <div style={{
    display: "inline-flex", gap: 2, padding: 3,
    background: "rgba(248,248,246,0.9)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(17,19,23,0.1)", borderRadius: 22,
  }}>
    {VIEW_OPTIONS.map(v => (
      <button
        key={v.id}
        onClick={() => onChange(v.id)}
        style={{
          padding: "5px 12px", borderRadius: 18, border: "none",
          background: active === v.id ? "#1A1A1A" : "transparent",
          color: active === v.id ? "#fff" : "#666",
          fontSize: 11, fontWeight: 500, cursor,
          transition: "all 0.3s ease",
          display: "flex", alignItems: "center", gap: 4,
        }}
      >
        <span style={{ fontSize: 13 }}>{v.icon}</span>
        <span className="hidden sm:inline">{v.label}</span>
      </button>
    ))}
  </div>
);

// ─── (keeping old component name for compatibility, unused now) ──────────────
const ServicesAnimatedGrid = ({ services }: { services: ServiceCard[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [settled, setSettled] = useState(false);
  const [viewport, setViewport] = useState({ vh: 800, vw: 1024, isMobile: false, isTablet: false });

  const deckServices = useMemo(() => {
    const maxCards = viewport.isMobile ? 9 : 15;
    if (services.length <= maxCards) return services;
    const sampled: ServiceCard[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < maxCards; i++) {
      const idx = Math.round((i * (services.length - 1)) / (maxCards - 1));
      const s = services[idx];
      if (!seen.has(s.slug)) { sampled.push(s); seen.add(s.slug); }
    }
    return sampled;
  }, [services, viewport.isMobile]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setViewport({ vh: window.innerHeight, vw: w, isMobile: w < 768, isTablet: w >= 768 && w < 1024 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalN = deckServices.length;
  const { vh, vw, isMobile, isTablet } = viewport;
  const scrollHeight = isMobile ? vh * 2.2 : vh * 2.8;

  // ── Pre-compute deck & grid positions ──
  const positions = useMemo(() => {
    const cols = isMobile ? 1 : isTablet ? 2 : 4;
    const gap = isMobile ? 12 : isTablet ? 14 : 12;
    const gridPad = isMobile ? 12 : isTablet ? 20 : 20;
    // Use documentElement.clientWidth to exclude scrollbar
    const safeW = typeof document !== "undefined" ? document.documentElement.clientWidth : vw;
    const availW = safeW - gridPad * 2;
    const cardW = Math.floor((availW - gap * (cols - 1)) / cols);
    const topPad = isMobile ? 70 : 80; // space for header
    const bottomPad = 20;
    const maxGridH = vh - topPad - bottomPad;
    const rows = Math.ceil(totalN / cols);
    // Calculate card height to fit all rows in viewport
    const idealCardH = cardW * 0.62;
    const idealGridH = rows * idealCardH + (rows - 1) * gap;
    const cardH = idealGridH > maxGridH
      ? (maxGridH - (rows - 1) * gap) / rows  // shrink to fit
      : idealCardH;
    const totalGridH = rows * cardH + (rows - 1) * gap;
    const gridStartY = topPad + Math.max(0, (maxGridH - totalGridH) / 2);

    // Deck: compact overlapping line at the bottom center
    const deckCardW = isMobile ? 48 : isTablet ? 56 : 60;
    const deckCardH = deckCardW * 1.3;
    const deckSpacing = isMobile ? 18 : 22; // tight overlap — only ~22px visible per card
    const totalFanW = deckCardW + (totalN - 1) * deckSpacing;
    const fanStartX = (safeW - totalFanW) / 2; // centered using safe width
    const fanBaseY = vh - deckCardH - (isMobile ? 16 : 24);

    const deck: Array<{ x: number; y: number; w: number; h: number; rot: number; s: number }> = [];
    const grid: Array<{ x: number; y: number; w: number; h: number }> = [];

    for (let i = 0; i < totalN; i++) {
      deck.push({
        x: fanStartX + i * deckSpacing,
        y: fanBaseY,
        w: deckCardW, h: deckCardH,
        rot: 0,  // no rotation
        s: 1,    // uniform size
      });
      grid.push({
        x: gridPad + (i % cols) * (cardW + gap),
        y: gridStartY + Math.floor(i / cols) * (cardH + gap),
        w: cardW, h: cardH,
      });
    }

    // Simple stagger: card i flies to grid position i, staggered by index
    const EXPLODE_START = 0.06;
    const EXPLODE_END = 0.82;
    const CARD_DUR = 0.26;
    const staggerDelay = totalN > 1 ? (EXPLODE_END - EXPLODE_START - CARD_DUR) / (totalN - 1) : 0;
    const windows = deck.map((_, i) => ({
      start: EXPLODE_START + i * staggerDelay,
      end: EXPLODE_START + i * staggerDelay + CARD_DUR,
      gridTarget: i,
    }));

    return { deck, grid, windows, cols };
  }, [totalN, vh, vw, isMobile, isTablet]);

  // ── GSAP scroll animation ──
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || totalN === 0) return;

    const cards = cardRefs.current.slice(0, totalN).filter(Boolean) as HTMLDivElement[];
    if (cards.length !== totalN) return;

    const { deck, grid, windows } = positions;

    // Initialise cards in deck position
    cards.forEach((el, i) => {
      gsap.set(el, {
        position: "absolute", left: 0, top: 0,
        width: deck[i].w, height: deck[i].h,
        x: deck[i].x, y: deck[i].y,
        scale: deck[i].s, rotation: deck[i].rot,
        transformOrigin: "center center",
        willChange: "transform",
        borderRadius: 14, overflow: "hidden",
        opacity: 1, zIndex: totalN - i,
      });
    });

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        let allDone = true;

        cards.forEach((el, i) => {
          const win = windows[i];
          const d = deck[i];
          const g = grid[win.gridTarget]; // fly to mapped grid position, not card index

          if (p <= win.start) {
            // Still in deck
            allDone = false;
            gsap.set(el, {
              x: d.x, y: d.y, width: d.w, height: d.h,
              scale: d.s, rotation: d.rot,
              zIndex: totalN - i, opacity: 1,
            });
          } else if (p < win.end) {
            // Flying to grid position
            allDone = false;
            const t = (p - win.start) / (win.end - win.start);
            const ease = 1 - Math.pow(1 - t, 3);
            const arc = -Math.sin(t * Math.PI) * (isMobile ? 25 : 55);

            gsap.set(el, {
              x: d.x + (g.x - d.x) * ease,
              y: d.y + (g.y - d.y) * ease + arc,
              width: d.w + (g.w - d.w) * ease,
              height: d.h + (g.h - d.h) * ease,
              scale: d.s + (1 - d.s) * ease,
              rotation: d.rot * (1 - ease),
              zIndex: 1000 + i,
              opacity: 0.2 + ease * 0.8,
            });
          } else {
            // Settled in grid
            const gridIdx = win.gridTarget;
            const row = Math.floor(gridIdx / positions.cols);
            const parallax = (p - win.end) * (row % 2 === 0 ? 12 : -12);

            gsap.set(el, {
              x: g.x, y: g.y + parallax,
              width: g.w, height: g.h,
              scale: 1, rotation: 0,
              zIndex: 10 + row, opacity: 1,
            });
          }
        });

        if (p >= windows[windows.length - 1].end && !settled) setSettled(true);
        if (p < windows[0].start && settled) setSettled(false);
      },
    });

    return () => st.kill();
  }, [deckServices, positions, totalN, isMobile, settled]);

  return (
    <div ref={wrapperRef} style={{ height: scrollHeight, position: "relative", width: "100%" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden" }}>
        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "rgba(0,0,0,0.2)", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 4000,
        }}>
          scroll to explore
        </div>

        {/* Cards */}
        {deckServices.map((service, i) => {
          const accentColor = getCategoryColor(service.category);
          return (
            <div key={service.slug} ref={(el) => { cardRefs.current[i] = el; }}>
              <motion.div
                animate={settled ? { y: [0, -4, 0] } : { y: 0 }}
                transition={settled ? { y: { duration: 3 + (i % 3) * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 } } : { duration: 0 }}
                whileHover={settled ? { y: -10, scale: 1.03, transition: { duration: 0.3, ease: "easeOut" } } : undefined}
                style={{ width: "100%", height: "100%", borderRadius: 14, overflow: "hidden" }}
              >
                <Link
                  href={`/services/${service.slug}`}
                  aria-label={`Open ${service.name}`}
                  style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
                >
                  <div style={{
                    position: "relative", width: "100%", height: "100%",
                    borderRadius: 14, overflow: "hidden", background: "#F5F5F4",
                    boxShadow: "0 6px 28px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid rgba(17,19,23,0.06)",
                    display: "flex", flexDirection: "column",
                  }}>
                    {/* Image */}
                    <div style={{
                      flex: "0 0 62%", overflow: "hidden", background: "#0f1115",
                      position: "relative", borderBottom: `3px solid ${accentColor}`,
                    }}>
                      <img src={service.image} alt={service.name} loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)",
                        pointerEvents: "none",
                      }} />
                    </div>
                    {/* Text */}
                    <div style={{
                      flex: 1, display: "flex", flexDirection: "column",
                      justifyContent: "center", padding: "8px 12px 10px",
                    }}>
                      <div style={{
                        color: "#0B0E14", fontSize: 13, fontWeight: 700,
                        lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 3,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {service.name}
                      </div>
                      <div style={{
                        color: "rgba(17,19,23,0.45)", fontSize: 10,
                        fontWeight: 450, lineHeight: 1.3,
                      }}>
                        {service.category}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          );
        })}
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

  const [viewMode, setViewMode] = useState<ViewMode>("ring");
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
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  useEffect(() => {
    const shouldOpenFilter = params.get("openFilter") === "1";
    if (!shouldOpenFilter) return;
    if (typeof window === "undefined" || window.innerWidth >= 768) return;
    setViewMode("ring");
    setFilterOpen(true);
  }, [search]);

  // GSAP reveal for masonry view (legacy gsap-reveal class support)
  useEffect(() => {
    if (viewMode !== "masonry") return;
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
      : viewMode !== "ring"
        ? "auto"
        : "none";

  return (
    <div style={{ cursor: pageCursor }}>
      {finePointer && viewMode === "ring" ? <CustomCursor /> : null}
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

      {/* ═══ FIXED TOP BAR: Filter + View Switcher ═══ */}
      <div className="fixed top-20 sm:top-20 md:top-24 left-3 sm:left-4 md:left-6 lg:left-8 z-[60]">
        <ParticleWrapper>
          <button
            onClick={() => setFilterOpen(true)}
            className="font-medium text-[var(--ink)] tracking-[0.02em] bg-[rgba(248,248,246,0.88)] backdrop-blur-md border border-[rgba(17,19,23,0.12)] rounded-[20px]"
            style={{ fontSize: "clamp(10px, 2vw, 13px)", padding: "clamp(4px, 1vw, 6px) clamp(10px, 2.5vw, 16px)", cursor: finePointer ? "none" : "pointer" }}
          >
            Filter +
          </button>
        </ParticleWrapper>
      </div>
      <div className="fixed top-20 sm:top-20 md:top-24 right-3 sm:right-4 md:right-6 lg:right-8 z-[60]">
        <ViewSwitcher active={viewMode} onChange={setViewMode} cursor={finePointer ? "none" : "pointer"} />
      </div>

      {/* ═══ RING VIEW ═══ */}
      {viewMode === "ring" && (
        <div style={{ position: "relative", paddingBottom: 10, paddingTop: 18 }}>
          <ParticleWrapper>
            <RotorGallery items={ringItems} gapPx={500} speedSec={45} camY={5} categoryLabels={ringCategoryLabels} />
          </ParticleWrapper>
        </div>
      )}

      {/* ═══ MASONRY GRID VIEW ═══ */}
      {viewMode === "masonry" && (
        <ServicesMasonryGrid
          services={filtered.map((s, i) => ({ image: getServiceImage(s, i, filtered), name: s.name, category: s.category, slug: s.slug }))}
        />
      )}
    </div>
  );
}
