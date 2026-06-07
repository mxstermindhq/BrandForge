import { buildChannelQuery } from "@/lib/channel-search";
import { callGeminiPriority } from "@/lib/gemini";
import type {
  ClarifyingQuestion,
  ExtractedPersona,
  SearchIntentAnalysis,
} from "@/types";

const ROLE_RE =
  /\b(?:CEO|CTO|CFO|CMO|COO|Founder|Co-Founder|Owner|Director|Manager|Head of [A-Za-z ]+|VP [A-Za-z ]+|President|Freelancer|Consultant|Developer|Designer|Creator|Influencer|Marketer|Sales(?:\s+Manager)?)\b/gi;

const LOCATION_RE =
  /\b(?:in|based in|from|located in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}(?:,\s*[A-Z]{2})?)\b/g;

const KNOWN_LOCATIONS = [
  "London",
  "New York",
  "San Francisco",
  "Los Angeles",
  "Chicago",
  "Toronto",
  "Sydney",
  "Melbourne",
  "Berlin",
  "Paris",
  "Spain",
  "UK",
  "USA",
  "United States",
  "United Kingdom",
  "Europe",
  "Asia",
  "Dubai",
  "Singapore",
  "Austin",
  "Miami",
  "Boston",
  "Seattle",
];

const B2B_SIGNALS =
  /\b(?:saas|b2b|enterprise|startup|agency|consulting|firm|company|business|sales team|decision maker|procurement|hr director|marketing director)\b/i;

const B2C_SIGNALS =
  /\b(?:consumer|creator|influencer|instagram|tiktok|youtube|personal brand|freelance|solo|individual|shopify store|ecommerce store|etsy)\b/i;

const PAIN_SIGNALS = [
  { re: /\b(?:churn|retention|customer success)\b/i, pain: "customer churn and retention" },
  { re: /\b(?:lead gen|lead quality|pipeline)\b/i, pain: "lead generation and pipeline quality" },
  { re: /\b(?:ad roi|paid ads|cac|acquisition cost)\b/i, pain: "advertising ROI and acquisition cost" },
  { re: /\b(?:scheduling|booking|appointments)\b/i, pain: "scheduling and appointment management" },
  { re: /\b(?:hiring|recruiting|talent)\b/i, pain: "hiring and talent acquisition" },
  { re: /\b(?:automation|manual work|time-consuming)\b/i, pain: "manual processes needing automation" },
];

const INDUSTRY_HINTS: { re: RegExp; label: string }[] = [
  { re: /\b(?:saas|software)\b/i, label: "SaaS" },
  { re: /\b(?:e-?commerce|shopify|dtc|retail)\b/i, label: "E-commerce" },
  { re: /\b(?:dental|clinic|healthcare|medical)\b/i, label: "Healthcare" },
  { re: /\b(?:real estate|property)\b/i, label: "Real Estate" },
  { re: /\b(?:agency|marketing agency)\b/i, label: "Marketing Agency" },
  { re: /\b(?:gaming|discord|server)\b/i, label: "Gaming" },
  { re: /\b(?:crypto|web3|blockchain)\b/i, label: "Web3" },
  { re: /\b(?:restaurant|hospitality|hotel)\b/i, label: "Hospitality" },
  { re: /\b(?:legal|law firm)\b/i, label: "Legal" },
  { re: /\b(?:finance|fintech|accounting)\b/i, label: "Finance" },
];

const SIZE_RE =
  /\b(\d[\d,]*\s*[-–]\s*\d[\d,]*|\d+\+?)\s*(?:employees|staff|people|team members|followers|subs|subscribers)\b/i;

function uniqueStrings(values: string[], max = 6): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim());
    if (out.length >= max) break;
  }
  return out;
}

/** Instant, zero-API persona parse — used while Gemini runs. */
export function heuristicPersona(rawText: string): ExtractedPersona {
  const text = rawText.trim();
  const titles = uniqueStrings((text.match(ROLE_RE) ?? []).map((t) => t.trim()));
  const locations: string[] = [];

  for (const m of text.matchAll(LOCATION_RE)) {
    if (m[1]) locations.push(m[1].trim());
  }
  for (const loc of KNOWN_LOCATIONS) {
    if (new RegExp(`\\b${loc}\\b`, "i").test(text)) locations.push(loc);
  }

  const industries = INDUSTRY_HINTS.filter((h) => h.re.test(text)).map((h) => h.label);
  const pain_points = PAIN_SIGNALS.filter((p) => p.re.test(text)).map((p) => p.pain);

  const words = text.split(/\s+/).filter(Boolean);
  const keywords = uniqueStrings(
    [
      ...titles.slice(0, 2),
      ...industries.slice(0, 2),
      ...words.filter((w) => w.length > 4).slice(0, 6),
    ],
    8,
  );

  const b2b =
    B2B_SIGNALS.test(text) ||
    (!B2C_SIGNALS.test(text) && titles.some((t) => /director|ceo|founder|manager|vp/i.test(t)));
  const sizeMatch = text.match(SIZE_RE);

  return {
    titles: titles.length ? titles : ["Decision Maker"],
    industries: industries.length ? industries : keywords.slice(0, 2),
    locations: uniqueStrings(locations, 3),
    company_sizes: sizeMatch ? [sizeMatch[0]] : [],
    pain_points,
    keywords,
    budget_signal: /\$\d|budget|revenue|arr|mrr/i.test(text) ? "mentioned in description" : "",
    b2b,
    suggested_channels: b2b
      ? ["linkedin", "google", "web"]
      : ["instagram", "tiktok", "youtube", "reddit"],
    product_context: text.length > 120 ? `${text.slice(0, 117)}...` : text,
  };
}

