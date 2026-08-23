"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { GoogleButton } from "@/components/auth/google-button";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/chat");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/chat");
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace("/chat");
  }

  return (
    <main className="signin-main">
      <div className="signin-bubbles" aria-hidden>
        <span className="signin-bubble signin-bubble-1" />
        <span className="signin-bubble signin-bubble-2" />
        <span className="signin-bubble signin-bubble-3" />
      </div>

      <form className="signin-card" onSubmit={submit} noValidate={false}>
        <div className="signin-brand">
          <span className="signin-mark" aria-hidden>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
              <rect x="3" y="3" width="11" height="11" rx="3" fill="#2563EB" />
              <rect x="10" y="10" width="11" height="11" rx="3" fill="#0A1D2E" />
            </svg>
          </span>
          <span className="signin-word">BrandForge</span>
        </div>

        <p className="signin-eyebrow">WORKSPACE · SIGN-IN</p>
        <h1 className="signin-h1">Back in the thread.</h1>
        <p className="signin-sub">
          Sign in to pick up your client conversations, escrow plates and milestones.
        </p>

        <div className="signin-field">
          <label htmlFor="si-email">Email</label>
          <input
            id="si-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            required
          />
        </div>

        <div className="signin-field">
          <label htmlFor="si-password">Password</label>
          <input
            id="si-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="signin-field-meta">
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
        </div>

        {error && (
          <p className="signin-error" role="alert">
            {error}
          </p>
        )}

        <button className="signin-btn" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="signin-divider" aria-hidden>
          <span>or</span>
        </div>

        <GoogleButton onError={setError} />

        <div className="signin-back signin-back-split">
          <span>New to BrandForge?</span>
          <Link href="/signup">Create an account</Link>
        </div>
      </form>
    </main>
  );
}
