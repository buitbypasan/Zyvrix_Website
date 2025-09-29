import { byId } from "../core/utils.js";

export function renderAboutPage(data) {
  const page = data.pages?.about;
  if (!page) return;
  const intro = byId("aboutIntro");
  if (intro) intro.textContent = page.intro || "";

  const pillarsHeading = byId("aboutPillarsHeading");
  if (pillarsHeading) pillarsHeading.textContent = page.pillarsHeading || "";
  const pillars = byId("aboutPillars");
  const pillarsSection = document.querySelector(".about-pillars");
  if (pillars) {
    pillars.innerHTML = "";
    // Pillars highlight our differentiators and can be edited from data.js without touching markup.
    (page.pillars || []).forEach((pillar) => {
      const card = document.createElement("article");
      card.className = "pillar-card";
      const highlights = (pillar.highlights || [])
        .map((item) => `<li>${item}</li>`)
        .join("");
      card.innerHTML = `
        <h3>${pillar.title}</h3>
        <p>${pillar.detail || ""}</p>
        ${highlights ? `<ul>${highlights}</ul>` : ""}
      `;
      pillars.appendChild(card);
    });
    if (pillarsSection) {
      pillarsSection.toggleAttribute(
        "hidden",
        !(page.pillars || []).length
      );
    }
  }

  const story = page.story || {};
  const storyCopy = byId("aboutStory");
  if (storyCopy) storyCopy.textContent = story.copy || "";
  const milestones = byId("aboutMilestones");
  if (milestones) {
    milestones.innerHTML = "";
    (story.milestones || []).forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.year}</strong><span>${item.detail}</span>`;
      milestones.appendChild(li);
    });
  }
  const storyFigure = byId("aboutStoryFigure");
  if (storyFigure) {
    const media = story.media;
    if (media?.img) {
      storyFigure.innerHTML = `
        <img src="${media.img}" alt="${media.alt || "Studio placeholder"}" />
        <figcaption>${media.caption || ""}</figcaption>
      `;
    } else {
      storyFigure.innerHTML = "";
    }
  }

  const mission = byId("aboutMission");
  if (mission) mission.textContent = page.mission || "";

  const valuesList = byId("valuesList");
  if (valuesList) {
    valuesList.innerHTML = "";
    (page.values || []).forEach((value) => {
      const li = document.createElement("li");
      li.textContent = value;
      valuesList.appendChild(li);
    });
  }

  const techList = byId("techList");
  if (techList) {
    techList.innerHTML = "";
    (page.techStack || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      techList.appendChild(li);
    });
  }

  const certs = byId("aboutCertifications");
  if (certs) {
    certs.innerHTML = "";
    (page.certifications || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      certs.appendChild(li);
    });
  }

  const impactGrid = byId("aboutImpact");
  if (impactGrid) {
    impactGrid.innerHTML = "";
    (page.impact || []).forEach((metric) => {
      const card = document.createElement("article");
      card.className = "impact-card";
      card.innerHTML = `
        <strong>${metric.metric}</strong>
        <span>${metric.label}</span>
        <p>${metric.detail}</p>
      `;
      impactGrid.appendChild(card);
    });
  }

  const approach = byId("aboutApproach");
  if (approach) {
    approach.innerHTML = "";
    (page.approach || []).forEach((step) => {
      const article = document.createElement("article");
      article.innerHTML = `<h3>${step.title}</h3><p>${step.detail}</p>`;
      approach.appendChild(article);
    });
  }

  const leadershipHeading = byId("aboutLeadershipHeading");
  if (leadershipHeading) leadershipHeading.textContent = page.leadership?.heading || "";
  const leadershipCopy = byId("aboutLeadershipCopy");
  if (leadershipCopy) leadershipCopy.textContent = page.leadership?.copy || "";
  const leadershipList = byId("aboutLeadershipDetails");
  if (leadershipList) {
    leadershipList.innerHTML = "";
    (page.leadership?.details || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      leadershipList.appendChild(li);
    });
    const leadershipArticle = leadershipList.closest("article");
    if (leadershipArticle) {
      const hasLeadershipContent = Boolean(
        page.leadership?.heading ||
          page.leadership?.copy ||
          (page.leadership?.details || []).length
      );
      leadershipArticle.toggleAttribute("hidden", !hasLeadershipContent);
    }
  }

  const assuranceHeading = byId("aboutAssuranceHeading");
  if (assuranceHeading) assuranceHeading.textContent = page.assurance?.heading || "";
  const assuranceList = byId("aboutAssuranceList");
  if (assuranceList) {
    assuranceList.innerHTML = "";
    (page.assurance?.commitments || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      assuranceList.appendChild(li);
    });
  }
  const assuranceCopy = byId("aboutAssuranceCopy");
  if (assuranceCopy) assuranceCopy.textContent = page.assurance?.copy || "";
  const assuranceArticle = assuranceCopy?.closest("article");
  if (assuranceArticle) {
    const hasAssuranceContent = Boolean(
      page.assurance?.heading ||
        page.assurance?.copy ||
        (page.assurance?.commitments || []).length
    );
    assuranceArticle.toggleAttribute("hidden", !hasAssuranceContent);
  }

  const community = byId("aboutCommunity");
  if (community) {
    community.innerHTML = "";
    (page.community || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      community.appendChild(li);
    });
  }

  const partners = byId("aboutPartners");
  if (partners) {
    partners.innerHTML = "";
    (page.partners || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      partners.appendChild(li);
    });
  }

  const gallery = byId("aboutGallery");
  if (gallery) {
    gallery.innerHTML = "";
    const media = page.gallery || {};
    (media.items || []).forEach((item) => {
      const figure = document.createElement("figure");
      figure.innerHTML = `
        <img src="${item.img}" alt="${item.alt}" />
        <figcaption>${item.caption || ""}</figcaption>
      `;
      gallery.appendChild(figure);
    });
  }
  const galleryCopy = byId("aboutGalleryCopy");
  if (galleryCopy) galleryCopy.textContent = page.gallery?.copy || "";

  const teamIntro = byId("teamIntro");
  if (teamIntro) teamIntro.textContent = page.teamIntro || "";
}
