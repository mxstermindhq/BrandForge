/**
 * Fetch and analyze a business website to infer ideal buyer persona + search intent.
 */

import { analyzeWebsite } from "@/lib/gemini";
import { appendAdminLog } from "@/lib/admin-telemetry";
import { groqWebsiteAnalysis } from "@/lib/enrich-fallback";
import { PROCESSING_USER_AGENT, SCRAPE_TIMEOUT_MS } from "@/lib/constants";
import {
  buildSearchPreviewFromAnalysis,
  heuristicWebsiteAnalysis,
  suggestedChannelsFromAnalysis,
  websiteAnalysisToPersona,
  websiteAnalysisToPersonaText,
  websiteAnalysisToSiteProfile,
} from "@/lib/website-analysis-bridge";
import type { SiteAnalysisResult, WebsiteAnalysis } from "@/types";

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
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (nextData?.[1]) {
    try {
      const data = JSON.parse(nextData[1]) as {
        props?: { pageProps?: Record<string, unknown> };
      };
      const pageProps = data.props?.pageProps;
      if (pageProps) {
        out += " " + JSON.stringify(pageProps).slice(0, 4000);
      }
    } catch {
      /* ignore */
    }
  }

  const jsonLdBlocks = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdBlocks) {
    for (const block of jsonLdBlocks.slice(0, 3)) {
      const inner = block.replace(/<\/?script[^>]*>/gi, "").trim();
      out += " " + inner.slice(0, 1500);
    }
  }

  return out
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

function buildCorpus(snapshots: SitePageSnapshot[]): string {
  return snapshots
    .map(
      (s) =>
        `--- ${s.url} ---\nTitle: ${s.title}\nMeta: ${s.meta_description}\n${s.text.slice(0, 3500)}`,
    )
    .join("\n\n")
    .slice(0, MAX_COMBINED_TEXT);
}

async function runWebsiteAnalysis(
  corpus: string,
  baseUrl: string,
  companyName: string,
  geminiKey: string,
  geminiModel: string | undefined,
  groqKey: string,
  groqModel: string | undefined,
): Promise<{ analysis: WebsiteAnalysis; source: SiteAnalysisResult["analysis_source"] }> {
  let lastError = "";

  if (geminiKey.trim()) {
    try {
      const analysis = await analyzeWebsite(corpus, baseUrl, geminiKey, geminiModel);
      return { analysis, source: "gemini" };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Gemini failed";
      appendAdminLog({
        level: "warn",
        source: "site-analyzer",
        message: `Gemini failed: ${lastError}`,
      });
    }
  } else {
    lastError = "GEMINI_API_KEY not configured";
  }

  if (groqKey.trim()) {
    try {
      const analysis = await groqWebsiteAnalysis(corpus, baseUrl, groqKey, groqModel);
      return { analysis, source: "groq" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Groq failed";
      appendAdminLog({
        level: "warn",
        source: "site-analyzer",
        message: `Groq failed: ${msg}`,
      });
      lastError = lastError ? `${lastError}; ${msg}` : msg;
    }
  }

  return {
    analysis: heuristicWebsiteAnalysis(corpus, baseUrl, companyName, {
      fallbackReason: lastError
        ? `Rule-based analysis — ${lastError.slice(0, 120)}`
        : undefined,
      corpusChars: corpus.length,
    }),
    source: "heuristic",
  };
}

/** Full pipeline: crawl site → AI buyer ICP → search intent package. */
export async function analyzeWebsiteForBuyers(
  siteUrlInput: string,
  channels: string[],
  apiKey: string,
  model?: string,
  groqKey?: string,
  groqModel?: string,
): Promise<SiteAnalysisResult> {
  const baseUrl = normalizeSiteUrl(siteUrlInput);
  const snapshots = await crawlSite(baseUrl);
  const corpus = buildCorpus(snapshots);
  const home = snapshots[0];
  const companyName = home.title.split(/[|\-–—·]/)[0].trim() || hostName(baseUrl);

  const { analysis: website_analysis, source: analysis_source } = await runWebsiteAnalysis(
    corpus,
    baseUrl,
    companyName,
    apiKey,
    model,
    groqKey ?? "",
    groqModel,
  );

  const persona = websiteAnalysisToPersona(website_analysis);
  const suggested = suggestedChannelsFromAnalysis(website_analysis);
  persona.suggested_channels = suggested.length ? suggested : persona.suggested_channels;

  const site = websiteAnalysisToSiteProfile(website_analysis, baseUrl);
  const persona_text = websiteAnalysisToPersonaText(website_analysis);
  const intent_summary = website_analysis.icp.one_liner;
  const search_preview = buildSearchPreviewFromAnalysis(website_analysis, channels);

  return {
    persona,
    confidence: website_analysis.confidence,
    intent_summary,
    clarifying_questions: [],
    ready_to_search: website_analysis.confidence >= 60,
    search_preview,
    source_url: baseUrl,
    site,
    persona_text,
    website_analysis,
    analysis_source,
  };
}
