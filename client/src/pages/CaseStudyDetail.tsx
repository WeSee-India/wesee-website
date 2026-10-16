import { useEffect, type ReactNode } from "react";
import { Check, Clock, Layers, ListChecks, Plug, Users } from "lucide-react";
import { Link, useRoute } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import CaseStudyCard from "@/components/CaseStudyCard";
import { caseStudyIcon } from "@/components/caseStudyIcons";
import { useCollection, useSection, type CaseStudy, type Point } from "@/content";
import NotFound from "@/pages/NotFound";

type TemplateContent = { heading?: string; footerLine?: string; footerEmail?: string };

/** Meta strip / sidebar facts, in the handoff's order. Empty ones are left out. */
function facts(cs: CaseStudy) {
  return [
    ["Client", cs.client],
    ["Industry", cs.sector],
    ["Region", cs.region],
    ["Service", cs.service],
    ["Timeline", cs.timeframe],
    ["Team", cs.team],
  ].filter((f): f is [string, string] => Boolean(f[1]));
}

/** Overview stats: counts of what is on the page, plus timeline and team once confirmed. Never invented numbers. */
function stats(cs: CaseStudy) {
  const out: { icon: typeof Clock; value: string; label: string }[] = [];
  if (cs.features.length) out.push({ icon: Layers, value: String(cs.features.length), label: "Key features" });
  if (cs.tech.length) out.push({ icon: Plug, value: String(cs.tech.length), label: "Tech & integrations" });
  if (cs.timeframe) out.push({ icon: Clock, value: cs.timeframe, label: "Timeline" });
  else if (cs.delivery.length) out.push({ icon: ListChecks, value: String(cs.delivery.length), label: "Delivery steps" });
  if (cs.team) out.push({ icon: Users, value: cs.team, label: "Team" });
  return out.slice(0, 4);
}

/** Per-page UTM tags on external booking links. */
function withUtm(href: string, slug: string) {
  if (!/^https?:\/\//.test(href)) return href;
  const url = new URL(href);
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", "case_study");
  url.searchParams.set("utm_campaign", slug);
  return url.toString();
}

function CtaLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return /^https?:\/\//.test(href) ? (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link href={href} className={className}>{children}</Link>
  );
}

function PointList({ points, ordered }: { points: Point[]; ordered?: boolean }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className={ordered ? "cs-points cs-points--numbered" : "cs-points"}>
      {points.map((p, i) => (
        <li key={i}>
          {p.lead && <strong>{p.lead} </strong>}
          {p.text}
        </li>
      ))}
    </List>
  );
}

/** "The challenge" → "The <em>challenge</em>": the key word in gold, as in the reference design. */
function Title({ id, children }: { id: string; children: string }) {
  const [first, ...rest] = children.split(" ");
  return (
    <h2 id={id} className="cs2-title">
      {rest.length ? <>{first} <em>{rest.join(" ")}</em></> : <em>{first}</em>}
    </h2>
  );
}

