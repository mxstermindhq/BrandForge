"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function SignInPage() {
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
    <div className="ws-login">
      <form className="ws-login-card" onSubmit={submit}>
        <div className="ws-login-wordmark">
          BRAND<span>FORGE</span>
        </div>
        <div className="ws-login-sub">workspace sign-in</div>
        <div className="ws-field">
          <label htmlFor="ws-email">Email</label>
          <input
            id="ws-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="ws-field">
          <label htmlFor="ws-password">Password</label>
          <input
            id="ws-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="ws-form-error">{error}</div>}
        <button className="ws-btn" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="ws-composer-hint" style={{ marginTop: 14 }}>
          <Link href="/" style={{ color: "var(--ws-brass)", textDecoration: "none" }}>
            ← Back to brandforge.gg
          </Link>
        </div>
      </form>
    </div>
  );
}
