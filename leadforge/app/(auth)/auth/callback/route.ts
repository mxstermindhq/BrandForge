import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ensureUserProfile } from "@/lib/auth-provision";
import { getEnv } from "@/lib/cloudflare";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=oauth_missing_code", origin));
  }

  const supabase = await createSupabaseRouteClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/auth/login?error=oauth_failed", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login?error=oauth_failed", origin));
  }

  try {
    const env = getEnv();
    await ensureUserProfile(env.DB, user, env.ADMIN_EMAIL);
  } catch {
    return NextResponse.redirect(new URL("/auth/login?error=oauth_profile_failed", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
