import { byId } from "../core/utils.js";
import { renderTeamSpotlight, renderFaqs } from "./shared.js";
import { isEcommerceEnabled } from "../core/siteMode.js";

export function renderHomePage(data) {
  const page = data.pages?.home;
  if (!page) return;
  const ecommerceEnabled = isEcommerceEnabled();
  const hero = page.hero || {};
  const heroEyebrow = byId("heroEyebrow");
  const heroTitle = byId("heroTitle");
  const heroSubtitle = byId("heroSubtitle");
  const heroPrimary = byId("heroPrimary");
  const heroSecondary = byId("heroSecondary");
  if (heroEyebrow) heroEyebrow.textContent = hero.eyebrow || "";
  if (heroTitle) heroTitle.textContent = hero.title || "";
  if (heroSubtitle) heroSubtitle.textContent = hero.subtitle || "";
  if (heroPrimary) {
    const showPrimary = ecommerceEnabled && hero.primaryCta?.label;
    heroPrimary.textContent = showPrimary ? hero.primaryCta.label : "";
    heroPrimary.href = showPrimary ? hero.primaryCta.href : "#";
    heroPrimary.toggleAttribute("hidden", !showPrimary);
  }
  if (heroSecondary) {
    heroSecondary.textContent = hero.secondaryCta?.label || "";
    heroSecondary.href = hero.secondaryCta?.href || "#";
  }
  const heroMetrics = byId("heroMetrics");
  if (heroMetrics) {
    heroMetrics.innerHTML = "";
    // Metrics are data-driven so marketing can refresh proof points without touching HTML.
    (hero.metrics || []).forEach((metric) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${metric.value}</strong>
        <span>${metric.label}</span>
      `;
      heroMetrics.appendChild(div);
    });
  }

  const servicesHeading = byId("servicesHeading");
  if (servicesHeading) servicesHeading.textContent = page.services?.heading || "";
  const servicesCards = byId("servicesCards");
  if (servicesCards) {
    const servicesSection = servicesCards.closest(".services");
    if (servicesSection) servicesSection.toggleAttribute("hidden", !ecommerceEnabled);
    servicesCards.innerHTML = "";
    if (ecommerceEnabled) {
      (page.services?.cards || []).forEach((card) => {
        const article = document.createElement("article");
        article.className = "service-card js-reveal";
        const icon = card.icon ? `<span class="service-card__icon">${card.icon}</span>` : "";
        const highlights = (card.highlights || [])
          .map((item) => `<li>${item}</li>`)
          .join("");
        article.innerHTML = `
          ${icon}
          <div class="service-card__body">
            <h3>${card.title}</h3>
            <p>${card.description}</p>
            ${highlights ? `<ul>${highlights}</ul>` : ""}
          </div>
        `;
        servicesCards.appendChild(article);
      });
    }
  }

  const addOns = page.addOns || {};
  const addOnsEyebrow = byId("addOnsEyebrow");
  if (addOnsEyebrow) addOnsEyebrow.textContent = addOns.eyebrow || "";
  const addOnsHeading = byId("addOnsHeading");
  if (addOnsHeading) addOnsHeading.textContent = addOns.heading || "";
  const addOnsCopy = byId("addOnsCopy");
  if (addOnsCopy) addOnsCopy.textContent = addOns.copy || "";
  const addOnsCards = byId("addOnsCards");
  if (addOnsCards) {
    const addOnsSection = addOnsCards.closest(".add-ons");
    if (addOnsSection) addOnsSection.toggleAttribute("hidden", !ecommerceEnabled);
    addOnsCards.innerHTML = "";
    if (ecommerceEnabled) {
      (addOns.cards || []).forEach((card) => {
        const article = document.createElement("article");
        article.className = "add-on-card js-reveal";
        const highlights = (card.highlights || [])
          .map((item) => `<li>${item}</li>`)
          .join("");
        const image = card.image
          ? `<figure class="add-on-figure"><img src="${card.image}" alt="${card.title}" /></figure>`
          : "";
        article.innerHTML = `
          ${image}
          <div class="add-on-body">
            <h3>${card.title}</h3>
            <p class="price">${card.price || ""}</p>
            <p>${card.description || ""}</p>
            <ul>${highlights}</ul>
          </div>
        `;
        addOnsCards.appendChild(article);
      });
    }
  }

  const highlightsHeading = byId("highlightsHeading");
  if (highlightsHeading) highlightsHeading.textContent = page.highlights?.heading || "";
  const highlightsGrid = byId("highlightsGrid");
  if (highlightsGrid) {
    highlightsGrid.innerHTML = "";
    (page.highlights?.items || []).forEach((item) => {
      const card = document.createElement("article");
      card.className = "outcome-card js-reveal";
      card.innerHTML = `
        <figure>
          <img src="${item.img}" alt="${item.alt}" />
        </figure>
        <div class="outcome-card__body">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          ${(item.metrics || [])
            .map(
              (metric) => `
                <span class="metric">
                  <strong>${metric.value}</strong>
                  <small>${metric.label}</small>
                </span>
              `
            )
            .join("")}
        </div>
      `;
      highlightsGrid.appendChild(card);
    });
  }

  const galleryHeading = byId("galleryHeading");
  if (galleryHeading) galleryHeading.textContent = page.gallery?.heading || "";
  const galleryCopy = byId("galleryCopy");
  if (galleryCopy) galleryCopy.textContent = page.gallery?.copy || "";
  const galleryGrid = byId("galleryGrid");
  if (galleryGrid) {
    galleryGrid.innerHTML = "";
    (page.gallery?.items || []).forEach((item) => {
      const figure = document.createElement("figure");
      figure.className = "gallery-card js-reveal";
      figure.innerHTML = `
        <img src="${item.img}" alt="${item.alt}" />
        <figcaption>
          <strong>${item.title}</strong>
          <span>${item.caption || ""}</span>
        </figcaption>
      `;
      galleryGrid.appendChild(figure);
    });
  }

  const testimonialsHeading = byId("testimonialsHeading");
  if (testimonialsHeading)
    testimonialsHeading.textContent = page.testimonials?.heading || "";
  const testimonialList = byId("testimonialsList");
  if (testimonialList) {
    testimonialList.innerHTML = "";
    (page.testimonials?.items || []).forEach((item) => {
      const block = document.createElement("blockquote");
      block.className = "quote-card js-reveal";
      block.innerHTML = `“${item.quote}”<cite>— ${item.author}</cite>`;
      testimonialList.appendChild(block);
    });
  }

  renderTeamSpotlight(page.spotlight, data.team, data.socials);
  renderFaqs(byId("faqsContainer"), data.faqs);

  const contactHeading = byId("homeContactHeading");
  if (contactHeading) contactHeading.textContent = page.contact?.heading || "";
  const contactPoints = byId("homeContactPoints");
  if (contactPoints) {
    contactPoints.innerHTML = "";
    (page.contact?.points || []).forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      contactPoints.appendChild(li);
    });
  }
  const contactCopy = byId("contactCopy");
  if (contactCopy) contactCopy.textContent = data.contact?.copy || "";
}
