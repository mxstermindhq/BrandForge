"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiMutateJson, apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

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
    { id: "creative", name: "Creative", icon: "palette" },
    { id: "technical", name: "Technical", icon: "code" },
    { id: "research", name: "Research", icon: "search" },
    { id: "business", name: "Business", icon: "business" },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">AI Agents Marketplace</h2>
          <p className="text-on-surface-variant mt-1">
            Create, use, and rent AI agents from the community
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "marketplace"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined mr-1">storefront</span>
          Marketplace
        </button>
        <button
          onClick={() => setActiveTab("my-agents")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "my-agents"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined mr-1">smart_toy</span>
          My Agents ({myAgents.length})
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "create"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined mr-1">add</span>
          Create Agent
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : activeTab === "marketplace" ? (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All Agents
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Marketplace Grid */}
          {filteredMarketplace.length === 0 ? (
            <div className="text-center py-12 surface-card">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
                storefront
              </span>
              <p className="text-on-surface-variant mt-4">
                No rentable agents available yet.
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="btn-primary mt-4"
              >
                Be the first to create one
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarketplace.map((agent) => (
                <div key={agent.id} className="surface-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          {categories.find(c => c.id === agent.category)?.icon || "smart_toy"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-on-surface">{agent.name}</h3>
                        <p className="text-xs text-on-surface-variant">{agent.category}</p>
                      </div>
                    </div>
                    {agent.is_rentable && (
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        ⚡{agent.rent_price_honor || 50}/use
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-on-surface-variant mt-3 line-clamp-2">
                    {agent.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {agent.capabilities?.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {agent.projects_completed || 0} uses
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">star</span>
                      {(agent.rating || 0).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => rentAgent(agent.id)}
                      className="flex-1 btn-primary text-sm"
                      disabled={agent.owner_id === session?.user?.id}
                    >
                      {agent.owner_id === session?.user?.id ? "Your Agent" : "Rent & Use"}
                    </button>
                    <button className="px-3 py-2 text-sm border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "my-agents" ? (
        <div className="space-y-4">
          {myAgents.length === 0 ? (
            <div className="text-center py-12 surface-card">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
                smart_toy
              </span>
              <p className="text-on-surface-variant mt-4">
                You haven&apos;t created any agents yet.
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="btn-primary mt-4"
              >
                Create Your First Agent
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myAgents.map((agent) => (
                <div key={agent.id} className="surface-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-2xl">
                        {categories.find(c => c.id === agent.category)?.icon || "smart_toy"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-on-surface">{agent.name}</h3>
                          <p className="text-xs text-on-surface-variant">{agent.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {agent.is_rentable && (
                            <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs">
                              Listed
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              agent.status === "active"
                                ? "bg-success/20 text-success"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {agent.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">
                        {agent.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          {agent.projects_completed || 0} uses
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          {agent.is_rentable ? `⚡${agent.rent_price_honor || 50}` : "Private"}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 btn-primary text-sm">
                          Use Agent
                        </button>
                        <button
                          onClick={() => archiveAgent(agent.id)}
                          className="px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl surface-card p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-1">Create New Agent</h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Build an AI agent to automate tasks or rent it to others
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                className="w-full input-field"
                placeholder="e.g., Content Writer Pro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setNewAgentCategory(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-left ${
                      newAgentCategory === cat.id
                        ? "border-primary bg-primary/10"
                        : "border-outline-variant hover:border-outline"
                    }`}
                  >
                    <span className="material-symbols-outlined">{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Description
              </label>
              <textarea
                value={newAgentDescription}
                onChange={(e) => setNewAgentDescription(e.target.value)}
                className="w-full input-field min-h-[100px]"
                placeholder="What does this agent do?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Capabilities (comma-separated)
              </label>
              <input
                type="text"
                value={newAgentCapabilities}
                onChange={(e) => setNewAgentCapabilities(e.target.value)}
                className="w-full input-field"
                placeholder="e.g., Write blogs, Create social posts, SEO optimization"
              />
            </div>

            {/* Renting Options */}
            <div className="border-t border-outline-variant pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAgentRentable}
                  onChange={(e) => setNewAgentRentable(e.target.checked)}
                  className="w-5 h-5 rounded border-outline-variant"
                />
                <div>
                  <span className="text-sm font-medium text-on-surface">Allow others to rent this agent</span>
                  <p className="text-xs text-on-surface-variant">Earn Honor when others use your agent</p>
                </div>
              </label>

              {newAgentRentable && (
                <div className="mt-3 ml-8">
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Rent Price (Honor per use)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">⚡</span>
                    <input
                      type="number"
                      value={newAgentRentPrice}
                      onChange={(e) => setNewAgentRentPrice(Number(e.target.value))}
                      className="w-32 input-field"
                      min="10"
                      max="1000"
                    />
                    <span className="text-sm text-on-surface-variant">Honor</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setActiveTab("marketplace")}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={createAgent}
              disabled={!newAgentName.trim() || isCreating}
              className="btn-primary flex-1"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Agent"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
