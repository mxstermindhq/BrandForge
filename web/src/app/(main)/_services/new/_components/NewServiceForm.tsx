"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuth } from "@/providers/AuthProvider";
import { CATEGORIES } from "@/lib/service-categories";
import { cn } from "@/lib/cn";

const fieldLabel = "mb-1.5 block text-xs font-medium text-on-surface";
const fieldHint = "mt-1 text-[11px] leading-snug text-on-surface-variant";
const control = cn(
  "input-base w-full min-h-[44px]",
  "rounded-xl px-3.5 py-2.5",
  "disabled:cursor-not-allowed disabled:opacity-50",
);
const textArea = cn("input-base w-full min-h-[120px] resize-y rounded-xl px-3.5 py-3");

export function NewServiceForm() {
  const { session } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("7");
  const [description, setDescription] = useState("");
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
      if (!t) throw new Error("Sign in required to list a service.");
      const res = await apiMutateJson<{ service?: { id?: string } }>(
        "/api/services",
        "POST",
        { title, price, category, delivery, description: description.trim() || undefined },
        t,
      );
      const id = res?.service?.id ?? null;
      router.push(id ? `/services/${id}` : "/marketplace");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create service");
    } finally {
      setSubmitting(false);
    }
  }

  const loginHref = `/login?next=${encodeURIComponent("/services/new")}`;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-8 pb-20">
      <header className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Marketplace</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">List a service</h1>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Describe what you deliver, set a fair price and timeline, and publish so buyers can discover and book you.
        </p>
        <p className="rounded-lg border border-outline-variant/40 bg-surface-container/60 px-3 py-2 text-[11px] text-on-surface-variant">
          <span className="text-on-surface-variant/80">Required:</span> title, category, and base price. Optional
          fields still help you win more work.
        </p>
      </header>

      {!session ? (
        <div className="surface-card border-outline-variant/30 p-5">
          <p className="text-sm text-on-surface-variant">Sign in to publish a package to the marketplace.</p>
          <Link
            href={loginHref}
            className="text-secondary mt-3 inline-flex text-sm font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign in →
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
          <label htmlFor="svc-title" className={fieldLabel}>
            Title
          </label>
          <input
            id="svc-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Brand identity kit + social templates"
            className={control}
          />
          <p className={fieldHint}>One clear line — buyers scan dozens of listings.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="svc-cat" className={fieldLabel}>
            Category
          </label>
          <select id="svc-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={control}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 rounded-xl border border-outline-variant/35 bg-surface-container/50 p-4 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-1.5">
            <label htmlFor="svc-price" className={fieldLabel}>
              Base price (USD)
            </label>
            <input
              id="svc-price"
              required
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="499"
              className={control}
            />
            <p className={fieldHint}>Whole dollars are fine; you can refine scope in chat.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="svc-delivery" className={fieldLabel}>
              Delivery (days)
            </label>
            <input
              id="svc-delivery"
              inputMode="numeric"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              placeholder="7"
              className={control}
            />
            <p className={fieldHint}>Typical turnaround for the core deliverable.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="svc-desc" className={fieldLabel}>
            Description
          </label>
          <textarea
            id="svc-desc"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What buyers get, milestones, file formats, what you need from them, revision policy…"
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
          {submitting ? "Publishing…" : "Publish service"}
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
