import type { DevCardData, FaqItem } from "@/types/content";
import type { DevPageDetail } from "@/types/dev-page";

export const DEV_SLUGS = [
  "tech-stack",
  "ai-systems",
  "blockchain",
  "automation",
  "integrations",
  "open-builds",
] as const;

export type DevSlug = (typeof DEV_SLUGS)[number];

export const DEV_HUB_CARDS: readonly DevCardData[] = [
  {
    slug: "tech-stack",
    title: "Tech stack",
    description: "Languages, frameworks, and infra we reach for — and why we avoid novelty for novelty's sake.",
    tags: ["Next.js", "React Native", "Node", "PostgreSQL"],
    href: "/developers/tech-stack/",
  },
  {
    slug: "ai-systems",
    title: "AI systems",
    description: "RAG pipelines, internal copilots, and workflow agents wired to your data — not demo chatbots.",
    tags: ["OpenAI", "Embeddings", "n8n", "Vector DB"],
    href: "/developers/ai-systems/",
  },
  {
    slug: "blockchain",
    title: "Blockchain",
    description: "SUI, EVM, wallet UX, and on-chain integrations for products that must survive mainnet stress.",
    tags: ["SUI SDK", "EVM", "Wallet connect", "Web3 UI"],
    href: "/developers/blockchain/",
  },
  {
    slug: "automation",
    title: "Automation",
    description: "n8n, custom workers, and scheduled pipelines that replace manual ops without breaking audit trails.",
    tags: ["n8n", "Webhooks", "Cron", "Queues"],
    href: "/developers/automation/",
  },
  {
    slug: "integrations",
    title: "Integrations",
    description: "CRM, payments, Telegram, Discord, and third-party APIs — scoped with retry logic and observability.",
    tags: ["REST", "OAuth", "Stripe", "Telegram API"],
    href: "/developers/integrations/",
  },
  {
    slug: "open-builds",
    title: "Open builds",
    description: "Architecture writeups and diagrams from shipped work — how we think in production, not slide decks.",
    tags: ["Architecture", "Diagrams", "Runbooks"],
    href: "/developers/open-builds/",
  },
];

const DEV_FAQ: readonly FaqItem[] = [
  {
    question: "Does mxstermind white-label developer capacity?",
    answer:
      "We work as a named studio on selective engagements — not anonymous staff augmentation. NDA and white-label delivery are available when scoped.",
  },
  {
    question: "Can you audit an existing codebase before quoting?",
    answer:
      "Yes. Share repo access or architecture docs on Discord. We deliver a short findings note before fixed scope is signed.",
  },
  {
    question: "Do you work with in-house engineering teams?",
    answer:
      "Often. We integrate via PR reviews, shared Slack or Discord, and documented handoffs — common for established businesses extending product teams.",
  },
  {
    question: "Where do BrandForge packages fit?",
    answer:
      "BrandForge handles productized design and growth packages. mxstermind picks up cross-functional builds that need custom engineering depth.",
  },
];

const BASE: Omit<DevPageDetail, "slug" | "meta" | "eyebrow" | "title" | "subhead" | "overview" | "technologies" | "projectExample" | "decisions" | "codeSnippet" | "commercialBenefit"> = {
  faqs: DEV_FAQ,
};

