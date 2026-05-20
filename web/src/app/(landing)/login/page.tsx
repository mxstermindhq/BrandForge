import type { Metadata } from "next";
import Link from "next/link";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to BrandForge — curated operator directory",
};

export default function LoginPage() {
  return (
    <div className="landing-layout flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 block text-center">
          <span className="font-headline text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            BrandForge
          </span>
          <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Curated directory
          </span>
        </Link>

        <div
          className="rounded-2xl border p-8 shadow-sm"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <h2 className="font-headline text-2xl font-semibold text-[var(--color-text-primary)]">Sign in</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            For operators updating their profile. Clients start on the homepage.
          </p>

          <div className="mt-8">
            <SocialLoginButtons redirectTo="/" />
          </div>

          <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
            By signing in you agree to our{" "}
            <Link href="/terms" className="text-[var(--color-gold)] hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[var(--color-gold)] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          <Link href="/" className="text-[var(--color-gold)] font-medium hover:underline">
            ← Back to directory
          </Link>
        </p>
      </div>
    </div>
  );
}
