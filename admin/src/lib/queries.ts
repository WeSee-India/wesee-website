import type { QueryClient } from "@tanstack/react-query";
import { api } from "./api";

/**
 * Shared query definitions for the list screens, so the nav can prefetch a
 * screen's data on hover with exactly the key the screen itself reads.
 */

export const collectionQuery = <T>(key: string, status = "all", q = "") => ({
  queryKey: ["collection", key, status, q],
  queryFn: () => api<T>(`/api/admin/collections/${key}?take=500&status=${status}${q ? `&q=${encodeURIComponent(q)}` : ""}`),
});

export const categoryOptionsQuery = <T>() => ({
  queryKey: ["collection", "serviceCategories", "options"],
  queryFn: () => api<T>("/api/admin/collections/serviceCategories?take=500"),
});

export const mediaQuery = <T>(q = "", type = "") => ({
  queryKey: ["media", "library", q, type],
  queryFn: () => api<T>(`/api/admin/media?take=200${q ? `&q=${encodeURIComponent(q)}` : ""}${type ? `&type=${type}` : ""}`),
});

export const auditQuery = <T>(action = "", skip = 0, take = 50) => ({
  queryKey: ["audit", action, skip],
  queryFn: () => api<T>(`/api/admin/audit?take=${take}&skip=${skip}${action ? `&action=${action}` : ""}`),
});

export const dashboardQuery = <T>() => ({ queryKey: ["dashboard"], queryFn: () => api<T>("/api/admin/dashboard") });
export const pagesQuery = <T>() => ({ queryKey: ["pages"], queryFn: () => api<T>("/api/admin/pages") });
export const settingsQuery = <T>() => ({ queryKey: ["settings"], queryFn: () => api<T>("/api/admin/settings") });
export const usersQuery = <T>() => ({ queryKey: ["users"], queryFn: () => api<T>("/api/admin/users") });

const fixed: Record<string, () => { queryKey: unknown[]; queryFn: () => Promise<unknown> }> = {
  "/": dashboardQuery,
  "/pages": pagesQuery,
  "/media": mediaQuery,
  "/settings": settingsQuery,
  "/users": usersQuery,
  "/activity": auditQuery,
};

/** Warm the cache for a nav destination. Respects staleTime, so repeated hovers don't refetch. */
export function prefetchFor(qc: QueryClient, href: string) {
  const content = href.match(/^\/content\/([^/]+)$/);
  const query = content ? collectionQuery(content[1]) : fixed[href]?.();
  if (query) void qc.prefetchQuery(query);
  // The services list also shows category names.
  if (href === "/content/services") void qc.prefetchQuery(categoryOptionsQuery());
}
