"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { MarketplacePreview } from "./MarketplacePreview";
import { LiveStats } from "@/app/(landing)/_components/LiveStats";
import { ActivityFeed } from "@/app/(landing)/_components/ActivityFeed";
import { MessageSquare, PlusCircle, Users, Handshake, Trophy, Zap, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

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
};

function StatCard({ label, value, hint, icon: Icon, trend }: { 
  label: string; 
  value: string; 
  hint?: string; 
  icon?: React.ElementType;
  trend?: "up" | "down";
}) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-zinc-400 group-hover:text-amber-400 transition-colors"/>}
          {trend && (
            <span className={`text-[10px] ${trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
              {trend === "up" ? "↑" : "↓"} Live
            </span>
          )}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-[11px] text-zinc-500 mt-1">{label}</p>
      {hint ? <p className="mt-1 text-[10px] text-zinc-600">{hint}</p> : null}
    </div>
  );
}

export function HomeHubClient() {
  const [data, setData] = useState<NetworkStats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const j = await apiGetJson<NetworkStats>("/api/stats/network", null);
        setData(j);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not load stats");
      }
    })();
  }, []);

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
        />
        <StatCard 
          label="Members Online" 
          value={formatValue(data?.membersOnline)} 
          hint="Pros in the arena" 
          icon={Users}
          trend="up"
        />
        <StatCard 
          label="Active Deals" 
          value={formatValue(data?.activeDeals)} 
          hint="Projects in motion" 
          icon={Handshake}
          trend="up"
        />
        <StatCard 
          label="Season Wins" 
          value={formatValue(data?.seasonWins)} 
          hint="Deals closed this season" 
          icon={Trophy}
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
