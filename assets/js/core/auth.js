import { byId } from "./utils.js";
import {
  isEcommerceEnabled,
  setSiteMode,
  SITE_MODE_EVENT,
  SITE_MODES,
} from "./siteMode.js";

const DEFAULT_NAMESPACE = "secure_it";
const DEFAULT_SESSION_TTL_HOURS = 72;
const AUTH_CHANGE_EVENT = "auth:change";
let authStatusTimeout;
let googleScriptPromise;
let activeGoogleContext = "login";
let googleAuthInitialized = false;
const envReadyState = {
  ready: Boolean(window.__SECURE_ENV_READY__?.ready),
  detail: window.__SECURE_ENV_READY__?.detail || null,
};

const ROLE_LABELS = {
  admin: "Admin",
  staff: "Staff",
  loyalty: "Loyalty customer",
  basic: "Basic customer",
};
const DEFAULT_ROLE = "basic";
const FORM_REQUIRED_DATA_ATTR = "authStoredRequired";
const AUTH_FALLBACK_ID = "authUnavailable";

function normalizeRole(role) {
  const value = String(role || "")
    .toLowerCase()
    .trim();
  if (value === "loyalty_customer" || value === "loyalty-customers") {
    return "loyalty";
  }
  if (value === "customer" || value === "basic customer") {
    return "basic";
  }
  if (ROLE_LABELS[value]) {
    return value;
  }
  return DEFAULT_ROLE;
}

function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRole(role)] || ROLE_LABELS[DEFAULT_ROLE];
}

function getRoleCodes() {
  const config = window.ENV?.auth?.roleCodes;
  if (!config || typeof config !== "object") return {};
  return Object.entries(config).reduce((map, [key, value]) => {
    if (!value) return map;
    map[normalizeRole(key)] = String(value).trim();
    return map;
  }, {});
}

function resolveRole(requestedRole, accessCode) {
  const codes = getRoleCodes();
  const trimmedCode = String(accessCode || "").trim();
  if (trimmedCode) {
    const match = Object.entries(codes).find(
      ([, code]) =>
        String(code || "").toLowerCase() === trimmedCode.toLowerCase()
    );
    if (match) {
      return normalizeRole(match[0]);
    }
  }
  const normalized = normalizeRole(requestedRole);
  if ((normalized === "admin" || normalized === "staff") && !trimmedCode) {
    return DEFAULT_ROLE;
  }
  return normalized;
}

function createRoleBadge(role) {
  const label = getRoleLabel(role);
  if (!label) return null;
  const badge = document.createElement("span");
  badge.className = "nav-user__role";
  badge.textContent = label;
  return badge;
}

function getDefaultRedirect(role, context = "login") {
  const normalized = normalizeRole(role);
  if (!isEcommerceEnabled()) return "index.html";
  if (normalized === "admin" || normalized === "staff") {
    return "index.html";
  }
  if (context === "signup") {
    return "checkout.html";
  }
  return "pricing.html";
}

function getConfig() {
  return window.ENV?.auth || {};
}

function getNamespace() {
  const ns = getConfig().storageNamespace || window.ENV?.database?.name;
  return (ns || DEFAULT_NAMESPACE).replace(/[^a-z0-9_\-]/gi, "_");
}

function getSessionTtlMs() {
  const hours = Number(
    getConfig().sessionTtlHours || DEFAULT_SESSION_TTL_HOURS
  );
  return Number.isFinite(hours)
    ? hours * 60 * 60 * 1000
    : DEFAULT_SESSION_TTL_HOURS * 60 * 60 * 1000;
}

function getGoogleConfig() {
  return window.ENV?.googleAuth || {};
}

function markEnvReady(detail) {
  envReadyState.ready = true;
  envReadyState.detail = detail || envReadyState.detail || null;
}

function getEnvReadyDetail() {
  return envReadyState.detail || {};
}

function renderGoogleStatus(slots, { buttonText, statusText }) {
  slots.forEach(({ container, status }) => {
    if (container) {
      container.innerHTML = "";
      if (buttonText) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn";
        button.disabled = true;
        button.textContent = buttonText;
        container.appendChild(button);
      }
    }
    if (status) status.textContent = statusText || "";
  });
}

