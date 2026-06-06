import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import {
  clearSessionCookieHeader,
  destroySession,
  readSessionCookie,
} from "@/lib/auth";
import { handleError, jsonResponse } from "@/lib/http";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const env = getEnv();
    const token = readSessionCookie(request);
    if (token) await destroySession(env.SESSIONS, env.JWT_SECRET, token);
    return jsonResponse({ success: true, data: { ok: true } }, 200, {
      "Set-Cookie": clearSessionCookieHeader(),
    });
  } catch (err) {
    return handleError(err);
  }
}
