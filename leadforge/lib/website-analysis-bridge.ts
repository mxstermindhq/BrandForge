import { buildIntentQueries } from "@/lib/channel-search";
import {
  defaultChannelsForType,
  sanitizeChannelsForType,
} from "@/lib/campaign-type";
import type { CampaignType, ExtractedPersona, SiteBusinessProfile, WebsiteAnalysis } from "@/types";

const B2C_TITLE_SIGNALS =
  /\b(creator|influencer|consumer|shopify store|indie hacker|content creator|youtuber|streamer)\b/i;

const B2B_TITLE_SIGNALS =
  /\b(founder|ceo|cto|director|manager|vp|head of|operator|saas|startup|agency)\b/i;

export function isWebsiteAnalysis(value: unknown): value is WebsiteAnalysis {
  if (!value || typeof value !== "object") return false;
  const v = value as WebsiteAnalysis;
  return Boolean(v.icp?.one_liner && Array.isArray(v.intent_signals) && v.intent_signals.length > 0);
}

export function inferB2bFromAnalysis(analysis: WebsiteAnalysis): boolean {
  const blob = [
    analysis.icp.one_liner,
    ...analysis.icp.titles,
    ...analysis.icp.industries,
    ...analysis.icp.seniority,
  ].join(" ");
  if (B2C_TITLE_SIGNALS.test(blob)) return false;
  if (B2B_TITLE_SIGNALS.test(blob)) return true;
  return analysis.market_position !== "budget";
}

export function suggestedChannelsFromAnalysis(
  analysis: WebsiteAnalysis,
  campaignType?: CampaignType,
): string[] {
  const b2b = campaignType ? campaignType === "b2b" : inferB2bFromAnalysis(analysis);
  const allowed = new Set(channelsForType(b2b));

  const fromCongregate: string[] = [];
  if (analysis.where_buyers_congregate.subreddits.length > 0) fromCongregate.push("reddit");
  if (analysis.where_buyers_congregate.twitter_communities.length > 0) {
    fromCongregate.push("twitter");
  }
  if (b2b && analysis.where_buyers_congregate.linkedin_signals.length > 0) {
    fromCongregate.push("linkedin");
  }
  if (!b2b) {
    fromCongregate.push("instagram", "youtube", "tiktok");
  }

  const base = b2b
    ? defaultChannelsForType("b2b")
    : defaultChannelsForType("b2c");

  return [...new Set([...fromCongregate, ...base])].filter((c) => allowed.has(c)).slice(0, 5);
}

function channelsForType(b2b: boolean): string[] {
  return b2b
    ? ["google", "reddit", "youtube", "instagram", "tiktok", "twitter", "linkedin", "web"]
    : ["google", "reddit", "youtube", "instagram", "tiktok", "twitter", "web"];
}

export function websiteAnalysisToPersona(
  analysis: WebsiteAnalysis,
  campaignType?: CampaignType,
): ExtractedPersona {
  const b2b = campaignType ? campaignType === "b2b" : inferB2bFromAnalysis(analysis);
  return {
    titles: analysis.icp.titles.slice(0, 5),
    industries: analysis.icp.industries.slice(0, 4),
    locations: analysis.icp.locations.slice(0, 3),
    company_sizes: analysis.icp.company_size.slice(0, 3),
    pain_points: analysis.pain_points.slice(0, 5),
    keywords: analysis.intent_signals.slice(0, 8),
    budget_signal: analysis.icp.budget_range || analysis.price_signal || "",
    b2b,
    suggested_channels: suggestedChannelsFromAnalysis(analysis, campaignType),
    product_context: analysis.product_summary,
  };
}

/** Re-apply audience mode after user toggles B2B/B2C without re-analyzing. */
export function applyCampaignTypeToPersona(
  persona: ExtractedPersona,
  campaignType: CampaignType,
): ExtractedPersona {
  return {
    ...persona,
    b2b: campaignType === "b2b",
    suggested_channels: sanitizeChannelsForType(
      persona.suggested_channels.length
        ? persona.suggested_channels
        : defaultChannelsForType(campaignType),
      campaignType,
    ),
  };
}

export function websiteAnalysisToSiteProfile(
  analysis: WebsiteAnalysis,
  url: string,
): SiteBusinessProfile {
  const offerType = inferOfferType(analysis);
  return {
    url,
    company_name: analysis.company_name,
    tagline: analysis.product_summary,
    offer_type: offerType,
    what_they_sell: analysis.product_summary,
    value_proposition: analysis.icp.one_liner,
    price_signal: analysis.price_signal,
    stated_audience: analysis.icp.one_liner,
  };
}

function inferOfferType(analysis: WebsiteAnalysis): SiteBusinessProfile["offer_type"] {
  const blob = `${analysis.product_summary} ${analysis.icp.industries.join(" ")}`.toLowerCase();
  if (/\b(saas|software|platform|api)\b/.test(blob)) return "saas";
  if (/\b(agency|consulting)\b/.test(blob)) return "agency";
  if (/\b(e-?commerce|shop|store|dtc)\b/.test(blob)) return "ecommerce";
  if (/\b(service|services)\b/.test(blob)) return "service";
  if (/\b(product|tool)\b/.test(blob)) return "product";
  return "mixed";
}

