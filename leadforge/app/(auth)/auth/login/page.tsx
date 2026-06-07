"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import type { UserPublic } from "@/types";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: "Google sign-in failed. Please try again.",
  oauth_missing_code: "Google sign-in was interrupted. Please try again.",
  oauth_profile_failed: "Signed in with Google but we could not finish setting up your account.",
};

export default function LoginPage(): React.JSX.Element {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const oauthError = OAUTH_ERRORS[params.get("error") ?? ""] ?? "";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch<UserPublic>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <Card className="p-7">
      <h1 className="font-display text-3xl font-light">Welcome back</h1>
      <p className="mt-1 text-sm text-tx-muted">Sign in to your LeadForge account.</p>
      <div className="mt-6">
        <GoogleSignInButton next={next} label="Continue with Google" />
      </div>
      <AuthDivider />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <ErrorText>{oauthError || error}</ErrorText>
        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-tx-muted">
        No account?{" "}
        <Link href="/auth/register" className="text-gold hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}
