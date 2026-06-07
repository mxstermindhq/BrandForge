/**
 * Enrichment fallback chain when Gemini quota/rate limits are hit:
 *   1. Groq (free tier, OpenAI-compatible) — if GROQ_API_KEY is set
 *   2. Heuristic scorer — always available, zero API cost
 */

import type {
  EnrichedLeadAIOutput,
  ExtractedPersona,
  PersonaEnrichmentOutput,
  RawScrapedLead,
  WebsiteAnalysis,
} from "@/types";
import {
  buildWebsiteAnalysisPrompt,
  parseWebsiteAnalysisResponse,
  WEBSITE_ANALYSIS_SYSTEM,
} from "@/lib/website-analysis-coerce";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_TIMEOUT_MS = 20_000;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

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

function readGroqKey(): string {
  return process.env.GROQ_API_KEY?.trim() ?? "";
}

function readGroqModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}

async function callGroqJson(
  prompt: string,
  systemInstruction: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `${systemInstruction}\nReturn ONLY valid JSON. No markdown fences.`,
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.35,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Groq error ${res.status}${body ? `: ${body.slice(0, 120)}` : ""}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new Error("Groq returned empty response");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function countTermHits(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  return terms.filter((t) => t.trim() && lower.includes(t.toLowerCase())).length;
}

/** Rule-based enrichment — no API, used as last resort. */
export function heuristicPersonaEnrichment(
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
): PersonaEnrichmentOutput {
  const blob = `${lead.name} ${lead.title} ${lead.company} ${lead.bio} ${lead.url}`;
  let score = 28;
  const fit_tags: string[] = [];

  if (lead.email?.trim()) {
    score += 14;
    fit_tags.push("Has email");
  }
  if (lead.company?.trim() && lead.company !== "Unknown") {
    score += 8;
    fit_tags.push("Company identified");
  }
  if (lead.title?.trim()) score += 6;

  const pain = persona?.pain_points[0] ?? "growth and efficiency challenges";
  const targetRole = persona?.titles[0] ?? "decision maker";
  const industry = persona?.industries[0] ?? "target market";
  let score_reason = "Heuristic scoring (Gemini quota exceeded)";

  if (persona) {
    const titleHits = countTermHits(blob, persona.titles);
    const industryHits = countTermHits(blob, persona.industries);
    const keywordHits = countTermHits(blob, persona.keywords.slice(0, 6));
    const locationHits = countTermHits(blob, persona.locations);

    score += titleHits * 14;
    score += industryHits * 10;
    score += keywordHits * 4;
    score += locationHits * 6;

    if (titleHits) fit_tags.push("Role match");
    if (industryHits) fit_tags.push("Industry match");
    if (locationHits) fit_tags.push("Location match");
    if (persona.b2b && lead.platform === "linkedin") {
      score += 8;
      fit_tags.push("B2B channel");
    }
    if (!persona.b2b && ["instagram", "tiktok", "youtube"].includes(lead.platform)) {
      score += 8;
      fit_tags.push("Creator channel");
    }

    score_reason = `Heuristic: ${titleHits} role, ${industryHits} industry, ${keywordHits} keyword signals`;
  }

  const company = lead.company?.trim() || lead.name || "Unknown";
  const pitch_angle = persona?.product_context
    ? `Position ${persona.product_context.slice(0, 90)} as a fix for ${pain} — tailored for ${targetRole} at ${company}.`
    : `Offer a concrete solution for ${pain} to ${targetRole} in ${industry}.`;

  const channelMap: Record<string, string> = {
    linkedin: "linkedin",
    twitter: "twitter",
    instagram: "instagram",
    reddit: "reddit",
  };

  return {
    score: clampScore(score),
    score_reason,
    fit_tags: fit_tags.slice(0, 4),
    pitch_angle,
    likely_pain: pain,
    best_contact_channel: channelMap[lead.platform] ?? (lead.email ? "email" : "linkedin"),
    estimated_company_size: persona?.company_sizes[0] ?? "unknown",
    location_guess: persona?.locations[0] ?? "",
    email_guess: lead.email ?? "",
    email_from_bio: lead.email ?? "",
    company_domain: "",
    email_confidence: lead.email ? "medium" : null,
    email_source: lead.email ? "pattern" : null,
    contact_name: lead.name || "Unknown",
    company_name: company,
  };
}

export function heuristicCandidateEnrichment(
  candidate: RawScrapedLead,
  targetPersona: string,
): EnrichedLeadAIOutput {
  const blob = `${candidate.name} ${candidate.title} ${candidate.company} ${candidate.raw_bio_text} ${targetPersona}`;
  let score = 30;
  if (candidate.email) score += 15;
  if (candidate.company) score += 10;
  if (candidate.title) score += 8;

  const personaWords = targetPersona.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  const hits = personaWords.filter((w) => blob.toLowerCase().includes(w)).length;
  score += Math.min(25, hits * 3);

  const pain = "operational bottlenecks mentioned in target profile";
  return {
    clean_company_name: candidate.company?.trim() || "Unknown",
    suitability_score: clampScore(score),
    fit_reasoning: `Heuristic match (${hits} keyword overlaps with persona)`,
    pain_point: pain,
    pitch_angle: `Help ${candidate.company || candidate.name} address ${pain} — strong ${candidate.platform} signal.`,
  };
}

const GROQ_PERSONA_ENRICH_SYSTEM = `You are a senior sales intelligence analyst. Enrich leads for a sales team.
Return ONLY valid JSON matching the requested schema.`;

export async function groqPersonaEnrichment(
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
  model: string = DEFAULT_GROQ_MODEL,
): Promise<PersonaEnrichmentOutput> {
  const personaBlock = persona
    ? JSON.stringify({
        titles: persona.titles,
        industries: persona.industries,
        pain_points: persona.pain_points,
        product_context: persona.product_context,
      })
    : "{}";

  const prompt = `Enrich this lead.

Lead: ${JSON.stringify(lead)}
Ideal buyer: ${personaBlock}

Return JSON:
{"score":number,"score_reason":"string","fit_tags":["string"],"pitch_angle":"string","likely_pain":"string","best_contact_channel":"string","estimated_company_size":"string","location_guess":"string","email_guess":"string","contact_name":"string","company_name":"string"}`;

  const raw = await callGroqJson(prompt, GROQ_PERSONA_ENRICH_SYSTEM, apiKey, model);
  const parsed = safeParse<Partial<PersonaEnrichmentOutput>>(raw);
  if (!parsed) throw new Error("Failed to parse Groq enrichment JSON");

  return {
    score: clampScore(Number(parsed.score ?? 0)),
    score_reason: String(parsed.score_reason ?? "Groq enrichment"),
    fit_tags: Array.isArray(parsed.fit_tags) ? parsed.fit_tags.slice(0, 4).map(String) : [],
    pitch_angle: String(parsed.pitch_angle ?? ""),
    likely_pain: String(parsed.likely_pain ?? ""),
    best_contact_channel: String(parsed.best_contact_channel ?? "email"),
    estimated_company_size: String(parsed.estimated_company_size ?? "unknown"),
    location_guess: String(parsed.location_guess ?? ""),
    email_guess: String(parsed.email_guess ?? lead.email ?? ""),
    email_from_bio: String(parsed.email_guess ?? lead.email ?? ""),
    company_domain: "",
    email_confidence: lead.email ? "medium" : null,
    email_source: lead.email ? "pattern" : null,
    contact_name: String(parsed.contact_name ?? lead.name ?? "Unknown"),
    company_name: String(parsed.company_name ?? lead.company ?? "Unknown"),
  };
}

const GROQ_CANDIDATE_SYSTEM = `You are a B2B/B2C lead qualification analyst. Return ONLY valid JSON.`;

export async function groqCandidateEnrichment(
  candidate: RawScrapedLead,
  targetPersona: string,
  apiKey: string,
  model: string = DEFAULT_GROQ_MODEL,
): Promise<EnrichedLeadAIOutput> {
  const prompt = `Score this candidate against the persona.

Persona: ${targetPersona}
Candidate: ${JSON.stringify(candidate)}

Return JSON:
{"clean_company_name":"string","suitability_score":number,"fit_reasoning":"string","pain_point":"string","pitch_angle":"string"}`;

  const raw = await callGroqJson(prompt, GROQ_CANDIDATE_SYSTEM, apiKey, model);
  const parsed = safeParse<Partial<EnrichedLeadAIOutput>>(raw);
  if (!parsed) throw new Error("Failed to parse Groq candidate JSON");

  return {
    clean_company_name:
      String(parsed.clean_company_name ?? candidate.company ?? "Unknown").trim() || "Unknown",
    suitability_score: clampScore(Number(parsed.suitability_score ?? 0)),
    fit_reasoning: String(parsed.fit_reasoning ?? "Groq enrichment"),
    pain_point: String(parsed.pain_point ?? ""),
    pitch_angle: String(parsed.pitch_angle ?? ""),
  };
}

/** Groq fallback for website ICP analysis when Gemini fails or is unavailable. */
export async function groqWebsiteAnalysis(
  content: string,
  url: string,
  apiKey: string,
  model: string = DEFAULT_GROQ_MODEL,
): Promise<WebsiteAnalysis> {
  const prompt = buildWebsiteAnalysisPrompt(content, url);
  const raw = await callGroqJson(prompt, WEBSITE_ANALYSIS_SYSTEM, apiKey, model);
  const result = parseWebsiteAnalysisResponse(raw, url);
  if (!result) {
    throw new Error("Groq website analysis returned invalid ICP JSON");
  }
  return {
    ...result,
    confidence_reason: `[Groq fallback] ${result.confidence_reason}`,
  };
}

/** Gemini failed → try Groq → heuristic. */
export async function enrichLeadWithPersonaFallback(
  lead: Parameters<typeof heuristicPersonaEnrichment>[0],
  persona: ExtractedPersona | null,
  originalError: unknown,
): Promise<PersonaEnrichmentOutput> {
  const groqKey = readGroqKey();
  const groqModel = readGroqModel();

  if (groqKey) {
    try {
      const result = await groqPersonaEnrichment(lead, persona, groqKey, groqModel);
      return { ...result, score_reason: `[Groq fallback] ${result.score_reason}` };
    } catch (groqErr) {
      console.warn(
        "[enrich] Groq fallback failed:",
        groqErr instanceof Error ? groqErr.message : groqErr,
      );
    }
  }

  const heuristic = heuristicPersonaEnrichment(lead, persona);
  const reason =
    originalError instanceof Error ? originalError.message.slice(0, 80) : "Gemini unavailable";
  return {
    ...heuristic,
    score_reason: `[Heuristic fallback] ${heuristic.score_reason} (${reason})`,
  };
}

export async function enrichCandidateDataFallback(
  candidate: RawScrapedLead,
  targetPersona: string,
  originalError: unknown,
): Promise<EnrichedLeadAIOutput> {
  const groqKey = readGroqKey();
  const groqModel = readGroqModel();

  if (groqKey) {
    try {
      const result = await groqCandidateEnrichment(candidate, targetPersona, groqKey, groqModel);
      return { ...result, fit_reasoning: `[Groq fallback] ${result.fit_reasoning}` };
    } catch (groqErr) {
      console.warn(
        "[enrich] Groq candidate fallback failed:",
        groqErr instanceof Error ? groqErr.message : groqErr,
      );
    }
  }

  const heuristic = heuristicCandidateEnrichment(candidate, targetPersona);
  const reason =
    originalError instanceof Error ? originalError.message.slice(0, 80) : "Gemini unavailable";
  return {
    ...heuristic,
    fit_reasoning: `[Heuristic fallback] ${heuristic.fit_reasoning} (${reason})`,
  };
}
