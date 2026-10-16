import { useEffect, useState } from "react";
import CaseStudyCard from "@/components/CaseStudyCard";
import ComingSoonPanel from "@/components/ComingSoonPanel";
import { useCollection, useSection } from "@/content";

/** Filter tabs in display order (backend CASE_STUDY_TABS). Only tabs with a published case study are shown. */
const TABS = ["AI & Automation", "Platforms & Cloud", "Fintech", "Web & Brand"];

type HeaderContent = { eyebrow?: string; heading?: string; body?: string; subline?: string };
type EmptyContent = { title?: string; body?: string };

export default function CaseStudies() {
  const caseStudies = useCollection("caseStudies");
  const header = useSection<HeaderContent>("case-studies", "header");
  const empty = useSection<EmptyContent>("case-studies", "empty");
  const [tab, setTab] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = TABS.filter((t) => caseStudies.some((c) => c.category === t));
  const list = tab ? caseStudies.filter((c) => c.category === tab) : caseStudies;

  return (
    <div className="collection-page">
      <header className="container collection-head">
        {header?.eyebrow && <span className="collection-pill">{header.eyebrow}</span>}
        <h1>{header?.heading ?? "Case studies"}</h1>
        {header?.body && <p>{header.body}</p>}
        {header?.subline && <p className="collection-subline">{header.subline}</p>}
      </header>

      <section className="container" aria-label="Case studies">
        {caseStudies.length === 0 ? (
          <ComingSoonPanel title={empty?.title ?? "Our first case studies are on the way."} body={empty?.body ?? ""} />
        ) : (
          <>
            {tabs.length > 1 && (
              <div className="collection-filter" role="group" aria-label="Filter case studies">
                {[null, ...tabs].map((t) => (
                  <button key={t ?? "all"} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>
                    {t ?? "All"}
                  </button>
                ))}
              </div>
            )}
            <ul className="cs-grid">
              {list.map((c) => (
                <li key={c.slug}>
                  <CaseStudyCard cs={c} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
