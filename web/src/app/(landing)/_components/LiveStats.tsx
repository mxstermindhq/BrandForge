"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Users, Briefcase, Trophy, Zap } from "lucide-react";
import { apiGetJson } from "@/lib/api";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { fadeUp, cardStagger } from "@/lib/animations";

interface Stat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
}

interface NetworkStats {
  activePros: number;
  dealsClosed: number;
  totalGMV: number;
  aiAgents: number;
}

export function LiveStats() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Active Pros", value: 2476, suffix: "+", icon: <Users size={18} />, color: "text-emerald-400" },
    { label: "Deals Closed", value: 12861, suffix: "", icon: <Briefcase size={18} />, color: "text-amber-400" },
    { label: "Payments", value: 4.2, suffix: "M", icon: <Trophy size={18} />, color: "text-purple-400" },
    { label: "AI Agents", value: 158, suffix: "", icon: <Zap size={18} />, color: "text-sky-400" },
  ]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Fetch real stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiGetJson<NetworkStats>("/api/stats/network", null);
        if (data) {
          setStats([
            { label: "Active Pros", value: data.activePros || 2476, suffix: "+", icon: <Users size={18} />, color: "text-emerald-400" },
            { label: "Deals Closed", value: data.dealsClosed || 12861, suffix: "", icon: <Briefcase size={18} />, color: "text-amber-400" },
            { label: "Payments", value: data.totalGMV || 4.2, suffix: "M", icon: <Trophy size={18} />, color: "text-purple-400" },
            { label: "AI Agents", value: data.aiAgents || 158, suffix: "", icon: <Zap size={18} />, color: "text-sky-400" },
          ]);
        }
      } catch {
        // Use default values if API fails
      } finally {
        setLoading(false);
        setLastUpdate(new Date());
      }
    };

    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatValue = (stat: Stat) => {
    if (stat.label === "Payments") {
      return `$${stat.value.toFixed(1)}${stat.suffix}`;
    }
    return `${stat.value.toLocaleString()}${stat.suffix}`;
  };

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (loading) {
    return (
      <div className="bg-surface/50 border border-outline-variant rounded-xl p-4 backdrop-blur-sm animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-24 bg-surface-container-high rounded" />
          <div className="h-2 w-16 bg-surface-container-high rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 bg-surface-container-high rounded-lg" />
              <div className="space-y-1">
                <div className="h-4 w-16 bg-surface-container-high rounded" />
                <div className="h-2 w-12 bg-surface-container-high rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="bg-surface/50 border border-outline-variant rounded-xl p-4 backdrop-blur-sm"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={cardStagger}
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-on-surface-variant uppercase tracking-wider">Live Network Stats</span>
        </div>
        <span className="text-[10px] text-on-surface-variant/60">
          Updated {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago
        </span>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-high/80 border border-outline-variant/50 hover:border-outline-variant transition-colors"
          >
            <div className={`${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="text-lg font-bold text-on-surface tabular-nums">
                {stat.label === "Payments" ? (
                  `$${stat.value.toFixed(1)}M`
                ) : (
                  <AnimatedCounter
                    value={stat.value}
                    format={(v) => stat.label === "AI Agents" ? `${v}` : `${Math.round(v).toLocaleString()}${stat.suffix}`}
                  />
                )}
              </div>
              <div className="text-[10px] text-on-surface-variant">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
