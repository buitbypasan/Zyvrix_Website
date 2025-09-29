import { byId, formatCurrency } from "../core/utils.js";
import { savePlanSelection, setSelectedServices } from "../core/storage.js";
import { renderOtherServices } from "./shared.js";
import { isEcommerceEnabled, renderEcommerceDisabled } from "../core/siteMode.js";

export function renderPricingPage(data) {
  if (!isEcommerceEnabled()) {
    renderEcommerceDisabled({
      title: "Packages unavailable",
      description:
        "The site is currently running in normal mode. Enable the e-commerce experience to compare plans and managed services.",
    });
    return;
  }
  const page = data.pages?.pricing;
  if (!page) return;
  const intro = byId("pricingIntro");
  if (intro) intro.textContent = page.intro || "";

  const addOns = page.addOns || {};
  const addOnsEyebrow = byId("pricingAddOnsEyebrow");
  if (addOnsEyebrow) addOnsEyebrow.textContent = addOns.eyebrow || "";
  const addOnsHeading = byId("pricingAddOnsHeading");
  if (addOnsHeading) addOnsHeading.textContent = addOns.heading || "";
  const addOnsCopy = byId("pricingAddOnsCopy");
  if (addOnsCopy) addOnsCopy.textContent = addOns.copy || "";
  const addOnsCards = byId("pricingAddOnsCards");
  if (addOnsCards) {
    addOnsCards.innerHTML = "";
    (addOns.cards || []).forEach((card) => {
      const article = document.createElement("article");
      article.className = "add-on-card js-reveal";
      const list = (card.highlights || [])
        .map((item) => `<li>${item}</li>`)
        .join("");
      article.innerHTML = `
        <h3>${card.title}</h3>
        <p class="price">${card.price || ""}</p>
        <p>${card.description || ""}</p>
        <ul>${list}</ul>
      `;
      addOnsCards.appendChild(article);
    });
  }

  const compareHeading = byId("compareHeading");
  if (compareHeading) compareHeading.textContent = page.compare?.heading || "";
  const compareCopy = byId("compareCopy");
  if (compareCopy) compareCopy.textContent = page.compare?.copy || "";

  const deepDive = page.deepDive || {};
  const deepDiveEyebrow = byId("pricingDeepDiveEyebrow");
  if (deepDiveEyebrow) deepDiveEyebrow.textContent = deepDive.eyebrow || "";
  const deepDiveHeading = byId("pricingDeepDiveHeading");
  if (deepDiveHeading) deepDiveHeading.textContent = deepDive.heading || "";
  const deepDiveCopy = byId("pricingDeepDiveCopy");
  if (deepDiveCopy) deepDiveCopy.textContent = deepDive.copy || "";
  const deepDivePanels = byId("pricingDeepDivePanels");
  const deepDiveLinkLabel = deepDive.linkLabel || "View service details";

  const subnav = byId("pricingSubnav");
  const tabs = byId("pricingTabs");
  if (!subnav || !tabs) return;
  subnav.innerHTML = "";
  tabs.innerHTML = "";
  if (deepDivePanels) deepDivePanels.innerHTML = "";

  const serviceCatalog = data.serviceCatalog || [];
  (data.pricingGroups || []).forEach((group, index) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (index === 0 ? " active" : "");
    chip.textContent = group.label;
    chip.setAttribute("data-tab", group.id);
    chip.setAttribute("type", "button");
    chip.addEventListener("click", () => selectTab(group.id));
    subnav.appendChild(chip);

    const section = document.createElement("section");
    section.className = "grid-3 tab";
    section.id = `tab-${group.id}`;
    if (index !== 0) section.hidden = true;

    (group.plans || []).forEach((plan) => {
      const card = document.createElement("article");
      card.className = "price-card js-reveal";
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${group.label} ${plan.label} plan`);
      const features = (plan.features || []).map((feature) => `<li>${feature}</li>`).join("");
      const ctaLabel = plan.ctaLabel || "Select";
      const summary = plan.summary ? `<p>${plan.summary}</p>` : "";
      card.innerHTML = `
        <header>
          <p class="eyebrow">${group.tagline || ""}</p>
          <h3>${plan.label}</h3>
          <p class="price">${formatCurrency(plan.price, plan.currency)}</p>
        </header>
        ${summary}
        <ul class="features">${features}</ul>
        <div class="card-actions">
          <button class="btn select-plan" data-plan="${group.id}-${plan.id}">${ctaLabel}</button>
          <a class="plan-link" href="detail.html?type=plan&id=${group.id}-${plan.id}">Plan details</a>
        </div>
      `;
      card.querySelector(".select-plan").addEventListener("click", () => {
        savePlanSelection({
          id: `${group.id}-${plan.id}`,
          groupId: group.id,
          name: `${group.label} – ${plan.label}`,
          price: Number(plan.price),
          currency: plan.currency,
          recommendedServices: plan.recommendedServices || [],
        });
        setSelectedServices(plan.recommendedServices || []);
        window.location.href = "checkout.html";
      });
      section.appendChild(card);
    });

    tabs.appendChild(section);

    if (deepDivePanels) {
      const panel = document.createElement("section");
      panel.className = "tab-detail";
      panel.id = `detail-${group.id}`;
      if (index !== 0) panel.hidden = true;
      const recommendedIds = new Set();
      (group.plans || []).forEach((plan) => {
        (plan.recommendedServices || []).forEach((serviceId) =>
          recommendedIds.add(serviceId)
        );
      });
      if (!recommendedIds.size) {
        panel.innerHTML = `<p class="muted">${
          deepDive.empty || "Service recommendations coming soon."
        }</p>`;
      } else {
        const grid = document.createElement("div");
        grid.className = "detail-grid";
        recommendedIds.forEach((serviceId) => {
          const service = serviceCatalog.find((item) => item.id === serviceId);
          if (!service) return;
          const card = document.createElement("article");
          card.className = "detail-card";
          const benefits = (service.benefits || [])
            .map((benefit) => `<li>${benefit}</li>`)
            .join("");
          card.innerHTML = `
            <header>
              <p class="eyebrow">${service.category || ""}</p>
              <h3>${service.title}</h3>
              ${
                service.priceLabel
                  ? `<span class="detail-price">${service.priceLabel}</span>`
                  : ""
              }
            </header>
            <p>${service.description || ""}</p>
            ${benefits ? `<ul>${benefits}</ul>` : ""}
            <a class="detail-link" href="detail.html?type=service&id=${service.id}">${deepDiveLinkLabel}</a>
          `;
          grid.appendChild(card);
        });
        panel.appendChild(grid);
      }
      deepDivePanels.appendChild(panel);
    }
  });

  const additional = byId("additionalServices");
  if (additional) {
    renderOtherServices(additional, data.serviceCatalog || [], {
      showCtas: true,
      linkLabel: deepDiveLinkLabel,
      enableCart: true,
    });
  }

  // Bespoke engagements combine messaging, so keep CTA content editable via data.js.
  const custom = page.customEngagement || {};
  const customSection = byId("customEngagement");
  if (customSection) {
    const eyebrow = byId("customEngagementEyebrow");
    if (eyebrow) eyebrow.textContent = custom.eyebrow || "";
    const heading = byId("customEngagementHeading");
    if (heading) heading.textContent = custom.heading || "";
    const copy = byId("customEngagementCopy");
    if (copy) copy.textContent = custom.copy || "";
    const list = byId("customEngagementHighlights");
    if (list) {
      list.innerHTML = "";
      (custom.highlights || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
    }
    const primary = byId("customEngagementPrimary");
    if (primary) {
      const hasPrimary = Boolean(custom.primaryCta?.label);
      primary.textContent = custom.primaryCta?.label || "";
      primary.href = custom.primaryCta?.href || "contact.html";
      primary.toggleAttribute("hidden", !hasPrimary);
    }
    const secondary = byId("customEngagementSecondary");
    if (secondary) {
      const hasSecondary = Boolean(custom.secondaryCta?.label);
      secondary.textContent = custom.secondaryCta?.label || "";
      secondary.href = custom.secondaryCta?.href || "about.html";
      secondary.toggleAttribute("hidden", !hasSecondary);
    }
    const aside = byId("customEngagementAside");
    if (aside) {
      aside.innerHTML = "";
      const metrics = custom.aside?.metrics || [];
      const invoice = custom.invoice;
      if (invoice) {
        const invoiceCard = buildInvoiceCard(custom, invoice, metrics, data);
        aside.appendChild(invoiceCard);
        const downloadButton = invoiceCard.querySelector("#customInvoiceDownload");
        if (downloadButton) {
          downloadButton.addEventListener("click", () =>
            downloadInvoicePdf(custom, invoice, metrics, data)
          );
        }
      } else {
        if (custom.aside?.title) {
          const title = document.createElement("h3");
          title.textContent = custom.aside.title;
          aside.appendChild(title);
        }
        if (metrics.length) {
          const metricsList = document.createElement("ul");
          metricsList.className = "custom-metrics";
          metrics.forEach((metric) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${metric.value}</strong><span>${metric.label}</span>`;
            metricsList.appendChild(li);
          });
          aside.appendChild(metricsList);
        }
      }
      const hasContent = aside.innerHTML.trim().length > 0;
      aside.toggleAttribute("hidden", !hasContent);
    }
    const shouldHide = !custom.heading && !custom.copy;
    customSection.hidden = shouldHide;
    if (!shouldHide) {
      customSection.classList.add("is-visible");
    }
  }

  const standalone = page.standalone || {};
  const standaloneEyebrow = byId("standaloneEyebrow");
  if (standaloneEyebrow) standaloneEyebrow.textContent = standalone.eyebrow || "";
  const standaloneHeading = byId("standaloneHeading");
  if (standaloneHeading) standaloneHeading.textContent = standalone.heading || "";
  const standaloneCopy = byId("standaloneCopy");
  if (standaloneCopy) standaloneCopy.textContent = standalone.copy || "";
  const standaloneNote = byId("standaloneNote");
  if (standaloneNote) standaloneNote.textContent = standalone.note || "";

  const saved =
    localStorage.getItem("pricingTab") ||
    data.pricingGroups?.[0]?.id ||
    "starter";
  selectTab(saved);

  function selectTab(id) {
    document
      .querySelectorAll("#pricingSubnav .chip")
      .forEach((chip) => {
        const isActive = chip.dataset.tab === id;
        chip.classList.toggle("active", isActive);
        chip.setAttribute("aria-pressed", String(isActive));
      });
    document.querySelectorAll("#pricingTabs > .tab").forEach((section) => {
      section.hidden = section.id !== `tab-${id}`;
    });
    if (deepDivePanels) {
      document
        .querySelectorAll("#pricingDeepDivePanels > .tab-detail")
        .forEach((panel) => {
          panel.hidden = panel.id !== `detail-${id}`;
        });
    }
    localStorage.setItem("pricingTab", id);
  }
}

