/** Marketplace-facing copy & listings for the cinematic forge landing. */

export const FORGE_ORBIT_CARDS = [
  { icon: "💻", title: "Developer Starter", price: "$799" },
  { icon: "🎨", title: "Designer Starter", price: "$597" },
  { icon: "🎬", title: "Video Editor Starter", price: "$697" },
  { icon: "🤝", title: "Developer Partner", price: "$1,299/mo" },
  { icon: "🤝", title: "Designer Partner", price: "$999/mo" },
  { icon: "🤝", title: "Video Partner", price: "$1,199/mo" },
] as const;

export const FORGE_CATEGORIES = [
  { id: "developer", name: "Developer", count: 2 },
  { id: "designer", name: "Designer", count: 2 },
  { id: "video-editor", name: "Video Editor", count: 2 },
] as const;

export const FORGE_TRUST = [
  "Starter = fixed price, one deliverable",
  "Partner = monthly subscription",
  "Crypto checkout · mxstermind guarantor",
] as const;
