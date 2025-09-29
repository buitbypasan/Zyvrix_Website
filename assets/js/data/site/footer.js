import { organization } from "./organization.js";
import { contact } from "./contact.js";

export const footer = {
  about:
    "Melbourne-based engineers delivering security-first web, mobile, and platform builds with startup-friendly collaboration.",
  legalNote: "ABN 00 123 456 789",
  contactPoints: [
    {
      label: "Email",
      value: organization.email,
      href: `mailto:${organization.email}`,
      icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path fill='currentColor' d='M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v.01L12 13l8-6.99V6H4zm16 12V8l-8 7-8-7v10h16z'/></svg>",
    },
    {
      label: "Phone",
      value: organization.phone,
      href: organization.phone ? `tel:${organization.phone.replace(/[^+\\d]/g, "")}` : "",
      icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path fill='currentColor' d='M6.7 4.6l2.6 2.6a1 1 0 01.24 1.01l-1 3.02a12.4 12.4 0 005.87 5.87l3.02-1a1 1 0 011.01.24l2.6 2.6a1 1 0 01-.05 1.45 4.8 4.8 0 01-2.95 1 12.6 12.6 0 01-12.6-12.6 4.8 4.8 0 011-2.95 1 1 0 011.45-.05z'/></svg>",
    },
    {
      label: "Location",
      value: contact.locationLabel,
      icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path fill='currentColor' d='M12 2a6 6 0 016 6c0 4.4-6 12-6 12S6 12.4 6 8a6 6 0 016-6zm0 3a3 3 0 100 6 3 3 0 000-6z'/></svg>",
    },
    {
      label: "Response time",
      value: contact.responseTime,
      icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path fill='currentColor' d='M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 10.59l3.3 1.9-.9 1.63L11 13V7h2z'/></svg>",
    },
  ],
  securityPractices: [
    {
      title: "Encryption",
      detail: "AES-256 encryption protects credentials and project artefacts end-to-end.",
      icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path fill='currentColor' d='M17 10h-1V7a4 4 0 00-8 0v3H7a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1v-8a1 1 0 00-1-1zm-7-3a2 2 0 114 0v3h-4zm4 8a2 2 0 11-4 0 2 2 0 014 0z'/></svg>",
    },
    {
      title: "Decryption",
      detail: "Role-based approvals unlock secrets only when audits and delivery require it.",
      icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path fill='currentColor' d='M21 7a5 5 0 10-9.8 1.7L3 17v4h4l1.71-1.71L10 18v-2h2l1-1v-2h2l1.59-1.59A5 5 0 0021 7zm-5 3a3 3 0 113-3 3 3 0 01-3 3z'/></svg>",
    },
    {
      title: "JWT tokenisation",
      detail: "Signed JWT flows guard customer sessions and integrations with rotation policies.",
      icon: "<svg viewBox='0 0 24 24' aria-hidden='true'><path fill='currentColor' d='M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4zm0 4.6L8 8v3.9a6.1 6.1 0 004 5.5 6.1 6.1 0 004-5.5V8z'/></svg>",
    },
  ],
  policies: [
    { label: "Privacy Policy", href: "legal.html#privacy" },
    { label: "Terms of Service", href: "legal.html#terms" },
    { label: "Data Protection", href: "legal.html#data-protection" },
  ],
};
