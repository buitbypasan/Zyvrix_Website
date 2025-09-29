import { homePage } from "./home.js";
import { aboutPage } from "./about.js";
import { pricingPage } from "./pricing/index.js";
import { contactPage } from "./contact.js";
import { checkoutPage } from "./checkout.js";
import { paymentPage } from "./payment.js";
import { successPage } from "./success.js";
import { failedPage } from "./failed.js";
import { detailPage } from "./detail.js";
import { legalPage } from "./legal.js";

export const pages = {
  home: homePage,
  about: aboutPage,
  pricing: pricingPage,
  contact: contactPage,
  checkout: checkoutPage,
  payment: paymentPage,
  success: successPage,
  failed: failedPage,
  detail: detailPage,
  legal: legalPage,
};