function googleMissingStatusMessage(detail) {
  if (detail?.error) {
    return "Google sign-in configuration failed to load. Check the console for details.";
  }
  if (detail?.source === "missing") {
    return "Create assets/js/env.local.js and set googleAuth.clientId to enable Google sign-in.";
  }
  return "Set googleAuth.clientId in assets/js/env.local.js to enable Google sign-in.";
}

function loadGoogleScript() {
  if (googleScriptPromise) return googleScriptPromise;
  if (window.google?.accounts?.id) {
    googleScriptPromise = Promise.resolve(window.google);
    return googleScriptPromise;
  }
  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

function decodeJwt(token) {
  try {
    const part = token?.split(".")?.[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    try {
      return JSON.parse(decoded);
    } catch (error) {
      const json = decodeURIComponent(
        decoded
          .split("")
          .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
      );
      return JSON.parse(json);
    }
  } catch (error) {
    return null;
  }
}

function storageKeys() {
  const ns = getNamespace();
  return {
    session: `${ns}_session`,
  };
}

function loadSession() {
  const { session } = storageKeys();
  try {
    const raw = localStorage.getItem(session);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Unable to parse stored session", error);
    return null;
  }
}

function saveSession(session) {
  const { session: key } = storageKeys();
  localStorage.setItem(key, JSON.stringify(session));
}

function clearSession() {
  const { session } = storageKeys();
  localStorage.removeItem(session);
}

function sessionExpired(session) {
  if (!session?.customer) return true;
  if (session.expiresAt) {
    const expires = new Date(session.expiresAt).getTime();
    if (!Number.isNaN(expires)) {
      return Date.now() > expires;
    }
  }
  if (session.createdAt) {
    const created = new Date(session.createdAt).getTime();
    if (!Number.isNaN(created)) {
      return Date.now() > created + getSessionTtlMs();
    }
  }
  return true;
}

function normalizeCustomer(customer) {
  if (!customer) return null;
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    role: normalizeRole(customer.role),
  };
}

function startSession(payload) {
  if (!payload) return;
  const baseSession = payload.customer ? payload : { customer: payload };
  const customer = normalizeCustomer(baseSession.customer);
  if (!customer?.id) return;
  const createdDate = (() => {
    try {
      return baseSession.createdAt
        ? new Date(baseSession.createdAt)
        : new Date();
    } catch (error) {
      return new Date();
    }
  })();
  const createdAt = Number.isNaN(createdDate.getTime())
    ? new Date()
    : createdDate;
  const expiresAt = (() => {
    if (baseSession.expiresAt) {
      const parsed = new Date(baseSession.expiresAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date(createdAt.getTime() + getSessionTtlMs());
  })();
  const session = {
    token: baseSession.token || null,
    provider: baseSession.provider || null,
    customer,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  saveSession(session);
  notifyAuthChange(customer);
}

function getAuthEndpoint(path = "", baseOverride) {
  const base = (baseOverride || getConfig().endpoint || "/api/auth").trim();
  try {
    const url = new URL(base, window.location.origin);
    const normalizedPath = path.replace(/^\/+/, "");
    if (normalizedPath) {
      url.pathname = `${url.pathname.replace(/\/$/, "")}/${normalizedPath}`;
    }
    return url.toString();
  } catch (error) {
    const normalizedBase = base.replace(/\/$/, "");
    const normalizedPath = path.replace(/^\/+/, "");
    return normalizedPath
      ? `${normalizedBase}/${normalizedPath}`
      : normalizedBase;
  }
}

function getFallbackAuthEndpoint(path = "") {
  const base = (getConfig().endpoint || "/api/auth").trim();
  const normalized = base.replace(/\/+$/, "");
  if (/\/public\/index\.php/i.test(normalized)) {
    return null;
  }
  if (!/\/api\/auth$/i.test(normalized)) {
    return null;
  }
  const fallbackBase = normalized.replace(
    /\/api\/auth$/i,
    "/api/public/index.php/api/auth"
  );
  if (fallbackBase === normalized) {
    return null;
  }
  return getAuthEndpoint(path, fallbackBase);
}

async function postAuth(path, payload) {
  const endpoint = getAuthEndpoint(path);
  const attempt = async (url) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload || {}),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        const error =
          data.error || `Request failed with status ${response.status}`;
        return { ok: false, status: response.status, error };
      }
      return { ok: true, status: response.status, data };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error?.message || "Unable to reach the authentication service.",
      };
    }
  };

  let result = await attempt(endpoint);
  if (!result.ok && (result.status === 404 || result.status === 405)) {
    const fallback = getFallbackAuthEndpoint(path);
    if (fallback && fallback !== endpoint) {
      result = await attempt(fallback);
    }
  }

  return result;
}

