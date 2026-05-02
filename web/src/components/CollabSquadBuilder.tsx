"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Plus, X, Wallet, Split, Crown, UserPlus, MessageSquare } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export interface SquadMember {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  revenue_split: number;
  joined_at: string;
}

export interface Squad {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar_url?: string;
  banner_url?: string;
  owner_id: string;
  is_public: boolean;
  total_revenue: number;
  deals_completed: number;
  members: SquadMember[];
  skills: string[];
  created_at: string;
}

interface CollabRequest {
  id: string;
  requester_id: string;
  requester: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  project_type: string;
  role_needed: string;
  budget_range: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

// Squad Creation Component
export function CreateSquadForm({ onSuccess }: { onSuccess: (squad: Squad) => void }) {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!session?.user || !name.trim()) return;

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) throw new Error("Not authenticated");

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const { data, error } = await supabase
        .from("squads")
        .insert({
          name: name.trim(),
          slug,
          description: description.trim(),
          owner_id: session.user.id,
          is_public: isPublic,
          skills: [],
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first member
      await supabase.from("squad_members").insert({
        squad_id: data.id,
        user_id: session.user.id,
        role: "Owner",
        revenue_split: 100,
      });

      onSuccess(data as Squad);
    } catch (error) {
      console.error("Failed to create squad:", error);
    } finally {
      setLoading(false);
    }
  }, [session, name, description, isPublic, onSuccess]);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-6">
      <h3 className="mb-4 text-lg font-semibold text-on-surface">Create a Squad</h3>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Squad Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Pixel Perfect Studio"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your squad do? What are you looking for?"
            rows={3}
            className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-outline-variant"
          />
          Make this squad public (visible in marketplace)
        </label>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || loading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Squad"}
        </button>
      </div>
    </div>
  );
}

// Squad Detail Card
export function SquadCard({ squad }: { squad: Squad }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4 transition hover:border-outline">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            {squad.avatar_url ? (
              <Image src={squad.avatar_url} alt={squad.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {squad.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-on-surface">{squad.name}</h4>
            <p className="text-sm text-on-surface-variant">@{squad.slug}</p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
          {squad.members.length} members
        </span>
      </div>

      <p className="mb-3 text-sm text-on-surface-variant line-clamp-2">{squad.description}</p>

      {squad.skills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {squad.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-outline-variant pt-3">
        <div className="flex -space-x-2">
          {squad.members.slice(0, 4).map((member) => (
            <div
              key={member.id}
              className="relative h-7 w-7 rounded-full border-2 border-surface-container bg-surface-container-high"
            >
              {member.avatar_url ? (
                <Image
                  src={member.avatar_url}
                  alt={member.full_name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-medium">
                  {member.full_name.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {squad.members.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-container bg-surface-container-high text-[10px] text-on-surface-variant">
              +{squad.members.length - 4}
            </div>
          )}
        </div>

        <Link
          href={`/squads/${squad.slug}`}
          className="rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
        >
          View Squad →
        </Link>
      </div>
    </div>
  );
}

// Collab Request Form
export function CollabRequestForm({
  targetUserId,
  targetUsername,
  onClose,
}: {
  targetUserId: string;
  targetUsername: string;
  onClose: () => void;
}) {
  const { session } = useAuth();
  const [projectType, setProjectType] = useState("");
  const [roleNeeded, setRoleNeeded] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!session?.user || !projectType || !roleNeeded) return;

    setSending(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      const { error } = await supabase.from("collab_requests").insert({
        requester_id: session.user.id,
        target_id: targetUserId,
        project_type: projectType,
        role_needed: roleNeeded,
        budget_range: budgetRange,
        message: message.trim(),
        status: "pending",
      });

      if (error) throw error;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "COLLAB_REQUEST",
        title: "Collaboration Request",
        body: `${session.user.user_metadata?.full_name || "Someone"} wants to collaborate on ${projectType}`,
        actor_id: session.user.id,
        action_url: `/u/${session.user.user_metadata?.username}`,
      });

      onClose();
    } catch (error) {
      console.error("Failed to send request:", error);
    } finally {
      setSending(false);
    }
  }, [session, targetUserId, projectType, roleNeeded, budgetRange, message, onClose]);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-on-surface">Collaboration Request</h3>
        <button onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high">
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="mb-4 text-sm text-on-surface-variant">
        Send a collaboration request to @{targetUsername}
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Project Type</label>
          <input
            type="text"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            placeholder="e.g., Web Application, Mobile App, Brand Identity"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Role Needed</label>
          <input
            type="text"
            value={roleNeeded}
            onChange={(e) => setRoleNeeded(e.target.value)}
            placeholder="e.g., Frontend Developer, UI Designer, Copywriter"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Budget Range (optional)</label>
          <select
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select budget range</option>
            <option value="Under $1,000">Under $1,000</option>
            <option value="$1,000 - $5,000">$1,000 - $5,000</option>
            <option value="$5,000 - $10,000">$5,000 - $10,000</option>
            <option value="$10,000 - $25,000">$10,000 - $25,000</option>
            <option value="$25,000+">$25,000+</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the project and why you'd like to collaborate..."
            rows={4}
            className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!projectType || !roleNeeded || sending}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Revenue Split Editor for Squad
export function RevenueSplitEditor({
  members,
  onSave,
}: {
  members: SquadMember[];
  onSave: (splits: Record<string, number>) => void;
}) {
  const [splits, setSplits] = useState<Record<string, number>>(
    Object.fromEntries(members.map((m) => [m.user_id, m.revenue_split]))
  );
  const total = Object.values(splits).reduce((a, b) => a + b, 0);

  const handleChange = (userId: string, value: number) => {
    setSplits({ ...splits, [userId]: Math.max(0, Math.min(100, value)) });
  };

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-on-surface">
        <Split className="h-5 w-5" />
        Revenue Split
      </h3>

      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              {member.avatar_url ? (
                <Image src={member.avatar_url} alt={member.full_name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-container-high">
                  {member.full_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-on-surface">{member.full_name}</p>
              <p className="text-xs text-on-surface-variant">{member.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={splits[member.user_id]}
                onChange={(e) => handleChange(member.user_id, parseInt(e.target.value) || 0)}
                className="w-16 rounded-lg border border-outline-variant bg-surface-container-high px-2 py-1 text-right text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-sm text-on-surface-variant">%</span>
            </div>
          </div>
        ))}

        <div className="border-t border-outline-variant pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Total Split</span>
            <span className={`font-medium ${total === 100 ? "text-emerald-500" : "text-rose-500"}`}>
              {total}%
            </span>
          </div>
          {total !== 100 && (
            <p className="mt-1 text-xs text-rose-500">
              Total must equal 100% (currently {total > 100 ? "over" : "under"} by {Math.abs(total - 100)}%)
            </p>
          )}
        </div>

        <button
          onClick={() => onSave(splits)}
          disabled={total !== 100}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
        >
          Save Revenue Split
        </button>
      </div>
    </div>
  );
}

// Quick Actions Component
export function SquadQuickActions({ squadId, isOwner }: { squadId: string; isOwner: boolean }) {
  const [showInvite, setShowInvite] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      {isOwner && (
        <>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
          <button
            onClick={() => setShowSplit(!showSplit)}
            className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
          >
            <Split className="h-4 w-4" />
            Revenue Split
          </button>
        </>
      )}
      <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90">
        <MessageSquare className="h-4 w-4" />
        Squad Chat
      </button>
    </div>
  );
}
