import type { SearchKeys, WebSearchHit } from "@/lib/search";
import { searchWeb } from "@/lib/search";
import { extractEmailsFromContent } from "@/lib/email-extract";
import type { EmailConfidence, EmailSource, ExtractedPersona, WebsiteAnalysis } from "@/types";
import { isWebsiteAnalysis } from "@/lib/website-analysis-bridge";

export interface RawLead {
  name: string;
  title: string;
  company: string;
  url: string;
  bio: string;
  platform: string;
  email?: string;
  email_confidence?: EmailConfidence | null;
  email_source?: EmailSource | null;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

export function buildIntentQueries(channel: string, analysis: WebsiteAnalysis): string[] {
  const { icp, intent_signals, where_buyers_congregate } = analysis;

  const topTitles = icp.titles.slice(0, 2);
  const topIndustries = icp.industries.slice(0, 2);
  const topSignals = intent_signals.slice(0, 4);
  const titleStr = topTitles.map((t) => `"${t}"`).join(" OR ");
  const industryStr = topIndustries.join(" ");
  const loc = icp.locations[0] || "";

  const intentPairs = [
    topSignals.slice(0, 2).map((s) => `"${s}"`).join(" OR "),
    topSignals.slice(2, 4).map((s) => `"${s}"`).join(" OR "),
  ].filter(Boolean);

  const linkedinSignals = where_buyers_congregate.linkedin_signals
    .slice(0, 2)
    .map((s) => `"${s}"`)
    .join(" OR ");

  switch (channel) {
    case "linkedin":
      return [
        `site:linkedin.com/in ${titleStr} ${icp.company_stage
          .slice(0, 2)
          .map((s) => `"${s}"`)
          .join(" OR ")}`,
        `site:linkedin.com/in ${titleStr} "${industryStr}"${loc ? ` "${loc}"` : ""}`,
        `site:linkedin.com/in ${linkedinSignals || titleStr} ${industryStr}`,
        `site:linkedin.com/company "${icp.company_stage[0] || ""}" ${industryStr}${loc ? ` ${loc}` : ""}`,
      ].filter(Boolean);

    case "reddit": {
      const subs = where_buyers_congregate.subreddits;
      const subStr =
        subs.length > 0
          ? `(${subs
              .slice(0, 3)
              .map((s) => `site:reddit.com${s.startsWith("/") ? s : `/${s.replace(/^r\//, "r/")}`}`)
              .join(" OR ")})`
          : "site:reddit.com";
      return [
        `${subStr} (${intentPairs[0] || `"${topSignals[0] || "looking for help"}"`})`,
        `${subStr} (${intentPairs[1] || intentPairs[0] || `"${topSignals[1] || topSignals[0]}"`}) ${industryStr}`,
        `site:reddit.com ${titleStr} ${industryStr}`,
        `site:reddit.com "recommend" OR "suggestions" (${topTitles.map((t) => `"${t}"`).join(" OR ")}) ${industryStr}`,
      ].filter(Boolean);
    }

    case "twitter": {
      const twitterComs = where_buyers_congregate.twitter_communities.slice(0, 2).join(" ");
      return [
        `(${intentPairs[0] || `"${topSignals[0]}"`}) ${industryStr} site:twitter.com`,
        `(${intentPairs[1] || intentPairs[0] || `"${topSignals[0]}"`}) ${loc} site:x.com`,
        `${twitterComs} ${titleStr} site:twitter.com`,
        `site:twitter.com (${titleStr}) "${industryStr}" ${icp.company_stage[0] || ""}`,
      ].filter(Boolean);
    }

    case "google":
      return [
        `(${intentPairs[0] || `"${topSignals[0]}"`}) ${industryStr} ${loc} "contact" OR "email"`,
        `${titleStr} ${industryStr}${loc ? ` ${loc}` : ""} "@" email contact`,
        `${topSignals[0] || ""} ${industryStr} ${loc}`,
        `"${topSignals[1] || topSignals[0] || ""}" ${industryStr} forum OR community`,
      ].filter(Boolean);

    case "instagram":
      return [
        `site:instagram.com (${titleStr}) ${industryStr}`,
        `instagram (${titleStr}) ${icp.company_stage[0] || ""} ${industryStr}`,
        `instagram profile ${icp.psychographics[0] || titleStr} ${industryStr}`,
      ].filter(Boolean);

    case "tiktok":
      return [
        `site:tiktok.com ${titleStr} ${industryStr}`,
        `tiktok (${titleStr}) ${industryStr} ${loc}`,
        `"${topSignals[0] || ""}" tiktok ${industryStr}`,
      ].filter(Boolean);

    case "youtube":
      return [
        `${titleStr} ${industryStr} youtube channel${loc ? ` ${loc}` : ""}`,
        `"${topSignals[0] || ""}" youtube ${industryStr}`,
        `${industryStr} ${icp.company_stage[0] || ""} youtube channel`,
      ].filter(Boolean);

    case "web":
    default:
      return [
        `${titleStr} ${industryStr}${loc ? ` ${loc}` : ""} contact email`,
        `(${intentPairs[0] || `"${topSignals[0]}"`}) ${industryStr}${loc ? ` ${loc}` : ""}`,
        `"${topSignals[0] || ""}" ${industryStr} ${icp.company_stage[0] || ""}`,
        `${industryStr} ${titleStr} directory OR listing`,
      ].filter(Boolean);
  }
}

export async function searchChannel(
  channel: string,
  analysis: WebsiteAnalysis | ExtractedPersona,
  limit: number,
  keys: SearchKeys,
  signal?: AbortSignal,
): Promise<RawLead[]> {
  const websiteAnalysis: WebsiteAnalysis = isWebsiteAnalysis(analysis)
    ? analysis
    : personaToMinimalAnalysis(analysis);

  const queries = buildIntentQueries(channel, websiteAnalysis);
  const results: RawLead[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    if (results.length >= limit) break;

    try {
      const raw = await searchWeb(query, Math.min(10, limit - results.length), keys, signal);
      for (const hit of raw) {
        const parsed = parseResult(hit, channel);
        if (!seenUrls.has(parsed.url) && (parsed.name || parsed.url)) {
          seenUrls.add(parsed.url);
          results.push(parsed);
        }
        if (results.length >= limit) break;
      }
    } catch (err) {
      console.warn(`[channel-search] ${channel} query failed: "${query}"`, err);
    }
  }

  return results.slice(0, limit);
}

function personaToMinimalAnalysis(persona: ExtractedPersona): WebsiteAnalysis {
  return {
    company_name: persona.product_context || "Unknown",
    product_summary: persona.product_context || "",
    price_signal: persona.budget_signal || "unknown",
    market_position: "mid-market",
    icp: {
      one_liner: `Buyers matching ${persona.titles.join(", ") || "target profile"}`,
      titles: persona.titles,
      seniority: [],
      company_stage: [],
      company_size: persona.company_sizes,
      industries: persona.industries,
      locations: persona.locations,
      technical_level: "unknown",
      psychographics: [],
      budget_range: persona.budget_signal || "unknown",
    },
    pain_points: persona.pain_points,
    buying_triggers: [],
    intent_signals: persona.keywords.length ? persona.keywords : persona.pain_points,
    where_buyers_congregate: {
      subreddits: [],
      twitter_communities: [],
      linkedin_signals: persona.titles.slice(0, 2),
      other: [],
    },
    email_patterns: { likely_domains: [], format: "unknown" },
    confidence: 50,
    confidence_reason: "Converted from legacy persona",
    data_quality_issues: [],
  };
}

function parseResult(result: WebSearchHit, channel: string): RawLead {
  const url = result.url || "";
  const title = result.title || "";
  const snippet = result.snippet || "";
  const fullContent = `${title} ${snippet}`;

  let name = "";
  if (channel === "linkedin") {
    const m = title.match(/^([^|–\-]+)/);
    name = m ? m[1].replace(/\s+at\s+.*/i, "").trim() : "";
  } else if (channel === "reddit") {
    const m = url.match(/reddit\.com\/u(?:ser)?\/([^/?\s]+)/);
    name = m ? m[1] : "";
  } else if (channel === "twitter") {
    const m = url.match(/twitter\.com\/([^/?\s]+)|x\.com\/([^/?\s]+)/);
    name = m ? m[1] || m[2] : "";
  } else if (channel === "instagram") {
    const m = url.match(/instagram\.com\/([^/?\s]+)/);
    name = m ? m[1] : "";
  } else if (channel === "tiktok") {
    const m = url.match(/tiktok\.com\/@([^/?\s]+)/);
    name = m ? m[1] : "";
  } else {
    name = title.split(/[|–\-·]/)[0].trim();
  }

  const titlePattern =
    /\b(CEO|CTO|CFO|COO|CPO|Founder|Co-Founder|Co-founder|Director|VP|Head of|Lead|Manager|Owner|Freelancer|Consultant|Designer|Developer|Engineer|Operator|Creator)\b/i;
  const titleMatch = fullContent.match(titlePattern);
  const jobTitle = titleMatch ? titleMatch[0] : "";

  let company = "";
  const atMatch = title.match(/\bat\s+([^|–\-]+)/i);
  if (atMatch) company = atMatch[1].trim();

  const emailCandidates = extractEmailsFromContent(fullContent);
  const bestEmail =
    emailCandidates.find((e) => e.confidence === "high")?.email || emailCandidates[0]?.email || "";

  const linkedin = channel === "linkedin" ? url : "";
  const twitter =
    channel === "twitter" || url.includes("twitter.com") || url.includes("x.com") ? url : "";
  const instagram = channel === "instagram" ? url : "";

  return {
    name: name.slice(0, 100),
    title: jobTitle,
    company: company.slice(0, 100),
    url,
    bio: snippet.slice(0, 500),
    platform: channel,
    email: bestEmail,
    email_confidence: emailCandidates[0]?.confidence ?? null,
    email_source: emailCandidates[0]?.source ?? null,
    linkedin,
    twitter,
    instagram,
  };
}

export function buildChannelQuery(
  analysis: WebsiteAnalysis | ExtractedPersona,
  channel: string,
): string {
  const websiteAnalysis = isWebsiteAnalysis(analysis)
    ? analysis
    : personaToMinimalAnalysis(analysis);
  return buildIntentQueries(channel, websiteAnalysis)[0] ?? "";
}
