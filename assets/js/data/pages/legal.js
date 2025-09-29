import { seoContent } from "../site/seo.js";

export const legalPage = {
  meta: seoContent.legal,
  heading: "Privacy, terms, and data protection",
  intro:
    "Security and trust guide every engagement. These policies outline how we protect information, set expectations, and respond when you need support.",
  sections: [
    {
      id: "privacy",
      title: "Privacy policy",
      body: [
        "We collect only the details required to scope engagements and deliver agreed work. Access to personal data is restricted to senior staff under signed confidentiality agreements.",
        "Operational data is encrypted at rest and in transit, monitored with audit trails, and removed when projects conclude unless ongoing services require retention.",
      ],
      bullets: [
        "Form submissions and credentials are stored using AES-256 encryption with time-bound keys.",
        "Third-party processors (for example, cloud hosting and analytics) are vetted for SOC2 or ISO 27001 compliance.",
        "You can request data removal or export at any time by emailing privacy@secureitdevelopers.com.",
      ],
    },
    {
      id: "terms",
      title: "Terms of service",
      body: [
        "Every engagement begins with a mutually signed statement of work covering scope, deliverables, and payment schedule. We work transparently in shared tooling so you can see progress and review artefacts early.",
        "Intellectual property transfers once invoices are settled, and we guarantee defect remediation for 30 days after launch unless otherwise specified in a managed-services agreement.",
      ],
      bullets: [
        "Change requests are captured through agreed backlog tools and priced before implementation.",
        "Invoices are issued at project milestones or monthly for retainers with NET 14 terms.",
        "Either party may terminate with 14 days notice; completed work and in-progress deliverables are billed proportionally.",
      ],
    },
    {
      id: "data-protection",
      title: "Data protection & incident response",
      body: [
        "We operate a defense-in-depth approach across development, infrastructure, and continuous delivery. Secrets are stored in managed vaults and rotated automatically with environment-table auditing.",
        "If an incident impacts your environment, you receive an initial notification within 24 hours, followed by containment updates and a remediation report with lessons learned.",
      ],
      bullets: [
        "Customer logging for database credentials uses environment-bound tables keyed by deployment secrets.",
        "Penetration testing and dependency reviews are scheduled quarterly for long-running retainers.",
        "Disaster-recovery drills validate restore points, access controls, and communications workflows.",
      ],
    },
  ],
  contact: {
    heading: "Need bespoke terms?",
    copy:
      "We can supply NDAs, security schedules, and compliance evidence tailored to your procurement team—just let us know what you need.",
    email: "privacy@secureitdevelopers.com",
    phone: "+61 434 438 494",
  },
};
