import type { PackageKey } from "@/config/site";

export type ServiceItem = {
  id: string;
  num: string;
  icon: string;
  title: string;
  items: readonly string[];
};

export type PackageItem = {
  key: PackageKey;
  tier: string;
  name: string;
  description: string;
  price: string;
  priceSub: string;
  range: string;
  time: string;
  features: readonly string[];
  handoff: string;
  avg: string;
  popular?: boolean;
};

export type PortfolioItem = {
  id: string;
  tag: string;
  name: string;
  description: string;
  chips: readonly string[];
  href?: string;
  linkLabel?: string;
};

export type VouchItem = {
  id: string;
  from: string;
  stars: number;
  text: string;
  who: string;
  amount?: string;
};

export type StatItem = {
  value: string;
  label: string;
};

export const HERO_STATS: readonly StatItem[] = [
  { value: "50+", label: "Projects delivered" },
  { value: "24h", label: "Fixed quote turnaround" },
  { value: "5d", label: "Kickoff after payment" },
  { value: "Escrow", label: "On every order" },
] as const;

export const SERVICES: readonly ServiceItem[] = [
  {
    id: "design",
    num: "01 / Design & Brand Experience",
    icon: "◈",
    title: "Brand Experience",
    items: [
      "Logo & Premium Brand Identity",
      "UI/UX Motion Systems & Micro-Interactions",
      "Interactive 3D Web & Slide Decks",
      "Enterprise Design System Architecture",
      "Discord Server Branding & Setup",
      "GFX, Banners & Social Assets",
    ],
  },
  {
    id: "dev",
    num: "02 / Next-Gen Development",
    icon: "◇",
    title: "Next-Gen Development",
    items: [
      "High-Converting E-Commerce & Landers",
      "Custom Web Applications & MVPs",
      "Mobile Apps (iOS & Android)",
      "Workflow & CRM Automation (n8n / Make)",
      "Custom AI Assistant & Knowledge Base",
      "Discord Bots & API Integrations",
    ],
  },
  {
    id: "growth",
    num: "03 / Algorithm Growth & Marketing",
    icon: "△",
    title: "Algorithm Growth",
    items: [
      "Generative Engine Optimisation (GEO / AI SEO)",
      "Conversion Rate Optimisation (CRO)",
      "Short-Form Video Systems & Ad Templates",
      "Creator Monetisation & Funnel Infrastructure",
      "Paid Ads Management & ROAS Tracking",
      "Targeted Traffic & Growth Strategy",
    ],
  },
] as const;

export const PACKAGES_LIST: readonly PackageItem[] = [
  {
    key: "brand-sprint",
    tier: "01 / Design",
    name: "Brand Sprint",
    description:
      "For operators who need to look legitimate, fast. Logo, identity, and assets delivered clean and ready to use everywhere.",
    price: "$500",
    priceSub: "– $1,200",
    range: "Scales with asset complexity & rounds of revisions",
    time: "⏱ 1–2 week delivery",
    features: [
      "Logo + 3 variations (SVG + PNG)",
      "Colour system & typography guide",
      "Brand guidelines document",
      "3 key asset templates",
      "Discord banner & server icon",
      "2 full rounds of revisions included",
      "Website not included",
    ],
    handoff: "Handoff: SVG/PNG exports, brand PDF, and editable templates.",
    avg: "Most orders land around $700",
  },
  {
    key: "launch-stack",
    tier: "02 / Design + Dev",
    name: "Launch Stack",
    description:
      "Brand identity plus a custom website that actually converts. Everything to go from invisible to credible in one package.",
    price: "$2,500",
    priceSub: "– $7,500",
    range: "Scales with pages, features & tech complexity",
    time: "⏱ 3–4 week delivery",
    features: [
      "Everything in Brand Sprint",
      "Custom website (5–10 pages)",
      "Mobile-first, 97+ PageSpeed score",
      "SEO foundations & sitemap",
      "Analytics & conversion setup",
      "Payment gateway integration",
      "30-day post-launch support",
      "2 design rounds + 1 website revision round",
    ],
    handoff: "Handoff: source files, deploy access, and a short launch checklist.",
    avg: "Most startups land around $4,500",
    popular: true,
  },
  {
    key: "growth-engine",
    tier: "03 / Full Stack",
    name: "Growth Engine",
    description:
      "For brands ready to scale with a dedicated team running design, dev, and growth every month without you having to manage it.",
    price: "$3,500",
    priceSub: "/ mo",
    range: "Scales with weekly hours & team depth needed",
    time: "⏱ Ongoing from month 2",
    features: [
      "Everything in Launch Stack",
      "AI SEO (GEO) monthly execution",
      "CRO retainer & A/B testing",
      "Short-form video & ad templates",
      "Creator funnel infrastructure",
      "Monthly performance report",
      "Pause or cancel anytime",
      "Ongoing iteration within agreed monthly scope",
    ],
    handoff: "Handoff: monthly reports, asset library, and documented change log.",
    avg: "No long-term contract required",
  },
] as const;

