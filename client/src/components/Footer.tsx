import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import ParticleWrapper from "./ParticleWrapper";
import { reviewProfiles } from "./reviewProfiles";
import { useFinePointer } from "@/hooks/useFinePointer";
import { scrollToTop } from "@/hooks/useLenis";

const CONTACT_EMAIL = "careers@weseegpt.com";

const columns = [
  {
    title: "Services",
    links: [
      { label: "AI Agents", href: "/services?category=1" },
      { label: "Workflow Automation", href: "/services?category=2" },
      { label: "Paid Advertising", href: "/services?category=3" },
      { label: "SEO & Content", href: "/services?category=4" },
      { label: "Web Design", href: "/services?category=6" },
      { label: "E-Commerce", href: "/services?category=7" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "Case Studies", href: "/case-studies" },
      { label: "Projects", href: "/projects" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/wesee-agi", icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/weseeventures", icon: Instagram },
  { label: "X", href: "https://x.com/weseeventures", icon: Twitter },
  { label: "Email", href: `mailto:${CONTACT_EMAIL}`, icon: Mail },
];

/** Sizes the wordmark so it spans the full width of its box at any viewport. */
function useFitText<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<number>();
  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = "100px";
      const next = Math.floor((100 * box.clientWidth / el.scrollWidth) * 100) / 100;
      el.style.fontSize = `${next}px`;
      setSize(next);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);
  return { ref, size };
}

export default function Footer() {
  const finePointer = useFinePointer();
  const wordmark = useFitText<HTMLSpanElement>();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        {/* CTA + socials */}
        <div className="site-footer__cta">
          <h2 className="site-footer__brand">
            Have a project in mind<span>?</span>
          </h2>
          <p className="site-footer__lede">
            AI agents and automation that help businesses operate smarter, faster, and at scale.
          </p>

          <div className="site-footer__form">
            <ParticleWrapper>
              <a href={`mailto:${CONTACT_EMAIL}`} className="site-footer__email">
                {CONTACT_EMAIL}
              </a>
            </ParticleWrapper>
            <ParticleWrapper>
              <Link href="/book" onClick={() => scrollToTop()} className="site-footer__button">
                Book a call
                <ArrowUpRight size={14} strokeWidth={2.25} />
              </Link>
            </ParticleWrapper>
          </div>

          <div className="site-footer__socials">
            {socials.map(({ label, href, icon: Icon }) => (
              <ParticleWrapper key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="site-footer__social"
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Icon size={13} strokeWidth={2} />
                </a>
              </ParticleWrapper>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <nav className="site-footer__cols" aria-label="Footer">
          {columns.map(col => (
            <div key={col.title}>
              <h3 className="site-footer__heading">{col.title}</h3>
              <ul className="site-footer__list">
                {col.links.map(l => (
                  <li key={l.label}>
                    <ParticleWrapper>
                      <Link href={l.href} onClick={() => scrollToTop()} className="site-footer__link">
                        {l.label}
                      </Link>
                    </ParticleWrapper>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="site-footer__heading">Find us on</h3>
            <ul className="site-footer__list">
              {reviewProfiles.map(p => (
                <li key={p.label}>
                  <ParticleWrapper>
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="site-footer__link site-footer__ext">
                      {p.label}
                      <ArrowUpRight size={12} strokeWidth={2} />
                    </a>
                  </ParticleWrapper>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Legal row */}
      <div className="site-footer__legal">
        <p>© {new Date().getFullYear()} WeSee AI Automation · Japan HQ · Mumbai</p>
        <div className="site-footer__legal-links">
          <a href="/terms" className="site-footer__link">Terms</a>
          <a href="/privacy" className="site-footer__link">Privacy</a>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="site-footer__link"
            style={{ cursor: finePointer ? "none" : "pointer" }}
          >
            ↑ Top
          </button>
        </div>
      </div>

      {/* Giant wordmark, bleeding off the bottom edge */}
      <div className="site-footer__mark" aria-hidden="true">
        <span ref={wordmark.ref} style={{ fontSize: wordmark.size }}>
          WeSee<span className="site-footer__dot">.</span>
        </span>
      </div>
    </footer>
  );
}
