import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";
import { LoginForm } from "./LoginForm";

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
          Sign in to pay with crypto, track orders, and manage listings.
        </p>
        <LoginForm />
      </div>
    </ForgePage>
  );
}
