import { imgDims } from "@/data/imageSizes";
import { Fragment, useEffect, useState } from "react";
import { Link } from "wouter";
import { useCollection, useSection } from "@/content";

type Article = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image: string;
  featured: boolean;
};

type HeroContent = { heading?: string; subheading?: string };

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** "Feb 2026" from a publish date. */
function monthYear(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

const ALL = "All";

export default function Blog() {
  const [category, setCategory] = useState<string>(ALL);
  const posts = useCollection("blogPosts");
  const hero = useSection<HeroContent>("blog", "hero");

  const articles: Article[] = [...posts]
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .map((p) => ({
      slug: p.slug,
      title: str(p.title),
      category: str(p.category),
      date: monthYear(p.publishedAt),
      excerpt: str(p.excerpt),
      image: str(p.coverImage),
      featured: p.featured === true,
    }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [ALL, ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))];
  const list = category === ALL ? articles : articles.filter((a) => a.category === category);
  const featured = list.find((a) => a.featured) ?? list[0];
  const grid = list.filter((a) => a !== featured);

  return (
    <div className="blog-route blog-index">
      {/* Hero */}
      {hero && (
        <header className="blog-hero">
          <div className="blog-hero-smoke" aria-hidden="true" />
          <div className="blog-hero-inner">
            {hero.heading && <h1 className="blog-hero-title">{hero.heading}</h1>}
            {hero.subheading && (
              <p className="blog-hero-sub">
                {hero.subheading.split("\n").map((line, i) => (
                  <Fragment key={i}>
                    {i > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
            )}
          </div>
        </header>
      )}

      {/* Browse by category */}
      <nav className="container blog-browse" aria-label="Browse the blog by topic">
        <span className="blog-browse-label">Browse the blog</span>
        <div className="blog-browse-list" role="group" aria-label="Filter articles">
          {categories.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </nav>

      {/* Latest / featured */}
      {featured && (
        <section className="container blog-feature" aria-label="Latest article">
          <Link href={`/blog/${featured.slug}`} className="blog-feature-media" tabIndex={-1} aria-hidden="true">
            <img {...imgDims(featured.image)} src={featured.image} alt="" />
            <span className="blog-feature-badge">
              <span>Read the latest</span>
            </span>
          </Link>
          <div className="blog-feature-card">
            <span className="blog-meta">{[featured.category, featured.date].filter(Boolean).join(" · ")}</span>
            <h2 className="blog-feature-title">
              <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p className="blog-feature-excerpt">{featured.excerpt}</p>
            <Link href={`/blog/${featured.slug}`} className="blog-feature-btn">
              Read post<span className="sr-only">: {featured.title}</span>
            </Link>
          </div>
        </section>
      )}

      {/* Article grid */}
      {grid.length > 0 && (
        <section className="container" aria-label="More articles">
          <ul className="blog-grid">
            {grid.map((a) => (
              <li key={a.slug} className="blog-card">
                <span className="blog-card-side" aria-hidden="true">{a.category}</span>
                <Link href={`/blog/${a.slug}`} className="blog-card-media" tabIndex={-1} aria-hidden="true">
                  <img {...imgDims(a.image)} src={a.image} alt="" loading="lazy" />
                </Link>
                <span className="blog-meta">{[a.category, a.date].filter(Boolean).join(" · ")}</span>
                <h3 className="blog-card-title">
                  <Link href={`/blog/${a.slug}`} title={a.title}>{a.title}</Link>
                </h3>
                <p className="blog-card-excerpt">{a.excerpt}</p>
                <Link href={`/blog/${a.slug}`} className="blog-card-more">
                  Read more<span className="sr-only">: {a.title}</span>
                  <span className="blog-card-arrow" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
