import {
  organization as org,
  seo,
  seoContent,
  navigation,
  socials,
  contact,
  forms,
  billing,
  footer,
  team,
  pricingGroups,
  serviceCatalog,
  quoteCalculator,
  faqs,
} from "./site/index.js";
import { pages } from "./pages/index.js";

export const data = {
  org,
  seo,
  seoContent,
  navigation,
  socials,
  contact,
  forms,
  footer,
  billing,
  team,
  pricingGroups,
  pages,
  serviceCatalog,
  quoteCalculator,
  faqs,
};

if (typeof window !== "undefined") {
  window.DATA = data;
}
