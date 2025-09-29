import { buildUrl, setMeta } from "./utils.js";

export function updateHeadMeta(data, pageKey) {
  const meta =
    data.pages?.[pageKey]?.meta || data.seoContent?.[pageKey] || {};
  const title = meta.title || data.org?.name || document.title;
  document.title = title;
  const description = meta.description || data.org?.description || "";
  setMeta("name", "description", description);
  const keywords = meta.keywords || data.seo?.defaultKeywords || "";
  setMeta("name", "keywords", keywords);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  const siteName = data.seo?.siteName || data.org?.name || "";
  if (siteName) setMeta("property", "og:site_name", siteName);
  const author = data.seo?.author || data.org?.name || "";
  if (author) setMeta("name", "author", author);
  const robots = data.seo?.robots;
  if (robots) setMeta("name", "robots", robots);
  const themeColor = data.seo?.themeColor;
  if (themeColor) setMeta("name", "theme-color", themeColor);
  const twitterSite = data.seo?.twitterHandle;
  if (twitterSite) setMeta("name", "twitter:site", twitterSite);
  const twitterCreator = data.seo?.twitterCreator || twitterSite;
  if (twitterCreator) setMeta("name", "twitter:creator", twitterCreator);

  const canonical = document.querySelector("link[rel='canonical']");
  const url = buildUrl(meta.path || pageKey, data.org?.url);
  if (canonical && url) canonical.setAttribute("href", url);
  setMeta("property", "og:url", url);
  const image = buildUrl(meta.image || data.seo?.ogImage, data.org?.url);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:image", image);
}

export function injectOrganizationSchema(data) {
  const script =
    document.getElementById("orgJsonLd") || document.createElement("script");
  script.type = "application/ld+json";
  script.id = "orgJsonLd";
  const org = data.org || {};
  const payload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    legalName: org.legalName,
    url: org.url,
    logo: buildUrl(org.logo, org.url),
    description: org.description,
    sameAs: org.sameAs,
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: org.email,
        telephone: org.phone,
        contactType: "customer support",
        availableLanguage: ["English"],
      },
    ],
  };
  if (org.location) {
    payload.address = {
      "@type": "PostalAddress",
      ...org.location,
    };
  }
  script.textContent = JSON.stringify(payload);
  if (!script.parentElement) document.head.appendChild(script);
}

export function injectServiceSchema(data) {
  const graph = [];
  const org = data.org || {};
  const services = [];
  const home = data.pages?.home || {};
  (home.services?.cards || []).forEach((card) => {
    services.push({
      name: card.title,
      description: card.description,
      category: "Core engagements",
    });
  });
  (data.serviceCatalog || []).forEach((service) => {
    services.push({
      name: service.title,
      description: service.description,
      category: service.category || "Specialist services",
    });
  });
  if (services.length) {
    graph.push({
      "@type": "ItemList",
      name: "Zyvrix service catalog",
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          category: service.category,
          provider: {
            "@type": "Organization",
            name: org.name,
            url: org.url,
          },
        },
      })),
    });
  }
  const faqs = data.faqs || [];
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }
  const script =
    document.getElementById("servicesJsonLd") ||
    document.createElement("script");
  if (!graph.length) {
    if (script.parentElement) script.parentElement.removeChild(script);
    return;
  }
  script.type = "application/ld+json";
  script.id = "servicesJsonLd";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
  if (!script.parentElement) document.head.appendChild(script);
}
