import { Link } from "wouter";
import ParticleWrapper from "./ParticleWrapper";
import { useFinePointer } from "@/hooks/useFinePointer";

const serviceLinks = [
  { label: "AI Agents", href: "/services?category=1" },
  { label: "Workflow Automation", href: "/services?category=2" },
  { label: "Paid Advertising", href: "/services?category=3" },
  { label: "SEO & Content", href: "/services?category=4" },
  { label: "Web Design", href: "/services?category=6" },
  { label: "E-Commerce", href: "/services?category=7" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/wesee-agi" },
  { label: "Instagram", href: "https://www.instagram.com/weseeventures" },
  { label: "X / Twitter", href: "https://twitter.com/weseecc" },
];

export default function Footer() {
  const finePointer = useFinePointer();
  return (
    <footer style={{ background: "var(--ink)", position: "relative", overflow: "hidden" }}>
      {/* Subtle blob */}
      <div style={{
        position: "absolute",
        width: 700, height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)",
        top: 0, right: "-10%",
        pointerEvents: "none",
        animation: "blob2 20s ease-in-out infinite",
      }} />

      {/* "Let's Talk" CTA strip */}
      <div className="container" style={{ paddingTop: 96, paddingBottom: 72, position: "relative", zIndex: 1 }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 72, marginBottom: 72 }}>

          <span style={{
            fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.30)", display: "block", marginBottom: 20,
          }}>
            Ready to start?
          </span>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2 style={{
              fontSize: "clamp(44px, 7vw, 88px)",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
              color: "#FFFFFF",
              margin: 0,
            }}>
              Let's Talk<span style={{ color: "var(--accent)", fontWeight: 600 }}>.</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <ParticleWrapper>
                <a
                  href="/book-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary shine-on-hover"
                  style={{
                    background: "#FFFFFF",
                    color: "var(--ink)",
                    border: "1.5px solid #FFFFFF",
                    padding: "13px 28px",
                    fontSize: 14,
                  }}
                >
                  Book Discovery Call ↗
                </a>
              </ParticleWrapper>
              <ParticleWrapper>
                <a href="mailto:hr@weseegpt.com" style={{
                  fontSize: 14, color: "rgba(255,255,255,0.35)",
                  transition: "color 0.3s ease", textDecoration: "none",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                  hr@weseegpt.com
                </a>
              </ParticleWrapper>
            </div>
          </div>
        </div>

        {/* 4-col link grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40 }}>
          {/* Brand col */}
          <div>
            <Link href="/">
              <span style={{ fontSize: 17, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
                WeSee<span style={{ color: "var(--accent)" }}>.</span>
              </span>
            </Link>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.30)",
              lineHeight: 1.7, marginTop: 14, maxWidth: 240,
            }}>
              India's leading AI automation agency  building intelligent systems that help businesses operate smarter, faster, and at scale.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
              {socials.map(s => (
                <ParticleWrapper key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", transition: "color 0.3s ease", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                  >
                    {s.label}
                  </a>
                </ParticleWrapper>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.20)", marginBottom: 18 }}>
              Services
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {serviceLinks.map(l => (
                <li key={l.label}>
                  <ParticleWrapper>
                    <Link href={l.href} style={{
                      fontSize: 14, color: "rgba(255,255,255,0.35)", transition: "color 0.3s ease", textDecoration: "none",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.9)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)"; }}
                    >
                      {l.label}
                    </Link>
                  </ParticleWrapper>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.20)", marginBottom: 18 }}>
              Company
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {companyLinks.map(l => (
                <li key={l.label}>
                  <ParticleWrapper>
                    <Link href={l.href} style={{
                      fontSize: 14, color: "rgba(255,255,255,0.35)", transition: "color 0.3s ease", textDecoration: "none",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.9)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)"; }}
                    >
                      {l.label}
                    </Link>
                  </ParticleWrapper>
                </li>
              ))}
            </ul>
          </div>

          {/* Offices */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.20)", marginBottom: 18 }}>
              Offices
            </h4>
            {[
              { city: "Japan", sub: "Japan — HQ" },
              { city: "Mumbai", sub: "India — Operations" },
             
            ].map(o => (
              <div key={o.city} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>
                  {o.city}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.20)", letterSpacing: "0.04em", marginTop: 2 }}>
                  {o.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 56, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center", gap: 12,
        }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", letterSpacing: "0.03em" }}>
            © {new Date().getFullYear()} WeSee AI Automation. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
           
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                fontSize: 12, color: "rgba(255,255,255,0.18)", background: "none",
                border: "none", transition: "color 0.3s ease", cursor: finePointer ? "none" : "pointer",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.18)"; }}
            >
              ↑ Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
