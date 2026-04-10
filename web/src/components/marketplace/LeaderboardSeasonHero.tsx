"use client";

import { LEADERBOARD_SEASON_1, seasonTop10TotalUsdt } from "@/config/marketplace-season";

export function LeaderboardSeasonHero({ poolUsdtFromApi }: { poolUsdtFromApi?: number | null }) {
  const pool = typeof poolUsdtFromApi === "number" && poolUsdtFromApi > 0 ? poolUsdtFromApi : null;
  const ladderTotal = seasonTop10TotalUsdt();

  return (
    <section
      className="mb-10 rounded-xl border border-outline-variant/60 bg-surface-container-low p-6"
      aria-labelledby="season-hero-heading"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="section-label !mb-2">BETA RANKINGS</p>
          <h2 id="season-hero-heading" className="mb-3 text-[22px] font-headline font-700 tracking-[-0.03em] text-on-surface">
            Season 1
          </h2>
          <p className="max-w-[480px] text-[13px] font-body leading-[1.6] text-on-surface-variant">
            Rating resets March 29 · Full competitive season starts May 29, 2026. Prizes are target amounts — paid only if
            treasury is funded. Your support makes the ladder real.
          </p>
          <p className="mt-3 max-w-[480px] text-[13px] font-body leading-[1.6] text-on-surface-variant">
            USDT prizes for the top 10 are <span className="text-on-surface font-500">not guaranteed</span>: they only
            happen if we raise enough in treasury and community support. If we don&apos;t hit a viable pool,{" "}
            <span className="text-on-surface font-500">there won&apos;t be a payout</span>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill-primary">TOP 10 · IF FUNDED</span>
            <span className="pill-default">TARGET POOL · {ladderTotal.toLocaleString()} USDT</span>
            {pool != null ? <span className="pill-primary">Treasury so far · {pool.toLocaleString()} USDT</span> : null}
          </div>
        </div>

        <div className="min-w-[280px] lg:min-w-[340px]">
          <p className="section-label !mb-3">Target payouts (ranks 1–10)</p>
          <p className="text-on-surface-variant mb-3 text-[11px] leading-snug">
            Amounts below are targets if the prize pool is fully funded.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {LEADERBOARD_SEASON_1.usdtPrizesByRank.map((row) => (
              <div key={row.rank} className="rounded-lg bg-surface-container-high p-2.5 text-center">
                <p className="mb-1 text-[10px] font-body text-on-surface-variant">#{row.rank}</p>
                <p className="text-[12px] font-headline font-600 text-on-surface tabular-nums">
                  {row.usdt.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
