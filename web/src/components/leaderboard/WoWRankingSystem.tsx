"use client";

import { useState, useEffect } from "react";
import { apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import {
  Trophy, Flame, TrendingUp, TrendingDown, Minus, Crown, Shield, Swords, Star, Medal,
  Search, Filter, Clock
} from "lucide-react";

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
  trend?: "up" | "down" | "same";
  change?: number;
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

const tabs = [
  { id: "ranking" as const, label: "Rating", icon: Medal },
  { id: "honor" as const, label: "Honor", icon: Shield },
  { id: "conquest" as const, label: "Conquest", icon: Trophy },
  { id: "streak" as const, label: "Win Streak", icon: Flame },
  { id: "season" as const, label: "Season", icon: Star },
];

const tiers = [
  { name: "Challenger", min: 0, color: "text-muted-foreground", bg: "from-muted/50 to-muted", icon: Medal },
  { name: "Rival", min: 1000, color: "text-sky-500 dark:text-sky-400", bg: "from-sky-500/20 to-sky-700/10", icon: Shield },
  { name: "Duelist", min: 2000, color: "text-amber-500 dark:text-amber-400", bg: "from-amber-500/30 to-orange-700/20", icon: Swords },
  { name: "Gladiator", min: 3500, color: "text-rose-500 dark:text-rose-400", bg: "from-rose-500/20 to-red-700/10", icon: Flame },
  { name: "Undisputed", min: 5000, color: "text-purple-500 dark:text-purple-400", bg: "from-purple-500/30 to-fuchsia-700/20", icon: Crown },
];

function getTier(rp: number) {
  return [...tiers].reverse().find((t) => rp >= t.min) || tiers[0];
}

type TabType = "ranking" | "honor" | "conquest" | "streak" | "season";

// Podium Card Component
function PodiumCard({ 
  player, 
  rank, 
  activeTab, 
  tierFn, 
  isFirst = false 
}: { 
  player: RankingUser; 
  rank: number; 
  activeTab: TabType;
  tierFn: (rp: number) => typeof tiers[0];
  isFirst?: boolean;
}) {
  const getValue = () => {
    if (activeTab === "honor") return player.honor;
    if (activeTab === "conquest") return player.conquest;
    if (activeTab === "streak") return player.streak;
    return player.rp;
  };

  const tierValue = getValue();
  const tier = tierFn(typeof tierValue === "number" && !isNaN(tierValue) ? tierValue : 0);
  const TierIcon = tier.icon || Medal;
  const heightClass = rank === 1 ? "h-48" : rank === 2 ? "h-40" : "h-36";
  const borderClass = isFirst ? "border-amber-500/40" : "border-border";
  const avatarGradient = isFirst 
    ? "from-amber-400 to-amber-600" 
    : "from-muted-foreground/30 to-muted";

  return (
    <div className={`relative rounded-2xl overflow-hidden border ${borderClass} ${heightClass} bg-gradient-to-b ${tier.bg} flex flex-col justify-end p-5`}>
      {isFirst && <Crown className="absolute top-4 right-4 text-amber-400" size={20}/>}
      <div className="absolute top-4 left-4 flex items-center justify-center w-8 h-8 rounded-full bg-background/80 backdrop-blur font-bold text-sm">
        #{rank}
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center font-bold`}>
          {player.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <div className="font-semibold truncate">{player.fullName || player.username || "Anonymous"}</div>
          <div className={`text-xs flex items-center gap-1 ${tier.color}`}>
            <TierIcon size={10}/> {tier.name}
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold tabular-nums">
        {typeof tierValue === "number" && !isNaN(tierValue) ? tierValue.toLocaleString() : "0"}
      </div>
    </div>
  );
}

// Countdown to Season 1 start (29 May)
function SeasonCountdown() {
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let targetDate = new Date(currentYear, 4, 29); // May 29
      
      // If 29 May has passed this year, use next year
      if (now > targetDate) {
        targetDate = new Date(currentYear + 1, 4, 29);
      }
      
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        return "Season 1 is live!";
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `Season 1 · Starts in ${days}d ${hours}h`;
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `Season 1 · Starts in ${hours}h ${minutes}m`;
      }
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  return <span>{timeLeft || "Season 1 · Starts 29 May"}</span>;
}

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
      } catch (error: unknown) {
        const apiError = error as { message?: string; status?: number };
        console.error("Failed to load leaderboard:", apiError?.message || error, apiError?.status);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeTab, accessToken]);

  function getTierBadge(tierName: string) {
    const tier = tiers.find(t => t.name.toLowerCase() === tierName.toLowerCase()) || tiers[0];
    const Icon = tier.icon;
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tier.color} bg-zinc-900/50`}
        style={{ borderColor: `${tier.color.replace("text-", "").replace("-400", "-500")}30` }}>
        <Icon size={12}/>
        {tier.name}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);
  
  const TrendIcon = ({ trend, change }: { trend?: string; change?: number }) => {
    if (trend === "up") return <div className="flex items-center gap-1 text-emerald-400"><TrendingUp size={12}/><span className="text-xs">{change}</span></div>;
    if (trend === "down") return <div className="flex items-center gap-1 text-rose-400"><TrendingDown size={12}/><span className="text-xs">{change}</span></div>;
    return <div className="text-zinc-500"><Minus size={12}/></div>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Header with prize pool + season info */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"/>
              <SeasonCountdown />
            </div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-700/5 border border-amber-500/20">
              <div className="text-[10px] uppercase tracking-wider text-amber-500/70 dark:text-amber-400/70">Prize Pool</div>
              <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">${season?.prizePool?.toLocaleString() || "12,500"}</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Players</div>
              <div className="text-2xl font-bold">{users.length.toLocaleString() || "1,247"}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 border border-border rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                <Icon size={14}/>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium for top 3 */}
      {topThree.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="grid grid-cols-3 gap-4">
            {/* 2nd Place */}
            {topThree[1] && (
              <PodiumCard 
                key={topThree[1].id || `rank-2-${topThree[1].username}`}
                player={topThree[1]} 
                rank={2} 
                activeTab={activeTab}
                tierFn={getTier}
              />
            )}
            {/* 1st Place */}
            {topThree[0] && (
              <PodiumCard 
                key={topThree[0].id || `rank-1-${topThree[0].username}`}
                player={topThree[0]} 
                rank={1} 
                activeTab={activeTab}
                tierFn={getTier}
                isFirst
              />
            )}
            {/* 3rd Place */}
            {topThree[2] && (
              <PodiumCard 
                key={topThree[2].id || `rank-3-${topThree[2].username}`}
                player={topThree[2]} 
                rank={3} 
                activeTab={activeTab}
                tierFn={getTier}
              />
            )}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="max-w-6xl mx-auto mb-4 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16}/>
          <input 
            placeholder="Search players..."
            className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50"/>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm hover:border-border/80">
          <Filter size={14}/> All Tiers
        </button>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_160px_120px_120px_80px] gap-4 px-5 py-3 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
          <div>Rank</div>
          <div>Player</div>
          <div>Tier</div>
          <div className="text-right">{activeTab === "ranking" ? "Rating" : activeTab === "honor" ? "Honor" : activeTab === "conquest" ? "Conquest" : "Streak"}</div>
          <div className="text-right">W / L · Rate</div>
          <div className="text-right">Streak</div>
        </div>

        {rest.map((p) => {
          const tier = getTier(activeTab === "ranking" ? p.rp : activeTab === "honor" ? p.honor : p.conquest);
          const TierIcon = tier.icon;
          const winRate = Math.round(p.wins / (p.wins + p.losses) * 100) || 0;
          return (
            <div key={p.id}
              className={`grid grid-cols-[80px_1fr_160px_120px_120px_80px] gap-4 px-5 py-4 items-center border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${
                currentUserRank?.id === p.id ? "bg-amber-500/5" : ""
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono">#{p.rank}</span>
                <TrendIcon trend={p.trend} change={p.change}/>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted-foreground/30 to-muted flex items-center justify-center text-sm font-semibold">
                  {p.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {p.fullName || p.username}
                    {currentUserRank?.id === p.id && <span className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-black rounded">YOU</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">@{p.username}</div>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-sm ${tier.color}`}>
                <TierIcon size={14}/> {tier.name}
              </div>
              <div className="text-right font-mono font-semibold">
                {(activeTab === "honor" ? p.honor : activeTab === "conquest" ? p.conquest : activeTab === "streak" ? p.streak : p.rp)?.toLocaleString()}
              </div>
              <div className="text-right">
                <div className="text-sm"><span className="text-emerald-500 dark:text-emerald-400">{p.wins}</span> / <span className="text-rose-500 dark:text-rose-400">{p.losses}</span></div>
                <div className="text-xs text-muted-foreground">{winRate}% win rate</div>
              </div>
              <div className="text-right">
                {p.streak > 0 ? (
                  <div className="inline-flex items-center gap-1 text-orange-500 dark:text-orange-400 text-sm">
                    <Flame size={12}/> {p.streak}
                  </div>
                ) : <span className="text-muted-foreground/60 text-sm">—</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier progress bar */}
      {currentUserRank && (
        <div className="max-w-6xl mx-auto mt-8 p-5 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Your Progress</div>
            <div className="text-xs text-muted-foreground">
              {currentUserRank.rp.toLocaleString()} / {getTier(currentUserRank.rp + 1000).min} to {getTier(currentUserRank.rp + 1000).name}
            </div>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full" 
              style={{ width: `${Math.min(100, (currentUserRank.rp / (getTier(currentUserRank.rp + 1000).min || 5000)) * 100)}%` }}/>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {tiers.map((t) => {
              const Icon = t.icon;
              const reached = currentUserRank.rp >= t.min;
              return (
                <div key={t.name} className={`flex items-center gap-2 p-2 rounded-lg ${reached ? "bg-muted" : "opacity-40"}`}>
                  <Icon size={14} className={t.color}/>
                  <div>
                    <div className="text-xs font-medium">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.min}+ RP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
