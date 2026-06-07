import type {
  ColdEmailOutput,
  EmailConfidence,
  EmailSource,
  EnrichedLeadAIOutput,
  EstimatedSize,
  ExtractedLeadData,
  ExtractedPersona,
  FitLabel,
  GeminiEnrichmentOutput,
  Lead,
  PersonaEnrichmentOutput,
  ProductContext,
  RawScrapedLead,
  ScraperBlueprint,
  WebsiteAnalysis,
} from "@/types";
import { DEFAULT_GEMINI_MODEL, GEMINI_DELAY_MS, GEMINI_TIMEOUT_MS } from "@/lib/constants";
import {
  enrichCandidateDataFallback,
  enrichLeadWithPersonaFallback,
} from "@/lib/enrich-fallback";
import {
  emailBonus,
  resolveLeadEmail,
} from "@/lib/email-extract";

function geminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

const VALID_SIZES: EstimatedSize[] = ["solo", "small", "medium", "enterprise"];
const VALID_FITS: FitLabel[] = ["Hot", "Warm", "Cold"];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GeminiLane = { chain: Promise<void>; lastAt: number };

const planningLane: GeminiLane = { chain: Promise.resolve(), lastAt: 0 };
const enrichLane: GeminiLane = { chain: Promise.resolve(), lastAt: 0 };

/** Planning lane — persona/intent (light spacing, no 4s block). */
const GEMINI_PLANNING_GAP_MS = 400;