export function renderCompareTable(data) {
  if (!isEcommerceEnabled()) return;
  const compare = data.pages?.pricing?.compare;
  const nav = byId("compareNav");
  const table = byId("compareTable");
  if (!compare || !nav || !table) return;
  nav.innerHTML = "";
  table.innerHTML = "";
  const categories = compare.categories || [];
  if (!categories.length) {
    table.innerHTML = "<p class=\"muted\">Compare data will appear here once configured.</p>";
    return;
  }
  let activeId = window.ENV?.compareDefaultCategory || categories[0]?.id;
  const setActive = (id) => {
    activeId = id;
    Array.from(nav.children).forEach((btn) => {
      const isActive = btn.getAttribute("data-id") === id;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
    const category = categories.find((item) => item.id === id) || categories[0];
    if (!category) return;
    const columnCount = category.columns?.length || 0;
    table.innerHTML = "";
    const summary = document.createElement("p");
    summary.className = "compare-summary";
    summary.textContent = category.summary || "";
    table.appendChild(summary);

    const wrapper = document.createElement("div");
    wrapper.className = "compare-table__wrapper";

    const matrix = document.createElement("table");
    matrix.className = "compare-matrix compare-matrix--cols-" + columnCount;

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const featureHeading = document.createElement("th");
    featureHeading.scope = "col";
    featureHeading.className = "compare-matrix__feature";
    featureHeading.textContent = "Criteria";
    headRow.appendChild(featureHeading);

    (category.columns || []).forEach((column, columnIndex) => {
      const plan = findPlanDetails(data, column.planId);
      const price = plan ? formatCurrency(plan.price, plan.currency) : "";
      const th = document.createElement("th");
      th.scope = "col";
      th.className = `compare-matrix__col compare-matrix__col--${columnIndex + 1}`;
      th.innerHTML = `
        <span class="compare-matrix__plan">${column.label}</span>
        <span class="compare-matrix__price">${price}</span>
      `;
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    matrix.appendChild(thead);

    const tbody = document.createElement("tbody");
    (category.rows || []).forEach((row) => {
      const tr = document.createElement("tr");
      const featureCell = document.createElement("th");
      featureCell.scope = "row";
      featureCell.className = "compare-matrix__feature";
      featureCell.textContent = row.label;
      tr.appendChild(featureCell);

      for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
        const value = row.values?.[columnIndex] || "—";
        const td = document.createElement("td");
        td.className = `compare-matrix__value compare-matrix__col--${
          columnIndex + 1
        }`;
        td.textContent = value;
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });

    matrix.appendChild(tbody);
    wrapper.appendChild(matrix);
    table.appendChild(wrapper);
  };
  categories.forEach((category, index) => {
    const btn = document.createElement("button");
    btn.className = "compare-tab" + (category.id === activeId ? " active" : "");
    btn.textContent = category.label;
    btn.setAttribute("type", "button");
    btn.setAttribute("role", "tab");
    btn.setAttribute("data-id", category.id);
    btn.setAttribute("aria-selected", category.id === activeId);
    btn.addEventListener("click", () => setActive(category.id));
    nav.appendChild(btn);
    if (index === 0 && !activeId) activeId = category.id;
  });
  setActive(activeId);
}

function findPlanDetails(data, compositeId) {
  if (!compositeId) return null;
  const [groupId, planId] = compositeId.split("-");
  if (!groupId || !planId) return null;
  const group = (data.pricingGroups || []).find((item) => item.id === groupId);
  if (!group) return null;
  const plan = (group.plans || []).find((item) => item.id === planId);
  if (!plan) return null;
  return {
    id: plan.id,
    label: plan.label,
    price: plan.price,
    currency: plan.currency,
    groupLabel: group.label,
  };
}

function buildInvoiceCard(custom, invoice, metrics, data) {
  const card = document.createElement("article");
  card.className = "custom-invoice";
  const currency = invoice.currency || "USD";
  const safeMetrics = Array.isArray(metrics) ? metrics : [];

  const header = document.createElement("header");
  header.className = "custom-invoice__header";

  const headingBlock = document.createElement("div");
  headingBlock.className = "custom-invoice__heading";
  headingBlock.innerHTML = `
    <p class="custom-invoice__eyebrow">${invoice.label || "Invoice"}</p>
    <h3>${custom.heading || invoice.reference || "Custom engagement invoice"}</h3>
    ${custom.copy ? `<p class="custom-invoice__lead">${custom.copy}</p>` : ""}
  `;
  header.appendChild(headingBlock);

  const summaryEntries = [
    { label: "Invoice #", value: invoice.reference || "Draft" },
    { label: "Amount due", value: formatAmount(invoice.total, currency) || "—" },
  ];
  if (invoice.issued)
    summaryEntries.push({ label: "Issued", value: invoice.issued });
  if (invoice.due) summaryEntries.push({ label: "Valid until", value: invoice.due });

  if (summaryEntries.some((entry) => entry.value)) {
    const summary = document.createElement("dl");
    summary.className = "custom-invoice__summary";
    summaryEntries.forEach((entry) => {
      if (!entry.value) return;
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = entry.label;
      const dd = document.createElement("dd");
      dd.textContent = entry.value;
      row.appendChild(dt);
      row.appendChild(dd);
      summary.appendChild(row);
    });
    header.appendChild(summary);
  }

  card.appendChild(header);

  const layout = document.createElement("div");
  layout.className = "custom-invoice__layout";

  const primaryColumn = document.createElement("div");
  primaryColumn.className = "custom-invoice__column custom-invoice__column--primary";

  const parties = document.createElement("div");
  parties.className = "custom-invoice__parties";

  const billToLines = createPartyLines(invoice.billTo);
  if (billToLines.length) {
    parties.appendChild(createPartyBlock("Billed to", billToLines));
  }

  const issuerLines = createIssuerLines(data);
  if (issuerLines.length) {
    parties.appendChild(createPartyBlock("Issued by", issuerLines));
  }

  const projectLines = [];
  const projectLabel = invoice.project || custom.heading;
  if (projectLabel) projectLines.push(projectLabel);
  if (invoice.turnaround) projectLines.push(`Timeline: ${invoice.turnaround}`);
  if (invoice.paymentTerms)
    projectLines.push(`Payment terms: ${invoice.paymentTerms}`);
  if (projectLines.length) {
    parties.appendChild(createPartyBlock("Project", projectLines));
  }

  if (parties.childElementCount) {
    primaryColumn.appendChild(parties);
  }

  const table = document.createElement("table");
  table.className = "custom-invoice__table";
  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Item & description</th>
        <th scope="col">Qty</th>
        <th scope="col">Rate</th>
        <th scope="col">Amount</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement("tbody");
  const items = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  if (!items.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("th");
    cell.scope = "row";
    cell.textContent = "Scope to be finalised with your delivery team.";
    row.appendChild(cell);
    const placeholder = document.createElement("td");
    placeholder.colSpan = 3;
    placeholder.textContent = "—";
    row.appendChild(placeholder);
    tbody.appendChild(row);
  } else {
    items.forEach((item) => {
      const row = document.createElement("tr");
      const description = document.createElement("th");
      description.scope = "row";
      description.textContent =
        item.description || "Custom engagement component";
      const quantity = document.createElement("td");
      const qtyParts = [];
      if (item.quantity !== undefined && item.quantity !== null) {
        qtyParts.push(String(item.quantity));
      }
      if (item.unit) qtyParts.push(item.unit);
      quantity.textContent = qtyParts.join(" ") || "—";
      const rate = document.createElement("td");
      rate.textContent = formatAmount(item.rate, currency) || "—";
      const amount = document.createElement("td");
      const fallbackAmount =
        typeof item.rate === "number" && typeof item.quantity === "number"
          ? item.rate * item.quantity
          : item.rate;
      amount.textContent =
        formatAmount(item.total, currency) ||
        formatAmount(fallbackAmount, currency) ||
        "—";
      row.appendChild(description);
      row.appendChild(quantity);
      row.appendChild(rate);
      row.appendChild(amount);
      tbody.appendChild(row);
    });
  }
  table.appendChild(tbody);

  const totals = [];
  if (invoice.subtotal !== undefined && invoice.subtotal !== null)
    totals.push({ label: "Subtotal", value: formatAmount(invoice.subtotal, currency) });
  if (invoice.tax !== undefined && invoice.tax !== null)
    totals.push({ label: "Tax", value: formatAmount(invoice.tax, currency) });
  if (invoice.total !== undefined && invoice.total !== null)
    totals.push({
      label: "Total",
      value: formatAmount(invoice.total, currency),
      className: "custom-invoice__grand-total",
    });
  if (totals.length) {
    const tfoot = document.createElement("tfoot");
    totals.forEach((total) => {
      const row = document.createElement("tr");
      if (total.className) row.className = total.className;
      const label = document.createElement("td");
      label.colSpan = 3;
      label.textContent = total.label;
      const amount = document.createElement("td");
      amount.textContent = total.value;
      row.appendChild(label);
      row.appendChild(amount);
      tfoot.appendChild(row);
    });
    table.appendChild(tfoot);
  }

  primaryColumn.appendChild(table);

  if (invoice.note) {
    const note = document.createElement("section");
    note.className = "custom-invoice__panel custom-invoice__note";
    note.innerHTML = `<h4>Notes</h4><p>${invoice.note}</p>`;
    primaryColumn.appendChild(note);
  }

  layout.appendChild(primaryColumn);

  const summaryColumn = document.createElement("aside");
  summaryColumn.className = "custom-invoice__column custom-invoice__column--summary";

  const detailEntries = [];
  if (invoice.turnaround)
    detailEntries.push({ label: "Engagement length", value: invoice.turnaround });
  if (invoice.paymentTerms)
    detailEntries.push({ label: "Payment terms", value: invoice.paymentTerms });

  if (detailEntries.length) {
    const detailSection = document.createElement("section");
    detailSection.className = "custom-invoice__panel";
    const detailsHeading = document.createElement("h4");
    detailsHeading.textContent = "Key details";
    detailSection.appendChild(detailsHeading);
    const dl = document.createElement("dl");
    dl.className = "custom-invoice__meta";
    detailEntries.forEach((entry) => {
      if (!entry.value) return;
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = entry.label;
      const dd = document.createElement("dd");
      dd.textContent = entry.value;
      row.appendChild(dt);
      row.appendChild(dd);
      dl.appendChild(row);
    });
    detailSection.appendChild(dl);
    summaryColumn.appendChild(detailSection);
  }

  if (safeMetrics.length) {
    const insights = document.createElement("section");
    insights.className = "custom-invoice__panel custom-invoice__insights";
    const metricsHeading = document.createElement("h4");
    metricsHeading.textContent = custom.aside?.title || "Engagement indicators";
    insights.appendChild(metricsHeading);
    const list = document.createElement("ul");
    list.className = "custom-invoice__metrics";
    safeMetrics.forEach((metric) => {
      if (!metric?.value || !metric?.label) return;
      const li = document.createElement("li");
      li.innerHTML = `<strong>${metric.value}</strong><span>${metric.label}</span>`;
      list.appendChild(li);
    });
    insights.appendChild(list);
    summaryColumn.appendChild(insights);
  }

  const actions = document.createElement("div");
  actions.className = "custom-invoice__actions";
  const download = document.createElement("button");
  download.className = "btn";
  download.type = "button";
  download.id = "customInvoiceDownload";
  download.textContent = invoice.downloadLabel || "Download PDF summary";
  actions.appendChild(download);
  summaryColumn.appendChild(actions);

  layout.appendChild(summaryColumn);
  card.appendChild(layout);

  return card;
}

function formatAmount(value, currency) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return formatCurrency(value, currency);
  }
  if (typeof value === "string") return value;
  return "";
}

function downloadInvoicePdf(custom, invoice, metrics, data) {
  try {
    if (typeof window === "undefined" || typeof Blob === "undefined" || !window.URL) {
      if (typeof window !== "undefined" && typeof window.print === "function") {
        window.print();
      }
      return;
    }
    const lines = buildInvoiceLines(custom, invoice, metrics, data);
    const pdfBlob = createSimplePdf(lines);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdfBlob);
    const safeName = (invoice.reference || "custom-engagement")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    link.download = safeName ? `${safeName}.pdf` : "custom-engagement.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  } catch (error) {
    console.error("Unable to generate invoice PDF", error);
  }
}

function buildInvoiceLines(custom, invoice, metrics, data) {
  const currency = invoice.currency || "USD";
  const lines = [];
  const orgName = data?.org?.name || "Zyvrix";
  lines.push(orgName);
  if (custom?.heading) lines.push(custom.heading);
  if (custom?.copy) lines.push(custom.copy);
  lines.push("");
  lines.push(`Invoice #: ${invoice.reference || "Draft"}`);
  const amountDue = formatAmount(invoice.total, currency);
  if (amountDue) lines.push(`Amount due: ${amountDue}`);
  if (invoice.issued) lines.push(`Issued: ${invoice.issued}`);
  if (invoice.due) lines.push(`Valid until: ${invoice.due}`);
  lines.push("");

  const billToLines = createPartyLines(invoice.billTo);
  if (billToLines.length) {
    lines.push("Billed to:");
    billToLines.forEach((line) => lines.push(line));
    lines.push("");
  }

  const issuerLines = createIssuerLines(data);
  if (issuerLines.length) {
    lines.push("Issued by:");
    issuerLines.forEach((line) => lines.push(line));
    lines.push("");
  }

  const projectLines = [];
  const projectLabel = invoice.project || custom.heading;
  if (projectLabel) projectLines.push(projectLabel);
  if (invoice.turnaround)
    projectLines.push(`Timeline: ${invoice.turnaround}`);
  if (invoice.paymentTerms)
    projectLines.push(`Payment terms: ${invoice.paymentTerms}`);
  if (projectLines.length) {
    lines.push("Project:");
    projectLines.forEach((line) => lines.push(line));
    lines.push("");
  }

  lines.push("Items:");
  lines.push("Description | Qty | Rate | Amount");
  const items = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  if (items.length) {
    items.forEach((item) => {
      const qtyParts = [];
      if (item.quantity !== undefined && item.quantity !== null) {
        qtyParts.push(String(item.quantity));
      }
      if (item.unit) qtyParts.push(item.unit);
      const qty = qtyParts.join(" ") || "—";
      const rate = formatAmount(item.rate, currency) || "—";
      const fallbackAmount =
        typeof item.rate === "number" && typeof item.quantity === "number"
          ? item.rate * item.quantity
          : item.rate;
      const amount =
        formatAmount(item.total, currency) ||
        formatAmount(fallbackAmount, currency) ||
        "—";
      lines.push(`${item.description || "Custom engagement component"} | ${qty} | ${rate} | ${amount}`);
    });
  } else {
    lines.push("Scope to be finalised with your delivery team. | — | — | —");
  }
  lines.push("");

  if (invoice.subtotal !== undefined && invoice.subtotal !== null)
    lines.push(`Subtotal: ${formatAmount(invoice.subtotal, currency)}`);
  if (invoice.tax !== undefined && invoice.tax !== null)
    lines.push(`Tax: ${formatAmount(invoice.tax, currency)}`);
  if (invoice.total !== undefined && invoice.total !== null)
    lines.push(`Total due: ${formatAmount(invoice.total, currency)}`);

  if (invoice.note) {
    lines.push("");
    lines.push("Notes:");
    lines.push(invoice.note);
  }

  const safeMetrics = Array.isArray(metrics) ? metrics : [];
  if (safeMetrics.length) {
    const indicatorHeading = custom?.aside?.title || "Engagement indicators";
    lines.push("");
    lines.push(`${indicatorHeading}:`);
    safeMetrics.forEach((metric) => {
      if (!metric?.value || !metric?.label) return;
      lines.push(`${metric.value} – ${metric.label}`);
    });
  }

  return lines;
}

function createPartyLines(billTo = {}) {
  if (!billTo) return [];
  const lines = [];
  if (billTo.company) lines.push(billTo.company);
  if (billTo.contact) lines.push(billTo.contact);
  if (billTo.email) lines.push(billTo.email);
  if (billTo.phone) lines.push(billTo.phone);
  if (billTo.address) lines.push(billTo.address);
  return lines;
}

function createIssuerLines(data) {
  const org = data?.org || {};
  const lines = [];
  const issuer = org.legalName || org.name;
  if (issuer) lines.push(issuer);
  const address = formatOrgAddress(org.location || {});
  if (address) lines.push(address);
  if (org.email) lines.push(org.email);
  if (org.phone) lines.push(org.phone);
  return lines;
}

function formatOrgAddress(location = {}) {
  const locality = [location.addressLocality, location.addressRegion]
    .filter(Boolean)
    .join(", ");
  const parts = [
    location.streetAddress,
    locality,
    location.postalCode,
    location.addressCountry,
  ];
  return parts.filter(Boolean).join(", ");
}

function createPartyBlock(title, lines) {
  const block = document.createElement("section");
  block.className = "custom-invoice__party";
  const heading = document.createElement("h4");
  heading.textContent = title;
  block.appendChild(heading);
  lines.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    block.appendChild(p);
  });
  return block;
}

