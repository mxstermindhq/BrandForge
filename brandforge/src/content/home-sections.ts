import type { FaqItem } from "@/types/content";

export const LIVE_PROJECT_URLS = [
  { label: "cascade.markets", href: "https://cascade.markets" },
  { label: "drain.cx", href: "https://drain.cx" },
  { label: "dyotravel.com", href: "https://dyotravel.com" },
  { label: "repsheets.net", href: "https://repsheets.net" },
  { label: "whiteskyhosting.com", href: "https://whiteskyhosting.com" },
  {
    label: "CarSpot Live",
    href: "https://apps.apple.com/us/app/carspot-live/id6739596635",
  },
] as const;

export const PACKAGE_TIER_COLUMNS = [
  { key: "blueprint", label: "Tier 1: Blueprint" },
  { key: "automator", label: "Tier 2: Automator" },
  { key: "mvpEngine", label: "Tier 3: MVP Engine" },
  { key: "aiCommunity", label: "Tier 4: AI & Community" },
  { key: "fullStack", label: "Tier 5: Full-Stack" },
] as const;

export type DeliveryRow = {
  deliverable: string;
  blueprint: string;
  automator: string;
  mvpEngine: string;
  aiCommunity: string;
  fullStack: string;
};

export const DELIVERY_ROWS: readonly DeliveryRow[] = [
  {
    deliverable: "01 / Design",
    blueprint: "Logo, colors, typography, social templates.",
    automator: "Continuous UI/UX updates, short-form video ad templates.",
    mvpEngine: "Full Web App UI/UX, motion systems, custom interactions.",
    aiCommunity: "Enterprise Design System, Discord server branding & assets.",
    fullStack: "Interactive 3D Web assets, custom pitch/slide decks.",
  },
  {
    deliverable: "02 / Dev (Core)",
    blueprint: "High-converting single landing page or basic CRM setup.",
    automator: "Continuous workflow & CRM automation (n8n/Make), API integrations.",
    mvpEngine: "Custom Web App/MVP development & continuous feature shipping.",
    aiCommunity: "Custom AI Assistant, Knowledge Base updates, Discord bots.",
    fullStack: "Native Mobile Apps (iOS/Android) & deep infrastructure maintenance.",
  },
  {
    deliverable: "03 / Growth",
    blueprint: "Creator monetization funnel structure setup.",
    automator: "Monthly CRO audits, A/B testing, and GEO strategy.",
    mvpEngine: "Funnel infrastructure setup and targeted traffic strategy.",
    aiCommunity: "Short-form video pipelines and creator monetization systems.",
    fullStack: "Full Paid Ads Management, ROAS tracking, aggressive GEO.",
  },
  {
    deliverable: "Revisions",
    blueprint: "2 full rounds of design tweaks.",
    automator: "Continuous adjustment within monthly scope.",
    mvpEngine: "Sprint-based continuous iteration.",
    aiCommunity: "Agile adjustments based on community/AI feedback.",
    fullStack: "Priority execution, zero-bottleneck revisions.",
  },
  {
    deliverable: "Timeline",
    blueprint: "1–2 weeks (Fixed delivery).",
    automator: "Ongoing monthly retainer (Cancel anytime).",
    mvpEngine: "Ongoing monthly retainer (Cancel anytime).",
    aiCommunity: "Ongoing monthly retainer (Cancel anytime).",
    fullStack: "Ongoing monthly retainer (Dedicated squad).",
  },
  {
    deliverable: "Handoff",
    blueprint: "SVG/PNG + deployment access + basic guidelines.",
    automator: "Clean repository updates, automation flow maps, live dashboards.",
    mvpEngine: "Source code access, feature deployment logs, asset library.",
    aiCommunity: "AI model deployment keys, bot hosting setups, server ownership.",
    fullStack: "Complete architecture blueprints, full IP transfer, live reporting.",
  },
  {
    deliverable: "Support",
    blueprint: "7 days for post-launch export fixes.",
    automator: "Included continuously while retainer is active.",
    mvpEngine: "Included continuously while retainer is active.",
    aiCommunity: "Included continuously while retainer is active.",
    fullStack: "24/7 priority developer Slack channel access.",
  },
] as const;

