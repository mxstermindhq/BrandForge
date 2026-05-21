import type { Metadata } from "next";
import Link from "next/link";
import { ForgePage } from "@/components/forge/ForgePage";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to BrandForge — operator & seller access",
};

export default function LoginPage() {
  return (
    <ForgePage
      title="Enter the forge"
      eyebrow="Account"
      description="Sign in to manage listings, services, and your operator profile."
      backLabel="← Marketplace"
      narrow
    >
      <div className="forge-page-card mx-auto max-w-md">
        <h2 className="font-headline text-xl font-semibold text-[var(--forge-text)]">Sign in</h2>
        <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
          Sellers and operators only. Buyers can browse and order via Discord or Telegram.
        </p>
        <div className="mt-8">
          <SocialLoginButtons redirectTo="/" />
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
      </div>
    </ForgePage>
  );
}
