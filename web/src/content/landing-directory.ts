/** Public contact — all hires & packages route through mxstermind. */
export const CONTACT = {
  telegram: "https://t.me/Notmxstermind",
  telegramHandle: "@Notmxstermind",
  discord: "https://discord.gg/a8Nz2R6M55",
  guarantor: "mxstermind",
  guarantorNote:
    "Every hire and package is managed by mxstermind — your guarantor for scope, delivery, and payment.",
} as const;

export const CATEGORIES = [
  "All",
  "AI & Automation",
  "Content & Social",
  "Web & Apps",
  "Growth & Ads",
  "Branding",
  "Video Editing",
] as const;

export type TalentCategory = (typeof CATEGORIES)[number];

export type TalentProfile = {
  id: string;
  name: string;
  role: string;
  category: Exclude<TalentCategory, "All">;
  yearsExp: number;
  tools: string[];
  preferences: string[];
  rateLabel: string;
  availability: "available" | "limited" | "waitlist";
  highlight?: string;
  initials: string;
  accent: string;
};

export const TALENT: TalentProfile[] = [
  {
    id: "1",
    name: "Alex V.",
    role: "AI Automation Engineer",
    category: "AI & Automation",
    yearsExp: 5,
    tools: ["n8n", "Make", "OpenAI", "Zapier", "Supabase"],
    preferences: ["Remote", "Async", "Startup-friendly"],
    rateLabel: "€80–120/hr",
    availability: "available",
    highlight: "Built 40+ AI agent workflows for SaaS",
    initials: "AV",
    accent: "from-cyan-500/20 to-blue-600/10",
  },
  {
    id: "2",
    name: "Mira K.",
    role: "Short-Form Content Editor",
    category: "Content & Social",
    yearsExp: 4,
    tools: ["CapCut", "Premiere", "After Effects", "Descript"],
    preferences: ["Remote", "Retainer OK", "Fast turnaround"],
    rateLabel: "€1.2k–3k/mo",
    availability: "available",
    highlight: "30+ viral clips / month for creator brands",
    initials: "MK",
    accent: "from-fuchsia-500/20 to-purple-600/10",
  },
  {
    id: "3",
    name: "Jordan T.",
    role: "Next.js / AI SaaS Developer",
    category: "Web & Apps",
    yearsExp: 6,
    tools: ["Next.js", "Supabase", "Stripe", "Vercel", "TypeScript"],
    preferences: ["Remote", "Equity OK", "MVP sprints"],
    rateLabel: "€3k–12k/project",
    availability: "limited",
    highlight: "Shipped 12 MVPs in 90 days",
    initials: "JT",
    accent: "from-indigo-500/20 to-violet-600/10",
  },
  {
    id: "4",
    name: "Sofia R.",
    role: "Paid Ads Specialist",
    category: "Growth & Ads",
    yearsExp: 5,
    tools: ["Meta Ads", "TikTok Ads", "Triple Whale", "GA4"],
    preferences: ["Performance", "E-com", "Creator brands"],
    rateLabel: "€2k–8k/mo retainer",
    availability: "available",
    highlight: "3.2x ROAS avg on TikTok Shop campaigns",
    initials: "SR",
    accent: "from-amber-500/20 to-orange-600/10",
  },
  {
    id: "5",
    name: "Leo M.",
    role: "Funnel Builder",
    category: "Growth & Ads",
    yearsExp: 4,
    tools: ["Framer", "Webflow", "ConvertKit", "Stripe"],
    preferences: ["Remote", "CRO focus", "72h delivery"],
    rateLabel: "€800–4k/project",
    availability: "available",
    highlight: "Landing pages that convert at 8%+",
    initials: "LM",
    accent: "from-emerald-500/20 to-teal-600/10",
  },
  {
    id: "6",
    name: "Nina P.",
    role: "UGC Creator & Strategist",
    category: "Content & Social",
    yearsExp: 3,
    tools: ["TikTok", "Instagram", "CapCut", "Notion"],
    preferences: ["UGC bundles", "Product brands", "Remote"],
    rateLabel: "€500–2k/package",
    availability: "available",
    highlight: "Beauty & SaaS UGC — 2M+ views/mo",
    initials: "NP",
    accent: "from-rose-500/20 to-pink-600/10",
  },
  {
    id: "7",
    name: "Chris D.",
    role: "Brand Strategist",
    category: "Branding",
    yearsExp: 7,
    tools: ["Figma", "Notion", "Miro", "AI research"],
    preferences: ["Creators", "Startups", "Positioning"],
    rateLabel: "€1.5k–6k/project",
    availability: "limited",
    highlight: "Repositioned 8 creator brands in 2025",
    initials: "CD",
    accent: "from-sky-500/20 to-blue-600/10",
  },
  {
    id: "8",
    name: "Elena W.",
    role: "Email Marketing Specialist",
    category: "Growth & Ads",
    yearsExp: 5,
    tools: ["Klaviyo", "Mailchimp", "Instantly", "HubSpot"],
    preferences: ["E-com", "Cold email", "Flows"],
    rateLabel: "€1k–5k setup",
    availability: "available",
    highlight: "Cold email — 12% reply rate avg",
    initials: "EW",
    accent: "from-lime-500/20 to-green-600/10",
  },
  {
    id: "9",
    name: "Marcus H.",
    role: "AI Content Operator",
    category: "AI & Automation",
    yearsExp: 3,
    tools: ["Claude", "GPT-4", "Make", "Airtable"],
    preferences: ["Scale content", "Async", "Systems"],
    rateLabel: "€600–2.5k/mo",
    availability: "available",
    highlight: "10x content output with AI pipelines",
    initials: "MH",
    accent: "from-violet-500/20 to-purple-600/10",
  },
  {
    id: "10",
    name: "Yuki A.",
    role: "Video Editor",
    category: "Video Editing",
    yearsExp: 4,
    tools: ["Premiere", "DaVinci", "After Effects"],
    preferences: ["YouTube", "Podcasts", "Remote"],
    rateLabel: "€40–90/hr",
    availability: "waitlist",
    highlight: "Long-form + shorts for 50k+ channels",
    initials: "YA",
    accent: "from-red-500/20 to-orange-600/10",
  },
  {
    id: "11",
    name: "David F.",
    role: "Shopify Developer",
    category: "Web & Apps",
    yearsExp: 5,
    tools: ["Shopify", "Liquid", "Klaviyo", "Recharge"],
    preferences: ["CRO", "Speed", "Subscriptions"],
    rateLabel: "€2k–8k/project",
    availability: "available",
    highlight: "Shopify stores — +34% CVR after rebuild",
    initials: "DF",
    accent: "from-yellow-500/20 to-amber-600/10",
  },
  {
    id: "12",
    name: "Aria L.",
    role: "TikTok Growth Specialist",
    category: "Content & Social",
    yearsExp: 3,
    tools: ["TikTok", "CapCut", "Analytics", "UGC"],
    preferences: ["Creators", "Brands", "Growth sprints"],
    rateLabel: "€1.5k–5k/mo",
    availability: "available",
    highlight: "0 → 100k followers in 60 days (3 brands)",
    initials: "AL",
    accent: "from-pink-500/20 to-fuchsia-600/10",
  },
];

