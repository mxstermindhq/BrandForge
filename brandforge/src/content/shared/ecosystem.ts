/** Shared ecosystem content — BrandForge ↔ MXSTERMIND bridge. */

export const ECOSYSTEM_FAQ = [
  {
    question: "Do I need both BrandForge and MXSTERMIND?",
    answer:
      "No. Most operators start with BrandForge packages for bounded scope. MXSTERMIND is for bespoke multi-quarter builds when packages no longer fit — same team, different engagement model.",
  },
  {
    question: "Which should I start with?",
    answer:
      "Start BrandForge if you need a brand, site, Discord kit, or automation in weeks with fixed USD pricing. Start MXSTERMIND if you already validated revenue and need custom product, data, or growth systems.",
  },
  {
    question: "Are Discord communities shared?",
    answer:
      "Both platforms share the mxstermind Discord hub. BrandForge has #mxstermind-updates; MXSTERMIND has #brandforge-showcase. Ask for the Ecosystem Member role on either server.",
  },
] as const;

export const DUAL_TESTIMONIALS = [
  {
    quote:
      "BrandForge shipped our Discord kit in ten days. MXSTERMIND took our monetization stack to the next tier — same squad, no handoff drama.",
    who: "Community operator",
    context: "Gaming server · 2026",
  },
  {
    quote:
      "We started on Blueprint, moved to Automator, then MXSTERMIND for the custom dashboard. The bridge between sites made the upgrade obvious.",
    who: "SaaS founder",
    context: "B2B tools · 2026",
  },
] as const;

export const JOINT_CASE_STUDIES = [
  {
    slug: "community-launch-kit",
    name: "Community Launch Kit",
    brandforge: "Full Discord branding, roles, welcome bot, launch templates",
    mxstermind: "Monetization rails and member tier economics (follow-on engagement)",
    href: "/portfolio/community-launch-kit/",
  },
  {
    slug: "ops-flow-dashboard",
    name: "Ops Flow Dashboard",
    brandforge: "Internal dashboard UI and automation handoff",
    mxstermind: "n8n enterprise integrations and CRM bi-directional sync",
    href: "/portfolio/ops-flow-dashboard/",
  },
  {
    slug: "carspotlive",
    name: "CarSpotLive",
    brandforge: "Mobile product design and App Store launch",
    mxstermind: "Premium mobile roadmap when feature scope expanded",
    href: "/portfolio/carspotlive/",
  },
] as const;
