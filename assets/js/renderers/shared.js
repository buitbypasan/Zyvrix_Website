import { formatCurrency, telHref } from "../core/utils.js";
import { byId } from "../core/utils.js";

export function renderTeamSpotlight(config = {}, team = [], socials = []) {
  const heading = byId("teamSpotlightHeading");
  const copy = byId("teamSpotlightCopy");
  const grid = byId("teamSpotlightGrid");
  if (!grid) return;
  if (heading) heading.textContent = config.heading || "";
  if (copy) copy.textContent = config.copy || "";

  const preferredIds = Array.isArray(config.memberIds)
    ? config.memberIds
    : config.memberId
    ? [config.memberId]
    : [];

  const orderedMembers = (preferredIds.length ? preferredIds : team.map((m) => m.id))
    .map((id) => team.find((member) => member.id === id))
    .filter(Boolean);

  if (!orderedMembers.length && team.length) {
    orderedMembers.push(team[0]);
  }

  grid.innerHTML = "";

  orderedMembers.forEach((member) => {
    const focus = (member.focus || [])
      .slice(0, 3)
      .map((item) => `<li>${item}</li>`)
      .join("");
    const testimonial = member.testimonial || "";
    const portfolio = member.portfolio || member.links?.[0]?.href || "#";
    const card = document.createElement("article");
    card.className = "spotlight-card js-reveal";
    const links = (member.links || [])
      .map(
        (link) => `
          <li>
            <a href="${link.href}" target="_blank" rel="noopener">
              ${link.label}
            </a>
          </li>
        `
      )
      .join("");
    card.innerHTML = `
      <header>
        <p class="eyebrow">${member.role}</p>
        <h3>${member.name}</h3>
        <p class="location">${member.location || ""}</p>
      </header>
      <p class="bio">${member.bio || ""}</p>
      ${testimonial ? `<blockquote class="founder-quote">${testimonial}</blockquote>` : ""}
      <h4>Common engagements</h4>
      <ul class="focus">${focus}</ul>
      <div class="spotlight-actions">
        <a class="btn" href="${portfolio}" target="_blank" rel="noopener">View portfolio</a>
      </div>

      <div class="spotlight-socials" aria-label="Follow Zyvrix"></div>
    `;

    const socialWrap = card.querySelector(".spotlight-socials");
    if (socialWrap && (socials || []).length) {
      const list = document.createElement("ul");
      list.className = "social";
      socials.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="${item.href}" aria-label="${item.aria || item.label}" target="_blank" rel="noopener">
            <span class="icon">${item.icon || ""}</span>
            <span class="sr-only">${item.label}</span>
          </a>
        `;
        list.appendChild(li);
      });
      socialWrap.appendChild(list);
    }

    grid.appendChild(card);
  });
}

export function renderFaqs(container, faqs = []) {
  if (!container) return;
  container.innerHTML = "";
  faqs.forEach((item) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = item.q;
    const p = document.createElement("p");
    p.textContent = item.a;
    details.appendChild(summary);
    details.appendChild(p);
    container.appendChild(details);
  });
}

export function fillCheckoutSummary(plan) {
  const orderSummary = byId("orderSummary");
  if (!orderSummary) return;
  if (!plan) {
    orderSummary.innerHTML =
      '<p>No plan selected. <a href="pricing.html">Choose a plan</a>.</p>';
    return;
  }
  orderSummary.innerHTML = `
    <h2>Order summary</h2>
    <p><strong>Plan:</strong> ${plan.name}</p>
    <p><strong>Price:</strong> ${formatCurrency(plan.price, plan.currency)}</p>
    <p class="muted">Selected at: ${new Date(plan.time).toLocaleString()}</p>
  `;
}

export function populateContactDetails(data) {
  const details = byId("contactDetails");
  if (!details) return;
  details.innerHTML = "";
  const list = [
    { label: "Email", value: data.org?.email, href: `mailto:${data.org?.email}` },
    { label: "Phone", value: data.org?.phone, href: telHref(data.org?.phone) },
    { label: "Location", value: data.contact?.locationLabel },
    { label: "Response time", value: data.contact?.responseTime },
  ];
  list
    .filter((item) => item.value)
    .forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = item.href
        ? `<strong>${item.label}:</strong> <a href="${item.href}">${item.value}</a>`
        : `<strong>${item.label}:</strong> ${item.value}`;
      details.appendChild(li);
    });
}

export function renderOtherServices(target, services = [], options = {}) {
  const {
    showCtas = false,
    linkLabel = "View details",
    selectable = false,
    selectedIds = [],
    recommendedIds = new Set(),
    onToggle,
    detailLink = false,
    scrollable = false,
    enableCart = false,
  } = options;
  if (!target) return;
  const selectedSet = new Set(selectedIds);
  const recommendedSet =
    recommendedIds instanceof Set
      ? recommendedIds
      : new Set(Array.isArray(recommendedIds) ? recommendedIds : []);
  target.innerHTML = "";
  if (scrollable) {
    // When requested, turn the grid into a horizontal rail that scrolls sideways.
    target.classList.add("service-chip-list");
  } else {
    target.classList.remove("service-chip-list");
  }
  services.forEach((service) => {
    const card = document.createElement("article");
    card.className = "service-chip";
    if (selectable) card.classList.add("service-chip--selectable");

    const header = document.createElement("header");
    header.className = "service-chip__header";
    const title = document.createElement("h4");
    title.textContent = service.title;
    header.appendChild(title);

    if (recommendedSet.has(service.id) || service.priceLabel) {
      const meta = document.createElement("div");
      meta.className = "service-chip__meta";
      if (recommendedSet.has(service.id)) {
        const badge = document.createElement("span");
        badge.className = "service-chip__badge";
        badge.textContent = "Recommended";
        meta.appendChild(badge);
      }
      if (service.priceLabel) {
        const price = document.createElement("span");
        price.className = "service-chip__price";
        price.textContent = service.priceLabel;
        meta.appendChild(price);
      }
      header.appendChild(meta);
    }

    card.appendChild(header);

    if (service.description) {
      const description = document.createElement("p");
      description.textContent = service.description;
      card.appendChild(description);
    }

    const actions = document.createElement("div");
    actions.className = "service-chip__actions";
    let hasActions = false;

    if (selectable) {
      const isSelected = selectedSet.has(service.id);
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = `btn ${isSelected ? "" : "btn-ghost"} service-chip__toggle`;
      toggle.textContent = isSelected ? "Remove from quote" : "Add to quote";
      toggle.setAttribute("aria-pressed", String(isSelected));
      toggle.addEventListener("click", () => {
        if (typeof onToggle === "function") {
          onToggle(service.id);
        }
      });
      actions.appendChild(toggle);
      hasActions = true;
    }

    if (showCtas) {
      const cta = document.createElement("a");
      cta.className = "btn btn-ghost";
      cta.href = `detail.html?type=service&id=${service.id}`;
      cta.textContent = linkLabel;
      actions.appendChild(cta);
      hasActions = true;
    } else if (detailLink) {
      const link = document.createElement("a");
      link.className = "detail-link";
      link.href = `detail.html?type=service&id=${service.id}`;
      link.textContent = linkLabel;
      actions.appendChild(link);
      hasActions = true;
    }

    if (enableCart) {
      const cartBtn = document.createElement("button");
      cartBtn.type = "button";
      cartBtn.className = "btn btn-ghost service-chip__cart";
      cartBtn.textContent = "Add to cart";
      cartBtn.setAttribute(
        "aria-label",
        `Add ${service.title} to your cart`
      );
      cartBtn.addEventListener("click", () => {
        document.dispatchEvent(
          new CustomEvent("cart:add", { detail: { id: service.id } })
        );
      });
      actions.appendChild(cartBtn);
      hasActions = true;
    }

    if (hasActions) {
      card.appendChild(actions);
    }

    target.appendChild(card);
  });
}
