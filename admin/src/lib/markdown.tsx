import { Fragment, type ReactNode } from "react";

/**
 * A deliberately small Markdown renderer that produces React elements only:
 * paragraphs, ## / ### headings, - and 1. lists, > quotes, **bold**, *italic*
 * and [links](url). Raw HTML is shown as text, never injected, and links are
 * limited to http(s), mailto, tel and site paths.
 *
 * The public site uses the same rules (client/src/lib/markdown.tsx), so the
 * preview here matches what readers see.
 */

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i++}`;
    if (m[2]) out.push(<strong key={key}>{m[2]}</strong>);
    else if (m[4]) out.push(<em key={key}>{m[4]}</em>);
    else if (m[6]) {
      const href = m[7];
      out.push(
        SAFE_HREF.test(href) ? (
          <a key={key} href={href} {...(/^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {m[6]}
          </a>
        ) : (
          <Fragment key={key}>{m[6]}</Fragment>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export type MarkdownBlock =
  | { type: "p"; text: string }
  | { type: "h2" | "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] };

export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  for (const chunk of source.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim());
    if (!lines.length) continue;
    const first = lines[0].trim();
    if (first.startsWith("### ")) blocks.push({ type: "h3", text: first.slice(4) });
    else if (first.startsWith("## ")) blocks.push({ type: "h2", text: first.slice(3) });
    else if (lines.every((l) => /^\s*[-*]\s+/.test(l))) blocks.push({ type: "ul", items: lines.map((l) => l.replace(/^\s*[-*]\s+/, "")) });
    else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) blocks.push({ type: "ol", items: lines.map((l) => l.replace(/^\s*\d+[.)]\s+/, "")) });
    else if (lines.every((l) => l.trim().startsWith(">"))) blocks.push({ type: "quote", text: lines.map((l) => l.trim().replace(/^>\s?/, "")).join(" ") });
    else blocks.push({ type: "p", text: lines.join(" ") });
  }
  return blocks;
}

export function Markdown({ source }: { source: string }) {
  return (
    <>
      {parseMarkdown(source).map((b, i) => {
        const k = `b${i}`;
        switch (b.type) {
          case "h2":
            return <h2 key={k}>{inline(b.text, k)}</h2>;
          case "h3":
            return <h3 key={k}>{inline(b.text, k)}</h3>;
          case "quote":
            return <blockquote key={k}>{inline(b.text, k)}</blockquote>;
          case "ul":
          case "ol": {
            const Tag = b.type;
            return (
              <Tag key={k}>
                {b.items.map((item, j) => (
                  <li key={j}>{inline(item, `${k}-${j}`)}</li>
                ))}
              </Tag>
            );
          }
          default:
            return <p key={k}>{inline(b.text, k)}</p>;
        }
      })}
    </>
  );
}
