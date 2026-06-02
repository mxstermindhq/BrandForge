import type { FaqItem } from "@/types/content";

export const ESTABLISHED_BUSINESSES_FAQ: readonly FaqItem[] = [
  {
    question: "Why would an established business choose mxstermind over a large agency?",
    answer:
      "You get senior contributors without account-manager layers. Scope is fixed in writing, communication stays in Discord or Telegram, and the same studio handles design through deployment.",
  },
  {
    question: "Can mxstermind work with our internal product team?",
    answer:
      "Yes. We integrate via PR reviews, shared channels, and documented handoffs — common when you need extra capacity for a launch quarter.",
  },
  {
    question: "What industries have you shipped in?",
    answer:
      "Web3, fintech, hosting, travel, mobile consumer, and B2B automation — see /portfolio/ for permissioned case studies.",
  },
  {
    question: "What if we need procurement documentation?",
    answer:
      "We provide scope documents, milestone definitions, and W-9 or equivalent invoicing details. Escrow is available when your AP team requires it.",
  },
];

export const ESTABLISHED_BUSINESSES_COPY = {
  headline: "For established businesses",
  subhead:
    "When template agencies and hourly dev shops are not enough — but a 50-person consultancy is too slow and too expensive.",
  pains: [
    "Internal teams are at capacity but the board wants the new product line live this quarter",
    "Last agency delivered slides; engineering still has no staging URL",
    "Web3, automation, or mobile scope does not fit a $2k logo package",
  ],
  proof: [
    { name: "Cascade Markets", href: "/portfolio/cascade-markets/" },
    { name: "Crypto Trading Platform", href: "/portfolio/crypto-trading-platform/" },
    { name: "CarSpotLive", href: "/portfolio/carspotlive/" },
  ],
  pricingAnchor:
    "Engagements typically start above BrandForge package tiers — fixed USD quotes after scoping. Most builds fall between $5k and $50k+ depending on integrations and timeline.",
};
