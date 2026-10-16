import { Link } from "wouter";
import type { CaseStudy } from "@/content";

/** Index card: image (16:10), filter tab, title, summary, up to 3 tags, region, timeline, link. */
export default function CaseStudyCard({ cs, headingLevel = 2 }: { cs: CaseStudy; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link href={`/case-studies/${cs.slug}`} className="cs-card">
      <div className="cs-card-media">
        {cs.image ? <img src={cs.image.src} alt="" loading="lazy" /> : <span className="cs-card-placeholder">{cs.title}</span>}
      </div>
      <div className="cs-card-meta">
        <span>{cs.category}</span>
      </div>
      <Heading className="cs-card-title">{cs.title}</Heading>
      <p className="cs-card-summary">{cs.summary}</p>
      {cs.tags.length > 0 && (
        <ul className="pj-stack" aria-label="Tags">
          {cs.tags.slice(0, 3).map((t) => <li key={t}>{t}</li>)}
        </ul>
      )}
      {(cs.region || cs.timeframe) && (
        <dl className="cs-card-facts">
          {cs.region && <div><dt>Region</dt><dd>{cs.region}</dd></div>}
          {cs.timeframe && <div><dt>Timeline</dt><dd>{cs.timeframe}</dd></div>}
        </dl>
      )}
      <span className="cs-card-link">
        Read case study<span className="sr-only">: {cs.title}</span> →
      </span>
    </Link>
  );
}