function normalizePersona(parsed: Partial<ExtractedPersona>, fallback: ExtractedPersona): ExtractedPersona {
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
    titles: uniqueStrings([...(parsed.titles ?? []), ...fallback.titles].map(String), 5),
    industries: uniqueStrings([...(parsed.industries ?? []), ...fallback.industries].map(String), 4),
    locations: uniqueStrings([...(parsed.locations ?? []), ...fallback.locations].map(String), 3),
    company_sizes: uniqueStrings(
      [...(parsed.company_sizes ?? []), ...fallback.company_sizes].map(String),
      3,
    ),
    pain_points: uniqueStrings(
      [...(parsed.pain_points ?? []), ...fallback.pain_points].map(String),
      4,
    ),
    keywords: uniqueStrings([...(parsed.keywords ?? []), ...fallback.keywords].map(String), 8),
    budget_signal: String(parsed.budget_signal ?? fallback.budget_signal ?? ""),
    b2b: parsed.b2b ?? fallback.b2b,
    suggested_channels: (Array.isArray(parsed.suggested_channels)
      ? parsed.suggested_channels
      : fallback.suggested_channels
    )
      .map(String)
      .filter((c) => allowed.has(c))
      .slice(0, 5),
    product_context: String(parsed.product_context ?? fallback.product_context ?? ""),
  };
}

function buildQuestions(persona: ExtractedPersona, rawText: string): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = [];

  if (persona.titles.length <= 1 && persona.titles[0] === "Decision Maker") {
    questions.push({
      id: "role",
      field: "titles",
      question: "Who exactly are you trying to reach?",
      options: [
        "Founder / CEO",
        "Marketing Director",
        "Sales Manager",
        "Operations Manager",
        "Creator / Influencer",
      ],
      placeholder: "e.g. SaaS founders, dental practice owners",
    });
  }

  if (persona.industries.length === 0 || persona.industries[0] === persona.keywords[0]) {
    questions.push({
      id: "industry",
      field: "industries",
      question: "What industry or niche should we focus on?",
      placeholder: "e.g. B2B SaaS, e-commerce, dental clinics",
    });
  }

  if (persona.locations.length === 0 && !/\b(global|worldwide|anywhere|remote)\b/i.test(rawText)) {
    questions.push({
      id: "location",
      field: "locations",
      question: "Any geographic focus?",
      options: ["United States", "United Kingdom", "Europe", "Global / Remote", "Other"],
      placeholder: "e.g. London, California, DACH region",
    });
  }

  if (persona.pain_points.length === 0 && rawText.length < 80) {
    questions.push({
      id: "pain",
      field: "pain_points",
      question: "What problem does your offer solve for them?",
      placeholder: "e.g. struggling with lead quality, high churn, manual outreach",
    });
  }

  return questions.slice(0, 3);
}

function computeConfidence(persona: ExtractedPersona, rawText: string): number {
  let score = 35;
  if (persona.titles.length && persona.titles[0] !== "Decision Maker") score += 15;
  if (persona.industries.length) score += 15;
  if (persona.locations.length) score += 10;
  if (persona.pain_points.length) score += 15;
  if (persona.keywords.length >= 4) score += 10;
  if (rawText.length > 60) score += 10;
  if (persona.product_context.length > 20) score += 5;
  return Math.min(100, score);
}

function buildIntentSummary(persona: ExtractedPersona): string {
  const role = persona.titles.slice(0, 2).join(", ") || "buyers";
  const industry = persona.industries[0] ?? "your target market";
  const loc = persona.locations[0] ? ` in ${persona.locations[0]}` : "";
  const pain = persona.pain_points[0] ? ` dealing with ${persona.pain_points[0]}` : "";
  return `Finding ${role} in ${industry}${loc}${pain}.`;
}

function previewQueries(persona: ExtractedPersona, channels: string[]): Record<string, string> {
  const preview: Record<string, string> = {};
  for (const ch of channels.slice(0, 6)) {
    preview[ch] = buildChannelQuery(persona, ch);
  }
  return preview;
}

