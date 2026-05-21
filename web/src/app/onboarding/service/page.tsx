"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ForgePage } from "@/components/forge/ForgePage";
import { CATEGORIES } from "@/content/landing-directory";
import { apiFetch } from "@/lib/api";
import type { ListingTerm } from "@/lib/listings-types";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

const SERVICE_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

export default function OnboardingServicePage() {
  const { session, accessToken, authReady } = useAuth();
  const user = session?.user ?? null;
  const authLoading = !authReady;
  const { me, loading: meLoading, reload } = useAuthMe();
  const router = useRouter();
  const [listingTerm, setListingTerm] = useState<ListingTerm>("short");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("3");
  const [description, setDescription] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/onboarding/service");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!meLoading && me?.pendingOnboarding) router.replace("/onboarding");
    if (!meLoading && me?.sellerAccess) router.replace("/account");
  }, [me, meLoading, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    const body: Record<string, unknown> = {
      title: title.trim(),
      category,
      price: price.trim(),
      delivery: delivery.trim(),
      description: description.trim(),
      listing_type: listingTerm === "long" ? "long_term" : "short_term",
    };
    if (listingTerm === "short" && endsAt) body.ends_at = endsAt;
    if (listingTerm === "long") body.billing_interval = billingInterval;

    const { ok, data } = await apiFetch<{ error?: string }>("/api/services", {
      method: "POST",
      accessToken,
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!ok) {
      setError((data as { error?: string })?.error || "Could not publish listing");
      return;
    }
    await reload();
    router.push("/account");
  }

  if (authLoading || meLoading) {
    return (
      <ForgePage title="Loading…" narrow>
        <p className="text-sm text-[var(--forge-text-muted)]">Almost there…</p>
      </ForgePage>
    );
  }

  return (
    <ForgePage
      title="Publish your first listing"
      eyebrow="Step 2 of 2"
      description="Create a short-term offer or a subscription. This unlocks your seller account."
      narrow
    >
      <form onSubmit={submit} className="forge-page-card mx-auto max-w-lg space-y-5">
        <div className="mp-term-tabs">
          <button
            type="button"
            className={`mp-term-tab ${listingTerm === "short" ? "mp-term-tab-active" : ""}`}
            onClick={() => setListingTerm("short")}
          >
            Short term
          </button>
          <button
            type="button"
            className={`mp-term-tab ${listingTerm === "long" ? "mp-term-tab-active" : ""}`}
            onClick={() => setListingTerm("long")}
          >
            Long term
          </button>
        </div>

        <div>
          <label className="forge-label" htmlFor="title">
            Service title
          </label>
          <input
            id="title"
            className="forge-input mt-2 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="forge-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="forge-input mt-2 w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="forge-label" htmlFor="price">
              Price (USD)
            </label>
            <input
              id="price"
              className="forge-input mt-2 w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="299"
              required
            />
          </div>
          <div>
            <label className="forge-label" htmlFor="delivery">
              Delivery (days)
            </label>
            <input
              id="delivery"
              type="number"
              min={1}
              className="forge-input mt-2 w-full"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              required
            />
          </div>
        </div>

        {listingTerm === "short" ? (
          <div>
            <label className="forge-label" htmlFor="endsAt">
              Listing ends (optional)
            </label>
            <input
              id="endsAt"
              type="date"
              className="forge-input mt-2 w-full"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="forge-label" htmlFor="billing">
              Billing interval
            </label>
            <select
              id="billing"
              className="forge-input mt-2 w-full"
              value={billingInterval}
              onChange={(e) => setBillingInterval(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        <div>
          <label className="forge-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="forge-input mt-2 min-h-[120px] w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What buyers get and why they need it now."
          />
        </div>

        {error ? <p className="text-sm text-[var(--forge-fire)]">{error}</p> : null}
        <button type="submit" className="forge-btn forge-btn-primary w-full" disabled={busy}>
          {busy ? "Publishing…" : "Publish & unlock account"}
        </button>
      </form>
    </ForgePage>
  );
}
