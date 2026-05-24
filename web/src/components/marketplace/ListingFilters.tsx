"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MARKETPLACE_CATEGORY_CHIPS,
  normalizeMarketplaceCategory,
} from "@/lib/marketplace-categories";
import type { MarketplaceListing } from "@/lib/listings-types";
import { PACKAGE_TIERS, type ListingTerm } from "@/lib/package-tiers";
import { ListingCard } from "./ListingCard";

type ListingFiltersProps = {
  term: ListingTerm;
  initialCategory?: string;
};

export function ListingFilters({ term, initialCategory = "All" }: ListingFiltersProps) {
  const [category, setCategory] = useState(() => normalizeMarketplaceCategory(initialCategory));
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        term,
        category: category === "All" ? "" : category,
      });
      const res = await fetch(`/api/marketplace/listings?${params}`);
      const data = (await res.json()) as { listings?: MarketplaceListing[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setListings(data.listings || []);
    } catch (e) {
      setListings([]);
      setError(e instanceof Error ? e.message : "Could not load listings");
    } finally {
      setLoading(false);
    }
  }, [term, category]);

  useEffect(() => {
    void load();
  }, [load]);

  const tierLabel = term === "starter" ? PACKAGE_TIERS.starter.label : PACKAGE_TIERS.partner.label;

  return (
    <div>
      <div className="mp-chip-row mp-chip-row-simple" role="tablist" aria-label="Role category">
        {MARKETPLACE_CATEGORY_CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`mp-chip ${category === c ? "mp-chip-active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mp-results-count">
        {loading
          ? "Loading…"
          : `${listings.length} ${tierLabel} ${category === "All" ? "packages" : `· ${category}`}`}
      </p>

      {error ? (
        <div className="forge-surface-card py-8 text-center text-sm text-[var(--forge-fire)]">{error}</div>
      ) : null}

      {!loading && listings.length ? (
        <div className="mp-product-grid">
          {listings.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      ) : null}

      {!loading && !listings.length && !error ? (
        <div className="forge-surface-card py-12 text-center">
          <p className="text-sm text-[var(--forge-text-muted)]">
            {term === "starter"
              ? "No Starter packages in this category yet."
              : "No Partner subscriptions in this category yet."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
