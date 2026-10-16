import { useSyncExternalStore } from "react";
import bundled from "@/generated/content.json";
import type { Collections, ContentSnapshot, Page, Settings } from "./types";

export type * from "./types";

/**
 * Site content from the CMS (backend/). The build bundles a snapshot
 * (scripts/fetch-content.mjs), so pages render real content immediately and
 * crawlers see it. On load the browser re-fetches the live snapshot, so a
 * publish shows up within seconds without waiting for a rebuild.
 *
 * Draft previews: the admin opens `<page>?preview=<token>`; the previewed
 * page or item replaces its published version for this visit only.
 */

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

let snapshot = bundled as unknown as ContentSnapshot;
const listeners = new Set<() => void>();

function set(next: ContentSnapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useSnapshot() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

export function useCollection<K extends keyof Collections>(key: K): Collections[K] {
  return useSnapshot().collections[key] ?? ([] as unknown as Collections[K]);
}

export function useSettings<K extends keyof Settings>(key: K): Settings[K] {
  return useSnapshot().settings[key];
}

export function usePage(key: string): Page | undefined {
  return useSnapshot().pages[key];
}

/** A section's content by its key, or undefined when the section is hidden or missing. */
export function useSection<T = Record<string, unknown>>(pageKey: string, sectionKey: string): T | undefined {
  return usePage(pageKey)?.sections.find((s) => s.key === sectionKey)?.content as T | undefined;
}

type PreviewResponse = { kind: "page"; item: Page } | { kind: string; item: { slug: string } & Record<string, unknown> };

function applyPreview(base: ContentSnapshot, preview: PreviewResponse): ContentSnapshot {
  if (preview.kind === "page") {
    const page = preview.item as Page;
    return { ...base, pages: { ...base.pages, [page.key]: page } };
  }
  const key = preview.kind as keyof Collections;
  const list = (base.collections[key] ?? []) as { slug: string }[];
  const item = preview.item as { slug: string };
  const next = list.some((x) => x.slug === item.slug) ? list.map((x) => (x.slug === item.slug ? item : x)) : [item, ...list];
  return { ...base, collections: { ...base.collections, [key]: next } };
}

let started = false;

/** Fetch the live snapshot (and a draft preview, if requested). Call once at startup. */
export function startContentSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  const token = new URLSearchParams(window.location.search).get("preview");

  // no-cache = revalidate every load (a cheap 304 via ETag), so a publish shows on the next refresh.
  const live = fetch(`${API}/api/public/snapshot`, { cache: "no-cache", headers: { Accept: "application/json" } })
    .then((r) => (r.ok ? (r.json() as Promise<ContentSnapshot & { collections: { services?: unknown } }>) : null))
    .catch(() => null);
  const preview = token
    ? fetch(`${API}/api/public/preview?token=${encodeURIComponent(token)}`)
        .then((r) => (r.ok ? (r.json() as Promise<PreviewResponse>) : null))
        .catch(() => null)
    : Promise.resolve(null);

  void Promise.all([live, preview]).then(([fresh, draft]) => {
    let next = snapshot;
    if (fresh && fresh.version !== snapshot.version) {
      // Services ship in their own chunk; the shell snapshot never carries them.
      const { services: _services, ...collections } = fresh.collections;
      next = { ...fresh, collections: collections as Collections };
    }
    if (draft) next = applyPreview(next, draft);
    if (next !== snapshot) set(next);
  });
}