async function createCustomer({ name, email, password, role, accessCode }) {
  const result = await postAuth("signup", {
    name,
    email,
    password,
    role,
    accessCode,
  });
  if (!result.ok) {
    return {
      ok: false,
      error: result.error || "Unable to create your account. Please try again.",
    };
  }
  const payload = result.data || {};
  const session = payload.session || null;
  const customer = normalizeCustomer(payload.customer || session?.customer);
  if (!customer) {
    return {
      ok: false,
      error: "Account created but response was missing customer details.",
    };
  }
  return { ok: true, customer, session };
}

async function authenticate({ email, password }) {
  const result = await postAuth("login", { email, password });
  if (!result.ok) {
    return {
      ok: false,
      error: result.error || "Unable to log in with those credentials.",
    };
  }
  const payload = result.data || {};
  const session = payload.session || null;
  const customer = normalizeCustomer(payload.customer || session?.customer);
  if (!customer) {
    return {
      ok: false,
      error: "Login response did not include customer details.",
    };
  }
  return { ok: true, customer, session };
}

async function upsertProviderCustomer({ name, email, provider = "google" }) {
  const result = await postAuth("provider", { name, email, provider });
  if (!result.ok) {
    return {
      ok: false,
      error: result.error || "Unable to sign in with your provider.",
    };
  }
  const payload = result.data || {};
  const session = payload.session || null;
  const customer = normalizeCustomer(payload.customer || session?.customer);
  if (!customer) {
    return {
      ok: false,
      error: "Provider sign-in response was missing customer information.",
    };
  }
  return { ok: true, customer, session };
}

function notifyAuthChange(customer) {
  document.dispatchEvent(
    new CustomEvent(AUTH_CHANGE_EVENT, { detail: { customer } })
  );
}

export function getCurrentCustomer() {
  const session = loadSession();
  if (!session) {
    return null;
  }
  if (sessionExpired(session)) {
    clearSession();
    notifyAuthChange(null);
    return null;
  }
  return normalizeCustomer(session.customer);
}

export async function logoutCustomer() {
  const session = loadSession();
  clearSession();
  notifyAuthChange(null);
  if (session?.token) {
    await postAuth("logout", { token: session.token });
  }
}

function ensureSlots() {
  const wrap = document.querySelector(".nav-wrap");
  if (!wrap) return {};
  let actions = wrap.querySelector(".nav-actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "nav-actions";
    wrap.appendChild(actions);
  }
  let adminSlot = actions.querySelector("[data-admin-slot]");
  if (!adminSlot) {
    adminSlot = document.createElement("div");
    adminSlot.className = "nav-actions__slot nav-actions__slot--admin";
    adminSlot.setAttribute("data-admin-slot", "");
    actions.prepend(adminSlot);
  }
  let cartSlot = actions.querySelector("[data-cart-slot]");
  if (!cartSlot) {
    cartSlot = document.createElement("div");
    cartSlot.className = "nav-actions__slot nav-actions__slot--cart";
    cartSlot.setAttribute("data-cart-slot", "");
    actions.appendChild(cartSlot);
  }
  let authSlot = actions.querySelector("[data-auth-slot]");
  if (!authSlot) {
    authSlot = document.createElement("div");
    authSlot.className = "nav-actions__slot nav-actions__slot--auth";
    authSlot.setAttribute("data-auth-slot", "");
    actions.appendChild(authSlot);
  }
  return { actions, adminSlot, cartSlot, authSlot };
}

function ensureMobileActionsContainer() {
  const mobileNav = document.getElementById("mobileNav");
  if (!mobileNav) return null;
  let actions = mobileNav.querySelector("[data-mobile-actions]");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "mobile-nav__actions";
    actions.setAttribute("data-mobile-actions", "");
    mobileNav.appendChild(actions);
  }
  return actions;
}