export function buildSearchIntentAnalysis(
  persona: ExtractedPersona,
  rawText: string,
  channels: string[],
  aiExtras?: {
    intent_summary?: string;
    confidence?: number;
    clarifying_questions?: ClarifyingQuestion[];
  },
): SearchIntentAnalysis {
  const confidence = aiExtras?.confidence ?? computeConfidence(persona, rawText);
  const clarifying_questions = aiExtras?.clarifying_questions?.length
    ? aiExtras.clarifying_questions.slice(0, 3)
    : buildQuestions(persona, rawText);

  return {
    persona,
    confidence,
    intent_summary: aiExtras?.intent_summary ?? buildIntentSummary(persona),
    clarifying_questions,
    ready_to_search: confidence >= 70 && clarifying_questions.length === 0,
    search_preview: previewQueries(persona, channels),
  };
}

const INTENT_SYSTEM = `You are an expert B2B/B2C lead generation strategist.
Deeply understand what the user wants to find and extract precise search parameters.
Return ONLY valid JSON with this exact shape:
{
  "intent_summary": "one sentence describing who they want to find and why",
  "confidence": <integer 0-100>,
  "persona": {
    "titles": ["string"],
    "industries": ["string"],
    "locations": ["string"],
    "company_sizes": ["string"],
    "pain_points": ["string"],
    "keywords": ["string"],
    "budget_signal": "string",
    "b2b": boolean,
    "suggested_channels": ["google|reddit|youtube|instagram|tiktok|twitter|linkedin|web"],
    "product_context": "string"
  },
  "clarifying_questions": [
    {
      "id": "string",
      "field": "titles|industries|locations|pain_points|product_context|company_sizes",
      "question": "string",
      "options": ["optional multiple choice"],
      "placeholder": "optional hint"
    }
  ]
}
Rules:
- confidence >= 80 only when role, industry, and intent are crystal clear
- Ask 0-3 clarifying questions ONLY for genuinely missing info that would materially hurt search quality
- keywords must be search-engine ready (specific phrases, not generic words)
- titles: singular role names (Founder not Founders)
- Infer implicit context (e.g. "Shopify stores doing $50k/mo" → e-commerce, DTC, revenue signal)`;

async function analyzeWithGemini(
  rawText: string,
  apiKey: string,
  model?: string,
): Promise<Partial<SearchIntentAnalysis> & { persona?: Partial<ExtractedPersona> }> {
  const prompt = `User search description:\n"""${rawText.replace(/"/g, '\\"')}"""\n\nExtract intent and persona.`;
  const raw = await callGeminiPriority(prompt, INTENT_SYSTEM, apiKey, model);
  const parsed = JSON.parse(
    raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim(),
  ) as Partial<SearchIntentAnalysis> & { persona?: Partial<ExtractedPersona> };
  return parsed;
}

/** Merge user answers into persona before search. */
export function applyClarifyingAnswers(
  persona: ExtractedPersona,
  answers: Record<string, string>,
): ExtractedPersona {
  const next = { ...persona };
  for (const [id, value] of Object.entries(answers)) {
    const v = value.trim();
    if (!v) continue;
    if (id === "role" || id.startsWith("titles")) {
      next.titles = uniqueStrings([v, ...next.titles], 5);
    } else if (id === "industry" || id.startsWith("industries")) {
      next.industries = uniqueStrings([v, ...next.industries], 4);
    } else if (id === "location" || id.startsWith("locations")) {
      next.locations = uniqueStrings([v, ...next.locations], 3);
    } else if (id === "pain" || id.startsWith("pain")) {
      next.pain_points = uniqueStrings([v, ...next.pain_points], 4);
    } else if (id === "product" || id.startsWith("product")) {
      next.product_context = v;
    }
  }
  next.keywords = uniqueStrings([...next.titles, ...next.industries, ...next.keywords], 8);
  return next;
}

/**
 * Analyze search intent — instant heuristic + optional Gemini refine (with timeout).
 */
export async function analyzeSearchIntent(
  rawText: string,
  channels: string[],
  apiKey: string,
  model?: string,
  timeoutMs = 12_000,
): Promise<SearchIntentAnalysis> {
  const heuristic = heuristicPersona(rawText);
  const instant = buildSearchIntentAnalysis(heuristic, rawText, channels);

  if (!apiKey?.trim()) return instant;

  try {
    const ai = await Promise.race([
      analyzeWithGemini(rawText, apiKey, model),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
    ]);

    if (!ai || !ai.persona) return instant;

    const mergedPersona = normalizePersona(ai.persona, heuristic);
    return buildSearchIntentAnalysis(mergedPersona, rawText, channels, {
      intent_summary: ai.intent_summary,
      confidence: typeof ai.confidence === "number" ? ai.confidence : undefined,
      clarifying_questions: Array.isArray(ai.clarifying_questions)
        ? (ai.clarifying_questions as ClarifyingQuestion[])
        : undefined,
    });
  } catch {
    return instant;
  }
}
