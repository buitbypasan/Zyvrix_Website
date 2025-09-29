import { byId, formatCurrency, calculateOrderTotals } from "../core/utils.js";
import {
  getSelectedPlan,
  getSelectedServices,
  setSelectedServices,
  toggleSelectedService,
} from "../core/storage.js";
import { renderOtherServices } from "./shared.js";
import { requireAuth } from "../core/auth.js";
import { isEcommerceEnabled, renderEcommerceDisabled } from "../core/siteMode.js";

export function renderCheckoutPage(data) {
  if (!isEcommerceEnabled()) {
    renderEcommerceDisabled({
      title: "Checkout unavailable",
      description:
        "The checkout is hidden while the site is in normal mode. Enable e-commerce to manage quotes and secure payments.",
    });
    return;
  }
  const customer = requireAuth("checkout.html", ["basic", "loyalty", "admin", "staff"]);
  if (!customer) return;
  const plan = getSelectedPlan();
  const info = byId("messageInfo");
  if (info) {
    info.textContent = plan
      ? data.pages?.checkout?.message || ""
      : "No plan selected. Please choose a package from pricing.";
  }
  const account = byId("checkoutAccount");
  if (account) {
    account.textContent = `Logged in as ${customer.email}`;
  }
  const summaryTarget = byId("orderSummary");
  const servicesCatalog = data.serviceCatalog || [];
  const billing = data.billing || {};
  let selectedServiceIds = getSelectedServices();
  const validSelected = selectedServiceIds.filter((id) =>
    servicesCatalog.some((service) => service.id === id)
  );
  if (validSelected.length !== selectedServiceIds.length) {
    selectedServiceIds = setSelectedServices(validSelected);
  }

  const updateSummary = () => {
    if (!summaryTarget) return;
    if (!plan) {
      summaryTarget.innerHTML =
        '<p>No plan selected. <a href="pricing.html">Choose a plan</a>.</p>';
      return;
    }
    const selectedDetails = selectedServiceIds
      .map((id) => servicesCatalog.find((service) => service.id === id))
      .filter(Boolean);
    // Calculate totals so the customer always sees how add-ons, staffing, and taxes combine.
    const totals = calculateOrderTotals(plan.price, selectedDetails, billing);
    const currency = plan.currency || billing.currency || "AUD";
    const taxLabel = `${Math.round((billing.taxRate || 0) * 100)}%`;
    const addons = selectedDetails.length
      ? `<div class="order-addons order-addons--list"><h3>Added services</h3><ul>${selectedDetails
          .map((service) => {
            const priceLabel = Number.isFinite(Number(service.price))
              ? `<span>${formatCurrency(service.price, currency)}</span>`
              : service.priceLabel
              ? `<span>${service.priceLabel}</span>`
              : "";
            return `<li><strong>${service.title}</strong>${priceLabel}</li>`;
          })
          .join("")}</ul></div>`
      : '<p class="order-addons order-addons--empty muted">No extra services selected yet. Add services below to include them in your quote.</p>';
    const note = billing.note
      ? `<p class="order-note muted">${billing.note}</p>`
      : "";
    summaryTarget.innerHTML = `
      <h2>${plan.name}</h2>
      <p class="price">${formatCurrency(plan.price, plan.currency)}</p>
      <p class="muted">Selected at ${new Date(plan.time).toLocaleString()}</p>
      ${addons}
      <div class="order-breakdown">
        <div><span>Base plan</span><strong>${formatCurrency(totals.base, currency)}</strong></div>
        <div><span>Add-on services</span><strong>${formatCurrency(totals.addOns, currency)}</strong></div>
        <div><span>${billing.staffLabel || "Project staffing"}</span><strong>${formatCurrency(totals.staffFee, currency)}</strong></div>
        <div><span>Tax (${taxLabel})</span><strong>${formatCurrency(totals.tax, currency)}</strong></div>
      </div>
      <p class="order-total"><span>Total investment</span><strong>${formatCurrency(totals.total, currency)}</strong></p>
      ${note}
    `;
  };

  updateSummary();

  const relatedTarget = byId("relatedServices");
  const relatedSection = document.querySelector(".related-services");
  if (relatedSection) {
    relatedSection.hidden = !plan;
    const heading = relatedSection.querySelector("h2");
    if (heading && plan) heading.textContent = "Add services to your quote";
  }

  const renderServices = () => {
    if (!relatedTarget) return;
    if (!plan) {
      relatedTarget.innerHTML =
        '<p class="muted">Select a package to see available add-on services.</p>';
      return;
    }
    if (!servicesCatalog.length) {
      relatedTarget.innerHTML =
        '<p class="muted">Additional services will appear here once configured.</p>';
      return;
    }
    const recommendedSet = new Set(plan.recommendedServices || []);
    const sorted = [...servicesCatalog].sort((a, b) => {
      const aRecommended = recommendedSet.has(a.id) ? 0 : 1;
      const bRecommended = recommendedSet.has(b.id) ? 0 : 1;
      if (aRecommended !== bRecommended) return aRecommended - bRecommended;
      return a.title.localeCompare(b.title);
    });
    renderOtherServices(relatedTarget, sorted, {
      selectable: true,
      selectedIds: selectedServiceIds,
      recommendedIds: recommendedSet,
      detailLink: true,
      linkLabel: "View service details",
      scrollable: true,
      onToggle: (serviceId) => {
        selectedServiceIds = toggleSelectedService(serviceId);
        updateSummary();
        renderServices();
      },
    });
  };

  renderServices();

}
