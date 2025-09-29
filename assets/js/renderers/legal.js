import { byId } from "../core/utils.js";

export function renderLegalPage(data) {
  const page = data.pages?.legal;
  if (!page) return;
  const heading = byId("legalHeading");
  if (heading) heading.textContent = page.heading || "Privacy & legal";
  const intro = byId("legalIntro");
  if (intro) intro.textContent = page.intro || "";

  const sectionsContainer = byId("legalSections");
  if (sectionsContainer) {
    sectionsContainer.innerHTML = "";
    (page.sections || []).forEach((section) => {
      const article = document.createElement("article");
      if (section.id) article.id = section.id;
      article.innerHTML = `
        <h2>${section.title || ""}</h2>
        ${(section.body || [])
          .map((paragraph) => `<p>${paragraph}</p>`)
          .join("")}
        ${Array.isArray(section.bullets) && section.bullets.length
          ? `<ul>${section.bullets
              .map((item) => `<li>${item}</li>`)
              .join("")}</ul>`
          : ""}
      `;
      sectionsContainer.appendChild(article);
    });
  }

  const contact = byId("legalContact");
  if (contact) {
    const info = page.contact || {};
    const emailLink = info.email
      ? `<a href="mailto:${info.email}">${info.email}</a>`
      : "";
    const phoneLink = info.phone
      ? `<a href="tel:${info.phone.replace(/[^+\d]/g, "")}">${info.phone}</a>`
      : "";
    contact.innerHTML = `
      <article class="legal-contact__card">
        <h2>${info.heading || "Talk with our team"}</h2>
        <p>${info.copy || ""}</p>
        <ul>
          ${emailLink ? `<li><strong>Email:</strong> ${emailLink}</li>` : ""}
          ${phoneLink ? `<li><strong>Phone:</strong> ${phoneLink}</li>` : ""}
        </ul>
      </article>
    `;
  }
}