function createSimplePdf(lines) {
  const encoder = new TextEncoder();
  const sanitizedLines = lines.map((line) => escapePdfText(line || ""));
  let stream = "BT\n/F1 12 Tf\n14 TL\n72 780 Td\n";
  sanitizedLines.forEach((line, index) => {
    const content = line || " ";
    if (index === 0) {
      stream += `(${content}) Tj\n`;
    } else {
      stream += `T* (${content}) Tj\n`;
    }
  });
  stream += "ET";
  const streamLength = encoder.encode(stream).length;
  const objects = [
    { id: 1, content: "<< /Type /Catalog /Pages 2 0 R >>" },
    { id: 2, content: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    {
      id: 3,
      content:
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    },
    { id: 4, content: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
    { id: 5, content: `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream` },
  ];
  const header = "%PDF-1.4\n";
  const pdfParts = [header];
  const offsets = [0];
  let position = encoder.encode(header).length;
  objects.forEach((obj) => {
    const objStr = `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
    offsets.push(position);
    pdfParts.push(objStr);
    position += encoder.encode(objStr).length;
  });
  const xrefStart = position;
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdfParts.push(xref);
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  pdfParts.push(trailer);
  const pdfString = pdfParts.join("");
  return new Blob([encoder.encode(pdfString)], { type: "application/pdf" });
}

function escapePdfText(value) {
  return String(value)
    .replace(/[\\()]/g, (match) => `\\${match}`)
    .replace(/[\r\n]+/g, " ")
    .replace(/[\u2013\u2014]/g, "-");
}
