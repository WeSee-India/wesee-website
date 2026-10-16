import { Fragment } from "react";
import { Link } from "wouter";
import { getBreadcrumbs } from "@/data/seo";

/** Visible breadcrumb trail; the same data feeds the BreadcrumbList JSON-LD. */
export default function Breadcrumbs({ path }: { path: string }) {
  const crumbs = getBreadcrumbs(path);
  if (!crumbs) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "#888888" }}>
      <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={c.path}>
              <li>
                {last ? (
                  <span aria-current="page" style={{ color: "#1A1A1A" }}>{c.name}</span>
                ) : (
                  <Link href={c.path} style={{ color: "inherit", textDecoration: "none" }}>{c.name}</Link>
                )}
              </li>
              {!last && <li aria-hidden="true">/</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
