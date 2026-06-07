import type { SearchKeys, WebSearchHit } from "@/lib/search";
import { searchWeb } from "@/lib/search";
import type { ExtractedPersona } from "@/types";

export interface RawLead {
  name: string;
  title: string;
  company: string;
  url: string;
  bio: string;
  platform: string;
  email?: string;
}

export async function searchChannel(
  channel: string,
  persona: ExtractedPersona,
  limit: number,
  keys: SearchKeys,
  signal?: AbortSignal,
): Promise<RawLead[]> {
  const queries = buildQueries(channel, persona);
  const results: RawLead[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    if (results.length >= limit) break;
    const raw = await searchWeb(query, Math.min(10, limit - results.length), keys, signal);
    for (const hit of raw) {
      const parsed = parseResult(hit, channel);
      const key = parsed.url || parsed.name;
      if (!key || seen.has(key)) continue;
      if (!parsed.name && !parsed.url) continue;
      seen.add(key);
      results.push(parsed);
      if (results.length >= limit) break;
    }
  }

  return results.slice(0, limit);
}

function buildQueries(channel: string, persona: ExtractedPersona): string[] {
  const { titles, industries, locations, pain_points, keywords } = persona;
  const loc = locations[0] || "";
  const title = titles[0] || "";
  const industry = industries[0] || "";
  const pain = pain_points[0] || "";
  const kw = keywords.slice(0, 3).join(" ");

  switch (channel) {
    case "linkedin":
      return [
        `site:linkedin.com/in "${title}" "${industry}" ${loc}`,
        `site:linkedin.com/in "${title}" ${kw}`,
        `site:linkedin.com/company "${industry}" ${loc}`,
      ];
    case "reddit":
      return [
        `site:reddit.com "${pain}" ${industry}`,
        `site:reddit.com "${title}" looking for ${kw}`,
        `reddit.com ${industry} ${pain} recommendations`,
      ];
    case "youtube":
      return [
        `${title} ${industry} youtube channel ${loc}`,
        `${kw} youtube creator ${industry}`,
        `"${industry}" tips youtube ${loc}`,
      ];
    case "instagram":
      return [
        `instagram.com "${title}" ${industry} ${loc}`,
        `site:instagram.com ${kw} ${industry}`,
        `${title} ${industry} instagram`,
      ];
    case "tiktok":
      return [
        `site:tiktok.com ${kw} ${industry}`,
        `tiktok ${title} ${industry} ${loc}`,
        `${kw} tiktok creator`,
      ];
    case "twitter":
      return [
        `site:twitter.com "${title}" "${industry}" ${loc}`,
        `site:x.com ${kw} ${industry}`,
        `twitter "${title}" ${industry} ${pain}`,
      ];
    case "google":
      return [
        `"${title}" "${industry}" ${loc} contact email`,
        `"${title}" "${industry}" ${loc} email site:linkedin.com`,
        `${kw} ${industry} ${loc} contact`,
      ];
    case "web":
    default:
      return [
        `${title} ${industry} ${loc} ${kw}`,
        `"${title}" "${industry}" ${pain}`,
        `${kw} ${loc} ${industry} founder OR owner OR manager`,
      ];
  }
}

function parseResult(result: WebSearchHit, channel: string): RawLead {
  const url = result.url || "";
  const title = result.title || "";
  const snippet = result.snippet || "";

  let name = "";
  if (channel === "linkedin") {
    const match = title.match(/^([^-|]+)/);
    name = match ? match[1].trim() : "";
  }
  if (channel === "reddit") {
    const match = url.match(/reddit\.com\/u\/([^/]+)/);
    name = match ? match[1] : title;
  }
  if (!name) name = title.split("|")[0].split("-")[0].trim();

  const jobTitleMatch = (snippet + " " + title).match(
    /\b(CEO|CTO|CFO|Founder|Co-Founder|Director|Manager|Head of|VP|President|Owner|Freelancer|Consultant|Engineer|Designer)\b/i,
  );
  const jobTitle = jobTitleMatch ? jobTitleMatch[0] : "";

  let company = "";
  const atMatch = title.match(/ at ([^|]+)/i);
  if (atMatch) company = atMatch[1].trim();

  const emailMatch = snippet.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/i);
  const email = emailMatch ? emailMatch[0] : "";

  return { name, title: jobTitle, company, url, bio: snippet, platform: channel, email };
}

export function buildChannelQuery(persona: ExtractedPersona, channel: string): string {
  const base = [
    ...persona.titles.slice(0, 2),
    ...persona.industries.slice(0, 1),
    ...persona.locations.slice(0, 1),
  ]
    .filter(Boolean)
    .join(" ");

  switch (channel) {
    case "linkedin":
      return `site:linkedin.com/in ${base}`;
    case "reddit":
      return `site:reddit.com ${persona.pain_points[0] || base}`;
    case "youtube":
      return `${base} youtube channel`;
    case "twitter":
      return `${base} site:twitter.com OR site:x.com`;
    case "instagram":
      return `${base} instagram`;
    case "tiktok":
      return `${base} tiktok creator`;
    case "google":
      return `${base} contact email`;
    default:
      return `${base} ${persona.keywords.slice(0, 3).join(" ")}`;
  }
}
