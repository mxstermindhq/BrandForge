/**
 * Public site origin for Supabase OAuth and email magic links (`redirectTo` / `emailRedirectTo`).
 * In production, set NEXT_PUBLIC_APP_URL to your Worker URL so links are not replaced by Supabase
 * “Site URL” (often still http://localhost:3000).
 */
export function publicSiteOrigin(): string {
  const fromEnv = String(process.env.NEXT_PUBLIC_APP_URL ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/+$/, "");
  }
  return "";
}

export function authCallbackAbsoluteUrl(): string {
  const origin = publicSiteOrigin();
  if (!origin) return "";
  return `${origin}/auth/callback`;
}
