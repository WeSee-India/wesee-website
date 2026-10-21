import { imgDims } from "@/data/imageSizes";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "wouter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCollection, useSection } from "@/content";

type Article = {
    slug: string;
    title: string;
    category: string;
    date: string;
    excerpt: string;
    image: string;
    imageAlt: string;
    author: string;
    /** Heading for the article body, phrased as the reader's question. */
    question: string;
    /** A line from the article, shown as the closing pull quote. */
    quote: string;
    body: string;
};

type CtaContent = { title?: string; body?: string; button?: { href: string; label: string } };

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** "Feb 2026" from a publish date. */
function monthYear(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/** Inline markdown: **bold**, *italic*, [text](url). Everything else is plain text (no HTML). */
function inline(text: string): ReactNode[] {
    const out: ReactNode[] = [];
    const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
        if (m.index > last) out.push(text.slice(last, m.index));
        if (m[1] !== undefined) out.push(<strong key={m.index}>{inline(m[1])}</strong>);
        else if (m[2] !== undefined) out.push(<em key={m.index}>{inline(m[2])}</em>);
        else if (/^(https?:|mailto:)/.test(m[4])) {
            out.push(<a key={m.index} href={m[4]} target="_blank" rel="noopener noreferrer">{m[3]}</a>);
        } else if (/^[/#]/.test(m[4])) {
            out.push(<Link key={m.index} href={m[4]}>{m[3]}</Link>);
        } else out.push(m[3]);
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

/** Block markdown: paragraphs, ## headings, bullet and numbered lists. */
function blocks(md: string): ReactNode[] {
    return md
        .split(/\n{2,}/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk, i) => {
            const h = /^(#{2,4})\s+(.+)$/.exec(chunk);
            if (h) return h[1].length === 2 ? <h3 key={i}>{inline(h[2])}</h3> : <h4 key={i}>{inline(h[2])}</h4>;
            const lines = chunk.split("\n");
            if (lines.every((l) => /^[-*]\s+/.test(l))) {
                return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^[-*]\s+/, ""))}</li>)}</ul>;
            }
            if (lines.every((l) => /^\d+\.\s+/.test(l))) {
                return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\.\s+/, ""))}</li>)}</ol>;
            }
            return <p key={i}>{inline(lines.join(" "))}</p>;
        });
}

