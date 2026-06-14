import type { FaqItem, ServiceCardData } from "@/types/content";
import { MXM_POSITIONING } from "@/config/positioning";

export const SERVICE_HUB_CARDS: readonly ServiceCardData[] = [
  {
    slug: "brand-product",
    icon: "◈",
    title: "Brand & product systems",
    description: "Identity and product UI as part of the OS — for companies outgrowing template aesthetics.",
    href: "/apply/",
  },
  {
    slug: "engineering",
    icon: "◇",
    title: "Product engineering",
    description: "Web, mobile, APIs, and infra — wired into your operating model, not hourly bodies.",
    href: "/developers/",
  },
  {
    slug: "web3",
    icon: "⬡",
    title: "Web3 & fintech OS",
    description: "Wallet UX, trading interfaces, and chain migrations under real deadlines.",
    href: "/developers/blockchain/",
  },
  {
    slug: "automation-ai",
    icon: "◎",
    title: "Automation & AI ops",
    description: "Internal copilots, verification bots, and ops pipelines with audit trails.",
    href: "/developers/ai-systems/",
  },
  {
    slug: "growth",
    icon: "△",
    title: "Growth architecture",
    description: "SEO, GEO, content systems, and launch loops for established revenue lines.",
    href: "/process/",
  },
];

export const SERVICES_HUB_FAQ: readonly FaqItem[] = [
  {
    question: "Does mxstermind sell fixed packages like BrandForge?",
    answer:
      "No. BrandForge.gg publishes package tiers for bounded execution. mxstermind is the Founder Operating System — scoped after a fit conversation on Discord or Telegram.",
  },
  {
    question: "What does Founder OS access include?",
    answer:
      "Monetization, ops, and growth systems tailored to your stage — commonly above package tiers. We quote fixed USD after scoping the operating layer you need.",
  },
  {
    question: "Who is mxstermind for?",
    answer: MXM_POSITIONING.audience,
  },
  {
    question: "How do we start?",
    answer:
      "Apply via /apply/ or message Discord. Share stage, revenue model, and OS needs. We reply within 24 hours with fit and next steps.",
  },
];
