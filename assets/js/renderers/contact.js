import { byId, formatCurrency } from "../core/utils.js";
import { populateContactDetails } from "./shared.js";
import { isEcommerceEnabled } from "../core/siteMode.js";

export function renderContactPage(data) {
  const ecommerceEnabled = isEcommerceEnabled();
  const pageConfig = data.pages?.contact || {};
  const intro = byId("contactIntro");
  if (intro) {
    intro.textContent = ecommerceEnabled
      ? pageConfig.intro || ""
      : data.contact?.basicCopy || pageConfig.intro || "";
  }

  const metaHeading = byId("contactHeading");
  if (metaHeading) {
    metaHeading.textContent = ecommerceEnabled
      ? data.contact?.heading || ""
      : data.contact?.basicHeading || data.contact?.heading || "";
  }

  populateContactDetails(data);

  const form = byId("contactForm2");
  if (form) {
    form.dataset.formKey = ecommerceEnabled ? "contact" : "basicContact";
    const hiddenField = form.querySelector("input[name='form']");
    if (hiddenField) {
      hiddenField.value = ecommerceEnabled ? "Contact page" : "Contact page (basic site)";
    }
  }

  const notice = byId("contactModeNotice");
  if (notice) {
    if (!ecommerceEnabled) {
      notice.hidden = false;
      notice.textContent =
        pageConfig.basicNotice ||
        "Detailed package selection is available in the e-commerce experience. Share a quick note below and we'll follow up personally.";
    } else {
      notice.hidden = true;
      notice.textContent = "";
    }
  }

  const packagesTarget = byId("contactPackages");
  if (packagesTarget) {
    packagesTarget.innerHTML = "";
    const fieldset = packagesTarget.closest("fieldset");
    if (!ecommerceEnabled) {
      if (fieldset) {
        fieldset.hidden = true;
      }
    } else {
      if (fieldset) {
        fieldset.hidden = false;
      }
      const fallbackCurrency = data.billing?.currency || "AUD";
      const packageOptions = (data.pricingGroups || []).flatMap((group) =>
        (group.plans || []).map((plan) => ({
          value: `${group.label} — ${plan.label}`,
          label: `${group.label} — ${plan.label}`,
          summary: plan.summary || "",
          priceLabel: plan.price
            ? formatCurrency(plan.price, plan.currency || fallbackCurrency)
            : "Custom pricing",
          hasPrice: Boolean(plan.price),
        }))
      );

      if (packageOptions.length === 0) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent =
          "Package options are being finalised. Share your goals in the project background field.";
        packagesTarget.appendChild(empty);
      } else {
        packageOptions.forEach((pkg, index) => {
          const option = document.createElement("label");
          option.className = "service-option package-option";

          const input = document.createElement("input");
          input.type = "radio";
          input.name = "package";
          input.value = pkg.value;
          if (index === 0) {
            input.required = true;
            input.dataset.required = "true";
          }

          const content = document.createElement("span");

          const title = document.createElement("strong");
          title.textContent = pkg.label;
          content.appendChild(title);

          if (pkg.priceLabel) {
            const price = document.createElement("em");
            price.textContent = pkg.hasPrice
              ? `${pkg.priceLabel} + GST`
              : pkg.priceLabel;
            content.appendChild(price);
          }

          if (pkg.summary) {
            const summary = document.createElement("p");
            summary.textContent = pkg.summary;
            content.appendChild(summary);
          }

          option.append(input, content);
          packagesTarget.appendChild(option);
        });
      }
    }
  }

  const servicesTarget = byId("contactServices");
  if (servicesTarget) {
    servicesTarget.innerHTML = "";
    const fieldset = servicesTarget.closest("fieldset");
    if (!ecommerceEnabled) {
      if (fieldset) {
        fieldset.hidden = true;
      }
    } else {
      if (fieldset) {
        fieldset.hidden = false;
      }
      (data.serviceCatalog || []).forEach((service) => {
        const item = document.createElement("label");
        item.className = "service-option";
        item.innerHTML = `
          <input type="checkbox" name="services" value="${service.title}" />
          <span>
            <strong>${service.title}</strong>
            <em>${service.priceLabel || "Tailored pricing"}</em>
            <p>${service.description}</p>
          </span>
        `;
        servicesTarget.appendChild(item);
      });
    }
  }
}
