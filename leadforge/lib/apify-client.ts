/**
 * Apify Actor run-sync-get-dataset-items client for social platform scrapers.
 */

const APIFY_BASE = "https://api.apify.com/v2";

/** Default actor slugs per platform (override via APIFY_ACTOR_* env). */
export const DEFAULT_APIFY_ACTORS: Record<string, string> = {
  reddit: "trudax/reddit-scraper",
  youtube: "streamers/youtube-scraper",
  instagram: "apify/instagram-scraper",
  tiktok: "clockworks/tiktok-scraper",
  twitter: "apidojo/tweet-scraper",
};

export interface ApifyRunOptions {
  apiKey: string;
  actorId: string;
  input: Record<string, unknown>;
  limit?: number;
}

/** Run an Apify actor synchronously and return dataset items. */
export async function runApifyActorSync<T extends Record<string, unknown>>(
  options: ApifyRunOptions,
): Promise<T[]> {
  const { apiKey, actorId, input, limit = 25 } = options;
  if (!apiKey.trim()) return [];

  const actorPath = actorId.includes("/") ? actorId.replace("/", "~") : actorId;
  const url = `${APIFY_BASE}/acts/${actorPath}/run-sync-get-dataset-items?token=${encodeURIComponent(apiKey.trim())}&timeout=120`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, maxItems: limit, maxResults: limit }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn(`[apify] actor ${actorId} failed (${res.status}): ${text.slice(0, 200)}`);
    return [];
  }

  const items = (await res.json()) as T[];
  return Array.isArray(items) ? items.slice(0, limit) : [];
}

export function resolveApifyActor(platform: string): string {
  const envKey = `APIFY_ACTOR_${platform.toUpperCase()}` as keyof NodeJS.ProcessEnv;
  const fromEnv = process.env[envKey]?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_APIFY_ACTORS[platform] ?? "";
}
