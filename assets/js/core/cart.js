import { byId, formatCurrency } from "./utils.js";
import { getSelectedServices, setSelectedServices } from "./storage.js";
import { isEcommerceEnabled } from "./siteMode.js";

const CART_DRAWER_ID = "cartDrawer";
const CART_COUNT_ID = "cartCount";
const CART_ITEMS_ID = "cartItems";
const CART_TOTAL_ID = "cartTotal";
const CART_STATUS_ID = "cartStatus";
const SELECTED_EVENT = "cart:selectedServices";

let serviceIndex = new Map();
let cartIds = new Set();
let statusTimeout;
let billingCurrency = "AUD";
let lastCartTrigger = null;

function ensureMobileActionsContainer() {
  const mobileNav = document.getElementById("mobileNav");
  if (!mobileNav) return null;
  let actions = mobileNav.querySelector("[data-mobile-actions]");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "mobile-nav__actions";
    actions.setAttribute("data-mobile-actions", "");
    mobileNav.appendChild(actions);
  }
  return actions;
}

function closeMobileNav() {
  const mobileNav = document.getElementById("mobileNav");
  const toggle = document.getElementById("mobileNavToggle");
  if (!mobileNav || !mobileNav.classList.contains("is-open")) return;
  mobileNav.classList.remove("is-open");
  mobileNav.setAttribute("hidden", "hidden");
  document.body.classList.remove("nav-open");
  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
  }
}

function ensureMobileCartToggle() {
  const actions = ensureMobileActionsContainer();
  if (!actions) return null;
  let button = actions.querySelector("[data-cart-nav]");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-ghost cart-toggle";
    button.setAttribute("data-cart-nav", "");
    button.setAttribute("data-cart-trigger", "");
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "View cart");
    button.innerHTML = `
      <span class="cart-toggle__icon" aria-hidden="true">🛒</span>
      <span class="cart-toggle__label">Cart</span>
      <span class="cart-count" data-cart-count aria-live="polite">0</span>
    `;
    actions.prepend(button);
  }
  if (!button.dataset.boundCartToggle) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      lastCartTrigger = event.currentTarget;
      closeMobileNav();
      toggleCartDrawer();
    });
    button.dataset.boundCartToggle = "true";
  }
  return button;
}

function toggleCartDrawer() {
  const drawer = byId(CART_DRAWER_ID);
  if (!drawer) return;
  if (drawer.classList.contains("is-open")) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

function ensureCartToggle() {
  const cartSlot = document.querySelector("[data-cart-slot]");
  if (!cartSlot) return null;
  let toggle = cartSlot.querySelector("#cartToggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.id = "cartToggle";
    toggle.type = "button";
    toggle.className = "btn btn-ghost cart-toggle";
    toggle.setAttribute("aria-haspopup", "dialog");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "View cart");
    toggle.innerHTML = `
      <span class="cart-toggle__icon" aria-hidden="true">🛒</span>
      <span class="cart-toggle__label">Cart</span>
      <span class="cart-count" id="${CART_COUNT_ID}" data-cart-count aria-live="polite">0</span>
    `;
    cartSlot.appendChild(toggle);
  }
  toggle.setAttribute("data-cart-trigger", "");
  if (!toggle.dataset.boundCartToggle) {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      lastCartTrigger = event.currentTarget;
      toggleCartDrawer();
    });
    toggle.dataset.boundCartToggle = "true";
  }
  ensureMobileCartToggle();
  return toggle;
}

function ensureStatusElement() {
  let status = byId(CART_STATUS_ID);
  if (!status) {
    status = document.createElement("div");
    status.id = CART_STATUS_ID;
    status.className = "cart-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    document.body.appendChild(status);
  }
  return status;
}

function showStatus(message) {
  const status = ensureStatusElement();
  if (!status) return;
  status.textContent = message;
  status.classList.add("is-visible");
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    status.classList.remove("is-visible");
  }, 2400);
}

