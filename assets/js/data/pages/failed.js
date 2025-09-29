import { seoContent } from "../site/seo.js";

export const failedPage = {
  meta: seoContent.failed,
  heading: "Payment unsuccessful",
  body:
    "Your payment was not completed. No charges were made. You can retry below or contact us for manual invoicing support.",
  actions: [
    { label: "Try again", href: "payment.html" },
    { label: "Contact support", href: "contact.html", variant: "ghost" },
  ],
};
