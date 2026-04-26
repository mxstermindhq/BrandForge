"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LeaderboardSeasonHero } from "@/components/marketplace/LeaderboardSeasonHero";
import { LEADERBOARD_SEASON_1 } from "@/config/marketplace-season";
import { apiGetJson } from "@/lib/api";
import { safeImageSrc } from "@/lib/image-url";
import { useAuth } from "@/providers/AuthProvider";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { OnlinePresenceDot } from "@/components/ui/OnlinePresenceDot";

function usdtPrizeForRank(rank: number): number | null {
  const hit = LEADERBOARD_SEASON_1.usdtPrizesByRank.find((r) => r.rank === rank);
  return hit ? hit.usdt : null;
}

type LbEntry = {
  rank: number;
  userId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  isVerified?: boolean;
  topMember?: boolean;
  currentRp: number;
  peakRp: number;
  currentTier: string;
  winStreak: number;
  honor: number;
  conquest: number;
  neonScore: number;
  weeklyDeals: number;
  winRate: number;
  dealWins: number;
  dealLosses: number;
};

type SeasonPayload = {
  name?: string;
  slug?: string;
  ends_at?: string;
  competitive_starts_at?: string;
  prize_pool_usd?: number;
  payout_structure?: unknown;
  competitive_mode?: boolean;
  tier_floors?: Record<string, number>;
} | null;

type TabId = "rating" | "honor" | "conquest" | "streak";

const TABS: { id: TabId; label: string; subtitle: string }[] = [
  { id: "rating", label: "Season Rating", subtitle: "By Neon Score" },
  { id: "honor", label: "Top Honor", subtitle: "Activity leaders" },
  { id: "conquest", label: "Top Conquest", subtitle: "Deal closers" },
  { id: "streak", label: "Top Streaks", subtitle: "Longest win runs" },
];

function tierCssVar(tier: string): string {
  const t = String(tier || "").toLowerCase();
  if (t === "rival") return "var(--tier-rival)";
  if (t === "duelist") return "var(--tier-duelist)";
  if (t === "gladiator") return "var(--tier-gladiator)";
  if (t === "undisputed") return "var(--tier-undisputed)";
  return "var(--tier-challenger)";
}

