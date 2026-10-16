import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

/**
 * Preview tokens let the public site render one unpublished item for a short
 * time, without a login: the admin asks for a token, opens the site with
 * ?preview=<token>, and the site fetches the draft with it. Tokens are signed,
 * scoped to a single entity and expire after PREVIEW_TTL_MINUTES.
 */

const PREVIEW_TTL_MINUTES = 30;

export interface PreviewClaims {
  /** "page" or a collection key. */
  kind: string;
  id: string;
  exp: number;
}

const sign = (payload: string) => createHmac("sha256", config.sessionSecret).update(`preview:${payload}`).digest("base64url");

export function createPreviewToken(kind: string, id: string): { token: string; expiresAt: Date } {
  const exp = Date.now() + PREVIEW_TTL_MINUTES * 60_000;
  const payload = Buffer.from(JSON.stringify({ kind, id, exp } satisfies PreviewClaims)).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(exp) };
}

export function readPreviewToken(token: string): PreviewClaims | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as PreviewClaims;
    return claims.exp > Date.now() ? claims : null;
  } catch {
    return null;
  }
}
