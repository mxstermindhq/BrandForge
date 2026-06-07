import { PROCESSING_USER_AGENT, SCRAPE_TIMEOUT_MS } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Pluggable web-search layer. The campaign processor only ever calls
// webSearch(); swapping providers is a config change, never a code change.
//
// Priority (first one with credentials wins):
//   1. Serper.dev      (SERPER_API_KEY)            — Google results as JSON
//   2. Google CSE      (GOOGLE_CSE_KEY + _CX)      — official JSON API
//   3. DuckDuckGo HTML (no key, free)              — default fallback
//
// SEARCH_PROVIDER can force one ("serper" | "google_cse" | "duckduckgo").
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchKeys {
  provider?: string;
  serperApiKey?: string;
  googleCseKey?: string;
  googleCseCx?: string;
}

export interface WebSearchHit {
  url: string;
  title: string;
  snippet?: string;
}

export type SearchProvider = "serper" | "google_cse" | "duckduckgo";

export function resolveProvider(keys: SearchKeys): SearchProvider {
  const forced = keys.provider?.trim().toLowerCase();
  if (forced === "serper" || forced === "google_cse" || forced === "duckduckgo") {
    return forced;
  }
  if (keys.serperApiKey) return "serper";
  if (keys.googleCseKey && keys.googleCseCx) return "google_cse";
  return "duckduckgo";
}

function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timeout),
  );
}

// ── DuckDuckGo (free, keyless) ───────────────────────────────────────────────
// Two mirrors with different markup. We try html, then lite, and retry once on
// a 202 "anomaly" challenge (DDG throttles datacenter IPs aggressively).
const DDG_ENDPOINTS = [
  "https://html.duckduckgo.com/html/",
  "https://lite.duckduckgo.com/lite/",
];
const DDG_HTML_RE = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
const DDG_LITE_RE = /<a[^>]+rel="nofollow"[^>]+href="(https?:\/\/[^"]+)"[^>]*>(.*?)<\/a>/gi;
const DDG_UDDG_RE = /[?&]uddg=([^&]+)/;

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function decodeDdgHref(href: string): string | null {
  const m = DDG_UDDG_RE.exec(href);
  if (m?.[1]) {
    try {
      return decodeURIComponent(m[1]);
    } catch {
      return null;
    }
  }
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  return null;
}

function parseDdg(html: string): WebSearchHit[] {
  const hits: WebSearchHit[] = [];
  const seen = new Set<string>();
  for (const re of [DDG_HTML_RE, DDG_LITE_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const url = decodeDdgHref(m[1]);
      if (!url || seen.has(url)) continue;
      // Skip DDG's own internal links.
      if (/duckduckgo\.com/.test(url)) continue;
      seen.add(url);
      hits.push({ url, title: stripTags(m[2] ?? "") || url });
    }
  }
  return hits;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchDuckDuckGo(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<WebSearchHit[]> {
  const body = new URLSearchParams({ q: query, kl: "us-en" });
  if (page > 0) body.set("s", String(page * 25));

  for (let i = 0; i < DDG_ENDPOINTS.length; i++) {
    const endpoint = DDG_ENDPOINTS[i];
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetchWithTimeout(
          endpoint,
          {
            method: "POST",
            headers: {
              "User-Agent": PROCESSING_USER_AGENT,
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "text/html,application/xhtml+xml",
              "Accept-Language": "en-US,en;q=0.9",
            },
            body: body.toString(),
          },
          signal,
        );
        // 202 = anomaly challenge; back off and retry once.
        if (res.status === 202 || res.status === 429) {
          await delay(1500 + attempt * 1500);
          continue;
        }
        if (!res.ok) break; // try next endpoint
        const hits = parseDdg(await res.text());
        if (hits.length > 0) return hits;
        break; // empty layout — try next endpoint
      } catch {
        break; // network/timeout — try next endpoint
      }
    }
  }
  return [];
}

// ── Serper.dev (Google results as JSON) ──────────────────────────────────────
async function searchSerper(
  query: string,
  page: number,
  apiKey: string,
  signal?: AbortSignal,
): Promise<WebSearchHit[]> {
  try {
    const res = await fetchWithTimeout(
      "https://google.serper.dev/search",
      {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        // Serper free tier only allows num<=10; 20 returns a 400.
        body: JSON.stringify({ q: query, page: page + 1, num: 10 }),
      },
      signal,
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      organic?: { link?: string; title?: string }[];
    };
    return (json.organic ?? [])
      .filter((o): o is { link: string; title?: string; snippet?: string } => typeof o.link === "string")
      .map((o) => ({ url: o.link, title: o.title ?? o.link, snippet: o.snippet ?? "" }));
  } catch {
    return [];
  }
}

// ── Google Custom Search JSON API ────────────────────────────────────────────
async function searchGoogleCse(
  query: string,
  page: number,
  key: string,
  cx: string,
  signal?: AbortSignal,
): Promise<WebSearchHit[]> {
  const start = page * 10 + 1; // CSE is 1-indexed, 10 results/page
  const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(query)}&start=${start}`;
  const res = await fetchWithTimeout(url, {}, signal);
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: { link?: string; title?: string }[] };
  return (json.items ?? [])
    .filter((i): i is { link: string; title?: string; snippet?: string } => typeof i.link === "string")
    .map((i) => ({ url: i.link, title: i.title ?? i.link, snippet: i.snippet ?? "" }));
}

/** Provider-agnostic search. Returns result URLs for a query + page (0-indexed). */
export async function webSearch(
  query: string,
  page: number,
  keys: SearchKeys,
  signal?: AbortSignal,
): Promise<WebSearchHit[]> {
  const provider = resolveProvider(keys);
  try {
    if (provider === "serper" && keys.serperApiKey) {
      return await searchSerper(query, page, keys.serperApiKey, signal);
    }
    if (provider === "google_cse" && keys.googleCseKey && keys.googleCseCx) {
      return await searchGoogleCse(query, page, keys.googleCseKey, keys.googleCseCx, signal);
    }
    console.warn("[search] Using DuckDuckGo fallback — results may be lower quality");
    const hits = await searchDuckDuckGo(query, page, signal);
    return hits.slice(0, 5);
  } catch {
    return [];
  }
}

/** Convenience wrapper: first page, capped result count. */
export async function searchWeb(
  query: string,
  limit: number,
  keys: SearchKeys,
  signal?: AbortSignal,
): Promise<WebSearchHit[]> {
  const hits = await webSearch(query, 0, keys, signal);
  return hits.slice(0, limit);
}
