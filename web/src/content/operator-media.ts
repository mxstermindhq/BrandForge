export type WorkStage = "done" | "doing" | "planned";

export type WorkPiece = {
  id: string;
  title: string;
  description: string;
  stage: WorkStage;
  image: string;
  ratio?: "wide" | "square" | "portrait";
  /** Long-form case study fields shown on the single work page. */
  caseStudy?: {
    summary?: string;
    targetClient?: string;
    coreUseCase?: string;
    mainFunctions?: string[];
    idealFlow?: string[];
    outcome?: string;
    stack?: string[];
  };
};

export type OperatorReview = {
  id: string;
  quote: string;
  reviewer: string;
  context: string;
};

export type OperatorService = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  image: string;
  bullets: string[];
};

export type OperatorMedia = {
  portrait: string;
  cover: string;
  accentTagline: string;
  workPieces: WorkPiece[];
  reviews: OperatorReview[];
  services: OperatorService[];
};

export const OPERATOR_MEDIA: Record<string, OperatorMedia> = {
  prince: {
    portrait: "/images/prince/portrait.png",
    cover: "/images/prince/work-motion.png",
    accentTagline: "182 verified vouches · 100% 5-star · Worth the wait.",
    workPieces: [
      {
        id: "logo-monogram",
        title: "Monogram logo system",
        description: "Embossed monogram lockup for a luxury brand identity.",
        stage: "done",
        image: "/images/prince/work-logo.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "Premium monogram identity built around restraint — a single mark that scales from app icon to embossed print without losing presence.",
          targetClient: "Luxury and lifestyle brands that need a recognizable single-letter mark.",
          coreUseCase: "Logo + monogram system suitable for print, motion, and digital channels.",
          outcome: "Delivered final marks in 48 hours with full source file ownership.",
          stack: ["Illustrator", "Figma", "After Effects"],
        },
      },
      {
        id: "server-banner",
        title: "Server brand banner",
        description: "Premium server banner — marble, foil, and gold finish.",
        stage: "done",
        image: "/images/prince/work-banner.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "Brand banner built for community presence — heavyweight marble texture, foil accents, and gold lockup centerpiece.",
          targetClient: "Discord, Telegram, and Twitch communities that want a premium first impression.",
          coreUseCase: "Server / community banner with animated and static deliverables.",
          outcome: "Boosted member retention on the welcome screen for the client's launch week.",
          stack: ["Photoshop", "After Effects"],
        },
      },
      {
        id: "pfp-grid",
        title: "PFP series",
        description: "Four matched social avatars across light & dark finishes.",
        stage: "done",
        image: "/images/prince/work-pfp.png",
        ratio: "square",
      },
      {
        id: "motion-asset",
        title: "Motion brand still",
        description: "3D chrome motion sequence for a product reveal.",
        stage: "doing",
        image: "/images/prince/work-motion.png",
        ratio: "wide",
      },
    ],
    reviews: [
      {
        id: "rev-1",
        quote:
          "Prince knows his shit. I came in with an idea, he pointed me in the right direction. Some sellers take your money — this artist cares about his craft. I'll 100% be back.",
        reviewer: "Client",
        context: "March 2026",
      },
      {
        id: "rev-2",
        quote:
          "His work is honestly the best. Bought banner and logo, changed some stuff up — no issues at all.",
        reviewer: "Vouch #107",
        context: "Verified buyer",
      },
      {
        id: "rev-3",
        quote:
          "He is the best graphics artist out there. I've never had any problems with his designs. Not like others who use free templates.",
        reviewer: "Vouch #106",
        context: "Verified buyer",
      },
      {
        id: "rev-4",
        quote:
          "Delivered in 24 hours and gave me the source file to edit. Recommended.",
        reviewer: "Vouch #149",
        context: "Verified buyer",
      },
      {
        id: "rev-5",
        quote:
          "8 panels, pfp and server banner for $25. Paid extra to skip queue — he was fast. 10/10 service.",
        reviewer: "Vouch #153",
        context: "Verified buyer",
      },
      {
        id: "rev-6",
        quote: "GFX level is extreme.",
        reviewer: "Vouch #168",
        context: "Verified buyer",
      },
    ],
    services: [
      {
        id: "prince-logo",
        name: "Logo & monogram",
        tagline: "Hand-crafted monogram lockup with source file.",
        price: "From $45",
        image: "/images/prince/work-logo.png",
        bullets: ["Concept brief", "2 directions", "Source + PNG + SVG", "Free 1 revision"],
      },
      {
        id: "prince-banner",
        name: "Server / brand banner",
        tagline: "Premium animated banner that signals quality on day one.",
        price: "From $35",
        image: "/images/prince/work-banner.png",
        bullets: ["Brief intake", "1 banner design", "Animated MP4 option", "Source file"],
      },
      {
        id: "prince-kit",
        name: "Full brand kit",
        tagline: "Logo + banner + 4 PFPs + 8 panels — your full identity drop.",
        price: "From $120",
        image: "/images/prince/service-design.png",
        bullets: ["Full identity system", "Source + delivery files", "Queue priority option", "Lifetime resend"],
      },
    ],
  },
  dipps: {
    portrait: "/images/dipps/portrait.png",
    cover: "/images/dipps/work-dental-ai.png",
    accentTagline: "Java-first full-stack engineer · Gaborone, Botswana · github.com/DippsDev",
    workPieces: [
      {
        id: "dental-ai-receptionist",
        title: "AI voice receptionist for French dental clinics",
        description: "24/7 AI front-desk that answers calls in natural French, books appointments, and routes urgent cases.",
        stage: "doing",
        image: "/images/dipps/work-dental-ai.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "An AI voice receptionist that replaces missed calls for private dental clinics. The agent picks up 24/7, speaks natural French, books and reschedules appointments, answers FAQs, and qualifies urgent cases before routing to humans.",
          targetClient:
            "Small-to-mid private dental clinics in France with high daily call volume and limited reception capacity.",
          coreUseCase:
            "Patient calls the clinic, the AI answers naturally in French, acts like a real front-desk receptionist, books or reschedules appointments, and transfers urgent calls to human staff.",
          mainFunctions: [
            "Answer incoming calls 24/7",
            "Book appointments",
            "Reschedule and cancel appointments",
            "Answer common questions: opening hours, address, emergency policy, pricing and insurance basics",
            "Qualify urgent vs non-urgent situations",
            "Transfer to human staff when needed",
          ],
          idealFlow: [
            "Natural French conversation",
            "Low latency on every turn",
            "Realistic voice with smooth interruption handling",
            "Integration-ready with Google Calendar / Calendly-style booking",
          ],
          outcome:
            "Cuts missed calls toward zero and frees reception staff for in-clinic care while keeping the patient experience professional.",
          stack: ["Next.js", "Realtime voice API", "Node", "Calendar integrations", "Twilio"],
        },
      },
      {
        id: "smith-transport",
        title: "Smith Transport — corporate website",
        description: "Responsive corporate site for a Botswana rigging and heavy-transport company.",
        stage: "done",
        image: "/images/dipps/smith-transport.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "Corporate website for Smith Transport, a Botswana-based rigging and heavy-transport company. Responsive frontend, modern UI, and full backend integration shipped end-to-end.",
          targetClient: "Industrial operators that need credibility and lead capture on their primary domain.",
          coreUseCase: "Replace an outdated brochure site with a fast, mobile-first corporate presence and inquiry funnel.",
          outcome: "Live at smithtransport.co.bw with measurable inbound inquiry capture.",
          stack: ["TypeScript", "React", "Node.js", "SQL"],
        },
      },
      {
        id: "mennos-koffiebar",
        title: "Menno's Koffiebar — coffee catering site",
        description: "Multi-page website for a Dutch specialty coffee catering business with quote flow.",
        stage: "done",
        image: "/images/dipps/mennos-koffiebar.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "Multi-page website for Menno's Koffiebar, a Dutch specialty coffee catering business — services, menu, gallery, pricing, and a quote-request system.",
          targetClient: "Hospitality and catering businesses converting visitors into booked events.",
          coreUseCase: "Showcase services, pricing, and gallery and collect qualified quote requests directly.",
          outcome: "Live at mennoskoffiebar.nl with a working quote intake feeding the owner directly.",
          stack: ["React", "TypeScript", "Node.js"],
        },
      },
      {
        id: "automation-scraping",
        title: "Automation & scraping tools",
        description: "Data extraction systems automating repetitive client business processes.",
        stage: "done",
        image: "/images/dipps/automation.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "Custom automation and scraping tools that pull structured and unstructured data from external sources and feed it into client workflows.",
          targetClient: "Operators who lose hours per week on repeatable data work.",
          coreUseCase: "Replace manual copy-paste workflows with reliable scheduled jobs and clean data pipelines.",
          outcome: "Removed days of manual work per month and produced consistent, queryable client datasets.",
          stack: ["Python", "SQL", "Node.js"],
        },
      },
    ],
    reviews: [
      {
        id: "dipps-rev-1",
        quote:
          "Reverse-engineered an APK to unblock a $2,000 client engagement. Solved what nobody else on the team could.",
        reviewer: "BrandForge",
        context: "Engineering team · 2026",
      },
      {
        id: "dipps-rev-2",
        quote:
          "Smith Transport went from outdated brochure to a clean responsive site with real inbound inquiry capture.",
        reviewer: "Smith Transport",
        context: "Botswana · 2026",
      },
      {
        id: "dipps-rev-3",
        quote:
          "Menno's Koffiebar quote flow now feeds bookings directly. Build was fast and exactly to spec.",
        reviewer: "Menno's Koffiebar",
        context: "Netherlands · 2026",
      },
    ],
    services: [
      {
        id: "dipps-ai-voice",
        name: "AI voice agent sprint",
        tagline: "Production-ready voice agent in 4 weeks — your industry, your language.",
        price: "From EUR 4,500",
        image: "/images/dipps/work-dental-ai.png",
        bullets: ["Realtime voice API", "Native language tuning", "Calendar / CRM integration", "Live deployment"],
      },
      {
        id: "dipps-corporate-site",
        name: "Corporate website sprint",
        tagline: "Responsive corporate site with backend integration in 2–4 weeks.",
        price: "From EUR 1,500",
        image: "/images/dipps/smith-transport.png",
        bullets: ["Responsive frontend", "Modern UI", "Backend + forms", "Live deploy"],
      },
      {
        id: "dipps-automation",
        name: "Automation & scraping",
        tagline: "Custom data extraction and process automation for repetitive business work.",
        price: "From EUR 1,200",
        image: "/images/dipps/automation.png",
        bullets: ["Python scraping", "Scheduled jobs", "SQL-ready output", "Pipeline monitoring"],
      },
    ],
  },
  thami: {
    portrait: "/images/thami/portrait.png",
    cover: "/images/thami/work-architecture.png",
    accentTagline: "A decade of shipping. Writes the RFC, then writes the code.",
    workPieces: [
      {
        id: "thami-architecture-redesign",
        title: "Platform architecture redesign",
        description: "Monolith to event-driven services with zero downtime, written specs, and a delivery plan.",
        stage: "done",
        image: "/images/thami/work-architecture.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "Re-architected a multi-tenant SaaS from a monolithic Node service into event-driven microservices behind a stable contract. Zero downtime, full observability.",
          targetClient: "Scale-ups carrying technical debt that's slowing every feature.",
          coreUseCase: "Make the platform fast, debuggable, and ready for the next 10x of growth.",
          outcome: "Cut release risk, halved incident MTTR, and unblocked the product roadmap.",
          stack: ["Node", "TypeScript", "Kafka", "Postgres", "Redis", "Terraform"],
        },
      },
      {
        id: "thami-analytics-platform",
        title: "Internal analytics platform",
        description: "Custom analytics dashboard rolling up product, billing, and operational data.",
        stage: "doing",
        image: "/images/thami/work-dashboard.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "Operational analytics dashboard that gives leadership real-time view across product usage, billing, and customer health.",
          targetClient: "Teams that need one source of truth across product and finance data.",
          stack: ["Next.js", "Postgres", "ClickHouse", "BigQuery"],
        },
      },
    ],
    reviews: [
      {
        id: "thami-rev-1",
        quote:
          "Thami took a 4-year-old codebase and turned it into a system the team actually wants to ship on.",
        reviewer: "VP Engineering",
        context: "Scale-up · 2025",
      },
      {
        id: "thami-rev-2",
        quote:
          "Writes the clearest tech specs I've seen. Half the work is done before a line of code is written.",
        reviewer: "CTO",
        context: "Verified client",
      },
    ],
    services: [
      {
        id: "thami-architecture-sprint",
        name: "Architecture sprint",
        tagline: "Audit, RFC, and a 6-week migration plan you can actually execute.",
        price: "From EUR 4,000",
        image: "/images/thami/work-architecture.png",
        bullets: ["System audit", "Written RFC", "Migration plan", "Hands-on execution"],
      },
      {
        id: "thami-platform-build",
        name: "Platform engineering",
        tagline: "Production-grade platform work — reliability, observability, and CI/CD.",
        price: "From EUR 6,000",
        image: "/images/thami/work-dashboard.png",
        bullets: ["Observability stack", "CI/CD pipelines", "Runbooks", "Capacity planning"],
      },
    ],
  },
  nik: {
    portrait: "/images/nik/portrait.png",
    cover: "/images/nik/work-defi.png",
    accentTagline: "Web3 that ships — wallets, payments, and DeFi tooling with real users.",
    workPieces: [
      {
        id: "nik-wallet-app",
        title: "Multi-chain self-custody wallet",
        description: "Mobile wallet with EVM + Solana support, on-ramp, and clean transaction UX.",
        stage: "done",
        image: "/images/nik/work-wallet.png",
        ratio: "portrait",
        caseStudy: {
          summary:
            "Self-custody wallet across Ethereum, Base, and Solana with on-ramp integration and a transaction UX designed for non-crypto-native users.",
          targetClient: "Web3 founders building mainstream-facing wallet or payments products.",
          stack: ["React Native", "Viem", "Wagmi", "Privy", "Solana web3.js"],
        },
      },
      {
        id: "nik-defi-dashboard",
        title: "DeFi portfolio dashboard",
        description: "Cross-chain liquidity, yields, and portfolio tracking surfaced in one view.",
        stage: "doing",
        image: "/images/nik/work-defi.png",
        ratio: "wide",
        caseStudy: {
          summary:
            "Bloomberg-style DeFi dashboard tracking liquidity pools, yields, and portfolio across multiple chains in real-time.",
          targetClient: "DeFi power users and on-chain funds that need consolidated reporting.",
          stack: ["Next.js", "Wagmi", "The Graph", "Postgres"],
        },
      },
    ],
    reviews: [
      {
        id: "nik-rev-1",
        quote: "Wallet UX so clean my non-crypto investor onboarded without help.",
        reviewer: "Web3 founder",
        context: "Verified client",
      },
      {
        id: "nik-rev-2",
        quote: "Smart contracts written with audit discipline. No surprises later.",
        reviewer: "Protocol team",
        context: "Verified client",
      },
    ],
    services: [
      {
        id: "nik-wallet-integration",
        name: "Wallet integration",
        tagline: "Production wallet flow for your dApp — secure, fast, and easy to use.",
        price: "From EUR 2,400",
        image: "/images/nik/work-wallet.png",
        bullets: ["EVM + Solana", "Wallet connect", "On-ramp options", "Transaction UX"],
      },
      {
        id: "nik-smart-contracts",
        name: "Smart contracts",
        tagline: "Audit-ready Solidity contracts with full test coverage and deployment plan.",
        price: "From EUR 3,800",
        image: "/images/nik/work-defi.png",
        bullets: ["Specs + spec review", "Solidity + tests", "Deployment scripts", "Audit prep"],
      },
    ],
  },
};

export function getOperatorMedia(username: string): OperatorMedia | null {
  return OPERATOR_MEDIA[username.toLowerCase()] ?? null;
}

export function getOperatorWorkPiece(username: string, pieceId: string): WorkPiece | null {
  const media = getOperatorMedia(username);
  if (!media) return null;
  return media.workPieces.find((piece) => piece.id === pieceId) ?? null;
}
