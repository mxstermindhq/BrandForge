"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle, Shield } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

interface SkillEndorsement {
  id: string;
  skill: string;
  endorsed_by: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  deal_context?: {
    id: string;
    title: string;
    value: number;
    completed_at: string;
  };
  verified: boolean;
  created_at: string;
}

interface SkillEndorsementsProps {
  profileId: string;
  username: string;
  skills: string[];
  isOwnProfile: boolean;
}

export function SkillEndorsements({ profileId, username, skills, isOwnProfile }: SkillEndorsementsProps) {
  const { session } = useAuth();
  const [endorsements, setEndorsements] = useState<Record<string, SkillEndorsement[]>>({});
  const [loading, setLoading] = useState(true);
  const [endorsingSkill, setEndorsingSkill] = useState<string | null>(null);

  useEffect(() => {
    async function loadEndorsements() {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      const { data } = await supabase
        .from("skill_endorsements")
        .select(`
          id,
          skill,
          verified,
          created_at,
          deal_context,
          endorsed_by:endorsed_by_id(id, username, full_name, avatar_url)
        `)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      // Group by skill
      const grouped: Record<string, SkillEndorsement[]> = {};
      data?.forEach((e: any) => {
        if (!grouped[e.skill]) grouped[e.skill] = [];
        const endorsedBy = Array.isArray(e.endorsed_by) ? e.endorsed_by[0] : e.endorsed_by;
        grouped[e.skill].push({
          ...e,
          endorsed_by: endorsedBy,
        } as SkillEndorsement);
      });

      setEndorsements(grouped);
      setLoading(false);
    }

    loadEndorsements();
  }, [profileId]);

  const handleEndorse = useCallback(
    async (skill: string) => {
      if (!session?.user || session.user.id === profileId) return;

      setEndorsingSkill(skill);
      try {
        const supabase = getSupabaseBrowser();
        if (!supabase) return;

        // Check if already endorsed this skill
        const existing = endorsements[skill]?.find((e) => e.endorsed_by.id === session.user.id);

        if (existing) {
          // Remove endorsement
          await supabase.from("skill_endorsements").delete().eq("id", existing.id);
          setEndorsements((prev) => ({
            ...prev,
            [skill]: prev[skill].filter((e) => e.id !== existing.id),
          }));
        } else {
          // Add endorsement
          const { data } = await supabase
            .from("skill_endorsements")
            .insert({
              profile_id: profileId,
              endorsed_by_id: session.user.id,
              skill,
              verified: false, // Will be verified if they have a completed deal together
            })
            .select(`
              id,
              skill,
              verified,
              created_at,
              deal_context,
              endorsed_by:endorsed_by_id(id, username, full_name, avatar_url)
            `)
            .single();

          if (data) {
            setEndorsements((prev) => ({
              ...prev,
              [skill]: [...(prev[skill] || []), { ...data, endorsed_by: Array.isArray(data.endorsed_by) ? data.endorsed_by[0] : data.endorsed_by } as SkillEndorsement],
            }));

            // Create notification
            await supabase.from("notifications").insert({
              user_id: profileId,
              type: "SKILL_ENDORSED",
              title: "Skill Endorsed",
              body: `${session.user.user_metadata?.full_name || "Someone"} endorsed your ${skill} skill`,
              actor_id: session.user.id,
              action_url: `/u/${username}`,
            });
          }
        }
      } catch (error) {
        console.error("Endorsement error:", error);
      } finally {
        setEndorsingSkill(null);
      }
    },
    [session, profileId, username, endorsements]
  );

  const hasEndorsed = useCallback(
    (skill: string) => {
      if (!session?.user) return false;
      return endorsements[skill]?.some((e) => e.endorsed_by.id === session.user.id) || false;
    },
    [endorsements, session]
  );

  const getVerifiedCount = (skill: string) =>
    endorsements[skill]?.filter((e) => e.verified).length || 0;

  if (loading) {
    return (
      <div className="space-y-2">
        {skills.slice(0, 3).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-container-high" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-on-surface flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500" />
        Skills & Endorsements
      </h3>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => {
          const count = endorsements[skill]?.length || 0;
          const verifiedCount = getVerifiedCount(skill);
          const userEndorsed = hasEndorsed(skill);
          const isEndorsing = endorsingSkill === skill;

          return (
            <div
              key={skill}
              className={`group flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
                userEndorsed
                  ? "border-primary/30 bg-primary/5"
                  : "border-outline-variant bg-surface-container"
              }`}
            >
              <span className="font-medium text-sm text-on-surface">{skill}</span>

              {verifiedCount > 0 && (
                <span
                  className="flex items-center gap-0.5 text-xs text-emerald-600"
                  title={`${verifiedCount} verified endorsements`}
                >
                  <Shield className="h-3 w-3" />
                  {verifiedCount}
                </span>
              )}

              {count > verifiedCount && (
                <span className="text-xs text-on-surface-variant">+{count - verifiedCount}</span>
              )}

              {!isOwnProfile && session?.user && (
                <button
                  onClick={() => handleEndorse(skill)}
                  disabled={isEndorsing}
                  className={`ml-1 rounded p-1 transition ${
                    userEndorsed
                      ? "text-primary hover:bg-primary/10"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                  title={userEndorsed ? "Remove endorsement" : "Endorse this skill"}
                >
                  <Star
                    className={`h-4 w-4 ${userEndorsed ? "fill-current" : ""} ${
                      isEndorsing ? "animate-pulse" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Endorsement details */}
      {Object.entries(endorsements)
        .filter(([_, list]) => list.length > 0)
        .slice(0, 1)
        .map(([skill, list]) => (
          <div key={skill} className="mt-4 rounded-lg bg-surface-container p-3">
            <p className="text-xs font-medium text-on-surface-variant mb-2">
              Recent endorsements for {skill}:
            </p>
            <div className="space-y-2">
              {list.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-sm">
                  {e.endorsed_by.avatar_url ? (
                    <img
                      src={e.endorsed_by.avatar_url}
                      alt={e.endorsed_by.full_name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-high text-xs">
                      {e.endorsed_by.full_name.charAt(0)}
                    </div>
                  )}
                  <span className="text-on-surface">{e.endorsed_by.full_name}</span>
                  {e.verified && (
                    <span className="flex items-center gap-0.5 text-xs text-emerald-600">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  {e.deal_context && (
                    <span className="text-xs text-on-surface-variant">
                      via ${e.deal_context.value?.toLocaleString()} deal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
