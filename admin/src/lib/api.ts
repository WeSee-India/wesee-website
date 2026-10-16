/** Thin fetch wrapper for the backend: cookies, CSRF header, JSON and readable errors. */

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

let csrfToken = "";
export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
}

export async function api<T = unknown>(path: string, { method = "GET", body, form }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-CSRF-Token"] = csrfToken;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/api/auth/login")) onUnauthorized?.();
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status}).`, data?.fields ?? {});
  }
  return data as T;
}

/**
 * Resolve an image path for display in the admin. Uploads live on the API;
 * other site-relative paths (/cost.jpg) are the public site's own assets.
 */
export function assetUrl(src: string | null | undefined, siteUrl: string): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//.test(src)) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE}${src}`;
  return `${siteUrl.replace(/\/$/, "")}${src}`;
}
