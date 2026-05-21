"use client";

import { CATEGORIES } from "@/content/landing-directory";
import type { ListingTerm } from "@/lib/listings-types";

const SERVICE_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

export type ListingFormValues = {
  listingTerm: ListingTerm;
  title: string;
  category: string;
  price: string;
  delivery: string;
  description: string;
  endsAt: string;
  billingInterval: string;
  status: string;
};

type ListingFormProps = {
  values: ListingFormValues;
  onChange: (values: ListingFormValues) => void;
  submitLabel: string;
  busy?: boolean;
  error?: string | null;
  onSubmit: (e: React.FormEvent) => void;
};

export function ListingForm({ values, onChange, submitLabel, busy, error, onSubmit }: ListingFormProps) {
  const set = (patch: Partial<ListingFormValues>) => onChange({ ...values, ...patch });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="mp-term-tabs">
        <button
          type="button"
          className={`mp-term-tab ${values.listingTerm === "short" ? "mp-term-tab-active" : ""}`}
          onClick={() => set({ listingTerm: "short" })}
        >
          Short term
        </button>
        <button
          type="button"
          className={`mp-term-tab ${values.listingTerm === "long" ? "mp-term-tab-active" : ""}`}
          onClick={() => set({ listingTerm: "long" })}
        >
          Long term
        </button>
      </div>

      <div>
        <label className="forge-label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="forge-input mt-2 w-full"
          value={values.title}
          onChange={(e) => set({ title: e.target.value })}
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
          value={values.category}
          onChange={(e) => set({ category: e.target.value })}
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
            value={values.price}
            onChange={(e) => set({ price: e.target.value })}
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
            value={values.delivery}
            onChange={(e) => set({ delivery: e.target.value })}
            required
          />
        </div>
      </div>

      {values.listingTerm === "short" ? (
        <div>
          <label className="forge-label" htmlFor="endsAt">
            Listing ends
          </label>
          <input
            id="endsAt"
            type="date"
            className="forge-input mt-2 w-full"
            value={values.endsAt}
            onChange={(e) => set({ endsAt: e.target.value })}
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
            value={values.billingInterval}
            onChange={(e) => set({ billingInterval: e.target.value })}
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
          className="forge-input mt-2 min-h-[140px] w-full"
          value={values.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Outcome-focused copy — what they get and why now."
        />
      </div>

      <div>
        <label className="forge-label" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          className="forge-input mt-2 w-full"
          value={values.status}
          onChange={(e) => set({ status: e.target.value })}
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {error ? <p className="text-sm text-[var(--forge-fire)]">{error}</p> : null}
      <button type="submit" className="forge-btn forge-btn-primary w-full" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
