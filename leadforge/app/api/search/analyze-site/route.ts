import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";
import { VALID_SEARCH_CHANNELS } from "@/lib/constants";
import { analyzeWebsiteForBuyers, normalizeSiteUrl } from "@/lib/site-analyzer";
import { fail, handleError, ok } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_CHANNELS = VALID_SEARCH_CHANNELS as readonly string[];

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const env = getEnv();
    await requireAuth(env.DB);

    const body = (await req.json().catch(() => null)) as {
      site_url?: string;
      channels?: string[];
    } | null;

    const site_url = body?.site_url?.trim() ?? "";
    if (!site_url) {
      return fail(400, "site_url is required");
    }

    const channels = (body?.channels ?? ["google", "linkedin", "web"]).filter((c) =>
      VALID_CHANNELS.includes(c),
    );
    if (channels.length === 0) {
      return fail(400, "Select at least one channel");
    }

    normalizeSiteUrl(site_url);

    const analysis = await analyzeWebsiteForBuyers(
      site_url,
      channels,
      env.GEMINI_API_KEY,
      env.GEMINI_MODEL,
    );

    return ok(analysis);
  } catch (err) {
    if (err instanceof Error && err.message.includes("URL")) {
      return fail(400, err.message);
    }
    if (err instanceof Error && err.message.includes("website")) {
      return fail(422, err.message);
    }
    return handleError(err);
  }
}
