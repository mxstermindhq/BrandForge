import { SITE } from "@/config/site";
import { UTM_SOURCE, type UtmMedium } from "@/config/tracking";

export function buildTrackedUrl(
  base: string,
  campaign: string,
  medium: UtmMedium | string = "cta",
  content?: string,
): string {
  const url = new URL(base);
  url.searchParams.set("utm_source", UTM_SOURCE);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

export function discordHref(campaign: string, content?: string): string {
  return buildTrackedUrl(SITE.discord, campaign, "cta", content);
}

/** Invite link for copy-to-clipboard — utm_medium=copy */
export function discordCopyUrl(campaign = "copy-invite"): string {
  return buildTrackedUrl(SITE.discord, campaign, "copy");
}

export function telegramHref(message: string, campaign: string): string {
  const base = SITE.telegram;
  const sep = base.includes("?") ? "&" : "?";
  const text = encodeURIComponent(message);
  return `${base}${sep}text=${text}&utm_source=${UTM_SOURCE}&utm_medium=cta&utm_campaign=${encodeURIComponent(campaign)}`;
}

export function portfolioExternalHref(url: string, slug: string): string {
  return buildTrackedUrl(url, slug, "portfolio");
}

export type CtaTrackAttrs = {
  "data-bf-cta": "discord" | "telegram" | "package" | "calendly" | "copy";
  "data-bf-campaign": string;
};

export function ctaTrackAttrs(
  platform: CtaTrackAttrs["data-bf-cta"],
  campaign: string,
): CtaTrackAttrs {
  return {
    "data-bf-cta": platform,
    "data-bf-campaign": campaign,
  };
}

/** Fire GA4 custom event when gtag is loaded. */
export function trackEvent(
  name: string,
  params?: Record<string, string | number>,
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}
