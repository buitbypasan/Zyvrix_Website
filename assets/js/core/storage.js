const SELECTED_SERVICES_KEY = "selectedServices";

export function savePlanSelection(plan) {
  if (!plan) return;
  const payload = {
    ...plan,
    time: new Date().toISOString(),
  };
  localStorage.setItem("selectedPlan", JSON.stringify(payload));
}

export function getSelectedPlan() {
  try {
    return JSON.parse(localStorage.getItem("selectedPlan") || "null");
  } catch (error) {
    return null;
  }
}

export function getSelectedServices() {
  try {
    return JSON.parse(localStorage.getItem(SELECTED_SERVICES_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

export function setSelectedServices(services = []) {
  const unique = Array.from(
    new Set((Array.isArray(services) ? services : []).filter(Boolean))
  );
  localStorage.setItem(SELECTED_SERVICES_KEY, JSON.stringify(unique));
  if (typeof document !== "undefined") {
    document.dispatchEvent(
      new CustomEvent("cart:selectedServices", { detail: { ids: unique } })
    );
  }
  return unique;
}

export function toggleSelectedService(id) {
  if (!id) return getSelectedServices();
  const current = new Set(getSelectedServices());
  if (current.has(id)) {
    current.delete(id);
  } else {
    current.add(id);
  }
  return setSelectedServices([...current]);
}

export function getLastOrder() {
  try {
    return JSON.parse(localStorage.getItem("lastOrder") || "null");
  } catch (error) {
    return null;
  }
}

export function storeLastOrder(order) {
  if (!order) return;
  const services = Array.isArray(order.services)
    ? order.services.map((service) => ({
        id: service.id,
        title: service.title,
        priceLabel: service.priceLabel || null,
        price: service.price || null,
      }))
    : [];
  const payload = {
    ...order,
    services,
    billingAddress: order.billingAddress || null,
    cardLast4: order.cardLast4 || null,
  };
  localStorage.setItem("lastOrder", JSON.stringify(payload));
}
