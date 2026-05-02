"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Bookmark, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

interface FollowSaveButtonProps {
  targetUserId: string;
  username: string;
  variant?: "follow" | "save" | "both";
  size?: "sm" | "md" | "lg";
}

export function FollowSaveButton({
  targetUserId,
  username,
  variant = "both",
  size = "md",
}: FollowSaveButtonProps) {
  const { session } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Check initial state
  useEffect(() => {
    async function checkStatus() {
      const currentUser = session?.user;
      if (!currentUser || currentUser.id === targetUserId) return;

      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      // Check follow status
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", targetUserId)
        .maybeSingle();

      setIsFollowing(!!followData);

      // Check save status
      const { data: saveData } = await supabase
        .from("saved_specialists")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("specialist_id", targetUserId)
        .maybeSingle();

      setIsSaved(!!saveData);
    }

    checkStatus();
  }, [session, targetUserId]);

  const handleFollow = useCallback(async () => {
    const currentUser = session?.user;
    if (!currentUser) return;

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      if (isFollowing) {
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", targetUserId);
        setIsFollowing(false);
      } else {
        // Follow
        await supabase.from("follows").insert({
          follower_id: currentUser.id,
          following_id: targetUserId,
        });
        setIsFollowing(true);

        // Create notification
        await supabase.from("notifications").insert({
          user_id: targetUserId,
          type: "NEW_FOLLOWER",
          title: "New Follower",
          body: `${currentUser.user_metadata?.full_name || "Someone"} started following you`,
          actor_id: currentUser.id,
          action_url: `/u/${currentUser.user_metadata?.username || currentUser.id}`,
        });
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setLoading(false);
    }
  }, [session, targetUserId, isFollowing]);

  const handleSave = useCallback(async () => {
    const currentUser = session?.user;
    if (!currentUser) return;

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      if (isSaved) {
        // Unsave
        await supabase
          .from("saved_specialists")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("specialist_id", targetUserId);
        setIsSaved(false);
      } else {
        // Save
        await supabase.from("saved_specialists").insert({
          user_id: currentUser.id,
          specialist_id: targetUserId,
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  }, [session, targetUserId, isSaved]);

  if (!session?.user || session.user.id === targetUserId) return null;

  return (
    <div className="flex gap-2">
      {(variant === "follow" || variant === "both") && (
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`flex items-center gap-1.5 rounded-lg font-medium transition ${sizeClasses[size]} ${
            isFollowing
              ? "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
              : "bg-primary text-on-primary hover:bg-primary/90"
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck className={iconSizes[size]} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className={iconSizes[size]} />
              <span>Follow</span>
            </>
          )}
        </button>
      )}

      {(variant === "save" || variant === "both") && (
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-1.5 rounded-lg font-medium transition ${sizeClasses[size]} ${
            isSaved
              ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
              : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
          }`}
        >
          <Bookmark className={`${iconSizes[size]} ${isSaved ? "fill-current" : ""}`} />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
      )}
    </div>
  );
}

// Export saved specialists list component
export function SavedSpecialistsList() {
  const { session } = useAuth();
  const [saved, setSaved] = useState<Array<{ id: string; specialist: { id: string; username: string; full_name: string; avatar_url?: string; availability_status?: string } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      const currentUser = session?.user;
      if (!currentUser) return;

      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      const { data } = await supabase
        .from("saved_specialists")
        .select(`id, specialist:specialist_id (id, username, full_name, avatar_url, availability_status)`)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      const typedData = (data || []).map((item: any) => ({
        id: item.id,
        specialist: Array.isArray(item.specialist) ? item.specialist[0] : item.specialist,
      }));

      setSaved(typedData as unknown as Array<{ id: string; specialist: { id: string; username: string; full_name: string; avatar_url?: string; availability_status?: string } }>);
      setLoading(false);
    }

    loadSaved();
  }, [session]);

  if (!session?.user) {
    return (
      <div className="text-center text-sm text-on-surface-variant">Sign in to see your saved specialists</div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-container-high" />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-lg bg-surface-container p-4 text-center">
        <Bookmark className="mx-auto mb-2 h-8 w-8 text-on-surface-variant" />
        <p className="text-sm text-on-surface-variant">No saved specialists yet</p>
        <p className="text-xs text-on-surface-variant">Save specialists to quickly find them later</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {saved.map((item) => (
        <a
          key={item.id}
          href={`/u/${item.specialist.username}`}
          className="flex items-center gap-3 rounded-lg bg-surface-container p-3 transition hover:bg-surface-container-high"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
            {item.specialist.avatar_url ? (
              <img
                src={item.specialist.avatar_url}
                alt={item.specialist.full_name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium">
                {item.specialist.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-on-surface truncate">{item.specialist.full_name}</p>
            <p className="text-xs text-on-surface-variant">@{item.specialist.username}</p>
          </div>
          {item.specialist.availability_status === "OPEN_NOW" && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600">🟢 Available</span>
          )}
        </a>
      ))}
    </div>
  );
}
