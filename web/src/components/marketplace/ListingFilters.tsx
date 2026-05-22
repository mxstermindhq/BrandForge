"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES as MARKETPLACE_CATEGORIES } from "@/lib/marketplace/data";

const CATEGORY_CHIPS = ["All", ...MARKETPLACE_CATEGORIES.map((c) => c.name)];
import type { ListingSort, MarketplaceListing } from "@/lib/listings-types";
import { PACKAGE_TIERS, type ListingTerm } from "@/lib/package-tiers";
import { ListingCard } from "./ListingCard";

type ListingFiltersProps = {
  term: ListingTerm;
  showCategoryChips?: boolean;
  initialCategory?: string;
};

const SORTS: { key: ListingSort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "ending", label: "Ending soon" },
];

export function ListingFilters({ term, showCategoryChips = true, initialCategory = "All" }: ListingFiltersProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(initialCategory || "All");
  const [sort, setSort] = useState<ListingSort>(term === "starter" ? "ending" : "newest");
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        term,
        sort,
        category: category === "All" ? "" : category,
        q: query.trim(),
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
  }, [term, sort, category, query]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), query ? 280 : 0);
    return () => window.clearTimeout(t);
  }, [load, query]);

  useEffect(() => {
    setSort(term === "starter" ? "ending" : "newest");
  }, [term]);

  const sortOptions = useMemo(
    () => (term === "partner" ? SORTS.filter((s) => s.key !== "ending") : SORTS),
    [term],
  );

  const tierLabel = term === "starter" ? PACKAGE_TIERS.starter.label : PACKAGE_TIERS.partner.label;

  return (
    <div>
      <div className="mp-filters-bar">
        <div className="mp-search-wrap">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              term === "starter"
                ? "Search Starter packages…"
                : "Search Partner packages…"
            }
            className="mp-search-input"
            aria-label="Search listings"
          />
        </div>
        <div className="mp-sort-wrap">
          {sortOptions.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={`mp-sort-chip ${sort === s.key ? "mp-sort-chip-active" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {showCategoryChips ? (
        <div className="mp-chip-row">
          {CATEGORY_CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`mp-chip ${category === c ? "mp-chip-active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mp-results-count">
        {loading ? "Loading…" : `${listings.length} ${tierLabel} packages`}
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
              ? "No Starter packages in this category yet. Official catalog fills each category with up to three tiers."
              : "No Partner packages in this category yet. Partner listings support retainers ($500–$2k) and scale engagements up to $15k."}
          </p>
          <a href="/login" className="forge-btn forge-btn-primary mt-6 inline-flex">
            Sign in to list
          </a>
        </div>
      ) : null}
    </div>
  );
}
