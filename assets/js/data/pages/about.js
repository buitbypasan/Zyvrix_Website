import { seoContent } from "../site/seo.js";

export const aboutPage = {
  meta: seoContent.about,
  intro:
    "Zyvrix is the pairing of a full-stack developer and a cybersecurity specialist who co-create products that are useful, fast, and protected.",
  mission:
    "We exist to help founders ship web and mobile experiences with confidence—combining craftsmanship with the security insight usually reserved for larger teams.",
  pillarsHeading: "What makes Zyvrix different",
  pillars: [
    {
      title: "Two founders on every project",
      detail:
        "Your roadmap is handled by Pasan Rathnayake and Sunera Ranasooriya directly—no hand-offs, just transparent delivery.",
      highlights: [
        "Direct Slack and stand-up access",
        "Shared dashboards for progress and risks",
        "Decisions documented in plain language",
      ],
    },
    {
      title: "Development plus cybersecurity",
      detail:
        "We build the features you need and harden them along the way—threat models, secure coding, and compliance support included.",
      highlights: [
        "Penetration testing and remediation guidance",
        "Secure-by-default architecture decisions",
        "Clear documentation for auditors and investors",
      ],
    },
    {
      title: "Startup-friendly collaboration",
      detail:
        "Small teams need flexible partners. We adjust to your tools, work async across time zones, and keep delivery measurable.",
      highlights: [
        "Notion, Linear, or Jira—your choice",
        "Weekly demos with actionable next steps",
        "Budget visibility with burn forecasts",
      ],
    },
  ],
  story: {
    copy:
      "Zyvrix started when Pasan and Sunera saw founders struggling to balance ambitious roadmaps with security obligations. After years working inside startups and regulated industries, we combined forces to offer the best of both disciplines under one roof.",
    milestones: [
      {
        year: "2019",
        detail:
          "Pasan and Sunera collaborated on a fintech launch, blending app development with security assessments.",
      },
      {
        year: "2021",
        detail:
          "The duo began taking on joint contracts across healthcare, finance, and telecom teams across APAC.",
      },
      {
        year: "2023",
        detail:
          "Formalised Zyvrix with packaged services covering web, mobile, API, and continuous security support.",
      },
      {
        year: "2024",
        detail:
          "Introduced long-term retainers for SEO optimisation, monitoring, and executive-ready security reporting.",
      },
    ],
    media: {
      img: "assets/img/placeholder-team.svg",
      alt: "Zyvrix team workshop",
      caption: "Weekly roadmap and security review led by the Zyvrix founders.",
    },
  },
  approach: [
    {
      title: "Discovery & alignment",
      detail:
        "We gather requirements, success metrics, and constraints while mapping early risks so expectations stay realistic.",
    },
    {
      title: "Design & prototyping",
      detail:
        "Rapid prototypes validate UX decisions, content strategy, and component accessibility before development.",
    },
    {
      title: "Build & secure",
      detail:
        "Code ships in iterative sprints with automated testing, infrastructure as code, and embedded security reviews.",
    },
    {
      title: "Launch & optimise",
      detail:
        "Post-launch support covers observability, performance tuning, and growth experiments that align with KPIs.",
    },
  ],
  techStack: [
    "TypeScript, Next.js, and Astro",
    "React Native & Flutter",
    "Node.js, Laravel, and Go microservices",
    "MySQL, PostgreSQL, PlanetScale, DynamoDB",
    "AWS, Azure, GCP, Vercel, and Railway",
    "Terraform, Docker, and GitHub Actions",
  ],
  impact: [
    {
      metric: "30+",
      label: "Projects shipped together",
      detail: "From early prototypes to production platforms with measurable security improvements.",
    },
    {
      metric: "4.9/5",
      label: "Average client rating",
      detail: "Feedback from founders who appreciated proactive communication and thorough documentation.",
    },
    {
      metric: "<2.5s",
      label: "Median LCP after launch",
      detail: "We optimise for Core Web Vitals as part of every production deployment.",
    },
    {
      metric: "24/7",
      label: "Monitoring & incident cover",
      detail: "Retainer clients receive automated alerts with escalation runbooks.",
    },
  ],
  values: [
    "Security by default",
    "Outcome-driven delivery",
    "Transparent collaboration",
    "Continuous improvement",
  ],
  leadership: {
    heading: "Leadership & governance",
    copy:
      "Working with Zyvrix means direct access to decision-makers. We handle delivery, quality, and security ourselves while looping in specialist partners only when needed.",
    details: [
      "You work with Pasan and Sunera from kickoff to post-launch.",
      "Weekly governance reviews cover scope, risk, and budget health.",
      "Clients receive lightweight, audit-friendly documentation packs.",
    ],
  },
  assurance: {
    heading: "Assurance & ways of working",
    copy:
      "We treat every build as mission critical. Tooling, secrets, and client data are isolated per engagement with least-privilege access.",
    commitments: [
      "Dedicated compliance workspace with access logs",
      "Secure vault for credential exchange and rotation",
      "Signed NDAs and background checks for all staff",
      "Structured incident communication within 1 hour",
    ],
  },
  certifications: [
    "AWS Certified Solutions Architect – Professional",
    "Certified Information Systems Security Professional (CISSP)",
    "Offensive Security Certified Professional (OSCP)",
    "Google Analytics 4 Certification",
  ],
  community: [
    "Host community sessions for early-stage founders on security basics",
    "Publish checklists for combining product delivery with compliance",
    "Mentor at local startup accelerators on secure product launches",
    "Speak at developer meetups about performance and accessibility",
  ],
  partners: [
    "Vercel & Netlify deployment partners",
    "AWS Activate and Microsoft for Startups programs",
    "Firebase & Supabase startup programs",
    "Security tooling alliances with Snyk and Prisma Cloud",
  ],
  gallery: {
    copy:
      "Scenes from our remote-first studio where code reviews, security drills, and design jams happen side by side.",
    items: [
      {
        title: "Threat modelling wall",
        caption: "Framing risks and mitigations alongside customer journey maps.",
        img: "assets/img/placeholder-team.svg",
        alt: "Sticky notes and architectural diagrams on a wall",
      },
      {
        title: "Ops & reliability pod",
        caption: "Live dashboards watching uptime, performance, and incident response health.",
        img: "assets/img/placeholder-ops.svg",
        alt: "Operations dashboard screens",
      },
      {
        title: "Experiment studio",
        caption: "Designers and engineers pair on experiments before they reach production.",
        img: "assets/img/placeholder-labs.svg",
        alt: "Product team ideating around laptops",
      },
    ],
  },
  teamIntro:
    "Zyvrix stays intentionally small so every client works directly with the founders who design, build, and secure each release.",
};
