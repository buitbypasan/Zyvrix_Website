import { hydrateSite } from "./core/hydrator.js";
import { initThemeToggle } from "./core/theme.js";
import { initCookieBanner } from "./core/cookies.js";
import { initScrollReveal, initHeaderScrollEffect } from "./core/effects.js";
import { bindContact, initQuoteGenerator } from "./core/forms.js";
import { initPageLoader } from "./features/loader.js";
import { initMobileNav } from "./core/navigation.js";
import { initAuth } from "./core/auth.js";
import { initCart } from "./core/cart.js";
import { initPerformance } from "./core/performance.js";
import { initSiteMode } from "./core/siteMode.js";

initThemeToggle();
initCookieBanner();
initPageLoader();
initSiteMode();

document.addEventListener("DOMContentLoaded", () => {
  if (!window.DATA) return;
  const pageKey = document.body?.dataset?.page || "home";
  hydrateSite(window.DATA);
  initPerformance(pageKey);
  initAuth();
  initCart(window.DATA);
  initMobileNav();
  initScrollReveal();
  initHeaderScrollEffect();
  initQuoteGenerator(window.DATA);
  bindContact("contactForm", "contactStatus", "contact");
  bindContact("contactForm2", "contactStatus2", "contact");
  bindContact("quoteForm", "quoteStatus", "quote");
});
