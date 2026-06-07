/** Shared contact + brand links (aligned with BrandForge). */
export const SITE = {
  url: "https://leadforge-gilt.vercel.app",
  brandforge: "https://brandforge.gg",
  discord: "https://discord.gg/a8Nz2R6M55",
  telegram: "https://t.me/Notmxstermind",
} as const;

export function telegramUrl(message: string): string {
  const base = SITE.telegram;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(message)}`;
}

export const LEADFORGE_DISCORD_MSG =
  "Hi — I'm interested in LeadForge for lead generation.\n\nMy website: \nTarget buyers: \nVolume needed: ";

export const LEADFORGE_TELEGRAM_MSG =
  "Hi — I'm interested in LeadForge. My site: [url]. I need help finding ideal buyers.";
