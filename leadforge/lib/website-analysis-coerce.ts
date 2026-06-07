/**
 * Coerce and repair Gemini/Groq website analysis JSON into a consistent shape.
 */

import { campaignTypePromptBlock } from "@/lib/campaign-type";
import type { CampaignType, WebsiteAnalysis } from "@/types";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}

/** Map alternate Gemini field names into WebsiteAnalysis partial shape. */
export function coerceRawWebsiteAnalysis(input: Record<string, unknown>): Partial<WebsiteAnalysis> {
  const icpRaw = input.icp;
  let icp: Partial<WebsiteAnalysis["icp"]> = {};

  if (typeof icpRaw === "string") {
    icp.one_liner = icpRaw;
  } else if (icpRaw && typeof icpRaw === "object") {
    icp = { ...(icpRaw as Partial<WebsiteAnalysis["icp"]>) };
  }

  const flatLiner =
    (typeof input.icp_one_liner === "string" && input.icp_one_liner) ||
    (typeof input.ideal_buyer === "string" && input.ideal_buyer) ||
    (typeof input.buyer_profile === "string" && input.buyer_profile) ||
    (typeof input.target_customer === "string" && input.target_customer) ||
    "";

  if (!icp.one_liner && flatLiner) {
    icp.one_liner = flatLiner;
  }

  const intent_signals = asStringArray(
    input.intent_signals ??
      input.intentSignals ??
      input.search_phrases ??
      input.search_signals ??
      input.keywords,
  );

  const whereRaw = input.where_buyers_congregate;
  const where =
    whereRaw && typeof whereRaw === "object"
      ? (whereRaw as WebsiteAnalysis["where_buyers_congregate"])
      : undefined;

  return {
    company_name:
      typeof input.company_name === "string"
        ? input.company_name
        : typeof input.companyName === "string"
          ? input.companyName
          : undefined,
    product_summary:
      typeof input.product_summary === "string"
        ? input.product_summary
        : typeof input.productSummary === "string"
          ? input.productSummary
          : undefined,
    price_signal: typeof input.price_signal === "string" ? input.price_signal : undefined,
    market_position: input.market_position as WebsiteAnalysis["market_position"] | undefined,
    icp: icp as Partial<WebsiteAnalysis>["icp"],
    pain_points: asStringArray(input.pain_points ?? input.painPoints),
    buying_triggers: asStringArray(input.buying_triggers ?? input.buyingTriggers),
    intent_signals,
    where_buyers_congregate: where,
    email_patterns:
      input.email_patterns && typeof input.email_patterns === "object"
        ? (input.email_patterns as WebsiteAnalysis["email_patterns"])
        : undefined,
    confidence: typeof input.confidence === "number" ? input.confidence : undefined,
    confidence_reason:
      typeof input.confidence_reason === "string" ? input.confidence_reason : undefined,
    data_quality_issues: asStringArray(input.data_quality_issues),
  };
}

/** Fill gaps so normalizeWebsiteAnalysis always receives a usable ICP. */
export function repairWebsiteAnalysis(
  parsed: Partial<WebsiteAnalysis>,
  url: string,
): Partial<WebsiteAnalysis> | null {
  const coerced = coerceRawWebsiteAnalysis(parsed as Record<string, unknown>);

  if (!coerced.icp) coerced.icp = { one_liner: "" } as WebsiteAnalysis["icp"];

  let oneLiner = coerced.icp.one_liner?.trim() ?? "";
  if (!oneLiner && coerced.product_summary) {
    oneLiner = `My ideal buyer is someone who needs ${coerced.product_summary.slice(0, 120).trim()}.`;
    coerced.icp.one_liner = oneLiner;
  }

  if (!oneLiner) return null;

  if (!coerced.intent_signals?.length) {
    const synthesized = [
      ...asStringArray(coerced.pain_points).map((p) => `need help with ${p}`),
      ...asStringArray(coerced.icp.titles).flatMap((t) => [
        `looking for ${t}`,
        `recommend ${t}`,
      ]),
      ...asStringArray(coerced.buying_triggers),
    ].filter((s) => s.length > 8);
    coerced.intent_signals = synthesized.slice(0, 10);
  }

  if (!coerced.intent_signals?.length) return null;

  if (!coerced.company_name) {
    try {
      coerced.company_name = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
        .replace(/^www\./, "")
        .split(".")[0];
    } catch {
      coerced.company_name = "Unknown";
    }
  }

  if (!coerced.confidence_reason) {
    coerced.confidence_reason = "AI analysis of website content";
  }

  return coerced;
}

