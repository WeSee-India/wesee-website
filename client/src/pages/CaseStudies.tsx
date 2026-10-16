import { useEffect, useState } from "react";
import { Link } from "wouter";
import CaseStudyCard from "@/components/CaseStudyCard";
import ComingSoonPanel from "@/components/ComingSoonPanel";
import { useCollection, useSection } from "@/content";

/** Filter tabs in display order (backend CASE_STUDY_TABS). Only tabs with a published case study are shown. */
const TABS = ["AI & Automation", "Platforms & Cloud", "Fintech", "Web & Brand"];

type HeaderContent = { eyebrow?: string; heading?: string; body?: string; subline?: string };
type EmptyContent = { title?: string; body?: string };

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
    <div className="csx">
      {/* Hero: centred title, breadcrumb pill, intro */}
      <header className="csx-hero">
        <div className="container csx-hero-inner">
          <h1>{header?.heading ?? "Case studies"}</h1>
          <nav aria-label="Breadcrumb" className="csx-crumbs">
            <Link href="/">Home</Link>
            <span aria-hidden="true">→</span>
            <span aria-current="page">{header?.eyebrow ?? "Case studies"}</span>
          </nav>
          {header?.body && <p className="csx-intro">{header.body}</p>}
          {header?.subline && <p className="csx-subline">{header.subline}</p>}
        </div>
      </header>

      {caseStudies.length === 0 ? (
        <section className="container" aria-label="Case studies">
          <ComingSoonPanel title={empty?.title ?? "Our first case studies are on the way."} body={empty?.body ?? ""} />
        </section>
      ) : (
        <>
          {/* Dark band with the filter tabs */}
          {tabs.length > 1 && (
            <div className="container">
              <div className="csx-band" role="group" aria-label="Filter case studies">
                {[null, ...tabs].map((t) => (
                  <button key={t ?? "all"} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>
                    {t ?? "All work"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <section className="container csx-list" aria-label="Case studies">
            <p className="sr-only" role="status">
              {tab ? `${list.length} case ${list.length === 1 ? "study" : "studies"} in ${tab}` : `${list.length} case studies`}
            </p>
            <ul className="csx-grid">
              {list.map((c, i) => (
                <li key={c.slug}>
                  <CaseStudyCard cs={c} index={i} />
                </li>
              ))}
            </ul>
          </section>
        </>
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
