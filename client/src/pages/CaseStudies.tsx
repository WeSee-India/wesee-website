import { useEffect } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Linkedin, Star } from "lucide-react";
import { Link } from "wouter";
import ComingSoonPanel from "@/components/ComingSoonPanel";
import { caseStudyIcon } from "@/components/caseStudyIcons";
import { reviewProfiles } from "@/components/reviewProfiles";
import { useCollection, useSection, type CaseStudy } from "@/content";

type HeaderContent = { eyebrow?: string; heading?: string; body?: string; subline?: string };
type EmptyContent = { title?: string; body?: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** Review and directory profiles shown under the hero (Google lives in the footer only). */
const heroProfiles = reviewProfiles.filter((p) => p.label !== "Google");

/** One case study as a full-width row: image on one side, story on the other. */
function Row({ cs, n, total }: { cs: CaseStudy; n: number; total: number }) {
  const href = `/case-studies/${cs.slug}`;
  const Icon = caseStudyIcon(cs.category);
  const facts = [cs.region, cs.timeframe].filter(Boolean);
  return (
    <li className="csr-row">
      <Link href={href} className="csr-media" tabIndex={-1} aria-hidden="true">
        {cs.image ? (
          <img src={cs.image.src} alt="" loading={n === 1 ? "eager" : "lazy"} />
        ) : (
          <span className="csr-media-fallback"><Icon strokeWidth={1.2} /></span>
        )}
        <span className="csr-num">{pad(n)}</span>
      </Link>

      <div className="csr-copy">
        <p className="csr-meta">
          <span className="csr-cat">{cs.category}</span>
          <span className="csr-count">{pad(n)} / {pad(total)}</span>
        </p>
        <h2 className="csr-title">
          <Link href={href}>{cs.title}</Link>
        </h2>
        <p className="csr-summary">{cs.summary}</p>
        {cs.tags.length > 0 && (
          <ul className="csr-tags" aria-label="Tags">
            {cs.tags.slice(0, 3).map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
        {facts.length > 0 && <p className="csr-facts">{facts.join(" · ")}</p>}
        <Link href={href} className="csr-link">
          Read case study<span className="sr-only">: {cs.title}</span>
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

export default function CaseStudies() {
  const caseStudies = useCollection("caseStudies");
  // The closing panel reuses the published FAQ answer about how a project starts.
  const howWeStart = useCollection("faqs").find((f) => /how does a project start/i.test(f.question));
  const header = useSection<HeaderContent>("case-studies", "header");
  const empty = useSection<EmptyContent>("case-studies", "empty");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="csr">
      <header className="container csr-hero">
        <div className="csr-hero-copy">
          {header?.eyebrow && <span className="csr-eyebrow">{header.eyebrow}</span>}
          <h1>
            {header?.heading ?? "Case studies"}
            <span className="csr-hero-dot">.</span>
          </h1>
          {header?.body && <p className="csr-intro">{header.body}</p>}
          {header?.subline && <p className="csr-subline">{header.subline}</p>}
          <div className="csr-hero-actions">
            <Link href="/book" className="csr-btn csr-btn--solid">
              Book a free call
              <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
            {caseStudies.length > 0 && (
              <a href="#work" className="csr-btn csr-btn--ghost">
                See the work
                <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <figure className="csr-hero-media">
          <img src="/case-study-cassette.webp" width={735} height={896} alt="A cassette tape between the words Client CASE study" loading="eager" />
          {caseStudies.length > 0 && (
            <figcaption className="csr-hero-badge">
              <strong>{pad(caseStudies.length)}</strong> case studies
            </figcaption>
          )}
        </figure>
      </header>

      <div className="container">
        <div className="csr-proof">
          <div className="csr-proof-head">
            <span className="csr-proof-label">Find us on</span>
            <p>Reviews and profiles on the platforms clients use to choose a partner.</p>
          </div>
          <ul className="csr-proof-list">
            {heroProfiles.map((p) => (
              <li key={p.label}>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="csr-proof-tile" aria-label={`WeSee on ${p.label}`}>
                  <span className={`csr-proof-logo csr-proof-logo--${p.label.toLowerCase()}`}>
                    {p.label === "Trustpilot" && <Star className="csr-proof-icon" fill="currentColor" strokeWidth={0} />}
                    {p.label === "LinkedIn" && <Linkedin className="csr-proof-icon" />}
                    {p.label === "Sortlist" ? "sortlist" : p.label}
                  </span>
                  <span className="csr-proof-cta">
                    View profile <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {caseStudies.length === 0 ? (
        <section className="container" aria-label="Case studies">
          <ComingSoonPanel title={empty?.title ?? "Our first case studies are on the way."} body={empty?.body ?? ""} />
        </section>
      ) : (
        <section id="work" className="container csr-work" aria-label="Case studies">
          <ol className="csr-list">
            {caseStudies.map((c, i) => (
              <Row key={c.slug} cs={c} n={i + 1} total={caseStudies.length} />
            ))}
          </ol>
        </section>
      )}

      {/* Closing: book a call, with how a project starts */}
      <section className="container csx-close" aria-labelledby="csx-close-title">
        <div className="csx-close-copy">
          <span className="csx-kicker">Start a project</span>
          <h2 id="csx-close-title">Have friction worth fixing?</h2>
          <p>Tell us where the work gets stuck. We’ll show you what we’d build, and what it would change.</p>
          <Link href="/book" className="csx-btn">Book a free call</Link>
        </div>
        {howWeStart && (
          <div className="csx-close-card">
            <h3>{howWeStart.question}</h3>
            <p>{howWeStart.answer}</p>
            <span className="csx-close-mark" aria-hidden="true">“</span>
          </div>
        )}
      </section>
    </div>
  );
}