function renderMobileAuth(customer) {
  const actions = ensureMobileActionsContainer();
  if (!actions) return;
  actions.querySelectorAll("[data-auth-nav]").forEach((item) => item.remove());
  const ecommerceEnabled = isEcommerceEnabled();
  if (!customer && !ecommerceEnabled) {
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-auth-nav", "");
  wrapper.className = "mobile-auth";
  if (customer) {
    const firstName = (customer.name || "Customer").split(" ")[0];
    const greeting = document.createElement("p");
    greeting.className = "mobile-auth__greeting nav-user";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = `Hi, ${firstName}`;
    greeting.appendChild(nameSpan);
    const badge = createRoleBadge(customer.role);
    if (badge) greeting.appendChild(badge);
    const logout = document.createElement("button");
    logout.type = "button";
    logout.className = "btn btn-ghost";
    logout.setAttribute("data-auth-action", "logout");
    logout.textContent = "Log out";
    wrapper.append(greeting, logout);
  } else if (ecommerceEnabled) {
    const login = document.createElement("a");
    login.className = "btn btn-ghost";
    login.href = "login.html";
    login.textContent = "Log in";
    const signup = document.createElement("a");
    signup.className = "btn";
    signup.href = "signup.html";
    signup.textContent = "Create account";
    wrapper.append(login, signup);
  }
  actions.appendChild(wrapper);
}

function renderMobileAdminControls(customer) {
  const actions = ensureMobileActionsContainer();
  if (!actions) return;
  actions.querySelectorAll("[data-admin-nav]").forEach((item) => item.remove());
  if (!customer || normalizeRole(customer.role) !== "admin") return;
  const block = document.createElement("div");
  block.className = "mobile-admin";
  block.setAttribute("data-admin-nav", "");
  const label = document.createElement("p");
  label.className = "mobile-admin__label";
  label.textContent = isEcommerceEnabled()
    ? "Mode: E-commerce"
    : "Mode: Normal site";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "btn btn-ghost";
  toggle.setAttribute(
    "data-site-mode-toggle",
    isEcommerceEnabled() ? SITE_MODES.BASIC : SITE_MODES.ECOMMERCE
  );
  toggle.textContent = isEcommerceEnabled()
    ? "Switch to normal site"
    : "Enable e-commerce";
  block.append(label, toggle);
  actions.prepend(block);
}

function renderAdminControls(customer = getCurrentCustomer()) {
  const { adminSlot } = ensureSlots();
  if (!adminSlot) return;
  adminSlot.innerHTML = "";
  if (!customer || normalizeRole(customer.role) !== "admin") {
    adminSlot.setAttribute("hidden", "hidden");
    renderMobileAdminControls(null);
    return;
  }
  adminSlot.removeAttribute("hidden");
  const modeLabel = document.createElement("span");
  modeLabel.className = "nav-mode";
  modeLabel.textContent = isEcommerceEnabled()
    ? "Mode: E-commerce"
    : "Mode: Normal site";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "btn btn-ghost";
  toggle.setAttribute(
    "data-site-mode-toggle",
    isEcommerceEnabled() ? SITE_MODES.BASIC : SITE_MODES.ECOMMERCE
  );
  toggle.textContent = isEcommerceEnabled()
    ? "Switch to normal site"
    : "Enable e-commerce";
  adminSlot.append(modeLabel, toggle);
  renderMobileAdminControls(customer);
}

function handleModeToggle(event) {
  const toggle = event.target.closest("[data-site-mode-toggle]");
  if (!toggle) return;
  const customer = getCurrentCustomer();
  if (!customer || normalizeRole(customer.role) !== "admin") return;
  event.preventDefault();
  const requested = toggle.getAttribute("data-site-mode-toggle");
  const targetMode =
    requested === SITE_MODES.BASIC ? SITE_MODES.BASIC : SITE_MODES.ECOMMERCE;
  setSiteMode(targetMode);
  showAuthStatus(
    targetMode === SITE_MODES.BASIC
      ? "Switched to the normal site experience."
      : "E-commerce experience enabled."
  );
  const mobileNav = document.getElementById("mobileNav");
  const mobileToggle = document.getElementById("mobileNavToggle");
  if (mobileNav?.classList.contains("is-open")) {
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("hidden", "hidden");
    document.body.classList.remove("nav-open");
    if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
  }
  setTimeout(() => {
    window.location.reload();
  }, 220);
}

function ensureAuthStatus() {
  let status = byId("authStatus");
  if (!status) {
    status = document.createElement("div");
    status.id = "authStatus";
    status.className = "auth-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    document.body.appendChild(status);
  }
  return status;
}

function showAuthStatus(message) {
  const status = ensureAuthStatus();
  status.textContent = message;
  status.classList.add("is-visible");
  clearTimeout(authStatusTimeout);
  authStatusTimeout = setTimeout(() => {
    status.classList.remove("is-visible");
  }, 2400);
}

function showAuthModeNotice(message) {
  const notice = byId("authModeNotice");
  if (!notice) return;
  if (message) {
    notice.hidden = false;
    notice.textContent = message;
  } else {
    notice.hidden = true;
    notice.textContent = "";
  }
}

function getAuthUnavailableMessage(context = "login") {
  return context === "signup"
    ? "Account creation is available when the e-commerce experience is enabled."
    : "Customer logins are available when the e-commerce experience is enabled.";
}

function getAuthFallbackCopy(context = "login") {
  if (context === "signup") {
    return {
      title: "Account creation unavailable",
      description:
        "Switch to the e-commerce experience to create an account and save your checkout progress.",
    };
  }
  return {
    title: "Customer login unavailable",
    description:
      "Switch to the e-commerce experience to access saved carts and manage billing securely.",
  };
}

function showAuthUnavailableFallback(context = "login") {
  const main =
    document.getElementById("main") || document.querySelector("main");
  if (!main) return;
  const copy = getAuthFallbackCopy(context);
  let fallback = document.getElementById(AUTH_FALLBACK_ID);
  if (!fallback) {
    fallback = document.createElement("section");
    fallback.id = AUTH_FALLBACK_ID;
    fallback.className = "container ecommerce-disabled";
    fallback.setAttribute("role", "status");
    const authCard = main.querySelector(".auth-card");
    if (authCard?.insertAdjacentElement) {
      authCard.insertAdjacentElement("afterend", fallback);
    } else {
      main.appendChild(fallback);
    }
  }
  fallback.innerHTML = `
    <div class="ecommerce-disabled__icon" aria-hidden="true">🔒</div>
    <h1>${copy.title}</h1>
    <p>${copy.description}</p>
    <p class="muted">${getAuthUnavailableMessage(context)}</p>
  `;
  fallback.hidden = false;
}

function hideAuthUnavailableFallback() {
  const fallback = document.getElementById(AUTH_FALLBACK_ID);
  if (fallback) {
    fallback.hidden = true;
  }
}

function updateAuthPageAvailabilityState(available) {
  const page = document.body?.dataset?.page || "";
  if (page !== "login" && page !== "signup") return;
  const authCard = document.querySelector(".auth-card");
  if (authCard) {
    authCard.toggleAttribute("hidden", !available);
  }
  if (!available) {
    showAuthUnavailableFallback(page);
  } else {
    hideAuthUnavailableFallback();
  }
}

function toggleFormAvailability(form, status, available, message) {
  if (!form) return;
  const controls = form.querySelectorAll("input, button, select, textarea");
  controls.forEach((control) => {
    if (control.type === "hidden") return;
    if (!available) {
      if (control.required) {
        control.dataset[FORM_REQUIRED_DATA_ATTR] = "true";
      }
      control.required = false;
      control.disabled = true;
      control.setAttribute("aria-disabled", "true");
    } else {
      control.disabled = false;
      if (control.dataset[FORM_REQUIRED_DATA_ATTR] === "true") {
        control.required = true;
      }
      control.removeAttribute("aria-disabled");
    }
  });
  form.toggleAttribute("aria-disabled", !available);
  if (status) {
    status.textContent = available ? "" : message;
  }
}

function updateAuthFormsAvailability() {
  const available = isEcommerceEnabled();
  const loginForm = byId("loginForm");
  const signupForm = byId("signupForm");
  const loginStatus = byId("loginStatus");
  const signupStatus = byId("signupStatus");
  const loginMessage = getAuthUnavailableMessage("login");
  const signupMessage = getAuthUnavailableMessage("signup");

  if (loginForm) {
    toggleFormAvailability(loginForm, loginStatus, available, loginMessage);
  }
  if (signupForm) {
    toggleFormAvailability(signupForm, signupStatus, available, signupMessage);
  }

  document
    .querySelectorAll(".auth-provider")
    .forEach((provider) => provider.toggleAttribute("hidden", !available));

  if (available && !googleAuthInitialized) {
    initGoogleAuth();
  }

  let noticeMessage = null;
  if (!available) {
    noticeMessage = signupForm ? signupMessage : loginMessage;
  }
  showAuthModeNotice(noticeMessage);
  updateAuthPageAvailabilityState(available);
}

function renderAuthControls() {
  const { authSlot } = ensureSlots();
  if (!authSlot) return;
  const customer = getCurrentCustomer();
  authSlot.innerHTML = "";
  const ecommerceEnabled = isEcommerceEnabled();
  if (!customer && !ecommerceEnabled) {
    authSlot.setAttribute("hidden", "hidden");
    renderAdminControls(customer);
    renderMobileAuth(customer);
    return;
  }
  authSlot.removeAttribute("hidden");
  if (customer) {
    const firstName = (customer.name || "Customer").split(" ")[0];
    const info = document.createElement("div");
    info.className = "nav-user__wrap";
    const greeting = document.createElement("span");
    greeting.className = "nav-user";
    greeting.textContent = `Hi, ${firstName}`;
    info.appendChild(greeting);
    const badge = createRoleBadge(customer.role);
    if (badge) info.appendChild(badge);
    authSlot.appendChild(info);
    const logout = document.createElement("button");
    logout.type = "button";
    logout.className = "btn btn-ghost";
    logout.setAttribute("data-auth-action", "logout");
    logout.textContent = "Log out";
    authSlot.appendChild(logout);
  } else {
    if (!ecommerceEnabled) {
      authSlot.setAttribute("hidden", "hidden");
      renderAdminControls(customer);
      renderMobileAuth(customer);
      return;
    }
    const login = document.createElement("a");
    login.className = "btn btn-ghost";
    login.href = "login.html";
    login.textContent = "Log in";
    authSlot.appendChild(login);
    const signup = document.createElement("a");
    signup.className = "btn";
    signup.href = "signup.html";
    signup.textContent = "Create account";
    authSlot.appendChild(signup);
  }
  renderAdminControls(customer);
  renderMobileAuth(customer);
}

function safeRedirect(target) {
  if (!target) return null;
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname.replace(/^\//, "")}${url.search}${url.hash}`;
  } catch (error) {
    return null;
  }
}

function getRedirectParam() {
  const params = new URLSearchParams(window.location.search);
  return safeRedirect(params.get("redirect"));
}

function handleSignup() {
  const form = byId("signupForm");
  if (!form) return;
  const status = byId("signupStatus");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isEcommerceEnabled()) {
      const message = getAuthUnavailableMessage("signup");
      if (status) status.textContent = message;
      showAuthModeNotice(message);
      return;
    }
    if (typeof form.reportValidity === "function" && !form.reportValidity()) {
      return;
    }
    const name = form.fullname?.value.trim();
    const email = form.email?.value.trim();
    const password = form.password?.value || "";
    const confirm = form.confirm?.value || "";
    const roleSelection = form.role?.value || DEFAULT_ROLE;
    const accessCode = form.accessCode?.value || "";
    if (!name) {
      if (status) status.textContent = "Please provide your full name.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
      if (status) status.textContent = "Enter a valid email address.";
      return;
    }
    if (password.length < 8) {
      if (status)
        status.textContent = "Password must be at least 8 characters.";
      return;
    }
    if (password !== confirm) {
      if (status) status.textContent = "Passwords do not match.";
      return;
    }
    if (status) status.textContent = "Creating your account…";
    const result = await createCustomer({
      name,
      email,
      password,
      role: roleSelection,
      accessCode,
    });
    if (!result.ok) {
      if (status) status.textContent = result.error;
      return;
    }
    startSession(result.session || result.customer);
    if (status)
      status.textContent = `Account created! Signed in as ${getRoleLabel(
        result.customer.role
      )}. Redirecting…`;
    const redirect =
      getRedirectParam() || getDefaultRedirect(result.customer.role, "signup");
    setTimeout(() => {
      window.location.href = redirect;
    }, 800);
  });
}