export function buildWebsiteAnalysisPrompt(
  content: string,
  url: string,
  campaignType: CampaignType = "b2b",
): string {
  return `${campaignTypePromptBlock(campaignType)}

Website URL: ${url}

Website content:
---
${content.slice(0, 6000)}
---

Return ONLY valid JSON with this exact shape:
{
  "company_name": "string",
  "product_summary": "string",
  "price_signal": "string",
  "market_position": "budget" | "mid-market" | "premium" | "enterprise",
  "icp": {
    "one_liner": "string",
    "titles": ["string"],
    "seniority": ["string"],
    "company_stage": ["string"],
    "company_size": ["string"],
    "industries": ["string"],
    "locations": ["string"],
    "technical_level": "string",
    "psychographics": ["string"],
    "budget_range": "string"
  },
  "pain_points": ["string"],
  "buying_triggers": ["string"],
  "intent_signals": ["string"],
  "where_buyers_congregate": {
    "subreddits": ["string"],
    "twitter_communities": ["string"],
    "linkedin_signals": ["string"],
    "other": ["string"]
  },
  "email_patterns": {
    "likely_domains": ["string"],
    "format": "string"
  },
  "confidence": number,
  "confidence_reason": "string",
  "data_quality_issues": ["string"]
}

Critical rules:
- icp.one_liner must describe the BUYER, not the product. Complete: "My ideal buyer is a [specific person] who [specific situation] and needs [specific outcome]"
- intent_signals must be literal search phrases a real human would type (6-10 items), not marketing language
- titles must be specific role names — never use "sales" unless the product is literally a sales tool
- Never hallucinate industries that aren't supported by the website content
- If the website is vague, lower confidence and list ambiguity in data_quality_issues`;
}

export function websiteAnalysisSystemInstruction(campaignType: CampaignType = "b2b"): string {
  const mode =
    campaignType === "b2c"
      ? "consumer and creator buyers (B2C)"
      : "business decision-makers (B2B)";
  return `You are a senior sales strategist with 15 years of experience profiling ideal customers for ${mode}.
A company has provided their website content. Your job is NOT to describe what they sell.
Your job is to deeply profile WHO buys it — the specific human being who is the ideal customer.
Think like this: "Who wakes up in the morning and THIS product solves their exact problem?"
Return ONLY valid JSON. No markdown. No preamble. No explanation. Just the JSON object.
The icp field MUST be a nested object with one_liner inside it — never flatten to icp_one_liner.`;
}

/** @deprecated Use websiteAnalysisSystemInstruction(type) */
export const WEBSITE_ANALYSIS_SYSTEM = websiteAnalysisSystemInstruction("b2b");

function normalizeMarketPosition(value: unknown): WebsiteAnalysis["market_position"] {
  const v = String(value ?? "mid-market").toLowerCase();
  if (v === "budget" || v === "premium" || v === "enterprise") return v;
  return "mid-market";
}

export function normalizeWebsiteAnalysis(parsed: Partial<WebsiteAnalysis>): WebsiteAnalysis {
  const icp = (parsed.icp ?? {}) as Partial<WebsiteAnalysis["icp"]>;
  return {
    company_name: String(parsed.company_name ?? "Unknown"),
    product_summary: String(parsed.product_summary ?? ""),
    price_signal: String(parsed.price_signal ?? "unknown"),
    market_position: normalizeMarketPosition(parsed.market_position),
    icp: {
      one_liner: String(icp.one_liner ?? ""),
      titles: Array.isArray(icp.titles) ? icp.titles.map(String).slice(0, 5) : [],
      seniority: Array.isArray(icp.seniority) ? icp.seniority.map(String) : [],
      company_stage: Array.isArray(icp.company_stage) ? icp.company_stage.map(String) : [],
      company_size: Array.isArray(icp.company_size) ? icp.company_size.map(String) : [],
      industries: Array.isArray(icp.industries) ? icp.industries.map(String).slice(0, 4) : [],
      locations: Array.isArray(icp.locations) ? icp.locations.map(String) : [],
      technical_level: String(icp.technical_level ?? "unknown"),
      psychographics: Array.isArray(icp.psychographics) ? icp.psychographics.map(String) : [],
      budget_range: String(icp.budget_range ?? "unknown"),
    },
    pain_points: Array.isArray(parsed.pain_points) ? parsed.pain_points.map(String).slice(0, 5) : [],
    buying_triggers: Array.isArray(parsed.buying_triggers)
      ? parsed.buying_triggers.map(String)
      : [],
    intent_signals: Array.isArray(parsed.intent_signals)
      ? parsed.intent_signals.map(String).slice(0, 10)
      : [],
    where_buyers_congregate: {
      subreddits: Array.isArray(parsed.where_buyers_congregate?.subreddits)
        ? parsed.where_buyers_congregate.subreddits.map(String)
        : [],
      twitter_communities: Array.isArray(parsed.where_buyers_congregate?.twitter_communities)
        ? parsed.where_buyers_congregate.twitter_communities.map(String)
        : [],
      linkedin_signals: Array.isArray(parsed.where_buyers_congregate?.linkedin_signals)
        ? parsed.where_buyers_congregate.linkedin_signals.map(String)
        : [],
      other: Array.isArray(parsed.where_buyers_congregate?.other)
        ? parsed.where_buyers_congregate.other.map(String)
        : [],
    },
    email_patterns: {
      likely_domains: Array.isArray(parsed.email_patterns?.likely_domains)
        ? parsed.email_patterns.likely_domains.map(String)
        : [],
      format: String(parsed.email_patterns?.format ?? "unknown"),
    },
    confidence:
      typeof parsed.confidence === "number"
        ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
        : 50,
    confidence_reason: String(parsed.confidence_reason ?? ""),
    data_quality_issues: Array.isArray(parsed.data_quality_issues)
      ? parsed.data_quality_issues.map(String)
      : [],
  };
}

export function parseWebsiteAnalysisResponse(
  raw: string,
  url: string,
): WebsiteAnalysis | null {
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    try {
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  const coerced = coerceRawWebsiteAnalysis(parsed);
  const repaired = repairWebsiteAnalysis(coerced, url);
  if (!repaired) return null;
  return normalizeWebsiteAnalysis(repaired);
}
