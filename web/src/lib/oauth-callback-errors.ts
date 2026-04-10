const STORAGE_KEY = "mx_oauth_callback_error";

export function storeOAuthCallbackError(description: string): void {
  try {
    const d = description.trim().slice(0, 2000);
    sessionStorage.setItem(STORAGE_KEY, d);
  } catch {
    /* ignore */
  }
}

export function takeOAuthCallbackError(): string | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v) sessionStorage.removeItem(STORAGE_KEY);
    return v;
  } catch {
    return null;
  }
}

/** Turn Supabase/Google exchange failures into actionable copy. */
export function explainOAuthExchangeFailure(description: string): string {
  const d = description.toLowerCase();
  if (d.includes("unable to exchange external code") || d.includes("exchange")) {
    return [
      "Google returned a code, but Supabase could not exchange it for a session.",
      "That almost always means the Google Client Secret in Supabase does not match your OAuth client (typo, wrong client, or an old secret).",
      "Fix: Google Cloud Console → Credentials → your Web client → reset Client secret → copy the new secret → Supabase → Authentication → Providers → Google → paste Client Secret → Save. Then try Sign in with Google again.",
      `(Technical: ${description})`,
    ].join("\n\n");
  }
  return description;
}
