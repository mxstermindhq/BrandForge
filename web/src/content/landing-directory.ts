/** Public contact — all hires & packages route through mxstermind. */
export const CONTACT = {
  telegram: "https://t.me/Notmxstermind",
  telegramHandle: "@Notmxstermind",
  discord: "https://discord.gg/a8Nz2R6M55",
  guarantor: "mxstermind",
  guarantorNote:
    "Every hire and package is managed by mxstermind — your guarantor for scope, delivery, and payment.",
} as const;

export const CATEGORIES = ["All", "Developer", "Designer", "Video Editor"] as const;

export type TalentCategory = (typeof CATEGORIES)[number];

/* Talent directory members load from GET /api/talent (registered profiles). */

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

export type LiveActivityItem = {
  id: string;
  type: "service" | "request" | "match" | "deal";
  title: string;
  meta: string;
  status: string;
};

export const LIVE_ACTIVITY: LiveActivityItem[] = [
  {
    id: "act-1",
    type: "match",
    title: "B2B SaaS founder matched with lifecycle operator",
    meta: "2 min ago · Growth & Ads",
    status: "In conversation",
  },
  {
    id: "act-2",
    type: "request",
    title: "New request: Next.js product marketing site rebuild",
    meta: "7 min ago · Web & Apps",
    status: "Reviewing",
  },
  {
    id: "act-3",
    type: "service",
    title: "Published service: TikTok Shop launch sprint",
    meta: "13 min ago · Content & Social",
    status: "Open slots",
  },
  {
    id: "act-4",
    type: "deal",
    title: "Deal milestone approved: AI support agent rollout",
    meta: "21 min ago · AI & Automation",
    status: "Delivered",
  },
];

export type LandingRequestPreview = {
  id: string;
  title: string;
  category: Exclude<TalentCategory, "All">;
  budget: string;
  timeline: string;
};

export const REQUEST_PREVIEW: LandingRequestPreview[] = [
  {
    id: "rq-1",
    title: "Need a senior design partner for SaaS onboarding flow",
    category: "Designer",
    budget: "€2,000 - €5,000",
    timeline: "2-3 weeks",
  },
  {
    id: "rq-2",
    title: "Set up n8n + CRM lead routing + WhatsApp follow-up",
    category: "Developer",
    budget: "€800 - €2,500",
    timeline: "5-10 days",
  },
  {
    id: "rq-3",
    title: "Need a UGC editor for 20 short-form assets monthly",
    category: "Video Editor",
    budget: "€1,200 - €3,000",
    timeline: "Monthly retainer",
  },
];

export function contactMessage(subject: string): string {
  const text = encodeURIComponent(`Hi mxstermind — I'm interested in: ${subject}\n\nFrom brandforge.gg`);
  return `${CONTACT.telegram}?text=${text}`;
}
