import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { caseStudies, type CoreService } from "@/data/caseStudies";
import ComingSoonPanel from "@/components/ComingSoonPanel";

const SERVICES: CoreService[] = ["AI Agents", "AI Workflow Automation", "Custom Software & Integrations"];
/** Spec: only offer filtering once there are enough cases to make it useful. */
const FILTER_MIN = 6;

export default function CaseStudies() {
  const [service, setService] = useState<CoreService | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showFilter = caseStudies.length >= FILTER_MIN;
  const list = useMemo(
    () => (service ? caseStudies.filter((c) => c.service === service) : caseStudies),
    [service],
  );

  return (
    <div className="collection-page">
      <header className="container collection-head">
        <span className="collection-pill">Case studies</span>
        <h1>Real projects, measured results.</h1>
        <p>
          How we have used AI agents, workflow automation and custom software to take work off our clients' teams: the problem, what we built, and what changed.
        </p>
      </header>

      <section className="container" aria-label="Case studies">
        {caseStudies.length === 0 ? (
          <ComingSoonPanel
            title="Our first case studies are on the way."
            body="We are writing them up with our clients' approval, with real numbers and how they were measured. Until then, we are happy to walk you through relevant work on a call."
          />
        ) : (
          <>
            {showFilter && (
              <div className="collection-filter" role="group" aria-label="Filter by service">
                {[null, ...SERVICES].map((s) => (
                  <button key={s ?? "all"} type="button" aria-pressed={service === s} onClick={() => setService(s)}>
                    {s ?? "All"}
                  </button>
                ))}
              </div>
            )}
            <ul className="cs-grid">
              {list.map((c) => {
                const headline = c.results[0];
                return (
                  <li key={c.slug}>
                    <Link href={`/case-studies/${c.slug}`} className="cs-card">
                      {c.image && (
                        <div className="cs-card-media">
                          <img src={c.image.src} alt="" loading="lazy" />
                        </div>
                      )}
                      <div className="cs-card-meta">
                        <span>{c.sector}</span>
                        <span>{c.service}</span>
                      </div>
                      <h2 className="cs-card-title">{c.client}</h2>
                      <p className="cs-card-summary">{c.summary}</p>
                      {headline && (
                        <div className="cs-card-result">
                          <strong>{headline.value}</strong>
                          <span>{headline.metric}</span>
                        </div>
                      )}
                      <span className="cs-card-link">Read the {c.client} case study →</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
