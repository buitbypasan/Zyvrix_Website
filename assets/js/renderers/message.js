import { byId, formatCurrency } from "../core/utils.js";
import { getLastOrder, getSelectedPlan } from "../core/storage.js";
import { isEcommerceEnabled, renderEcommerceDisabled } from "../core/siteMode.js";

export function renderMessagePage(pageKey, data) {
  const page = data.pages?.[pageKey];
  if (!page) return;
  if (!isEcommerceEnabled()) {
    renderEcommerceDisabled({
      title: page.heading || "Commerce mode disabled",
      description:
        "Order updates are available only while e-commerce functionality is active. Ask an administrator to re-enable it to review purchase details.",
    });
    return;
  }
  const heading = byId("messageHeading");
  if (heading) heading.textContent = page.heading || "";
  const body = byId("messageBody");
  if (body) body.textContent = page.body || page.message || "";
  const messageInfo = byId("messageInfo");
  if (messageInfo && page.message) messageInfo.textContent = page.message;
  const actions = byId("messageActions");
  if (actions) {
    actions.innerHTML = "";
    (page.actions || []).forEach((action) => {
      const a = document.createElement("a");
      a.className = "btn" + (action.variant === "ghost" ? " btn-ghost" : "");
      a.href = action.href || "#";
      a.textContent = action.label;
      actions.appendChild(a);
    });
  }
  const orderDetails = byId("orderDetails");
  if (!orderDetails) return;
  if (pageKey === "success") {
    const order = getLastOrder();
    if (order?.plan) {
      const services = Array.isArray(order.services) ? order.services : [];
      const breakdown = order.breakdown || {};
      const paymentMeta = [
        order.transactionId
          ? `<li><strong>Payment ID:</strong> ${order.transactionId}</li>`
          : "",
        order.cardLast4
          ? `<li><strong>Card:</strong> **** **** **** ${order.cardLast4}</li>`
          : "",
        order.gatewayProvider
          ? `<li><strong>Processor:</strong> ${order.gatewayProvider}${
              order.gatewayMode ? ` (${String(order.gatewayMode).toUpperCase()} mode)` : ""
            }</li>`
          : "",
        order.receiptUrl
          ? `<li><strong>Receipt:</strong> <a href="${order.receiptUrl}" target="_blank" rel="noopener">Download receipt</a></li>`
          : "",
      ]
        .filter(Boolean)
        .join("");
      const servicesMarkup = services.length
        ? `<li><strong>Add-ons:</strong>
            <ul class="order-services">${services
              .map(
                (service) => `
                  <li>
                    <span>${service.title}</span>
                    ${
                      Number.isFinite(Number(service.price))
                        ? `<span class="order-services__price">${formatCurrency(service.price, order.currency)}</span>`
                        : service.priceLabel
                        ? `<span class="order-services__price">${service.priceLabel}</span>`
                        : ""
                    }
                  </li>
                `
              )
              .join("")}</ul>
          </li>`
        : "";
      // Show a transparent receipt breakdown when available.
      const breakdownMarkup = breakdown.total
        ? `<li>
            <strong>Breakdown:</strong>
            <ul class="order-services order-services--plain">
              <li><span>Base plan</span><span class="order-services__price">${formatCurrency(breakdown.base, order.currency)}</span></li>
              <li><span>Add-on services</span><span class="order-services__price">${formatCurrency(breakdown.addOns, order.currency)}</span></li>
              <li><span>${data.billing?.staffLabel || "Project staffing"}</span><span class="order-services__price">${formatCurrency(breakdown.staffFee, order.currency)}</span></li>
              <li><span>Tax (${Math.round((data.billing?.taxRate || 0) * 100)}%)</span><span class="order-services__price">${formatCurrency(breakdown.tax, order.currency)}</span></li>
              <li><span>Total</span><span class="order-services__price">${formatCurrency(breakdown.total, order.currency)}</span></li>
            </ul>
          </li>`
        : "";
      orderDetails.innerHTML = `
        <h3>Engagement summary</h3>
        <ul>
          <li><strong>Reference:</strong> ${order.reference}</li>
          <li><strong>Plan:</strong> ${order.plan.name}</li>
          <li><strong>Amount:</strong> ${formatCurrency(order.amount, order.currency)}</li>
          <li><strong>Client:</strong> ${order.name || "Pending"}</li>
          <li><strong>Email:</strong> ${order.email || "Pending"}</li>
          ${paymentMeta}
          ${servicesMarkup}
          ${breakdownMarkup}
        </ul>
        <p class="muted">We’ve emailed a detailed receipt and kickoff checklist.</p>
      `;
    } else {
      orderDetails.innerHTML =
        "<p class=\"muted\">Your receipt will be emailed shortly.</p>";
    }
  } else if (pageKey === "failed") {
    const plan = getSelectedPlan();
    if (plan) {
      orderDetails.innerHTML = `
        <h3>Selected plan</h3>
        <p><strong>${plan.name}</strong></p>
        <p>${formatCurrency(plan.price, plan.currency)}</p>
        <p class="muted">No charges were made. You can retry securely.</p>
      `;
    } else {
      orderDetails.innerHTML =
        "<p class=\"muted\">Choose a plan before retrying payment.</p>";
    }
  }
}
