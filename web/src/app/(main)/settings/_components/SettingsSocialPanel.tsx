"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { apiMutateJson, getApiOrigin } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useBootstrap } from "@/hooks/useBootstrap";

const PROVIDERS: {
  id: "linkedin" | "x" | "instagram";
  label: string;
  hint: string;
  disabled?: boolean;
}[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    hint: "Connect so we can publish with your consent. Requires w_member_social on your LinkedIn app.",
  },
  {
    id: "x",
    label: "X (Twitter)",
    hint: "OAuth 2.0 with post scope. Use a developer app with read/write as approved by X.",
  },
  {
    id: "instagram",
    label: "Instagram",
    hint: "Meta Business login — coming next.",
    disabled: true,
  },
];

type Conn = {
  id?: string;
  provider?: string;
  display_name?: string | null;
  status?: string;
  token_expires_at?: string | null;
};

function connectionFor(conns: Conn[], id: string): Conn | undefined {
  return conns.find((c) => String(c.provider || "").toLowerCase() === id && c.status === "active");
}

export function SettingsSocialPanel() {
  const { data, reload } = useBootstrap();
  const connections = useMemo(() => ((data?.socialConnections as Conn[]) ?? []) as Conn[], [data?.socialConnections]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data: s } = await supabase.auth.getSession();
    return s.session?.access_token ?? null;
  }, []);

  async function connect(provider: string) {
    setMsg(null);
    setBusy(provider);
    try {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      const out = await apiMutateJson<{ authorizationUrl?: string }>(
        "/api/social/oauth/start",
        "POST",
        { provider },
        t,
      );
      if (out.authorizationUrl) {
        window.location.href = out.authorizationUrl;
        return;
      }
      throw new Error("No authorization URL returned.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Connect failed");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(provider: string) {
    setMsg(null);
    setBusy(`drop-${provider}`);
    try {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      await apiMutateJson(`/api/social-connections/${encodeURIComponent(provider)}`, "DELETE", {}, t);
      await reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setBusy(null);
    }
  }

  const callbackUrl = `${getApiOrigin()}/api/social/oauth/callback`;

  return (
    <section className="surface-card border-outline-variant/20 space-y-6 rounded-2xl border p-6 md:p-8">
      <div>
        <h3 className="font-headline text-on-surface text-lg font-bold">Social media connections</h3>
        <p className="text-on-surface-variant mt-2 text-sm font-light leading-relaxed">
          Link accounts you want BrandForge to publish to. We only post when you explicitly schedule or approve
          content — credentials stay on the server and are never shown in the browser.
        </p>
      </div>

      <div className="border-outline-variant/15 rounded-xl border bg-surface-container-low/40 p-4 text-xs font-mono text-on-surface-variant break-all">
        OAuth redirect (add this exact URL to each developer app):{" "}
        <span className="text-secondary">{callbackUrl}</span>
      </div>

      <p className="text-on-surface-variant text-xs font-light leading-relaxed">
        Environment: <code className="text-on-surface bg-surface-container-high rounded px-1">SOCIAL_LINKEDIN_CLIENT_ID</code>,
        <code className="text-on-surface bg-surface-container-high mx-1 rounded px-1">SOCIAL_LINKEDIN_CLIENT_SECRET</code>,
        <code className="text-on-surface bg-surface-container-high rounded px-1">SOCIAL_X_CLIENT_ID</code>,
        <code className="text-on-surface bg-surface-container-high mx-1 rounded px-1">SOCIAL_X_CLIENT_SECRET</code>, and{" "}
        <code className="text-on-surface bg-surface-container-high rounded px-1">WEB_APP_ORIGIN</code> (Next app URL for
        return to settings after OAuth).
      </p>

      {msg ? (
        <p className="text-error text-sm" role="alert">
          {msg}
        </p>
      ) : null}

      <ul className="space-y-4">
        {PROVIDERS.map((p) => {
          const c = connectionFor(connections, p.id);
          const loading = busy === p.id || busy === `drop-${p.id}`;
          return (
            <li
              key={p.id}
              className="border-outline-variant/20 flex flex-col gap-3 rounded-xl border bg-surface-container-low/30 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="font-headline text-on-surface font-bold">{p.label}</p>
                <p className="text-on-surface-variant mt-1 text-xs font-light leading-relaxed">{p.hint}</p>
                {c ? (
                  <p className="text-secondary mt-2 text-xs font-medium">
                    Connected{c.display_name ? ` · ${c.display_name}` : ""}
                    {c.token_expires_at ? ` · token refresh by ${new Date(c.token_expires_at).toLocaleDateString()}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                {p.disabled ? (
                  <span className="text-on-surface-variant font-headline rounded-lg border border-outline-variant/30 px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
                    Soon
                  </span>
                ) : c ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void disconnect(p.id)}
                    className="border-outline-variant/40 text-on-surface-variant hover:border-error/50 hover:text-error font-headline rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading ? "…" : "Disconnect"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void connect(p.id)}
                    className="bg-primary text-on-primary font-headline rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading ? "…" : "Connect"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-on-surface-variant text-xs font-light leading-relaxed">
        After connecting, use{" "}
        <Link href="/marketing" className="text-secondary font-bold hover:underline">
          Marketing
        </Link>{" "}
        to draft posts. Automated posting APIs can target these channels per user once queue workers are enabled.
      </p>
    </section>
  );
}
