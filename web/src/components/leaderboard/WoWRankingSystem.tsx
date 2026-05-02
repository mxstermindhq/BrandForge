"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Star, Users, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";

type LeaderMeta = {
  totalProfessionals: number;
  totalDealsClosed: number;
};

type LbRow = {
  rank: number;
  userId: string;
  username: string | null;
  displayName: string;
  headline?: string | null;
  ratingAvg?: number | null;
  dealWins?: number;
  dealLosses?: number;
  dealVolume?: number;
  avatarUrl?: string | null;
};

function formatVolumeScore(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  return n.toLocaleString();
}

function normalizeRows(payload: unknown): LbRow[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  const raw = Array.isArray(p.users) ? p.users : Array.isArray(p.entries) ? p.entries : [];
  const out: LbRow[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const rank = Number(r.rank);
    const userId = String(r.userId ?? r.id ?? "").trim();
    if (!userId || !Number.isFinite(rank) || rank <= 0) continue;
    out.push({
      rank,
      userId,
      username: r.username != null ? String(r.username).trim() : null,
      displayName: String(r.displayName ?? r.fullName ?? r.username ?? "Member").trim() || "Member",
      headline: r.headline != null ? String(r.headline) : null,
      ratingAvg: r.ratingAvg != null && Number.isFinite(Number(r.ratingAvg)) ? Number(r.ratingAvg) : null,
      dealWins: Number(r.dealWins) || 0,
      dealLosses: Number(r.dealLosses) || 0,
      dealVolume: Number(r.dealVolume) || 0,
      avatarUrl: r.avatarUrl != null ? String(r.avatarUrl) : null,
    });
  }
  return out;
}

/** Deal-economy leaderboard: closed deals, lifetime volume score, public rating. */
export function PerformanceLeaderboard() {
  const { session, accessToken } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<LbRow[]>([]);
  const [meta, setMeta] = useState<LeaderMeta>({ totalProfessionals: 0, totalDealsClosed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiGetJson<Record<string, unknown>>(
          "/api/leaderboard/performance?limit=200",
          accessToken ?? null,
        );
        if (cancelled) return;
        setRows(normalizeRows(data));
        const m = data.meta as LeaderMeta | undefined;
        setMeta({
          totalProfessionals: Number(m?.totalProfessionals) || 0,
          totalDealsClosed: Number(m?.totalDealsClosed) || 0,
        });
      } catch {
        if (!cancelled) {
          setRows([]);
          setMeta({ totalProfessionals: 0, totalDealsClosed: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const entries = useMemo(() => rows.filter((u) => u.rank > 0), [rows]);

  return (
    <div className="w-full bg-background pb-12 pt-0 text-foreground">
      <div className="mx-auto max-w-5xl px-2 sm:px-0">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Leaderboard</p>
            <h1 className="mt-1 text-2xl font-bold text-on-surface sm:text-3xl">Top performers</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Ranked by on-platform wins, earnings score, and losses — plus public rating.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm">
            <div className="flex min-w-[8rem] items-center gap-2">
              <Users className="h-4 w-4 text-sky-500" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Members</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-on-surface">
                  {loading ? "…" : meta.totalProfessionals.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex min-w-[8rem] items-center gap-2">
              <Handshake className="h-4 w-4 text-emerald-500" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Deals closed</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-on-surface">
                  {loading ? "…" : meta.totalDealsClosed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* CTA Banner for Guests */}
        {!session && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-on-surface">See your rank on the leaderboard</p>
                <p className="text-sm text-muted-foreground">Sign in to track your position and join the competition</p>
              </div>
              <button
                onClick={() => router.push(`/login?next=/leaderboard`)}
                className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 transition"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="hidden grid-cols-[52px_minmax(12rem,1fr)_64px_72px_72px] gap-x-3 border-b border-border bg-muted/30 px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
            <span>#</span>
            <span>Member</span>
            <span className="text-right text-orange-500">Rating</span>
            <span className="text-right text-sky-600 dark:text-sky-400">Earnings</span>
            <span className="text-right text-rose-600 dark:text-rose-400">Burnings</span>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">Loading standings…</div>
          ) : entries.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No ranking entries yet.</div>
          ) : (
            entries.map((p) => (
              <div
                key={p.userId}
                className="grid grid-cols-1 gap-2 border-b border-border/60 px-3 py-4 last:border-0 sm:grid-cols-[52px_minmax(12rem,1fr)_64px_72px_72px] sm:items-start sm:gap-x-3"
              >
                <div className="flex items-start gap-3 sm:contents">
                  <span className="shrink-0 font-mono text-sm text-muted-foreground sm:pt-0.5">#{p.rank}</span>
                  <div className="min-w-0 sm:pt-0.5 sm:text-left">
                    <p className="break-words text-sm font-medium leading-snug text-on-surface">
                      {p.username ? (
                        <Link href={`/p/${encodeURIComponent(p.username)}`} className="hover:text-primary">
                          {p.displayName}
                        </Link>
                      ) : (
                        p.displayName
                      )}
                    </p>
                    {p.headline ? (
                      <p className="mt-0.5 break-words text-xs leading-snug text-muted-foreground">{p.headline}</p>
                    ) : p.username ? (
                      <p className="mt-0.5 break-all text-xs text-muted-foreground">@{p.username}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 sm:contents">
                  <div className="flex items-center gap-1 text-sm sm:block sm:text-right">
                    <Star className="h-3.5 w-3.5 text-amber-500 sm:hidden" aria-hidden />
                    <span className="text-muted-foreground sm:hidden">Rating</span>
                    <span className="font-mono font-semibold text-orange-500 tabular-nums sm:w-full sm:text-right">
                      {p.ratingAvg != null ? p.ratingAvg.toFixed(1) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm sm:block sm:text-right">
                    <span className="text-muted-foreground sm:hidden">Earnings</span>
                    <span className="font-mono font-semibold text-sky-600 tabular-nums dark:text-sky-400 sm:w-full sm:text-right">
                      {formatVolumeScore(p.dealVolume ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm sm:block sm:text-right">
                    <span className="text-muted-foreground sm:hidden">Burnings</span>
                    <span className="font-mono font-semibold text-rose-600 tabular-nums dark:text-rose-400 sm:w-full sm:text-right">
                      {(p.dealLosses ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Earnings score is a lifetime activity index (not bank USD). Marketplace-wide dollar estimates are on the{" "}
          <Link href="/marketplace" className="text-primary underline-offset-2 hover:underline">
            marketplace
          </Link>{" "}
          header.
        </p>
      </div>
    </div>
  );
}

/** @deprecated Prefer `PerformanceLeaderboard`. */
export const WoWRankingSystem = PerformanceLeaderboard;
