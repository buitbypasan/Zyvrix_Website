export const ROLE_LABELS = {
  admin: "Admin",
  staff: "Staff",
  loyalty: "Loyalty customer",
  basic: "Basic customer",
};

export const DEFAULT_ROLE = "basic";

export function normalizeRole(role) {
  const value = String(role || "")
    .toLowerCase()
    .trim();
  if (value === "loyalty_customer" || value === "loyalty-customers") {
    return "loyalty";
  }
  if (value === "customer" || value === "basic customer") {
    return "basic";
  }
  if (ROLE_LABELS[value]) {
    return value;
  }
  return DEFAULT_ROLE;
}

export function resolveRole(requestedRole, accessCode, roleCodes = {}, defaultRole = DEFAULT_ROLE) {
  const trimmedCode = String(accessCode || "").trim();
  const normalizedCodes = Object.entries(roleCodes || {}).reduce((acc, [key, value]) => {
    if (!value) return acc;
    acc[normalizeRole(key)] = String(value).trim();
    return acc;
  }, {});
  if (trimmedCode) {
    const match = Object.entries(normalizedCodes).find(([, code]) =>
      String(code || "").toLowerCase() === trimmedCode.toLowerCase()
    );
    if (match) {
      return normalizeRole(match[0]);
    }
  }
  const normalized = normalizeRole(requestedRole);
  if ((normalized === "admin" || normalized === "staff") && !trimmedCode) {
    return defaultRole;
  }
  return normalized || defaultRole;
}
