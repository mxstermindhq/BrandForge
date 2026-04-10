"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuth } from "@/providers/AuthProvider";
import { CATEGORIES } from "@/lib/service-categories";

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
      router.push(id ? `/services/${id}` : "/services");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create service");
    } finally {
      setSubmitting(false);
    }
  }

  const loginHref = `/login?next=${encodeURIComponent("/services/new")}`;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-8 pb-16">
      <header>
        <h1 className="font-display text-on-surface text-3xl font-bold tracking-tight">List a service</h1>
        <p className="text-on-surface-variant mt-2 text-sm font-light leading-relaxed">
          Published via <code className="text-secondary/90 text-xs">POST /api/services</code> — title, price, and category are required.
        </p>
      </header>

      {!session ? (
        <div className="surface-card border-outline-variant/25">
          <p className="text-on-surface-variant text-sm">Sign in to publish a package.</p>
          <Link href={loginHref} className="text-secondary mt-3 inline-block text-sm font-bold hover:underline">
            Sign in →
          </Link>
        </div>
      ) : null}

      {err ? (
        <p className="text-error text-sm" role="alert">
          {err}
        </p>
      ) : null}

      <div className="surface-card border-outline-variant/20 space-y-6">
        <div>
          <label htmlFor="svc-title" className="font-headline text-on-surface-variant mb-2 block text-[10px] font-bold uppercase tracking-widest">
            Title
          </label>
          <input
            id="svc-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-outline-variant/30 bg-background/80 focus:border-secondary/50 w-full min-h-[44px] rounded-lg border px-3 text-sm text-on-surface transition-all focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="svc-cat" className="font-headline text-on-surface-variant mb-2 block text-[10px] font-bold uppercase tracking-widest">
            Category
          </label>
          <select
            id="svc-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border-outline-variant/30 bg-background/80 w-full min-h-[44px] rounded-lg border px-3 text-sm text-on-surface"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="svc-price" className="font-headline text-on-surface-variant mb-2 block text-[10px] font-bold uppercase tracking-widest">
              Base price (USD)
            </label>
            <input
              id="svc-price"
              required
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="499"
              className="border-outline-variant/30 bg-background/80 w-full min-h-[44px] rounded-lg border px-3 text-sm text-on-surface"
            />
          </div>
          <div>
            <label htmlFor="svc-delivery" className="font-headline text-on-surface-variant mb-2 block text-[10px] font-bold uppercase tracking-widest">
              Delivery (days)
            </label>
            <input
              id="svc-delivery"
              inputMode="numeric"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              className="border-outline-variant/30 bg-background/80 w-full min-h-[44px] rounded-lg border px-3 text-sm text-on-surface"
            />
          </div>
        </div>

        <div>
          <label htmlFor="svc-desc" className="font-headline text-on-surface-variant mb-2 block text-[10px] font-bold uppercase tracking-widest">
            Description
          </label>
          <textarea
            id="svc-desc"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What buyers get, deliverables, prerequisites…"
            className="border-outline-variant/30 bg-background/80 focus:border-secondary/50 w-full rounded-lg border px-3 py-2 text-sm text-on-surface focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting || !session}
          className="bg-primary text-on-primary font-headline min-h-[44px] rounded-xl px-6 text-sm font-bold transition-all duration-300 hover:shadow-glow disabled:opacity-50"
        >
          {submitting ? "Publishing…" : "Publish service"}
        </button>
        <Link
          href="/services"
          className="border-outline-variant/40 text-on-surface hover:bg-surface-container-high inline-flex min-h-[44px] items-center rounded-xl border px-5 text-sm font-medium transition-all"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
