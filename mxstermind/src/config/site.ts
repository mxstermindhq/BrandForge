/** mxstermind.com site configuration */
export const SITE = {
  url: "https://mxstermind.com",
  name: "mxstermind",
  discord: "https://discord.gg/a8Nz2R6M55",
  telegram: "https://t.me/Notmxstermind",
  brandforge: "https://brandforge.gg/",
  packages: "https://brandforge.gg/packages/",
} as const;

export function telegramUrl(message: string): string {
  const base = SITE.telegram;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(message)}`;
}