const WORDS_PER_MINUTE = 200;

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const posts = useCollection("blogPosts");
    const authors = useCollection("authors");
    const cta = useSection<CtaContent>("blog", "articleCta");
    const articles: Article[] = [...posts]
        .sort((x, y) => (y.publishedAt ?? "").localeCompare(x.publishedAt ?? ""))
        .map((p) => {
            const embedded = p.author as { name?: string } | null | undefined;
            const listed = authors.find((u) => u.slug === (embedded as { slug?: string } | null | undefined)?.slug);
            return {
                slug: p.slug,
                title: str(p.title),
                category: str(p.category),
                date: monthYear(p.publishedAt),
                excerpt: str(p.excerpt),
                image: str(p.coverImage),
                imageAlt: str(p.coverAlt),
                author: listed?.name ?? embedded?.name ?? "WeSee",
                question: str(p.question),
                quote: str(p.quote),
                body: str(p.body).replace(/\r\n/g, "\n"),
            };
        });
    const article = slug ? articles.find((a) => a.slug === slug) : undefined;
    const [copied, setCopied] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        setCopied(false);
    }, [slug]);

    // Reading progress bar: written straight to the element, no re-renders on scroll.
    useEffect(() => {
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [slug]);

    if (!article) {
        return (
            <div style={{ paddingTop: 120, textAlign: "center" }}>
                <p style={{ fontSize: 48, fontWeight: 700, color: "#1A1A1A", marginBottom: 16 }}>404</p>
                <p style={{ fontSize: 16, color: "#888888" }}>Article not found.</p>
                <Link href="/blog" className="cta-link" style={{ marginTop: 16, display: "inline-block" }}>← All articles</Link>
            </div>
        );
    }

    const paragraphs = article.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    // The first paragraph is the lede in the brief; the rest is the article body.
    const lede = paragraphs[0] ?? "";
    const body = paragraphs.slice(1).join("\n\n");
    const minutes = Math.max(1, Math.round(article.body.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
    const others = articles.filter((a) => a.slug !== slug).slice(0, 3);

    const share = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: article.title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
            }
        } catch {
            // share sheet dismissed or clipboard blocked: nothing to do
        }
    };

    return (
        <article className="bd">
            <div className="bd-progress" aria-hidden="true">
                <div ref={progressRef} className="bd-progress-bar" />
            </div>

            {/* Hero */}
            <header className="container bd-hero">
                <div className="bd-hero-text">
                    <Breadcrumbs path={`/blog/${slug}`} />
                    <p className="bd-kicker">{[article.category, article.date].filter(Boolean).join(" · ")}</p>
                    <h1 className="bd-title">{article.title}</h1>
                    <p className="bd-hero-excerpt">{article.excerpt}</p>
                </div>
                <div className="bd-hero-media">
                    <img {...imgDims(article.image)} src={article.image} alt={article.imageAlt} loading="eager" />
                </div>
            </header>

            {/* In brief */}
            <section className="container bd-brief" aria-labelledby="bd-brief-title">
                <div className="bd-brief-side">
                    <h2 id="bd-brief-title" className="bd-brief-heading"><span className="bd-brief-title">In brief</span></h2>
                    <dl className="bd-facts">
                        <div><dt>Topic</dt><dd>{article.category}</dd></div>
                        <div><dt>Published</dt><dd>{article.date}</dd></div>
                        <div><dt>Reading time</dt><dd>{minutes} min</dd></div>
                        <div><dt>Written by</dt><dd>{article.author}</dd></div>
                    </dl>
                </div>
                <div className="bd-brief-main">
                    <p className="bd-brief-lede">{inline(lede)}</p>
                    <div className="bd-brief-actions">
                        <a href="#bd-body" className="bd-pill bd-pill--dark">
                            <span className="bd-pill-play" aria-hidden="true" />
                            Start reading
                        </a>
                        <button type="button" className="bd-pill" onClick={share}>
                            {copied ? "Link copied" : "Share"}
                        </button>
                        <span className="sr-only" role="status">{copied ? "Link copied to clipboard" : ""}</span>
                    </div>
                </div>
            </section>

            {/* Article body */}
            <section id="bd-body" className="container bd-read" aria-labelledby={article.question ? "bd-body-title" : undefined}>
                <div className="bd-body">
                    {article.question && <h2 id="bd-body-title" className="bd-question">{article.question}</h2>}
                    {blocks(body)}
                    {article.quote && (
                        <blockquote className="bd-quote">
                            <p>“{article.quote}”</p>
                            <footer>{article.author}</footer>
                        </blockquote>
                    )}
                </div>

                {cta && (
                    <aside className="bd-cta" aria-label="Work with WeSee">
                        <span className="bd-cta-brand">WeSee</span>
                        {cta.title && <p className="bd-cta-title">{cta.title}</p>}
                        {cta.body && <p className="bd-cta-text">{cta.body}</p>}
                        {cta.button && <Link href={cta.button.href} className="bd-cta-btn">{cta.button.label}</Link>}
                    </aside>
                )}
            </section>

            {/* More from the blog */}
            {others.length > 0 && (
                <section className="container bd-more" aria-labelledby="bd-more-title">
                    <div className="bd-more-head">
                        <h2 id="bd-more-title">More from the blog</h2>
                        <Link href="/blog" className="bd-more-all">All articles →</Link>
                    </div>
                    <ul className="bd-more-grid">
                        {others.map((a) => (
                            <li key={a.slug}>
                                <Link href={`/blog/${a.slug}`} className="bd-more-card">
                                    <span className="bd-more-media">
                                        <img {...imgDims(a.image)} src={a.image} alt="" loading="lazy" />
                                    </span>
                                    <span className="bd-more-cat">{[a.category, a.date].filter(Boolean).join(" · ")}</span>
                                    <span className="bd-more-title">{a.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    );
}
