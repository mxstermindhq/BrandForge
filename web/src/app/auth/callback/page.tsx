"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { storeOAuthCallbackError } from "@/lib/oauth-callback-errors";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.get("mx_onboarding") === "1") {
        u.searchParams.delete("mx_onboarding");
        const next = `${u.pathname}${u.search}${u.hash}`;
        history.replaceState(null, "", next || u.pathname);
      }
    } catch {
      /* ignore */
    }

    const oauthError = searchParams.get("error");
    const oauthDesc = searchParams.get("error_description");

    if (oauthError) {
      const raw = oauthDesc ? decodeURIComponent(oauthDesc.replace(/\+/g, " ")) : oauthError;
      storeOAuthCallbackError(raw);
      setMessage("Sign-in could not finish. Redirecting…");
      router.replace("/login?error=oauth");
      return;
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setMessage("Auth is not configured.");
      router.replace("/login");
      return;
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        setMessage("Could not complete sign-in.");
        router.replace("/login?error=session");
        return;
      }
      let dest = "/";
      try {
        const n = sessionStorage.getItem("mx_auth_next");
        if (n && n.startsWith("/") && !n.startsWith("//")) {
          dest = n;
          sessionStorage.removeItem("mx_auth_next");
        }
      } catch {
        /* ignore */
      }
      router.replace(dest);
    });
  }, [router, searchParams]);

  return (
    <div className="bg-background text-on-surface flex min-h-screen items-center justify-center font-body">
      <p className="text-on-surface-variant text-sm">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-on-surface flex min-h-screen items-center justify-center text-sm">Loading…</div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
