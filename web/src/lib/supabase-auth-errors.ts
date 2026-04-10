/** Human-readable copy when GoTrue rejects OAuth (e.g. provider disabled in Dashboard). */
export function formatOAuthProviderError(err: unknown, providerLabel = "Google"): string {
  const raw = err instanceof Error ? err.message : String(err);
  let msg = raw;
  let errorCode: string | undefined;
  try {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{")) {
      const j = JSON.parse(trimmed) as { msg?: string; error_code?: string; message?: string };
      msg = j.msg || j.message || raw;
      errorCode = j.error_code;
    }
  } catch {
    /* use raw */
  }

  const looksDisabled =
    errorCode === "validation_failed" ||
    /provider is not enabled|unsupported provider/i.test(msg);

  if (!looksDisabled) return msg;

  let host: string | null = null;
  let projectRef: string | null = null;
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (u) {
      const parsed = new URL(u);
      host = parsed.host;
      const sub = parsed.hostname.replace(/\.supabase\.co$/i, "");
      if (sub && !sub.includes(".")) projectRef = sub;
    }
  } catch {
    /* ignore */
  }

  const callback = projectRef
    ? `https://${projectRef}.supabase.co/auth/v1/callback`
    : "https://<project-ref>.supabase.co/auth/v1/callback";

  return [
    `${providerLabel} is disabled or incomplete for your Supabase Auth project.`,
    host ? `This app points at ${host} — enable ${providerLabel} in that exact project (not a different Supabase project).` : null,
    `Supabase → Authentication → Providers → ${providerLabel}: switch ON, paste Client ID and Client Secret, click Save.`,
    `Google Cloud Console → APIs & Credentials → OAuth 2.0 Client (Web) → Authorized redirect URIs must include: ${callback}`,
    "After saving in Supabase, wait a few seconds and try again (hard refresh).",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function supabaseProjectHint(): { host: string | null; projectRef: string | null } {
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!u) return { host: null, projectRef: null };
    const parsed = new URL(u);
    const host = parsed.host;
    const sub = parsed.hostname.replace(/\.supabase\.co$/i, "");
    const projectRef = sub && !sub.includes(".") ? sub : null;
    return { host, projectRef };
  } catch {
    return { host: null, projectRef: null };
  }
}
