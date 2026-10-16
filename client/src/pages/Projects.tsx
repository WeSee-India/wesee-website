import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { imgDims } from "@/data/imageSizes";
import { projects, projectGroups, type Project, type ProjectGroup } from "@/data/projects";
import ComingSoonPanel from "@/components/ComingSoonPanel";

const pad = (n: number) => String(n).padStart(2, "0");
const COVER_IMAGE = "/projects/takumi.webp";

/** One project as an editorial "sheet": index number, title, image, footer strip. */
function Sheet({ p, n, total }: { p: Project; n: number; total: number }) {
  const statusClass = `pj-status--${p.status.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <li className={`deck-sheet${n % 2 === 0 ? " deck-sheet--flip" : ""}`}>
      <div className="deck-top">
        <span>WeSee <em>Projects</em></span>
        <span>N° {pad(n)} / {pad(total)}</span>
      </div>

      <div className="deck-media">
        {p.image ? (
          <img {...imgDims(p.image.src)} src={p.image.src} alt={p.image.alt} loading="lazy" />
        ) : (
          <span className="deck-media-fallback" aria-hidden="true">
            <strong>{p.title}</strong>
            <em>{p.category}</em>
          </span>
        )}
      </div>

      <div className="deck-text">
        <span className="deck-num" aria-hidden="true">{pad(n)}</span>
        <h2 className="deck-title">{p.title}</h2>
        <span className="deck-cat">{p.category}</span>
        <p className="deck-summary">{p.summary}</p>
      </div>

      <div className="deck-foot">
        <span><strong>{p.client}</strong> | {p.group}</span>
        <span className="deck-foot-right">
          <span className={`deck-status ${statusClass}`}>{p.status}</span>
          {p.caseStudySlug && <Link href={`/case-studies/${p.caseStudySlug}`}>Case study →</Link>}
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${p.title} (opens in a new tab)`}>
              Visit ↗
            </a>
          )}
        </span>
      </div>
    </li>
  );
}

export default function Projects() {
  const [group, setGroup] = useState<ProjectGroup | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const groups = projectGroups.filter((g) => projects.some((p) => p.group === g));
  const numbered = useMemo(() => projects.map((p, i) => ({ p, n: i + 1 })), []);
  const shown = group ? numbered.filter(({ p }) => p.group === group) : numbered;

  if (projects.length === 0) {
    return (
      <div className="collection-page">
        <header className="container collection-head">
          <span className="collection-pill">Projects</span>
          <h1>Things we have built.</h1>
        </header>
        <section className="container" aria-label="Projects">
          <ComingSoonPanel
            title="Our project gallery is being put together."
            body="We are collecting screenshots and write-ups from recent work, with our clients' permission. Book a call and we will show you examples close to what you need."
          />
        </section>
      </div>
    );
  }

  return (
    <div className="collection-page deck-page">
      <div className="container">
        {/* Contents sheet: page title + area index that doubles as the filter */}
        <header className="deck-sheet deck-cover">
          <div className="deck-top">
            <span>WeSee <em>Selected work</em></span>
            <span>{pad(projects.length)} projects</span>
          </div>
          <div className="deck-media">
            <img {...imgDims(COVER_IMAGE)} src={COVER_IMAGE} alt="" />
          </div>
          <div className="deck-cover-text">
            <h1 className="deck-cover-title">Projects</h1>
            <p className="deck-summary">
              AI agents, automations, trading platforms, apps and brand sites we have designed and shipped. Live work links to the real thing; prototypes are marked as such.
            </p>
            <div className="deck-index" role="group" aria-label="Filter projects by area">
              <button type="button" aria-pressed={group === null} onClick={() => setGroup(null)}>
                <span className="deck-index-num">00</span>
                <span className="deck-index-name">All work</span>
                <span className="deck-index-count">{projects.length} projects</span>
              </button>
              {groups.map((g, i) => {
                const count = projects.filter((p) => p.group === g).length;
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={group === g}
                    onClick={() => setGroup(group === g ? null : g)}
                  >
                    <span className="deck-index-num">{pad(i + 1)}</span>
                    <span className="deck-index-name">{g}</span>
                    <span className="deck-index-count">{count} {count === 1 ? "project" : "projects"}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="deck-foot">
            <span><strong>WeSee</strong> | Contents</span>
            <span className="deck-foot-right">
              {group ? (
                <button type="button" className="deck-reset" onClick={() => setGroup(null)}>Showing {group} · Show all</button>
              ) : (
                <span>Select an area to filter</span>
              )}
            </span>
          </div>
        </header>

        <ul className="deck-grid" aria-live="polite">
          {shown.map(({ p, n }) => <Sheet key={p.slug} p={p} n={n} total={projects.length} />)}
        </ul>
      </div>
    </div>
  );
}
