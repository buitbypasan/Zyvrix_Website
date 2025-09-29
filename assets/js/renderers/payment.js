import {
  byId,
  formatCurrency,
  luhnCheck,
  parseExpiry,
  generateReference,
  calculateOrderTotals,
} from "../core/utils.js";
import {
  getSelectedPlan,
  getSelectedServices,
  storeLastOrder,
} from "../core/storage.js";
import { logCustomerEvent } from "../core/audit.js";
import { requireAuth } from "../core/auth.js";
import { PaymentGateway } from "../core/gateway.js";
import { enforceSecurePaymentContext } from "../core/security.js";
import { isEcommerceEnabled, renderEcommerceDisabled } from "../core/siteMode.js";

export function renderPaymentPage(data) {
  enforceSecurePaymentContext();
  if (!isEcommerceEnabled()) {
    renderEcommerceDisabled({
      title: "Payments disabled",
      description:
        "Secure payments are available only in e-commerce mode. Ask an administrator to re-enable the commerce experience to continue.",
      icon: "💳",
    });
    return;
  }
  const customer = requireAuth("payment.html", ["basic", "loyalty", "admin", "staff"]);
  if (!customer) return;
  const servicesCatalog = data?.serviceCatalog || [];
  const billing = data?.billing || {};
  const summaryTarget = byId("paymentSummary");
  const mini = byId("miniSummary");
  const plan = getSelectedPlan();
  const selectedServiceIds = getSelectedServices();
  const messageInfo = byId("messageInfo");
  if (messageInfo) {
    messageInfo.textContent = plan
      ? data.pages?.payment?.message || ""
      : "No plan selected. Return to pricing to choose your package.";
  }
  const account = byId("paymentAccount");
  if (account) {
    account.textContent = `Logged in as ${customer.email}`;
  }

  const gateway = PaymentGateway.fromEnv(window.ENV?.paymentGateway || {});
  const gatewayNotice = byId("gatewayStatus");
  if (gatewayNotice) {
    gatewayNotice.textContent = "";
    gatewayNotice.className = "callout";
    if (!gateway.isConfigured) {
      gatewayNotice.classList.add("callout--error");
      gatewayNotice.textContent =
        "Payment gateway is not configured. Update assets/js/env.local.js with your provider keys before accepting payments.";
    } else if (!gateway.endpoint && !gateway.isLive()) {
      gatewayNotice.classList.add("callout--warning");
      gatewayNotice.textContent =
        `Test mode active — payments are simulated locally using ${gateway.provider}. Configure an endpoint before going live.`;
    } else {
      gatewayNotice.classList.add("callout--info");
      gatewayNotice.textContent = `Payments are processed securely by ${gateway.provider} (${String(
        gateway.mode || "test"
      ).toUpperCase()} mode).`;
    }
  }

  const selectedServices = () =>
    selectedServiceIds
      .map((id) => servicesCatalog.find((service) => service.id === id))
      .filter(Boolean);

  const renderSummary = () => {
    if (!summaryTarget) return;
    if (!plan) {
      summaryTarget.innerHTML =
        '<p class="muted">No plan selected yet. <a href="pricing.html">Choose a package</a> to continue.</p>';
      return;
    }
    const services = selectedServices();
    // Reuse the same calculation used in checkout to avoid mismatched totals.
    const totals = plan
      ? calculateOrderTotals(plan.price, services, billing)
      : null;
    const currency = plan?.currency || billing.currency || "AUD";
    const items = services.length
      ? `<ul class="cart-summary__addons">${services
          .map((service) => {
            const priceLabel = Number.isFinite(Number(service.price))
              ? `<span class="cart-summary__price">${formatCurrency(service.price, currency)}</span>`
              : service.priceLabel
              ? `<span class="cart-summary__price">${service.priceLabel}</span>`
              : "";
            return `<li><strong>${service.title}</strong>${priceLabel}</li>`;
          })
          .join("")}</ul>`
      : '<p class="cart-summary__empty muted">No add-on services selected. You can add them on the previous step.</p>';
    summaryTarget.innerHTML = `
      <div class="cart-summary__plan">
        <h3>${plan.name}</h3>
        <p>${formatCurrency(plan.price, plan.currency)}</p>
        <p class="muted">Selected ${new Date(plan.time).toLocaleString()}</p>
      </div>
      <div class="cart-summary__services">
        <h4>Included services</h4>
        ${items}
      </div>
      <div class="order-breakdown">
        <div><span>Base plan</span><strong>${formatCurrency(totals.base, currency)}</strong></div>
        <div><span>Add-on services</span><strong>${formatCurrency(totals.addOns, currency)}</strong></div>
        <div><span>${billing.staffLabel || "Project staffing"}</span><strong>${formatCurrency(totals.staffFee, currency)}</strong></div>
        <div><span>Tax (${Math.round((billing.taxRate || 0) * 100)}%)</span><strong>${formatCurrency(totals.tax, currency)}</strong></div>
      </div>
      <p class="order-total"><span>Total due today</span><strong>${formatCurrency(totals.total, currency)}</strong></p>
      ${
        billing.note
          ? `<p class="cart-summary__note muted">${billing.note}</p>`
          : '<p class="cart-summary__note muted">Add-on pricing is finalised with your personalised proposal.</p>'
      }
    `;
    if (mini) {
      mini.textContent = `${plan.name} — ${formatCurrency(
        totals.total,
        currency
      )}`;
    }
  };

  renderSummary();

  const form = byId("paymentForm");
  if (!form) return;
  const submitButton = form.querySelector("button[type='submit']");
  if (submitButton && !gateway.isConfigured) {
    submitButton.disabled = true;
    submitButton.textContent = "Payment unavailable";
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = byId("payStatus");
    const currentPlan = getSelectedPlan();
    if (!currentPlan) {
      if (status)
        status.textContent = "Please choose a plan before completing your payment.";
      setTimeout(() => {
        window.location.href = "pricing.html";
      }, 1200);
      return;
    }
    if (!form.reportValidity()) {
      if (status) status.textContent = "Please complete the required fields.";
      return;
    }
    if (!gateway.isConfigured) {
      if (status)
        status.textContent =
          "Payment gateway has not been configured. Contact support to complete your order.";
      return;
    }

    const cardNumber = byId("card")?.value.replace(/\s+/g, "");
    if (!luhnCheck(cardNumber)) {
      if (status) status.textContent = "Enter a valid card number.";
      return;
    }
    const expValue = byId("exp")?.value;
    const exp = parseExpiry(expValue);
    if (!exp.valid) {
      if (status)
        status.textContent = "Expiry date must be in MM/YY format and in the future.";
      return;
    }
    const cvc = byId("cvc")?.value.trim();
    if (!/^\d{3,4}$/.test(cvc || "")) {
      if (status) status.textContent = "Enter a valid CVC.";
      return;
    }
    const services = selectedServices();
    if (status) status.textContent = "Processing secure payment…";
    if (submitButton) submitButton.setAttribute("disabled", "disabled");
    try {
      const totals = calculateOrderTotals(currentPlan.price, services, billing);
      const order = {
        reference: generateReference(),
        plan: currentPlan,
        amount: totals.total,
        currency: currentPlan.currency || billing.currency || "AUD",
        name: byId("fullname")?.value.trim(),
        email: byId("emailPay")?.value.trim(),
        services: services.map((service) => ({
          id: service.id,
          title: service.title,
          priceLabel: service.priceLabel || null,
          price: service.price || null,
        })),
        createdAt: new Date().toISOString(),
        breakdown: totals,
        billingAddress: {
          line1: byId("address")?.value.trim() || "",
          city: byId("city")?.value.trim() || "",
          state: byId("state")?.value.trim() || "",
          postalCode: byId("zip")?.value.trim() || "",
          country: billing.country || "AU",
        },
      };

      const cardDetails = {
        number: cardNumber,
        expMonth: exp.month,
        expYear: exp.year,
        cvc,
      };

      const result = await gateway.processPayment({
        order,
        card: cardDetails,
        billing: { address: order.billingAddress },
      });

      order.transactionId = result.transactionId;
      order.receiptUrl = result.receiptUrl || null;
      order.cardLast4 = cardNumber.slice(-4);
      order.gatewayMode = result.mode;
      order.gatewayProvider = gateway.provider;
      storeLastOrder(order);
      try {
        await logCustomerEvent("payment_submitted", {
          planId: currentPlan.id,
          serviceIds: services.map((service) => service.id),
          email: order.email,
          amount: order.amount,
          currency: order.currency,
        });
      } catch (error) {
        // Logging failures should never block checkout completion.
      }
      if (status) status.textContent = "Payment successful! Redirecting…";
      setTimeout(() => {
        window.location.href = "success.html";
      }, 900);
    } catch (error) {
      if (status) status.textContent = error?.message || "Unable to process payment.";
      if (submitButton) submitButton.removeAttribute("disabled");
    }
  });
}
