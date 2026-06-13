/** Cross-platform links between BrandForge and MXSTERMIND. */
export const ECOSYSTEM = {
  mxstermind: {
    url: "https://mxstermind.com",
    tagline: "Premium studio for bespoke product, economics, and growth systems.",
    audience: "Established operators who outgrew fixed packages — custom teams, outcome-based deals.",
    discord: "https://discord.gg/a8Nz2R6M55",
    /** MXSTERMIND should link back with ?utm_source=mxstermind&utm_medium=cross_nav */
    crossNavCampaign: "bf-mxm-bridge",
  },
  brandforge: {
    tagline: "Fixed USD packages for brand, web, and growth — quote in 24 hours.",
    audience: "Discord communities, forum sellers, Web3 founders, and SaaS operators shipping fast.",
  },
  bridgeCopy:
    "BrandForge builds your identity. MXSTERMIND scales your economics. Start with packages; graduate when scope exceeds tiers.",
} as const;
