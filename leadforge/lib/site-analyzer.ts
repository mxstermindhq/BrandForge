/**
 * Fetch and analyze a business website to infer ideal buyer persona + search intent.
 */

import { buildSearchIntentAnalysis, heuristicPersona } from "@/lib/search-intent";
import { callGeminiPriority } from "@/lib/gemini";
import { PROCESSING_USER_AGENT, SCRAPE_TIMEOUT_MS } from "@/lib/constants";
import type {
  ExtractedPersona,
  SiteAnalysisResult,
  SiteBusinessProfile,
} from "@/types";

const MAX_TEXT_PER_PAGE = 8000;
const MAX_COMBINED_TEXT = 14_000;

const SITE_PATHS = ["", "/about", "/about-us", "/pricing", "/plans", "/services", "/products"];

export interface SitePageSnapshot {
  url: string;
  title: string;
  meta_description: string;
  text: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, property: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m?.[1]) return m[1].trim();
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${property}["']`,
    "i",
  );
  return re2.exec(html)?.[1]?.trim() ?? "";
}

function titleTag(html: string): string {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
}

/** Normalize user input to a fetchable https URL. */
export function normalizeSiteUrl(input: string): string {
  let raw = input.trim();
  if (!raw) throw new Error("Website URL is required");
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const parsed = new URL(raw);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http/https URLs are supported");
  }
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host === "127.0.0.1") {
    throw new Error("Local URLs cannot be analyzed");
  }
  parsed.hash = "";
  const normalized = parsed.toString().replace(/\/$/, "");
  return normalized || parsed.origin;
}

async function fetchPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": PROCESSING_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Crawl homepage + key same-origin paths. */
export async function crawlSite(baseUrl: string): Promise<SitePageSnapshot[]> {
  const origin = new URL(baseUrl).origin;
  const snapshots: SitePageSnapshot[] = [];
  const seen = new Set<string>();

  for (const path of SITE_PATHS) {
    const url = path ? `${origin}${path}` : baseUrl;
    const key = url.split("#")[0];
    if (seen.has(key)) continue;
    seen.add(key);

    const html = await fetchPage(url);
    if (!html) continue;

    const text = stripHtml(html).slice(0, MAX_TEXT_PER_PAGE);
    if (text.length < 80 && path !== "") continue;

    snapshots.push({
      url: key,
      title: titleTag(html),
      meta_description: metaContent(html, "description") || metaContent(html, "og:description"),
      text,
    });

    if (snapshots.length >= 4) break;
  }

  if (snapshots.length === 0) {
    throw new Error("Could not read this website — check the URL is public and reachable");
  }

  return snapshots;
}

function hostName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function detectOfferType(text: string): SiteBusinessProfile["offer_type"] {
  const lower = text.toLowerCase();
  if (/\b(saas|software|platform|api|dashboard|subscription)\b/.test(lower)) return "saas";
  if (/\b(agency|consulting|consultancy|services firm)\b/.test(lower)) return "agency";
  if (/\b(shop|store|ecommerce|e-commerce|buy now|add to cart)\b/.test(lower)) return "ecommerce";
  if (/\b(service|services|we help|we build|we design)\b/.test(lower)) return "service";
  if (/\b(product|products|tool|tools)\b/.test(lower)) return "product";
  return "mixed";
}

function extractAudienceHint(text: string): string {
  const forMatch = text.match(/\bfor\s+([^.!?\n]{10,80})/i);
  if (forMatch?.[1]) return forMatch[1].trim();
  const builtMatch = text.match(/\bbuilt for\s+([^.!?\n]{10,80})/i);
  if (builtMatch?.[1]) return builtMatch[1].trim();
  return "";
}

