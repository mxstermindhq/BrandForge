"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiMutateJson, apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

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
      } catch (error: any) {
        console.error("Failed to load squads:", error?.message || error, error?.status);
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
        suggestedMembers: any[];
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

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Outcome Squads</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Assemble human and AI agents into powerful teams
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-on-surface-variant">My Squads</p>
            <p className="font-bold text-on-surface">{mySquads.length}</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: "my-squads", label: "My Squads", icon: "groups" },
              { id: "find", label: "Find", icon: "search" },
              { id: "create", label: "Create", icon: "add" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-outline"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span className="font-medium hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* My Squads Tab */}
      {activeTab === "my-squads" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-on-surface-variant">Loading squads...</p>
            </div>
          ) : mySquads.map((squad) => (
            <div key={squad.id} className="surface-card p-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl text-primary">{squad.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-semibold text-on-surface text-lg">{squad.name}</h3>
                      {squad.status === 'active' && (
                        <span className="px-2 py-0.5 rounded-full bg-success/10 border border-success/30 text-success text-[10px] font-medium">
                          Active
                        </span>
                      )}
                      {squad.isOwner && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-medium">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">{squad.description}</p>
                    
                    {/* Members */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {squad.squad_members?.slice(0, 5).map((member: SquadMember) => (
                        <div
                          key={member.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs ${
                            member.member_type === "agent"
                              ? "bg-primary/5 border-primary/20"
                              : "bg-surface-container-low border-outline-variant"
                          }`}
                        >
                          {member.member_type === "agent" ? (
                            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
                              {member.member?.avatar_url ? (
                                <img src={member.member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-[10px]">person</span>
                              )}
                            </div>
                          )}
                          <span className="text-on-surface font-medium">{member.member?.username || 'Member'}</span>
                          <span className="text-on-surface-variant">· {member.role}</span>
                        </div>
                      ))}
                      {(squad.squad_members?.length || 0) > 5 && (
                        <span className="text-xs text-on-surface-variant">+{(squad.squad_members?.length || 0) - 5} more</span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary">folder_open</span>
                        {squad.projects_active || 0} active
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-success">task_alt</span>
                        {squad.projects_completed || 0} completed
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-400">percent</span>
                        {squad.win_rate || 0}% win rate
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-on-surface-variant">people</span>
                        {squad.squad_members?.length || 0} / {squad.max_members} members
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 lg:flex-col">
                  {squad.isOwner ? (
                    <button
                      onClick={() => leaveSquad(squad.id)}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      Disband
                    </button>
                  ) : (
                    <button
                      onClick={() => leaveSquad(squad.id)}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      Leave
                    </button>
                  )}
                  <Link
                    href={`/chat`}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Chat
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {mySquads.length === 0 && (
            <div className="text-center py-12 surface-card">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">groups</span>
              </div>
              <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">No squads yet</h3>
              <p className="text-sm text-on-surface-variant mb-4">
                {canCreateSquad 
                  ? "Create your first squad to start executing projects"
                  : "Free users can join squads but not create them. Find a squad to join!"
                }
              </p>
              <button
                onClick={() => setActiveTab(canCreateSquad ? "create" : "find")}
                className="btn-primary"
              >
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
            <div className="text-center py-12 surface-card">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">search</span>
              </div>
              <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">No squads available</h3>
              <p className="text-sm text-on-surface-variant mb-4">Check back later or create your own squad!</p>
              {canCreateSquad && (
                <button onClick={() => setActiveTab("create")} className="btn-primary">
                  Create Squad
                </button>
              )}
            </div>
          ) : (
            availableSquads.map((squad) => (
              <div key={squad.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-2xl text-primary">{squad.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-semibold text-on-surface text-lg">{squad.name}</h3>
                      <p className="text-sm text-on-surface-variant mt-1">{squad.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-on-surface-variant">people</span>
                          {squad.member_count || 0} / {squad.max_members} members
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-success">task_alt</span>
                          {squad.projects_completed || 0} completed
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => joinSquad(squad.id)}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Join Squad
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
            <div className="text-center py-12 surface-card">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-error">block</span>
              </div>
              <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">Squad Limit Reached</h3>
              <p className="text-sm text-on-surface-variant mb-4">
                Free users can join squads but cannot create them. Upgrade to create your own squads!
              </p>
              <Link href="/plans" className="btn-primary">
                View Plans
              </Link>
            </div>
          ) : !generatedSquad ? (
            <div className="surface-card p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary">add</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Create New Squad</h3>
                <p className="text-sm text-on-surface-variant">
                  Describe what you need in 2-3 sentences. AI will generate the perfect squad.
                </p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={createInput}
                  onChange={(e) => setCreateInput(e.target.value)}
                  placeholder="Example: I need a squad to build a SaaS product. Need a full-stack developer, UI/UX designer, and AI content assistant. We're building a project management tool for remote teams."
                  className="w-full h-32 px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />

                <button
                  onClick={generateSquad}
                  disabled={isCreating || !createInput.trim()}
                  className="w-full btn-primary min-h-12 disabled:opacity-50"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Generating Squad...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">auto_awesome</span>
                      AI Generate Squad
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="surface-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">{generatedSquad.icon || "groups"}</span>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-on-surface">{generatedSquad.name}</h3>
                  <p className="text-sm text-on-surface-variant">{generatedSquad.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide mb-3 block">
                  Squad Details
                </label>
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <p className="font-medium text-on-surface">{generatedSquad.name}</p>
                  <p className="text-sm text-on-surface-variant">{generatedSquad.description}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={createSquad} className="flex-1 btn-primary">
                  Create Squad
                </button>
                <button
                  onClick={() => setGeneratedSquad(null)}
                  className="btn-secondary px-6"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
