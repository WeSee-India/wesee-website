import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { TrendingUp } from "lucide-react";
import ParticleWrapper from "./ParticleWrapper";

const navItems = [
  { label: "Services", href: "/services", hasDropdown: true },
  { label: "About", href: "/about", hasDropdown: false },
  { label: "Team", href: "/team", hasDropdown: false },
  { label: "Blog", href: "/blog", hasDropdown: false },
  { label: "Careers", href: "/careers", hasDropdown: false },
  { label: "Contact", href: "/contact", hasDropdown: false },
];

// 10 service categories with expandable sub-services
const serviceCategories = [
  {
    name: "Autonomous AI Agents",
    description: "AI-powered agents that talk, think, and act on behalf of businesses — handling sales, support, appointments, and calls 24/7.",
    subServices: [
      "AI Sales Agent",
      "AI Customer Support Bot",
      "AI Receptionist & Scheduler",
      "Internal Knowledge AI (HR / IT / Ops)",
      "Voice AI & Smart IVR",
      "Custom AI Agent Development",
    ],
  },
  {
    name: "Workflow Automation & Systems Integration",
    description: "Connect your existing tools and eliminate manual work using n8n, Zapier, Make, and custom code.",
    subServices: [
      "No-Code Workflow Automation",
      "Document & Invoice Automation",
      "Smart Lead Routing & Assignment",
      "ERP & Multi-System Integration",
      "Alerts, Escalations & Notification Engines",
    ],
  },
  {
    name: "Performance Marketing & Paid Media",
    description: "ROI-driven advertising across Meta, Google, YouTube, LinkedIn — every rupee tracked and optimized.",
    subServices: [
      "Meta Ads — Facebook & Instagram",
      "Google Ads — Search, Display & Shopping",
      "YouTube Video Advertising",
      "LinkedIn B2B Campaigns",
      "Retargeting & Programmatic",
      "Influencer-Paid Hybrid Campaigns",
    ],
  },
  {
    name: "Search Dominance & Organic Discovery",
    description: "Long-term organic visibility through technical SEO, content strategy, and authority building.",
    subServices: [
      "Technical & On-Page SEO",
      "Local SEO & Google Business",
      "Content Strategy & Authority Building",
      "AI-Powered Content at Scale",
      "Answer Engine Optimisation (AEO)",
    ],
  },
  {
    name: "Conversational Marketing & Messaging",
    description: "Automated multi-channel communication via WhatsApp, email, SMS, and push notifications.",
    subServices: [
      "WhatsApp Business API & Automation",
      "Email Marketing & Drip Campaigns",
      "SMS & RCS Rich Messaging",
      "Omnichannel Unified Inbox",
      "Push Notifications & In-App Messaging",
    ],
  },
  {
    name: "Digital Experience & Creative Studio",
    description: "High-converting websites, brand identities, and video content designed for performance.",
    subServices: [
      "High-Performance Website Design & Dev",
      "Landing Pages & Conversion Optimisation",
      "Brand Identity & Visual Systems",
      "Video Production & Motion Graphics",
      "UI/UX Design & Prototyping",
      "Social Media Creative & Content Design",
    ],
  },
  {
    name: "E-Commerce & D2C Growth Engine",
    description: "Full-stack e-commerce solutions from store setup to marketplace management and optimization.",
    subServices: [
      "D2C Brand Launch & Growth",
      "E-Commerce Storefront Design",
      "Marketplace Onboarding & Management",
      "Product Listing & Catalog Optimisation",
      "Subscription & Recurring Revenue Systems",
    ],
  },
  {
    name: "Revenue Operations & Sales Automation",
    description: "Systems that capture, nurture, convert, and retain customers — engineered for revenue.",
    subServices: [
      "CRM Setup & Pipeline Optimisation",
      "Sales Funnel & Conversion Automation",
      "Lead Generation — Inbound & Outbound",
      "Influencer & Affiliate Program Management",
      "Loyalty, Referral & Retention Programs",
    ],
  },
  {
    name: "Data Intelligence & Analytics",
    description: "Custom dashboards and BI solutions that turn raw data into actionable insights for smarter decision-making.",
    subServices: [
      "Custom BI Dashboards & Reporting",
      "Marketing Attribution & ROI Tracking",
      "Customer Analytics & Churn Prediction",
      "A/B Testing & Experimentation Frameworks",
      "AI-Powered Forecasting & Trend Analysis",
    ],
  },
  {
    name: "Cloud, Security & Business Operations",
    description: "Cloud infrastructure, analytics dashboards, HR automation, and operational excellence.",
    subServices: [
      "Cloud Architecture & DevOps",
      "Cybersecurity & Compliance",
      "HR & Recruitment Automation",
      "Reputation & Review Management",
      "Business Strategy & Growth Consulting",
      "Government Subsidy & Scheme Marketing",
    ],
  },
];

