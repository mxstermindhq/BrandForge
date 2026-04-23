"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface RankingUser {
  id: string;
  rank: number;
  username: string;
  fullName: string;
  rp: number;
  wins: number;
  losses: number;
}

export function WoWRankingSystem() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<RankingUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const leaderboardData = await apiGetJson<{ users: RankingUser[]; currentUser?: RankingUser }>(
          "/api/leaderboard/ranking",
          accessToken,
        );
        setUsers(leaderboardData.users);
        setCurrentUserRank(leaderboardData.currentUser || null);
      } catch (error: unknown) {
        const apiError = error as { message?: string; status?: number };
        console.error("Failed to load leaderboard:", apiError?.message || error, apiError?.status);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [accessToken]);

  const entries = useMemo(() => users.filter((u) => u.rank > 0), [users]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">Leaderboard</p>
          <h1 className="mt-1 text-3xl font-bold text-on-surface">Top performers</h1>
          <p className="mt-2 text-sm text-on-surface-variant">A clean rank list while the next ranking system is being built.</p>
        </header>

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[64px_1fr_120px_120px] gap-3 border-b border-border bg-muted/30 px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Rating</span>
            <span className="text-right">W / L</span>
          </div>

          {entries.map((p) => (
            <div
              key={p.id}
              className={`grid grid-cols-[64px_1fr_120px_120px] items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0 ${
                currentUserRank?.id === p.id ? "bg-primary/5" : "hover:bg-muted/20"
              }`}
            >
              <span className="font-mono text-sm text-on-surface-variant">#{p.rank}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-on-surface">
                  {p.username ? (
                    <Link href={`/p/${encodeURIComponent(p.username)}`} className="hover:text-primary">
                      {p.fullName || p.username}
                    </Link>
                  ) : (
                    p.fullName || "Member"
                  )}
                  {currentUserRank?.id === p.id ? (
                    <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      You
                    </span>
                  ) : null}
                </p>
                {p.username ? <p className="truncate text-xs text-on-surface-variant">@{p.username}</p> : null}
              </div>
              <span className="text-right font-mono text-sm font-semibold text-on-surface">{p.rp.toLocaleString()}</span>
              <span className="text-right text-sm">
                <span className="text-emerald-500">{p.wins}</span>
                <span className="text-on-surface-variant"> / </span>
                <span className="text-rose-500">{p.losses}</span>
              </span>
            </div>
          ))}
        </div>
        {entries.length === 0 ? (
          <div className="mt-6 rounded-xl border border-border bg-muted/20 p-6 text-sm text-on-surface-variant">
            No ranking entries yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
