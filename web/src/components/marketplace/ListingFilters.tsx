"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "@/content/landing-directory";
import type { ListingSort, ListingTerm, MarketplaceListing } from "@/lib/listings-types";
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
  const [sort, setSort] = useState<ListingSort>(term === "short" ? "ending" : "newest");
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
    setSort(term === "short" ? "ending" : "newest");
  }, [term]);

  const sortOptions = useMemo(
    () => (term === "long" ? SORTS.filter((s) => s.key !== "ending") : SORTS),
    [term],
  );

  return (
    <div>
      <div className="mp-filters-bar">
        <div className="mp-search-wrap">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              term === "short"
                ? "Search short-term listings…"
                : "Search subscriptions…"
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
          {CATEGORIES.map((c) => (
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
        {loading ? "Loading…" : `${listings.length} ${term === "short" ? "short-term" : "subscription"} listings`}
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
            {term === "short"
              ? "No active short-term listings yet. Be the first — sign in and list a service."
              : "No subscriptions listed yet. Sellers can publish recurring offers after onboarding."}
          </p>
          <a href="/login" className="forge-btn forge-btn-primary mt-6 inline-flex">
            Sign in to list
          </a>
        </div>
      ) : null}
    </div>
  );
}
