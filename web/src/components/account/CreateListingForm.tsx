"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/content/landing-directory";
import { apiFetch } from "@/lib/api";
import type { ListingTerm } from "@/lib/listings-types";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

const SERVICE_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

type CreateListingFormProps = {
  onSuccess?: () => void;
  showSkip?: boolean;
};

export function CreateListingForm({ onSuccess, showSkip = true }: CreateListingFormProps) {
  const { accessToken } = useAuth();
  const { me, reload } = useAuthMe();
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

  const canCreate = me?.canCreateListing !== false;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    if (!canCreate) {
      setError("Seller whitelist required to publish listings. Contact the team on Discord.");
      return;
    }
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
    if (onSuccess) onSuccess();
    else router.push("/account/listings");
  }

  return (
    <form onSubmit={submit} className="hub-panel space-y-5 p-6">
      {!canCreate ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Listing publishing requires seller whitelist approval. You can still browse and purchase on the marketplace.
        </div>
      ) : null}

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
          Offer title
        </label>
        <input
          id="title"
          className="forge-input mt-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={!canCreate}
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
          disabled={!canCreate}
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
            placeholder="499"
            required
            disabled={!canCreate}
          />
        </div>
        <div>
          <label className="forge-label" htmlFor="delivery">
            Delivery (days)
          </label>
          <input
            id="delivery"
            className="forge-input mt-2 w-full"
            type="number"
            min={1}
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            required
            disabled={!canCreate}
          />
        </div>
      </div>

      {listingTerm === "short" ? (
        <div>
          <label className="forge-label" htmlFor="ends">
            Offer ends (optional)
          </label>
          <input
            id="ends"
            type="date"
            className="forge-input mt-2 w-full"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            disabled={!canCreate}
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
            disabled={!canCreate}
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
          disabled={!canCreate}
        />
      </div>

      {error ? <p className="text-sm text-[var(--forge-fire)]">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="forge-btn forge-btn-primary flex-1 justify-center" disabled={busy || !canCreate}>
          {busy ? "Publishing…" : "Publish offer"}
        </button>
        {showSkip ? (
          <Link href="/account" className="forge-btn forge-btn-ghost flex-1 justify-center">
            Skip for now
          </Link>
        ) : null}
      </div>
    </form>
  );
}
