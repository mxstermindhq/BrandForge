/**
 * Email extraction from scraped content. No external API required.
 */

import { PROCESSING_USER_AGENT, SCRAPE_TIMEOUT_MS } from "@/lib/constants";
import type { EmailConfidence, EmailSource } from "@/types";

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[a-z]{2,6}/gi;
const MAILTO_REGEX = /mailto:([\w.+-]+@[\w-]+\.[a-z]{2,6})/gi;

const JUNK_DOMAINS = new Set([
  "example.com",
  "test.com",
  "placeholder.com",
  "domain.com",
  "sentry.io",
  "githubusercontent.com",
  "cloudflare.com",
  "wixpress.com",
  "squarespace.com",
]);

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "icloud.com",
  "me.com",
  "outlook.com",
  "hotmail.com",
  "proton.me",
  "pm.me",
  "yahoo.com",
]);

export interface ExtractedEmail {
  email: string;
  confidence: EmailConfidence;
  source: EmailSource;
}

function isJunk(email: string): boolean {
  const domain = email.split("@")[1];
  if (!domain) return true;
  if (JUNK_DOMAINS.has(domain)) return true;
  if (email.includes("noreply") || email.includes("no-reply") || email.includes("donotreply")) {
    return true;
  }
  if (email.endsWith(".png") || email.endsWith(".jpg") || email.endsWith(".webp")) return true;
  return false;
}

function isLikelyReal(email: string): boolean {
  const [local, domain] = email.split("@");
  if (!local || !domain || !domain.includes(".")) return false;
  if (local.length < 2 || local.length > 40) return false;
  if (/\d{5,}/.test(local)) return false;
  return true;
}

/** Extract emails from raw page HTML/text content. */
export function extractEmailsFromContent(content: string): ExtractedEmail[] {
  const found = new Map<string, ExtractedEmail>();

  for (const match of content.matchAll(MAILTO_REGEX)) {
    const email = match[1].toLowerCase();
    if (!isJunk(email)) {
      found.set(email, { email, confidence: "high", source: "mailto" });
    }
  }

  for (const match of content.matchAll(EMAIL_REGEX)) {
    const email = match[0].toLowerCase();
    if (!found.has(email) && !isJunk(email) && isLikelyReal(email)) {
      found.set(email, {
        email,
        confidence: PERSONAL_DOMAINS.has(email.split("@")[1]) ? "medium" : "medium",
        source: "pattern",
      });
    }
  }

  return Array.from(found.values()).slice(0, 3);
}

/** Generate likely professional email addresses given name + domain. */
export function generateEmailCandidates(
  firstName: string,
  lastName: string,
  domain: string,
): ExtractedEmail[] {
  if (!firstName || !domain) return [];

  const f = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const l = lastName?.toLowerCase().replace(/[^a-z]/g, "") || "";
  if (!f) return [];

  const candidates = [
    `${f}@${domain}`,
    l ? `${f}.${l}@${domain}` : "",
    l ? `${f[0]}${l}@${domain}` : "",
    l ? `${f}${l}@${domain}` : "",
    `hello@${domain}`,
    `contact@${domain}`,
    `hi@${domain}`,
  ].filter((e, i, arr) => e.length > 5 && arr.indexOf(e) === i);

  return candidates.map((email, i) => ({
    email,
    confidence: i === 0 ? "medium" : "low",
    source: "generated" as const,
  }));
}

/** Try to fetch and extract emails from contact/about pages. */
export async function extractEmailFromContactPage(baseUrl: string): Promise<ExtractedEmail[]> {
  const candidates = ["/contact", "/about", "/team", "/contact-us"];

  for (const path of candidates) {
    try {
      const url = new URL(path, baseUrl).href;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);
      const res = await fetch(url, {
        headers: { "User-Agent": PROCESSING_USER_AGENT, Accept: "text/html" },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const text = await res.text();
      const extracted = extractEmailsFromContent(text);
      if (extracted.length > 0) return extracted;
    } catch {
      /* continue */
    }
  }

  return [];
}

export function isKnownSocialUrl(url: string): boolean {
  return /linkedin\.com|twitter\.com|x\.com|instagram\.com|tiktok\.com|reddit\.com|youtube\.com/i.test(
    url,
  );
}

export function domainFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (isKnownSocialUrl(url)) return "";
    return host;
  } catch {
    return "";
  }
}

export interface EmailResolutionInput {
  name: string;
  email?: string;
  email_confidence?: EmailConfidence | null;
  email_source?: EmailSource | null;
  url?: string;
}

export interface EmailResolutionEnriched {
  email_from_bio?: string;
  company_domain?: string;
  email_guess?: string;
}

export interface ResolvedEmail {
  email: string;
  email_confidence: EmailConfidence | null;
  email_source: EmailSource | null;
  company_domain: string | null;
}

/** Merge email from scrape, bio, and generated candidates. */
export function resolveLeadEmail(
  raw: EmailResolutionInput,
  enriched: EmailResolutionEnriched,
): ResolvedEmail {
  const company_domain = enriched.company_domain?.trim() || domainFromUrl(raw.url ?? "") || null;

  if (raw.email?.trim()) {
    return {
      email: raw.email.trim(),
      email_confidence: raw.email_confidence ?? "medium",
      email_source: raw.email_source ?? "pattern",
      company_domain,
    };
  }

  const bioEmail = enriched.email_from_bio?.trim() || enriched.email_guess?.trim() || "";
  if (bioEmail && isLikelyReal(bioEmail) && !isJunk(bioEmail)) {
    return {
      email: bioEmail,
      email_confidence: "medium",
      email_source: "pattern",
      company_domain,
    };
  }

  if (company_domain && raw.name) {
    const [firstName, ...rest] = raw.name.split(/\s+/);
    const lastName = rest.join(" ");
    const candidates = generateEmailCandidates(firstName, lastName, company_domain);
    if (candidates.length > 0) {
      return {
        email: candidates[0].email,
        email_confidence: candidates[0].confidence,
        email_source: candidates[0].source,
        company_domain,
      };
    }
  }

  return {
    email: "",
    email_confidence: null,
    email_source: null,
    company_domain,
  };
}

export function emailBonus(confidence: EmailConfidence | null | undefined): number {
  if (confidence === "high") return 15;
  if (confidence === "medium") return 10;
  if (confidence === "low") return 5;
  return 0;
}
