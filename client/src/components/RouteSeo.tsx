import { useEffect } from "react";
import { useLocation } from "wouter";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, absoluteUrl, getRouteMeta, getStructuredData } from "@/data/seo";

function upsert(tag: "meta" | "link", keyAttr: string, keyValue: string, valueAttr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(`${tag}[${keyAttr}="${keyValue}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(keyAttr, keyValue);
    document.head.appendChild(el);
  }
  el.setAttribute(valueAttr, value);
}

const meta = (keyAttr: "name" | "property", key: string, content: string) =>
  upsert("meta", keyAttr, key, "content", content);

/** Keeps title, description, canonical and share tags in sync with the current route. */
export default function RouteSeo() {
  const [location] = useLocation();

  useEffect(() => {
    const m = getRouteMeta(location);
    const url = `${SITE_URL}${m.path === "/" ? "/" : m.path}`;
    const image = m.image ? absoluteUrl(m.image) : DEFAULT_OG_IMAGE;

    document.title = m.title;
    meta("name", "description", m.description);
    meta("name", "robots", m.noindex ? "noindex,follow" : "index,follow");
    upsert("link", "rel", "canonical", "href", url);

    meta("property", "og:site_name", SITE_NAME);
    meta("property", "og:title", m.title);
    meta("property", "og:description", m.description);
    meta("property", "og:url", url);
    meta("property", "og:image", image);
    meta("name", "twitter:card", "summary_large_image");
    meta("name", "twitter:title", m.title);
    meta("name", "twitter:description", m.description);
    meta("name", "twitter:image", image);

    document.head.querySelectorAll("script[data-route-ld]").forEach((el) => el.remove());
    for (const obj of getStructuredData(location)) {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.setAttribute("data-route-ld", "");
      el.textContent = JSON.stringify(obj);
      document.head.appendChild(el);
    }
  }, [location]);

  return null;
}
