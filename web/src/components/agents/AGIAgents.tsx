"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiMutateJson, apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Store, Bot, Plus, Zap, CheckCircle, Star, Trash2, Palette, Code, Search, Briefcase } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  capabilities: string[];
  status: "active" | "idle" | "busy" | "archived";
  projects_completed: number;
  rating: number;
  created_at: string;
  owner_id: string;
  is_rentable: boolean;
  rent_price_honor?: number;
  rent_price_conquest?: number;
}

export function AGIAgents() {
  const { accessToken, session } = useAuth();
  const [activeTab, setActiveTab] = useState<"marketplace" | "my-agents" | "create">("marketplace");
  const [marketplaceAgents, setMarketplaceAgents] = useState<Agent[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Create form
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentDescription, setNewAgentDescription] = useState("");
  const [newAgentCategory, setNewAgentCategory] = useState("creative");
  const [newAgentCapabilities, setNewAgentCapabilities] = useState("");
  const [newAgentRentable, setNewAgentRentable] = useState(false);
  const [newAgentRentPrice, setNewAgentRentPrice] = useState(50);

  const categories = [
    { id: "creative", name: "Creative", icon: Palette, color: "text-pink-400" },
    { id: "technical", name: "Technical", icon: Code, color: "text-sky-400" },
    { id: "research", name: "Research", icon: Search, color: "text-amber-400" },
    { id: "business", name: "Business", icon: Briefcase, color: "text-emerald-400" },
  ];

  const getCategoryIcon = (catId: string) => {
    const icons: Record<string, typeof Palette> = {
      creative: Palette,
      technical: Code,
      research: Search,
      business: Briefcase,
    };
    return icons[catId] || Bot;
  };

  // Load agents
  useEffect(() => {
    async function loadAgents() {
      if (!accessToken) return;
      try {
        setIsLoading(true);
        // Load marketplace agents (all rentable agents)
        const marketData = await apiGetJson<{ agents?: Agent[] }>(
          "/api/agents/marketplace",
          accessToken
        );
        setMarketplaceAgents(marketData.agents?.filter(a => a.status !== 'archived') || []);

        // Load my agents
        const myData = await apiGetJson<{ agents?: Agent[] }>(
          "/api/agents",
          accessToken
        );
        setMyAgents(myData.agents?.filter(a => a.status !== 'archived') || []);
      } catch (error: unknown) {
        const apiError = error as { message?: string };
        console.error("Failed to load agents:", apiError?.message || error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAgents();
  }, [accessToken]);

  async function createAgent() {
    if (!newAgentName.trim()) return;
    setIsCreating(true);
    try {
      // Map category to default icon
      const categoryIcons: Record<string, string> = {
        creative: "palette",
        technical: "code",
        research: "search",
        business: "business",
      };

      const agent = await apiMutateJson<Agent>(
        "/api/agents",
        "POST",
        {
          name: newAgentName,
          description: newAgentDescription,
          category: newAgentCategory,
          icon: categoryIcons[newAgentCategory] || "smart_toy",
          capabilities: newAgentCapabilities.split(',').map(c => c.trim()).filter(Boolean),
          is_rentable: newAgentRentable,
          rent_price_honor: newAgentRentable ? newAgentRentPrice : undefined,
        },
        accessToken
      );
      setMyAgents(prev => [...prev, agent]);
      setNewAgentName("");
      setNewAgentDescription("");
      setNewAgentCapabilities("");
      setNewAgentRentable(false);
      setActiveTab("my-agents");
    } catch (error: unknown) {
      console.error("Failed to create agent:", error);
      const err = error as { message?: string; toString?: () => string };
      const errorMsg = err?.message || err?.toString?.() || "Unknown error";
      if (errorMsg.includes("schema cache") || errorMsg.includes("table") || errorMsg.includes("user_agents")) {
        alert("Database setup required. Please run the SQL migration in Supabase to create the agents table.");
      } else {
        alert("Failed to create agent. " + errorMsg);
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function rentAgent(agentId: string) {
    try {
      await apiMutateJson(
        `/api/agents/${agentId}/rent`,
        "POST",
        {},
        accessToken
      );
      alert("Agent rented successfully! You can now use it.");
    } catch (error) {
      console.error("Failed to rent agent:", error);
      alert("Failed to rent agent.");
    }
  }

  async function archiveAgent(agentId: string) {
    try {
      await apiMutateJson(
        `/api/agents/${agentId}`,
        "PUT",
        { status: "archived" },
        accessToken
      );
      setMyAgents(prev => prev.filter(a => a.id !== agentId));
    } catch (error) {
      console.error("Failed to archive agent:", error);
    }
  }

  const filteredMarketplace = selectedCategory === "all" 
    ? marketplaceAgents 
    : marketplaceAgents.filter(a => a.category === selectedCategory);

  const CategoryIcon = ({ id, size = 16 }: { id: string; size?: number }) => {
    const Icon = getCategoryIcon(id);
    const cat = categories.find(c => c.id === id);
    return <Icon size={size} className={cat?.color || "text-zinc-400"} />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-1">
                <Bot size={12}/> AI Agents
              </div>
              <h1 className="text-3xl font-bold">Agent Forge</h1>
              <p className="text-zinc-400 mt-1">Create, deploy, and rent AI agents</p>
            </div>
            <button onClick={() => setActiveTab("create")} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition">
              <Plus size={16}/> Create Agent
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit mb-6">
          {[
            { id: "marketplace" as const, label: "Marketplace", icon: Store },
            { id: "my-agents" as const, label: `My Agents (${myAgents.length})`, icon: Bot },
            { id: "create" as const, label: "Create", icon: Plus },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                }`}>
                <Icon size={14}/> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Marketplace Tab */}
        {activeTab === "marketplace" && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === "all" ? "bg-amber-500 text-black" : "bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}>
                All Agents
              </button>
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id ? "bg-amber-500 text-black" : "bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white"
                    }`}>
                    <Icon size={14} className={selectedCategory === cat.id ? "text-black" : cat.color}/> {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            {filteredMarketplace.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <Store size={48} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400 mb-4">No rentable agents available yet</p>
                <button onClick={() => setActiveTab("create")} className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold">
                  Be the first to create one
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMarketplace.map((agent) => (
                  <div key={agent.id} className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                          <CategoryIcon id={agent.category} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-xs text-zinc-500 capitalize">{agent.category}</p>
                        </div>
                      </div>
                      {agent.is_rentable && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/30">
                          <Zap size={10}/> {agent.rent_price_honor || 50}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{agent.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {agent.capabilities?.slice(0, 3).map((cap) => (
                        <span key={cap} className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">{cap}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                      <span className="flex items-center gap-1"><CheckCircle size={12}/> {agent.projects_completed || 0} uses</span>
                      <span className="flex items-center gap-1"><Star size={12} className="text-amber-400"/> {(agent.rating || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => rentAgent(agent.id)} disabled={agent.owner_id === session?.user?.id}
                        className="flex-1 py-2 bg-amber-500 text-black rounded-lg text-sm font-semibold disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition">
                        {agent.owner_id === session?.user?.id ? "Your Agent" : "Rent & Use"}
                      </button>
                      <button className="px-3 py-2 text-sm border border-zinc-700 rounded-lg hover:bg-zinc-800 transition">
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Agents Tab */}
        {activeTab === "my-agents" && (
          <div className="space-y-4">
            {myAgents.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <Bot size={48} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400 mb-4">You haven&apos;t created any agents yet</p>
                <button onClick={() => setActiveTab("create")} className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold">
                  Create Your First Agent
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myAgents.map((agent) => (
                  <div key={agent.id} className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                        <CategoryIcon id={agent.category} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-xs text-zinc-500 capitalize">{agent.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {agent.is_rentable && (
                              <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">Listed</span>
                            )}
                            <span className={`text-[10px] px-2 py-1 rounded-full ${
                              agent.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"
                            }`}>{agent.status}</span>
                          </div>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{agent.description}</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                          <span className="flex items-center gap-1"><CheckCircle size={12}/> {agent.projects_completed || 0} uses</span>
                          <span className="flex items-center gap-1"><Zap size={12} className={agent.is_rentable ? "text-amber-400" : "text-zinc-600"}/> {agent.is_rentable ? `${agent.rent_price_honor || 50}` : "Private"}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-amber-500 text-black rounded-lg text-sm font-semibold">Use Agent</button>
                          <button onClick={() => archiveAgent(agent.id)} className="px-3 py-2 text-sm text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/10 transition">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="max-w-2xl p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <h3 className="text-xl font-bold mb-1">Create New Agent</h3>
            <p className="text-zinc-400 text-sm mb-6">Build an AI agent to automate tasks or rent it to others</p>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Agent Name</label>
                <input type="text" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:border-amber-500/50 outline-none"
                  placeholder="e.g., Content Writer Pro" required/>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => setNewAgentCategory(cat.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-left ${
                          newAgentCategory === cat.id ? "border-amber-500 bg-amber-500/10" : "border-zinc-800 hover:border-zinc-700"
                        }`}>
                        <Icon size={16} className={cat.color}/>
                        <span className="text-sm">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                <textarea value={newAgentDescription} onChange={(e) => setNewAgentDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm min-h-[100px] resize-y focus:border-amber-500/50 outline-none"
                  placeholder="What does this agent do?"/>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Capabilities (comma-separated)</label>
                <input type="text" value={newAgentCapabilities} onChange={(e) => setNewAgentCapabilities(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:border-amber-500/50 outline-none"
                  placeholder="e.g., Write blogs, Create social posts, SEO optimization"/>
              </div>
              <div className="border-t border-zinc-800 pt-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={newAgentRentable} onChange={(e) => setNewAgentRentable(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 accent-amber-500"/>
                  <div>
                    <span className="text-sm font-medium">Allow others to rent this agent</span>
                    <p className="text-xs text-zinc-500">Earn Honor when others use your agent</p>
                  </div>
                </label>
                {newAgentRentable && (
                  <div className="mt-3 ml-8">
                    <label className="block text-xs text-zinc-500 mb-2">Rent Price (Honor per use)</label>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-400"/>
                      <input type="number" value={newAgentRentPrice} onChange={(e) => setNewAgentRentPrice(Number(e.target.value))}
                        className="w-32 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm" min="10" max="1000"/>
                      <span className="text-sm text-zinc-500">Honor</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-800">
              <button onClick={() => setActiveTab("marketplace")} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition">Cancel</button>
              <button onClick={createAgent} disabled={!newAgentName.trim() || isCreating}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-black rounded-lg font-semibold disabled:opacity-50 transition">
                {isCreating ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
