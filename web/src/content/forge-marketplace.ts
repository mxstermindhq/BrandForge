/** Marketplace-facing copy & listings for the cinematic forge landing. */

export const FORGE_ORBIT_CARDS = [
  { icon: "🔥", title: "AI Automation", price: "From $99" },
  { icon: "🎮", title: "Discord Systems", price: "From $149" },
  { icon: "🚀", title: "Landing Pages", price: "From $299" },
  { icon: "🎨", title: "Brand Kits", price: "From $79" },
  { icon: "🤖", title: "AI Agents", price: "From $249" },
  { icon: "📈", title: "Growth Systems", price: "From $199" },
] as const;

export const FORGE_CATEGORIES = [
  { id: "ai", name: "AI Systems", count: 132 },
  { id: "discord", name: "Discord Growth", count: 89 },
  { id: "brand", name: "Brand Identity", count: 214 },
  { id: "landing", name: "Landing Pages", count: 76 },
  { id: "content", name: "Content Systems", count: 118 },
  { id: "bots", name: "Bots", count: 54 },
  { id: "dev", name: "Developers", count: 167 },
  { id: "video", name: "Video Editing", count: 93 },
  { id: "community", name: "Community Management", count: 41 },
  { id: "products", name: "Digital Products", count: 320 },
  { id: "templates", name: "Templates", count: 188 },
  { id: "automation", name: "Automation", count: 97 },
] as const;

export const FORGE_TRENDING = [
  {
    id: "ai-discord-bot",
    title: "AI Discord Bot",
    price: "$149",
    delivery: "24–48h",
    rating: 4.9,
    reviews: 128,
    thumb: "linear-gradient(135deg, #1a0a00 0%, #ff4d00 50%, #ff8c00 100%)",
  },
  {
    id: "creator-growth",
    title: "Creator Growth Pack",
    price: "$99",
    delivery: "12–24h",
    rating: 5.0,
    reviews: 256,
    thumb: "linear-gradient(135deg, #0a0505 0%, #ff2a00 40%, #ffc14d 100%)",
  },
  {
    id: "landing-build",
    title: "Landing Page Build",
    price: "$399",
    delivery: "3–5 days",
    rating: 4.8,
    reviews: 89,
    thumb: "linear-gradient(135deg, #050508 0%, #ff6b00 55%, #ff2200 100%)",
  },
  {
    id: "nitro-branding",
    title: "Discord Nitro Branding Pack",
    price: "$49",
    delivery: "6–12h",
    rating: 4.9,
    reviews: 412,
    thumb: "linear-gradient(135deg, #120800 0%, #ff8c00 45%, #ff4d00 100%)",
  },
] as const;

export const FORGE_STATS = [
  { value: "24H", label: "average delivery" },
  { value: "500+", label: "services" },
  { value: "10k+", label: "community members" },
  { value: "99%", label: "response rate" },
] as const;

export const FORGE_TRUST = ["Fast delivery", "Direct communication", "Built for online communities"] as const;
