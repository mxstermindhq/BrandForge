import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";
import { VALID_SEARCH_CHANNELS } from "@/lib/constants";
import {
  analyzeSearchIntent,
  applyClarifyingAnswers,
  buildSearchIntentAnalysis,
  heuristicPersona,
} from "@/lib/search-intent";
import type { ExtractedPersona, SearchIntentAnalysis } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const VALID_CHANNELS = VALID_SEARCH_CHANNELS as readonly string[];

export async function POST(req: NextRequest): Promise<Response> {
  const env = getEnv();
  try {
    await requireAuth(env.DB);
  } catch {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    persona_text?: string;
    channels?: string[];
    clarifying_answers?: Record<string, string>;
    extracted_persona?: ExtractedPersona;
  } | null;

  const persona_text = body?.persona_text?.trim() ?? "";
  if (!persona_text) {
    return Response.json({ success: false, error: "persona_text is required" }, { status: 400 });
  }

  const channels = (body?.channels ?? []).filter((c) => VALID_CHANNELS.includes(c));
  if (channels.length === 0) {
    return Response.json({ success: false, error: "Select at least one channel" }, { status: 400 });
  }

  let analysis: SearchIntentAnalysis;

  if (body?.extracted_persona && body?.clarifying_answers) {
    const refined = applyClarifyingAnswers(body.extracted_persona, body.clarifying_answers);
    analysis = buildSearchIntentAnalysis(refined, persona_text, channels);
    analysis.ready_to_search = true;
    analysis.clarifying_questions = [];
    analysis.confidence = Math.min(100, analysis.confidence + 15);
  } else {
    // Return heuristic instantly in parallel with AI — client gets fast first paint via stream,
    // but this endpoint waits for AI refine (max 12s) for the confirm step.
    analysis = await analyzeSearchIntent(
      persona_text,
      channels,
      env.GEMINI_API_KEY,
      env.GEMINI_MODEL,
    );
  }

  return Response.json({ success: true, data: analysis });
}

/** Lightweight instant-only analyze (no Gemini wait). */
export async function GET(req: NextRequest): Promise<Response> {
  const env = getEnv();
  try {
    await requireAuth(env.DB);
  } catch {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const text = url.searchParams.get("q")?.trim() ?? "";
  const channels = (url.searchParams.get("channels") ?? "google,linkedin,web")
    .split(",")
    .filter((c) => VALID_CHANNELS.includes(c));

  if (!text) {
    return Response.json({ success: false, error: "q is required" }, { status: 400 });
  }

  const persona = heuristicPersona(text);
  const analysis = buildSearchIntentAnalysis(persona, text, channels);
  return Response.json({ success: true, data: analysis });
}
