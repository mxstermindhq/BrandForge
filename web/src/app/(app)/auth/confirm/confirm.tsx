"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function Confirm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/chat";
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const [error, setError] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError("Auth isnâ€™t configured yet. Check back soon.");
      return;
    }

    const finish = (session: { user: unknown } | null) => {
      if (session) {
        router.replace(next);
      } else {
        setError("This link is invalid or has expired. Request a new one.");
      }
    };

    async function run() {
      const sb = supabase!;
      const { data: sessionData } = await sb.auth.getSession();
      if (sessionData.session) {
        finish(sessionData.session);
        return;
      }

      if (tokenHash && type) {
        const otpParams = {
          token_hash: tokenHash,
          type,
        } as unknown as Parameters<typeof sb.auth.verifyOtp>[0];
        const { data, error: otpError } = await sb.auth.verifyOtp(otpParams);
        if (otpError) {
          setError("This link is invalid or has expired. Request a new one.");
          return;
        }
        finish(data.session);
        return;
      }

      // PKCE flow: supabase-js exchanges `code` in the URL automatically.
      const started = Date.now();
      const timer = setInterval(async () => {
        const { data: s } = await sb.auth.getSession();
        if (s.session) {
          clearInterval(timer);
          finish(s.session);
        } else if (Date.now() - started > 8000) {
          clearInterval(timer);
          setError("This link is invalid or has expired. Request a new one.");
        }
      }, 400);
    }

    run();
  }, [next, tokenHash, type, router]);

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
        <p className="signin-eyebrow">AUTH Â· CONFIRM</p>
        <h1 className="signin-h1">{error ? "Link not valid." : "Confirmingâ€¦"}</h1>
        <p className="signin-sub">
          {error
            ? "The confirmation link is invalid or has expired. Request a new one."
            : "Verifying your link and opening the workspace."}
        </p>
        {error && (
          <div className="signin-back">
            <Link href="/signin">â† Back to sign in</Link>
          </div>
        )}
      </div>
    </main>
  );
}
