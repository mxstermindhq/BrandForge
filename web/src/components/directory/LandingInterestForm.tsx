"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics.client";

type Intent = "hire" | "get_hired";

export function LandingInterestForm() {
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<Intent>("hire");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/landing-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, intent }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Could not save. Try Telegram instead.");
        return;
      }
      setStatus("ok");
      setMessage("Thanks — mxstermind will follow up.");
      setEmail("");
      trackEvent("interest_submit", { intent });
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Message us on Telegram.");
    }
  }

  return (
    <section
      id="interest"
      className="border-t px-4 py-14 sm:px-6"
      style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface-2)" }}
    >
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-headline text-2xl font-semibold text-[var(--color-text-primary)]">
          Get on the list
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Hiring an operator or want to be considered for the directory — leave your email.
        </p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 flex-1 rounded-xl border px-4 text-sm"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          />
          <select
            value={intent}
            onChange={(e) => setIntent(e.target.value as Intent)}
            className="min-h-11 rounded-xl border px-3 text-sm"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            aria-label="Intent"
          >
            <option value="hire">I want to hire</option>
            <option value="get_hired">I want to get listed</option>
          </select>
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary min-h-11 px-6 text-sm"
            data-track="interest_form_submit"
          >
            {status === "loading" ? "Sending…" : "Notify me"}
          </button>
        </form>
        {message ? (
          <p
            className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-[var(--color-gold)]"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
