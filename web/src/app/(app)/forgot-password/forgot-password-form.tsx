"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const redirectTo = `${window.location.origin}/auth/confirm?next=/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="signin-main">
        <div className="signin-card signin-done">
          <div className="signin-brand">
            <span className="signin-mark" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
                <rect x="3" y="3" width="11" height="11" rx="3" fill="#2563EB" />
                <rect x="10" y="10" width="11" height="11" rx="3" fill="#0A1D2E" />
              </svg>
            </span>
            <span className="signin-word">BrandForge</span>
          </div>
          <p className="signin-eyebrow">RESET PASSWORD</p>
          <h1 className="signin-h1">Check your inbox.</h1>
          <p className="signin-sub">
            We sent a reset link to <strong>{email}</strong>. It expires after one hour —
            and the link only works once.
          </p>
          <div className="signin-back">
            <Link href="/signin">← Back to sign in</Link>
          </div>
        </div>
      </main>
    );
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

        <p className="signin-eyebrow">WORKSPACE · RESET PASSWORD</p>
        <h1 className="signin-h1">Forgot your password?</h1>
        <p className="signin-sub">
          Enter your account email and we’ll send you a link to set a new one.
        </p>

        <div className="signin-field">
          <label htmlFor="fp-email">Email</label>
          <input
            id="fp-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            required
          />
        </div>

        {error && (
          <p className="signin-error" role="alert">
            {error}
          </p>
        )}

        <button className="signin-btn" type="submit" disabled={busy}>
          {busy ? "Sending link…" : "Send reset link"}
        </button>

        <div className="signin-back">
          <Link href="/signin">← Back to sign in</Link>
        </div>
      </form>
    </main>
  );
}
