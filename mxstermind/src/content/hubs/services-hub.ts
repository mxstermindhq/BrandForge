import type { FaqItem, ServiceCardData } from "@/types/content";

export const SERVICE_HUB_CARDS: readonly ServiceCardData[] = [
  {
    slug: "brand-product",
    icon: "◈",
    title: "Brand & product design",
    description: "Identity, product UI, and editorial systems for companies outgrowing template aesthetics.",
    href: "/apply/",
  },
  {
    slug: "engineering",
    icon: "◇",
    title: "Full-stack engineering",
    description: "Web, mobile, APIs, and infra — scoped as outcomes, not hourly bodies.",
    href: "/developers/",
  },
  {
    slug: "web3",
    icon: "⬡",
    title: "Web3 & fintech systems",
    description: "Wallet UX, trading interfaces, and chain migrations under real deadlines.",
    href: "/developers/blockchain/",
  },
  {
    slug: "automation-ai",
    icon: "◎",
    title: "Automation & AI",
    description: "Internal copilots, verification bots, and ops pipelines with audit trails.",
    href: "/developers/ai-systems/",
  },
  {
    slug: "growth",
    icon: "△",
    title: "Growth architecture",
    description: "SEO, GEO, content systems, and launch strategy for established revenue lines.",
    href: "/process/",
  },
];

export const SERVICES_HUB_FAQ: readonly FaqItem[] = [
  {
    question: "Does mxstermind sell fixed packages like BrandForge?",
    answer:
      "No. BrandForge.gg publishes package tiers for operators who want speed. mxstermind quotes custom scope after a fit conversation on Discord or Telegram.",
  },
  {
    question: "What budget should we expect for a bespoke engagement?",
    answer:
      "Most mxstermind projects start above package tiers — commonly $5k–$50k+ USD depending on stack, integrations, and timeline. We quote fixed USD after scoping.",
  },
  {
    question: "Who is mxstermind for?",
    answer:
      "Scaling companies, serious founders, and established brands with technical buyers who need one studio for design, engineering, and growth — not three vendors.",
  },
  {
    question: "How do we start?",
    answer:
      "Apply via /apply/ or message Discord. Share outcome, deadline, and budget band. We reply within 24 hours with fit and next steps.",
  },
];
