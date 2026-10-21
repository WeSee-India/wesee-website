import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { imgDims } from "@/data/imageSizes";
import { useCollection, useSection } from "@/content";
import ComingSoonPanel from "@/components/ComingSoonPanel";

const pad = (n: number) => String(n).padStart(2, "0");

type Project = {
  slug: string;
  title: string;
  client: string;
  category: string;
  group: string;
  stage: string;
  summary: string;
  image?: { src: string; alt?: string } | null;
  caseStudySlug?: string | null;
  url?: string | null;
};
type CoverContent = { eyebrow?: string; heading?: string; summary?: string; coverImage?: string; groupOrder?: string[] };
type EmptyContent = { title?: string; body?: string };

/** Renders "*gold*" spans from CMS text as <em>. */
function emphasis(text: string) {
  return text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
}

/** One project as an editorial "sheet": index number, title, image, footer strip. */
function Sheet({ p, n, total }: { p: Project; n: number; total: number }) {
  const statusClass = `pj-status--${p.stage.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <li className={`deck-sheet${n % 2 === 0 ? " deck-sheet--flip" : ""}`}>
      <div className="deck-top">
        <span>WeSee <em>Projects</em></span>
        <span>N° {pad(n)} / {pad(total)}</span>
      </div>

      <div className="deck-media">
        {p.image ? (
          <img {...imgDims(p.image.src)} src={p.image.src} alt={p.image.alt ?? ""} loading="lazy" />
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
          <span className={`deck-status ${statusClass}`}>{p.stage}</span>
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
  const projects = useCollection("projects") as unknown as Project[];
  const cover = useSection<CoverContent>("projects", "cover");
  const empty = useSection<EmptyContent>("projects", "empty");
  const [group, setGroup] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const groups = useMemo(() => {
    const order = cover?.groupOrder ?? [];
    const rank = (g: string) => { const i = order.indexOf(g); return i === -1 ? order.length : i; };
    return Array.from(new Set(projects.map((p) => p.group))).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  }, [projects, cover?.groupOrder]);
  const numbered = useMemo(() => projects.map((p, i) => ({ p, n: i + 1 })), [projects]);
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
            title={empty?.title ?? "Our project gallery is being put together."}
            body={empty?.body ?? "We are collecting screenshots and write-ups from recent work, with our clients' permission. Book a call and we will show you examples close to what you need."}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="collection-page deck-page">
      <div className="container">
        {/* Contents sheet: page title + area index that doubles as the filter */}
        {cover && (
        <header className="deck-sheet deck-cover">
          <div className="deck-top">
            <span>{emphasis(cover.eyebrow ?? "WeSee *Selected work*")}</span>
            <span>{pad(projects.length)} projects</span>
          </div>
          <div className="deck-media">
            {cover.coverImage && <img {...imgDims(cover.coverImage)} src={cover.coverImage} alt="" />}
          </div>
          <div className="deck-cover-text">
            <h1 className="deck-cover-title">{cover.heading ?? "Projects"}</h1>
            {cover.summary && <p className="deck-summary">{cover.summary}</p>}
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
        )}

        <ul className="deck-grid" aria-live="polite">
          {shown.map(({ p, n }) => <Sheet key={p.slug} p={p} n={n} total={projects.length} />)}
        </ul>
      </div>
    </div>
  );
}
