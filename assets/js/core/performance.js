const IDLE =
  typeof window !== "undefined" && window.requestIdleCallback
    ? window.requestIdleCallback.bind(window)
    : (callback) => setTimeout(callback, 200);

function applyLazyAttributes() {
  if (typeof document === "undefined") return;
  document.querySelectorAll("img:not([loading])").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });
  document.querySelectorAll("iframe:not([loading])").forEach((frame) => {
    frame.setAttribute("loading", "lazy");
  });
}

function prefetchRoutes(pageKey) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const seoContent = window.DATA?.seoContent || {};
  const head = document.head;
  if (!head) return;
  const currentPath = pageKey === "home" ? "index.html" : `${pageKey}.html`;
  const existing = new Set(
    Array.from(head.querySelectorAll("link[rel='prefetch']")).map((link) => link.href)
  );
  const targets = Object.values(seoContent)
    .map((meta) => meta?.path)
    .filter(Boolean)
    .filter((path) => path !== currentPath)
    .slice(0, 5);
  targets.forEach((path) => {
    const url = new URL(path, window.location.href);
    if (existing.has(url.href)) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url.href;
    link.as = "document";
    head.appendChild(link);
  });
}

export function initPerformance(pageKey) {
  if (typeof window === "undefined") return;
  applyLazyAttributes();
  IDLE(() => {
    applyLazyAttributes();
    prefetchRoutes(pageKey);
  });
  window.addEventListener("load", applyLazyAttributes, { once: true });
}