export type OfficialPackage = {
  id: string;
  name: string;
  price: string;
  tagline: string;
  includes: string[];
  target: string;
  popular?: boolean;
  urgent?: boolean;
};

export const PACKAGES: OfficialPackage[] = [
  {
    id: "creator-launch",
    name: "Creator Launch",
    price: "€499 – €1,500",
    tagline: "Brand + landing + TikTok + AI workflow",
    includes: ["Branding kit", "Landing page", "TikTok setup", "Content templates", "Bio optimization", "AI workflow"],
    target: "Creators, coaches, influencers",
    popular: true,
  },
  {
    id: "mvp-sprint",
    name: "Startup MVP Sprint",
    price: "€2,000 – €10,000",
    tagline: "Ship your product in weeks, not months",
    includes: ["UI + landing", "Auth", "Supabase", "Dashboard", "Stripe", "Deployment"],
    target: "Founders, startups",
    urgent: true,
  },
  {
    id: "ai-automation",
    name: "AI Automation Setup",
    price: "€500 – €5,000",
    tagline: "Chatbots, CRM, lead automation — live in 72h",
    includes: ["AI chatbot", "Lead automation", "CRM hooks", "Email flows", "Support assistant"],
    target: "SaaS, agencies, e-com",
    popular: true,
    urgent: true,
  },
  {
    id: "viral-content",
    name: "Viral Content Machine",
    price: "€800 – €3,000/mo",
    tagline: "30 clips, hooks, captions, thumbnails monthly",
    includes: ["30 short clips", "Hook library", "Captions", "Thumbnails", "AI scripting"],
    target: "Brands, creators",
  },
  {
    id: "growth-engine",
    name: "BrandForge Growth Engine",
    price: "€2,000 – €10,000/mo",
    tagline: "We become your growth team",
    includes: ["Paid ads", "Content", "Funnels", "Automation", "Strategy", "Analytics"],
    target: "Startups, online brands",
    urgent: true,
  },
  {
    id: "ai-support",
    name: "AI Customer Support Agent",
    price: "€500 – €2,500",
    tagline: "Reduce support costs by up to 70%",
    includes: ["Trained on your docs", "CRM integration", "Handoff rules", "Analytics"],
    target: "SaaS, e-com, agencies",
  },
  {
    id: "tiktok-shop",
    name: "TikTok Shop Launch",
    price: "€1,500 – €6,000",
    tagline: "Store + creators + content + ads",
    includes: ["Shop setup", "Creator sourcing", "Content plan", "Ad launch", "Optimization"],
    target: "E-com brands",
    popular: true,
  },
  {
    id: "booking-system",
    name: "Appointment Booking System",
    price: "€800 – €3,000",
    tagline: "Automated booking + reminders + CRM",
    includes: ["Booking flow", "Calendar sync", "SMS/email reminders", "CRM integration"],
    target: "Gyms, clinics, agencies, real estate",
  },
];

export function contactMessage(subject: string): string {
  const text = encodeURIComponent(`Hi mxstermind — I'm interested in: ${subject}\n\nFrom brandforge.gg`);
  return `${CONTACT.telegram}?text=${text}`;
}
