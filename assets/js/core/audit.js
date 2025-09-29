const DEFAULT_TABLE = "secure_it_audit_log";

function getAuditTable() {
  return window.ENV?.auditTable || DEFAULT_TABLE;
}

function getAuditKey() {
  return window.ENV?.auditKey || "";
}

function maskEmail(value = "") {
  if (!value.includes("@")) return value || "";
  const [name, domain] = value.split("@");
  if (!domain) return value;
  const visible = name ? name.slice(0, 1) : "";
  return `${visible}***@${domain}`;
}

async function digestPayload(payload) {
  const message = JSON.stringify(payload || {});
  if (!window.crypto?.subtle) {
    try {
      return btoa(message).slice(0, 42);
    } catch (error) {
      return message.slice(0, 42);
    }
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function logCustomerEvent(event, payload = {}) {
  if (!event) return null;
  const table = getAuditTable();
  const baseRecord = {
    event,
    timestamp: new Date().toISOString(),
    planId: payload.planId || null,
    serviceIds: Array.isArray(payload.serviceIds) ? payload.serviceIds : [],
    amount: typeof payload.amount === "number" ? payload.amount : null,
    currency: payload.currency || "AUD",
    actor: payload.email ? maskEmail(payload.email) : null,
  };
  const fingerprintSource = {
    ...baseRecord,
    auditKey: getAuditKey(),
  };
  const fingerprint = await digestPayload(fingerprintSource);
  const record = {
    ...baseRecord,
    fingerprint,
  };
  try {
    const existing = JSON.parse(sessionStorage.getItem(table) || "[]");
    existing.push(record);
    sessionStorage.setItem(table, JSON.stringify(existing));
  } catch (error) {
    // Swallow errors — logging is best-effort only.
  }
  return record;
}
