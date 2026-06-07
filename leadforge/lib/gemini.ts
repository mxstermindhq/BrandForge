import type {
  ColdEmailOutput,
  EstimatedSize,
  ExtractedLeadData,
  FitLabel,
  GeminiEnrichmentOutput,
  Lead,
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

  try {
    const res = await fetch(`${geminiUrl(model)}?key=${apiKey}`, {
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
