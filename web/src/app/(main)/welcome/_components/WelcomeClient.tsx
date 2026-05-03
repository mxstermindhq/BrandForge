"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { PROFESSIONAL_TITLES } from "@/config/professional-titles";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { cn } from "@/lib/cn";

const fieldLabel = "mb-1.5 block text-xs font-medium text-on-surface";
const control = cn(
  "input-base w-full min-h-[48px] rounded-xl px-3.5 py-2.5",
  "placeholder:text-on-surface-variant/50",
);

export function WelcomeClient() {
  const router = useRouter();
  const { session, authReady, accessToken, signOut } = useAuth();
  const { me, loading: meLoading, reload: reloadMe } = useAuthMe();
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState<string>(PROFESSIONAL_TITLES[0]!);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [unameHint, setUnameHint] = useState<string | null>(null);
  const [switchBusy, setSwitchBusy] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!session) router.replace("/login");
  }, [authReady, session, router]);

  useEffect(() => {
    if (!meLoading && me && me.pendingOnboarding === false) {
      router.replace("/");
    }
  }, [me, meLoading, router]);

  useEffect(() => {
    if (!authReady || !session || !accessToken || meLoading || me?.pendingOnboarding !== true) return;
    void apiMutateJson("/api/activation", "POST", { step: "welcome_view" }, accessToken).catch(() => {});
  }, [authReady, session, accessToken, meLoading, me?.pendingOnboarding]);

  useEffect(() => {
    const t = username.trim().replace(/^@+/, "").toLowerCase();
    if (t.length < 2) {
      setUnameHint(null);
      return;
    }
    const id = window.setTimeout(() => {
      void (async () => {
        try {
          const r = await apiGetJson<{ available?: boolean; reason?: string }>(
            `/api/profiles/username-available?username=${encodeURIComponent(t)}`,
            accessToken ?? null,
          );
          if (r.available) setUnameHint("Available");
          else setUnameHint(r.reason === "taken" ? "Taken" : "Invalid");
        } catch {
          setUnameHint(null);
        }
      })();
    }, 350);
    return () => clearTimeout(id);
  }, [username, accessToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const u = username.trim().replace(/^@+/, "").toLowerCase();
    if (u.length < 2) {
      setErr("Username must be at least 2 characters.");
      return;
    }
    if (password || password2) {
      if (password.length < 8) {
        setErr("Password must be at least 8 characters (or leave both blank to keep your current sign-in method).");
        return;
      }
      if (password !== password2) {
        setErr("Passwords do not match.");
        return;
      }
    }
    setBusy(true);
    try {
      if (accessToken) {
        void apiMutateJson("/api/activation", "POST", { step: "welcome_submit" }, accessToken).catch(() => {});
      }
      if (password) {
        const supabase = getSupabaseBrowser();
        if (!supabase) throw new Error("Auth not available.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }
      const t = accessToken;
      if (!t) throw new Error("Sign in again.");
      await apiMutateJson("/api/onboarding/complete", "POST", { username: u, headline }, t);
      void apiMutateJson("/api/activation", "POST", { step: "welcome_success", meta: { username: u } }, t).catch(
        () => {},
      );
      await reloadMe();
      router.replace("/dashboard");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function onSignOutAndSwitch() {
    setErr(null);
    setSwitchBusy(true);
    try {
      await signOut();
      router.replace("/login");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not sign out");
    } finally {
      setSwitchBusy(false);
    }
  }

  if (!authReady || !session || meLoading || !me) {
    return <PageRouteLoading title="Welcome" subtitle="Preparing your account." />;
  }

  if (me.pendingOnboarding === false) {
    return <PageRouteLoading title="Welcome" subtitle="Taking you home…" />;
  }

  if (me.pendingOnboarding !== true) {
    return <PageRouteLoading title="Welcome" subtitle="Preparing your account." />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-on-surface md:py-16">
      <div className="mx-auto max-w-lg">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Setup</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">Finish your account</h1>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Choose your public{" "}
          <strong className="font-semibold text-on-surface">username</strong>, your professional title, and optionally
          set a password for email sign-in. You can change these later in Settings.
        </p>

        <form
          onSubmit={onSubmit}
          className="surface-card mt-8 space-y-5 rounded-2xl border border-outline-variant/40 p-6 shadow-sm md:p-8"
        >
          {err ? (
            <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error" role="alert">
              {err}
            </p>
          ) : null}

          <div>
            <label htmlFor="welcome-user" className={fieldLabel}>
              Username
            </label>
            <input
              id="welcome-user"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              autoComplete="username"
              placeholder="yourhandle"
              className={control}
            />
            {unameHint ? (
              <p
                className={`mt-1 text-xs font-medium ${unameHint === "Available" ? "text-emerald-600 dark:text-emerald-400" : "text-error"}`}
                role="status"
              >
                {unameHint}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-on-surface-variant">Lowercase letters, numbers, underscores, hyphens.</p>
            )}
          </div>

          <div>
            <label htmlFor="welcome-title" className={fieldLabel}>
              Professional title
            </label>
            <select
              id="welcome-title"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className={control}
            >
              {PROFESSIONAL_TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="welcome-pass" className={fieldLabel}>
              Password <span className="font-normal normal-case text-on-surface-variant">(optional)</span>
            </label>
            <input
              id="welcome-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className={control}
            />
          </div>

          <div>
            <label htmlFor="welcome-pass2" className={fieldLabel}>
              Confirm password
            </label>
            <input
              id="welcome-pass2"
              type="password"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={control}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="bg-primary text-on-primary font-headline w-full min-h-[52px] rounded-xl text-sm font-bold shadow-sm transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? "Saving…" : "Continue to BrandForge"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-on-surface-variant">
          Wrong account?{" "}
          <button
            type="button"
            disabled={busy || switchBusy}
            onClick={() => void onSignOutAndSwitch()}
            className="text-primary inline font-semibold underline-offset-2 hover:underline disabled:opacity-50"
          >
            {switchBusy ? "Signing out…" : "Sign out and switch"}
          </button>
        </p>
      </div>
    </div>
  );
}
