import type { PortfolioDetail } from "@/types/portfolio-page";

const DEFAULT_FAQ = [
  {
    question: "Can BrandForge build a project like this for my niche?",
    answer:
      "Yes. Send your references and deadline on Discord or Telegram. BrandForge quotes fixed USD scope within 24 hours based on pages, features, and integrations — not hourly guesses.",
  },
  {
    question: "Do you sign NDAs for private operator work?",
    answer:
      "Yes when required. Public case studies like this one only include what the client allows. Forum and Discord-only work often stays off the public web but is verified via vouches.",
  },
  {
    question: "Who owns the code and design files after delivery?",
    answer:
      "You do on final payment unless otherwise agreed. BrandForge hands off repos, Figma files, or deploy access documented in your quote.",
  },
  {
    question: "What if I need ongoing work after launch?",
    answer:
      "Launch Stack includes 30-day support. Growth Engine covers monthly iteration. Ad-hoc fixes are handled in the same Discord thread when scoped.",
  },
] as const;

export const PORTFOLIO_DETAILS: readonly PortfolioDetail[] = [
  {
    slug: "cascade-markets",
    meta: {
      title: "Cascade Markets Case Study — Web3 Landing | BrandForge",
      description:
        "How BrandForge shipped cascade.markets — crypto prediction market landing, Web3 UI, performance-first structure.",
    },
    name: "Cascade Markets",
    tag: "Web3 · Landing Page",
    liveUrl: "https://cascade.markets",
    liveLabel: "cascade.markets",
    context: [
      "Cascade Markets is a crypto prediction market product that needed a public face before paid traffic and community growth. The founder sold to traders who judge credibility in seconds — slow pages and generic templates kill trust.",
      "BrandForge scoped a single high-impact landing: explain the product, show social proof hooks, and drive wallet-ready users toward signup without burying the CTA under animation bloat.",
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
      { label: "Web design & development", href: "/services/web-design/" },
      { label: "Brand identity", href: "/services/brand-identity/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "drain-cx",
    meta: {
      title: "Drain.cx Case Study — Figma to Production | BrandForge",
      description:
        "Pixel-accurate Drain.cx build: bento FAQ, scroll motion, dynamic category menu, Next.js production site.",
    },
    name: "Drain.cx",
    tag: "Product Website",
    liveUrl: "https://drain.cx",
    liveLabel: "drain.cx",
    context: [
      "Drain.cx needed a product marketing site that matched approved Figma frames — not a developer interpretation that drifted on spacing and type. The audience includes power users on ultrawide monitors and mobile buyers alike.",
      "BrandForge executed design-to-code with motion that respects prefers-reduced-motion and a bento FAQ pattern that doubles as AI-extractable Q&A.",
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
      { label: "Web design & development", href: "/services/web-design/" },
      { label: "SEO & GEO growth", href: "/services/seo-growth/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "carspotlive",
    meta: {
      title: "CarSpotLive Case Study — iOS & Android App | BrandForge",
      description:
        "Full mobile app case study: UI/UX, native dev, real-time maps, Firebase, App Store release.",
    },
    name: "CarSpotLive",
    tag: "iOS & Android App",
    liveUrl: "https://apps.apple.com/us/app/carspot-live/id6739596635",
    liveLabel: "App Store",
    context: [
      "CarSpotLive connects car spotters with live map data — a community product that had to feel native, not a wrapped website. The client needed design, engineering, backend hooks, and App Store submission in one coordinated delivery.",
      "BrandForge owned UX flows, visual design, mobile build, and the unglamorous release checklist — certificates, screenshots, rejection fixes.",
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
      { label: "Mobile apps", href: "/services/mobile-apps/" },
      { label: "Web design", href: "/services/web-design/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "valaccs",
    meta: {
      title: "ValAccs.com Case Study — Digital Storefront | BrandForge",
      description:
        "E-commerce UX for digital goods: trust signals, checkout flow, operator-focused storefront design.",
    },
    name: "ValAccs.com",
    tag: "E-commerce · Digital Goods",
    liveUrl: "https://valaccs.com",
    liveLabel: "valaccs.com",
    context: [
      "ValAccs sells digital account products to buyers who have been scammed before. The site had to signal legitimacy fast — clear policies, vouch-adjacent trust patterns, and checkout that does not feel like a phishing clone.",
      "BrandForge designed and built a storefront tuned for forum-operator buyers: escrow mentions, support paths, and mobile-readable product cards.",
    ],
    problem: [
      "Generic template looked like every other resell store",
      "Checkout drop-off from unclear delivery expectations",
      "No structured trust layer for first-time buyers",
    ],
    delivered: [
      "Custom storefront layout — not a theme reskin",
      "Product card system with category filters",
      "Checkout flow with delivery expectation copy",
      "Trust strip: support channel, payment methods, policy links",
      "Mobile-first product browsing",
      "Analytics events on add-to-cart and purchase intent",
    ],
    stack: ["Next.js", "Tailwind CSS", "Stripe", "Vercel"],
    timeline: "3 weeks",
    teamSize: "2 — design + full-stack",
    outcome: [
      "Live storefront at valaccs.com with differentiated visual identity",
      "Conversion-focused layout reducing support tickets about delivery timing",
      "Foundation for paid traffic landing without rebuild",
    ],
    visuals: [
      { label: "Storefront", caption: "Category grid with trust header" },
      { label: "Product page", caption: "Delivery and policy clarity above fold" },
      { label: "Checkout", caption: "Minimal steps with support fallback" },
    ],
    relatedServices: [
      { label: "Web design & development", href: "/services/web-design/" },
      { label: "Paid ads & ROAS", href: "/services/paid-ads/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "dyotravel",
    meta: {
      title: "Dyo Travel Case Study — Booking Platform | BrandForge",
      description:
        "Hotel booking platform: API-driven pricing, room listings, hosting, ongoing support.",
    },
    name: "Dyo Travel",
    tag: "Travel · Full Stack",
    liveUrl: "https://dyotravel.com",
    liveLabel: "dyotravel.com",
    context: [
      "Dyo Travel needed more than a brochure site — a booking engine with dynamic pricing, inventory from APIs, and admin paths the client team could operate after handoff.",
      "BrandForge scoped full-stack delivery: customer-facing search and booking, backend integrations, hosting setup, and live support during launch week.",
    ],
    problem: [
      "Manual booking over WhatsApp did not scale past peak season",
      "Pricing changed daily — static pages were always wrong",
      "No single admin view of rooms and availability",
    ],
    delivered: [
      "Customer booking flow — search, room detail, reservation",
      "API integration for dynamic pricing and inventory",
      "Admin-friendly content areas for seasonal copy",
      "Hosting and SSL setup on client domain",
      "Payment handoff to client processor",
      "Launch-week support and bug triage",
    ],
    stack: ["Node.js", "React", "REST API", "PostgreSQL", "Nginx"],
    timeline: "8 weeks",
    teamSize: "4 — design, frontend, backend, DevOps",
    outcome: [
      "Live booking site at dyotravel.com",
      "Pricing synced to API — no manual page edits per rate change",
      "Client team documented on content updates and support escalation",
    ],
    visuals: [
      { label: "Search", caption: "Date and destination booking entry" },
      { label: "Room detail", caption: "Pricing and availability from API" },
      { label: "Confirmation", caption: "Booking summary and support contact" },
    ],
    vouch: {
      quote:
        "Very professional team, worked on 2 projects with me and had no issues besides slight delays, but were compensated accordingly. Backend work was very professional and overall 9/10 experience.",
      who: "@crum",
      from: "Discord · Jan 2026",
    },
    relatedServices: [
      { label: "Web design & development", href: "/services/web-design/" },
      { label: "Automation", href: "/services/automation/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "sui-blockchain-app",
    meta: {
      title: "SUI Blockchain App Case Study — 2-Week Rebuild | BrandForge",
      description:
        "Four-person team rebuilt a Sol ecosystem app for SUI blockchain in two weeks — wallet and on-chain UX.",
    },
    name: "SUI Blockchain App",
    tag: "Web3 · Mobile",
    context: [
      "A Web3 product needed to migrate wallet flows and on-chain interactions from Solana ecosystem tooling to SUI — under a hard two-week deadline before a public milestone.",
      "BrandForge assembled a four-person squad: mobile, smart-contract integration, QA, and project coordination on Discord with daily standups.",
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
      { label: "Mobile apps", href: "/services/mobile-apps/" },
      { label: "Web design", href: "/services/web-design/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "linkedin-automation",
    meta: {
      title: "LinkedIn Automation Platform — $4,660 Scope | BrandForge",
      description:
        "Scoped SaaS build: outreach workflows, dashboards, compliance limits, $4,660 fixed project.",
    },
    name: "LinkedIn Automation Platform",
    tag: "Automation · SaaS",
    context: [
      "A B2B operator needed a private outreach system — not a banned chrome extension — with dashboards, send limits, and human approval gates. BrandForge quoted $4,660 fixed USD for defined scope.",
      "The product connects CRM-style lists to sequenced actions with logging so the client could audit what was sent and when.",
    ],
    problem: [
      "Manual LinkedIn outreach did not scale past 20 leads per day",
      "Off-the-shelf tools violated platform limits and got accounts restricted",
      "No visibility into which sequence step converted",
    ],
    delivered: [
      "Web dashboard for lists, sequences, and send status",
      "Rate limits and daily caps configured to client policy",
      "Human approval queue before messages send",
      "Webhook integrations to existing CRM",
      "Export and audit logs for compliance review",
      "Deployed on client VPS with credential rotation notes",
    ],
    stack: ["Node.js", "React", "PostgreSQL", "n8n", "REST API"],
    timeline: "6 weeks",
    teamSize: "3 — full-stack, automation, design",
    outcome: [
      "$4,660 scoped delivery matched signed quote — no scope creep invoice",
      "Client reduced manual outreach time by roughly 70% in first month",
      "Audit trail satisfied internal compliance review",
    ],
    visuals: [
      { label: "Dashboard", caption: "Sequence status and daily caps" },
      { label: "Approval queue", caption: "Human review before send" },
      { label: "Logs", caption: "Exportable audit trail" },
    ],
    vouch: {
      quote:
        "Came through on a tight overnight deadline and had everything ready by morning. Identified and solved problems I didn't even know about. He's the POC for dev work now.",
      who: "@ClippyCult",
      from: "Discord · Mar 2025",
    },
    relatedServices: [
      { label: "Automation & workflows", href: "/services/automation/" },
      { label: "Custom AI tools", href: "/services/ai-tools/" },
    ],
    faqs: DEFAULT_FAQ,
  },
  {
    slug: "whiteskyhosting",
    meta: {
      title: "WhiteSky Hosting Case Study — B2B Web | BrandForge",
      description:
        "Hosting provider website: plan comparison, trust copy, conversion-focused B2B layout.",
    },
    name: "WhiteSky Hosting",
    tag: "Infrastructure · Web",
    liveUrl: "https://whiteskyhosting.com",
    liveLabel: "whiteskyhosting.com",
    context: [
      "WhiteSky Hosting sells server and infrastructure plans to technical buyers who compare specs in tables — not hero videos. The site needed clear plan tiers, trust signals, and support paths without looking like a 2010 hosting template.",
      "BrandForge built a B2B marketing site that leads with comparison clarity and human support contact — Discord and ticket paths — not chatbots that frustrate sysadmins.",
    ],
    problem: [
      "Legacy site buried plan differences in paragraph copy",
      "Low trust conversion from resellers comparing five providers at once",
      "Mobile layout broke comparison tables",
    ],
    delivered: [
      "Plan comparison matrix with feature checkmarks",
      "Dedicated pages for core plan tiers",
      "Trust section: uptime claims, support response, payment methods",
      "Responsive tables that scroll horizontally on mobile",
      "Contact and sales CTA above fold on every plan page",
      "Fast static delivery for global latency",
    ],
    stack: ["Next.js", "Tailwind CSS", "Static export", "Cloudflare"],
    timeline: "3 weeks",
    teamSize: "2 — design + frontend",
    outcome: [
      "Live site at whiteskyhosting.com with scannable plan comparison",
      "Sales inquiries routed to Discord and email with UTM tracking",
      "Client can update plan copy without developer for text-only changes",
    ],
    visuals: [
      { label: "Plan matrix", caption: "Side-by-side tier comparison" },
      { label: "Plan detail", caption: "Single-tier landing with CTA" },
      { label: "Trust", caption: "Support and uptime proof strip" },
    ],
    relatedServices: [
      { label: "Web design & development", href: "/services/web-design/" },
      { label: "SEO & GEO growth", href: "/services/seo-growth/" },
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
