import type {
  BuildQueryParams,
  ExtractedLeadData,
  RawScrapedResult,
} from "@/types";
import {
  GENERIC_EMAIL_PREFIXES,
  PLATFORM_QUERY_BUILDERS,
  PREFERRED_EMAIL_PREFIXES,
  PROCESSING_USER_AGENT,
  SCRAPE_DOMAIN_BLOCKLIST,
  SCRAPE_TIMEOUT_MS,
} from "@/lib/constants";
import { webSearch, type SearchKeys } from "@/lib/search";

const SKIP_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".zip", ".svg", ".webp"];

const EMAIL_RE =
  /[\w.+\-]+@(?!.*\.(?:png|jpg|gif|svg|webp))[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi;
const PHONE_RE = /(\+?[\d\s\-().]{10,})/g;
const LINKEDIN_RE = /linkedin\.com\/(?:company|in)\/[\w\-]+/gi;
const INSTAGRAM_RE = /instagram\.com\/[\w.]+/gi;
const TWITTER_RE = /(?:twitter|x)\.com\/(?!intent|share|home)[\w]+/gi;
const REDDIT_RE = /reddit\.com\/u(?:ser)?\/([\w\-]+)/gi;
const YOUTUBE_RE = /youtube\.com\/(?:channel\/|c\/|@)[\w\-]+/gi;
const TIKTOK_RE = /tiktok\.com\/@[\w.]+/gi;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchWithTimeout(
  url: string,
  signal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return fetch(url, {
    signal: controller.signal,
    headers: {
      "User-Agent": PROCESSING_USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
  }).finally(() => clearTimeout(timeout));
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isBlocked(url: string): boolean {
  const host = hostOf(url);
  if (!host) return true;
  return SCRAPE_DOMAIN_BLOCKLIST.some((d) => host === d || host.endsWith(`.${d}`));
}

function shouldSkipExtension(url: string): boolean {
  const lower = url.toLowerCase().split("?")[0];
  return SKIP_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function uniqueLower(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim());
  }
  return out;
}

function emailPrefix(email: string): string {
  return email.split("@")[0]?.toLowerCase() ?? "";
}

/** Rank emails: preferred role mailboxes first, generic ones last. */
export function rankEmails(emails: string[]): string[] {
  return uniqueLower(emails).sort((a, b) => {
    const pa = emailPrefix(a);
    const pb = emailPrefix(b);
    const score = (p: string): number => {
      if (PREFERRED_EMAIL_PREFIXES.includes(p)) return 0;
      if (GENERIC_EMAIL_PREFIXES.includes(p)) return 2;
      return 1;
    };
    return score(pa) - score(pb);
  });
}

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_RE) ?? [];
  const filtered = matches.filter((e) => {
    const lower = e.toLowerCase();
    if (lower.endsWith("example.com")) return false;
    if (lower.includes("@2x") || lower.includes(".webp")) return false;
    return true;
  });
  return rankEmails(filtered);
}

function firstMatch(re: RegExp, text: string): string | null {
  const m = text.match(re);
  return m && m[0] ? m[0] : null;
}

function extractCompanyName(html: string, url: string): string | null {
  const og = /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i.exec(html);
  if (og?.[1]) return og[1].trim();
  const ogt = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html);
  if (ogt?.[1]) return ogt[1].split(/[|\-–—·]/)[0].trim();
  const title = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  if (title?.[1]) return title[1].split(/[|\-–—·]/)[0].trim();
  return hostOf(url);
}

function findContactPath(html: string, baseUrl: string): string | null {
  const host = hostOf(baseUrl);
  if (!host) return null;
  const re = /<a[^>]+href=["']([^"']*contact[^"']*)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname.replace(/^www\./, "") === host) {
        return resolved.toString();
      }
    } catch {
      // ignore malformed href
    }
  }
  return null;
}

function parseLeadFromHtml(
  html: string,
  url: string,
  platform: string,
): ExtractedLeadData {
  const linkedin = firstMatch(LINKEDIN_RE, html);
  const instagramRaw = (html.match(INSTAGRAM_RE) ?? []).find(
    (s) => !s.includes("instagram.com/p/"),
  );
  const twitter = firstMatch(TWITTER_RE, html);
  const reddit = REDDIT_RE.exec(html);
  REDDIT_RE.lastIndex = 0;
  const youtube = firstMatch(YOUTUBE_RE, html);
  const tiktok = firstMatch(TIKTOK_RE, html);

  return {
    url,
    company_name: extractCompanyName(html, url),
    contact_name: null,
    emails: extractEmails(html),
    phone: firstMatch(PHONE_RE, html)?.trim() ?? null,
    linkedin_url: linkedin ? `https://${linkedin}` : null,
    instagram_url: instagramRaw ? `https://${instagramRaw}` : null,
    twitter_handle: twitter ? `https://${twitter}` : null,
    reddit_username: reddit?.[1] ?? null,
    youtube_channel: youtube ? `https://${youtube}` : null,
    tiktok_handle: tiktok ? `https://${tiktok}` : null,
    platform,
    snippet: null,
  };
}