function rankNumColor(rank: number): string {
  if (rank === 1) return "var(--rank-gold)";
  if (rank === 2) return "var(--rank-silver)";
  if (rank === 3) return "var(--rank-bronze)";
  return "var(--color-on-surface-variant)";
}

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function LeaderboardClient() {
  const { data: boot, err: bootErr, loading: bootLoading } = useBootstrap();
  const { session, authReady } = useAuth();
  const [tab, setTab] = useState<TabId>("rating");
  const [entries, setEntries] = useState<LbEntry[]>([]);
  const [season, setSeason] = useState<SeasonPayload>(null);
  const [lbLoading, setLbLoading] = useState(true);
  const [lbErr, setLbErr] = useState<string | null>(null);
  const [onlineLbIds, setOnlineLbIds] = useState<string[]>([]);

  const poolUsdt =
    typeof boot?.seasonRewardPoolUsdt === "number" && boot.seasonRewardPoolUsdt > 0
      ? boot.seasonRewardPoolUsdt
      : typeof season?.prize_pool_usd === "number"
        ? Number(season.prize_pool_usd)
        : null;

  const viewerId = session?.user?.id ? String(session.user.id) : null;
  const [viewerTier, setViewerTier] = useState<string | null>(null);

  const onlineLbSet = useMemo(() => new Set(onlineLbIds), [onlineLbIds]);

  useEffect(() => {
    if (!authReady || !viewerId) {
      setViewerTier(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        let t = session?.access_token ?? null;
        if (!t) t = await getAccessToken();
        const json = await apiGetJson<{ rating: { current_tier?: string } | null }>(
          `/api/users/${encodeURIComponent(viewerId)}/rating`,
          t,
        );
        const ct = json.rating?.current_tier;
        if (!cancelled) setViewerTier(ct ? String(ct).toLowerCase() : null);
      } catch {
        if (!cancelled) setViewerTier(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, viewerId, session?.access_token]);

  const loadLb = useCallback(async () => {
    setLbLoading(true);
    setLbErr(null);
    try {
      let t = session?.access_token ?? null;
      if (!t) t = await getAccessToken();
      const json = await apiGetJson<{
        entries: LbEntry[];
        season: SeasonPayload;
        onlineUserIds?: string[];
      }>(`/api/leaderboard/${tab}`, t);
      setEntries(Array.isArray(json.entries) ? json.entries : []);
      setSeason(json.season ?? null);
      setOnlineLbIds(
        Array.isArray(json.onlineUserIds) ? json.onlineUserIds.map((id) => String(id)) : [],
      );
    } catch (e) {
      setLbErr(e instanceof Error ? e.message : "Failed to load standings");
      setEntries([]);
      setSeason(null);
    } finally {
      setLbLoading(false);
    }
  }, [tab, session?.access_token]);

  useEffect(() => {
    if (!authReady) return;
    void loadLb();
  }, [authReady, loadLb]);

  if (bootLoading) {
    return <PageRouteLoading title="Loading leaderboard" subtitle="Fetching season standings." />;
  }

  if (bootErr) {
    return (
      <p className="text-error px-2" role="alert">
        {bootErr}
      </p>
    );
  }

  return (
    <div className="page-root pb-28">
      <div className="page-content mx-auto max-w-[960px]">
        <LeaderboardSeasonHero poolUsdtFromApi={poolUsdt} />

        <section
          className="mb-8 rounded-xl border border-outline-variant/60 bg-surface-container-low p-5"
          aria-labelledby="scoring-heading"
        >
          <p id="scoring-heading" className="section-label !mb-2">
            SCORING SYSTEM
          </p>
          <p className="text-[13px] font-body leading-[1.65] text-on-surface-variant">
            <span className="block font-600 text-on-surface">Neon Score = Honor + (Conquest × 10)</span>
            <span className="mt-2 block">
              Honor (resets weekly) — bids +25 · deal messages +10 · profile milestones +50
            </span>
            <span className="mt-1 block">
              Conquest (permanent) — signed deals +250 · reviews received +100
            </span>
            <span className="mt-1 block">
              Rating (RP) — drives your Tier. Decays 2% weekly without a deal once competitive mode is on.
            </span>
          </p>
        </section>

        <section className="mb-8" aria-label="Tier thresholds">
          <p className="section-label !mb-3">TIERS</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { tier: "Challenger", range: "0–1,200", note: "Entry", key: "challenger" },
              { tier: "Rival", range: "1,200–1,800", note: "Profile badge", key: "rival" },
              { tier: "Duelist", range: "1,800–2,400", note: "Priority in search", key: "duelist" },
              { tier: "Gladiator", range: "2,400–2,800", note: "12% fee (vs 15%)", key: "gladiator" },
              { tier: "Undisputed", range: "2,800+", note: "Top 1% cap", key: "undisputed" },
            ].map((row) => {
              const ring = Boolean(viewerTier && viewerTier === row.key);
              return (
                <div
                  key={row.key}
                  className={`rounded-xl border border-outline-variant/50 bg-surface-container-high/40 p-3 text-center ${
                    ring ? "ring-2 ring-outline-variant" : ""
                  }`}
                >
                  <span
                    className="mx-auto mb-2 block h-2 w-2 rounded-full"
                    style={{ backgroundColor: tierCssVar(row.key) }}
                    aria-hidden
                  />
                  <p className="font-headline text-[11px] font-700 tracking-wide text-on-surface">{row.tier}</p>
                  <p className="mt-1 text-[10px] tabular-nums text-on-surface-variant">{row.range} RP</p>
                  <p className="mt-1 text-[10px] text-on-surface-variant/90">{row.note}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div
          className="mb-6 flex w-full max-w-full flex-wrap items-center gap-1 overflow-x-auto rounded-xl border border-outline-variant/60 bg-surface-container-low p-1"
          role="tablist"
          aria-label="Leaderboard categories"
        >
          {TABS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={tab === opt.id}
              onClick={() => setTab(opt.id)}
              className={`min-h-10 shrink-0 rounded-lg px-3 py-1.5 text-left text-[12px] font-headline font-600 tracking-[0.04em] transition-colors duration-150 ${
                tab === opt.id
                  ? "bg-surface-container-highest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="block">{opt.label}</span>
              <span
                className={`mt-0.5 block text-[10px] font-body font-normal normal-case tracking-normal ${
                  tab === opt.id ? "text-on-surface-variant" : "text-on-surface-variant/70"
                }`}
              >
                {opt.subtitle}
              </span>
            </button>
          ))}
        </div>

        {lbErr ? (
          <p className="text-error text-sm" role="alert">
            {lbErr}
          </p>
        ) : null}

        {lbLoading ? (
          <PageRouteLoading title="Loading standings" subtitle="Fetching live ladder." variant="inline" />
        ) : entries.length === 0 ? (
          <div className="empty-state rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/30 py-16">
            <p className="empty-state-body text-center text-on-surface-variant">
              No warriors yet this week. First to battle sets the pace.
            </p>
          </div>
        ) : (
          <section aria-labelledby="standings-heading">
            <p id="standings-heading" className="section-label">
              Standings
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-low">
              <div className="text-on-surface-variant bg-surface-container-low/40 hidden border-b border-outline-variant/20 px-4 py-3 text-[9px] font-black uppercase tracking-wider xl:grid xl:grid-cols-[44px_72px_100px_minmax(0,1.2fr)_56px_64px_72px_72px] xl:gap-2">
                <span>#</span>
                <span>Rating (RP)</span>
                <span>Tier</span>
                <span>Member</span>
                <span>Streak</span>
                <span className="hidden lg:block">Honor</span>
                <span className="hidden lg:block">Conquest</span>
                <span className="text-right">W / L</span>
              </div>
              <ul className="divide-outline-variant/15 divide-y">
                {entries.map((row) => {
                  const rank = row.rank;
                  const tier = String(row.currentTier || "challenger").toLowerCase();
                  const undisputed = tier === "undisputed";
                  const streakShow = row.winStreak >= 3;
                  const rpHighlight = (row.weeklyDeals ?? 0) > 0;
                  const prizeUsdt = usdtPrizeForRank(rank);
                  const av = safeImageSrc(row.avatarUrl);
                  const tierUndisputedPill = undisputed ? "bf-undisputed-pill" : "";

                  return (
                    <li key={row.userId}>
                      <div
                        className={`hover:bg-surface-container-high/50 grid grid-cols-[36px_1fr] gap-3 px-4 py-4 xl:hidden ${
                          undisputed ? "bf-undisputed-row rounded-lg" : ""
                        }`}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className="font-headline text-sm font-black tabular-nums"
                            style={{ color: rankNumColor(rank) }}
                          >
                            {String(rank).padStart(2, "0")}
                          </span>
                          <span
                            className={`font-headline text-base font-black tabular-nums leading-none ${
                              rpHighlight ? "text-secondary" : "text-on-surface"
                            }`}
                          >
                            {row.currentRp.toLocaleString()}
                          </span>
                          <span className="text-on-surface-variant text-[10px]">RP</span>
                        </div>
                        <div className="flex min-w-0 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-headline font-600 capitalize ${tierUndisputedPill}`}
                              style={{
                                borderColor: tierCssVar(tier),
                                color: tierCssVar(tier),
                              }}
                            >
                              {tier}
                            </span>
                            {prizeUsdt != null ? (
                              <span className="text-on-surface-variant font-headline text-[9px] font-bold uppercase tracking-wider">
                                Target · {prizeUsdt.toLocaleString()} USDT
                              </span>
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="relative shrink-0">
                                <div className="bg-surface-container-high relative h-9 w-9 overflow-hidden rounded-full">
                                  {av ? (
                                    <Image src={av} alt="" fill className="object-cover" sizes="36px" />
                                  ) : (
                                    <span className="text-primary flex h-full items-center justify-center text-xs font-headline font-700">
                                      {(row.username || "?").slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <OnlinePresenceDot
                                  active={onlineLbSet.has(row.userId)}
                                  className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-container-low"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-normal text-on-surface">
                                  {row.username ? (
                                    <Link
                                      href={`/p/${encodeURIComponent(row.username)}`}
                                      className="font-normal hover:text-secondary"
                                    >
                                      {row.username}
                                    </Link>
                                  ) : (
                                    "Member"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-on-surface-variant grid grid-cols-2 gap-2 text-[11px] tabular-nums sm:grid-cols-4">
                            <div>
                              <span className="text-on-surface-variant block text-[9px] font-bold uppercase">Streak</span>
                              {streakShow ? (
                                <span className="text-on-surface font-semibold">
                                  🔥 {row.winStreak.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-on-surface-variant">—</span>
                              )}
                            </div>
                            <div>
                              <span className="text-on-surface-variant block text-[9px] font-bold uppercase">Honor</span>
                              <span className="text-secondary font-semibold">{row.honor.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-on-surface-variant block text-[9px] font-bold uppercase">
                                Conquest
                              </span>
                              <span
                                className="font-semibold"
                                style={{ color: "var(--color-primary-container)" }}
                              >
                                {row.conquest.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-on-surface-variant block text-[9px] font-bold uppercase">W/L</span>
                              <span className="text-on-surface font-semibold">
                                <span className="text-secondary">{row.dealWins}</span>
                                <span className="text-on-surface-variant"> / </span>
                                <span className="text-error/90">{row.dealLosses}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`hover:bg-surface-container-high/50 hidden grid-cols-[44px_72px_100px_minmax(0,1.2fr)_56px_64px_72px_72px] items-center gap-2 px-4 py-3 xl:grid ${
                          undisputed ? "bf-undisputed-row" : ""
                        }`}
                      >
                        <span
                          className="font-headline text-sm font-black tabular-nums"
                          style={{ color: rankNumColor(rank) }}
                        >
                          {String(rank).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-headline text-base font-black tabular-nums ${
                            rpHighlight ? "text-secondary" : "text-on-surface"
                          }`}
                        >
                          {row.currentRp.toLocaleString()}
                        </span>
                        <span
                          className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-headline font-600 capitalize ${tierUndisputedPill}`}
                          style={{ borderColor: tierCssVar(tier), color: tierCssVar(tier) }}
                        >
                          {tier}
                        </span>
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="relative shrink-0">
                            <div className="bg-surface-container-high relative h-9 w-9 overflow-hidden rounded-full">
                              {av ? (
                                <Image src={av} alt="" fill className="object-cover" sizes="36px" />
                              ) : (
                                <span className="text-primary flex h-full items-center justify-center text-xs font-headline font-700">
                                  {(row.username || "?").slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <OnlinePresenceDot
                              active={onlineLbSet.has(row.userId)}
                              className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-container-low"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-normal text-on-surface">
                              {row.username ? (
                                <Link
                                  href={`/p/${encodeURIComponent(row.username)}`}
                                  className="font-normal hover:text-secondary"
                                >
                                  {row.username}
                                </Link>
                              ) : (
                                "Member"
                              )}
                              {row.isVerified ? (
                                <span className="text-primary ml-1 text-[10px]" title="Verified">
                                  ✓
                                </span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                        <span className="text-on-surface text-sm tabular-nums">
                          {streakShow ? `🔥 ${row.winStreak}` : "—"}
                        </span>
                        <span className="text-secondary hidden text-sm font-semibold tabular-nums lg:block">
                          {row.honor.toLocaleString()}
                        </span>
                        <span
                          className="hidden text-sm font-semibold tabular-nums lg:block"
                          style={{ color: "var(--color-primary-container)" }}
                        >
                          {row.conquest.toLocaleString()}
                        </span>
                        <p className="text-on-surface text-sm tabular-nums text-right">
                          <span className="text-secondary font-semibold">{row.dealWins}</span>
                          <span className="text-on-surface-variant font-light"> / </span>
                          <span className="text-error/90 font-semibold">{row.dealLosses}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
