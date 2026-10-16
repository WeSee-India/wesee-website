import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import CaseStudyCard from "@/components/CaseStudyCard";
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

/** Per-page UTM tags on external booking links. */
function withUtm(href: string, slug: string) {
  if (!/^https?:\/\//.test(href)) return href;
  const url = new URL(href);
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", "case_study");
  url.searchParams.set("utm_campaign", slug);
  return url.toString();
}

function CtaLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
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

export default function CaseStudyDetail() {
  const [, params] = useRoute("/case-studies/:slug");
  const all = useCollection("caseStudies");
  const template = useSection<TemplateContent>("case-studies", "next");
  const cs = all.find((c) => c.slug === params?.slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  if (!cs) return <NotFound />;

  const meta = facts(cs);
  const more = all.filter((c) => c.slug !== cs.slug).slice(0, 3);
  const ctaHref = cs.cta ? withUtm(cs.cta.buttonUrl, cs.slug) : "/book";
  const ctaLabel = cs.cta?.buttonLabel ?? "Book a 30-minute call";

  return (
    <article className="collection-page cs-page">
      {/* Hero */}
      <header className="container collection-head">
        <Breadcrumbs path={`/case-studies/${cs.slug}`} />
        <span className="collection-pill" style={{ marginTop: 24 }}>{cs.category}</span>
        <h1 className="cs-headline">{cs.headline}</h1>
        <p>{cs.lede}</p>
      </header>

      {cs.image && (
        <figure className="container cs-figure">
          <img src={cs.image.src} alt={cs.image.alt} />
          {cs.image.caption && <figcaption>{cs.image.caption}</figcaption>}
        </figure>
      )}

      {/* Meta strip + tech chips */}
      <div className="container">
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

      <div className="container cs-layout">
        <div className="cs-body">
          {cs.overview.length > 0 && (
            <section>
              <h2>Client overview</h2>
              {cs.overview.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          )}

          {cs.challenge.length > 0 && (
            <section>
              <h2>The challenge</h2>
              <PointList points={cs.challenge} />
            </section>
          )}

          {cs.solution.length > 0 && (
            <section>
              <h2>What we built</h2>
              {cs.solution.map((p, i) =>
                p.lead ? (
                  <div key={i} className="cs-built">
                    <h3>{p.lead}</h3>
                    <p>{p.text}</p>
                  </div>
                ) : (
                  <p key={i} className="cs-built-intro">{p.text}</p>
                ),
              )}
            </section>
          )}

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

        {/* Sticky sidebar, desktop only */}
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