function emptyExtract(url: string, platform: string): ExtractedLeadData {
  return {
    url,
    company_name: hostOf(url),
    contact_name: null,
    emails: [],
    phone: null,
    linkedin_url: null,
    instagram_url: null,
    twitter_handle: null,
    reddit_username: null,
    youtube_channel: null,
    tiktok_handle: null,
    platform,
    snippet: null,
  };
}

/**
 * Resolve result URLs for a query via the pluggable search layer (free
 * DuckDuckGo by default; Serper/Google CSE when keys are present). Applies the
 * domain blocklist and file-extension skip, and dedupes within the call.
 */
export async function searchSerp(
  query: string,
  pages: number,
  platform: string,
  keys: SearchKeys = {},
  signal?: AbortSignal,
): Promise<RawScrapedResult[]> {
  const results: RawScrapedResult[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < pages; page++) {
    const hits = await webSearch(query, page, keys, signal);
    if (hits.length === 0) {
      if (page === 0) continue; // first page empty → try nothing further is pointless
      break; // no more results
    }
    for (const hit of hits) {
      const decoded = hit.url;
      if (!decoded || !decoded.startsWith("http")) continue;
      if (isBlocked(decoded) || shouldSkipExtension(decoded)) continue;
      const key = decoded.split("#")[0];
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        url: decoded,
        title: hit.title || hostOf(decoded) || decoded,
        snippet: "",
        emailsInSnippet: [],
        platform,
      });
    }
    // Gentle pacing between pages to stay polite with the free provider.
    if (page < pages - 1) await delay(600);
  }
  return results;
}

/** @deprecated kept for compatibility — use searchSerp. */
export const scrapeGoogle = searchSerp;

/** Fetch a URL and extract lead data. Never throws — returns partial on error. */
export async function extractFromURL(
  url: string,
  platform: string,
  signal?: AbortSignal,
): Promise<ExtractedLeadData> {
  if (shouldSkipExtension(url)) return emptyExtract(url, platform);
  let html = "";
  try {
    const res = await fetchWithTimeout(url, signal);
    if (!res.ok) return emptyExtract(url, platform);
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return emptyExtract(url, platform);
    }
    html = await res.text();
  } catch {
    return emptyExtract(url, platform);
  }

  const primary = parseLeadFromHtml(html, url, platform);

  // Follow a same-domain contact page and merge emails if found.
  const contactUrl = findContactPath(html, url);
  if (contactUrl && contactUrl !== url) {
    try {
      const res = await fetchWithTimeout(contactUrl, signal);
      if (res.ok) {
        const contactHtml = await res.text();
        const contact = parseLeadFromHtml(contactHtml, url, platform);
        primary.emails = rankEmails([...primary.emails, ...contact.emails]);
        primary.phone = primary.phone ?? contact.phone;
        primary.linkedin_url = primary.linkedin_url ?? contact.linkedin_url;
        primary.instagram_url = primary.instagram_url ?? contact.instagram_url;
        primary.twitter_handle = primary.twitter_handle ?? contact.twitter_handle;
      }
    } catch {
      // ignore contact-page failure
    }
  }

  return primary;
}

export function buildQuery(params: BuildQueryParams): string[] {
  const builder = PLATFORM_QUERY_BUILDERS[params.platform];
  if (builder) return builder(params);
  // Fallback generic query
  const loc = params.location ? ` "${params.location}"` : "";
  return [`"${params.niche}"${loc} contact email`];
}

function nonNullCount(lead: ExtractedLeadData): number {
  return Object.values(lead).filter((v) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)).length;
}

function mergeLeads(a: ExtractedLeadData, b: ExtractedLeadData): ExtractedLeadData {
  const richer = nonNullCount(a) >= nonNullCount(b) ? a : b;
  const other = richer === a ? b : a;
  return {
    url: richer.url || other.url,
    company_name: richer.company_name ?? other.company_name,
    contact_name: richer.contact_name ?? other.contact_name,
    emails: rankEmails([...a.emails, ...b.emails]),
    phone: richer.phone ?? other.phone,
    linkedin_url: richer.linkedin_url ?? other.linkedin_url,
    instagram_url: richer.instagram_url ?? other.instagram_url,
    twitter_handle: richer.twitter_handle ?? other.twitter_handle,
    reddit_username: richer.reddit_username ?? other.reddit_username,
    youtube_channel: richer.youtube_channel ?? other.youtube_channel,
    tiktok_handle: richer.tiktok_handle ?? other.tiktok_handle,
    platform: richer.platform || other.platform,
    snippet: richer.snippet ?? other.snippet,
  };
}

/** Dedupe by primary email, then by domain. Drops entries with no email AND no website. */
export function deduplicateLeads(
  leads: ExtractedLeadData[],
): ExtractedLeadData[] {
  const byKey = new Map<string, ExtractedLeadData>();

  for (const lead of leads) {
    const email = lead.emails[0]?.toLowerCase().trim();
    const domain = hostOf(lead.url);
    if (!email && !domain) continue; // both null → drop

    const key = email ? `email:${email}` : `domain:${domain}`;
    const existing = byKey.get(key);
    byKey.set(key, existing ? mergeLeads(existing, lead) : lead);
  }

  return [...byKey.values()];
}

export {
  buildScraperBlueprint,
  routeScraperByPlatform,
  sourceIdentifierForLead,
} from "@/lib/scraper-router";
