"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { ListingTerm } from "@/lib/listings-types";
import { ListingFilters } from "./ListingFilters";

function parseTerm(raw: string | null): ListingTerm {
  return raw === "long" || raw === "subscriptions" ? "long" : "short";
}

export function ListingBrowse() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const term = parseTerm(searchParams.get("term"));
  const basePath = pathname === "/marketplace" ? "/marketplace" : "/";

  const setTerm = useCallback(
    (next: ListingTerm) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("term", next);
      const hash = basePath === "/" ? "#browse" : "";
      router.replace(`${basePath}?${params.toString()}${hash}`, { scroll: false });
    },
    [router, searchParams, basePath],
  );

  return (
    <section id="browse" className="forge-section forge-section-alt">
      <div className="forge-container">
        <div className="forge-section-head">
          <p className="forge-section-eyebrow">Live listings</p>
          <h2 className="forge-section-title">Browse the forge</h2>
          <p className="forge-section-desc">
            {term === "short"
              ? "One-off services and projects with a clear end date — order via Discord or Telegram."
              : "Recurring subscriptions and retainers — message to start."}
          </p>
        </div>

        <div className="mp-term-tabs" role="tablist" aria-label="Listing type">
          <button
            type="button"
            role="tab"
            aria-selected={term === "short"}
            className={`mp-term-tab ${term === "short" ? "mp-term-tab-active" : ""}`}
            onClick={() => setTerm("short")}
          >
            Short term
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={term === "long"}
            className={`mp-term-tab ${term === "long" ? "mp-term-tab-active" : ""}`}
            onClick={() => setTerm("long")}
          >
            Long term
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
