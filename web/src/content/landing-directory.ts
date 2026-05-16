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

export function contactMessage(subject: string): string {
  const text = encodeURIComponent(`Hi mxstermind — I'm interested in: ${subject}\n\nFrom brandforge.gg`);
  return `${CONTACT.telegram}?text=${text}`;
}