function buildDrawer() {
  let drawer = byId(CART_DRAWER_ID);
  if (!drawer) {
    drawer = document.createElement("div");
    drawer.id = CART_DRAWER_ID;
    drawer.className = "cart-drawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = `
      <div class="cart-drawer__overlay" data-cart-dismiss=""></div>
      <aside class="cart-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cartDrawerTitle">
        <header class="cart-drawer__header">
          <h2 id="cartDrawerTitle">Your cart</h2>
          <button class="cart-drawer__close" type="button" data-cart-dismiss="" aria-label="Close cart">×</button>
        </header>
        <div id="${CART_ITEMS_ID}" class="cart-drawer__body"></div>
        <footer class="cart-drawer__footer">
          <div class="cart-drawer__total">
            <span>Total</span>
            <strong id="${CART_TOTAL_ID}">0</strong>
          </div>
          <a class="btn" id="cartCheckoutButton" href="checkout.html">Go to checkout</a>
          <button class="btn btn-ghost" type="button" data-cart-clear="">Clear cart</button>
        </footer>
      </aside>
    `;
    document.body.appendChild(drawer);
  }
  drawer.querySelectorAll("[data-cart-dismiss]").forEach((element) => {
    element.addEventListener("click", closeDrawer);
  });
  const clearBtn = drawer.querySelector("[data-cart-clear]");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      setSelectedServices([]);
      showStatus("Cart cleared");
    });
  }
  const checkoutLink = drawer.querySelector("#cartCheckoutButton");
  if (checkoutLink) {
    checkoutLink.addEventListener("click", () => {
      closeDrawer();
    });
  }
  return drawer;
}

function openDrawer() {
  const drawer = byId(CART_DRAWER_ID);
  if (!drawer) return;
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document
    .querySelectorAll("[data-cart-trigger]")
    .forEach((trigger) => trigger.setAttribute("aria-expanded", "true"));
  const firstFocusable = drawer.querySelector(
    "button, a, input, textarea, select, [tabindex]:not([tabindex='-1'])"
  );
  if (firstFocusable) {
    setTimeout(() => firstFocusable.focus(), 100);
  }
}

function closeDrawer() {
  const drawer = byId(CART_DRAWER_ID);
  if (!drawer) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document
    .querySelectorAll("[data-cart-trigger]")
    .forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
  if (lastCartTrigger && typeof lastCartTrigger.focus === "function") {
    lastCartTrigger.focus();
  }
  lastCartTrigger = null;
}

function updateBadge() {
  const count = String(cartIds.size);
  const countEl = byId(CART_COUNT_ID);
  if (countEl) {
    countEl.textContent = count;
  }
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    if (element.id !== CART_COUNT_ID) {
      element.textContent = count;
    }
  });
  const checkoutButton = byId("cartCheckoutButton");
  if (checkoutButton) {
    checkoutButton.classList.toggle("is-disabled", !cartIds.size);
    checkoutButton.setAttribute("aria-disabled", String(!cartIds.size));
    checkoutButton.setAttribute("tabindex", cartIds.size ? "0" : "-1");
  }
}

function renderCartItems() {
  const container = byId(CART_ITEMS_ID);
  if (!container) return;
  const items = Array.from(cartIds)
    .map((id) => serviceIndex.get(id))
    .filter(Boolean);
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML =
      '<p class="cart-empty muted">Your cart is currently empty.</p>';
    const total = byId(CART_TOTAL_ID);
    if (total) total.textContent = "0";
    return;
  }
  const list = document.createElement("ul");
  list.className = "cart-line-items";
  let totalAmount = 0;
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-line-item";
    const price = Number.isFinite(Number(item.price))
      ? Number(item.price)
      : null;
    if (price !== null) {
      totalAmount += price;
    }
    const priceLabel =
      price !== null
        ? formatCurrency(price, billingCurrency)
        : item.priceLabel || "";
    li.innerHTML = `
      <div>
        <strong>${item.title}</strong>
        <span class="cart-line-item__meta">${
          item.category || "Consulting"
        }</span>
      </div>
      <div class="cart-line-item__actions">
        <span class="cart-line-item__price">${priceLabel}</span>
        <button type="button" class="btn btn-ghost cart-remove" data-cart-remove="${
          item.id
        }">Remove</button>
      </div>
    `;
    list.appendChild(li);
  });
  container.appendChild(list);
  container.querySelectorAll("[data-cart-remove]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.getAttribute("data-cart-remove");
      removeItem(id);
    });
  });
  const total = byId(CART_TOTAL_ID);
  if (total) {
    total.textContent = formatCurrency(totalAmount, billingCurrency);
  }
}

function syncFromSelected(ids = []) {
  cartIds = new Set(Array.isArray(ids) ? ids.filter(Boolean) : []);
  updateBadge();
  renderCartItems();
}

function addItem(id) {
  if (!id) return;
  const existing = new Set(cartIds);
  if (existing.has(id)) {
    const item = serviceIndex.get(id);
    showStatus(`${item?.title || "Service"} is already in your cart.`);
    return;
  }
  existing.add(id);
  cartIds = existing;
  setSelectedServices([...existing]);
  const item = serviceIndex.get(id);
  showStatus(`${item?.title || "Service"} added to cart.`);
}

function removeItem(id) {
  if (!id) return;
  const updated = Array.from(cartIds).filter((itemId) => itemId !== id);
  cartIds = new Set(updated);
  setSelectedServices(updated);
  const item = serviceIndex.get(id);
  showStatus(`${item?.title || "Service"} removed from cart.`);
}

function handleCartAdd(event) {
  const id = event.detail?.id || event.detail?.serviceId;
  if (!id) return;
  addItem(id);
}

function handleCartRemove(event) {
  const id = event.detail?.id || event.detail?.serviceId;
  if (!id) return;
  removeItem(id);
}

export function initCart(data) {
  const cartSlot = document.querySelector("[data-cart-slot]");
  if (!isEcommerceEnabled()) {
    if (cartSlot) cartSlot.setAttribute("hidden", "hidden");
    const mobileCart = document.querySelector("[data-cart-nav]");
    if (mobileCart) mobileCart.remove();
    return;
  }
  if (cartSlot) cartSlot.removeAttribute("hidden");
  serviceIndex = new Map(
    (data?.serviceCatalog || []).map((service) => [service.id, service])
  );
  billingCurrency = data?.billing?.currency || "AUD";
  ensureCartToggle();
  buildDrawer();
  document.addEventListener("cart:add", handleCartAdd);
  document.addEventListener("cart:remove", handleCartRemove);
  document.addEventListener(SELECTED_EVENT, (event) => {
    syncFromSelected(event.detail?.ids || []);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "selectedServices") {
      syncFromSelected(getSelectedServices());
    }
  });
  syncFromSelected(getSelectedServices());
}

export function addServiceToCart(id) {
  addItem(id);
}

export function clearCart() {
  cartIds = new Set();
  setSelectedServices([]);
}
