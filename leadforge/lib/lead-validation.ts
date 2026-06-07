/**
 * Validation and filtering of raw scraped leads before enrichment.
 * A lead that fails validation is silently discarded — never shown to users.
 */

import type { EmailConfidence, EmailSource } from "@/types";

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

export const JUNK_NAMES = new Set([
  "search",
  "popular",
  "explore",
  "trending",
  "home",
  "login",
  "signup",
  "sign up",
  "register",
  "reel",
  "reels",
  "stories",
  "for you",
  "following",
  "foryou",
  "fyp",
  "discover",
  "watch",
  "more",
  "results",
  "tags",
  "hashtag",
  "unknown",
  "user",
  "anonymous",
  "deleted",
  "[deleted]",
  "none",
  "n/a",
]);

const JUNK_URL_PATTERNS: RegExp[] = [
  /[?&]q=/i,
  /\/search[?/]/i,
  /\/results[?/]/i,
  /twitter\.com\/search/i,
  /x\.com\/search/i,
  /twitter\.com\/explore/i,
  /twitter\.com\/home/i,
  /twitter\.com\/i\//i,
  /x\.com\/explore/i,
  /x\.com\/home/i,
  /x\.com\/i\//i,
  /instagram\.com\/explore/i,
  /instagram\.com\/reel\//i,
  /instagram\.com\/p\//i,
  /instagram\.com\/stories\//i,
  /instagram\.com\/tv\//i,
  /tiktok\.com\/tag\//i,
  /tiktok\.com\/trending/i,
  /tiktok\.com\/foryou/i,
  /youtube\.com\/watch\?/i,
  /youtube\.com\/shorts\//i,
  /youtube\.com\/results\?/i,
  /reddit\.com\/r\/[^/]+\/comments\//i,
  /reddit\.com\/search/i,
  /reddit\.com\/r\/[^/]+\/?$/i,
  /\/(tag|tags|hashtag|category|categories)\//i,
];

const VALID_PROFILE_PATTERNS: Record<string, RegExp> = {
  twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/(?!search|explore|home|i\/|intent)[a-zA-Z0-9_]{1,50}\/?$/,
  instagram:
    /^https?:\/\/(www\.)?instagram\.com\/(?!explore|reel|p\/|tv\/|stories)[a-zA-Z0-9_.]{1,30}\/?$/,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]{1,50}/,
  youtube: /^https?:\/\/(www\.)?youtube\.com\/(c\/|@|user\/)[a-zA-Z0-9_-]+/,
  reddit: /^https?:\/\/(www\.)?reddit\.com\/u(?:ser)?\/[a-zA-Z0-9_-]+/,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+/,
};

const STRICT_PLATFORMS = new Set([
  "twitter",
  "instagram",
  "tiktok",
  "youtube",
  "reddit",
  "linkedin",
]);

export function isJunkName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return !normalized || JUNK_NAMES.has(normalized);
}

/** Returns true if this lead should be discarded before enrichment. */
export function isJunkLead(lead: RawLead): boolean {
  const url = lead.url || "";
  const name = (lead.name || "").trim().toLowerCase();
  const platform = lead.platform;

  if (JUNK_NAMES.has(name)) return true;

  const wordCount = name.split(/\s+/).filter(Boolean).length;
  if (wordCount > 6) return true;

  if (JUNK_URL_PATTERNS.some((p) => p.test(url))) return true;

  const profilePattern = VALID_PROFILE_PATTERNS[platform];
  if (profilePattern && url && !profilePattern.test(url)) {
    if (STRICT_PLATFORMS.has(platform)) return true;
  }

  const hasName = Boolean(name) && !JUNK_NAMES.has(name);
  const companyLower = (lead.company || "").trim().toLowerCase();
  const hasCompany = Boolean(companyLower) && !JUNK_NAMES.has(companyLower);
  const hasUrl = url.length > 10;
  if (!hasName && !hasCompany && !hasUrl) return true;

  const nameIsUnknown = !lead.name || JUNK_NAMES.has((lead.name || "").toLowerCase());
  const companyIsUnknown =
    !lead.company || JUNK_NAMES.has((lead.company || "").toLowerCase());
  if (nameIsUnknown && companyIsUnknown) return true;

  return false;
}

/** Extract display name from a social profile URL when title parsing fails. */
export function extractNameFromUrl(url: string, platform: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname;

    switch (platform) {
      case "twitter": {
        const m = path.match(/^\/([a-zA-Z0-9_]{1,50})\/?$/);
        return m ? m[1] : "";
      }
      case "instagram": {
        const m = path.match(/^\/([a-zA-Z0-9_.]{1,30})\/?$/);
        return m ? m[1] : "";
      }
      case "tiktok": {
        const m = path.match(/^\/@([a-zA-Z0-9_.]{1,50})/);
        return m ? m[1] : "";
      }
      case "youtube": {
        const m = path.match(/^\/(c\/|@|user\/)([a-zA-Z0-9_-]+)/);
        return m ? m[2] : "";
      }
      case "reddit": {
        const m = path.match(/^\/u(?:ser)?\/([a-zA-Z0-9_-]+)/);
        return m ? `u/${m[1]}` : "";
      }
      case "linkedin": {
        const m = path.match(/^\/(in|company)\/([a-zA-Z0-9_-]+)/);
        return m ? m[2].replace(/-/g, " ") : "";
      }
      default:
        return "";
    }
  } catch {
    return "";
  }
}
