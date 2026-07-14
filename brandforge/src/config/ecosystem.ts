/** Cross-platform links between BrandForge and MXSTERMIND. */
export const ECOSYSTEM = {
  mxstermind: {
    url: "https://mxstermind.com",
    tagline: "Founder Operating System — monetization, ops workflows, growth stack, and economics.",
    audience:
      "Founders who validated revenue and need an operating system beyond fixed packages — not another bespoke agency engagement.",
    discord: "https://discord.gg/GSKHXkUY85",
    /** MXSTERMIND should link back with ?utm_source=mxstermind&utm_medium=cross_nav */
    crossNavCampaign: "bf-mxm-bridge",
  },
  brandforge: {
    tagline: "Fixed USD packages for brand, web, and growth — quote in 24 hours.",
    audience: "Discord communities, forum sellers, Web3 founders, and SaaS operators shipping fast.",
  },
  bridgeCopy:
    "BrandForge executes your brand and web packages. mxstermind is the Founder Operating System for monetization, ops, and scale — graduate when packages are no longer enough.",
} as const;
