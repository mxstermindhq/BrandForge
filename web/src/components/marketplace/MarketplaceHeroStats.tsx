"use client";

export type MarketplaceHeroStatsModel = {
  requestsActive: number;
  servicesActive: number;
  totalBids: number;
  dealsSigned: number;
};

/** Maps bootstrap `marketplaceStats` (possibly stale snapshot) into hero figures. */
export function resolveMarketplaceHeroStats(
  ms: Record<string, unknown> | null | undefined,
  openRequestsFallback: number,
): MarketplaceHeroStatsModel {
  const m = ms && typeof ms === "object" ? ms : {};
  const num = (k: string) => {
    const v = m[k];
    return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
  };
  let requestsActive = num("requestsActive");
  if (requestsActive == null) {
    const ro = num("requestsOpen");
    const rr = num("requestsReview");
    if (ro != null && rr != null) requestsActive = ro + rr;
  }
  if (requestsActive == null) requestsActive = openRequestsFallback;
  return {
    requestsActive,
    servicesActive: num("servicesPublished") ?? 0,
    totalBids: num("bidsTotal") ?? 0,
    dealsSigned: num("dealsSigned") ?? 0,
  };
}

type Props = {
  stats: MarketplaceHeroStatsModel;
  /** e.g. md:text-right when placed beside copy */
  align?: "left" | "right";
};

function StatCell({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="stat-block min-w-[5.5rem] items-start sm:items-end">
      <span className="stat-number tabular-nums">{value}</span>
      <span className="stat-label text-left sm:text-right">{label}</span>
    </div>
  );
}

export function MarketplaceHeroStats({ stats, align = "left" }: Props) {
  const justify = align === "right" ? "sm:justify-end" : "";
  return (
    <div className={`flex shrink-0 flex-wrap items-start gap-8 ${justify}`}>
      <StatCell value={stats.requestsActive} label="Active requests" />
      <StatCell value={stats.servicesActive} label="Active services" />
      <StatCell value={stats.totalBids} label="Total bids" />
      <StatCell value={stats.dealsSigned} label="Deals signed" />
    </div>
  );
}