export function websiteAnalysisToPersonaText(analysis: WebsiteAnalysis): string {
  return [
    `Business: ${analysis.company_name}`,
    `Product: ${analysis.product_summary}`,
    `Ideal buyer: ${analysis.icp.one_liner}`,
    `Titles: ${analysis.icp.titles.join(", ")}`,
    `Stages: ${analysis.icp.company_stage.join(", ")}`,
    `Pain points: ${analysis.pain_points.join("; ")}`,
    `Intent signals: ${analysis.intent_signals.join("; ")}`,
    analysis.price_signal ? `Pricing: ${analysis.price_signal}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSearchPreviewFromAnalysis(
  analysis: WebsiteAnalysis,
  channels: string[],
  campaignType?: CampaignType,
): Record<string, string> {
  const preview: Record<string, string> = {};
  for (const ch of channels.slice(0, 8)) {
    const queries = buildIntentQueries(ch, analysis, campaignType);
    preview[ch] = queries[0] ?? "";
  }
  return preview;
}

export function heuristicWebsiteAnalysis(
  corpus: string,
  url: string,
  companyName: string,
  options?: { fallbackReason?: string; corpusChars?: number; campaignType?: CampaignType },
): WebsiteAnalysis {
  const campaignType = options?.campaignType ?? "b2b";
  const isB2c = campaignType === "b2c";
  const isAgency = /\b(agency|design|development|dev shop|studio)\b/i.test(corpus);
  const isSaas = /\b(saas|software|platform|subscription)\b/i.test(corpus);
  const isEcom = /\b(e-?commerce|shopify|store|dtc)\b/i.test(corpus);

  let titles = ["Founder"];
  let industries = ["Startups"];
  let intent_signals = ["looking for help", "recommend a vendor", "need a partner"];

  if (isAgency) {
    titles = ["Solo Founder", "Indie Hacker", "Bootstrapped Founder"];
    industries = ["SaaS", "Startups"];
    intent_signals = [
      "looking for a developer",
      "need a landing page",
      "recommend a dev agency",
      "building my MVP",
      "need web development",
      "freelancer vs agency",
    ];
  } else if (/\b(digital founder|web3 operator|saas team)\b/i.test(corpus)) {
    titles = ["Digital Founder", "SaaS Founder", "Web3 Operator"];
    industries = ["SaaS", "Web3", "Startups"];
    intent_signals = [
      "looking for a design agency",
      "need MVP development",
      "fixed price web development",
      "recommend a dev shop",
      "building my startup website",
      "need brand and web design",
    ];
  } else if (isSaas) {
    titles = ["Head of Growth", "SaaS Founder", "Product Manager"];
    industries = ["SaaS", "B2B Software"];
    intent_signals = [
      "looking for a tool",
      "anyone recommend software",
      "need a solution for",
      "alternatives to",
    ];
  } else if (isEcom || isB2c) {
    titles = ["Shopify Store Owner", "E-commerce Operator", "Content Creator", "DTC Founder"];
    industries = ["E-commerce", "Retail", "Creator Economy"];
    intent_signals = [
      "anyone recommend a shopify app",
      "need help with my store",
      "best tool for my small business",
      "looking for recommendations",
      "what do you use for",
    ];
  }

  const priceMatch = corpus.match(
    /\$\d[\d,]*(?:\s*\/\s*(?:mo|month|yr|year))?|\b(?:from|starting at)\s+\$\d[\d,]*/i,
  );

  const corpusChars = options?.corpusChars ?? corpus.length;
  const fallbackReason = options?.fallbackReason?.trim() ?? "";

  let confidence_reason = fallbackReason;
  if (!confidence_reason) {
    confidence_reason =
      corpusChars < 400
        ? "Rule-based analysis — limited website text was available."
        : "Rule-based analysis — AI was unavailable.";
  }

  const one_liner = isAgency
    ? "My ideal buyer is a bootstrapped SaaS founder or indie hacker who needs design, development, and growth in one fixed-price engagement."
    : `My ideal buyer is a ${titles[0]} in ${industries[0]} who is actively searching for a solution like this.`;

  return {
    company_name: companyName,
    product_summary: corpus.slice(0, 160).trim() || "Product or service offering",
    price_signal: priceMatch?.[0] ?? "unknown",
    market_position: priceMatch ? "mid-market" : "mid-market",
    icp: {
      one_liner,
      titles,
      seniority: ["founder", "manager"],
      company_stage: ["pre-seed", "seed", "bootstrapped"],
      company_size: ["1-5", "6-20"],
      industries,
      locations: [],
      technical_level: "semi-technical",
      psychographics: ["values speed", "prefers clear pricing"],
      budget_range: priceMatch?.[0] ?? "unknown",
    },
    pain_points: ["manual processes", "lack of expertise", "time constraints"],
    buying_triggers: ["launch deadline", "growth milestone"],
    intent_signals,
    where_buyers_congregate: {
      subreddits: isB2c
        ? ["r/Entrepreneur", "r/smallbusiness", "r/ecommerce"]
        : isAgency
          ? ["r/SaaS", "r/entrepreneur", "r/startups"]
          : ["r/entrepreneur", "r/smallbusiness"],
      twitter_communities: isB2c ? ["#smallbusiness", "#shopify"] : ["#buildinpublic", "#indiehackers"],
      linkedin_signals: isB2c ? [] : ["building in public", "bootstrapped"],
      other: isB2c ? ["Instagram creators", "TikTok shop sellers"] : [],
    },
    email_patterns: {
      likely_domains: ["gmail.com"],
      format: "firstname@company.com",
    },
    confidence: corpusChars > 800 ? 48 : corpusChars > 400 ? 42 : 35,
    confidence_reason,
    data_quality_issues:
      corpusChars < 400
        ? ["Limited website content available for analysis"]
        : fallbackReason
          ? ["AI analysis failed — using rule-based buyer profile"]
          : [],
  };
}
