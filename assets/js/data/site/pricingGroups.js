export const pricingGroups = [
  {
    id: "web",
    label: "Web & Marketing",
    tagline: "Polished marketing sites ready to convert",
    plans: [
      {
        id: "launch",
        label: "Launch",
        price: 1490,
        currency: "AUD",
        summary:
          "Perfect for founders validating positioning and shipping a credible presence fast.",
        features: [
          "Up to 5 responsive pages with reusable components",
          "Story, messaging, and SEO discovery workshop",
          "Technical SEO baseline with analytics setup",
          "Privacy, consent, and cookie tooling",
          "Secure hosting on Vercel or Netlify",
          "Performance budget with automated checks",
        ],
        recommendedServices: ["seo-technical", "ux-accessibility"],
      },
      {
        id: "growth",
        label: "Growth",
        price: 3290,
        currency: "AUD",
        summary:
          "For teams scaling content, experiments, and lead capture with confidence.",
        features: [
          "10-15 modular pages with CMS integration",
          "Motion design and interactive components",
          "CRO roadmap with multivariate experiments",
          "CRM and marketing automation hooks",
          "Accessibility review (WCAG 2.2 AA)",
          "Security headers, WAF, and uptime alerts",
        ],
        recommendedServices: ["seo-technical", "performance-hardening"],
      },
      {
        id: "scale",
        label: "Scale",
        price: 5490,
        currency: "AUD",
        summary:
          "Enterprise-grade storytelling with global governance and measurement baked in.",
        features: [
          "Unlimited locales with content governance workflows",
          "Headless architecture with reusable design systems",
          "Experimentation program and analytics dashboards",
          "Regional compliance and privacy workflows",
          "Quarterly performance and security reviews",
          "Team enablement and documentation handover",
        ],
        recommendedServices: ["seo-technical", "security-audit"],
      },
    ],
  },
  {
    id: "mobile",
    label: "Mobile Products",
    tagline: "Cross-platform apps with native polish",
    plans: [
      {
        id: "launch",
        label: "Launch",
        price: 3490,
        currency: "AUD",
        summary:
          "Get your MVP into the App Store and Play Store with secure foundations.",
        features: [
          "React Native or Flutter build with design system",
          "Authentication, onboarding, and secure storage",
          "API integration with offline-first data sync",
          "Automated QA pipeline with device testing",
          "Store submission support and release management",
          "Crash and performance monitoring setup",
        ],
        recommendedServices: ["mobile-polish", "performance-hardening"],
      },
      {
        id: "growth",
        label: "Growth",
        price: 6290,
        currency: "AUD",
        summary:
          "Scale retention, engagement, and monetisation with confidence.",
        features: [
          "Design system with native interaction patterns",
          "Push notifications, deep links, and segmentation",
          "CI/CD with fastlane or Codemagic",
          "In-app purchases or subscription flows",
          "Analytics, retention, and cohort dashboards",
          "Security audit and secure code review",
        ],
        recommendedServices: ["mobile-polish", "security-audit"],
      },
      {
        id: "scale",
        label: "Scale",
        price: 9890,
        currency: "AUD",
        summary:
          "For venture-backed teams operating at enterprise-level scale and reliability.",
        features: [
          "Modular architecture for multi-team delivery",
          "Realtime sync, background tasks, and edge caching",
          "Advanced accessibility and localisation",
          "Integration with analytics warehouses",
          "Chaos testing and performance hardening",
          "24/7 observability with incident runbooks",
        ],
        recommendedServices: [
          "mobile-polish",
          "performance-hardening",
          "security-audit",
        ],
      },
    ],
  },
  {
    id: "api",
    label: "API & Backend Platforms",
    tagline: "Secure foundations for data-rich products",
    plans: [
      {
        id: "launch",
        label: "Launch",
        price: 2990,
        currency: "AUD",
        summary:
          "Ship a reliable backend or integration layer with confidence.",
        features: [
          "REST or GraphQL API with schema and docs",
          "Role-based access, auth, and audit logging",
          "Infrastructure-as-code deployment",
          "Unit and integration tests with coverage reports",
          "Monitoring and alerting baseline",
          "DevOps pipeline for staging and production",
        ],
        recommendedServices: ["api-integration", "security-audit"],
      },
      {
        id: "growth",
        label: "Growth",
        price: 5990,
        currency: "AUD",
        summary:
          "Extend your platform with automation, scale, and full observability.",
        features: [
          "Event-driven architecture and queue processing",
          "Third-party integrations and webhook orchestration",
          "Secrets management and rotation policies",
          "Autoscaling container or serverless setup",
          "Full observability (logs, metrics, tracing)",
          "Load testing with remediation backlog",
        ],
        recommendedServices: [
          "api-integration",
          "performance-hardening",
          "security-audit",
        ],
      },
      {
        id: "scale",
        label: "Scale",
        price: 10490,
        currency: "AUD",
        summary:
          "Enterprise-grade platforms with compliance and resilience engineered in.",
        features: [
          "Modular microservices with API gateway",
          "Zero-downtime deployments and blue/green rollout",
          "Compliance support (SOC2, ISO 27001, HIPAA)",
          "Data lakehouse and BI integration",
          "Disaster recovery and chaos engineering drills",
          "Quarterly threat modelling workshops",
        ],
        recommendedServices: ["security-audit", "performance-hardening"],
      },
    ],
  },
  {
    id: "ecom",
    label: "Commerce & Subscriptions",
    tagline: "Sell and scale with automation baked-in",
    plans: [
      {
        id: "launch",
        label: "Launch",
        price: 2190,
        currency: "AUD",
        summary:
          "Get trading quickly with a secure, conversion-friendly storefront.",
        features: [
          "Shopify or WooCommerce theme tailored to brand",
          "Catalogue up to 120 SKUs with variant logic",
          "Secure payments, tax, and shipping rules",
          "Lifecycle automations (welcome + abandoned cart)",
          "Performance tuning for PDP and checkout",
          "Analytics and attribution baseline",
        ],
        recommendedServices: ["seo-technical", "security-audit"],
      },
      {
        id: "growth",
        label: "Growth",
        price: 4290,
        currency: "AUD",
        summary:
          "Level up operations, personalisation, and automation for scale.",
        features: [
          "Headless storefront using Hydrogen or Next.js",
          "Subscriptions, bundles, and loyalty programs",
          "ERP/IMS integrations with forecasting",
          "Advanced segmentation and personalisation",
          "Fraud prevention and security audits",
          "Performance budget dashboards",
        ],
        recommendedServices: ["seo-technical", "api-integration"],
      },
      {
        id: "scale",
        label: "Scale",
        price: 7290,
        currency: "AUD",
        summary:
          "For multi-region commerce leaders needing compliance and experimentation.",
        features: [
          "Composable commerce with multi-region catalogue",
          "Marketplace and wholesale channel integrations",
          "Custom checkout experiences with A/B testing",
          "Customer data platform and BI dashboards",
          "Pen testing with remediation sprints",
          "Dedicated optimisation retainer",
        ],
        recommendedServices: [
          "security-audit",
          "seo-technical",
          "performance-hardening",
        ],
      },
    ],
  },
];
