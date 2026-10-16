import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import ComingSoonPanel from "@/components/ComingSoonPanel";
import { caseStudyIcon } from "@/components/caseStudyIcons";
import { useCollection, useSection, type CaseStudy } from "@/content";

/** Filter tabs in display order (backend CASE_STUDY_TABS). Only tabs with a published case study are shown. */
const TABS = ["AI & Automation", "Platforms & Cloud", "Fintech", "Web & Brand"];

type HeaderContent = { eyebrow?: string; heading?: string; body?: string; subline?: string };
type EmptyContent = { title?: string; body?: string };

const pad = (n: number) => String(n).padStart(2, "0");

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
  const [tab, setTab] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = TABS.filter((t) => caseStudies.some((c) => c.category === t));
  const list = tab ? caseStudies.filter((c) => c.category === tab) : caseStudies;

  return (
    <div className="csr">
      <header className="container csr-hero">
        {header?.eyebrow && <span className="csr-eyebrow">{header.eyebrow}</span>}
        <h1>{header?.heading ?? "Case studies"}</h1>
        {header?.body && <p className="csr-intro">{header.body}</p>}
        {header?.subline && <p className="csr-subline">{header.subline}</p>}
      </header>

      {caseStudies.length === 0 ? (
        <section className="container" aria-label="Case studies">
          <ComingSoonPanel title={empty?.title ?? "Our first case studies are on the way."} body={empty?.body ?? ""} />
        </section>
      ) : (
        <section className="container" aria-label="Case studies">
          {tabs.length > 1 && (
            <div className="csr-tabs" role="group" aria-label="Filter case studies">
              {[null, ...tabs].map((t) => (
                <button key={t ?? "all"} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>
                  {t ?? "All work"}
                </button>
              ))}
            </div>
          )}
          <p className="sr-only" role="status">
            {tab ? `${list.length} case ${list.length === 1 ? "study" : "studies"} in ${tab}` : `${list.length} case studies`}
          </p>
          <ol className="csr-list">
            {list.map((c, i) => (
              <Row key={c.slug} cs={c} n={i + 1} total={list.length} />
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
