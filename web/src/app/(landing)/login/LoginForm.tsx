"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redirectTo =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  return (
    <>
      <div className="mt-8">
        <SocialLoginButtons redirectTo={redirectTo} />
      </div>
      <p className="mt-8 text-center text-xs text-[var(--forge-text-muted)]">
        By signing in you agree to our{" "}
        <Link href="/terms" className="text-[var(--forge-gold)] hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[var(--forge-gold)] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<p className="mt-8 text-sm text-[var(--forge-text-muted)]">Loading…</p>}>
      <LoginFormInner />
    </Suspense>
  );
}
