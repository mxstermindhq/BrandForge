"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, useCallback } from "react";
import { apiGetJson } from "@/lib/api";
import { MarketplacePreview } from "./MarketplacePreview";
import { LiveStats } from "@/app/(landing)/_components/LiveStats";
import { ActivityFeed } from "@/app/(landing)/_components/ActivityFeed";
import { MessageSquare, PlusCircle, Users, Handshake, Trophy, Zap, TrendingUp, ArrowRight, Sparkles, Loader2 } from "lucide-react";

type NetworkStats = {
  // Activity stats (top section)
  activeChats: number;
  membersOnline: number;
  activeDeals: number;
  seasonWins: number;
  
  // Network stats (bottom section)
  activePros: number;
  dealsClosed: number;
  totalGMV: number;
  aiAgents: number;
  lastUpdated?: string;
};

function StatCard({ label, value, hint, icon: Icon, trend, isLoading }: { 
  label: string; 
  value: string; 
  hint?: string; 
  icon?: React.ElementType;
  trend?: "up" | "down";
  isLoading?: boolean;
}) {
  return (
    <div className="group rounded-xl border border-outline-variant bg-surface-container p-4 hover:bg-surface-container-high transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-on-surface-variant group-hover:text-amber-500 transition-colors"/>}
          {trend && !isLoading && (
            <span className={`text-[10px] ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
              {trend === "up" ? "↑" : "↓"} Live
            </span>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="h-8 flex items-center">
          <Loader2 size={20} className="animate-spin text-on-surface-variant" />
        </div>
      ) : (
        <p className="text-3xl font-bold text-on-surface">{value}</p>
      )}
      <p className="text-[11px] text-on-surface-variant mt-1">{label}</p>
      {hint ? <p className="mt-1 text-[10px] text-on-surface-variant/70">{hint}</p> : null}
    </div>
  );
}

export function HomeHubClient() {
  const [data, setData] = useState<NetworkStats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const j = await apiGetJson<NetworkStats>("/api/stats/network", null);
      setData(j);
      setLastUpdated(new Date());
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    void fetchStats();
    
    // Set up polling every 30 seconds for "live" feel
    const interval = setInterval(() => {
      void fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatValue = (val: number | undefined) => {
    if (val === undefined || val === null) return "—";
    return val.toLocaleString();
  };

  return (
    <div className="text-white max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-xs text-amber-400 uppercase tracking-wider font-medium">Live Network</span>
          {lastUpdated && (
            <span className="text-[10px] text-on-surface-variant ml-2">
              Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold max-w-[600px] mb-4 leading-tight">
          Deal rooms, marketplace, and live pulse — one home.
        </h1>
        <p className="text-zinc-400 max-w-[480px] text-lg mb-8">
          Negotiate in chat. Sign contracts. Escrow payments. All in one thread.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Link href="/chat" className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-xl font-semibold hover:bg-amber-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20">
            <MessageSquare size={18}/> Open a Chat
          </Link>
          <Link href="/requests/new" className="flex items-center gap-2 px-6 py-3 border border-zinc-700 text-white rounded-xl hover:bg-zinc-800 transition-all duration-300 hover:border-zinc-600">
            <PlusCircle size={18}/> Post a Brief
          </Link>
          <Link href="/marketplace" className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all duration-300 group">
            <TrendingUp size={18}/> Browse Marketplace
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Active Chats" 
          value={formatValue(data?.activeChats)} 
          hint="Real-time deal rooms" 
          icon={MessageSquare}
          trend="up"
          isLoading={isLoading}
        />
        <StatCard 
          label="Members Online" 
          value={formatValue(data?.membersOnline)} 
          hint="Pros in the arena" 
          icon={Users}
          trend="up"
          isLoading={isLoading}
        />
        <StatCard 
          label="Active Deals" 
          value={formatValue(data?.activeDeals)} 
          hint="Projects in motion" 
          icon={Handshake}
          trend="up"
          isLoading={isLoading}
        />
        <StatCard 
          label="Season 0" 
          value="28 May" 
          hint="Season 1 starts" 
          icon={Trophy}
          isLoading={false}
        />
      </div>

      {err ? <p className="text-rose-400 mb-6 text-sm" role="alert">{err}</p> : null}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        {/* Left Column - Live Stats & Activity */}
        <div className="lg:col-span-1 space-y-6">
          <LiveStats />
          <ActivityFeed />
          
          {/* Quick Actions */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap size={14} className="text-amber-400"/>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link href="/services/new" className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition text-sm">
                <span className="text-zinc-300">List a service</span>
                <ArrowRight size={14} className="text-zinc-500"/>
              </Link>
              <Link href="/agents" className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition text-sm">
                <span className="text-zinc-300">Deploy AI agent</span>
                <Sparkles size={14} className="text-amber-400"/>
              </Link>
              <Link href="/squads" className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition text-sm">
                <span className="text-zinc-300">Join a squad</span>
                <Users size={14} className="text-zinc-500"/>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Marketplace Preview */}
        <div className="lg:col-span-2">
          <MarketplacePreview />
        </div>
      </div>
    </div>
  );
}
