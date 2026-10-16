import { ArrowUpRight, Bot, Cloud, Globe, TrendingUp, type LucideIcon } from "lucide-react";
import { Link } from "wouter";
import type { CaseStudy } from "@/content";

const ICONS: Record<string, LucideIcon> = {
  "AI & Automation": Bot,
  "Platforms & Cloud": Cloud,
  Fintech: TrendingUp,
  "Web & Brand": Globe,
};

/**
 * Index card: image, category icon, title, first tag, arrow, then the summary in a box.
 * `index` alternates the look in a checkerboard (plain card + dark box, tinted card + light box).
 */
export default function CaseStudyCard({ cs, index = 0, headingLevel = 2 }: { cs: CaseStudy; index?: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const Icon = ICONS[cs.category] ?? Globe;
  const alt = index % 2 === 1;

  return (
    <Link href={`/case-studies/${cs.slug}`} className={`csx-card${alt ? " csx-card--tint" : ""}`}>
      <div className="csx-card-media">
        {cs.image ? (
          <img src={cs.image.src} alt="" loading="lazy" />
        ) : (
          <div className="csx-card-art" aria-hidden="true">
            <Icon className="csx-card-art-icon" strokeWidth={1.2} />
          </div>
        )}
      </div>

      <div className="csx-card-row">
        <span className="csx-card-icon" aria-hidden="true">
          <Icon size={22} strokeWidth={1.6} />
        </span>
        <div className="csx-card-name">
          <Heading className="csx-card-title">{cs.title}</Heading>
          <span className="csx-card-sub">{cs.tags[0] ?? cs.category}</span>
        </div>
        <span className="csx-card-arrow" aria-hidden="true">
          <ArrowUpRight size={16} strokeWidth={2} />
        </span>
      </div>

      <p className={`csx-card-box${alt ? "" : " csx-card-box--dark"}`}>
        {cs.summary}
        <span className="sr-only"> Read the {cs.title} case study.</span>
      </p>
    </Link>
  );
}