function handleLogin() {
  const form = byId("loginForm");
  if (!form) return;
  const status = byId("loginStatus");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isEcommerceEnabled()) {
      const message = getAuthUnavailableMessage("login");
      if (status) status.textContent = message;
      showAuthModeNotice(message);
      return;
    }
    if (typeof form.reportValidity === "function" && !form.reportValidity()) {
      return;
    }
    const email = form.email?.value.trim();
    const password = form.password?.value || "";
    if (status) status.textContent = "Signing you in…";
    const result = await authenticate({ email, password });
    if (!result.ok) {
      if (status) status.textContent = result.error;
      return;
    }
    startSession(result.session || result.customer);
    if (status)
      status.textContent = `Welcome back, ${getRoleLabel(
        result.customer.role
      )}! Redirecting…`;
    const redirect =
      getRedirectParam() || getDefaultRedirect(result.customer.role);
    setTimeout(() => {
      window.location.href = redirect;
    }, 600);
  });
}

function handleLogoutClicks() {
  document.addEventListener("click", async (event) => {
    const trigger = event.target.closest("[data-auth-action='logout']");
    if (!trigger) return;
    event.preventDefault();
    await logoutCustomer();
    const mobileNav = document.getElementById("mobileNav");
    const mobileToggle = document.getElementById("mobileNavToggle");
    if (mobileNav?.classList.contains("is-open")) {
      mobileNav.classList.remove("is-open");
      mobileNav.setAttribute("hidden", "hidden");
      document.body.classList.remove("nav-open");
      if (mobileToggle) {
        mobileToggle.setAttribute("aria-expanded", "false");
      }
    }
    showAuthStatus("You have been signed out.");
    if (/checkout|payment/.test(window.location.pathname)) {
      window.location.href = "login.html?redirect=checkout.html";
    }
  });
}

