"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { GoogleButton } from "@/components/auth/google-button";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/chat");
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setNote("");
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/chat` },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.replace("/chat");
      return;
    }
    setNote("Check your inbox — we sent a confirmation link to " + email);
  }

  return (
    <main className="signin-main">
      <div className="signin-bubbles" aria-hidden>
        <span className="signin-bubble signin-bubble-1" />
        <span className="signin-bubble signin-bubble-2" />
        <span className="signin-bubble signin-bubble-3" />
      </div>

      <form className="signin-card" onSubmit={submit}>
        <div className="signin-brand">
          <span className="signin-mark" aria-hidden>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
              <rect x="3" y="3" width="11" height="11" rx="3" fill="#2563EB" />
              <rect x="10" y="10" width="11" height="11" rx="3" fill="#0A1D2E" />
            </svg>
          </span>
          <span className="signin-word">BrandForge</span>
        </div>

        <p className="signin-eyebrow">WORKSPACE · CREATE ACCOUNT</p>
        <h1 className="signin-h1">Start your first thread.</h1>
        <p className="signin-sub">
          Create an account to invite clients, hold escrow and draft replies with @AI.
        </p>

        <div className="signin-field">
          <label htmlFor="su-email">Email</label>
          <input
            id="su-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            required
          />
        </div>

        <div className="signin-field">
          <label htmlFor="su-password">Password</label>
          <input
            id="su-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>

        {error && (
          <p className="signin-error" role="alert">
            {error}
          </p>
        )}
        {note && <p className="signin-note">{note}</p>}

        <button className="signin-btn" type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>

        <div className="signin-divider" aria-hidden>
          <span>or</span>
        </div>

        <GoogleButton onError={setError} />

        <div className="signin-back signin-back-split">
          <span>Already have an account?</span>
          <Link href="/signin">Sign in</Link>
        </div>
      </form>
    </main>
  );
}
