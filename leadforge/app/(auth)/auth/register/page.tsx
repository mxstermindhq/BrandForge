"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthDivider, GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import { WELCOME_CREDITS } from "@/lib/constants";
import type { UserPublic } from "@/types";

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch<UserPublic>("/api/auth/register", {
        method: "POST",
        json: { name, email, password },
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  }

  return (
    <Card className="p-7">
      <h1 className="font-display text-3xl font-light">Create your account</h1>
      <p className="mt-1 text-sm text-tx-muted">
        Get {WELCOME_CREDITS} free credits to start.
      </p>
      <div className="mt-6">
        <GoogleSignInButton label="Sign up with Google" />
      </div>
      <AuthDivider />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-tx-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
