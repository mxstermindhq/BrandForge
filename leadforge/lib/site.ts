/** Shared contact + brand links — mxstermind Studio Tools. */
export const SITE = {
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://tools.mxstermind.com",
  mxstermind: "https://mxstermind.com",
  mxstermindTools: "https://mxstermind.com/tools",
  discord: "https://discord.gg/a8Nz2R6M55",
  telegram: "https://t.me/Notmxstermind",
} as const;

export function telegramUrl(message: string): string {
  const base = SITE.telegram;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(message)}`;
}

export const LEADFORGE_DISCORD_MSG =
  "Hi — I'm interested in LeadForge on mxstermind Studio Tools.\n\nMy website: \nTarget buyers: \nVolume needed: ";

export const LEADFORGE_TELEGRAM_MSG =
  "Hi — LeadForge via mxstermind Tools. My site: [url]. I need help finding ideal buyers.";
