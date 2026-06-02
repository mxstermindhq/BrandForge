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
    body: "Choose a package or describe custom needs. Fixed quote in 24 hours.",
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
    body: "Full file handoff with docs. Post-delivery support per package terms.",
  },
] as const;

export const INTAKE_CHECKLIST = [
  "Which package — or custom if unsure",
  "What you're building (product, community, store, app)",
  "Target launch date or deadline",
  "Reference links or competitors you like",
  "Whether you need escrow or crypto payment",
  "Any must-have features (payments, auth, bots, etc.)",
] as const;

export const DELIVERY_ROWS = [
  {
    deliverable: "Brand assets",
    sprint: "Logo, colours, type, guidelines, templates",
    launch: "Full brand system",
    growth: "Ongoing brand updates",
  },
  {
    deliverable: "Website / product",
    sprint: "—",
    launch: "5–10 page site, mobile-first, SEO base",
    growth: "New pages, features, CRO tests",
  },
  {
    deliverable: "Revisions",
    sprint: "2 full rounds",
    launch: "2 design + 1 site round",
    growth: "Within monthly scope",
  },
  {
    deliverable: "Timeline",
    sprint: "1–2 weeks",
    launch: "3–4 weeks",
    growth: "Ongoing from month 2",
  },
  {
    deliverable: "Handoff",
    sprint: "SVG/PNG + PDF + templates",
    launch: "Source files + deploy access + checklist",
    growth: "Reports + asset library",
  },
  {
    deliverable: "Post-delivery support",
    sprint: "7 days for export fixes",
    launch: "30 days post-launch",
    growth: "Included while active",
  },
] as const;

export const SUPPORT_CARDS = [
  {
    title: "Brand Sprint",
    body: "7 days of support for export issues, file formats, and minor asset tweaks. Major scope changes are quoted separately.",
  },
  {
    title: "Launch Stack",
    body: "30 days post-launch for bug fixes, deploy help, and small content swaps. New pages or features scoped as add-ons.",
  },
  {
    title: "Growth Engine",
    body: "Active retainer includes ongoing support, iteration, and monthly performance reviews. Pause or cancel with 14 days notice.",
  },
] as const;

export const GUARANTEE_ITEMS = [
  "Escrow & middleman accepted",
  "Crypto (BTC · LTC · USDC)",
  "Money-back guarantee · Terms apply",
  "Revisions defined per package",
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
      "Brand Sprint: 2 full revision rounds. Launch Stack: 2 design rounds plus 1 website revision round. Growth Engine: ongoing iteration within agreed monthly scope.",
  },
  {
    question: "What post-delivery support do I get?",
    answer:
      "Brand Sprint includes 7 days for export fixes. Launch Stack includes 30 days post-launch. Growth Engine includes ongoing support while your retainer is active.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Crypto including USDC, BTC, and LTC. Payment details confirmed over Discord or Telegram before work begins.",
  },
  {
    question: "Can I customise a package?",
    answer:
      "Absolutely. Packages are starting points. DM us with extra pages, bots, or integrations — fixed quote in 24 hours.",
  },
  {
    question: "What if I need an MVP or full app?",
    answer:
      "We build those too — iOS and Android apps, web apps, Discord bots, and full-stack platforms. DM us for custom scope.",
  },
  {
    question: "How long does delivery actually take?",
    answer:
      "Brand Sprint: 1–2 weeks. Launch Stack: 3–4 weeks. Full apps and MVPs: typically 2–4 weeks depending on scope.",
  },
  {
    question: "Is there a bigger option for serious projects?",
    answer:
      "Yes. For larger bespoke engagements, visit mxstermind.com — premium studio for established businesses and complex builds.",
  },
  {
    question: "What data do you collect?",
    answer:
      "Messages you send on Discord or Telegram and anonymous site analytics when enabled. See our Privacy Policy — we do not sell data.",
  },
];
