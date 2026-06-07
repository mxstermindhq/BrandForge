import type { RawScrapedLead, ScraperBlueprint, ScraperEnvKeys } from "@/types";
import { searchApolloPeople } from "@/lib/apollo-client";
import { resolveApifyActor, runApifyActorSync } from "@/lib/apify-client";
import { extractFromURL } from "@/lib/scraper";
import { searchWeb, type SearchKeys } from "@/lib/search";

/** Stable dedup key: email > social URL > name+company. */
export function sourceIdentifierForLead(lead: RawScrapedLead): string {
  const email = lead.email?.trim().toLowerCase();
  if (email) return `email:${email}`;

  const social = Object.values(lead.social_links).find((v) => v?.trim());
  if (social) return `url:${social.trim().toLowerCase()}`;

  const slug = `${lead.name}-${lead.company}`.toLowerCase().replace(/\s+/g, "-").slice(0, 180);
  return `name:${slug || "unknown"}`;
}

function blueprintToSearchQuery(blueprint: ScraperBlueprint, platform: string): string {
  const title = blueprint.titles[0] ?? "";
  const industry = blueprint.industry ?? "";
  const loc = blueprint.location ?? "";
  const kw = blueprint.keywords.slice(0, 3).join(" ");

  switch (platform) {
    case "linkedin":
      return `site:linkedin.com/in "${title}" "${industry}" ${loc}`.trim();
    case "reddit":
      return `site:reddit.com ${blueprint.pain_points[0] ?? kw} ${industry}`.trim();
    case "google":
      return `"${title}" "${industry}" ${loc} contact email`.trim();
    case "web":
    default:
      return `${title} ${industry} ${loc} ${kw} contact`.trim();
  }
}

async function scrapeSerperPlatform(
  platform: string,
  blueprint: ScraperBlueprint,
  limit: number,
  keys: SearchKeys,
): Promise<RawScrapedLead[]> {
  const query = blueprintToSearchQuery(blueprint, platform);
  const hits = await searchWeb(query, Math.min(limit, 10), keys);
  const leads: RawScrapedLead[] = [];

  for (const hit of hits) {
    if (leads.length >= limit) break;
    const extracted = await extractFromURL(hit.url, platform);
    const email = extracted.emails[0] ?? "";
    const social_links: Record<string, string> = {};
    if (extracted.linkedin_url) social_links.linkedin = extracted.linkedin_url;
    if (extracted.instagram_url) social_links.instagram = extracted.instagram_url;
    if (extracted.twitter_handle) social_links.twitter = extracted.twitter_handle;
    if (extracted.youtube_channel) social_links.youtube = extracted.youtube_channel;
    if (extracted.tiktok_handle) social_links.tiktok = extracted.tiktok_handle;
    if (extracted.reddit_username) social_links.reddit = extracted.reddit_username;

    leads.push({
      name: extracted.contact_name ?? hit.title.split("|")[0].trim() ?? "Unknown",
      title: "",
      company: extracted.company_name ?? "",
      email,
      social_links,
      raw_bio_text: hit.snippet ?? extracted.snippet ?? "",
      platform,
    });
  }

  return leads;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function mapApifyItem(item: Record<string, unknown>, platform: string): RawScrapedLead {
  const social_links: Record<string, string> = {};
  const url = pickString(item, ["url", "link", "profileUrl", "profile_url", "website"]);
  if (url) social_links[platform] = url;

  const linkedin = pickString(item, ["linkedinUrl", "linkedin_url"]);
  if (linkedin) social_links.linkedin = linkedin;

  return {
    name:
      pickString(item, ["name", "fullName", "full_name", "username", "author"]) ||
      "Unknown",
    title: pickString(item, ["title", "jobTitle", "job_title", "headline"]) || "",
    company: pickString(item, ["company", "companyName", "organization"]) || "",
    email: pickString(item, ["email", "emailAddress"]) || "",
    social_links,
    raw_bio_text:
      pickString(item, ["bio", "description", "snippet", "text", "about"]) || "",
    platform,
  };
}

async function scrapeApifySocial(
  platform: string,
  blueprint: ScraperBlueprint,
  limit: number,
  env: ScraperEnvKeys,
): Promise<RawScrapedLead[]> {
  const actorId = resolveApifyActor(platform);
  const apiKey = env.apifyApiKey ?? "";

  if (!actorId || !apiKey.trim()) {
    return scrapeSerperPlatform(platform, blueprint, limit, {
      serperApiKey: env.serperApiKey,
      provider: env.searchProvider,
      googleCseKey: env.googleCseKey,
      googleCseCx: env.googleCseCx,
    });
  }

  const searchTerms = [
    ...blueprint.keywords,
    blueprint.industry,
    ...blueprint.titles,
  ]
    .filter(Boolean)
    .join(" ");

  const items = await runApifyActorSync<Record<string, unknown>>({
    apiKey,
    actorId,
    input: {
      searches: [{ query: searchTerms, location: blueprint.location || undefined }],
      searchTerms: [searchTerms],
      keywords: blueprint.keywords,
      maxItems: limit,
    },
    limit,
  });

  return items
    .map((item) => mapApifyItem(item, platform))
    .filter((l) => l.name !== "Unknown" || l.email || Object.keys(l.social_links).length > 0);
}

/** Build ScraperBlueprint from campaign persona or target fields. */
export function buildScraperBlueprint(input: {
  industry?: string;
  location?: string;
  keywords?: string[];
  titles?: string[];
  pain_points?: string[];
  target_description?: string;
  product_name?: string;
}): ScraperBlueprint {
  return {
    industry: input.industry ?? input.product_name ?? "",
    location: input.location ?? "",
    keywords: input.keywords?.length
      ? input.keywords
      : (input.target_description ?? "").split(/\s+/).slice(0, 8),
    titles: input.titles ?? [],
    pain_points: input.pain_points ?? [],
  };
}

/**
 * Multi-channel scraper dispatcher. Routes each platform to Apollo, Serper, or Apify.
 */
export async function routeScraperByPlatform(
  platform: string,
  blueprint: ScraperBlueprint,
  limit: number,
  env: ScraperEnvKeys = {},
): Promise<RawScrapedLead[]> {
  const normalized = platform.toLowerCase();
  const searchKeys: SearchKeys = {
    provider: env.searchProvider,
    serperApiKey: env.serperApiKey,
    googleCseKey: env.googleCseKey,
    googleCseCx: env.googleCseCx,
  };

  switch (normalized) {
    case "linkedin":
      return searchApolloPeople(blueprint, limit, env.apolloApiKey ?? "");

    case "google":
    case "web":
      return scrapeSerperPlatform(normalized, blueprint, limit, searchKeys);

    case "reddit":
    case "youtube":
    case "instagram":
    case "tiktok":
    case "twitter":
      return scrapeApifySocial(normalized, blueprint, limit, env);

    default:
      return scrapeSerperPlatform(normalized, blueprint, limit, searchKeys);
  }
}
