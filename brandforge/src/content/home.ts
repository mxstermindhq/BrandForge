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
  availability: string;
  capacityLimit: string;
  valueProposition: string;
  time: string;
  features: readonly string[];
  handoff: string;
  avg: string;
  popular?: boolean;
  slotLimited?: boolean;
};

export type PortfolioItem = {
  id: string;
  tag: string;
  name: string;
  description: string;
  chips: readonly string[];
  href?: string;
  linkLabel?: string;
  caseStudyHref?: string;
};

export type VouchItem = {
  id: string;
  from: string;
  stars: number;
  text: string;
  who: string;
  amount?: string;
  role?: string;
  portfolioSlug?: string;
  avatarInitial?: string;
};

export type StatItem = {
  value: string;
  label: string;
  icon?: string;
};

export const HERO_STATS: readonly StatItem[] = [
  { value: "25+", label: "Projects delivered", icon: "◆" },
  { value: "12", label: "Countries served", icon: "◎" },
  { value: "14", label: "Vouches earned", icon: "★" },
  { value: "24h", label: "Fixed quote turnaround", icon: "⏱" },
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
    key: "blueprint",
    tier: "Tier 1: The Blueprint (Starter)",
    name: "The Blueprint",
    description: "Fast, high-converting launchpad for early ideas.",
    price: "$300",
    priceSub: " – $500",
    availability: "Open for new projects",
    capacityLimit: "Up to 3 core assets per project (1 Logo, 1 Lander, 1 Funnel structure)",
    valueProposition: "Fast, high-converting launchpad for early ideas.",
    time: "⏱ One-time project · 1–2 weeks",
    features: [
      "Logo, colours, typography, social templates",
      "High-converting single landing page or basic CRM setup",
      "Creator monetization funnel structure setup",
      "2 full rounds of design tweaks",
    ],
    handoff: "Handoff: SVG/PNG + deployment access + basic guidelines.",
    avg: "7 days post-launch export fixes",
  },
  {
    key: "automator",
    tier: "Tier 2: The Automator (Mid-Tier Retainer)",
    name: "The Automator",
    description: "Reclaim your time. Continuous workflow automation and data integration.",
    price: "$1,500",
    priceSub: " – $3,000 / mo",
    availability: "⚠️ ONLY 1 SLOT REMAINING (2/3 slots filled)",
    capacityLimit: "Up to 3 active automation workflows / CRM integrations at once",
    valueProposition: "Reclaim your time. Continuous workflow automation and data integration.",
    time: "⏱ Ongoing monthly · cancel anytime",
    features: [
      "Continuous workflow & CRM automation (n8n / Make)",
      "API integrations between your tools",
      "Monthly CRO audits, A/B testing, and GEO strategy",
      "Continuous adjustment within monthly scope",
    ],
    handoff: "Handoff: clean repo updates, automation flow maps, live dashboards.",
    avg: "Included while retainer is active",
    slotLimited: true,
    popular: true,
  },
  {
    key: "mvp-engine",
    tier: "Tier 3: The MVP Engine (Scale-Up Retainer)",
    name: "The MVP Engine",
    description: "Rapid product shipping. Continuous feature updates without internal dev overhead.",
    price: "$5,000",
    priceSub: " / mo",
    availability: "⚠️ ONLY 1 SLOT REMAINING (2/3 slots filled)",
    capacityLimit: "Up to 3 core feature deployments shipped per monthly sprint",
    valueProposition: "Rapid product shipping. Continuous feature updates without internal dev overhead.",
    time: "⏱ Ongoing monthly · cancel anytime",
    features: [
      "Custom Web App / MVP development",
      "Continuous feature shipping each sprint",
      "Full Web App UI/UX + motion systems",
      "Funnel infrastructure & targeted traffic strategy",
      "Sprint-based continuous iteration",
    ],
    handoff: "Handoff: source code access, feature deployment logs, asset library.",
    avg: "Included while retainer is active",
    slotLimited: true,
  },
  {
    key: "ai-community",
    tier: "Tier 4: The AI & Community (Tech-Forward Retainer)",
    name: "The AI & Community",
    description: "Scale engagement. Next-gen community infrastructure driven by custom AI.",
    price: "$7,500",
    priceSub: " / mo",
    availability: "⚠️ ONLY 1 SLOT REMAINING (2/3 slots filled)",
    capacityLimit: "Up to 3 active automated assets (1 AI agent, 1 Discord bot, 1 video pipeline)",
    valueProposition: "Scale your engagement. Next-gen community infrastructure driven by custom AI.",
    time: "⏱ Ongoing monthly · cancel anytime",
    features: [
      "Custom AI Assistant + Knowledge Base updates",
      "Discord bots + server branding & assets",
      "Short-form video pipelines + creator monetization systems",
      "Agile adjustments based on community / AI feedback",
    ],
    handoff: "Handoff: AI deployment keys, bot hosting setups, server ownership.",
    avg: "Included while retainer is active",
    slotLimited: true,
  },
  {
    key: "full-stack-enterprise",
    tier: "Tier 5: The Full-Stack Powerhouse (Enterprise Retainer)",
    name: "The Full-Stack Powerhouse",
    description: "Your entire technical, creative, and marketing department outsourced to an elite squad.",
    price: "$10,000",
    priceSub: "+ / mo",
    availability: "⚠️ ONLY 1 SLOT REMAINING (2/3 slots filled)",
    capacityLimit: "Up to 3 dedicated work streams across Design, Dev, and Growth concurrently",
    valueProposition:
      "Your entire technical, creative, and marketing department outsourced to an elite squad.",
    time: "⏱ Dedicated squad · ongoing retainer",
    features: [
      "Interactive 3D Web assets + custom pitch / slide decks",
      "Native mobile apps (iOS / Android) + deep infrastructure",
      "Full paid ads management, ROAS tracking, aggressive GEO",
      "Priority execution, zero-bottleneck revisions",
    ],
    handoff: "Handoff: complete architecture blueprints, full IP transfer, live reporting.",
    avg: "24/7 priority developer Slack channel access",
    slotLimited: true,
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
    caseStudyHref: "/portfolio/cascade-markets/",
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
    caseStudyHref: "/portfolio/drain-cx/",
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
    caseStudyHref: "/portfolio/carspotlive/",
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
    caseStudyHref: "/portfolio/dyotravel/",
  },
] as const;

export const VOUCHES: readonly VouchItem[] = [
  {
    id: "zyllls",
    from: "Telegram · Feb 2025",
    stars: 5,
    text: "Amazing logos and graphics! $500+ in deals. Went smooth and easy.",
    who: "@zyllls",
    amount: "$500+ verified",
  },
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
    role: "Forum operator",
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
    role: "Store owner",
    portfolioSlug: "drain-cx",
  },
  {
    id: "omballa",
    from: "Discord · Jul 2025",
    stars: 5,
    text: "Working with the Brandforge team has been extremely sensational. I am truly amazed at the motion graphics given to me by their designer and the detail put into this work.",
    who: "@Omballa",
  },
] as const;
