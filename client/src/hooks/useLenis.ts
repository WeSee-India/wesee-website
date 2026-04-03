import { useEffect } from "react";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

/** LeadConnector/GHL chat (`<chat-widget>`) lives in the same document; Lenis must not smooth-scroll the page when the wheel targets that subtree (including shadow roots). */
function isInsideChatWidget(node: HTMLElement): boolean {
  let el: HTMLElement | null = node;
  while (el) {
    if (el.tagName === "CHAT-WIDGET") return true;
    const root = el.getRootNode();
    if (root instanceof ShadowRoot) {
      el = root.host as HTMLElement;
      continue;
    }
    el = el.parentElement;
  }
  return false;
}

/** Runs before Lenis slices `composedPath` — blocks smooth scroll when the gesture targets the chat widget (more reliable than `prevent` alone). */
function lenisShouldIgnoreEvent(event: Event): boolean {
  for (const n of event.composedPath()) {
    if (!(n instanceof Element)) continue;
    if (n.tagName === "CHAT-WIDGET") return true;
    if (
      n instanceof HTMLIFrameElement &&
      typeof n.src === "string" &&
      n.src.includes("leadconnectorhq")
    ) {
      return true;
    }
  }
  return false;
}

export function useLenis() {
  useEffect(() => {
    if (lenisInstance) return;

    lenisInstance = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      prevent: (node) => isInsideChatWidget(node),
      virtualScroll: ({ event }) => {
        if (lenisShouldIgnoreEvent(event)) return false;
        return true;
      },
    });

    function raf(time: number) {
      lenisInstance?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // Don't destroy on unmount since it's a singleton
    };
  }, []);

  return lenisInstance;
}

export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: false });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
