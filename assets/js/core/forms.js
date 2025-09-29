import { byId } from "./utils.js";
import {
  formatCurrency,
  resolveEndpoint,
  serializeForm,
} from "./utils.js";

export function bindContact(formId, statusId, configKey = "contact") {
  const form = byId(formId);
  const status = byId(statusId);
  const resolvedKey = form?.dataset?.formKey || configKey;
  const config = window.DATA?.forms?.[resolvedKey] || window.DATA?.forms?.[configKey] || {};
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (typeof form.reportValidity === "function" && !form.reportValidity()) {
      return;
    }
    if (status) status.textContent = "Sending…";
    const endpoint = resolveEndpoint(config);
    const payload = serializeForm(form);
    payload._subject = config.subject || "New enquiry";
    payload.subject = config.subject || "New enquiry";
    if (payload.email && !payload._replyto) payload._replyto = payload.email;
    payload.formId = formId;
    payload.sourcePage = window.location.href;
    payload.timestamp = new Date().toISOString();

    const result = await submitFormData(endpoint, payload);
    if (result.ok) {
      if (status) {
        status.textContent =
          config.success || "Thanks! We will get back to you soon.";
      }
      form.reset();
    } else if (status) {
      status.textContent =
        config.error ||
        "We couldn't submit your request. Please email hello@secureitdevelopers.com.";
    }
  });
}

export function initQuoteGenerator(data) {
  const form = byId("quoteForm");
  const result = byId("quoteResult");
  const statusEl = byId("quoteStatus");
  if (!form || !result || !data) return;

  const render = (event) => {
    if (event) event.preventDefault();
    result.classList.remove("is-ready");

    const payload = serializeForm(form);
    const calculator = data.quoteCalculator || {};
    const project = calculator.projects?.[payload.project] || {};
    const tier = project.tiers?.[payload.projectSize] || {};
    const timeline = calculator.timelines?.[payload.timeline] || {};
    const compliance = calculator.compliance?.[payload.compliance] || {};
    const support = calculator.support?.[payload.support] || {};

    const base = tier.base || 0;
    const complianceAmount = compliance.adjustment || 0;
    const timelineAmount = timeline.adjustment || 0;
    const supportAmount = Math.round(base * (support.multiplier || 0));
    const total = base + complianceAmount + timelineAmount + supportAmount;
    const estimate = formatCurrency(total, tier.currency || "AUD");

    result.innerHTML = `
      <div class="quote-output">
        <h3>${tier.title || "Custom engagement"}</h3>
        <dl>
          <div><dt>Project type</dt><dd>${project.label || "Custom"}</dd></div>
          <div><dt>Complexity</dt><dd>${tier.title || "Scoping"}</dd></div>
          <div><dt>Timeline</dt><dd>${timeline.label || "Flexible"}</dd></div>
          <div><dt>Compliance</dt><dd>${compliance.label || "Best practice"}</dd></div>
          <div><dt>Ongoing support</dt><dd>${support.label || "No retainer"}</dd></div>
          <div><dt>Estimated investment</dt><dd>${estimate}</dd></div>
        </dl>
      </div>
    `;
    result.classList.add("is-ready");
  };

  form.addEventListener("change", render);
  form.addEventListener("submit", render);
  render();

  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn && statusEl) {
    form.addEventListener("submit", () => {
      statusEl.textContent = "Sending estimate…";
    });
  }
}

export async function submitFormData(endpoint, payload) {
  if (!endpoint) {
    console.warn("No endpoint configured for form submission", payload);
    return { ok: true, skipped: true };
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Request failed with ${response.status}`);
    return { ok: true };
  } catch (error) {
    console.error("Form submission failed", error);
    return { ok: false, error };
  }
}
