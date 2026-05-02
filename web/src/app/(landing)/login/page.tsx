import type { Metadata } from "next";
import Link from "next/link";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

export const metadata: Metadata = {
  title: "Sign In | BrandForge",
  description: "Sign in to BrandForge to hire or get hired",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  return (
    <div className="bg-background text-on-surface flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">BrandForge</h1>
        </Link>

        <div className="rounded-2xl border border-outline-variant bg-surface-container p-8">
          <h2 className="mb-2 text-2xl font-bold">Sign in</h2>
          <p className="text-on-surface-variant mb-8 text-sm">Choose your preferred method to continue</p>

          <SocialLoginButtons redirectTo="/marketplace" />

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-outline-variant" />
            <span className="mx-4 text-sm text-on-surface-variant">or</span>
            <div className="flex-1 border-t border-outline-variant" />
          </div>

          <p className="text-on-surface-variant text-center text-sm">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        <p className="text-on-surface-variant mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/welcome" className="text-primary font-medium hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
