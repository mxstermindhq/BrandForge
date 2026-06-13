/** UTM presets — single source for campaign naming. */
export const UTM_SOURCE = "brandforge" as const;

export const UTM_MEDIUM = {
  cta: "cta",
  copy: "copy",
  portfolio: "portfolio",
  package: "package",
  calendly: "calendly",
} as const;

export type UtmMedium = (typeof UTM_MEDIUM)[keyof typeof UTM_MEDIUM];

/** Common campaign slugs — use page_slug pattern from Sprint 4 spec. */
export const UTM_CAMPAIGNS = {
  homeHero: "home-hero",
  homeFooter: "home-footer-cta",
  packagesPage: "packages-page",
  contactPage: "contact-page",
  headerDiscord: "header-discord",
  stickyMobile: "sticky-cta-mobile",
  portfolioSimilar: "portfolio-similar",
  calendlyScope: "calendly-scope-call",
} as const;
