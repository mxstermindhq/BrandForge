"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiMutateJson, apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Users, Search, Plus, FolderOpen, CheckCircle, Percent, Bot, User, LogOut, MessageSquare, Sparkles, Ban, ArrowRight } from "lucide-react";

interface SquadMember {
  id: string;
  member_type: "human" | "agent";
  member_id: string;
  role: string;
  status: string;
  joined_at: string;
  member?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

interface Squad {
  id: string;
  name: string;
  description: string;
  icon: string;
  owner_id: string;
  status: string;
  max_members: number;
  projects_active: number;
  projects_completed: number;
  win_rate: number;
  created_at: string;
  squad_members?: SquadMember[];
  isMember?: boolean;
  isOwner?: boolean;
  member_count?: number;
}

export function OutcomeSquads() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"my-squads" | "find" | "create">("my-squads");
  const [mySquads, setMySquads] = useState<Squad[]>([]);
  const [availableSquads, setAvailableSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canCreateSquad, setCanCreateSquad] = useState(false);
  const [createInput, setCreateInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [generatedSquad, setGeneratedSquad] = useState<Partial<Squad> | null>(null);

  // Load squads from API
  useEffect(() => {
    async function loadSquads() {
      if (!accessToken) return;
      try {
        setIsLoading(true);
        const data = await apiGetJson<{ mySquads: Squad[]; availableSquads: Squad[]; canCreateSquad: boolean }>(
          "/api/squads",
          accessToken
        );
        setMySquads(data.mySquads);
        setAvailableSquads(data.availableSquads);
        setCanCreateSquad(data.canCreateSquad);
      } catch (error: unknown) {
        const apiError = error as { message?: string; status?: number };
        console.error("Failed to load squads:", apiError?.message || error, apiError?.status);
      } finally {
        setIsLoading(false);
      }
    }
    loadSquads();
  }, [accessToken]);

  async function generateSquad() {
    if (!createInput.trim()) return;
    setIsCreating(true);

    try {
      const response = await apiMutateJson<{
        squad: Partial<Squad>;
        suggestedMembers: unknown[];
      }>("/api/squads/generate", "POST", { description: createInput }, accessToken);

      setGeneratedSquad(response.squad);
    } catch (error) {
      console.error("Failed to generate squad:", error);
      alert("Failed to generate squad. Using manual creation.");
      // Fallback to manual
      setGeneratedSquad({
        name: createInput.split(' ').slice(0, 3).join(' ') + ' Squad',
        description: createInput,
        icon: "groups",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function createSquad() {
    if (!generatedSquad) return;
    if (!canCreateSquad) {
      alert("Free users can join squads but not create them. Upgrade to create squads!");
      return;
    }
    
    setIsCreating(true);
    try {
      const newSquad = await apiMutateJson<Squad>("/api/squads", "POST", {
        name: generatedSquad.name,
        description: generatedSquad.description,
        icon: generatedSquad.icon || "groups",
      }, accessToken);
      
      setMySquads((prev) => [newSquad, ...prev]);
      setActiveTab("my-squads");
      setGeneratedSquad(null);
      setCreateInput("");
    } catch (error) {
      console.error("Failed to create squad:", error);
      alert("Failed to create squad. " + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  }

  async function joinSquad(squadId: string) {
    try {
      await apiMutateJson(`/api/squads/${squadId}`, "POST", {}, accessToken);
      // Reload squads
      const data = await apiGetJson<{ mySquads: Squad[]; availableSquads: Squad[]; canCreateSquad: boolean }>(
        "/api/squads",
        accessToken
      );
      setMySquads(data.mySquads);
      setAvailableSquads(data.availableSquads);
      alert("You've joined the squad!");
    } catch (error) {
      console.error("Failed to join squad:", error);
      alert("Failed to join squad. " + (error as Error).message);
    }
  }

  async function leaveSquad(squadId: string) {
    try {
      await apiMutateJson(`/api/squads/${squadId}/leave`, "POST", {}, accessToken);
      setMySquads((prev) => prev.filter(s => s.id !== squadId));
    } catch (error) {
      console.error("Failed to leave squad:", error);
    }
  }

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
                <Users size={12}/> Squads
              </div>
              <h1 className="text-3xl font-bold">Outcome Squads</h1>
              <p className="text-zinc-400 mt-1">Assemble human and AI agents into powerful teams</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-500">My Squads</p>
                <p className="text-xl font-bold">{mySquads.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit mb-6">
          {[
            { id: "my-squads" as const, label: "My Squads", icon: Users },
            { id: "find" as const, label: "Find", icon: Search },
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

        {/* My Squads Tab */}
        {activeTab === "my-squads" && (
          <div className="space-y-4">
            {mySquads.map((squad) => (
              <div key={squad.id} className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                      <Users size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{squad.name}</h3>
                        {squad.status === 'active' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">Active</span>
                        )}
                        {squad.isOwner && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">Owner</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400">{squad.description}</p>
                      
                      {/* Members */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {squad.squad_members?.slice(0, 5).map((member: SquadMember) => (
                          <div key={member.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs ${
                            member.member_type === "agent" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                          }`}>
                            {member.member_type === "agent" ? <Bot size={12}/> : <User size={12}/>}
                            <span>{member.member?.username || 'Member'}</span>
                            <span className="text-zinc-500">· {member.role}</span>
                          </div>
                        ))}
                        {(squad.squad_members?.length || 0) > 5 && (
                          <span className="text-xs text-zinc-500">+{(squad.squad_members?.length || 0) - 5} more</span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1"><FolderOpen size={14} className="text-amber-400"/> {squad.projects_active || 0} active</span>
                        <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-400"/> {squad.projects_completed || 0} completed</span>
                        <span className="flex items-center gap-1"><Percent size={14} className="text-amber-400"/> {squad.win_rate || 0}% win rate</span>
                        <span className="flex items-center gap-1"><Users size={14}/> {squad.squad_members?.length || 0} / {squad.max_members}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 lg:flex-col">
                    <button onClick={() => leaveSquad(squad.id)} className="flex items-center gap-2 px-4 py-2 text-sm border border-zinc-700 rounded-lg hover:bg-zinc-800 transition text-zinc-400">
                      <LogOut size={14}/> {squad.isOwner ? "Disband" : "Leave"}
                    </button>
                    <Link href="/chat" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-semibold hover:bg-amber-400 transition">
                      <MessageSquare size={14}/> Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {mySquads.length === 0 && (
              <div className="text-center py-16 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <Users size={48} className="mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-semibold mb-2">No squads yet</h3>
                <p className="text-sm text-zinc-400 mb-4 max-w-md mx-auto">
                  {canCreateSquad ? "Create your first squad to start executing projects" : "Free users can join squads but not create them. Find a squad to join!"}
                </p>
                <button onClick={() => setActiveTab(canCreateSquad ? "create" : "find")} className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold">
                  {canCreateSquad ? "Create Squad" : "Find Squads"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Find Tab */}
        {activeTab === "find" && (
          <div className="space-y-4">
            {availableSquads.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <Search size={48} className="mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-semibold mb-2">No squads available</h3>
                <p className="text-sm text-zinc-400 mb-4">Check back later or create your own squad!</p>
                {canCreateSquad && (
                  <button onClick={() => setActiveTab("create")} className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold">Create Squad</button>
                )}
              </div>
            ) : (
              availableSquads.map((squad) => (
                <div key={squad.id} className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                        <Users size={24} className="text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{squad.name}</h3>
                        <p className="text-sm text-zinc-400 mt-1">{squad.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                          <span className="flex items-center gap-1"><Users size={14}/> {squad.member_count || 0} / {squad.max_members} members</span>
                          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-400"/> {squad.projects_completed || 0} completed</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => joinSquad(squad.id)} className="px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-semibold hover:bg-amber-400 transition">
                      Join
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="max-w-2xl mx-auto">
            {!canCreateSquad ? (
              <div className="text-center py-16 rounded-xl bg-zinc-900/30 border border-zinc-800">
                <Ban size={48} className="mx-auto mb-4 text-rose-400" />
                <h3 className="text-lg font-semibold mb-2">Squad Limit Reached</h3>
                <p className="text-sm text-zinc-400 mb-4">Free users can join squads but cannot create them. Upgrade to create your own squads!</p>
                <Link href="/plans" className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold">View Plans</Link>
              </div>
            ) : !generatedSquad ? (
              <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                    <Sparkles size={28} className="text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Create New Squad</h3>
                  <p className="text-sm text-zinc-400">Describe what you need. AI will generate the perfect squad.</p>
                </div>
                <div className="space-y-4">
                  <textarea value={createInput} onChange={(e) => setCreateInput(e.target.value)}
                    placeholder="Example: I need a squad to build a SaaS product. Need a full-stack developer, UI/UX designer, and AI content assistant."
                    className="w-full h-32 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                  <button onClick={generateSquad} disabled={isCreating || !createInput.trim()}
                    className="w-full py-3 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {isCreating ? "Generating..." : <><Sparkles size={16}/> AI Generate Squad</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/10 flex items-center justify-center border border-amber-500/30">
                    <Users size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{generatedSquad.name}</h3>
                    <p className="text-sm text-zinc-400">{generatedSquad.description}</p>
                  </div>
                </div>
                <div className="mb-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <p className="font-medium">{generatedSquad.name}</p>
                  <p className="text-sm text-zinc-500">{generatedSquad.description}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={createSquad} className="flex-1 py-2.5 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition">Create Squad</button>
                  <button onClick={() => setGeneratedSquad(null)} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition">Regenerate</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
