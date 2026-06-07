import type {
  ColdEmailOutput,
  EstimatedSize,
  ExtractedLeadData,
  ExtractedPersona,
  FitLabel,
  GeminiEnrichmentOutput,
  Lead,
  PersonaEnrichmentOutput,
  ProductContext,
} from "@/types";
import { DEFAULT_GEMINI_MODEL, GEMINI_TIMEOUT_MS } from "@/lib/constants";

function geminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

const VALID_SIZES: EstimatedSize[] = ["solo", "small", "medium", "enterprise"];
const VALID_FITS: FitLabel[] = ["Hot", "Warm", "Cold"];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls Gemini 1.5 Flash via fetch only (no SDK).
 * - 15s AbortController timeout
 * - responseMimeType: application/json forces clean JSON (no markdown fences)
 * - 429 → wait 4000ms, retry once; 503 → wait 2000ms, retry once
 */
export async function callGemini(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
  attempt = 0,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  // An empty-string env var (GEMINI_MODEL=) bypasses the default param, so
  // coerce any blank value back to the default model.
  const resolvedModel = model && model.trim() ? model.trim() : DEFAULT_GEMINI_MODEL;

  try {
    const res = await fetch(`${geminiUrl(resolvedModel)}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (res.status === 429 && attempt === 0) {
      await delay(4000);
      return callGemini(prompt, systemInstruction, apiKey, model, attempt + 1);
    }
    if (res.status === 503 && attempt === 0) {
      await delay(2000);
      return callGemini(prompt, systemInstruction, apiKey, model, attempt + 1);
    }
    if (!res.ok) {
      throw new Error(`Gemini error ${res.status}`);
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

  const raw = await callGemini(prompt, ENRICH_SYSTEM, apiKey, model);
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

const PERSONA_ENRICH_SYSTEM = `You are a senior sales intelligence analyst. Enrich leads for a sales team.
Return ONLY valid JSON. No markdown, no preamble.`;

export async function enrichLeadWithPersona(
  lead: {
    name: string;
    title: string;
    company: string;
    url: string;
    platform: string;
    bio: string;
    email?: string;
  },
  persona: ExtractedPersona | null,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
): Promise<PersonaEnrichmentOutput> {
  const personaBlock = persona
    ? `- Looking for: ${persona.titles.join(", ")}
- Industries: ${persona.industries.join(", ")}
- Pain points: ${persona.pain_points.join(", ")}
- Product context: ${persona.product_context}`
    : "Not specified";

  const prompt = `Enrich this lead for a sales team.

Lead data:
- Name: ${lead.name || "Unknown"}
- Title: ${lead.title || "Unknown"}
- Company: ${lead.company || "Unknown"}
- URL: ${lead.url || ""}
- Platform: ${lead.platform}
- Bio/Description: ${lead.bio || ""}

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
  "contact_name": "string",
  "company_name": "string"
}`;

  const raw = await callGemini(prompt, PERSONA_ENRICH_SYSTEM, apiKey, model);
  const parsed = safeParse<Partial<PersonaEnrichmentOutput>>(raw);
  if (!parsed) throw new Error("Failed to parse persona enrichment JSON");

  return {
    score: clampScore(parsed.score),
    score_reason: String(parsed.score_reason ?? ""),
    fit_tags: Array.isArray(parsed.fit_tags) ? parsed.fit_tags.slice(0, 4).map(String) : [],
    pitch_angle: String(parsed.pitch_angle ?? ""),
    likely_pain: String(parsed.likely_pain ?? ""),
    best_contact_channel: String(parsed.best_contact_channel ?? "email"),
    estimated_company_size: String(parsed.estimated_company_size ?? "unknown"),
    location_guess: String(parsed.location_guess ?? ""),
    email_guess: String(parsed.email_guess ?? lead.email ?? ""),
    contact_name: String(parsed.contact_name ?? lead.name ?? "Unknown"),
    company_name: String(parsed.company_name ?? lead.company ?? "Unknown"),
  };
}

function scoreToFitLabel(score: number): FitLabel {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

export { scoreToFitLabel };

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
