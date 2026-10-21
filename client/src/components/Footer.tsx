import { useSettings } from "@/content";
import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import ParticleWrapper from "./ParticleWrapper";
import { reviewProfiles } from "./reviewProfiles";
import { useFinePointer } from "@/hooks/useFinePointer";
import { scrollToTop } from "@/hooks/useLenis";

type FooterLink = { label: string; href: string };

interface CmsFooter {
  ctaHeading?: string | null;
  ctaEmail?: string | null;
  tagline?: string | null;
  columns?: { title?: string; links?: Partial<FooterLink>[] }[];
  legalLinks?: Partial<FooterLink>[];
  copyright?: string | null;
}

const socialIcons: Record<string, typeof Linkedin> = { linkedin: Linkedin, instagram: Instagram, x: Twitter, twitter: Twitter };

const validLinks = (links?: Partial<FooterLink>[]): FooterLink[] =>
  (links ?? []).filter((l): l is FooterLink => !!l.label && !!l.href);

/** Editors may type dashes in copy; the site avoids them. */
const noDash = (t: string) => t.replace(/\s*[—–]\s*/g, ", ");

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
  const footer = useSettings("footer") as CmsFooter;
  const contact = useSettings("contact");
  const social = useSettings("social") as { links?: Partial<FooterLink>[] };
  const finePointer = useFinePointer();

  const email = contact.email || footer.ctaEmail || "";
  const columns = (footer.columns ?? []).map((c) => ({ title: c.title ?? "", links: validLinks(c.links) })).filter((c) => c.title && c.links.length);
  const legalLinks = validLinks(footer.legalLinks);
  const socials = [
    ...validLinks(social.links).map((l) => ({ label: l.label, href: l.href, icon: socialIcons[l.label.toLowerCase()] ?? Mail })),
    ...(email ? [{ label: "Email", href: "mailto:" + email, icon: Mail }] : []),
  ];
  const heading = footer.ctaHeading || "Have a project in mind?";
  const headingAccent = heading.endsWith("?");
  const copyright = (footer.copyright || "© {year} WeSee AI Automation").replace("{year}", String(new Date().getFullYear()));
  const wordmark = useFitText<HTMLSpanElement>();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        {/* CTA + socials */}
        <div className="site-footer__cta">
          <h2 className="site-footer__brand">
            {headingAccent ? <>{heading.slice(0, -1)}<span>?</span></> : heading}
          </h2>
          <p className="site-footer__lede">
            {noDash((footer.tagline || "").replace(/\s+/g, " ").trim())}
          </p>

          <div className="site-footer__form">
            <ParticleWrapper>
              <a href={"mailto:" + email} className="site-footer__email">
                {email}
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
        <p>{copyright}</p>
        <div className="site-footer__legal-links">
          {legalLinks.map((l) => (
            <a key={l.href} href={l.href} className="site-footer__link">{l.label}</a>
          ))}
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
