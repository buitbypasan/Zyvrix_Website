import { telHref, byId } from "./utils.js";
import { updateHeadMeta, injectOrganizationSchema, injectServiceSchema } from "./meta.js";
import { renderHomePage } from "../renderers/home.js";
import { renderAboutPage } from "../renderers/about.js";
import { renderPricingPage, renderCompareTable } from "../renderers/pricing.js";
import { renderContactPage } from "../renderers/contact.js";
import { renderMessagePage } from "../renderers/message.js";
import { renderCheckoutPage } from "../renderers/checkout.js";
import { renderPaymentPage } from "../renderers/payment.js";
import { renderDetailPage } from "../renderers/detail.js";
import { renderLegalPage } from "../renderers/legal.js";
import { isEcommerceEnabled } from "./siteMode.js";

export function hydrateSite(data) {
  const pageKey = document.body?.dataset?.page || "home";
  applyBranding(data);
  applyNavigation(data, pageKey);
  applyFooter(data);
  updateHeadMeta(data, pageKey);
  injectOrganizationSchema(data);
  injectServiceSchema(data);
  renderPage(pageKey, data);
}

function applyBranding(data) {
  document
    .querySelectorAll("[data-bind='brandName']")
    .forEach((el) => (el.textContent = data.org?.name || ""));
  const taglineEl = document.querySelector("[data-bind='brandTagline']");
  if (taglineEl) taglineEl.textContent = data.org?.tagline || "";
}

function applyNavigation(data, pageKey) {
  const nav = document.getElementById("primaryNav");
  const mobileNav = document.getElementById("mobileNav");
  let mobileLinks;
  if (!nav) return;
  nav.innerHTML = "";
  if (mobileNav) {
    mobileNav.innerHTML = "";
    mobileNav.setAttribute("hidden", "hidden");
    mobileNav.classList.remove("is-open");
    mobileLinks = document.createElement("div");
    mobileLinks.className = "mobile-nav__links";
    mobileLinks.setAttribute("data-mobile-links", "");
    mobileNav.appendChild(mobileLinks);
    const mobileActions = document.createElement("div");
    mobileActions.className = "mobile-nav__actions";
    mobileActions.setAttribute("data-mobile-actions", "");
    mobileNav.appendChild(mobileActions);
  }
  (data.navigation || [])
    .filter((item) => isEcommerceEnabled() || !item.requiresEcommerce)
    .forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      const currentPath = pageKey === "home" ? "index.html" : `${pageKey}.html`;
      if (item.href === currentPath) {
        link.setAttribute("aria-current", "page");
      }
      nav.appendChild(link);
      if (mobileNav) {
        const mobileLink = link.cloneNode(true);
        (mobileLinks || mobileNav).appendChild(mobileLink);
      }
    });
}

function applyFooter(data) {
  const about = document.getElementById("footerAbout");
  if (about) about.textContent = data.footer?.about || "";

  const contactList = document.getElementById("footerContact");
  if (contactList) {
    contactList.innerHTML = "";
    const contactPoints = data.footer?.contactPoints?.length
      ? data.footer.contactPoints
      : [
          {
            label: "Email",
            value: data.org?.email,
            href: data.org?.email ? `mailto:${data.org.email}` : "",
          },
          {
            label: "Phone",
            value: data.org?.phone,
            href: data.org?.phone ? telHref(data.org.phone) : "",
          },
          {
            label: "Location",
            value: data.contact?.locationLabel,
          },
        ];
    contactPoints
      .filter((item) => item && item.value)
      .forEach((item) => {
        const li = document.createElement("li");
        li.className = "footer-contact__item";
        li.innerHTML = `
          ${item.icon ? `<span class="footer-contact__icon">${item.icon}</span>` : ""}
          <div>
            <span class="footer-contact__label">${item.label}</span>
            ${
              item.href
                ? `<a href="${item.href}" rel="noopener">${item.value}</a>`
                : `<span>${item.value}</span>`
            }
          </div>
        `;
        contactList.appendChild(li);
      });
  }

  const securityList = document.getElementById("footerSecurity");
  if (securityList) {
    securityList.innerHTML = "";
    (data.footer?.securityPractices || []).forEach((item) => {
      const li = document.createElement("li");
      li.className = "footer-security__item";
      li.innerHTML = `
        ${item.icon ? `<span class="footer-security__icon">${item.icon}</span>` : ""}
        <div>
          <strong>${item.title}</strong>
          <span>${item.detail || ""}</span>
        </div>
      `;
      securityList.appendChild(li);
    });
  }

  const social = document.getElementById("footerSocial");
  if (social) {
    social.innerHTML = "";
    (data.socials || []).forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="${item.href}" aria-label="${item.aria || item.label}" target="_blank" rel="noopener">
          <span class="icon">${item.icon || ""}</span>
          <span class="sr-only">${item.label}</span>
        </a>
      `;
      social.appendChild(li);
    });
  }

  const legal = document.getElementById("footerLegal");
  if (legal) {
    const year = new Date().getFullYear();
    const parts = [`© ${year} ${data.org?.name || ""}`];
    if (data.footer?.legalNote) parts.push(data.footer.legalNote);
    legal.textContent = parts.filter(Boolean).join(" • ");
  }

  const policies = document.getElementById("footerPolicies");
  if (policies) {
    policies.innerHTML = "";
    const links = data.footer?.policies || [];
    if (links.length) {
      const list = document.createElement("ul");
      list.className = "foot-links__list";
      links.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${item.href || "#"}">${item.label}</a>`;
        list.appendChild(li);
      });
      policies.appendChild(list);
    }
  }
}

function renderPage(pageKey, data) {
  switch (pageKey) {
    case "home":
      renderHomePage(data);
      break;
    case "about":
      renderAboutPage(data);
      break;
    case "pricing":
      renderPricingPage(data);
      renderCompareTable(data);
      break;
    case "contact":
      renderContactPage(data);
      break;
    case "checkout":
      renderCheckoutPage(data);
      break;
    case "payment":
      renderPaymentPage(data);
      break;
    case "detail":
      renderDetailPage(data);
      break;
    case "legal":
      renderLegalPage(data);
      break;
    case "success":
    case "failed":
      renderMessagePage(pageKey, data);
      break;
    default:
      break;
  }
}
