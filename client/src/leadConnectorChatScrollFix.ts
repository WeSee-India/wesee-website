/**
 * LeadConnector injects `<chat-widget>` (Stencil) with nested shadow roots (e.g. ion-content).
 * Lenis `prevent` only walks one path; native scroll chaining still moves the page unless
 * scroll containers use overscroll-behavior: contain — we apply that inside shadow trees.
 */

function applyOverscrollContain(root: ParentNode) {
  const visit = (node: Node) => {
    if (node instanceof HTMLElement) {
      const cs = getComputedStyle(node);
      const y = ["auto", "scroll", "overlay"].includes(cs.overflowY);
      const x = ["auto", "scroll", "overlay"].includes(cs.overflowX);
      if (y || x) {
        if (
          node.scrollHeight > node.clientHeight + 1 ||
          node.scrollWidth > node.clientWidth + 1
        ) {
          node.style.overscrollBehavior = "contain";
        }
      }
      if (node.shadowRoot) {
        visit(node.shadowRoot);
      }
    }
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) visit(child);
    });
  };
  visit(root);
}

let raf = 0;
function scheduleApply(host: HTMLElement) {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const sr = host.shadowRoot;
    if (sr) applyOverscrollContain(sr);
  });
}

function markChatWidget(host: HTMLElement) {
  if (host.tagName !== "CHAT-WIDGET") return;
  host.setAttribute("data-lenis-prevent-wheel", "");
  scheduleApply(host);
  const sr = host.shadowRoot;
  if (!sr) return;
  new MutationObserver(() => scheduleApply(host)).observe(sr, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });
}

export function installLeadConnectorChatScrollFix() {
  document.querySelectorAll("chat-widget").forEach((el) => {
    if (el instanceof HTMLElement) markChatWidget(el);
  });

  new MutationObserver((records) => {
    for (const rec of records) {
      Array.from(rec.addedNodes).forEach((n) => {
        if (n instanceof HTMLElement) {
          if (n.tagName === "CHAT-WIDGET") markChatWidget(n);
          Array.from(n.querySelectorAll("chat-widget")).forEach((w) => {
            if (w instanceof HTMLElement) markChatWidget(w);
          });
        }
      });
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}
