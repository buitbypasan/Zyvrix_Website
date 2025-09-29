import { seoContent } from "../site/seo.js";

export const homePage = {
  meta: seoContent.home,
  hero: {
    eyebrow: "Founder-led delivery",
    title: "Full-stack products with security woven in",
    subtitle:
      "Zyvrix is a two-person studio of a lead developer and cybersecurity specialist ready to design, ship, and protect your next web or mobile release.",
    primaryCta: { label: "See how we work", href: "about.html" },
    secondaryCta: { label: "Plan a project call", href: "contact.html" },
    metrics: [
      { value: "10+ yrs", label: "Combined experience" },
      { value: "100%", label: "Security-first roadmaps" },
      { value: "48 hrs", label: "Discovery summary" },
    ],
  },
  services: {
    heading: "Where we plug in",
    cards: [
      {
        title: "Web & full-stack builds",
        icon: "🛠️",
        description:
          "Design and engineering for marketing sites, dashboards, and SaaS platforms using modern JavaScript and PHP frameworks.",
        highlights: [
          "Component-driven interfaces and CMS workflows",
          "Performance budgets mapped to your launch goals",
          "Infrastructure configured with least privilege",
        ],
      },
      {
        title: "Mobile app development",
        icon: "📱",
        description:
          "Flutter and React Native applications shaped to feel native, supported by automated testing and hardened user data flows.",
        highlights: [
          "App Store and Play Store launch guidance",
          "Secure authentication and encrypted storage",
          "CI/CD pipelines for fast, safe releases",
        ],
      },
      {
        title: "APIs, integrations & audits",
        icon: "🛡️",
        description:
          "Robust backend services, penetration testing, and ongoing SEO optimisation delivered together for lasting momentum.",
        highlights: [
          "REST and GraphQL APIs with observability",
          "Security reviews with actionable remediation",
          "Search and content strategies that compound",
        ],
      },
    ],
  },
  addOns: {
    eyebrow: "Beyond launch",
    heading: "Ongoing protection & growth",
    copy:
      "Stay partnered with the founders for maintenance, monitoring, and marketing support tailored to your roadmap.",
    cards: [
      {
        title: "Maintenance & incident readiness",
        price: "From $520/mo",
        description:
          "Framework updates, dependency reviews, uptime monitoring, and rapid response playbooks handled by our team.",
        highlights: [
          "Weekly health reports with risk scoring",
          "Critical patching within agreed SLAs",
          "Disaster recovery drills twice per quarter",
        ],
        image: "assets/img/placeholder-ops.svg",
      },
      {
        title: "SEO & content optimisation",
        price: "From $460/mo",
        description:
          "Technical SEO, analytics dashboards, and editorial support that keep your product discoverable and fast.",
        highlights: [
          "Quarterly keyword strategy with roadmap inputs",
          "Structured data and Core Web Vitals tuning",
          "Content refresh cadences aligned to sprints",
        ],
        image: "assets/img/placeholder-growth.svg",
      },
      {
        title: "Security consulting blocks",
        price: "From $150/hr",
        description:
          "Engage Sunera for penetration testing, policy reviews, or to embed security culture inside your team.",
        highlights: [
          "Threat modelling workshops and tabletop drills",
          "Policy and compliance documentation support",
          "Knowledge transfer sessions for your staff",
        ],
        image: "assets/img/placeholder-labs.svg",
      },
    ],
  },
  highlights: {
    heading: "Recent wins",
    items: [
      {
        title: "Healthcare web platform refresh",
        description:
          "Rebuilt a patient portal with a modern React stack, encrypted data flows, and clear onboarding journeys.",
        img: "assets/img/placeholder1.svg",
        alt: "Dashboard interface showing secure analytics",
        metrics: [
          { value: "7 weeks", label: "Concept to launch" },
          { value: "+41%", label: "Task completion" },
        ],
      },
      {
        title: "B2B mobile companion app",
        description:
          "Designed and shipped a cross-platform app with offline support and mobile threat monitoring baked in.",
        img: "assets/img/placeholder2.svg",
        alt: "Screenshot of ecommerce storefront",
        metrics: [
          { value: "25%", label: "Support tickets down" },
          { value: "<3s", label: "Median launch time" },
        ],
      },
      {
        title: "Finance API hardening",
        description:
          "Audited and extended a payments API with automated security testing and detailed developer documentation.",
        img: "assets/img/placeholder3.svg",
        alt: "Analytics dashboard visualising metrics",
        metrics: [
          { value: "99.95%", label: "Uptime maintained" },
          { value: "0", label: "Critical vulnerabilities post-launch" },
        ],
      },
    ],
  },
  gallery: {
    heading: "Recent build snapshots",
    copy:
      "Moments from projects where development and cybersecurity meet to keep releases fast and dependable.",
    items: [
      {
        title: "Security-focused team sync",
        caption:
          "Sprint planning with Pasan and Sunera aligning development priorities with mitigation plans.",
        img: "assets/img/placeholder-team.svg",
        alt: "Team collaborating around laptops",
      },
      {
        title: "Ops automation control",
        caption:
          "Realtime dashboards monitoring uptime, error budgets, and response runbooks for a fintech client.",
        img: "assets/img/placeholder-ops.svg",
        alt: "Operations dashboard with charts",
      },
      {
        title: "Innovation lab",
        caption:
          "Prototyping new onboarding flows and security guardrails ahead of user testing sessions.",
        img: "assets/img/placeholder-labs.svg",
        alt: "Design lab workspace",
      },
    ],
  },
  testimonials: {
    heading: "Client feedback",
    items: [
      {
        quote:
          "Zyvrix handled our rebuild end-to-end and exposed vulnerabilities before attackers could. They feel like part of the team.",
        author: "Mia Thompson, COO — RegTech Labs",
      },
      {
        quote:
          "From discovery to launch, they owned the roadmap, communicated clearly, and left us with maintainable code and documentation.",
        author: "Leon Carter, CTO — Venture Supply Co.",
      },
    ],
  },
  spotlight: {
    heading: "Meet the founders",
    copy:
      "Work directly with Pasan Rathnayake and Sunera Ranasooriya on every sprint—no hand-offs, just accountable leadership embedded in your build.",
    memberIds: ["pasan-rathnayake", "sunera-ranasooriya"],
  },
  contact: {
    heading: "Ready to scope your project?",
    basicHeading: "Tell us about your project",
    points: [
      "Get a tailored roadmap and investment range in 48 hours",
      "Security and performance baked into every sprint",
      "Flexible retainers for iterative product delivery",
    ],
    basicPoints: [
      "Share your goals and we'll organise a discovery call",
      "Security guidance without the full commerce experience",
      "Personal replies from the founders within one business day",
    ],
  },
};
