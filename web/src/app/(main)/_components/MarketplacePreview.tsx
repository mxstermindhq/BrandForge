"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { TrendingUp, Clock, User, ArrowUpRight, Zap, Search, Sparkles, Briefcase, Target } from "lucide-react";

interface Service {
  id: string;
  title: string;
  price: number;
  deliveryDays?: number;
  ownerUsername?: string;
  category?: string;
  isAIGenerated?: boolean;
  createdAt?: string;
}

interface Request {
  id: string;
  title: string;
  budget?: string;
  budgetMin?: number;
  budgetMax?: number;
  ownerUsername?: string;
  createdAt?: string;
}

interface Stats {
  servicesCount: number;
  requestsCount: number;
}

export function MarketplacePreview() {
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<Stats>({ servicesCount: 0, requestsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"services" | "requests">("services");

  useEffect(() => {
    void (async () => {
      try {
        // Fetch latest services, requests, and stats
        const [previewRes, statsRes] = await Promise.all([
          apiGetJson<{ services: Service[]; requests: Request[] }>("/api/marketplace/preview", null),
          apiGetJson<Stats>("/api/marketplace/stats", null),
        ]);
        setServices(previewRes.services?.slice(0, 4) || []);
        setRequests(previewRes.requests?.slice(0, 3) || []);
        if (statsRes) {
          setStats(statsRes);
        }
      } catch {
        // Silently fail - show empty state
        setServices([]);
        setRequests([]);
        setStats({ servicesCount: 0, requestsCount: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "Budget negotiable";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    return min ? `$${min.toLocaleString()}+` : `$${max?.toLocaleString()}`;
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Marketplace</h2>
              <p className="text-xs text-zinc-500">Live opportunities</p>
            </div>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition"
          >
            View all <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search services, skills, or specialists..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {["All", "Design", "Development", "AI", "Marketing", "Writing"].map((cat, i) => (
            <button
              key={cat}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                i === 0
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition relative ${
            activeTab === "services" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Briefcase size={16} />
          Services
          <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400">
            {loading ? "..." : stats.servicesCount.toLocaleString()}
          </span>
          {activeTab === "services" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition relative ${
            activeTab === "requests" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Target size={16} />
          Requests
          <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400">
            {loading ? "..." : stats.requestsCount.toLocaleString()}
          </span>
          {activeTab === "requests" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-zinc-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === "services" ? (
          <div className="space-y-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                  <span className="text-lg">{service.category?.[0] || "S"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                        {service.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                        <User size={10} />@{service.ownerUsername}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-amber-400">${service.price}</p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                        <Clock size={10} />
                        {service.deliveryDays === 1 ? "1 day" : `${service.deliveryDays} days`}
                      </p>
                    </div>
                  </div>
                  {service.isAIGenerated && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-400">
                      <Sparkles size={10} /> AI-Powered
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="group flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                        {request.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                        <User size={10} />@{request.ownerUsername}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-emerald-400">
                        {formatBudget(request.budgetMin, request.budgetMax)}
                      </p>
                      <p className="text-[10px] text-zinc-500">Open for bids</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400">
                    <Target size={10} /> Submit proposal
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/20">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {loading 
              ? "Loading..."
              : activeTab === "services" 
                ? `Browse ${stats.servicesCount.toLocaleString()}+ services` 
                : `Browse ${stats.requestsCount.toLocaleString()}+ open requests`}
          </p>
          <Link
            href="/marketplace"
            className="text-xs font-medium text-amber-400 hover:text-amber-300 transition"
          >
            View all →
          </Link>
        </div>
      </div>
    </div>
  );
}