export const ICP_CARDS = [
  {
    title: "Founders launching",
    body: "You need a credible brand and site before you pitch, launch, or run ads — without hiring three freelancers who don't coordinate.",
  },
  {
    title: "Operators scaling",
    body: "SaaS, Web3, communities, and online businesses that want design + dev + growth under one roof with clear USD pricing and escrow.",
  },
  {
    title: "Teams who DM first",
    body: "You prefer Discord or Telegram, crypto or escrow, and a fixed quote in 24 hours — not a sales call funnel or vague pricing.",
  },
] as const;

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Pick or scope",
    body: "Choose a tier or describe custom needs. Fixed quote in 24 hours.",
  },
  {
    step: "02",
    title: "Confirm & pay",
    body: "Escrow available on all orders. Payment agreed on Discord or Telegram before work starts.",
  },
  {
    step: "03",
    title: "Kickoff in 5 days",
    body: "Work begins within 5 working days of payment confirmation.",
  },
  {
    step: "04",
    title: "Weekly updates",
    body: "Progress shared without you chasing. Direct comms the whole way through.",
  },
  {
    step: "05",
    title: "Handoff + support",
    body: "Full file handoff with docs. Post-delivery support per tier terms.",
  },
] as const;

export const INTAKE_CHECKLIST = [
  "Which tier — or custom if unsure",
  "What you're building (product, community, store, app)",
  "Target launch date or deadline",
  "Reference links or competitors you like",
  "Whether you need escrow or crypto payment",
  "Any must-have features (payments, auth, bots, etc.)",
] as const;

export const SUPPORT_CARDS = [
  {
    title: "The Blueprint",
    body: "7 days of support for export issues, file formats, and minor asset tweaks. Major scope changes are quoted separately.",
  },
  {
    title: "The Automator",
    body: "Ongoing support while retainer is active — automation maps, CRM integrations, and flow adjustments within monthly capacity.",
  },
  {
    title: "The MVP Engine",
    body: "Sprint support includes deployment help and bug fixes within scope. New features beyond capacity are quoted for the next sprint.",
  },
  {
    title: "The AI & Community",
    body: "Bot hosting handoff, AI knowledge updates, and community asset tweaks while retainer is active.",
  },
  {
    title: "Full-Stack Powerhouse",
    body: "Priority Slack channel access with dedicated squad coverage across design, dev, and growth streams.",
  },
] as const;

export const GUARANTEE_ITEMS = [
  "Escrow & middleman accepted",
  "Crypto (BTC · LTC · USDC)",
  "Money-back guarantee · Terms apply",
  "Revisions defined per tier",
  "Reply within 24h on weekdays",
] as const;

export const HOME_FAQ: readonly FaqItem[] = [
  {
    question: "Do you work with escrow or middleman?",
    answer:
      "Yes, on all orders. We regularly work with trusted escrow middlemen. Mention it when you DM us and we will arrange it.",
  },
  {
    question: "What happens after I DM you?",
    answer:
      "We reply within 24 hours with a fixed quote, timeline, and payment options. After payment, kickoff within 5 working days with weekly progress updates until handoff.",
  },
  {
    question: "How many revisions are included?",
    answer:
      "The Blueprint: 2 full design rounds. Retainers (Tiers 2–5): continuous iteration within monthly capacity limits — see the delivery matrix on this page.",
  },
  {
    question: "What post-delivery support do I get?",
    answer:
      "The Blueprint includes 7 days for export fixes. Tiers 2–5 include ongoing support while your retainer is active. Tier 5 adds priority Slack access.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Crypto including USDC, BTC, and LTC. Payment details confirmed over Discord or Telegram before work begins.",
  },
  {
    question: "Can I customise a tier?",
    answer:
      "Absolutely. Tiers are starting points with capacity limits. DM us with extra workflows, features, or streams — fixed quote in 24 hours.",
  },
  {
    question: "What if I need an MVP or full app?",
    answer:
      "Tier 3 (MVP Engine) or Tier 5 (Full-Stack Powerhouse) cover product shipping. DM us if unsure which tier fits.",
  },
  {
    question: "How long does delivery actually take?",
    answer:
      "The Blueprint: 1–2 weeks. Retainers start ongoing after kickoff. Rush timelines quoted separately on Discord.",
  },
  {
    question: "Is there a bigger option for serious projects?",
    answer:
      "Yes. Tier 5 is the enterprise retainer, or mxstermind.com for fully bespoke engagements above package capacity.",
  },
  {
    question: "What data do you collect?",
    answer:
      "Messages you send on Discord or Telegram and anonymous site analytics when enabled. See our Privacy Policy — we do not sell data.",
  },
];