async function handleGoogleCredential(response, context = "login") {
  const loginStatus = byId("googleLoginStatus");
  const signupStatus = byId("googleSignupStatus");
  const status = context === "signup" ? signupStatus : loginStatus;
  if (response?.error) {
    if (status) status.textContent = `Google sign-in error: ${response.error}`;
    return;
  }
  if (!response?.credential) {
    if (status) status.textContent = "Google sign-in was cancelled.";
    return;
  }
  const profile = decodeJwt(response.credential);
  if (!profile?.email) {
    if (status)
      status.textContent =
        "Google did not return an email address. Enable the email scope for your Google client.";
    return;
  }
  const fullName =
    profile.name ||
    `${profile.given_name || ""} ${profile.family_name || ""}`.trim() ||
    profile.email;
  if (status) status.textContent = "Signing in with Google…";
  const result = await upsertProviderCustomer({
    name: fullName,
    email: profile.email,
    provider: "google",
  });
  if (!result.ok) {
    if (status)
      status.textContent = result.error || "Unable to sign in with Google.";
    return;
  }
  startSession(result.session || result.customer);
  if (status)
    status.textContent = `Signed in with Google as ${getRoleLabel(
      result.customer.role
    )}. Redirecting…`;
  const redirect =
    getRedirectParam() ||
    getDefaultRedirect(
      result.customer.role,
      context === "signup" ? "signup" : "login"
    );
  setTimeout(() => {
    window.location.href = redirect;
  }, 600);
}

