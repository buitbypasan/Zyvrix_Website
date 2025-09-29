export const quoteCalculator = {
  projects: {
    web: {
      label: "Web & marketing site",
      tiers: {
        small: { title: "Launch site", base: 1800, currency: "AUD" },
        medium: { title: "Growth site", base: 3600, currency: "AUD" },
        large: { title: "Scale site", base: 5800, currency: "AUD" },
      },
    },
    mobile: {
      label: "Mobile app",
      tiers: {
        small: { title: "MVP app", base: 4200, currency: "AUD" },
        medium: { title: "Growth app", base: 7200, currency: "AUD" },
        large: { title: "Enterprise app", base: 11200, currency: "AUD" },
      },
    },
    api: {
      label: "API / platform",
      tiers: {
        small: { title: "Core API", base: 3600, currency: "AUD" },
        medium: { title: "Platform expansion", base: 6900, currency: "AUD" },
        large: { title: "Enterprise platform", base: 11800, currency: "AUD" },
      },
    },
    ecom: {
      label: "Commerce experience",
      tiers: {
        small: { title: "Launch store", base: 3200, currency: "AUD" },
        medium: { title: "Growth store", base: 5400, currency: "AUD" },
        large: { title: "Scale commerce", base: 8900, currency: "AUD" },
      },
    },
  },
  timelines: {
    standard: { label: "6–10 weeks", adjustment: 0 },
    accelerated: { label: "3–5 weeks", adjustment: 1200 },
    rush: { label: "Under 3 weeks", adjustment: 2400 },
  },
  compliance: {
    standard: { label: "General best practice", adjustment: 0 },
    regulated: { label: "Regulated industry support", adjustment: 1500 },
    critical: { label: "Mission critical / audited", adjustment: 2800 },
  },
  support: {
    0: { label: "No ongoing support", multiplier: 0 },
    "0.12": {
      label: "Monthly performance & CRO (12% of build)",
      multiplier: 0.12,
    },
    "0.2": {
      label: "Embedded optimisation squad (20% of build)",
      multiplier: 0.2,
    },
  },
};
