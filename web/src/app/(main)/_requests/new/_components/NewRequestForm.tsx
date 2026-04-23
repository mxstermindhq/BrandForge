"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/cn";

const fieldLabel = "mb-1.5 block text-xs font-medium text-on-surface";
const fieldHint = "mt-1 text-[11px] leading-snug text-on-surface-variant";
const control = cn(
  "input-base w-full min-h-[44px]",
  "rounded-xl px-3.5 py-2.5",
  "disabled:cursor-not-allowed disabled:opacity-50",
);
const textArea = cn("input-base w-full min-h-[100px] resize-y rounded-xl px-3.5 py-3");

export function NewRequestForm() {
  const { session } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      if (!t) {
        throw new Error("Sign in required to post a request.");
      }
      const res = await apiMutateJson<{ request?: { id?: string } }>(
        "/api/requests",
        "POST",
        { title, desc, budget, successCriteria },
        t,
      );
      const newId = res?.request?.id;
      router.push(newId ? `/requests/${newId}` : "/marketplace");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  const loginHref = `/login?next=${encodeURIComponent("/requests/new")}`;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-8 pb-20">
      <header className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Marketplace</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">List a request</h1>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Tell specialists what you need, what you can spend, and how you will judge success — clearer posts get
          faster, better bids.
        </p>
        <p className="rounded-lg border border-outline-variant/40 bg-surface-container/60 px-3 py-2 text-[11px] text-on-surface-variant">
          <span className="text-on-surface-variant/80">Required:</span> title, description, and budget. Success
          criteria help respondents quote accurately.
        </p>
      </header>

      {!session ? (
        <div className="surface-card border-outline-variant/30 p-5">
          <p className="text-sm text-on-surface-variant">You need an account to post a request.</p>
          <Link
            href={loginHref}
            className="text-secondary mt-3 inline-flex text-sm font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign in or create an account →
          </Link>
        </div>
      ) : null}

      {err ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error" role="alert">
          {err}
        </p>
      ) : null}

      <div className="surface-card space-y-8 border-outline-variant/30 p-6 shadow-sm md:p-8">
        <div className="space-y-1.5">
          <label htmlFor="title" className={fieldLabel}>
            Title
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Landing page + analytics for product launch"
            className={control}
          />
          <p className={fieldHint}>Specific outcomes beat vague titles.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="desc" className={fieldLabel}>
            Description
          </label>
          <textarea
            id="desc"
            required
            rows={5}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Context, audience, assets you have, deadlines, tools or stacks, links…"
            className={textArea}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="budget" className={fieldLabel}>
            Budget
          </label>
          <input
            id="budget"
            required
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="$500–$2,000 or 2000"
            className={control}
          />
          <p className={fieldHint}>A range or fixed number — both work.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="successCriteria" className={fieldLabel}>
            Success criteria <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <textarea
            id="successCriteria"
            rows={3}
            value={successCriteria}
            onChange={(e) => setSuccessCriteria(e.target.value)}
            placeholder="e.g. Lighthouse 90+, WCAG AA, sign-off from marketing lead…"
            className={textArea}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !session}
          className="bg-primary text-on-primary font-headline inline-flex min-h-[44px] items-center justify-center rounded-xl px-6 text-sm font-bold shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post request"}
        </button>
        <Link
          href="/marketplace"
          className="border-outline-variant/50 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-high hover:text-on-surface inline-flex min-h-[44px] items-center rounded-xl border bg-transparent px-5 text-sm font-medium transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
