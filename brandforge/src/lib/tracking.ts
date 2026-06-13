import { SITE } from "@/config/site";

/** UTM + data-attribute campaign id for outbound CTAs (Discord analytics + GA events). */
export function discordHref(campaign: string): string {
  const url = new URL(SITE.discord);
  url.searchParams.set("utm_source", "brandforge");
  url.searchParams.set("utm_medium", "cta");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

export function telegramHref(message: string, campaign: string): string {
  const base = SITE.telegram;
  const sep = base.includes("?") ? "&" : "?";
  const text = encodeURIComponent(message);
  return `${base}${sep}text=${text}&utm_source=brandforge&utm_medium=cta&utm_campaign=${encodeURIComponent(campaign)}`;
}

export type CtaTrackAttrs = {
  "data-bf-cta": "discord" | "telegram";
  "data-bf-campaign": string;
};

export function ctaTrackAttrs(
  platform: "discord" | "telegram",
  campaign: string,
): CtaTrackAttrs {
  return {
    "data-bf-cta": platform,
    "data-bf-campaign": campaign,
  };
}