function initGoogleAuth() {
  if (!isEcommerceEnabled()) {
    return;
  }
  const slots = [
    {
      container: byId("googleLogin"),
      status: byId("googleLoginStatus"),
      context: "login",
    },
    {
      container: byId("googleSignup"),
      status: byId("googleSignupStatus"),
      context: "signup",
    },
  ].filter((entry) => entry.container);
  if (!slots.length) return;

  const config = getGoogleConfig();
  const clientId = config.clientId || config.client_id || "";
  const missingClient = !clientId || /replace/i.test(clientId);

  if (googleAuthInitialized) {
    return;
  }

  if (missingClient) {
    if (!envReadyState.ready && !clientId) {
      renderGoogleStatus(slots, {
        buttonText: "Loading Google sign-in…",
        statusText: "Loading Google sign-in configuration…",
      });
    } else {
      renderGoogleStatus(slots, {
        buttonText: "Google sign-in unavailable",
        statusText: googleMissingStatusMessage(getEnvReadyDetail()),
      });
    }
    return;
  }

  config.clientId = clientId;

  slots.forEach(({ container, status }) => {
    if (container) container.innerHTML = "";
    if (status) status.textContent = "";
  });

  googleAuthInitialized = true;

  loadGoogleScript()
    .then((google) => {
      if (!google?.accounts?.id) {
        throw new Error("Google Identity Services are unavailable.");
      }
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) =>
          handleGoogleCredential(response, activeGoogleContext),
        auto_select: Boolean(config.autoSelect),
        cancel_on_tap_outside: true,
      });
      slots.forEach(({ container, status, context }) => {
        if (!container) return;
        google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: context === "signup" ? "signup_with" : "signin_with",
          logo_alignment: "center",
          click_listener: () => {
            activeGoogleContext = context;
            if (status) status.textContent = "Opening Google sign-in…";
          },
        });
        if (status) status.textContent = "";
      });
    })
    .catch((error) => {
      googleAuthInitialized = false;
      renderGoogleStatus(slots, {
        buttonText: "Google sign-in unavailable",
        statusText:
          error?.message ||
          "Google sign-in could not be initialised. Check your network connection.",
      });
    });
}

