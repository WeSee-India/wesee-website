import { config } from "../config.js";

/**
 * The public site prerenders an HTML file per route (titles, descriptions,
 * share tags, sitemap) at build time from published content. After content
 * changes, this triggers a rebuild through a Vercel deploy hook so those files
 * catch up. Calls are debounced: a burst of edits causes one rebuild.
 *
 * The site itself shows changes within seconds without a rebuild, because it
 * re-fetches content from the API at runtime.
 */

let timer: NodeJS.Timeout | undefined;
const reasons = new Set<string>();
export const deployHookState = { lastTriggeredAt: null as Date | null, lastError: null as string | null, pending: false };

export function scheduleClientRebuild(reason: string) {
  if (!config.CLIENT_DEPLOY_HOOK_URL) return;
  reasons.add(reason);
  deployHookState.pending = true;
  clearTimeout(timer);
  timer = setTimeout(triggerNow, config.DEPLOY_HOOK_DEBOUNCE_SECONDS * 1000);
  timer.unref?.();
}

async function triggerNow() {
  const why = [...reasons].slice(0, 5).join(", ");
  reasons.clear();
  deployHookState.pending = false;
  try {
    const res = await fetch(config.CLIENT_DEPLOY_HOOK_URL!, { method: "POST" });
    if (!res.ok) throw new Error(`Deploy hook returned ${res.status}`);
    deployHookState.lastTriggeredAt = new Date();
    deployHookState.lastError = null;
    console.log(`Triggered client rebuild (${why})`);
  } catch (err) {
    deployHookState.lastError = err instanceof Error ? err.message : String(err);
    console.error("Client rebuild hook failed:", err);
  }
}
