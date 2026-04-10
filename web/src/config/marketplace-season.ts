/** Leaderboard / honor season — aligned with product roadmap (client-visible). */
export const LEADERBOARD_SEASON_1 = {
  id: "beta-1",
  name: "Beta season",
  /** First season rating reset only (UTC) — standings refresh; not final USDT settlement. */
  ratingResetAtUtc: "2026-03-29",
  ratingResetLabel: "March 29, 2026",
  /** Official competitive season start (UTC). */
  seasonStartAtUtc: "2026-05-29",
  seasonStartLabel: "May 29, 2026",
  /** Kept for tooling; beta started at public marketplace preview. */
  startsAtUtc: "2026-01-01",
  startsLabel: "January 1, 2026",
  /** Target USDT per rank if the prize pool is fully funded (not guaranteed — see hero copy). */
  usdtPrizesByRank: [
    { rank: 1, usdt: 8000 },
    { rank: 2, usdt: 5000 },
    { rank: 3, usdt: 3500 },
    { rank: 4, usdt: 2500 },
    { rank: 5, usdt: 1800 },
    { rank: 6, usdt: 1200 },
    { rank: 7, usdt: 900 },
    { rank: 8, usdt: 700 },
    { rank: 9, usdt: 500 },
    { rank: 10, usdt: 400 },
  ] as const,
} as const;

export function seasonTop10TotalUsdt(): number {
  return LEADERBOARD_SEASON_1.usdtPrizesByRank.reduce((s, r) => s + r.usdt, 0);
}

/** RP thresholds for Season 1 tier titles (aligned with `seasons.tier_floors` in DB). */
export const TIER_FLOORS_SEASON_1 = {
  challenger: 0,
  rival: 1200,
  duelist: 1800,
  gladiator: 2400,
  undisputed: 2800,
} as const;
