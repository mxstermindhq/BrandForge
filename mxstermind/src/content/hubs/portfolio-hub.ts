import type { PortfolioCardData } from "@/types/content";

export const PORTFOLIO_SLUGS = [
  "cascade-markets",
  "drain-cx",
  "carspotlive",
  "sui-blockchain",
  "crypto-trading-platform",
  "telegram-verification-system",
] as const;

export type PortfolioSlug = (typeof PORTFOLIO_SLUGS)[number];

export const PORTFOLIO_HUB_CARDS: readonly PortfolioCardData[] = [
  {
    slug: "cascade-markets",
    tag: "Web3 · Landing",
    name: "Cascade Markets",
    description: "Crypto prediction market landing — credibility in seconds for wallet-ready traders.",
    chips: ["Next.js", "Web3 UI", "Static export"],
    href: "/portfolio/cascade-markets/",
  },
  {
    slug: "drain-cx",
    tag: "Product · Web",
    name: "Drain.cx",
    description: "Figma-to-production build with bento FAQ, scroll motion, and category navigation.",
    chips: ["Next.js", "GSAP", "Tailwind"],
    href: "/portfolio/drain-cx/",
  },
  {
    slug: "carspotlive",
    tag: "Mobile · iOS & Android",
    name: "CarSpotLive",
    description: "Native app shipped to both app stores — camera-first UX for car spotters.",
    chips: ["React Native", "App Store", "Play Store"],
    href: "/portfolio/carspotlive/",
  },
  {
    slug: "sui-blockchain",
    tag: "Web3 · Mobile",
    name: "SUI Blockchain App",
    description: "Four-person squad rebuilt Sol-targeted wallet flows for SUI in two weeks.",
    chips: ["React Native", "SUI SDK", "TypeScript"],
    href: "/portfolio/sui-blockchain/",
  },
  {
    slug: "crypto-trading-platform",
    tag: "Fintech · Full-stack",
    name: "Crypto Trading Platform",
    description: "React front end, Flask API, MySQL, Nginx — private trading desk for serious operators.",
    chips: ["React", "Flask", "MySQL", "Nginx"],
    href: "/portfolio/crypto-trading-platform/",
  },
  {
    slug: "telegram-verification-system",
    tag: "Automation · Bot",
    name: "Telegram Verification System",
    description: "Multi-server verification bot with admin dashboards and anti-abuse gates.",
    chips: ["Node.js", "Telegram API", "PostgreSQL"],
    href: "/portfolio/telegram-verification-system/",
  },
];

export const PORTFOLIO_HUB_FAQ = [
  {
    question: "Does mxstermind publish every client project?",
    answer:
      "No. We publish case studies only with client permission. Many engagements stay private under NDA — apply on Discord if you need discretion.",
  },
  {
    question: "Can mxstermind replicate a case study for my industry?",
    answer:
      "Often yes. Send the closest example from this portfolio plus your deadline and budget band. We reply within 24 hours with fit and scope.",
  },
  {
    question: "How is mxstermind different from BrandForge packages?",
    answer:
      "BrandForge ships productized packages for operators who want speed and fixed tiers. mxstermind takes bespoke engagements when scope crosses product, engineering, and growth.",
  },
  {
    question: "What does a typical engagement budget look like?",
    answer:
      "Most mxstermind builds start above package tiers — often $5k–$50k+ depending on stack, integrations, and timeline. We quote fixed USD after a scoping conversation.",
  },
] as const;
