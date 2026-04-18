"use client";

import { useState, useEffect } from "react";
import { apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface RankingUser {
  id: string;
  rank: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
  honor: number;
  conquest: number;
  rp: number;
  tier: "challenger" | "rival" | "duelist" | "gladiator" | "undisputed";
  wins: number;
  losses: number;
  streak: number;
  seasonWins: number;
  lastActiveAt: string;
}

interface SeasonInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  competitiveMode: boolean;
  tierFloors: Record<string, number>;
}

const tierConfig = {
  challenger: { color: "#8B9A8B", icon: "military_tech", name: "Challenger", minRp: 0 },
  rival: { color: "#A0A0A0", icon: "shield", name: "Rival", minRp: 1000 },
  duelist: { color: "#CD7F32", icon: "swords", name: "Duelist", minRp: 2000 },
  gladiator: { color: "#C0C0C0", icon: "local_fire_department", name: "Gladiator", minRp: 3500 },
  undisputed: { color: "#9D4EDD", icon: "stars", name: "Undisputed Gladiator", minRp: 5000 },
};

type TabType = "ranking" | "honor" | "conquest" | "streak" | "season";

export function WoWRankingSystem() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("ranking");
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [season, setSeason] = useState<SeasonInfo | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<RankingUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [leaderboardData, seasonData] = await Promise.all([
          apiGetJson<{ users: RankingUser[]; currentUser?: RankingUser }>(`/api/leaderboard/${activeTab}`, accessToken),
          apiGetJson<SeasonInfo>("/api/season/current", accessToken),
        ]);
        setUsers(leaderboardData.users);
        setCurrentUserRank(leaderboardData.currentUser || null);
        setSeason(seasonData);
      } catch (error: any) {
        console.error("Failed to load leaderboard:", error?.message || error, error?.status);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeTab, accessToken]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "ranking", label: "RP Ranking", icon: "military_tech" },
    { id: "honor", label: "Honor", icon: "favorite" },
    { id: "conquest", label: "Conquest", icon: "emoji_events" },
    { id: "streak", label: "Win Streak", icon: "local_fire_department" },
    { id: "season", label: "Season", icon: "calendar_month" },
  ];

  function getTierBadge(tier: string) {
    const config = tierConfig[tier as keyof typeof tierConfig];
    if (!config) return null;

    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: `${config.color}20`, color: config.color, border: `1px solid ${config.color}50` }}
      >
        <span className="material-symbols-outlined text-sm">{config.icon}</span>
        {config.name}
      </div>
    );
  }

  function getRankDisplay(rank: number) {
    if (rank === 1) return { icon: "🏆", color: "#FFD700", bg: "bg-amber-500/10 border-amber-500/30" };
    if (rank === 2) return { icon: "🥈", color: "#C0C0C0", bg: "bg-slate-400/10 border-slate-400/30" };
    if (rank === 3) return { icon: "🥉", color: "#CD7F32", bg: "bg-orange-600/10 border-orange-600/30" };
    return { icon: `#${rank}`, color: undefined, bg: "bg-surface-container-high border-outline-variant" };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Season Header */}
      {season && (
        <div className="surface-card p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-on-primary">emoji_events</span>
              </div>
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface">{season.name}</h2>
                <p className="text-sm text-on-surface-variant">
                  {season.startDate ? new Date(season.startDate).toLocaleDateString() : '-'} - {season.endDate ? new Date(season.endDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-on-surface-variant uppercase tracking-wide">Prize Pool</p>
                <p className="text-xl font-bold text-primary">${season.prizePool?.toLocaleString() || 0}</p>
              </div>
              {season.competitiveMode && (
                <div className="px-3 py-1.5 rounded-full bg-error/10 border border-error/30 text-error text-xs font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                  Competitive
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Current User Stats */}
      {currentUserRank && (
        <div className="surface-card p-5 mb-6 border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-semibold text-on-surface">Your Standing</h3>
            {getTierBadge(currentUserRank.tier)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-surface-container-low">
              <p className="text-2xl font-bold text-on-surface">#{currentUserRank.rank}</p>
              <p className="text-xs text-on-surface-variant">Global Rank</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low">
              <p className="text-2xl font-bold text-primary">{currentUserRank.rp?.toLocaleString() || 0}</p>
              <p className="text-xs text-on-surface-variant">RP Points</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low">
              <p className="text-2xl font-bold text-amber-400">{currentUserRank.honor?.toLocaleString() || 0}</p>
              <p className="text-xs text-on-surface-variant">Honor</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low">
              <p className="text-2xl font-bold text-emerald-400">{currentUserRank.conquest?.toLocaleString() || 0}</p>
              <p className="text-xs text-on-surface-variant">Conquest</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-outline-variant flex-wrap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-success">trending_up</span>
              <span className="text-sm text-on-surface">
                <strong>{currentUserRank.wins}</strong> Wins
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error">trending_down</span>
              <span className="text-sm text-on-surface">
                <strong>{currentUserRank.losses}</strong> Losses
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
              <span className="text-sm text-on-surface">
                <strong>{currentUserRank.streak}</strong> Streak
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="material-symbols-outlined text-primary">workspace_premium</span>
              <span className="text-sm text-on-surface">
                <strong>{currentUserRank.seasonWins}</strong> Season Wins
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-outline"
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-high">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Player</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tier</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  {activeTab === "honor" ? "Honor" : activeTab === "conquest" ? "Conquest" : activeTab === "streak" ? "Streak" : "RP"}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wide">W/L</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const rankDisplay = getRankDisplay(user.rank);
                const winRate = user.wins + user.losses > 0 ? Math.round((user.wins / (user.wins + user.losses)) * 100) : 0;
                const score = activeTab === "honor" ? user.honor : activeTab === "conquest" ? user.conquest : activeTab === "streak" ? user.streak : user.rp;
                const uniqueKey = user.id || `user-${index}`;

                return (
                  <tr
                    key={uniqueKey}
                    className={`border-b border-outline-variant/50 hover:bg-surface-container-high/50 transition-colors ${
                      currentUserRank?.id === user.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border ${rankDisplay.bg}`}
                        style={rankDisplay.color ? { color: rankDisplay.color } : undefined}
                      >
                        <span className="font-bold">{rankDisplay.icon}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant">person</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{user.fullName || user.username}</p>
                          <p className="text-xs text-on-surface-variant">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getTierBadge(user.tier)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-lg font-bold text-on-surface">{score?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-on-surface">
                        <span className="text-success">{user.wins}</span>
                        <span className="text-on-surface-variant mx-1">/</span>
                        <span className="text-error">{user.losses}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 rounded-full bg-surface-container-low overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${winRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-on-surface w-10">{winRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier Legend */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {Object.entries(tierConfig).map(([key, config]) => (
          <div
            key={key}
            className="p-3 rounded-lg border text-center"
            style={{ borderColor: `${config.color}50`, backgroundColor: `${config.color}10` }}
          >
            <span className="material-symbols-outlined text-lg" style={{ color: config.color }}>
              {config.icon}
            </span>
            <p className="text-xs font-medium mt-1" style={{ color: config.color }}>
              {config.name}
            </p>
            <p className="text-[10px] text-on-surface-variant/70">{config.minRp}+ RP</p>
          </div>
        ))}
      </div>
    </div>
  );
}