export const DEV_PAGES: Record<DevSlug, DevPageDetail> = {
  "tech-stack": {
    ...BASE,
    slug: "tech-stack",
    meta: {
      title: "Tech Stack — Documented Choices | mxstermind",
      description:
        "Next.js, React Native, Node, PostgreSQL, Cloudflare — reasoned stack choices for Founder OS product builds.",
    },
    eyebrow: "Developers",
    title: "Stack we stand behind",
    subhead: "We pick tools for maintainability, hiring pool, and your team's ability to extend — not conference hype.",
    overview: [
      "mxstermind standardises on TypeScript across web and mobile where possible. That reduces context switching when your internal team inherits the repo.",
      "Static and edge-first delivery (Next.js export, Cloudflare Workers Assets) keeps marketing and app shells fast without ops overhead early on.",
      "When a engagement needs Python (Flask, data pipelines) or native modules, we document boundaries so polyglot stacks stay legible.",
    ],
    technologies: [
      { name: "Next.js 15 + React 19", reason: "App Router, static export, and SEO-friendly marketing surfaces without a separate CMS." },
      { name: "React Native", reason: "Single codebase for iOS and Android when CarSpotLive-style speed-to-store matters." },
      { name: "Node.js + PostgreSQL", reason: "Predictable APIs, strong JSON ecosystem, and relational data for audit-heavy products." },
      { name: "Cloudflare / Nginx", reason: "TLS, caching, and reverse proxy patterns we have shipped on cascade.markets and private trading infra." },
    ],
    projectExample: {
      name: "Crypto Trading Platform",
      href: "/portfolio/crypto-trading-platform/",
      summary: "React + Flask + MySQL + Nginx — full-stack desk with admin audit logs.",
    },
    decisions: [
      {
        title: "Static export vs serverful",
        body: "Marketing and content-heavy surfaces export statically for cost and speed. Auth-gated dashboards stay serverful or VPS-hosted when session state demands it.",
      },
      {
        title: "Monorepo vs split repos",
        body: "Small teams get one repo with clear packages. Larger handoffs may split admin and consumer apps when deploy cadence differs.",
      },
    ],
    codeSnippet: `┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Next.js    │────▶│  API (Node/  │────▶│ PostgreSQL  │
│  static/SSR │     │  Flask)      │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       └────────── Cloudflare / Nginx ──────────┘`,
    commercialBenefit: [
      "Faster hiring — mainstream stack reduces onboarding cost",
      "Lower hosting burn on marketing surfaces",
      "Clear extension path for your internal engineers",
    ],
    faqs: DEV_FAQ,
  },
  "ai-systems": {
    ...BASE,
    slug: "ai-systems",
    meta: {
      title: "AI Systems Integration | mxstermind",
      description:
        "RAG, internal copilots, and workflow agents connected to your data — production guardrails included.",
    },
    eyebrow: "Developers · AI",
    title: "AI that ships inside workflows",
    subhead: "Not a chat widget on your homepage — systems that read your docs, respect permissions, and log every action.",
    overview: [
      "We build retrieval-augmented assistants over Notion, Google Drive, ticket systems, or custom databases — with citation and fallback when confidence is low.",
      "Agent workflows hook into n8n or custom workers so humans approve sends, payouts, or customer replies before automation executes.",
    ],
    technologies: [
      { name: "Embeddings + vector store", reason: "Semantic search over private corpora without sending entire libraries per request." },
      { name: "OpenAI / Anthropic APIs", reason: "Model routing by task — cheap models for classification, capable models for synthesis." },
      { name: "n8n orchestration", reason: "Visual ops monitoring for non-engineers; JSON export for version control when needed." },
    ],
    projectExample: {
      name: "LinkedIn automation patterns",
      href: "/portfolio/drain-cx/",
      summary: "Human-in-the-loop sequences with audit logs — same approval pattern we use for AI outbound.",
    },
    decisions: [
      {
        title: "Grounding before generation",
        body: "Answers must cite internal chunks. Ungrounded speculation is blocked in customer-facing flows.",
      },
      {
        title: "Cost caps",
        body: "Token budgets and batch windows prevent runaway spend when traffic spikes.",
      },
    ],
    commercialBenefit: [
      "Support and ops teams answer from verified internal docs",
      "Sales sequences stay compliant with human approval gates",
      "Measurable time saved vs generic ChatGPT copy-paste",
    ],
    faqs: DEV_FAQ,
  },
  blockchain: {
    ...BASE,
    slug: "blockchain",
    meta: {
      title: "Blockchain & Web3 Engineering | mxstermind",
      description:
        "SUI migrations, wallet UX, EVM integrations — shipped under hard deadlines for Web3 products.",
    },
    eyebrow: "Developers · Web3",
    title: "Mainnet-grade wallet and chain UX",
    subhead: "Two-week SUI rebuilds and Web3 landings that look funded — because your users decide in seconds.",
    overview: [
      "We have shipped wallet connect, transaction signing, and network error states on mobile and web — including a four-person SUI migration under a fixed two-week milestone.",
      "Landing pages for crypto products prioritise LCP and clarity over animation bloat — see cascade.markets.",
    ],
    technologies: [
      { name: "SUI SDK", reason: "First-class support for recent wallet migration work." },
      { name: "EVM libraries", reason: "Ethereum-compatible contracts and read-only dashboards where clients already deploy." },
      { name: "React Native + Web", reason: "Shared transaction UX patterns across app store and browser wallets." },
    ],
    projectExample: {
      name: "SUI Blockchain App",
      href: "/portfolio/sui-blockchain/",
      summary: "Sol-to-SUI wallet migration — demo-ready in two weeks with a team of four.",
    },
    decisions: [
      {
        title: "Testnet-first QA",
        body: "Every signing flow passes structured testnet scenarios before mainnet handoff.",
      },
      {
        title: "Readable errors",
        body: "Chain failures surface human copy — not raw RPC dumps — to protect conversion.",
      },
    ],
    commercialBenefit: [
      "Hit investor and listing milestones without hiring a full Web3 team",
      "Reduce support tickets from confusing wallet states",
      "Marketing site and app share credible visual language",
    ],
    faqs: DEV_FAQ,
  },
  automation: {
    ...BASE,
    slug: "automation",
    meta: {
      title: "Automation & Pipeline Systems | mxstermind",
      description:
        "n8n, workers, and bot systems — Telegram verification, outreach queues, and ops pipelines with audit trails.",
    },
    eyebrow: "Developers · Automation",
    title: "Ops pipelines you can audit",
    subhead: "Replace manual moderation, outreach, and reporting — with logs moderators and compliance can actually read.",
    overview: [
      "mxstermind builds Telegram verification systems, scheduled reports, and CRM-triggered workflows where off-the-shelf Zapier templates break at volume.",
      "Every automation includes failure alerts, idempotency on webhooks, and admin override paths.",
    ],
    technologies: [
      { name: "n8n", reason: "Fast iteration with visual monitoring for ops teams." },
      { name: "Node workers", reason: "Custom rate limits and captcha logic for bots." },
      { name: "PostgreSQL", reason: "Durable state for member history, sequences, and appeals." },
    ],
    projectExample: {
      name: "Telegram Verification System",
      href: "/portfolio/telegram-verification-system/",
      summary: "Multi-server bot with captcha, admin dashboard, and member audit history.",
    },
    decisions: [
      {
        title: "Human gates on outbound",
        body: "High-risk sends (DMs, payments, public posts) queue for approval by default.",
      },
      {
        title: "Dead-letter queues",
        body: "Failed jobs land in a review table — nothing silently drops.",
      },
    ],
    commercialBenefit: [
      "Moderators reclaim hours daily on community products",
      "Compliance-friendly exports for outreach and verification",
      "Less vendor lock-in than opaque SaaS automation tiers",
    ],
    faqs: DEV_FAQ,
  },
  integrations: {
    ...BASE,
    slug: "integrations",
    meta: {
      title: "API & Third-Party Integrations | mxstermind",
      description:
        "Stripe, CRM, Telegram, Discord, exchange APIs — integrated with retries, OAuth, and observability.",
    },
    eyebrow: "Developers · Integrations",
    title: "Integrations that survive production",
    subhead: "Third-party APIs change without warning. We design for retries, token refresh, and operator-visible failure states.",
    overview: [
      "Trading desks, community products, and B2B SaaS all converge on the same problem: five vendors with different rate limits and auth flows.",
      "We map integration boundaries in writing — what is cached, what is source of truth, and what happens when a webhook arrives twice.",
    ],
    technologies: [
      { name: "REST + webhooks", reason: "Universal baseline for CRM, payments, and messaging platforms." },
      { name: "OAuth2 refresh", reason: "Long-lived connections without manual token paste every week." },
      { name: "Stripe / crypto rails", reason: "Checkout and treasury flows where clients already collect revenue." },
    ],
    projectExample: {
      name: "Crypto Trading Platform",
      href: "/portfolio/crypto-trading-platform/",
      summary: "Unified admin for positions and API keys — integration layer for exchange connectivity.",
    },
    decisions: [
      {
        title: "Idempotent webhooks",
        body: "Duplicate events must not double-charge or double-assign roles.",
      },
      {
        title: "Circuit breakers",
        body: "When an vendor is down, UI degrades gracefully with cached read-only state where safe.",
      },
    ],
    commercialBenefit: [
      "Fewer midnight pages when a vendor API shifts",
      "Single admin surface instead of five vendor dashboards",
      "Audit trail for finance and compliance reviews",
    ],
    faqs: DEV_FAQ,
  },
  "open-builds": {
    ...BASE,
    slug: "open-builds",
    meta: {
      title: "Open Builds — Architecture Writeups | mxstermind",
      description:
        "How we structure production systems: diagrams, runbooks, and decision logs from delivered work.",
    },
    eyebrow: "Developers · Open builds",
    title: "How we think in production",
    subhead: "Architecture notes and diagrams from shipped engagements — so technical buyers see how we work before they apply.",
    overview: [
      "Open builds are sanitized architecture writeups from real projects: tradeoffs, failure modes, and what we would do differently at 10× scale.",
      "They complement case studies — less marketing narrative, more system design.",
    ],
    technologies: [
      { name: "C4-style diagrams", reason: "Context, container, and component views for handoffs." },
      { name: "Runbooks", reason: "Deploy, rollback, and credential rotation steps operators can follow." },
      { name: "ADR snippets", reason: "Short decision records — why Postgres over Mongo, why static export, etc." },
    ],
    projectExample: {
      name: "Drain.cx production build",
      href: "/portfolio/drain-cx/",
      summary: "Figma-to-Next.js with motion budget and category navigation architecture.",
    },
    decisions: [
      {
        title: "Document at handoff",
        body: "Every Founder OS build includes a one-page architecture summary — not a 100-slide deck.",
      },
      {
        title: "Redaction by default",
        body: "Client secrets and proprietary algorithms stay out of public writeups unless approved.",
      },
    ],
    codeSnippet: `# Example ADR excerpt
Decision: Static export for marketing shell
Status: Accepted
Consequence: Sub-200ms TTFB on Cloudflare; auth routes live on subdomain`,
    commercialBenefit: [
      "Technical stakeholders evaluate fit before sales calls",
      "Internal teams inherit clearer mental models",
      "Faster diligence for established businesses",
    ],
    faqs: DEV_FAQ,
  },
};

export const DEV_HUB_FAQ = DEV_FAQ;

export function getDevPage(slug: string): DevPageDetail | undefined {
  return DEV_PAGES[slug as DevSlug];
}