/** Small hand-drawn marks from the reference, in brand gold. Decorative only. */
function Doodle({ kind, className }: { kind: "arrow" | "squiggle" | "star" | "square" | "loop"; className: string }) {
  const paths = {
    arrow: <><path d="M2 12h8M16 12h8M32 12h40" /><path d="M66 6l7 6-7 6" /></>,
    squiggle: <path d="M2 14c6-10 12-10 18 0s12 10 18 0 12-10 18 0" />,
    star: <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" />,
    square: <rect x="3" y="3" width="10" height="10" />,
    loop: <path d="M2 40c30 0 40-34 22-34S10 34 40 30s34-26 34-26" />,
  } as const;
  const box = { arrow: "0 0 76 24", squiggle: "0 0 58 24", star: "0 0 24 24", square: "0 0 16 16", loop: "0 0 78 44" }[kind];
  return (
    <svg className={`cs2-doodle ${className}`} viewBox={box} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

/** Branded stand-in for screenshots until the client approves publishing them. */
function Art({ cs, className = "" }: { cs: CaseStudy; className?: string }) {
  const Icon = caseStudyIcon(cs.category);
  if (cs.image) return <img className={`cs2-art cs2-art--img ${className}`} src={cs.image.src} alt={cs.image.alt} />;
  return (
    <div className={`cs2-art ${className}`} aria-hidden="true">
      <Icon className="cs2-art-icon" strokeWidth={1.1} />
      <span className="cs2-art-label">{cs.title}</span>
    </div>
  );
}

export default function CaseStudyDetail() {
  const [, params] = useRoute("/case-studies/:slug");
  const all = useCollection("caseStudies");
  const template = useSection<TemplateContent>("case-studies", "next");
  const cs = all.find((c) => c.slug === params?.slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  if (!cs) return <NotFound />;

  const Icon = caseStudyIcon(cs.category);
  const meta = facts(cs);
  const numbers = stats(cs);
  const more = all.filter((c) => c.slug !== cs.slug).slice(0, 3);
  const ctaHref = cs.cta ? withUtm(cs.cta.buttonUrl, cs.slug) : "/book";
  const ctaLabel = cs.cta?.buttonLabel ?? "Book a 30-minute call";
  const intro = cs.solution.filter((p) => !p.lead);
  const built = cs.solution.filter((p) => p.lead);

  return (
    <article className="cs2">
      {/* ── Hero: title on the left, a tilted stack of panels on the right ── */}
      <header className="cs2-hero">
        <Doodle kind="arrow" className="cs2-d-arrow" />
        <Doodle kind="square" className="cs2-d-sq1" />
        <Doodle kind="squiggle" className="cs2-d-squig" />
        <Doodle kind="star" className="cs2-d-star" />
        <div className="container cs2-hero-grid">
          <div className="cs2-hero-copy">
            <Breadcrumbs path={`/case-studies/${cs.slug}`} />
            <p className="cs2-kicker">
              <span>{cs.category}</span>
              Case study
            </p>
            <h1 className="cs2-headline">{cs.headline}</h1>
            <p className="cs2-lede">{cs.lede}</p>
            <ul className="cs2-tags" aria-label="Tags">
              {cs.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>

          <div className="cs2-stack" aria-hidden="true">
            {cs.tech.length > 0 && (
              <div className="cs2-panel cs2-panel--back">
                <span className="cs2-panel-label">Tech & integrations</span>
                <ul>{cs.tech.slice(0, 6).map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            )}
            {cs.features.length > 0 && (
              <div className="cs2-panel cs2-panel--mid">
                <span className="cs2-panel-label">Key features</span>
                <ul className="cs2-panel-checks">
                  {cs.features.slice(0, 3).map((f, i) => (
                    <li key={i}><Check size={14} strokeWidth={2.4} />{f.lead ?? f.text}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="cs2-panel cs2-panel--front">
              <Art cs={cs} />
            </div>
          </div>
        </div>
      </header>

      {/* Meta strip + tech chips */}
      <div className="container cs2-metawrap">
        {meta.length > 0 && (
          <dl className="cs-meta">
            {meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        )}
        {cs.tech.length > 0 && (
          <ul className="pj-stack cs-tech" aria-label="Tech and integrations">
            {cs.tech.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
      </div>

      {/* ── Client overview: visual left, copy + stats right ── */}
      {cs.overview.length > 0 && (
        <section className="container cs2-split cs2-overview" aria-labelledby="cs2-overview">
          <div className="cs2-visual">
            <Doodle kind="loop" className="cs2-d-loop" />
            <div className="cs2-fan" aria-hidden="true">
              <div className="cs2-fan-card cs2-fan-card--1"><Icon strokeWidth={1.2} /></div>
              <div className="cs2-fan-card cs2-fan-card--2">
                <span className="cs2-panel-label">The challenge</span>
                <ul>{cs.challenge.slice(0, 3).map((c, i) => <li key={i}>{c.lead ?? c.text}</li>)}</ul>
              </div>
              <div className="cs2-fan-card cs2-fan-card--3"><Art cs={cs} /></div>
            </div>
          </div>
          <div className="cs2-copy">
            <Title id="cs2-overview">Client overview</Title>
            {cs.overview.map((p, i) => <p key={i}>{p}</p>)}
            {numbers.length > 0 && (
              <ul className="cs2-stats">
                {numbers.map((s) => (
                  <li key={s.label}>
                    <span className="cs2-stat-icon" aria-hidden="true"><s.icon size={18} strokeWidth={1.8} /></span>
                    <span><strong>{s.value}</strong>{s.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <svg className="cs2-thread" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M250 0 C 250 80, 900 40, 950 120" />
      </svg>

      {/* ── The challenge: list left, visual right ── */}
      {cs.challenge.length > 0 && (
        <section className="container cs2-split cs2-split--rev" aria-labelledby="cs2-challenge">
          <div className="cs2-copy">
            <Title id="cs2-challenge">The challenge</Title>
            <span className="cs2-rule" aria-hidden="true" />
            <ul className="cs2-dots cs2-dots--problem">
              {cs.challenge.map((p, i) => (
                <li key={i}>
                  {p.lead ? <><strong>{p.lead}</strong> <span>{p.text}</span></> : p.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="cs2-visual">
            <Doodle kind="star" className="cs2-d-star2" />
            <div className="cs2-bubble" aria-hidden="true">
              <Icon className="cs2-bubble-icon" strokeWidth={1.2} />
              <span className="cs2-bubble-count">{String(cs.challenge.length).padStart(2, "0")}</span>
              <span className="cs2-bubble-label">problems to solve</span>
            </div>
          </div>
        </section>
      )}

      <svg className="cs2-thread cs2-thread--flip" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M950 0 C 950 80, 300 40, 250 120" />
      </svg>

      {/* ── What we built: visual left, list right ── */}
      {cs.solution.length > 0 && (
        <section className="container cs2-split" aria-labelledby="cs2-built">
          <div className="cs2-visual">
            <div className="cs2-rings">
              <Art cs={cs} className="cs2-rings-art" />
            </div>
          </div>
          <div className="cs2-copy">
            <Title id="cs2-built">What we built</Title>
            <span className="cs2-rule" aria-hidden="true" />
            {intro.map((p, i) => <p key={i} className="cs2-built-intro">{p.text}</p>)}
            {built.length > 0 && (
              <ul className="cs2-dots cs2-dots--solution">
                {built.map((p, i) => (
                  <li key={i}>
                    <strong>{p.lead}</strong> <span>{p.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ── Details: features, delivery, results, testimonial, with the sticky facts sidebar ── */}
      <div className="container cs-layout cs2-details">
        <div className="cs-body">
          {cs.features.length > 0 && (
            <section>
              <h2>Key features</h2>
              <PointList points={cs.features} ordered />
            </section>
          )}

          {cs.delivery.length > 0 && (
            <section>
              <h2>How we delivered it</h2>
              <PointList points={cs.delivery} ordered />
            </section>
          )}

          {/* Only confirmed numbers are ever published; the block hides while there are none. */}
          {cs.results.length > 0 && (
            <section>
              <h2>Results</h2>
              <ul className="cs-results">
                {cs.results.map((r) => (
                  <li key={r.metric}>
                    <strong>{r.value}</strong>
                    <span className="cs-results-metric">{r.metric}</span>
                    {(r.period || r.method || r.note) && (
                      <span className="cs-results-source">
                        {[r.period, r.method && `Measured via ${r.method}`, r.note].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {cs.quote && (
            <figure className="cs-quote">
              <blockquote>“{cs.quote.text}”</blockquote>
              <figcaption>{[cs.quote.name, cs.quote.role, cs.quote.company].filter(Boolean).join(", ")}</figcaption>
            </figure>
          )}
        </div>

        <aside className="cs-aside" aria-label="Project facts">
          {meta.length > 0 && (
            <dl>
              {meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          )}
          <CtaLink href={ctaHref} className="cs-btn cs-btn--dark">{ctaLabel}</CtaLink>
        </aside>
      </div>

      {/* CTA band */}
      {cs.cta && (
        <section className="cs-cta" aria-labelledby="cs-cta-title">
          <div className="container">
            <h2 id="cs-cta-title">{cs.cta.heading}</h2>
            {cs.cta.body && <p>{cs.cta.body}</p>}
            <CtaLink href={ctaHref} className="cs-btn cs-btn--light">{ctaLabel}</CtaLink>
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="container cs-more" aria-labelledby="cs-more-title">
          <div className="cs-more-head">
            <h2 id="cs-more-title">{template?.heading ?? "More case studies"}</h2>
            <Link href="/case-studies" className="cs-more-all">All case studies →</Link>
          </div>
          <ul className="csx-grid">
            {more.map((c, i) => (
              <li key={c.slug}>
                <CaseStudyCard cs={c} index={i} headingLevel={3} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(template?.footerLine || template?.footerEmail) && (
        <p className="container cs-signoff">
          {template.footerLine}
          {template.footerLine && template.footerEmail && <span aria-hidden="true"> · </span>}
          {template.footerEmail && <a href={`mailto:${template.footerEmail}`}>{template.footerEmail}</a>}
        </p>
      )}
    </article>
  );
}
