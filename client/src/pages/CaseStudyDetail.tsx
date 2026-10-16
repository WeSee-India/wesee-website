import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link, useRoute } from "wouter";
import { caseStudyIcon } from "@/components/caseStudyIcons";
import { useCollection, useSection, type CaseStudy } from "@/content";
import NotFound from "@/pages/NotFound";

type TemplateContent = { heading?: string; footerLine?: string; footerEmail?: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** Facts strip / sidebar, in the handoff's order. Empty ones are left out. */
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

function CtaLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return /^https?:\/\//.test(href) ? (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link href={href} className={className}>{children}</Link>
  );
}

/** A numbered story section: "02 · The challenge". */
function Chapter({ n, id, title, children }: { n: number; id: string; title: string; children: ReactNode }) {
  return (
    <section className="csd-chapter" aria-labelledby={id}>
      <p className="csd-chapter-num">{pad(n)}</p>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

function Media({ cs, className }: { cs: CaseStudy; className: string }) {
  const Icon = caseStudyIcon(cs.category);
  return (
    <div className={className}>
      {cs.image ? <img src={cs.image.src} alt={cs.image.alt} /> : <span className="csd-fallback"><Icon strokeWidth={1.2} /></span>}
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

  const meta = facts(cs);
  const at = all.indexOf(cs);
  // The next ones in index order, wrapping around: 2–3 cards.
  const more = [...all.slice(at + 1), ...all.slice(0, at)].slice(0, 3);
  const ctaHref = cs.cta ? withUtm(cs.cta.buttonUrl, cs.slug) : "/book";
  const ctaLabel = cs.cta?.buttonLabel ?? "Book a 30-minute call";
  const intro = cs.solution.filter((p) => !p.lead);
  const built = cs.solution.filter((p) => p.lead);

  // Chapters are numbered in the order they appear; empty ones are skipped.
  let n = 0;
  const next = () => ++n;

  return (
    <article className="csd">
      {/* Hero */}
      <header className="container csd-hero">
        <Link href="/case-studies" className="csd-back">
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" /> All case studies
        </Link>
        <p className="csd-eyebrow">
          <span>{cs.category}</span> Case study
        </p>
        <h1>{cs.headline}</h1>
        <p className="csd-lede">{cs.lede}</p>
        {cs.tags.length > 0 && (
          <ul className="csr-tags csd-tags" aria-label="Tags">
            {cs.tags.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
      </header>

      <div className="container">
        <Media cs={cs} className="csd-cover" />
        {cs.image?.caption && <p className="csd-caption">{cs.image.caption}</p>}

        {(meta.length > 0 || cs.tech.length > 0) && (
          <div className="csd-facts">
            {meta.length > 0 && (
              <dl>
                {meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
            )}
            {cs.tech.length > 0 && (
              <ul className="csd-tech" aria-label="Tech and integrations">
                {cs.tech.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Story + sticky facts sidebar */}
      <div className="container csd-body">
        <div className="csd-story">
          {cs.overview.length > 0 && (
            <Chapter n={next()} id="csd-overview" title="Client overview">
              {cs.overview.map((p, i) => <p key={i} className="csd-lead-text">{p}</p>)}
            </Chapter>
          )}

          {cs.challenge.length > 0 && (
            <Chapter n={next()} id="csd-challenge" title="The challenge">
              <ul className="csd-cards">
                {cs.challenge.map((p, i) => (
                  <li key={i}>
                    {p.lead && <h3>{p.lead}</h3>}
                    <p>{p.text}</p>
                  </li>
                ))}
              </ul>
            </Chapter>
          )}

          {cs.solution.length > 0 && (
            <Chapter n={next()} id="csd-built" title="What we built">
              {intro.map((p, i) => <p key={i} className="csd-lead-text">{p.text}</p>)}
              {built.length > 0 && (
                <ol className="csd-built">
                  {built.map((p, i) => (
                    <li key={i}>
                      <span className="csd-built-num" aria-hidden="true">{pad(i + 1)}</span>
                      <div>
                        <h3>{p.lead}</h3>
                        <p>{p.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Chapter>
          )}

          {cs.features.length > 0 && (
            <Chapter n={next()} id="csd-features" title="Key features">
              <ul className="csd-checks">
                {cs.features.map((p, i) => (
                  <li key={i}>
                    <span className="csd-check" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span>
                    <span>{p.lead && <strong>{p.lead} </strong>}{p.text}</span>
                  </li>
                ))}
              </ul>
            </Chapter>
          )}

          {cs.delivery.length > 0 && (
            <Chapter n={next()} id="csd-delivery" title="How we delivered it">
              <ol className="csd-steps">
                {cs.delivery.map((p, i) => (
                  <li key={i}>
                    <span className="csd-step-dot" aria-hidden="true">{i + 1}</span>
                    <p>{p.lead && <strong>{p.lead} </strong>}{p.text}</p>
                  </li>
                ))}
              </ol>
            </Chapter>
          )}

          {/* Only confirmed numbers are ever published; the chapter hides while there are none. */}
          {cs.results.length > 0 && (
            <Chapter n={next()} id="csd-results" title="Results">
              <ul className="csd-results">
                {cs.results.map((r) => (
                  <li key={r.metric}>
                    <strong>{r.value}</strong>
                    <span>{r.metric}</span>
                    {(r.period || r.method || r.note) && (
                      <small>{[r.period, r.method && `Measured via ${r.method}`, r.note].filter(Boolean).join(" · ")}</small>
                    )}
                  </li>
                ))}
              </ul>
            </Chapter>
          )}

          {cs.quote && (
            <figure className="csd-quote">
              <blockquote>“{cs.quote.text}”</blockquote>
              <figcaption>{[cs.quote.name, cs.quote.role, cs.quote.company].filter(Boolean).join(", ")}</figcaption>
            </figure>
          )}
        </div>

        <aside className="csd-aside" aria-label="Project facts">
          <p className="csd-aside-title">{cs.title}</p>
          {meta.length > 0 && (
            <dl>
              {meta.slice(0, 4).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          )}
          <CtaLink href={ctaHref} className="csx-btn csd-aside-btn">{ctaLabel}</CtaLink>
        </aside>
      </div>

      {/* CTA band */}
      {cs.cta && (
        <section className="container" aria-labelledby="csd-cta-title">
          <div className="csd-cta">
            <h2 id="csd-cta-title">{cs.cta.heading}</h2>
            {cs.cta.body && <p>{cs.cta.body}</p>}
            <CtaLink href={ctaHref} className="csx-btn">{ctaLabel}</CtaLink>
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="container csd-more" aria-labelledby="csd-more-title">
          <div className="csd-more-head">
            <h2 id="csd-more-title">{template?.heading ?? "More case studies"}</h2>
            <Link href="/case-studies" className="csr-link">
              All case studies <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          <ul className="csd-more-grid">
            {more.map((c) => (
              <li key={c.slug}>
                <Link href={`/case-studies/${c.slug}`} className="csd-mini">
                  <Media cs={c} className="csd-mini-media" />
                  <span className="csd-mini-cat">{c.category}</span>
                  <h3>
                    {c.title}
                    <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                  </h3>
                  <p>{c.summary}</p>
                </Link>
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
