import express from "express";
import crypto from "crypto";
import { pool } from "../db.js";
import { config } from "../config.js";
import { buildSession } from "../utils/session.js";
import { createPasswordHash, verifyPassword } from "../utils/password.js";
import { normalizeRole, resolveRole } from "../utils/roles.js";

const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

function sanitizeCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.full_name || row.name || "",
    email: row.email,
    role: normalizeRole(row.role),
    provider: row.provider || null,
  };
}

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const requestedRole = req.body?.role;
    const accessCode = req.body?.accessCode;

    if (!name || !email || !password) {
      res.status(400).json({ ok: false, error: "Name, email, and password are required." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ ok: false, error: "Enter a valid email address." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });
      return;
    }

    const [existingRows] = await pool.execute(
      "SELECT id FROM customers WHERE email = ? LIMIT 1",
      [email]
    );
    if (existingRows.length) {
      res.status(409).json({ ok: false, error: "An account with that email already exists." });
      return;
    }

    const role = resolveRole(requestedRole, accessCode, config.auth.roleCodes, config.auth.defaultRole);
    const { hash, salt } = await createPasswordHash(password);

    const [result] = await pool.execute(
      "INSERT INTO customers (full_name, email, password_hash, salt, role, provider) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hash, salt, role, null]
    );

    const customer = {
      id: result.insertId,
      name,
      email,
      role,
      provider: null,
    };
    const session = buildSession(customer);
    res.status(201).json({ ok: true, customer, session });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      res.status(400).json({ ok: false, error: "Email and password are required." });
      return;
    }

    const [rows] = await pool.execute(
      "SELECT id, full_name, email, password_hash, role, provider FROM customers WHERE email = ? LIMIT 1",
      [email]
    );
    const record = rows[0];
    if (!record) {
      res.status(401).json({ ok: false, error: "No account found for that email." });
      return;
    }

    const passwordMatches = await verifyPassword(password, record.password_hash);
    if (!passwordMatches) {
      res.status(401).json({ ok: false, error: "Incorrect password. Please try again." });
      return;
    }

    const customer = sanitizeCustomer(record);
    const session = buildSession(customer);
    res.json({ ok: true, customer, session });
  })
);

router.post(
  "/provider",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const nameInput = String(req.body?.name || "").trim();
    const provider = String(req.body?.provider || "google").trim() || "google";

    if (!email) {
      res.status(400).json({ ok: false, error: "Provider sign-in requires an email address." });
      return;
    }

    const [rows] = await pool.execute(
      "SELECT id, full_name, email, role, provider FROM customers WHERE email = ? LIMIT 1",
      [email]
    );

    let record = rows[0];
    if (!record) {
      const resolvedName = nameInput || email;
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const { hash, salt } = await createPasswordHash(randomPassword);
      const role = normalizeRole(config.auth.defaultProviderRole || config.auth.defaultRole);
      const [result] = await pool.execute(
        "INSERT INTO customers (full_name, email, password_hash, salt, role, provider) VALUES (?, ?, ?, ?, ?, ?)",
        [resolvedName, email, hash, salt, role, provider]
      );
      record = {
        id: result.insertId,
        full_name: resolvedName,
        email,
        role,
        provider,
      };
    } else if (provider && record.provider !== provider) {
      await pool.execute("UPDATE customers SET provider = ? WHERE id = ?", [provider, record.id]);
      record.provider = provider;
    }

    const customer = sanitizeCustomer(record);
    const session = buildSession(customer);
    res.json({ ok: true, customer, session });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    // Token invalidation would occur here if persisted server-side.
    res.json({ ok: true });
  })
);

export default router;
