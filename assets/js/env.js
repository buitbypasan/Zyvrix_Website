(function applyEnvironment() {
  const READY_EVENT = "secure-env-ready";

  function mergeEnvironment() {
    const base = window.ENV && typeof window.ENV === "object" ? window.ENV : {};
    const local =
      window.SECURE_ENV && typeof window.SECURE_ENV === "object"
        ? window.SECURE_ENV
        : {};
    window.ENV = Object.assign({}, base, local);
  }

  function emitReady(detail) {
    mergeEnvironment();
    window.__SECURE_ENV_READY__ = { ready: true, detail: detail || null };
    if (typeof document?.dispatchEvent === "function") {
      const EventCtor = typeof window.CustomEvent === "function"
        ? window.CustomEvent
        : function fallback(type, params) {
            const evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(type, false, false, params?.detail);
            return evt;
          };
      document.dispatchEvent(new EventCtor(READY_EVENT, { detail }));
    }
  }

  mergeEnvironment();

  if (window.SECURE_ENV && typeof window.SECURE_ENV === "object") {
    emitReady({ source: "preloaded" });
    return;
  }

  try {
    const currentScript = document?.currentScript;
    const localPath =
      currentScript?.dataset?.localSrc || currentScript?.getAttribute?.("data-local-src");
    const script = document.createElement("script");
    script.src = localPath || "assets/js/env.local.js";
    script.async = false;
    script.defer = false;
    script.onload = () => emitReady({ source: "local" });
    script.onerror = () => emitReady({ source: "missing" });
    (document.head || document.documentElement || document.body).appendChild(script);
  } catch (error) {
    emitReady({ source: "error", error });
  }
})();