function heuristicSiteProfile(snapshots: SitePageSnapshot[], baseUrl: string): SiteBusinessProfile {
  const home = snapshots[0];
  const combined = snapshots.map((s) => `${s.title} ${s.meta_description} ${s.text}`).join("\n");
  const company = home.title.split(/[|\-–—·]/)[0].trim() || hostName(baseUrl);

  const priceMatch = combined.match(
    /\$\d[\d,]*(?:\s*\/\s*(?:mo|month|yr|year))?|\b(?:from|starting at)\s+\$\d[\d,]*/i,
  );

  return {
    url: baseUrl,
    company_name: company.slice(0, 120),
    tagline: home.meta_description.slice(0, 200) || home.title.slice(0, 200),
    offer_type: detectOfferType(combined),
    what_they_sell: home.meta_description || home.text.slice(0, 300),
    value_proposition: home.text.slice(0, 400),
    price_signal: priceMatch?.[0] ?? "",
    stated_audience: extractAudienceHint(combined),
  };
}

function buildPersonaText(site: SiteBusinessProfile, persona: ExtractedPersona): string {
  return [
    `Business: ${site.company_name} (${site.url})`,
    `Offers: ${site.what_they_sell}`,
    `Value: ${site.value_proposition.slice(0, 200)}`,
    `Ideal buyers: ${persona.titles.join(", ")} in ${persona.industries.join(", ")}`,
    `Pain points solved: ${persona.pain_points.join("; ")}`,
    site.price_signal ? `Pricing: ${site.price_signal}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const SITE_BUYER_SYSTEM = `You are a B2B/B2C go-to-market strategist.
Analyze a business website and infer their IDEAL BUYER PERSONA (who they should sell to).
Return ONLY valid JSON:
{
  "site": {
    "company_name": "string",
    "tagline": "string",
    "offer_type": "product|service|saas|agency|ecommerce|mixed",
    "what_they_sell": "string",
    "value_proposition": "string",
    "price_signal": "string",
    "stated_audience": "string"
  },
  "persona": {
    "titles": ["string"],
    "industries": ["string"],
    "locations": ["string"],
    "company_sizes": ["string"],
    "pain_points": ["string"],
    "keywords": ["string"],
    "budget_signal": "string",
    "b2b": boolean,
    "suggested_channels": ["google|reddit|youtube|instagram|tiktok|twitter|linkedin|web"],
    "product_context": "string"
  },
  "intent_summary": "one sentence: who to find and why they need this offer",
  "confidence": <integer 0-100>
}
Rules:
- Infer buyers from what the business SELLS, not who they are
- B2B SaaS/agency → linkedin, google, web; DTC/creator → instagram, tiktok, youtube
- keywords = search-ready phrases to find these buyers online
- pain_points = problems this offer solves for buyers
- product_context = pitch context referencing the actual offer`;

function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}

function normalizePersona(parsed: Partial<ExtractedPersona>, fallback: ExtractedPersona): ExtractedPersona {
  const allowed = new Set([
    "google", "reddit", "youtube", "instagram", "tiktok", "twitter", "linkedin", "web",
  ]);
  return {
    titles: (parsed.titles?.length ? parsed.titles : fallback.titles).map(String).slice(0, 5),
    industries: (parsed.industries?.length ? parsed.industries : fallback.industries).map(String).slice(0, 4),
    locations: (parsed.locations ?? fallback.locations).map(String).slice(0, 3),
    company_sizes: (parsed.company_sizes ?? fallback.company_sizes).map(String).slice(0, 3),
    pain_points: (parsed.pain_points?.length ? parsed.pain_points : fallback.pain_points).map(String).slice(0, 4),
    keywords: (parsed.keywords?.length ? parsed.keywords : fallback.keywords).map(String).slice(0, 8),
    budget_signal: String(parsed.budget_signal ?? fallback.budget_signal),
    b2b: parsed.b2b ?? fallback.b2b,
    suggested_channels: (parsed.suggested_channels ?? fallback.suggested_channels)
      .map(String)
      .filter((c) => allowed.has(c))
      .slice(0, 5),
    product_context: String(parsed.product_context ?? fallback.product_context),
  };
}

async function analyzeSiteWithAi(
  snapshots: SitePageSnapshot[],
  baseUrl: string,
  apiKey: string,
  model?: string,
): Promise<{
  site: SiteBusinessProfile;
  persona: ExtractedPersona;
  intent_summary: string;
  confidence: number;
} | null> {
  const corpus = snapshots
    .map(
      (s) =>
        `--- ${s.url} ---\nTitle: ${s.title}\nMeta: ${s.meta_description}\n${s.text.slice(0, 3500)}`,
    )
    .join("\n\n")
    .slice(0, MAX_COMBINED_TEXT);

  const prompt = `Website URL: ${baseUrl}\n\nPage content:\n${corpus}\n\nInfer the ideal buyer persona for outbound lead gen.`;

  const raw = await callGeminiPriority(prompt, SITE_BUYER_SYSTEM, apiKey, model);
  const parsed = safeParse<{
    site?: Partial<SiteBusinessProfile>;
    persona?: Partial<ExtractedPersona>;
    intent_summary?: string;
    confidence?: number;
  }>(raw);

  if (!parsed?.persona) return null;

  const heuristicSite = heuristicSiteProfile(snapshots, baseUrl);
  const heuristicPersonaResult = heuristicPersona(corpus);

  const site: SiteBusinessProfile = {
    url: baseUrl,
    company_name: String(parsed.site?.company_name ?? heuristicSite.company_name),
    tagline: String(parsed.site?.tagline ?? heuristicSite.tagline),
    offer_type: (parsed.site?.offer_type as SiteBusinessProfile["offer_type"]) ?? heuristicSite.offer_type,
    what_they_sell: String(parsed.site?.what_they_sell ?? heuristicSite.what_they_sell),
    value_proposition: String(parsed.site?.value_proposition ?? heuristicSite.value_proposition),
    price_signal: String(parsed.site?.price_signal ?? heuristicSite.price_signal),
    stated_audience: String(parsed.site?.stated_audience ?? heuristicSite.stated_audience),
  };

  return {
    site,
    persona: normalizePersona(parsed.persona, heuristicPersonaResult),
    intent_summary: String(parsed.intent_summary ?? `Find ideal buyers for ${site.company_name}.`),
    confidence: typeof parsed.confidence === "number" ? Math.min(100, Math.max(0, parsed.confidence)) : 75,
  };
}

/** Full pipeline: crawl site → AI buyer persona → search intent package. */
export async function analyzeWebsiteForBuyers(
  siteUrlInput: string,
  channels: string[],
  apiKey: string,
  model?: string,
): Promise<SiteAnalysisResult> {
  const baseUrl = normalizeSiteUrl(siteUrlInput);
  const snapshots = await crawlSite(baseUrl);
  const corpus = snapshots.map((s) => s.text).join(" ");
  const heuristicSite = heuristicSiteProfile(snapshots, baseUrl);
  const fallbackPersona = heuristicPersona(
    `${heuristicSite.what_they_sell} ${heuristicSite.value_proposition} ${corpus.slice(0, 2000)}`,
  );
  fallbackPersona.product_context = `${heuristicSite.company_name}: ${heuristicSite.what_they_sell}`;

  let site = heuristicSite;
  let persona = fallbackPersona;
  let intent_summary = `Find ${fallbackPersona.titles[0] ?? "buyers"} who need ${heuristicSite.what_they_sell.slice(0, 80)}.`;
  let confidence = 55;

  if (apiKey?.trim()) {
    try {
      const ai = await analyzeSiteWithAi(snapshots, baseUrl, apiKey, model);
      if (ai) {
        site = ai.site;
        persona = ai.persona;
        intent_summary = ai.intent_summary;
        confidence = ai.confidence;
      }
    } catch (err) {
      console.warn("[site-analyzer] AI analysis failed:", err instanceof Error ? err.message : err);
      confidence = 50;
    }
  }

  const intent = buildSearchIntentAnalysis(persona, buildPersonaText(site, persona), channels, {
    intent_summary,
    confidence,
    clarifying_questions: [],
  });

  return {
    ...intent,
    ready_to_search: true,
    clarifying_questions: [],
    source_url: baseUrl,
    site,
    persona_text: buildPersonaText(site, persona),
  };
}
