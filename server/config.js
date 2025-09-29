import dotenv from "dotenv";
import { DEFAULT_ROLE, normalizeRole } from "./utils/roles.js";

dotenv.config();

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOrigins(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const sessionTtlHours = parseNumber(process.env.AUTH_SESSION_TTL_HOURS, 72);
const defaultRole = normalizeRole(process.env.AUTH_DEFAULT_ROLE) || DEFAULT_ROLE;
const defaultProviderRole =
  normalizeRole(process.env.AUTH_DEFAULT_PROVIDER_ROLE) || defaultRole;

const rawRoleCodes = {
  admin: process.env.AUTH_ROLE_CODE_ADMIN,
  staff: process.env.AUTH_ROLE_CODE_STAFF,
  loyalty: process.env.AUTH_ROLE_CODE_LOYALTY,
  basic: process.env.AUTH_ROLE_CODE_BASIC,
};

const roleCodes = Object.entries(rawRoleCodes).reduce((acc, [role, code]) => {
  if (!code) return acc;
  acc[normalizeRole(role)] = String(code).trim();
  return acc;
}, {});

const corsOrigins = parseOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN);

export const config = {
  port: parseNumber(process.env.PORT || process.env.SERVER_PORT, 4000),
  cors: {
    origins: corsOrigins,
  },
  db: {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || "127.0.0.1",
    port: parseNumber(process.env.DB_PORT || process.env.MYSQL_PORT, 3306),
    name: process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQL_DB || "secure_it",
    user: process.env.DB_USER || process.env.MYSQL_USER || "secure_app",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
    connectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT, 10),
  },
  auth: {
    sessionTtlHours,
    defaultRole,
    defaultProviderRole,
    roleCodes,
    bcryptRounds: parseNumber(process.env.BCRYPT_ROUNDS, 12),
  },
};

export default config;
