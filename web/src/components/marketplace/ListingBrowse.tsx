"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { normalizeMarketplaceCategory } from "@/lib/marketplace-categories";
import { normalizeListingTerm, PACKAGE_TIERS, type ListingTerm } from "@/lib/package-tiers";
import { ListingFilters } from "./ListingFilters";

export function ListingBrowse() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const term = normalizeListingTerm(searchParams.get("term"));
  const basePath = "/";

  const setTerm = useCallback(
    (next: ListingTerm) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("term", next);
      router.replace(`${basePath}?${params.toString()}#browse`, { scroll: false });
    },
    [router, searchParams, basePath],
  );

  return (
    <section id="browse" className="forge-section forge-section-alt">
      <div className="forge-container">
        <div className="forge-section-head">
          <p className="forge-section-eyebrow">Packages</p>
          <h2 className="forge-section-title">Pick your role</h2>
          <p className="forge-section-desc">
            {term === "starter"
              ? "Starter — fixed price, one deliverable. Developer, Designer, or Video Editor."
              : "Partner — monthly subscription. Same three roles, ongoing output."}
          </p>
        </div>

        <div className="mp-term-tabs" role="tablist" aria-label="Package tier">
          <button
            type="button"
            role="tab"
            aria-selected={term === "starter"}
            className={`mp-term-tab ${term === "starter" ? "mp-term-tab-active" : ""}`}
            onClick={() => setTerm("starter")}
          >
            Starter
            <span className="mp-term-tab-sub">Fixed price</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={term === "partner"}
            className={`mp-term-tab ${term === "partner" ? "mp-term-tab-active" : ""}`}
            onClick={() => setTerm("partner")}
          >
            Partner
            <span className="mp-term-tab-sub">Subscription</span>
          </button>
        </div>

        <ListingFilters
          term={term}
          initialCategory={normalizeMarketplaceCategory(searchParams.get("category"))}
        />
      </div>
    </section>
  );
}
