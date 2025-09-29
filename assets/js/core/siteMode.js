const STORAGE_KEY = "secure_it_site_mode";
export const SITE_MODES = {
  ECOMMERCE: "ecommerce",
  BASIC: "basic",
};
export const SITE_MODE_EVENT = "site:mode";

let cachedMode;
let storageListenerBound = false;

function syncMode(mode) {
  const normalized = normalizeMode(mode);
  if (normalized === cachedMode) {
    return normalized;
  }
  cachedMode = normalized;
  applyMode(normalized);
  dispatchModeChange(normalized);
  return normalized;
}

function normalizeMode(value) {
  const mode = String(value || "").toLowerCase();
  if (mode === SITE_MODES.ECOMMERCE) return SITE_MODES.ECOMMERCE;
  if (mode === SITE_MODES.BASIC) return SITE_MODES.BASIC;
  return SITE_MODES.ECOMMERCE;
}

function readStoredMode() {
  let stored;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    stored = null;
  }
  if (!stored) {
    const envDefault = window.ENV?.site?.defaultMode;
    if (envDefault) {
      stored = envDefault;
    } else {
      stored = SITE_MODES.ECOMMERCE;
    }
  }
  return normalizeMode(stored);
}

function applyMode(mode) {
  if (typeof document === "undefined") return;
  const apply = () => {
    if (document.body) {
      document.body.dataset.siteMode = mode;
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }
}

function dispatchModeChange(mode) {
  if (typeof document === "undefined") return;
  const event = new CustomEvent(SITE_MODE_EVENT, { detail: { mode } });
  document.dispatchEvent(event);
}

export function getSiteMode() {
  if (!cachedMode) {
    cachedMode = readStoredMode();
  }
  return cachedMode;
}

export function isEcommerceEnabled() {
  return getSiteMode() === SITE_MODES.ECOMMERCE;
}

export function setSiteMode(mode) {
  const normalized = normalizeMode(mode);
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch (error) {
    /* ignore storage errors (private mode, etc.) */
  }
  return syncMode(normalized);
}

export function toggleSiteMode() {
  return setSiteMode(isEcommerceEnabled() ? SITE_MODES.BASIC : SITE_MODES.ECOMMERCE);
}

function bindStorageListener() {
  if (storageListenerBound || typeof window === "undefined") return;
  try {
    window.addEventListener("storage", (event) => {
      if (event.key && event.key !== STORAGE_KEY) return;
      syncMode(event.newValue);
    });
    storageListenerBound = true;
  } catch (error) {
    storageListenerBound = false;
  }
}

export function initSiteMode() {
  applyMode(getSiteMode());
  bindStorageListener();
}

export function renderEcommerceDisabled(options = {}) {
  const {
    title = "E-commerce features are disabled",
    description = "An administrator has switched the site to the normal experience. Enable e-commerce mode to access this section.",
    icon = "🛒",
  } = options;
  const main = document.getElementById("main") || document.querySelector("main");
  if (!main) return;
  const section = document.createElement("section");
  section.className = "container ecommerce-disabled";
  section.innerHTML = `
    ${icon ? `<div class="ecommerce-disabled__icon" aria-hidden="true">${icon}</div>` : ""}
    <h1>${title}</h1>
    <p>${description}</p>
  `;
  main.innerHTML = "";
  main.appendChild(section);
}