export const PORTFOLIO: readonly PortfolioItem[] = [
  {
    id: "cascade",
    tag: "Web3 · Landing Page",
    name: "Cascade Markets",
    description:
      "High-impact crypto prediction market landing. Clean hero, Web3 visual language, performance-first structure.",
    chips: ["Web3 UI", "Landing Page", "Performance"],
    href: "https://cascade.markets",
    linkLabel: "cascade.markets ↗",
  },
  {
    id: "drain",
    tag: "Product Website",
    name: "Drain.cx",
    description:
      "Figma to production, pixel-accurate. Bento FAQ, scroll-triggered motion, dynamic category menu, ultrawide responsive.",
    chips: ["Next.js", "Tailwind", "Motion"],
    href: "https://drain.cx",
    linkLabel: "drain.cx ↗",
  },
  {
    id: "carspot",
    tag: "iOS & Android App",
    name: "CarSpotLive",
    description:
      "Full mobile app from scratch. UI/UX design, native iOS & Android dev, real-time mapping, App Store release.",
    chips: ["Mobile", "Firebase", "Real-Time"],
    href: "https://apps.apple.com/us/app/carspot-live/id6739596635",
    linkLabel: "App Store ↗",
  },
  {
    id: "dyo",
    tag: "Travel · Full Stack",
    name: "Dyo Travel",
    description:
      "Hotel booking platform. API-driven dynamic pricing, room listings, hosting setup, and ongoing live support.",
    chips: ["Node.js", "API", "Full Stack"],
    href: "https://dyotravel.com",
    linkLabel: "dyotravel.com ↗",
  },
] as const;

export const VOUCHES: readonly VouchItem[] = [
  {
    id: "crum",
    from: "Discord · Jan 2026",
    stars: 4,
    text: "Very professional team, worked on 2 projects with me and had no issues besides slight delays, but were compensated accordingly. Backend work was very professional and overall 9/10 experience.",
    who: "@crum",
  },
  {
    id: "vizzy",
    from: "Discord · Jul 2025",
    stars: 5,
    text: "Very great team, got done multiple projects for me so far and im looking for more in the future, thanks for the latest one. Fast and reliable.",
    who: "@vizzy",
    amount: "$900 + $2,000+ verified projects",
  },
  {
    id: "day",
    from: "Discord · Jan 2025",
    stars: 5,
    text: "$3k+ in dev work. Very professional, very kind and gets work done on time while maintaining quality.",
    who: "@day [WZ]",
    amount: "$3,000+ verified spend",
  },
  {
    id: "clippy",
    from: "Discord · Mar 2025",
    stars: 5,
    text: "Came through on a tight overnight deadline and had everything ready by morning. Identified and solved problems I didn't even know about. He's the POC for dev work now.",
    who: "@ClippyCult",
  },
  {
    id: "can",
    from: "Discord · Aug 2025",
    stars: 5,
    text: "Designs are not from this world. Such a good guy with so much heart and passion. I just can recommend him.",
    who: "@Can",
  },
  {
    id: "omballa",
    from: "Discord · Jul 2025",
    stars: 5,
    text: "Working with the Brandforge team has been extremely sensational. I am truly amazed at the motion graphics given to me by their designer and the detail put into this work.",
    who: "@Omballa",
  },
] as const;
