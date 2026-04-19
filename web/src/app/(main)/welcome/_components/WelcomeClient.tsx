"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { PROFESSIONAL_TITLES } from "@/config/professional-titles";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

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
      if (password) {
        const supabase = getSupabaseBrowser();
        if (!supabase) throw new Error("Auth not available.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }
      const t = accessToken;
      if (!t) throw new Error("Sign in again.");
      await apiMutateJson("/api/onboarding/complete", "POST", { username: u, headline }, t);
      await reloadMe();
      router.replace("/");
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
    <div className="min-h-screen bg-[#0a0a0a] text-white max-w-lg mx-auto px-4 py-10 md:py-16">
      <div className="flex items-center gap-2 text-xs text-amber-400 uppercase tracking-[0.2em]">Setup</div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Finish your account</h1>
      <p className="text-zinc-400 mt-2 text-sm font-light leading-relaxed">
        Choose your public <strong className="text-white font-semibold">username</strong>, your professional
        title, and optionally set a password for email sign-in. You can change these later in Settings.
      </p>

      <form onSubmit={onSubmit} className="border-zinc-800 bg-zinc-900/50 mt-8 space-y-5 rounded-2xl border p-6">
        {err ? (
          <p className="text-rose-400 text-sm" role="alert">
            {err}
          </p>
        ) : null}

        <div>
          <label htmlFor="welcome-user" className="text-zinc-400 mb-1.5 block text-xs font-bold uppercase tracking-wider">
            Username
          </label>
          <div className="relative">
            <input
              id="welcome-user"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              autoComplete="username"
              placeholder="yourhandle"
              className="border-zinc-700 bg-zinc-800 text-white focus:border-amber-500 w-full min-h-[48px] rounded-xl border py-2 px-3 text-sm outline-none"
            />
          </div>
          {unameHint ? (
            <p
              className={`mt-1 text-xs font-medium ${unameHint === "Available" ? "text-emerald-400" : "text-rose-400"}`}
              role="status"
            >
              {unameHint}
            </p>
          ) : (
            <p className="text-zinc-500 mt-1 text-[11px]">Lowercase letters, numbers, underscores, hyphens.</p>
          )}
        </div>

        <div>
          <label htmlFor="welcome-title" className="text-zinc-400 mb-1.5 block text-xs font-bold uppercase tracking-wider">
            Professional title
          </label>
          <select
            id="welcome-title"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-white focus:border-amber-500 w-full min-h-[48px] rounded-xl border px-3 text-sm outline-none"
          >
            {PROFESSIONAL_TITLES.map((t) => (
              <option key={t} value={t} className="bg-zinc-800">
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="welcome-pass" className="text-zinc-400 mb-1.5 block text-xs font-bold uppercase tracking-wider">
            Password <span className="font-normal normal-case opacity-80">(optional)</span>
          </label>
          <input
            id="welcome-pass"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="border-zinc-700 bg-zinc-800 text-white focus:border-amber-500 w-full min-h-[48px] rounded-xl border px-3 text-sm outline-none"
          />
        </div>

        <div>
          <label htmlFor="welcome-pass2" className="text-zinc-400 mb-1.5 block text-xs font-bold uppercase tracking-wider">
            Confirm password
          </label>
          <input
            id="welcome-pass2"
            type="password"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-white focus:border-amber-500 w-full min-h-[48px] rounded-xl border px-3 text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="bg-amber-500 text-black w-full min-h-[52px] rounded-xl text-sm font-bold hover:bg-amber-400 transition disabled:opacity-50"
        >
          {busy ? "Saving…" : "Continue to BrandForge"}
        </button>
      </form>

      <p className="text-zinc-500 mt-6 text-center text-xs">
        Wrong account?{" "}
        <button
          type="button"
          disabled={busy || switchBusy}
          onClick={() => void onSignOutAndSwitch()}
          className="text-amber-400 inline font-semibold underline-offset-2 hover:underline disabled:opacity-50"
        >
          {switchBusy ? "Signing out…" : "Sign out and switch"}
        </button>
      </p>
    </div>
  );
}
