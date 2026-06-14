import type { ServiceCardData } from "@/types/content";

/** Service slug registry — used by hub, sitemap, and [slug] routes. */
export const SERVICE_SLUGS = [
  "brand-identity",
  "web-design",
  "mobile-apps",
  "discord-branding",
  "automation",
  "ai-tools",
  "seo-growth",
  "paid-ads",
  "social-media",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const SERVICE_HUB_CARDS: readonly ServiceCardData[] = [
  {
    slug: "brand-identity",
    icon: "◈",
    title: "Brand Identity",
    description: "Logo, colour systems, guidelines, and assets that make you look funded on day one.",
    href: "/services/brand-identity/",
  },
  {
    slug: "web-design",
    icon: "◇",
    title: "Web Design & Development",
    description: "Landing pages, marketing sites, and stores built to convert — not just look good in Figma.",
    href: "/services/web-design/",
  },
  {
    slug: "mobile-apps",
    icon: "▣",
    title: "Mobile Apps",
    description: "iOS and Android apps from wireframe to App Store — CarSpotLive is the reference build.",
    href: "/services/mobile-apps/",
  },
  {
    slug: "discord-branding",
    icon: "◎",
    title: "Discord Branding",
    description: "Server structure, roles, banners, and onboarding flows for gaming and trading communities.",
    href: "/services/discord-branding/",
  },
  {
    slug: "automation",
    icon: "⬡",
    title: "Automation & Workflows",
    description: "n8n, Make, and Zapier pipelines that replace manual ops — CRM sync, alerts, intake routing.",
    href: "/services/automation/",
  },
  {
    slug: "ai-tools",
    icon: "◉",
    title: "Custom AI Tools",
    description: "Assistants, knowledge bases, and internal copilots trained on your docs — not generic ChatGPT wrappers.",
    href: "/services/ai-tools/",
  },
  {
    slug: "seo-growth",
    icon: "△",
    title: "SEO & GEO Growth",
    description: "Traditional SEO plus Generative Engine Optimisation so ChatGPT, Perplexity, and Google cite you.",
    href: "/services/seo-growth/",
  },
  {
    slug: "paid-ads",
    icon: "▲",
    title: "Paid Ads & ROAS",
    description: "Google, Meta, and TikTok campaigns with creative systems and weekly ROAS reporting.",
    href: "/services/paid-ads/",
  },
  {
    slug: "social-media",
    icon: "✦",
    title: "Social & Short-Form",
    description: "Content calendars, short-form templates, and posting systems for operators who hate filming.",
    href: "/services/social-media/",
  },
] as const;

export const SERVICES_HUB_FAQ = [
  {
    question: "Does BrandForge sell individual services or only packages?",
    answer:
      "Both. Five package tiers on /packages/ bundle the most common scope. Individual services on this page let you buy one discipline — brand only, dev only, or growth only — with a fixed quote in 24 hours.",
  },
  {
    question: "How do I know which service I need?",
    answer:
      "Message us on Discord or Telegram with your goal (launch, rebrand, scale ads, ship an app). BrandForge maps your goal to a service line and sends a scoped quote — no discovery call required.",
  },
  {
    question: "Can BrandForge handle Web3 and gaming community projects?",
    answer:
      "Yes. Cascade Markets, drain.cx, and multiple Discord-first operators are in our portfolio. We understand escrow culture, forum buyers, and crypto payment preferences.",
  },
  {
    question: "What is the difference between BrandForge and mxstermind?",
    answer:
      "BrandForge sells fixed packages for operators who want speed and clear USD pricing. mxstermind.com is the Founder Operating System — monetization, ops, and growth systems beyond fixed packages.",
  },
] as const;
