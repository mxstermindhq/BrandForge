import type { FaqItem } from "@/types/content";

export type NichePage = {
  slug: string;
  headline: string;
  meta: { title: string; description: string };
  pain: readonly string[];
  proof: readonly { name: string; href: string }[];
  pricingAnchor: string;
  portfolioSlugs: readonly string[];
  body: readonly string[];
  faqs: readonly FaqItem[];
};

export const NICHE_PAGES: Record<string, NichePage> = {
  "gaming-server-owners": {
    slug: "gaming-server-owners",
    headline: "Discord servers that look as serious as your player count",
    meta: {
      title: "For Gaming Server Owners | BrandForge",
      description:
        "Discord branding, GFX, landers, and growth for gaming communities. Fixed quotes in 24h.",
    },
    pain: [
      "Players judge a server by the banner before they read rules",
      "Recruiting staff when the server looks like a reskin",
      "Launch week chaos with no announcement assets",
    ],
    proof: [
      { name: "Discord branding", href: "/services/discord-branding/" },
      { name: "CarSpotLive", href: "/portfolio/carspotlive/" },
    ],
    pricingAnchor: "Discord branding from package tiers · full Launch Stack $2,500–$7,500",
    portfolioSlugs: ["carspotlive", "drain-cx"],
    body: [
      "BrandForge builds server structure, role art, banners, and landing pages that convert lurkers into members. We sell fixed USD — forum culture, escrow-friendly.",
    ],
    faqs: [
      {
        question: "Can BrandForge rebrand my existing server?",
        answer: "Yes — share member count, games, and deadline on Discord for a quote.",
      },
      {
        question: "Do you run the server for us?",
        answer: "We ship assets and bots — moderation stays yours unless automation is scoped.",
      },
      {
        question: "FiveM / Minecraft specific?",
        answer: "GFX and web work across niches — send references.",
      },
      {
        question: "mxstermind for gaming?",
        answer: "Studio fits large community products and apps; packages fit most server rebrands.",
      },
    ],
  },

  "web3-crypto-projects": {
    slug: "web3-crypto-projects",
    headline: "Web3 sites that explain value before chain jargon",
    meta: {
      title: "For Web3 & Crypto Projects | BrandForge",
      description: "Landing pages, brand, and GEO for crypto operators. Cascade Markets proof.",
    },
    pain: [
      "Cold traffic bounces when the hero is all tickers",
      "Investors and users need different proof above the fold",
      "Launch dates slip while creative drifts",
    ],
    proof: [
      { name: "Cascade Markets", href: "/portfolio/cascade-markets/" },
      { name: "SUI app", href: "/portfolio/sui-blockchain-app/" },
    ],
    pricingAnchor: "Landers from Launch Stack · rush Web3 scoped on Discord",
    portfolioSlugs: ["cascade-markets", "sui-blockchain-app"],
    body: [
      "We understand escrow, crypto payments, and TGE timelines. BrandForge quotes fixed scope; mxstermind handles enterprise bespoke.",
    ],
    faqs: [
      {
        question: "Do you audit smart contracts?",
        answer: "Front-end and brand by default — auditors for contract scope when briefed.",
      },
      {
        question: "GEO for crypto?",
        answer: "FAQ and schema on every page — see /services/seo-growth/.",
      },
      {
        question: "Can you ship in two weeks?",
        answer: "Sometimes — see SUI case study; feasibility confirmed on intake.",
      },
      {
        question: "Payment in crypto?",
        answer: "Yes when contract allows — stated in quote.",
      },
    ],
  },

  "saas-startups": {
    slug: "saas-startups",
    headline: "SaaS sites that sell the outcome — not the feature list",
    meta: {
      title: "For SaaS Startups | BrandForge",
      description: "Landers, brand, and automation for early SaaS. LinkedIn automation case study.",
    },
    pain: [
      "Product is ready but site reads like a template",
      "Outbound and site tell different stories",
      "No time to wire CRM and marketing stack",
    ],
    proof: [
      { name: "LinkedIn automation", href: "/portfolio/linkedin-automation/" },
      { name: "Drain.cx", href: "/portfolio/drain-cx/" },
    ],
    pricingAnchor: "Launch Stack for MVP marketing · automation quoted separately",
    portfolioSlugs: ["linkedin-automation", "drain-cx"],
    body: ["Fixed quotes, fast Discord delivery, documentation handoff for your next hire."],
    faqs: [
      {
        question: "Do you build the SaaS app?",
        answer: "Yes when scoped — web apps and automation are service lines.",
      },
      {
        question: "B2B copy included?",
        answer: "Outcome-led copy in scope — you review facts, we structure.",
      },
      {
        question: "Integrations?",
        answer: "/services/automation/ and integrations in custom quotes.",
      },
      {
        question: "When mxstermind?",
        answer: "Multi-quarter product + growth systems — apply at mxstermind.com.",
      },
    ],
  },

  "ecommerce-brands": {
    slug: "ecommerce-brands",
    headline: "Stores that earn trust before the first add-to-cart",
    meta: {
      title: "For E-commerce Brands | BrandForge",
      description: "Storefronts and conversion UX — ValAccs and travel references.",
    },
    pain: [
      "High ticket digital goods need proof, not theme sparkle",
      "Checkout distrust kills forum traffic",
      "Ads send traffic to slow pages",
    ],
    proof: [
      { name: "ValAccs.com", href: "/portfolio/valaccs/" },
      { name: "Dyo Travel", href: "/portfolio/dyotravel/" },
    ],
    pricingAnchor: "Store builds inside Launch Stack · CRO via Growth Engine",
    portfolioSlugs: ["valaccs", "dyotravel"],
    body: ["Performance and trust copy are non-negotiable for operator stores."],
    faqs: [
      {
        question: "Shopify or custom?",
        answer: "Scoped per quote — many operators want custom for control.",
      },
      {
        question: "Payment processors?",
        answer: "We integrate what you approve — crypto, Stripe, escrow instructions.",
      },
      {
        question: "Product photography?",
        answer: "Digital goods often need UI mockups — physical shoots out of scope unless briefed.",
      },
      {
        question: "Ongoing ads?",
        answer: "/services/paid-ads/ or Growth Engine retainer.",
      },
    ],
  },

  "content-creators": {
    slug: "content-creators",
    headline: "Content systems for creators who hate filming blind",
    meta: {
      title: "For Content Creators | BrandForge",
      description: "Short-form systems, brand kits, and landers for creators and educators.",
    },
    pain: [
      "Posting randomly when sponsors want consistency",
      "No reusable templates for hooks and CTAs",
      "Link-in-bio goes nowhere useful",
    ],
    proof: [{ name: "Social media service", href: "/services/social-media/" }],
    pricingAnchor: "Brand Sprint + social templates · Growth Engine for retainers",
    portfolioSlugs: ["drain-cx"],
    body: [
      "Calendars, caption templates, and landers that capture email or Discord — not just views.",
    ],
    faqs: [
      {
        question: "Do you edit videos?",
        answer: "Templates and systems first — editing scoped if briefed.",
      },
      {
        question: "Personal brand only?",
        answer: "Creator and small team brands — same discipline.",
      },
      {
        question: "Platforms?",
        answer: "TikTok, YouTube Shorts, X — aspect-safe exports.",
      },
      {
        question: "AI tools?",
        answer: "/services/ai-tools/ for caption and research assistants.",
      },
    ],
  },

  "forum-sellers": {
    slug: "forum-sellers",
    headline: "Forum sellers who need to look funded on the first vouch thread",
    meta: {
      title: "For Forum Sellers | BrandForge",
      description: "Identity, stores, and trust UX for marketplace operators.",
    },
    pain: [
      "Buyers scroll past stores that look like scams",
      "Rebrand after a dispute without losing SEO",
      "No time to build GFX between fulfillment",
    ],
    proof: [
      { name: "ValAccs", href: "/portfolio/valaccs/" },
      { name: "Brand identity", href: "/services/brand-identity/" },
    ],
    pricingAnchor: "Brand Sprint from $500 · stores via Launch Stack",
    portfolioSlugs: ["valaccs", "whiteskyhosting"],
    body: [
      "Escrow culture is default. We quote in USD within 24 hours and ship files you own.",
    ],
    faqs: [
      {
        question: "Do you know forum culture?",
        answer: "Yes — vouches, escrow, and dispute-aware copy are normal here.",
      },
      {
        question: "Can you match my marketplace rules?",
        answer: "You confirm compliance — we design within your constraints.",
      },
      {
        question: "Fastest path?",
        answer: "Brand Sprint + simple lander — expand after first sales.",
      },
      {
        question: "Forum marketing guide?",
        answer: "/blog/forum-marketing-2026-what-still-works/",
      },
    ],
  },

  "mobile-app-founders": {
    slug: "mobile-app-founders",
    headline: "Mobile apps that ship to the store — not endless Figma loops",
    meta: {
      title: "For Mobile App Founders | BrandForge",
      description:
        "iOS and Android MVPs, UI/UX, Firebase backends, and App Store release — CarSpotLive proof.",
    },
    pain: [
      "Agencies sell mockups while store review deadlines slip",
      "Founders need maps, auth, and payments — not another landing page",
      "Investors ask for TestFlight proof you do not have yet",
    ],
    proof: [
      { name: "CarSpotLive", href: "/portfolio/carspotlive/" },
      { name: "Mobile apps service", href: "/services/mobile-apps/" },
    ],
    pricingAnchor: "MVP Engine $5k/mo · Blueprint for pre-validation",
    portfolioSlugs: ["carspotlive", "sui-blockchain-app", "ai-voice-receptionist"],
    body: [
      "BrandForge ships native and cross-platform apps with real backends — quote fixed USD on Discord within 24 hours.",
    ],
    faqs: [
      {
        question: "Do you build iOS and Android?",
        answer: "Yes — React Native and native paths quoted per scope.",
      },
      {
        question: "App Store submission included?",
        answer: "Yes when scoped — see CarSpotLive case study.",
      },
      {
        question: "How long for an MVP?",
        answer: "Typically 8–12 weeks depending on features — sprint-based in MVP Engine.",
      },
      {
        question: "Pre-store validation?",
        answer: "Blueprint tier for brand + waitlist lander before full app build.",
      },
    ],
  },

  "automation-ops-teams": {
    slug: "automation-ops-teams",
    headline: "Ops teams drowning in spreadsheets — automate the handoffs",
    meta: {
      title: "For Automation & Ops Teams | BrandForge",
      description:
        "n8n and Make workflows, CRM sync, Slack alerts, and internal dashboards — The Automator retainer.",
    },
    pain: [
      "Leads copied manually between five tools every morning",
      "No visibility when a workflow breaks at 2am",
      "Hourly consultants with no documentation handoff",
    ],
    proof: [
      { name: "Ops Flow Dashboard", href: "/portfolio/ops-flow-dashboard/" },
      { name: "Automation service", href: "/services/automation/" },
    ],
    pricingAnchor: "The Automator $1.5k–$3k/mo · 3 active workflows",
    portfolioSlugs: ["ops-flow-dashboard", "linkedin-automation", "jarro-ai"],
    body: [
      "We map your data flow, build n8n or Make recipes, and ship dashboards ops can actually read — fixed monthly capacity, no silent scope creep.",
    ],
    faqs: [
      {
        question: "n8n or Make?",
        answer: "Scope-dependent — see /blog/n8n-vs-make-automation-guide/.",
      },
      {
        question: "Self-hosted n8n?",
        answer: "Yes — quoted per retainer with hosting options.",
      },
      {
        question: "First workflow to build?",
        answer: "Lead capture → CRM → Slack alert — highest ROI for most teams.",
      },
      {
        question: "How many workflows per month?",
        answer: "Automator tier caps 3 active workflows — extras quoted upfront.",
      },
    ],
  },
};

export const NICHE_SLUGS = Object.keys(NICHE_PAGES);
