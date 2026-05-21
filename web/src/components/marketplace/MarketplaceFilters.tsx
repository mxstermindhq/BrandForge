"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, filterProducts } from "@/lib/marketplace";
import type { CategoryId, Product, SortKey } from "@/lib/marketplace/types";
import { ProductCard } from "./ProductCard";

type MarketplaceFiltersProps = {
  initialCategory?: CategoryId | null;
  showCategoryChips?: boolean;
};

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "fastest", label: "Fastest" },
];

export function MarketplaceFilters({ initialCategory = null, showCategoryChips = true }: MarketplaceFiltersProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(initialCategory);
  const [sort, setSort] = useState<SortKey>("popular");

  const products = useMemo(
    () => filterProducts({ categoryId: category, query, sort }),
    [category, query, sort],
  );

  return (
    <div>
      <div className="mp-filters-bar">
        <div className="mp-search-wrap">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, AI, Discord, branding…"
            className="mp-search-input"
            aria-label="Search marketplace"
          />
        </div>
        <div className="mp-sort-wrap">
          {SORTS.map((s) => (
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
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`mp-chip ${category === null ? "mp-chip-active" : ""}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`mp-chip ${category === c.id ? "mp-chip-active" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mp-results-count">{products.length} listings</p>

      {products.length ? (
        <div className="mp-product-grid">
          {products.map((p: Product, i: number) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="forge-surface-card py-12 text-center text-sm text-[var(--forge-text-muted)]">
          No matches. Try another category or search term.
        </div>
      )}
    </div>
  );
}
