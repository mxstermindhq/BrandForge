import type { CuratedOperator } from "@/lib/schemas/operator.schema";

export const OPERATOR_SEED: CuratedOperator[] = [
  {
    username: "prince",
    name: "Prince",
    role: "Graphic & motion designer",
    yearsExp: 8,
    availability: "limited",
    amanahScore: 99,
    completionRate: 100,
    bio: "Eight years crafting visual brands. 182 consecutive 5-star vouches. Logos, banners, PFPs, server kits, animated brand assets. Source files always included.",
    bestResult: "182 consecutive 5-star vouches — 100% verified rating.",
    wontTakeOn: "Rush jobs where speed beats quality. Quality never gets cut.",
    startingPrice: "$25",
    pricingModel: "Per-asset / kit",
    skills: ["Logos", "Banners", "Motion", "PFP", "Brand kits", "Server"],
    idealClient: "Founders and creators who want craft over speed",
    workStyle: "Brief first. Queue respected. Quality never compromised.",
    typicalTimeline: "24–72h (queue dependent)",
    proofLink: "https://brandforge.gg/prince",
    faq: [
      {
        question: "Why do reviews mention longer wait times?",
        answer:
          "Prince takes his time. Every review says the same — it takes longer than expected and it's worth every day of the wait.",
      },
      {
        question: "What's your typical delivery?",
        answer: "Most projects ship in 24–72 hours with the source file included.",
      },
      {
        question: "What kinds of work do you take?",
        answer:
          "Logos, banners, server design, profile pictures, signatures, product cards, animated brand assets.",
      },
    ],
    isVerified: true,
    layoutSpan: "featured",
    displayOrder: 1,
  },
  {
    username: "dipps",
    name: "Dipako Thupayatlase",
    role: "Full-stack software engineer · Java",
    yearsExp: 4,
    availability: "available",
    amanahScore: 96,
    completionRate: 98,
    bio: "Full-stack engineer from Gaborone, Botswana. 4+ years building web apps, automation tools, and end-to-end software in Java, Python, Node.js, React, and TypeScript. Currently building an AI voice receptionist for dental clinics.",
    bestResult: "Reverse-engineered an APK to unblock a $2,000 client project at BrandForge.",
    wontTakeOn: "Vague briefs without a real owner or measurable outcome.",
    startingPrice: "EUR 1,500",
    pricingModel: "Project sprint",
    skills: ["Java", "Python", "Node.js", "React", "TypeScript", "SQL"],
    idealClient: "Founders shipping web apps and automation",
    workStyle: "Sprint-based with milestone reviews",
    typicalTimeline: "2–6 weeks per sprint",
    proofLink: "https://github.com/DippsDev",
    faq: [
      {
        question: "What kinds of products do you build?",
        answer:
          "Corporate websites, automation and scraping tools, AI voice agents, full-stack web apps, and end-to-end Java services.",
      },
      {
        question: "How do you scope an engagement?",
        answer:
          "We start with a 30-minute scoping call routed by mxstermind. I send back a fixed-scope sprint plan with milestones and a flat price.",
      },
      {
        question: "What stacks do you ship in?",
        answer:
          "Java (primary), Python for automation and scraping, Node.js + React + TypeScript on the web. SQL and unstructured data on the backend.",
      },
    ],
    isVerified: true,
    layoutSpan: "featured",
    displayOrder: 2,
  },
  {
    username: "thami",
    name: "Thami",
    role: "Senior software engineer",
    yearsExp: 10,
    availability: "limited",
    amanahScore: 95,
    completionRate: 96,
    bio: "Ten years shipping production systems. Architects platforms that survive scale, owns delivery from RFC to release, and keeps technical debt out of the roadmap.",
    bestResult: "Led the redesign of a high-traffic platform from monolith to event-driven services with zero downtime.",
    wontTakeOn: "Architecture work where decisions keep getting deferred without an accountable owner.",
    startingPrice: "EUR 2,000",
    pricingModel: "Sprint + advisory",
    skills: ["Architecture", "Platform engineering", "Reliability", "Cloud", "Observability"],
    idealClient: "Scale-ups carrying technical debt or migrating critical systems",
    workStyle: "Structured scope, transparent tradeoffs, written tech specs",
    typicalTimeline: "3–6 weeks per sprint",
    proofLink: "https://brandforge.gg/thami",
    faq: [
      {
        question: "What do you specialize in?",
        answer:
          "Platform engineering, system architecture, and reliability. I take messy production systems and make them durable.",
      },
      {
        question: "Can you act as a fractional staff engineer?",
        answer:
          "Yes. Advisory + delivery hybrid. I sit with your team, write the specs, ship a milestone, and keep moving.",
      },
      {
        question: "What stacks do you cover?",
        answer:
          "Node, TypeScript, Go, Postgres, Redis, Kafka, AWS, GCP. Cloud-agnostic by default — I pick what serves your roadmap.",
      },
    ],
    isVerified: true,
    layoutSpan: "standard",
    displayOrder: 3,
  },
  {
    username: "nik",
    name: "Nik",
    role: "Web3 developer",
    yearsExp: 6,
    availability: "available",
    amanahScore: 92,
    completionRate: 94,
    bio: "Web3 engineer focused on production-grade utility — wallets, payments, DeFi tooling. Builds with a security-first mindset and ships UX that doesn't punish users.",
    bestResult: "Shipped a self-custody wallet experience used across three blockchain networks.",
    wontTakeOn: "Token-first speculation projects with no real product utility.",
    startingPrice: "EUR 1,900",
    pricingModel: "Project-based",
    skills: ["Solidity", "Wallet UX", "EVM", "DeFi", "Smart contracts"],
    idealClient: "Founders building real-utility web3 products",
    workStyle: "Security review first, then ship in small reviewable increments",
    typicalTimeline: "2–5 weeks per scope",
    proofLink: "https://brandforge.gg/nik",
    faq: [
      {
        question: "What web3 stacks do you ship?",
        answer:
          "EVM chains (Ethereum, Base, Arbitrum, Optimism). Wallet integration via Wagmi/Viem. Smart contracts in Solidity with full test coverage.",
      },
      {
        question: "Do you handle audits?",
        answer:
          "I write contracts to be audit-ready and coordinate with external audit partners when the project warrants it.",
      },
      {
        question: "Can you also handle UX?",
        answer:
          "Yes. Wallet UX is the difference between a usable product and a security incident — I treat it as core engineering.",
      },
    ],
    isVerified: true,
    layoutSpan: "compact",
    displayOrder: 4,
  },
];
