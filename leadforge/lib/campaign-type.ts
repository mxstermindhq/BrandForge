import { PLATFORMS } from "@/lib/constants";
import type { CampaignType } from "@/types";

/** Channels allowed for each audience mode (from platform metadata). */
export function channelsForCampaignType(type: CampaignType): string[] {
  return PLATFORMS.filter((p) => (type === "b2b" ? p.b2b : p.b2c)).map((p) => p.id);
}

export function defaultChannelsForType(type: CampaignType): string[] {
  return type === "b2b"
    ? ["linkedin", "google", "web", "reddit"]
    : ["instagram", "reddit", "youtube", "twitter"];
}

export function sanitizeChannelsForType(channels: string[], type: CampaignType): string[] {
  const allowed = new Set(channelsForCampaignType(type));
  const cleaned = channels.filter((c) => allowed.has(c));
  return cleaned.length > 0 ? cleaned : defaultChannelsForType(type);
}

export function parseCampaignType(value: unknown): CampaignType {
  return value === "b2c" ? "b2c" : "b2b";
}

/** Instructions injected into website-analysis prompts. */
export function campaignTypePromptBlock(type: CampaignType): string {
  if (type === "b2b") {
    return `
AUDIENCE MODE: B2B (business buyers)
- Profile people who buy ON BEHALF OF A COMPANY — founders, executives, department heads, operators, procurement.
- Job titles must be professional roles (Founder, VP Marketing, Head of Ops, IT Director, Agency Owner).
- Intent signals: vendor search, tool evaluation, "recommend a agency", "need a solution for our team", budget/ROI language.
- where_buyers_congregate: LinkedIn, industry subreddits (r/SaaS, r/marketing), Twitter #buildinpublic, business directories.
- Email patterns: company domains, firstname@company.com, role-based inboxes.
- Do NOT profile individual consumers shopping for personal use unless the product is clearly prosumer/SMB.`;
  }

  return `
AUDIENCE MODE: B2C (individual / consumer buyers)
- Profile INDIVIDUAL PEOPLE who buy for themselves — consumers, creators, hobbyists, solopreneurs buying personal tools.
- Titles: content creator, Shopify store owner, fitness enthusiast, parent, gamer, indie maker — NOT corporate VPs unless side-project context.
- Intent signals: personal recommendation requests ("best app for...", "anyone tried...", "help me choose"), lifestyle/hobby language.
- where_buyers_congregate: Instagram, TikTok, YouTube, Reddit advice threads, Twitter/X communities — consumer/creator spaces.
- Email patterns: gmail.com, personal domains, creator business emails.
- Do NOT default to enterprise LinkedIn executives unless the site clearly sells to consumers via business accounts.`;
}

/** Scoring hints for lead enrichment. */
export function enrichmentModeBlock(type: CampaignType): string {
  if (type === "b2b") {
    return `Scoring mode B2B: boost leads with clear job titles, company names, LinkedIn/web business pages, work emails (@company.com). Penalize anonymous social-only profiles without business context.`;
  }
  return `Scoring mode B2C: boost creators, consumers, and individuals showing personal buying intent. Instagram/TikTok/YouTube/Reddit profiles score well. Personal emails (gmail, etc.) are valuable. Corporate-only signals are less relevant.`;
}

export function campaignTypeLabel(type: CampaignType): string {
  return type === "b2b" ? "B2B" : "B2C";
}

export function campaignTypeDescription(type: CampaignType): string {
  return type === "b2b"
    ? "Business decision-makers · LinkedIn, company sites, B2B forums"
    : "Consumers & creators · Instagram, TikTok, YouTube, Reddit";
}
