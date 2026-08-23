"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && data.session.user?.aud === "authenticated") {
        setReady(true);
      }
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await supabase.auth.signOut();
    setDone(true);
  }

  if (done) {
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
          <h1 className="signin-h1">Password updated.</h1>
          <p className="signin-sub">Your new password is live. Sign in to get back in the thread.</p>
          <Link className="signin-btn signin-btn-link" href="/signin">
            Back to sign in
          </Link>
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
        <h1 className="signin-h1">Set a new password.</h1>
        <p className="signin-sub">Choose a new password for your account.</p>

        {!ready && !error && (
          <p className="signin-note">
            Opening your reset link… if this takes more than a few seconds, use the link from
            your email again.
          </p>
        )}
        {note && <p className="signin-note">{note}</p>}
        {error && (
          <p className="signin-error" role="alert">
            {error}
          </p>
        )}

        <div className="signin-field">
          <label htmlFor="rp-password">New password</label>
          <input
            id="rp-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            disabled={!ready && !error}
            required
          />
        </div>

        <div className="signin-field">
          <label htmlFor="rp-confirm">Confirm password</label>
          <input
            id="rp-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            disabled={!ready && !error}
            required
          />
        </div>

        <button className="signin-btn" type="submit" disabled={busy || (!ready && !error)}>
          {busy ? "Saving…" : "Save new password"}
        </button>

        <div className="signin-back">
          <Link href="/signin">← Back to sign in</Link>
        </div>
      </form>
    </main>
  );
}
