import type { SearchKeys, WebSearchHit } from "@/lib/search";
import { searchWeb } from "@/lib/search";
import { extractEmailsFromContent, isSocialPlatformEmail } from "@/lib/email-extract";
import {
  extractNameFromUrl,
  isJunkLead,
  isJunkName,
  type RawLead,
} from "@/lib/lead-validation";
import type {
  CampaignType,
  ExtractedPersona,
  WebsiteAnalysis,
} from "@/types";
import { isWebsiteAnalysis, inferB2bFromAnalysis } from "@/lib/website-analysis-bridge";

export type { RawLead };

export interface SearchChannelResult {
  leads: RawLead[];
  discardedCount: number;
}

export function buildIntentQueries(
  channel: string,
  analysis: WebsiteAnalysis,
  campaignType?: CampaignType,
): string[] {
  const b2b = campaignType ? campaignType === "b2b" : inferB2bFromAnalysis(analysis);
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

  if (!b2b) {
    return buildB2cIntentQueries(channel, {
      titleStr,
      industryStr,
      loc,
      intentPairs,
      topSignals,
      topTitles,
      icp,
      where_buyers_congregate,
    });
  }

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
        `site:reddit.com/u/ ${topTitles[0] || ""} ${industryStr}`,
        `${subStr} (${intentPairs[0] || `"${topSignals[0] || "looking for help"}"`})`,
        `${subStr} (${intentPairs[1] || intentPairs[0] || `"${topSignals[1] || topSignals[0]}"`}) ${industryStr}`,
        `site:reddit.com/r/ ${titleStr} ${industryStr} author`,
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
        `site:youtube.com/c OR site:youtube.com/@ ${titleStr} ${industryStr}`,
        `youtube channel ${titleStr} ${industryStr}${loc ? ` ${loc}` : ""}`,
        `"${topTitles[0] || ""}" youtube channel ${industryStr}`,
        `${industryStr} youtube channel ${icp.company_stage?.[0] || ""}`,
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

type QueryParts = {
  titleStr: string;
  industryStr: string;
  loc: string;
  intentPairs: string[];
  topSignals: string[];
  topTitles: string[];
  icp: WebsiteAnalysis["icp"];
  where_buyers_congregate: WebsiteAnalysis["where_buyers_congregate"];
};

/** B2C: consumers, creators, personal buyers — social + recommendation intent. */
function buildB2cIntentQueries(channel: string, p: QueryParts): string[] {
  const { titleStr, industryStr, loc, intentPairs, topSignals, topTitles, icp } = p;
  const subs = p.where_buyers_congregate.subreddits;
  const subStr =
    subs.length > 0
      ? `(${subs
          .slice(0, 3)
          .map((s) => `site:reddit.com${s.startsWith("/") ? s : `/${s.replace(/^r\//, "r/")}`}`)
          .join(" OR ")})`
      : "site:reddit.com";

  switch (channel) {
    case "reddit":
      return [
        `site:reddit.com/u/ ${topTitles[0] || ""} ${industryStr}`,
        `${subStr} (${intentPairs[0] || `"${topSignals[0] || "recommend"}"`}) ${industryStr}`,
        `${subStr} "looking for" ${industryStr}`,
        `site:reddit.com/r/ ${titleStr} ${industryStr} author`,
      ].filter(Boolean);

    case "instagram":
      return [
        `site:instagram.com ${industryStr} ${titleStr}`,
        `instagram ${icp.psychographics[0] || industryStr} creator OR influencer`,
        `site:instagram.com "${topSignals[0] || "recommend"}" ${industryStr}`,
      ].filter(Boolean);

    case "tiktok":
      return [
        `site:tiktok.com ${industryStr} ${titleStr}`,
        `tiktok "${topSignals[0] || "recommend"}" ${industryStr}`,
        `site:tiktok.com @ ${industryStr} small business OR creator`,
      ].filter(Boolean);

    case "youtube":
      return [
        `site:youtube.com/c OR site:youtube.com/@ ${industryStr} ${titleStr}`,
        `"${topSignals[0] || ""}" youtube channel ${industryStr}`,
        `youtube channel ${industryStr} creator OR vlog`,
      ].filter(Boolean);

    case "twitter":
      return [
        `(${intentPairs[0] || `"${topSignals[0]}"`}) ${industryStr} site:twitter.com OR site:x.com`,
        `site:twitter.com ${titleStr} ${industryStr} recommend`,
        `"${topSignals[0] || ""}" ${loc} site:x.com`,
      ].filter(Boolean);

    case "google":
    case "web":
    default:
      return [
        `(${intentPairs[0] || `"${topSignals[0]}"`}) ${industryStr}${loc ? ` ${loc}` : ""} email OR contact`,
        `${titleStr} ${industryStr} "gmail.com" OR personal email`,
        `"${topSignals[0] || ""}" ${industryStr} forum OR community`,
        `${industryStr} ${topSignals[1] || topSignals[0] || ""} blog OR review`,
      ].filter(Boolean);
  }
}

function tryAddLead(
  parsed: RawLead,
  results: RawLead[],
  seenUrls: Set<string>,
  discardedCount: { value: number },
): boolean {
  if (isJunkLead(parsed)) {
    discardedCount.value++;
    console.log(
      `[lead-validation] Discarded junk lead: name="${parsed.name}" url="${parsed.url}" platform="${parsed.platform}"`,
    );
    return false;
  }
  if (seenUrls.has(parsed.url)) return false;
  seenUrls.add(parsed.url);
  results.push(parsed);
  return true;
}

export async function searchChannel(
  channel: string,
  analysis: WebsiteAnalysis | ExtractedPersona,
  limit: number,
  keys: SearchKeys,
  signal?: AbortSignal,
  campaignType?: CampaignType,
): Promise<SearchChannelResult> {
  const websiteAnalysis: WebsiteAnalysis = isWebsiteAnalysis(analysis)
    ? analysis
    : personaToMinimalAnalysis(analysis);

  const queries = buildIntentQueries(channel, websiteAnalysis, campaignType);
  const results: RawLead[] = [];
  const seenUrls = new Set<string>();
  const discardedCount = { value: 0 };

  for (const query of queries) {
    if (results.length >= limit) break;

    try {
      const raw = await searchWeb(query, Math.min(10, limit - results.length), keys, signal);
      for (const hit of raw) {
        const parsed = parseResult(hit, channel);
        tryAddLead(parsed, results, seenUrls, discardedCount);
        if (results.length >= limit) break;
      }
    } catch (err) {
      console.warn(`[channel-search] ${channel} query failed: "${query}"`, err);
    }
  }

  if (results.length === 0) {
    const redditSuffix = channel === "reddit" ? "site:reddit.com/u/" : "";
    const fallback = `${websiteAnalysis.icp.titles[0] || ""} ${websiteAnalysis.icp.industries[0] || ""} ${redditSuffix}`.trim();
    if (fallback.length > 5) {
      try {
        const raw = await searchWeb(fallback, 10, keys, signal);
        for (const hit of raw) {
          const parsed = parseResult(hit, channel);
          tryAddLead(parsed, results, seenUrls, discardedCount);
        }
      } catch {
        /* best effort */
      }
    }
  }

  return {
    leads: results.slice(0, limit),
    discardedCount: discardedCount.value,
  };
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
    name = m ? `u/${m[1]}` : "";
  } else if (channel === "twitter") {
    const m = url.match(/twitter\.com\/([^/?\s]+)|x\.com\/([^/?\s]+)/);
    name = m ? m[1] || m[2] : "";
  } else if (channel === "instagram") {
    const m = url.match(/instagram\.com\/([^/?\s]+)/);
    name = m ? m[1] : "";
  } else if (channel === "tiktok") {
    const m = url.match(/tiktok\.com\/@([^/?\s]+)/);
    name = m ? m[1] : "";
  } else if (channel === "youtube") {
    const m = url.match(/youtube\.com\/(?:c\/|@|user\/)([^/?\s]+)/);
    name = m ? m[1] : "";
  } else {
    name = title.split(/[|–\-·]/)[0].trim();
  }

  if (!name || isJunkName(name)) {
    const urlName = extractNameFromUrl(url, channel);
    if (urlName) name = urlName;
  }

  const titlePattern =
    /\b(CEO|CTO|CFO|COO|CPO|Founder|Co-Founder|Co-founder|Director|VP|Head of|Lead|Manager|Owner|Freelancer|Consultant|Designer|Developer|Engineer|Operator|Creator)\b/i;
  const titleMatch = fullContent.match(titlePattern);
  const jobTitle = titleMatch ? titleMatch[0] : "";

  let company = "";
  const atMatch = title.match(/\bat\s+([^|–\-]+)/i);
  if (atMatch) company = atMatch[1].trim();

  const emailCandidates = extractEmailsFromContent(fullContent);
  let bestEmail =
    emailCandidates.find((e) => e.confidence === "high")?.email || emailCandidates[0]?.email || "";
  if (bestEmail && isSocialPlatformEmail(bestEmail)) {
    bestEmail = "";
  }

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
    email: bestEmail || undefined,
    email_confidence: bestEmail ? (emailCandidates[0]?.confidence ?? null) : null,
    email_source: bestEmail ? (emailCandidates[0]?.source ?? null) : null,
    linkedin,
    twitter,
    instagram,
  };
}

export function buildChannelQuery(
  analysis: WebsiteAnalysis | ExtractedPersona,
  channel: string,
  campaignType?: CampaignType,
): string {
  const websiteAnalysis = isWebsiteAnalysis(analysis)
    ? analysis
    : personaToMinimalAnalysis(analysis);
  return buildIntentQueries(channel, websiteAnalysis, campaignType)[0] ?? "";
}
