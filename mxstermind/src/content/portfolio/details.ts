import type { PortfolioDetail } from "@/types/portfolio-page";

const DEFAULT_FAQ = [
  {
    question: "Can mxstermind build a project like this for my niche?",
    answer:
      "Yes. Send your references and deadline on Discord or Telegram. mxstermind quotes fixed USD scope within 24 hours based on pages, features, and integrations — not hourly guesses.",
  },
  {
    question: "Do you sign NDAs for private operator work?",
    answer:
      "Yes when required. Public case studies like this one only include what the client allows. Forum and Discord-only work often stays off the public web but is verified via vouches.",
  },
  {
    question: "Who owns the code and design files after delivery?",
    answer:
      "You do on final payment unless otherwise agreed. mxstermind hands off repos, Figma files, or deploy access documented in your quote.",
  },
  {
    question: "What if I need ongoing work after launch?",
    answer:
      "Retainer or phase-two scope is quoted separately after handoff. mxstermind keeps the same Discord thread for continuity when capacity allows.",
  },
] as const;

export const PORTFOLIO_DETAILS: readonly PortfolioDetail[] = [
  {
    slug: "cascade-markets",
    meta: {
      title: "Cascade Markets Case Study — Web3 Landing | mxstermind",
      description:
        "How mxstermind shipped cascade.markets — crypto prediction market landing, Web3 UI, performance-first structure.",
    },
    name: "Cascade Markets",
    tag: "Web3 · Landing Page",
    liveUrl: "https://cascade.markets",
    liveLabel: "cascade.markets",
    context: [
      "Cascade Markets is a crypto prediction market product that needed a public face before paid traffic and community growth. The founder sold to traders who judge credibility in seconds — slow pages and generic templates kill trust.",
      "mxstermind scoped a single high-impact landing: explain the product, show social proof hooks, and drive wallet-ready users toward signup without burying the CTA under animation bloat.",
    ],
    problem: [
      "No production marketing site — only fragmented Figma frames and Discord announcements",
      "Web3 buyers bounce when LCP exceeds three seconds on mobile data",
      "Competitors in prediction markets look identical — purple gradients on stock templates",
    ],
    delivered: [
      "Hero with clear value prop and primary CTA above the fold",
      "Web3 visual language — dark UI, disciplined accent use, no meme clutter",
      "Responsive layout from mobile to ultrawide",
      "Performance-first static delivery — minimal JS on first paint",
      "Section structure ready for FAQ and GEO extraction",
      "Deploy on client infrastructure with handoff doc",
    ],
    stack: ["Next.js", "Tailwind CSS", "Static export", "Cloudflare"],
    timeline: "2–3 weeks",
    teamSize: "2 — design + frontend",
    outcome: [
      "Live URL at cascade.markets serving as the primary acquisition surface",
      "Page structure built for paid traffic tests without rebuild",
      "Clean handoff so the internal team could swap copy without breaking layout",
    ],
    visuals: [
      { label: "Hero", caption: "Above-fold CTA and Web3 headline hierarchy" },
      { label: "Features", caption: "Product proof sections with scannable blocks" },
      { label: "Mobile", caption: "Thumb-zone CTAs and readable type scale" },
    ],
    relatedServices: [
      { label: "Web design & development", href: "/services/" },
      { label: "Brand identity", href: "/services/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "drain-cx",
    meta: {
      title: "Drain.cx Case Study — Figma to Production | mxstermind",
      description:
        "Pixel-accurate Drain.cx build: bento FAQ, scroll motion, dynamic category menu, Next.js production site.",
    },
    name: "Drain.cx",
    tag: "Product Website",
    liveUrl: "https://drain.cx",
    liveLabel: "drain.cx",
    context: [
      "Drain.cx needed a product marketing site that matched approved Figma frames — not a developer interpretation that drifted on spacing and type. The audience includes power users on ultrawide monitors and mobile buyers alike.",
      "mxstermind executed design-to-code with motion that respects prefers-reduced-motion and a bento FAQ pattern that doubles as AI-extractable Q&A.",
    ],
    problem: [
      "Prior dev quote would rebuild layout instead of matching design",
      "FAQ content buried in Discord pins — not on-site for search or AI",
      "Category navigation needed to feel app-like, not blog-like",
    ],
    delivered: [
      "Pixel-faithful implementation from Figma source",
      "Scroll-triggered section reveals with reduced-motion fallback",
      "Bento grid FAQ with expandable answers",
      "Dynamic category menu for product browsing",
      "Ultrawide and mobile breakpoints tested",
      "SEO meta, OG tags, and semantic heading structure",
    ],
    stack: ["Next.js", "Tailwind CSS", "GSAP", "Lenis"],
    timeline: "4 weeks",
    teamSize: "3 — design, frontend, motion",
    outcome: [
      "Production site at drain.cx matching approved design sign-off",
      "FAQ indexed as on-page content for search and LLM citation",
      "Motion system reusable for future product launches",
    ],
    visuals: [
      { label: "Bento FAQ", caption: "Question blocks arranged for scan and extraction" },
      { label: "Category menu", caption: "Dynamic nav for product categories" },
      { label: "Scroll motion", caption: "Section reveals tied to scroll progress" },
    ],
    vouch: {
      quote:
        "Designs are not from this world. Such a good guy with so much heart and passion. I just can recommend him.",
      who: "@Can",
      from: "Discord · Aug 2025",
    },
    relatedServices: [
      { label: "Web design & development", href: "/services/" },
      { label: "SEO & GEO growth", href: "/services/seo-growth/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "carspotlive",
    meta: {
      title: "CarSpotLive Case Study — iOS & Android App | mxstermind",
      description:
        "Full mobile app case study: UI/UX, native dev, real-time maps, Firebase, App Store release.",
    },
    name: "CarSpotLive",
    tag: "iOS & Android App",
    liveUrl: "https://apps.apple.com/us/app/carspot-live/id6739596635",
    liveLabel: "App Store",
    context: [
      "CarSpotLive connects car spotters with live map data — a community product that had to feel native, not a wrapped website. The client needed design, engineering, backend hooks, and App Store submission in one coordinated delivery.",
      "mxstermind owned UX flows, visual design, mobile build, and the unglamorous release checklist — certificates, screenshots, rejection fixes.",
    ],
    problem: [
      "No shipped mobile product — only concept screens",
      "Real-time map performance risk on mid-range Android devices",
      "App Store review requirements unfamiliar to the founder",
    ],
    delivered: [
      "End-to-end UX for listing, map, and profile flows",
      "iOS and Android builds with Firebase backend integration",
      "Real-time location and listing updates",
      "App Store and Google Play submission assets",
      "Push notification setup for key events",
      "Post-submission fix window for review feedback",
    ],
    stack: ["React Native", "Firebase", "Maps API", "App Store Connect"],
    timeline: "10 weeks",
    teamSize: "3 — design, mobile dev, backend",
    outcome: [
      "Live App Store listing — CarSpotLive installable today",
      "Map and listing flows stable for launch community",
      "Client holds developer accounts and full codebase access",
    ],
    visuals: [
      { label: "Map view", caption: "Real-time spotter map interface" },
      { label: "Listing", caption: "Vehicle detail and community actions" },
      { label: "App Store", caption: "Store listing and screenshot set" },
    ],
    relatedServices: [
      { label: "Mobile apps", href: "/developers/blockchain/" },
      { label: "Web design", href: "/services/" },
    ],
    faqs: DEFAULT_FAQ,
  },


  {
    slug: "sui-blockchain",
    meta: {
      title: "SUI Blockchain App Case Study — 2-Week Rebuild | mxstermind",
      description:
        "Four-person team rebuilt a Sol ecosystem app for SUI blockchain in two weeks — wallet and on-chain UX.",
    },
    name: "SUI Blockchain App",
    tag: "Web3 · Mobile",
    context: [
      "A Web3 product needed to migrate wallet flows and on-chain interactions from Solana ecosystem tooling to SUI — under a hard two-week deadline before a public milestone.",
      "mxstermind assembled a four-person squad: mobile, smart-contract integration, QA, and project coordination on Discord with daily standups.",
    ],
    problem: [
      "Existing Sol-targeted codebase incompatible with SUI wallet SDK",
      "Two-week deadline non-negotiable for investor demo",
      "On-chain transaction failures tank user trust immediately",
    ],
    delivered: [
      "SUI wallet connect and session handling",
      "Transaction signing flows with user-readable error states",
      "Core app screens ported and tested on iOS and Android",
      "Network switching and balance display",
      "QA pass on testnet before mainnet handoff",
      "Runbook for client engineers post-launch",
    ],
    stack: ["React Native", "SUI SDK", "TypeScript", "Testnet tooling"],
    timeline: "2 weeks",
    teamSize: "4 — mobile ×2, integration, PM",
    outcome: [
      "Demo-ready build shipped before milestone date",
      "Wallet flows stable enough for early user cohort",
      "Documented gaps for phase-two features outside original scope",
    ],
    visuals: [
      { label: "Wallet connect", caption: "SUI session and account display" },
      { label: "Transaction", caption: "Signing flow with confirmation states" },
      { label: "Network", caption: "Chain status and error handling UI" },
    ],
    relatedServices: [
      { label: "Mobile apps", href: "/developers/blockchain/" },
      { label: "Web design", href: "/services/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "crypto-trading-platform",
    meta: {
      title: "Crypto Trading Platform Case Study | mxstermind",
      description:
        "Full-stack private trading desk: React UI, Flask API, MySQL, Nginx — scoped for operator-grade reliability.",
    },
    name: "Crypto Trading Platform",
    tag: "Fintech · Full-stack",
    context: [
      "A trading operator needed a private desk — not a white-label exchange — with order views, balance sync, and admin controls behind authentication. Speed and auditability mattered more than marketing polish.",
      "mxstermind scoped a full-stack build: React front end, Flask services, MySQL persistence, Nginx reverse proxy on client infrastructure.",
    ],
    problem: [
      "Spreadsheet and manual wallet tracking did not scale past daily volume",
      "Public SaaS tools lacked required custody and logging controls",
      "No unified admin view for positions, users, and API keys",
    ],
    delivered: [
      "Authenticated React dashboard with role-based views",
      "Flask REST API with structured error handling and audit logs",
      "MySQL schema for users, orders, balances, and admin actions",
      "Nginx TLS termination and rate limiting configuration",
      "Deployment runbook and credential rotation checklist",
      "Staging environment mirroring production topology",
    ],
    stack: ["React", "Flask", "MySQL", "Nginx", "Docker"],
    timeline: "8–10 weeks",
    teamSize: "3 — full-stack ×2, DevOps",
    outcome: [
      "Single dashboard replaced three manual tracking tools",
      "Audit logs satisfied internal compliance review",
      "Client team extended API for phase-two exchange integrations",
    ],
    visuals: [
      { label: "Dashboard", caption: "Position and balance overview" },
      { label: "Admin", caption: "User and API key management" },
      { label: "Logs", caption: "Exportable audit trail" },
    ],
    relatedServices: [
      { label: "Tech stack", href: "/developers/tech-stack/" },
      { label: "Integrations", href: "/developers/integrations/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "telegram-verification-system",
    meta: {
      title: "Telegram Verification Bot System | mxstermind",
      description:
        "Multi-server verification bot with admin dashboards, anti-abuse gates, and role sync for community operators.",
    },
    name: "Telegram Verification System",
    tag: "Automation · Bot",
    context: [
      "A community operator running multiple Telegram groups needed verified members before role assignment — manual approval collapsed at scale and invite links leaked.",
      "mxstermind built a bot system with captcha gates, admin dashboards, and PostgreSQL-backed member state across servers.",
    ],
    problem: [
      "Invite links abused by bots and resellers",
      "Moderators spent hours on manual approve/deny",
      "No audit trail when members appealed bans",
    ],
    delivered: [
      "Telegram bot with captcha and cooldown anti-abuse",
      "Admin web dashboard for pending, approved, and banned users",
      "Role sync hooks to Discord where cross-platform community existed",
      "PostgreSQL persistence for member history and appeals",
      "Webhook alerts for suspicious join patterns",
      "Documentation for moderator workflows",
    ],
    stack: ["Node.js", "Telegram Bot API", "PostgreSQL", "React admin"],
    timeline: "4–5 weeks",
    teamSize: "2 — backend, admin UI",
    outcome: [
      "Moderator approval time dropped from hours to minutes daily",
      "Bot join abuse reduced after captcha and rate limits",
      "Appeals handled with searchable member history",
    ],
    visuals: [
      { label: "Captcha flow", caption: "Verification gate on join" },
      { label: "Admin queue", caption: "Pending member review" },
      { label: "Audit", caption: "Member history and appeals" },
    ],
    relatedServices: [
      { label: "Automation", href: "/developers/automation/" },
      { label: "Integrations", href: "/developers/integrations/" },
    ],
    faqs: DEFAULT_FAQ,
  },
];

export function getPortfolioBySlug(slug: string): PortfolioDetail | undefined {
  return PORTFOLIO_DETAILS.find((p) => p.slug === slug);
}

export function getAllPortfolioSlugs(): readonly string[] {
  return PORTFOLIO_DETAILS.map((p) => p.slug);
}