function handleSecureEnvReady(event) {
  markEnvReady(event?.detail || null);
  renderDatabaseNotice();
  if (!googleAuthInitialized) {
    initGoogleAuth();
  }
}

function renderDatabaseNotice() {
  const notice = byId("dbConfigNotice");
  if (!notice) return;
  const db = window.ENV?.database;
  notice.innerHTML = "";
  notice.className = "auth-db callout";
  if (!db) {
    notice.classList.add("callout--warning");
    notice.textContent =
      "Add database connection variables to assets/js/env.local.js before deploying.";
    return;
  }
  const missing = ["host", "port", "name", "user"].filter((key) => !db[key]);
  if (missing.length) {
    notice.classList.add("callout--warning");
    notice.textContent = `Database configuration incomplete: ${missing.join(
      ", "
    )}. Update assets/js/env.local.js.`;
  } else {
    notice.classList.add("callout--info");
    notice.textContent =
      "Database credentials are loaded securely from your server environment.";
  }
  if (db.passwordEnvVar) {
    const hint = document.createElement("p");
    hint.className = "muted";
    hint.textContent = `Store the database password in the ${db.passwordEnvVar} environment variable.`;
    notice.appendChild(hint);
  }
}

export function requireAuth(redirectTo, allowedRoles = []) {
  const customer = getCurrentCustomer();
  if (!customer) {
    const fallback =
      safeRedirect(redirectTo) || getDefaultRedirect(DEFAULT_ROLE, "signup");
    const url = new URL("login.html", window.location.origin);
    url.searchParams.set("redirect", fallback);
    window.location.href = `${url.pathname}${url.search}`;
    return null;
  }
  const permitted = Array.isArray(allowedRoles)
    ? allowedRoles.map((role) => normalizeRole(role)).filter(Boolean)
    : [];
  if (permitted.length && !permitted.includes(normalizeRole(customer.role))) {
    showAuthStatus("You do not have permission to view that page.");
    setTimeout(() => {
      window.location.href = getDefaultRedirect(customer.role);
    }, 640);
    return null;
  }
  return customer;
}

export function initAuth() {
  ensureSlots();
  renderAuthControls();
  renderDatabaseNotice();
  handleSignup();
  handleLogin();
  handleLogoutClicks();
  updateAuthFormsAvailability();
  initGoogleAuth();
  if (envReadyState.ready) {
    handleSecureEnvReady({ detail: envReadyState.detail });
  }
  document.addEventListener(AUTH_CHANGE_EVENT, () => {
    renderAuthControls();
    updateAuthFormsAvailability();
  });
  document.addEventListener(AUTH_CHANGE_EVENT, renderDatabaseNotice);
  document.addEventListener("secure-env-ready", handleSecureEnvReady);
  document.addEventListener("click", handleModeToggle);
  document.addEventListener(SITE_MODE_EVENT, () => {
    renderAuthControls();
    updateAuthFormsAvailability();
  });
}
