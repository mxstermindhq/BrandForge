"use client";

/** Avoids a static dependency from every client screen on `@supabase/supabase-js` in server traces. */
export async function getAccessTokenFromBrowserSession(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const { getSupabaseBrowser } = await import("@/lib/supabase/browser");
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
