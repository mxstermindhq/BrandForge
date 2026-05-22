"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
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
          <p className="forge-section-eyebrow">Live packages</p>
          <h2 className="forge-section-title">Browse the forge</h2>
          <p className="forge-section-desc">
            {term === "starter"
              ? `Starter packages ($${PACKAGE_TIERS.starter.minUsd}–$${PACKAGE_TIERS.starter.maxUsd.toLocaleString()}) — fixed scope, crypto checkout.`
              : `Partner packages ($${PACKAGE_TIERS.partner.minUsd}–$${PACKAGE_TIERS.partner.maxUsd.toLocaleString()}) — retainers and scale engagements.`}
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
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={term === "partner"}
            className={`mp-term-tab ${term === "partner" ? "mp-term-tab-active" : ""}`}
            onClick={() => setTerm("partner")}
          >
            Partner
          </button>
        </div>

        <ListingFilters
          term={term}
          initialCategory={searchParams.get("category") || "All"}
        />
      </div>
    </section>
  );
}
