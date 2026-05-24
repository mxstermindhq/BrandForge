/** BrandForge marketplace — 3 roles, 2 tiers each (Starter fixed / Partner sub). */

export const MARKETPLACE_ROLES = [
  {
    id: "developer",
    slug: "developer",
    name: "Developer",
    starterPrice: 799,
    partnerPrice: 1299,
    starterTagline: "Ship a scoped build — landing, app slice, or integration.",
    partnerTagline: "Embedded dev partner — monthly shipping & maintenance.",
    starterOutcome: "Production-ready code delivered on a fixed timeline.",
    partnerOutcome: "Ongoing feature work, fixes, and deploy support.",
  },
  {
    id: "designer",
    slug: "designer",
    name: "Designer",
    starterPrice: 597,
    partnerPrice: 999,
    starterTagline: "Brand, UI, or funnel design — one clear deliverable.",
    partnerTagline: "Design partner — monthly assets, iterations, and systems.",
    starterOutcome: "Polished visual system or page ready to ship.",
    partnerOutcome: "Consistent creative output every month.",
  },
  {
    id: "video-editor",
    slug: "video-editor",
    name: "Video Editor",
    starterPrice: 697,
    partnerPrice: 1199,
    starterTagline: "Short-form pack or edit sprint — hooks, cuts, captions.",
    partnerTagline: "Monthly clip pipeline — scripts, edits, and thumbnails.",
    starterOutcome: "Batch of edits or a launch-ready video package.",
    partnerOutcome: "Steady content output without hiring in-house.",
  },
] as const;

export type MarketplaceRoleId = (typeof MARKETPLACE_ROLES)[number]["id"];

export const MARKETPLACE_ROLE_NAMES = MARKETPLACE_ROLES.map((r) => r.name);

export const MARKETPLACE_CATEGORY_CHIPS = ["All", ...MARKETPLACE_ROLE_NAMES] as const;

export function normalizeMarketplaceCategory(raw: string | null | undefined): string {
  const v = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (!v || v === "all") return "All";
  if (v.includes("develop") || v === "dev") return "Developer";
  if (v.includes("design") || v.includes("brand")) return "Designer";
  if (v.includes("video") || v.includes("edit")) return "Video Editor";
  return raw?.trim() || "All";
}

export function roleByName(name: string) {
  return MARKETPLACE_ROLES.find((r) => r.name.toLowerCase() === name.toLowerCase());
}
