import type { PortfolioCardData } from "@/types/content";

export const PORTFOLIO_SLUGS = [
  "cascade-markets",
  "drain-cx",
  "carspotlive",
  "valaccs",
  "dyotravel",
  "sui-blockchain-app",
  "linkedin-automation",
  "whiteskyhosting",
] as const;

export type PortfolioSlug = (typeof PORTFOLIO_SLUGS)[number];

export const PORTFOLIO_HUB_CARDS: readonly PortfolioCardData[] = [
  {
    slug: "cascade-markets",
    tag: "Web3 · Landing Page",
    name: "Cascade Markets",
    description: "Crypto prediction market landing — performance-first, Web3 visual language.",
    chips: ["Web3", "Landing", "Performance"],
    href: "/portfolio/cascade-markets/",
  },
  {
    slug: "drain-cx",
    tag: "Product Website",
    name: "Drain.cx",
    description: "Figma-to-production with scroll motion, bento FAQ, and ultrawide responsive layout.",
    chips: ["Next.js", "Tailwind", "Motion"],
    href: "/portfolio/drain-cx/",
  },
  {
    slug: "carspotlive",
    tag: "iOS & Android",
    name: "CarSpotLive",
    description: "Full mobile app — design, native dev, real-time mapping, App Store release.",
    chips: ["Mobile", "Firebase", "Maps"],
    href: "/portfolio/carspotlive/",
  },
  {
    slug: "valaccs",
    tag: "E-commerce · Accounts",
    name: "ValAccs.com",
    description: "Digital goods storefront with checkout flow, trust signals, and operator-focused UX.",
    chips: ["E-commerce", "Conversion", "Web"],
    href: "/portfolio/valaccs/",
  },
  {
    slug: "dyotravel",
    tag: "Travel · Full Stack",
    name: "Dyo Travel",
    description: "Hotel booking platform with API-driven pricing, listings, and live support.",
    chips: ["Node.js", "API", "Booking"],
    href: "/portfolio/dyotravel/",
  },
  {
    slug: "sui-blockchain-app",
    tag: "Web3 · Mobile",
    name: "SUI Blockchain App",
    description: "Team of four rebuilt a Sol ecosystem app for SUI in two weeks — wallet flows and on-chain UX.",
    chips: ["SUI", "Mobile", "Web3"],
    href: "/portfolio/sui-blockchain-app/",
  },
  {
    slug: "linkedin-automation",
    tag: "Automation · SaaS",
    name: "LinkedIn Automation Platform",
    description: "$4,660 scoped build — outreach workflows, dashboards, and compliance-aware limits.",
    chips: ["Automation", "SaaS", "API"],
    href: "/portfolio/linkedin-automation/",
  },
  {
    slug: "whiteskyhosting",
    tag: "Infrastructure · Web",
    name: "WhiteSky Hosting",
    description: "Hosting provider site with plan comparison, trust copy, and conversion-focused layout.",
    chips: ["Web", "Hosting", "B2B"],
    href: "/portfolio/whiteskyhosting/",
  },
] as const;

export const PORTFOLIO_HUB_FAQ = [
  {
    question: "Are these live projects I can verify?",
    answer:
      "Most portfolio entries link to live URLs or App Store listings. Case study pages document scope, stack, and outcomes. If a project is private, we say so and share what we can under NDA.",
  },
  {
    question: "Can BrandForge build something similar for my niche?",
    answer:
      "Yes. Send your reference links on Discord or Telegram. We quote fixed USD based on scope — pages, features, integrations — within 24 hours.",
  },
  {
    question: "Do you show forum or Discord-only work?",
    answer:
      "Some operator work stays private. We list verified public builds here and reference forum vouches on the home page for reputation you cannot fake with stock screenshots.",
  },
  {
    question: "Who builds portfolio projects at BrandForge?",
    answer:
      "A single coordinated team — design, development, and growth under one roof. No handoffs to unnamed freelancers after you pay.",
  },
] as const;
