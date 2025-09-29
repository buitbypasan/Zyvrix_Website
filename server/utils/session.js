import crypto from "crypto";
import { config } from "../config.js";
import { normalizeRole } from "./roles.js";

export function buildSession(customer, overrides = {}) {
  const createdAt = overrides.createdAt ? new Date(overrides.createdAt) : new Date();
  const ttlHours = Number(config.auth?.sessionTtlHours || 72);
  const ttlMs = Number.isFinite(ttlHours) && ttlHours > 0 ? ttlHours * 60 * 60 * 1000 : 72 * 60 * 60 * 1000;
  const expiresAt = overrides.expiresAt
    ? new Date(overrides.expiresAt)
    : new Date(createdAt.getTime() + ttlMs);

  const safeCreatedAt = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
  const safeExpiresAt = Number.isNaN(expiresAt.getTime())
    ? new Date(safeCreatedAt.getTime() + ttlMs)
    : expiresAt;

  return {
    token: overrides.token || crypto.randomBytes(32).toString("hex"),
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: normalizeRole(customer.role),
    },
    createdAt: safeCreatedAt.toISOString(),
    expiresAt: safeExpiresAt.toISOString(),
    provider: customer.provider || overrides.provider || null,
  };
}
