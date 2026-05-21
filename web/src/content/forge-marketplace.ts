/** Marketplace-facing copy & listings for the cinematic forge landing. */

export const FORGE_ORBIT_CARDS = [
  { icon: "🔥", title: "AI Short-Form Machine", price: "From $249" },
  { icon: "🎮", title: "Discord Monetization", price: "From $399" },
  { icon: "🚀", title: "Landing + Funnels", price: "From $699" },
  { icon: "🎨", title: "Personal Brand Kit", price: "From $299" },
  { icon: "🤖", title: "AI Business Automation", price: "From $499" },
  { icon: "📈", title: "Lead Gen Systems", price: "From $599" },
] as const;

export const FORGE_CATEGORIES = [
  { id: "ai", name: "AI & Automation", count: 412 },
  { id: "discord", name: "Discord Growth Systems", count: 287 },
  { id: "content", name: "Content Creation Systems", count: 356 },
  { id: "video", name: "Short-form Video Systems", count: 298 },
  { id: "branding", name: "Brand Identity", count: 241 },
  { id: "landing", name: "Landing Pages & Funnels", count: 189 },
  { id: "leads", name: "Lead Generation Systems", count: 224 },
  { id: "business", name: "Digital Business Setup", count: 167 },
  { id: "monetization", name: "Creator Monetization", count: 203 },
  { id: "marketing", name: "Marketing Systems", count: 276 },
] as const;

export const FORGE_TRENDING = [
  {
    id: "ai-short-form-content-machine",
    title: "AI Short-Form Content Machine",
    price: "$249",
    delivery: "24–48h",
    rating: 4.96,
    reviews: 842,
    thumb: "linear-gradient(135deg, #0a0505 0%, #ff4d00 50%, #ffb800 100%)",
  },
  {
    id: "viral-content-strategy-pack",
    title: "Viral Content Strategy Pack",
    price: "$129",
    delivery: "12–24h",
    rating: 4.97,
    reviews: 1104,
    thumb: "linear-gradient(135deg, #0a0505 0%, #ff2a00 40%, #ffc14d 100%)",
  },
  {
    id: "discord-growth-monetization",
    title: "Discord Growth + Monetization",
    price: "$399",
    delivery: "2–3 days",
    rating: 4.95,
    reviews: 623,
    thumb: "linear-gradient(135deg, #120818 0%, #5865f2 30%, #ff4d00 100%)",
  },
  {
    id: "high-converting-landing-page",
    title: "High-Converting Landing Page",
    price: "$699",
    delivery: "3–5 days",
    rating: 4.92,
    reviews: 289,
    thumb: "linear-gradient(135deg, #050508 0%, #ff6b00 55%, #ff2200 100%)",
  },
] as const;

export const FORGE_STATS = [
  { value: "24H", label: "average delivery" },
  { value: "500+", label: "services" },
  { value: "10k+", label: "community members" },
  { value: "99%", label: "response rate" },
] as const;

export const FORGE_TRUST = ["Fast delivery", "Direct communication", "Built for online communities"] as const;
