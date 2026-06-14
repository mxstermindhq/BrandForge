/** mxstermind.com site configuration */
import { MXM_POSITIONING } from "@/config/positioning";

export const SITE = {
  url: "https://mxstermind.com",
  name: "mxstermind",
  title: MXM_POSITIONING.title,
  tagline: MXM_POSITIONING.tagline,
  discord: "https://discord.gg/a8Nz2R6M55",
  telegram: "https://t.me/Notmxstermind",
  brandforge: "https://brandforge.gg/",
  packages: "https://brandforge.gg/packages/",
  mxstermindBridge: "https://brandforge.gg/mxstermind/",
} as const;

export function telegramUrl(message: string): string {
  const base = SITE.telegram;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(message)}`;
}

export { MXM_POSITIONING };