const DROPDOWN_HOVER_DELAY_MS = 120;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobilePillarOpen, setMobilePillarOpen] = useState<number | null>(null);
  const [expandedCategoryIndex, setExpandedCategoryIndex] = useState<number | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [location] = useLocation();

  const openServicesDropdown = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => setServicesDropdownOpen(true), 60);
  };
  const closeServicesDropdown = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
      setExpandedCategoryIndex(null);
    }, DROPDOWN_HOVER_DELAY_MS);
  };
  const keepServicesDropdownOpen = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setServicesDropdownOpen(true);
  };
  useEffect(() => () => { if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current); }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    // Check screen width for responsive logic
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close on navigation
  useEffect(() => {
    setOpen(false);
    setMobileServicesOpen(false);
    setMobilePillarOpen(null);
  }, [location]);

  // Lock body scroll when mobile menu is open + prevent layout shift (scrollbar compensation)
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (headerRef.current) headerRef.current.style.paddingRight = "";
      return;
    }
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      if (headerRef.current) headerRef.current.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (headerRef.current) headerRef.current.style.paddingRight = "";
    };
  }, [open]);

  return (
    <>
      {/* ── Main header bar (stays fixed; only hamburger/close icon changes) ── */}
      <header
        ref={headerRef}
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          zIndex: servicesDropdownOpen ? 9999 : 10001,
          height: 60,
          display: "flex", alignItems: "center",
          background: "rgba(247,248,250)",
          backdropFilter: scrolled ? "blur(28px) saturate(200%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(28px) saturate(200%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(17,19,23,0.07)" : "1px solid transparent",
          transition: "background 0.5s ease, border-color 0.5s ease",
        }}>
        <div className="container" style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", height: "100%",
          position: "relative",
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0, zIndex: 2 }}>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663374526873/i7vThuKaRmDbUwRVJzPJ6B/wesee_logo_4739f7bd.gif"
              alt="WeSee logo"
              style={{ height: 42, width: "auto", objectFit: "contain", mixBlendMode: "multiply" }}
            />
            <span style={{
              fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 650,
              color: "var(--ink)", letterSpacing: "-0.035em", lineHeight: 1,
            }}>
              WeSee
            </span>
          </Link>

          {/* ── Desktop: centered pill nav + Services dropdown ── */}
          {isDesktop && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              onMouseLeave={closeServicesDropdown}
            >
              <nav
                aria-label="Main navigation"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(24px) saturate(200%)",
                  WebkitBackdropFilter: "blur(24px) saturate(200%)",
                  border: "1px solid rgba(17,19,23,0.09)",
                  borderRadius: 999,
                  padding: "4px 6px",
                }}
              >
                {navItems.map((item) => {
                  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                  const isServices = item.hasDropdown;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        padding: "6px 13px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: isActive ? 550 : 400,
                        color: isActive ? "var(--ink)" : "rgba(17,19,23,0.48)",
                        textDecoration: "none",
                        transition: "color 0.22s ease, background 0.22s ease",
                        background: isActive ? "rgba(17,19,23,0.07)" : "transparent",
                        letterSpacing: "0.003em",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                        if (isServices) openServicesDropdown();
                      }}
                      onMouseLeave={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(17,19,23,0.48)";
                        if (isServices) closeServicesDropdown();
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Services dropdown panel */}
              {servicesDropdownOpen && (
                <div
                  onMouseEnter={keepServicesDropdownOpen}
                  onMouseLeave={closeServicesDropdown}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "min(1100px, 96vw)",
                    minWidth: 340,
                    minHeight: "400px",
                    zIndex: 9999,
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 16px 40px rgba(17,19,23,0.1), 0 6px 20px rgba(17,19,23,0.06)",
                    border: "1px solid rgba(17,19,23,0.07)",
                    display: "grid",
                    gridTemplateColumns: "minmax(182px, 1.1fr) minmax(0, 3fr)",
                    alignItems: "stretch",
                    animation: "dropdownFade 0.2s ease-out",
                  }}
                >
                  <style>{`
                    @keyframes dropdownFade {
                      from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
                      to { opacity: 1; transform: translateX(-50%) translateY(0); }
                    }
                  `}</style>
                  {/* Left: intro + CTA — spans both rows */}
                  <div 
                  style={{ padding: "18px 12px 20px 22px", borderRight: "1px solid rgba(17,19,23,0.08)", alignSelf: "stretch", height: "100%", background: "#F2F2F0", borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }}>
                    <h3 style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--ink)",
                      letterSpacing: "-0.02em",
                      margin: "0 0 6px 0",
                    }}>
                      Services
                    </h3>
                    <p style={{
                      fontSize: 11,
                      lineHeight: 1.45,
                      color: "rgba(17,19,23,0.58)",
                      margin: "0 0 12px 0",
                    }}>
                      Tailored solutions to grow your business and achieve your goals.
                    </p>
                    <Link
                      href="/services"
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "rgba(17,19,23,0.72)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--ink)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(17,19,23,0.72)"}
                    >
                      View all <span style={{ fontSize: 10 }}>→</span>
                    </Link>
                  </div>
                  {/* Right: categories grid (with its own padding) */}
                  <div
                    style={{
                      minWidth: 0,
                      padding: "18px 22px 20px",
                      display: "flex",
                      flexDirection: "row",
                      gap: 20,
                      alignItems: "stretch",
                      height: "100%",
                    }}
                  >
                    {/* Category names column - 60% width */}
                    <div
                      style={{
                        width: "60%",
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        borderRight: "1px solid rgba(17,19,23,0.1)",
                        paddingRight: 20,
                      }}
                    >
                      {serviceCategories.map((category, idx) => {
                        const isExpanded = expandedCategoryIndex === idx;
                        return (
                          <p 
                            key={idx}
                            style={{ 
                              fontSize: 13, 
                              fontWeight: 600, 
                              color: isExpanded ? "var(--ink)" : "rgba(17,19,23,0.7)", 
                              letterSpacing: "0.02em", 
                              margin: 0, 
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                              transition: "color 0.2s ease",
                            }}
                            onMouseEnter={() => setExpandedCategoryIndex(idx)}
                          >
                            {category.name}
                          </p>
                        );
                      })}
                    </div>
                    {/* Subcategories column - 40% width */}
                    <div
                      style={{
                        width: "40%",
                        flexShrink: 0,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        alignSelf: "stretch",
                      }}
                      onMouseLeave={() => setExpandedCategoryIndex(null)}
                    >
                      {expandedCategoryIndex !== null && (
                        <div style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: 14,
                          width: "100%",
                          alignSelf: "stretch",
                          paddingTop: 16,
                          paddingRight: 20,
                        }}>
                          {serviceCategories[expandedCategoryIndex].subServices.map((sub) => (
                            <Link
                              key={sub}
                              href={`/services#${serviceCategories[expandedCategoryIndex].name.toLowerCase().replace(/\s+/g, "-")}`}
                              style={{ 
                                fontSize: 13, 
                                color: "rgba(17,19,23,0.62)", 
                                textDecoration: "none", 
                                lineHeight: 1.25, 
                                whiteSpace: "normal", 
                                overflowWrap: "break-word",
                                wordBreak: "break-word",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                width: "100%",
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--ink)"}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(17,19,23,0.62)"}
                              onClick={() => {
                                setServicesDropdownOpen(false);
                                setExpandedCategoryIndex(null);
                              }}
                            >
                              <span style={{ flex: 1 }}>{sub}</span>
                              <TrendingUp size={14} style={{ flexShrink: 0, marginLeft: 8 }} />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Right: CTA + hamburger ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, zIndex: 2 }}>
            {/* Book a Call — desktop only */}
            {isDesktop && (
              <ParticleWrapper>
                <Link
                  href="/book-call"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 18px",
                    background: "var(--ink)",
                    color: "#fff",
                    fontSize: 13, fontWeight: 500, letterSpacing: "0.005em",
                    borderRadius: 999,
                    border: "1.5px solid var(--ink)",
                    textDecoration: "none",
                    transition: "background 0.25s ease, transform 0.25s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "#2a2d33";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--ink)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  Book a Call <span style={{ fontSize: 11, opacity: 0.75 }}>↗</span>
                </Link>
              </ParticleWrapper>
            )}

            {/* Hamburger / close — mobile only; fixed size so navbar doesn't shift */}
            {!isDesktop && (
              <button
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close menu" : "Open menu"}
                style={{
                  width: 36, height: 36, minWidth: 36, minHeight: 36,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 5,
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(17,19,23,0.10)",
                  borderRadius: 999, cursor: "pointer", padding: 0,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  flexShrink: 0,
                }}
              >
                <span style={{
                  display: "block", width: 16, height: 1.5,
                  background: "var(--ink)", borderRadius: 2,
                  transformOrigin: "center",
                  transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                  transform: open ? "translateY(6.5px) rotate(45deg)" : "none",
                }} />
                <span style={{
                  display: "block", width: 16, height: 1.5,
                  background: "var(--ink)", borderRadius: 2,
                  transition: "opacity 0.3s ease", opacity: open ? 0 : 1,
                }} />
                <span style={{
                  display: "block", width: 16, height: 1.5,
                  background: "var(--ink)", borderRadius: 2,
                  transformOrigin: "center",
                  transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                  transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none",
                }} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile full-screen overlay: covers entire viewport, hides page content ── */}
      {!isDesktop && (
        <div
          aria-hidden={!open}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            zIndex: 10000,
            background: "rgba(247, 248, 250)",
            WebkitBackdropFilter: "blur(20px)",
            visibility: open ? "visible" : "hidden",
            opacity: open ? 1 : 0,
            transition: "opacity 0.3s ease, visibility 0.3s ease",
            overflowY: "scroll",
            overflowX: "hidden",
            paddingTop: 72,
            paddingBottom: 32,
            paddingLeft: "max(20px, env(safe-area-inset-left))",
            paddingRight: "max(20px, env(safe-area-inset-right))",
          }}
        >
          <nav
            aria-label="Mobile navigation"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              maxWidth: 360,
              margin: "0 auto",
            }}
          >
            {navItems.map((item) => {
              const isServices = item.hasDropdown;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              if (isServices) {
                return (
                  <div key={item.href} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: 12,
                      }}
                    >
                      <Link
                        href="/services"
                        style={{
                          fontSize: 17,
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "var(--ink)" : "rgba(17,19,23,0.85)",
                          textAlign: "left",
                          textDecoration: "none",
                          display: "block",
                          flex: 1,
                        }}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                      <Link
                        href="/services?openFilter=1"
                        aria-label="Open services filter"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "none",
                          color: "rgba(17,19,23,0.85)",
                          fontSize: 14,
                          lineHeight: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => setOpen(false)}
                      >
                        ▼
                      </Link>
                    </div>
                    {mobileServicesOpen && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          paddingLeft: 12,
                          paddingBottom: 8,
                        }}
                      >
                        {serviceCategories.map((category, idx) => (
                          <div key={category.name} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <button
                              type="button"
                              onClick={() => setMobilePillarOpen((v) => (v === idx ? null : idx))}
                              aria-expanded={mobilePillarOpen === idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                padding: "10px 16px",
                                background: "transparent",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                color: "var(--ink)",
                                textAlign: "left",
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              {category.name}
                              <span
                                style={{
                                  fontSize: 12,
                                  transition: "transform 0.25s ease",
                                  transform: mobilePillarOpen === idx ? "rotate(180deg)" : "none",
                                }}
                              >
                                ▼
                              </span>
                            </button>
                            {mobilePillarOpen === idx && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                  paddingLeft: 12,
                                  paddingBottom: 8,
                                }}
                              >
                                {category.subServices.map((sub) => (
                                  <Link
                                    key={sub}
                                    href={`/services#${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                                    style={{
                                      fontSize: 13,
                                      color: "rgba(17,19,23,0.7)",
                                      textDecoration: "none",
                                      padding: "6px 12px",
                                      borderRadius: 6,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                    onClick={() => setOpen(false)}
                                  >
                                    {sub}
                                    <TrendingUp size={14} style={{ flexShrink: 0 }} />
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <Link
                          href="/services"
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--ink)",
                            textDecoration: "none",
                            padding: "10px 12px",
                            marginTop: 4,
                          }}
                          onClick={() => setOpen(false)}
                        >
                          View all services →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    fontSize: 17,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--ink)" : "rgba(17,19,23,0.85)",
                    textDecoration: "none",
                    display: "block",
                  }}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {/* Mobile CTA at bottom of overlay */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid rgba(17,19,23,0.08)",
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <Link
              href="/book-call"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "14px 20px",
                background: "var(--ink)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 999,
                border: "1.5px solid var(--ink)",
                textDecoration: "none",
              }}
              onClick={() => setOpen(false)}
            >
              Book a Call <span style={{ fontSize: 12, opacity: 0.85 }}>↗</span>
            </Link>
          </div>
        </div>
      )}

    </>
  );
}