function scheduleLane<T>(lane: GeminiLane, gapMs: number, fn: () => Promise<T>): Promise<T> {
  const task = lane.chain.then(async () => {
    const elapsed = Date.now() - lane.lastAt;
    const wait = gapMs - elapsed;
    if (wait > 0) await delay(wait);
    lane.lastAt = Date.now();
    return fn();
  });
  lane.chain = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

async function geminiFetch(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: string,
  attempt = 0,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  const resolvedModel = model && model.trim() ? model.trim() : DEFAULT_GEMINI_MODEL;

  try {
    const res = await fetch(`${geminiUrl(resolvedModel)}?key=${apiKey.trim()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.35,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (res.status === 429 && attempt < 3) {
      await delay(4000 * (attempt + 1));
      return geminiFetch(prompt, systemInstruction, apiKey, model, attempt + 1);
    }
    if (res.status === 503 && attempt < 2) {
      await delay(2000 * (attempt + 1));
      return geminiFetch(prompt, systemInstruction, apiKey, model, attempt + 1);
    }
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Gemini error ${res.status}${errBody ? `: ${errBody.slice(0, 120)}` : ""}`);
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned empty response");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function invokeGemini(
  lane: GeminiLane,
  gapMs: number,
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<string> {
  if (!apiKey?.trim()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const resolvedModel = model && model.trim() ? model.trim() : DEFAULT_GEMINI_MODEL;
  return scheduleLane(lane, gapMs, () =>
    geminiFetch(prompt, systemInstruction, apiKey.trim(), resolvedModel),
  );
}

/** Fast lane for persona, intent, and blueprint extraction. */
export function callGeminiPriority(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<string> {
  return invokeGemini(planningLane, GEMINI_PLANNING_GAP_MS, prompt, systemInstruction, apiKey, model);
}

/** Rate-limited lane for per-lead enrichment. */
export function callGeminiEnrich(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<string> {
  return invokeGemini(enrichLane, GEMINI_DELAY_MS, prompt, systemInstruction, apiKey, model);
}

/** @deprecated Prefer callGeminiPriority or callGeminiEnrich. */
export function callGemini(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<string> {
  return callGeminiPriority(prompt, systemInstruction, apiKey, model);
}

function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Defensive: strip stray fences if the model ignored responseMimeType.
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

const ENRICH_SYSTEM = `You are a B2B/B2C lead qualification analyst for a cold-outreach team.
You receive raw scraped data about a potential lead and the seller's product context.
Return ONLY a JSON object with EXACTLY this shape and nothing else:
{
  "score": <integer 0-100>,
  "company_name": <string>,
  "contact_name": <string or null>,
  "email": <string or null>,
  "estimated_size": "solo" | "small" | "medium" | "enterprise",
  "fit_label": "Hot" | "Warm" | "Cold",
  "likely_needs": [<up to 3 short strings>],
  "pitch_angle": <one actionable sentence>,
  "red_flags": [<strings, empty array if none>]
}
Scoring must weigh: data completeness, keyword match to the product description,
platform signal strength (e.g. a Reddit commenter in the exact niche outranks a
random website), and price-point alignment. Be conservative: weak signals score low.`;

export async function enrichLead(
  rawData: ExtractedLeadData,
  productContext: ProductContext,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<GeminiEnrichmentOutput> {
  const prompt = JSON.stringify({
    product: {
      type: productContext.type,
      name: productContext.product_name,
      description: productContext.product_description,
      ideal_customer: productContext.target_description,
      price_point: productContext.price_point,
    },
    lead: {
      url: rawData.url,
      platform: rawData.platform,
      company_name: rawData.company_name,
      contact_name: rawData.contact_name,
      emails: rawData.emails,
      phone: rawData.phone,
      socials: {
        linkedin: rawData.linkedin_url,
        instagram: rawData.instagram_url,
        twitter: rawData.twitter_handle,
        reddit: rawData.reddit_username,
        youtube: rawData.youtube_channel,
        tiktok: rawData.tiktok_handle,
      },
      snippet: rawData.snippet,
    },
  });

  const raw = await callGeminiEnrich(prompt, ENRICH_SYSTEM, apiKey, model);
  const parsed = safeParse<Partial<GeminiEnrichmentOutput>>(raw);
  if (!parsed) throw new Error("Failed to parse Gemini enrichment JSON");

  const size = VALID_SIZES.includes(parsed.estimated_size as EstimatedSize)
    ? (parsed.estimated_size as EstimatedSize)
    : "small";
  const fit = VALID_FITS.includes(parsed.fit_label as FitLabel)
    ? (parsed.fit_label as FitLabel)
    : "Cold";

  return {
    score: clampScore(parsed.score),
    company_name:
      parsed.company_name ?? rawData.company_name ?? "Unknown",
    contact_name: parsed.contact_name ?? rawData.contact_name ?? null,
    email: parsed.email ?? rawData.emails[0] ?? null,
    estimated_size: size,
    fit_label: fit,
    likely_needs: Array.isArray(parsed.likely_needs)
      ? parsed.likely_needs.slice(0, 3).map(String)
      : [],
    pitch_angle: parsed.pitch_angle ?? "",
    red_flags: Array.isArray(parsed.red_flags)
      ? parsed.red_flags.map(String)
      : [],
  };
}

const PERSONA_SYSTEM = `You are a lead generation strategist. Extract structured buyer persona data from user descriptions.
Return ONLY valid JSON matching the requested schema. No markdown, no explanation.`;

export async function extractPersona(
  rawText: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<ExtractedPersona> {
  const prompt = `Extract structured buyer persona data from this description.

Input: "${rawText.replace(/"/g, '\\"')}"

Return JSON with this exact shape:
{
  "titles": ["string"],
  "industries": ["string"],
  "locations": ["string"],
  "company_sizes": ["string"],
  "pain_points": ["string"],
  "keywords": ["string"],
  "budget_signal": "string",
  "b2b": boolean,
  "suggested_channels": ["string"],
  "product_context": "string"
}

Rules:
- suggested_channels must only contain: google, reddit, youtube, instagram, tiktok, twitter, linkedin, web
- Suggest 3-5 channels that fit this persona
- B2B: prioritize linkedin, google, web
- Consumer/creator: prioritize instagram, tiktok, youtube, reddit
- titles should be singular role names (Founder not Founders)
- keywords should be search-query-ready phrases`;

  try {
    const raw = await callGemini(prompt, PERSONA_SYSTEM, apiKey, model);
    const parsed = safeParse<ExtractedPersona>(raw);
    if (!parsed) throw new Error("parse failed");
    const allowed = new Set([
      "google",
      "reddit",
      "youtube",
      "instagram",
      "tiktok",
      "twitter",
      "linkedin",
      "web",
    ]);
    return {
      titles: Array.isArray(parsed.titles) ? parsed.titles.map(String) : [],
      industries: Array.isArray(parsed.industries) ? parsed.industries.map(String) : [],
      locations: Array.isArray(parsed.locations) ? parsed.locations.map(String) : [],
      company_sizes: Array.isArray(parsed.company_sizes) ? parsed.company_sizes.map(String) : [],
      pain_points: Array.isArray(parsed.pain_points) ? parsed.pain_points.map(String) : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
      budget_signal: String(parsed.budget_signal ?? ""),
      b2b: Boolean(parsed.b2b),
      suggested_channels: (Array.isArray(parsed.suggested_channels) ? parsed.suggested_channels : [])
        .map(String)
        .filter((c) => allowed.has(c)),
      product_context: String(parsed.product_context ?? ""),
    };
  } catch {
    return {
      titles: [],
      industries: [],
      locations: [],
      company_sizes: [],
      pain_points: [],
      keywords: rawText.split(/\s+/).slice(0, 5),
      budget_signal: "",
      b2b: true,
      suggested_channels: ["google", "linkedin", "web"],
      product_context: "",
    };
  }
}

import {
  buildWebsiteAnalysisPrompt,
  normalizeWebsiteAnalysis,
  parseWebsiteAnalysisResponse,
  WEBSITE_ANALYSIS_SYSTEM,
} from "@/lib/website-analysis-coerce";

export async function analyzeWebsite(
  content: string,
  url: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<WebsiteAnalysis> {
  const prompt = buildWebsiteAnalysisPrompt(content, url);

  const raw = await callGeminiPriority(prompt, WEBSITE_ANALYSIS_SYSTEM, apiKey, model);
  const result = parseWebsiteAnalysisResponse(raw, url);
  if (!result) {
    throw new Error(
      `Website analysis failed to produce valid ICP. Raw: ${raw.slice(0, 200)}`,
    );
  }
  return result;
}

const TEXT_TO_ANALYSIS_SYSTEM = `You convert free-text buyer descriptions into structured ICP profiles for lead generation.
Return ONLY valid JSON matching the schema. No markdown.`;

export async function textToAnalysis(
  personaText: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<WebsiteAnalysis> {
  const prompt = `Convert this buyer description into a structured ICP profile.

Description: "${personaText.replace(/"/g, '\\"')}"

Return JSON with the same schema as website analysis:
{
  "company_name": "Unknown",
  "product_summary": "Unknown",
  "price_signal": "unknown",
  "market_position": "mid-market",
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
    "budget_range": "unknown"
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
  "email_patterns": { "likely_domains": [], "format": "unknown" },
  "confidence": 70,
  "confidence_reason": "Based on direct description",
  "data_quality_issues": []
}

Rules:
- icp.one_liner describes the BUYER not the product
- intent_signals: 6-8 literal search phrases this buyer would type`;

  const raw = await callGeminiPriority(prompt, TEXT_TO_ANALYSIS_SYSTEM, apiKey, model);
  const parsed = safeParse<Partial<WebsiteAnalysis>>(raw);
  if (!parsed?.icp?.one_liner) {
    throw new Error("textToAnalysis failed to produce valid ICP");
  }
  const normalized = normalizeWebsiteAnalysis(parsed);
  if (normalized.intent_signals.length === 0) {
    normalized.intent_signals = normalized.pain_points.slice(0, 6);
  }
  normalized.confidence = normalized.confidence || 70;
  normalized.confidence_reason = normalized.confidence_reason || "Based on direct description";
  return normalized;
}

const PERSONA_ENRICH_SYSTEM = `You are a senior sales intelligence analyst. Enrich leads for a sales team.
Return ONLY valid JSON. No markdown, no preamble.`;

function intentMatchBonus(bio: string, intentSignals: string[]): number {
  const bioLower = bio.toLowerCase();
  const hit = intentSignals.some((s) => bioLower.includes(s.toLowerCase()));
  return hit ? 15 : 0;
}

export async function enrichLeadWithPersona(
  lead: {
    name: string;
    title: string;
    company: string;
    url: string;
    platform: string;
    bio: string;
    email?: string;
    email_confidence?: EmailConfidence | null;
    email_source?: EmailSource | null;
  },
  analysis: WebsiteAnalysis | ExtractedPersona | null,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<PersonaEnrichmentOutput> {
  const intentSignals =
    analysis && "intent_signals" in analysis
      ? analysis.intent_signals
      : analysis?.keywords ?? [];

  const personaBlock =
    analysis && "icp" in analysis
      ? `- Ideal buyer: ${analysis.icp.one_liner}
- Titles: ${analysis.icp.titles.join(", ")}
- Industries: ${analysis.icp.industries.join(", ")}
- Pain points: ${analysis.pain_points.join(", ")}
- Intent signals: ${analysis.intent_signals.join("; ")}
- Product: ${analysis.product_summary}`
      : analysis
        ? `- Looking for: ${analysis.titles.join(", ")}
- Industries: ${analysis.industries.join(", ")}
- Pain points: ${analysis.pain_points.join(", ")}
- Product context: ${analysis.product_context}`
        : "Not specified";

  try {
    const prompt = `Enrich this lead for a sales team.

Lead data:
- Name: ${lead.name || "Unknown"}
- Title: ${lead.title || "Unknown"}
- Company: ${lead.company || "Unknown"}
- URL: ${lead.url || ""}
- Platform: ${lead.platform}
- Bio/Description: ${lead.bio || ""}
- Email already found: ${lead.email || "none"}

Ideal buyer profile:
${personaBlock}

Return JSON:
{
  "score": number,
  "score_reason": "string",
  "fit_tags": ["string"],
  "pitch_angle": "string",
  "likely_pain": "string",
  "best_contact_channel": "string",
  "estimated_company_size": "string",
  "location_guess": "string",
  "email_guess": "string",
  "email_from_bio": "string",
  "company_domain": "string",
  "contact_name": "string",
  "company_name": "string"
}`;

    const raw = await callGeminiEnrich(prompt, PERSONA_ENRICH_SYSTEM, apiKey, model);
    const parsed = safeParse<Partial<PersonaEnrichmentOutput>>(raw);
    if (!parsed) throw new Error("Failed to parse persona enrichment JSON");

    const resolved = resolveLeadEmail(lead, {
      email_from_bio: String(parsed.email_from_bio ?? ""),
      company_domain: String(parsed.company_domain ?? ""),
      email_guess: String(parsed.email_guess ?? lead.email ?? ""),
    });

    let score = clampScore(parsed.score);
    const eBonus = emailBonus(resolved.email_confidence);
    const iBonus = intentMatchBonus(lead.bio, intentSignals);
    score = Math.min(100, score + eBonus + iBonus);

    const bonusReasons = [
      eBonus > 0 ? `Email available (${resolved.email_confidence} confidence).` : "",
      iBonus > 0 ? "Active buying signal detected in profile." : "",
    ].filter(Boolean);

    return {
      score,
      score_reason: [String(parsed.score_reason ?? ""), ...bonusReasons].filter(Boolean).join(" "),
      fit_tags: Array.isArray(parsed.fit_tags) ? parsed.fit_tags.slice(0, 4).map(String) : [],
      pitch_angle: String(parsed.pitch_angle ?? ""),
      likely_pain: String(parsed.likely_pain ?? ""),
      best_contact_channel: String(parsed.best_contact_channel ?? "email"),
      estimated_company_size: String(parsed.estimated_company_size ?? "unknown"),
      location_guess: String(parsed.location_guess ?? ""),
      email_guess: resolved.email,
      email_from_bio: String(parsed.email_from_bio ?? ""),
      company_domain: resolved.company_domain ?? "",
      email_confidence: resolved.email_confidence,
      email_source: resolved.email_source,
      contact_name: String(parsed.contact_name ?? lead.name ?? "Unknown"),
      company_name: String(parsed.company_name ?? lead.company ?? "Unknown"),
    };
  } catch (err) {
    console.warn(
      "[enrich] Gemini persona enrich failed, using fallback:",
      err instanceof Error ? err.message : err,
    );
    const fallback = await enrichLeadWithPersonaFallback(
      lead,
      analysis && "titles" in analysis ? analysis : null,
      err,
    );
    const resolved = resolveLeadEmail(lead, {
      email_from_bio: fallback.email_guess,
      company_domain: "",
      email_guess: fallback.email_guess,
    });
    let score = fallback.score;
    score = Math.min(
      100,
      score + emailBonus(resolved.email_confidence) + intentMatchBonus(lead.bio, intentSignals),
    );
    return {
      ...fallback,
      score,
      email_guess: resolved.email,
      email_confidence: resolved.email_confidence,
      email_source: resolved.email_source,
      email_from_bio: fallback.email_guess,
      company_domain: resolved.company_domain ?? "",
    };
  }
}

function scoreToFitLabel(score: number): FitLabel {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

export { scoreToFitLabel };

const BLUEPRINT_SYSTEM = `You are a lead generation query planner. Extract structured search parameters from a campaign description.
Return ONLY valid JSON with this exact shape:
{
  "industry": "string",
  "location": "string",
  "keywords": ["string"],
  "titles": ["string"],
  "pain_points": ["string"]
}
Rules:
- keywords must be search-query-ready (3-8 items)
- titles are job roles (Founder, Marketing Director, etc.)
- pain_points are buyer problems (2-4 items)
- location is a city/region/country or empty string if not specified`;

export async function extractScraperBlueprint(
  prompt: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<ScraperBlueprint> {
  const userPrompt = `Campaign target description: "${prompt.replace(/"/g, '\\"')}"`;
  try {
    const raw = await callGemini(userPrompt, BLUEPRINT_SYSTEM, apiKey, model);
    const parsed = safeParse<Partial<ScraperBlueprint>>(raw);
    if (!parsed) throw new Error("parse failed");
    return {
      industry: String(parsed.industry ?? ""),
      location: String(parsed.location ?? ""),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 8) : [],
      titles: Array.isArray(parsed.titles) ? parsed.titles.map(String).slice(0, 5) : [],
      pain_points: Array.isArray(parsed.pain_points)
        ? parsed.pain_points.map(String).slice(0, 4)
        : [],
    };
  } catch {
    const words = prompt.split(/\s+/).filter(Boolean);
    return {
      industry: words.slice(0, 3).join(" "),
      location: "",
      keywords: words.slice(0, 8),
      titles: [],
      pain_points: [],
    };
  }
}

const CANDIDATE_ENRICH_SYSTEM = `You are a B2B/B2C lead qualification analyst.
Clean and score a scraped candidate against a target buyer persona.
Return ONLY a JSON object with EXACTLY this shape:
{
  "clean_company_name": "string",
  "suitability_score": <integer 0-100>,
  "fit_reasoning": "string",
  "pain_point": "string",
  "pitch_angle": "string"
}
Scoring: weigh data completeness, persona match, platform signal strength, and buying intent.
Be conservative — weak or incomplete signals score below 40.`;

export async function enrichCandidateData(
  candidate: RawScrapedLead,
  targetPersona: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<EnrichedLeadAIOutput> {
  try {
    const prompt = JSON.stringify({
      target_persona: targetPersona,
      candidate: {
        name: candidate.name,
        title: candidate.title,
        company: candidate.company,
        email: candidate.email,
        platform: candidate.platform,
        social_links: candidate.social_links,
        raw_bio_text: candidate.raw_bio_text,
      },
    });

    const raw = await callGeminiEnrich(prompt, CANDIDATE_ENRICH_SYSTEM, apiKey, model);
    const parsed = safeParse<Partial<EnrichedLeadAIOutput>>(raw);
    if (!parsed) {
      throw new Error("Failed to parse Gemini candidate enrichment JSON");
    }

    return {
      clean_company_name:
        String(parsed.clean_company_name ?? candidate.company ?? "Unknown").trim() || "Unknown",
      suitability_score: clampScore(parsed.suitability_score),
      fit_reasoning: String(parsed.fit_reasoning ?? "").trim(),
      pain_point: String(parsed.pain_point ?? "").trim(),
      pitch_angle: String(parsed.pitch_angle ?? "").trim(),
    };
  } catch (err) {
    console.warn(
      "[enrich] Gemini candidate enrich failed, using fallback:",
      err instanceof Error ? err.message : err,
    );
    return enrichCandidateDataFallback(candidate, targetPersona, err);
  }
}

const COLD_EMAIL_SYSTEM = `You write concise, personalized B2B/B2C cold outreach emails.
Use the lead's pitch angle and likely needs. Be specific, warm, non-spammy, and
under 120 words. Return ONLY a JSON object: { "subject": <string>, "body": <string> }.
The body is plain text (no markdown), with a clear single call to action.`;

export async function generateColdEmail(
  lead: Lead,
  product: ProductContext,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<ColdEmailOutput> {
  const likelyNeeds = lead.likely_needs
    ? (safeParse<string[]>(lead.likely_needs) ?? [])
    : [];
  const prompt = JSON.stringify({
    product: {
      name: product.product_name,
      description: product.product_description,
      price_point: product.price_point,
    },
    lead: {
      company_name: lead.company_name,
      contact_name: lead.contact_name,
      niche: lead.niche,
      location: lead.location,
      pitch_angle: lead.pitch_angle,
      likely_needs: likelyNeeds,
    },
  });

  const raw = await callGemini(prompt, COLD_EMAIL_SYSTEM, apiKey, model);
  const parsed = safeParse<Partial<ColdEmailOutput>>(raw);
  return {
    subject: parsed?.subject ?? `Quick idea for ${lead.company_name ?? "you"}`,
    body: parsed?.body ?? "",
  };
}
