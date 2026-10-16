import { Fragment, useEffect, useRef, useState } from "react";
import { useCollection, useSection, useSettings, type Job as ContentJob } from "@/content";

type Job = ContentJob;

type TeamCard = { name: string; blurb: string };
type HeroContent = { image?: string | null; kicker?: string; heading?: string };
type TeamsContent = { heading?: string; body?: string; teams?: TeamCard[]; openTitle?: string; openLabel?: string; openBody?: string };
type RolesContent = { heading?: string; emptyText?: string };
type ApplyContent = { kicker?: string; heading?: string; steps?: { title: string; description: string }[] };

const DEFAULT_HR_EMAIL = "hr@weseegpt.com";

function TeamIcon({ team }: { team: string }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (team === "Engineering") return <svg {...common}><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" /></svg>;
  if (team === "Marketing") return <svg {...common}><path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM15 9a3 3 0 010 6M18 6a7 7 0 010 12" /></svg>;
  if (team === "Content") return <svg {...common}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" /></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
}

const initials = (title: string) => title.split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
const mailto = (email: string, job?: Job) =>
  `mailto:${email}?subject=${encodeURIComponent(job ? `Application: ${job.title}` : "Open application")}`;

/** Replaces "{email}" in CMS text with a mail link. */
function withEmail(text: string, email: string, href: string) {
  const parts = text.split("{email}");
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <a href={href}>{email}</a>}
    </Fragment>
  ));
}

