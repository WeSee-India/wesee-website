import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { caseStudies } from "@/data/caseStudies";
import Breadcrumbs from "@/components/Breadcrumbs";
import NotFound from "@/pages/NotFound";

export default function CaseStudyDetail() {
  const [, params] = useRoute("/case-studies/:slug");
  const cs = caseStudies.find((c) => c.slug === params?.slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  if (!cs) return <NotFound />;

  const bookHref = cs.serviceSlug ? `/book?service=${cs.serviceSlug}` : "/book";

  return (
    <article className="collection-page">
      <header className="container collection-head">
        <Breadcrumbs path={`/case-studies/${cs.slug}`} />
        <span className="collection-pill" style={{ marginTop: 24 }}>{cs.sector}</span>
        <h1>{cs.client}</h1>
        <p>{cs.summary}</p>
        <dl className="cs-facts">
          <div><dt>Sector</dt><dd>{cs.sector}</dd></div>
          <div><dt>Service</dt><dd>{cs.service}</dd></div>
          {cs.timeframe && <div><dt>Timeframe</dt><dd>{cs.timeframe}</dd></div>}
        </dl>
      </header>

      {cs.image && (
        <figure className="container cs-figure">
          <img src={cs.image.src} alt={cs.image.alt} />
          {cs.image.caption && <figcaption>{cs.image.caption}</figcaption>}
        </figure>
      )}

      <div className="container cs-body">
        <section>
          <h2>The challenge</h2>
          {cs.challenge.map((p) => <p key={p}>{p}</p>)}
        </section>

        <section>
          <h2>What we built</h2>
          {cs.solution.map((p) => <p key={p}>{p}</p>)}
        </section>

        {cs.implementation.length > 0 && (
          <section>
            <h2>How it works</h2>
            <ul>
              {cs.implementation.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </section>
        )}

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
            <figcaption>{cs.quote.name}, {cs.quote.role}</figcaption>
          </figure>
        )}

        <section className="cs-next">
          <h2>Want something similar?</h2>
          <div className="coming-soon-actions">
            <Link href={bookHref} className="cs-btn cs-btn--dark">Discuss a project</Link>
            {cs.serviceSlug && (
              <Link href={`/services/${cs.serviceSlug}`} className="cs-btn">View the {cs.service} service</Link>
            )}
            <Link href="/case-studies" className="cs-btn">All case studies</Link>
          </div>
        </section>
      </div>
    </article>
  );
}
