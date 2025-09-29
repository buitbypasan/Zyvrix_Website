import { seoContent } from "../../site/seo.js";

export const pricingPage = {
  meta: seoContent.pricing,
  intro:
    "Start with the category that matches your roadmap—web, mobile, platform, or commerce—then choose the engagement level that fits your timeline and complexity.",
  addOns: {
    eyebrow: "Extend your engagement",
    heading: "Recurring services for continuous gains",
    copy:
      "Layer proactive maintenance, SEO, and experimentation to keep performance, compliance, and growth trending up after launch.",
    cards: [
      {
        title: "Monthly maintenance retainer",
        price: "From $680/mo",
        description:
          "Framework upgrades, hosting patching, uptime monitoring, and quarterly recovery drills.",
        highlights: [
          "Dependency patching with changelog reports",
          "Infrastructure reviews and cost optimisation",
          "Incident response runbooks + on-call escalation",
        ],
      },
      {
        title: "SEO & content optimisation",
        price: "From $760/mo",
        description:
          "Roadmaps combining keyword research, structured data, and UX copy updates for compounding organic growth.",
        highlights: [
          "Quarterly technical SEO audits",
          "Editorial calendar + CMS workflow support",
          "Backlink and schema development",
        ],
      },
      {
        title: "Experimentation squad",
        price: "From $990/mo",
        description:
          "Hypothesis-driven experiments across landing pages, checkout, and product funnels with analytics instrumentation.",
        highlights: [
          "Test design and implementation",
          "Weekly readouts with action plans",
          "Attribution and lifecycle reporting dashboards",
        ],
      },
    ],
  },
  deepDive: {
    eyebrow: "Smart support pairings",
    heading: "Recommended services by focus area",
    copy:
      "Toggle between product types to explore the specialist services that keep each engagement secure, optimised, and compliant after launch.",
    empty: "Service recommendations are being finalised. Check back shortly.",
    linkLabel: "Explore service details",
  },
  customEngagement: {
    eyebrow: "Bespoke programs",
    heading: "Design a custom engagement around your roadmap",
    copy:
      "Mix and match retainers, discovery sprints, and compliance support. We assemble the right specialists to move your KPI targets while protecting customer data.",
    highlights: [
      "Dedicated engagement lead and security champion",
      "Fortnightly ROI reporting with agreed KPIs",
      "Shared delivery board with budget and runway visibility",
    ],
    primaryCta: { label: "Schedule a planning session", href: "contact.html" },
    secondaryCta: {
      label: "Browse delivery approach",
      href: "about.html#aboutApproach",
    },
    invoice: {
      label: "Pro-forma invoice",
      reference: "INV-2045-CUSTOM",
      issued: "14 May 2024",
      due: "Valid for 30 days",
      turnaround: "12-week roadmap & optimisation runway",
      paymentTerms: "50% deposit, balance on delivery",
      billTo: {
        company: "Your organisation",
        contact: "Procurement lead",
      },
      currency: "USD",
      lineItems: [
        {
          description: "Discovery & risk alignment sprint",
          quantity: 1,
          unit: "sprint",
          rate: 4800,
          total: 4800,
        },
        {
          description: "Secure delivery squad (fortnightly cadence)",
          quantity: 2,
          unit: "months",
          rate: 3600,
          total: 7200,
        },
        {
          description: "Compliance automation & reporting setup",
          quantity: 1,
          unit: "package",
          rate: 2800,
          total: 2800,
        },
      ],
      subtotal: 14800,
      tax: 740,
      total: 15540,
      note: "Figures reflect a blended senior squad. We'll refine the breakdown with your stakeholders before signature.",
      downloadLabel: "Download invoice PDF",
    },
    aside: {
      title: "What to expect",
      metrics: [
        { label: "Average payback", value: "4.2 months" },
        { label: "Security incidents", value: "0 critical in 36 months" },
        { label: "Client NPS", value: "+72" },
      ],
    },
  },
  standalone: {
    eyebrow: "Need help without a package?",
    heading: "Book standalone services",
    copy:
      "Pick the sprints and reviews that solve your immediate challenges—from security audits to SEO growth plays.",
    note: "Every service includes a discovery call, scoped roadmap, and documented next steps.",
  },
  compare: {
    heading: "Compare project tiers",
    copy:
      "Understand how deliverables evolve within each category so you can pick the right balance of investment and velocity.",
    categories: [
      {
        id: "web",
        label: "Web & marketing websites",
        summary:
          "Move from launch-ready pages to global storytelling engines with experimentation built in.",
        columns: [
          { planId: "web-launch", label: "Starter package" },
          { planId: "web-growth", label: "Growth package" },
          { planId: "web-scale", label: "Scale package" },
        ],
        rows: [
          {
            label: "Ideal for",
            values: [
              "Idea-stage founders shipping credibility",
              "Scaling teams running content and CRO",
              "Global organisations with governance needs",
            ],
          },
          {
            label: "Content ops",
            values: [
              "Component-driven pages + messaging workshop",
              "CMS-driven content with automation hooks",
              "Multi-region publishing with localisation workflows",
            ],
          },
          {
            label: "Experience",
            values: [
              "Responsive layouts + SEO baseline",
              "Motion design & experimentation roadmap",
              "A/B testing suite with analytics dashboards",
            ],
          },
          {
            label: "Security & compliance",
            values: [
              "Best-practice hardening",
              "Security headers + WAF automation",
              "Regional privacy workflows & threat modelling",
            ],
          },
          {
            label: "Measurement",
            values: [
              "Analytics baseline",
              "Conversion dashboards",
              "Executive reporting with experimentation insights",
            ],
          },
        ],
      },
      {
        id: "mobile",
        label: "Mobile products",
        summary:
          "From MVPs in the app stores to enterprise-ready cross-platform experiences.",
        columns: [
          { planId: "mobile-launch", label: "Starter package" },
          { planId: "mobile-growth", label: "Growth package" },
          { planId: "mobile-scale", label: "Scale package" },
        ],
        rows: [
          {
            label: "Ideal for",
            values: [
              "Founders validating a mobile MVP",
              "Product teams growing retention",
              "Enterprises demanding resilience & compliance",
            ],
          },
          {
            label: "Platform coverage",
            values: [
              "iOS & Android with shared code",
              "Native patterns + advanced device features",
              "Background tasks, realtime sync, localisation",
            ],
          },
          {
            label: "Engagement",
            values: [
              "Analytics + crash monitoring",
              "CI/CD automation with release pipeline",
              "24/7 observability with incident runbooks",
            ],
          },
        ],
      },
      {
        id: "ecom",
        label: "Commerce & subscriptions",
        summary:
          "Scale from secure carts to multi-market commerce engines.",
        columns: [
          { planId: "ecom-launch", label: "Starter package" },
          { planId: "ecom-growth", label: "Growth package" },
          { planId: "ecom-scale", label: "Scale package" },
        ],
        rows: [
          {
            label: "Merchandising",
            values: [
              "Tailored theme + 120 SKUs",
              "Headless catalogue with bundles & subscriptions",
              "Composable commerce with marketplaces + wholesale",
            ],
          },
          {
            label: "Customer experience",
            values: [
              "Optimised storefront templates",
              "Personalised journeys & segmentation",
              "Custom checkout + experimentation program",
            ],
          },
          {
            label: "Operations",
            values: [
              "Payments, tax, shipping automation",
              "ERP/IMS integration + forecasting",
              "Global fulfilment orchestration & service mesh",
            ],
          },
          {
            label: "Security",
            values: [
              "Secure gateway configuration",
              "Fraud prevention & monitoring",
              "Pen-testing, SOC2 alignment, and observability",
            ],
          },
          {
            label: "Growth",
            values: [
              "Analytics baseline",
              "Attribution + lifecycle automation",
              "Customer data platforms with BI dashboards",
            ],
          },
        ],
      },
      {
        id: "api",
        label: "API & backend platforms",
        summary:
          "Evolve from foundational APIs to compliant, data-rich platforms.",
        columns: [
          { planId: "api-launch", label: "Starter package" },
          { planId: "api-growth", label: "Growth package" },
          { planId: "api-scale", label: "Scale package" },
        ],
        rows: [
          {
            label: "Architecture",
            values: [
              "Secure monolith with modular patterns",
              "Service-ready architecture with event flows",
              "Microservices with service mesh & governance",
            ],
          },
          {
            label: "Integrations",
            values: [
              "Core system APIs",
              "Webhooks + automation",
              "Enterprise integrations & data lakehouse",
            ],
          },
          {
            label: "Security posture",
            values: [
              "RBAC & audit logging",
              "SSO + secrets automation",
              "Compliance support with quarterly testing",
            ],
          },
          {
            label: "Scalability",
            values: [
              "CI/CD with automated tests",
              "Autoscaling + observability suite",
              "Multi-region deployments with chaos testing",
            ],
          },
          {
            label: "Product analytics",
            values: [
              "Feature usage tracking",
              "Cohort analysis + funnels",
              "Custom BI dashboards & stakeholder reporting",
            ],
          },
        ],
      },
    ],
  },
};