export default function Careers() {
  const jobs = useCollection("jobs");
  const HR_EMAIL = useSettings("contact")?.hrEmail || DEFAULT_HR_EMAIL;
  const hero = useSection<HeroContent>("careers", "hero");
  const teamsSection = useSection<TeamsContent>("careers", "teams");
  const roles = useSection<RolesContent>("careers", "roles");
  const apply = useSection<ApplyContent>("careers", "apply");
  const TEAMS = teamsSection?.teams ?? [];
  const applyHref = (job?: Job) => job?.applyUrl || mailto(HR_EMAIL, job);
  const locations = Array.from(new Set(jobs.map((j) => j.location)));

  const [team, setTeam] = useState<string>("");
  const [active, setActive] = useState<Job | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLElement>(null);

  const stepsRef = useRef<HTMLElement>(null);
  const [stepsIn, setStepsIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Play the steps entrance once, when the section scrolls into view.
  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStepsIn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Open/close the native dialog when a role is picked.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (active && !d.open) d.showModal();
    if (!active && d.open) d.close();
  }, [active]);

  const results = team ? jobs.filter((j) => j.team === team) : jobs;

  const pickTeam = (t: string) => {
    setTeam(t);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="cr">
      {hero && (
        <header className="cr-hero">
          {hero.image && <img className="cr-hero-img" src={hero.image} width={1600} height={1067} alt="" />}
          <div className="container cr-hero-inner">
            {hero.kicker && <span className="cr-hero-kicker">{hero.kicker}</span>}
            <h1 className="cr-hero-title">{hero.heading}</h1>
          </div>
        </header>
      )}

      {/* Teams */}
      {teamsSection && (
        <section className="container cr-section" aria-labelledby="cr-teams-title">
          <div className="cr-head">
            <h2 id="cr-teams-title">{teamsSection.heading}</h2>
            {teamsSection.body && <p>{teamsSection.body}</p>}
          </div>
          <div className="cr-teams">
            {TEAMS.map((t) => {
              const count = jobs.filter((j) => j.team === t.name).length;
              return (
                <button key={t.name} type="button" className="cr-team" onClick={() => pickTeam(t.name)}>
                  <span className="cr-team-icon"><TeamIcon team={t.name} /></span>
                  <span className="cr-team-name">{t.name}</span>
                  <span className="cr-team-count">{count} open {count === 1 ? "role" : "roles"}</span>
                  <span className="cr-team-blurb">{t.blurb}</span>
                </button>
              );
            })}
            {teamsSection.openTitle && (
              <a className="cr-team" href={applyHref()}>
                <span className="cr-team-icon"><TeamIcon team="Open" /></span>
                <span className="cr-team-name">{teamsSection.openTitle}</span>
                <span className="cr-team-count">{teamsSection.openLabel}</span>
                <span className="cr-team-blurb">{teamsSection.openBody}</span>
              </a>
            )}
          </div>
        </section>
      )}

      {/* Roles */}
      {roles && (
        <section ref={listRef} className="container cr-section cr-roles" aria-labelledby="cr-roles-title">
          <div className="cr-head">
            <h2 id="cr-roles-title">{roles.heading}</h2>
            <p role="status">
              {results.length === jobs.length
                ? `${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}${locations.length === 1 ? ` in ${locations[0]}` : ""}.`
                : `Showing ${results.length} of ${jobs.length} roles${team ? ` in ${team}` : ""}.`}
              {team && (
                <button type="button" className="cr-clear" onClick={() => setTeam("")}>
                  Show all
                </button>
              )}
            </p>
          </div>

          {results.length > 0 ? (
            <ul className="cr-jobs">
              {results.map((j) => (
                <li key={j.slug} className="cr-job">
                  <span className="cr-job-mark" aria-hidden="true">{initials(j.title)}</span>
                  <div className="cr-job-main">
                    <h3 className="cr-job-title">{j.title}</h3>
                    <p className="cr-job-team">WeSee · <strong>{j.team}</strong></p>
                    <ul className="cr-job-meta">
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                        {j.location}
                      </li>
                      {j.skills.length > 0 && (
                        <li>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z" /></svg>
                          {j.skills.slice(0, 3).join(", ")}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="cr-job-side">
                    <span className={`cr-job-type${j.employmentType === "Full time" ? " cr-job-type--full" : ""}`}>{j.employmentType}</span>
                    <button type="button" className="cr-job-view" onClick={() => setActive(j)}>
                      View role<span className="sr-only">: {j.title}</span> →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cr-empty">
              <p>{roles.emptyText || "No open roles right now."}</p>
              <a href={applyHref()}>Send an open application →</a>
            </div>
          )}
        </section>
      )}

      {/* How to apply */}
      {apply && (
        <section ref={stepsRef} className={`cr-steps${stepsIn ? " is-in" : ""}`} aria-labelledby="cr-steps-title">
          <div className="container">
            {apply.kicker && <span className="cr-steps-kicker">{apply.kicker}</span>}
            <h2 id="cr-steps-title">{apply.heading}</h2>
            <div className="cr-flow">
              {/* line through the circles, with a pulse travelling along it */}
              <span className="cr-flow-line" aria-hidden="true"><span className="cr-flow-pulse" /></span>
              <ol>
                {(apply.steps ?? []).map((step, i) => (
                  <li key={i} style={{ "--i": i } as React.CSSProperties}>
                    <span className="cr-step-num">{String(i + 1).padStart(2, "0")}</span>
                    <h3>{step.title}</h3>
                    <p>{withEmail(step.description, HR_EMAIL, applyHref())}</p>
                  </li>
                ))}
              </ol>
            </div>
            <a className="cr-steps-cta" href={applyHref()}>
              Email {HR_EMAIL}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      )}

      {/* Role details */}
      <dialog ref={dialogRef} className="cr-dialog" aria-labelledby="cr-dialog-title" onClose={() => setActive(null)}>
        {active && (
          <div className="cr-dialog-inner">
            <button type="button" className="cr-dialog-close" onClick={() => setActive(null)} aria-label="Close role details">✕</button>
            <span className="cr-dialog-kicker">{active.team} · {active.employmentType} · {active.location}</span>
            <h2 id="cr-dialog-title">{active.title}</h2>
            <ul className="cr-dialog-skills" aria-label="Skills">
              {active.skills.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <p className="cr-dialog-intro">{active.intro}</p>
            {active.responsibilities.length > 0 && (<><h3>The role</h3><ul>{active.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul></>)}
            {active.requirements.length > 0 && (<><h3>You should have</h3><ul>{active.requirements.map((r) => <li key={r}>{r}</li>)}</ul></>)}
            {active.bonus.length > 0 && (<><h3>Bonus</h3><ul>{active.bonus.map((r) => <li key={r}>{r}</li>)}</ul></>)}
            {active.closing && <p className="cr-dialog-closing">{active.closing}</p>}
            <a className="cr-dialog-apply" href={applyHref(active)}>Apply for this role</a>
            {!active.applyUrl && <p className="cr-dialog-note">Opens an email to {HR_EMAIL}. Attach your CV, motivation letter and portfolio.</p>}
          </div>
        )}
      </dialog>
    </div>
  );
}
