import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

function supabaseKeys(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
  }
  return { url, anonKey };
}

/** Cookie-backed Supabase client for Route Handlers (reads + writes session cookies). */
export async function createSupabaseRouteClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseKeys();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll can fail when called from a Server Component context.
        }
      },
    },
  });
}

/** Cookie-backed Supabase client for Middleware (reads + writes refreshed cookies). */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
): SupabaseClient {
  const { url, anonKey } = supabaseKeys();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });
}

/** Cookie-backed Supabase client for auth routes that set/clear the session. */
export function createSupabaseAuthClient(
  request: NextRequest,
  response: NextResponse,
): SupabaseClient {
  const { url, anonKey } = supabaseKeys();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
}
