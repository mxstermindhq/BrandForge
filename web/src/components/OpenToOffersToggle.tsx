"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, Briefcase, Users, Globe } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type OfferType = "any" | "project" | "full_time" | "consulting";

interface OpenToOffersData {
  open_to_offers: boolean;
  preferred_offer_types: OfferType[];
  min_budget?: number;
  preferred_duration?: string;
  remote_only: boolean;
  willing_to_relocate: boolean;
  notice_period?: string;
  desired_roles: string[];
}

interface OpenToOffersToggleProps {
  profileId: string;
  isOwnProfile: boolean;
}

const offerTypeConfig: Record<
  OfferType,
  { label: string; icon: React.ReactNode; description: string }
> = {
  any: {
    label: "Any Opportunity",
    icon: <Zap className="h-4 w-4" />,
    description: "Open to all types of work",
  },
  project: {
    label: "Project Work",
    icon: <Briefcase className="h-4 w-4" />,
    description: "Fixed-scope projects and deliverables",
  },
  full_time: {
    label: "Full-time Role",
    icon: <Users className="h-4 w-4" />,
    description: "Permanent positions and long-term contracts",
  },
  consulting: {
    label: "Consulting",
    icon: <Globe className="h-4 w-4" />,
    description: "Advisory and strategic guidance",
  },
};

export function OpenToOffersToggle({ profileId, isOwnProfile }: OpenToOffersToggleProps) {
  const { session } = useAuth();
  const [data, setData] = useState<OpenToOffersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("open_to_offers, preferred_offer_types, min_budget, preferred_duration, remote_only, willing_to_relocate, notice_period, desired_roles")
        .eq("id", profileId)
        .single();

      if (profile) {
        setData({
          open_to_offers: profile.open_to_offers || false,
          preferred_offer_types: profile.preferred_offer_types || ["any"],
          min_budget: profile.min_budget,
          preferred_duration: profile.preferred_duration,
          remote_only: profile.remote_only || false,
          willing_to_relocate: profile.willing_to_relocate || false,
          notice_period: profile.notice_period,
          desired_roles: profile.desired_roles || [],
        });
      }
      setLoading(false);
    }

    loadData();
  }, [profileId]);

  const handleToggle = useCallback(async () => {
    if (!isOwnProfile || !data) return;

    setSaving(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      const newValue = !data.open_to_offers;
      const { error } = await supabase
        .from("profiles")
        .update({ open_to_offers: newValue })
        .eq("id", profileId);

      setData({ ...data, open_to_offers: newValue });

      // Create feed item if turning on
      if (newValue) {
        try {
          await supabase.from("feed_items").insert({
            type: "OPEN_FOR_WORK",
            actor_id: profileId,
            payload: {},
          });
        } catch {
          // Silent fail
        }
      }
    } catch (error) {
      console.error("Toggle error:", error);
    } finally {
      setSaving(false);
    }
  }, [isOwnProfile, data, profileId]);

  const handleSavePreferences = useCallback(async (newData: OpenToOffersData) => {
    setSaving(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      await supabase
        .from("profiles")
        .update({
          open_to_offers: newData.open_to_offers,
          preferred_offer_types: newData.preferred_offer_types,
          min_budget: newData.min_budget,
          preferred_duration: newData.preferred_duration,
          remote_only: newData.remote_only,
          willing_to_relocate: newData.willing_to_relocate,
          notice_period: newData.notice_period,
          desired_roles: newData.desired_roles,
        })
        .eq("id", profileId);

      setData(newData);
      setEditing(false);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  }, [profileId]);

  if (loading) {
    return (
      <div className="h-32 animate-pulse rounded-xl bg-surface-container" />
    );
  }

  if (!data) return null;

  // Compact view for public profile
  if (!isOwnProfile) {
    if (!data.open_to_offers) return null;

    return (
      <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-sky-500/10 p-4 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <Zap className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-on-surface">Open to Offers</h3>
            <p className="text-sm text-on-surface-variant">
              This specialist is actively looking for new opportunities
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {data.preferred_offer_types.map((type) => (
            <span
              key={type}
              className="flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface"
            >
              {offerTypeConfig[type].icon}
              {offerTypeConfig[type].label}
            </span>
          ))}
        </div>

        {data.min_budget && (
          <p className="mt-2 text-sm text-on-surface-variant">
            Minimum budget: ${data.min_budget.toLocaleString()}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          {data.remote_only && (
            <span className="rounded-full bg-sky-500/10 px-2 py-1 text-xs text-sky-600">🌐 Remote only</span>
          )}
          {data.willing_to_relocate && (
            <span className="rounded-full bg-violet-500/10 px-2 py-1 text-xs text-violet-600">✈️ Will relocate</span>
          )}
        </div>

        <button
          onClick={() => {
            // Open offer modal or navigate to messaging
            const username = session?.user?.user_metadata?.username;
            if (username) {
              window.location.href = `/u/${username}/contact?type=offer`;
            }
          }}
          className="mt-3 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
        >
          Send Offer
        </button>
      </div>
    );
  }

  // Owner view with edit controls
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${data.open_to_offers ? "bg-emerald-500/20" : "bg-surface-container-high"}`}>
            <Zap className={`h-6 w-6 ${data.open_to_offers ? "text-emerald-600" : "text-on-surface-variant"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-on-surface">Open to Offers</h3>
            <p className="text-sm text-on-surface-variant">
              {data.open_to_offers
                ? "You're visible to clients looking to hire"
                : "Toggle on to receive direct offers"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={saving}
          className={`relative h-7 w-12 rounded-full transition ${
            data.open_to_offers ? "bg-emerald-500" : "bg-surface-container-high"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              data.open_to_offers ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {data.open_to_offers && (
        <div className="mt-4 border-t border-outline-variant pt-4">
          {editing ? (
            <OpenToOffersEditor
              data={data}
              onSave={handleSavePreferences}
              onCancel={() => setEditing(false)}
              saving={saving}
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {data.preferred_offer_types.map((type) => (
                  <span
                    key={type}
                    className="flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface"
                  >
                    {offerTypeConfig[type].icon}
                    {offerTypeConfig[type].label}
                  </span>
                ))}
              </div>

              {data.desired_roles.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-on-surface-variant">Desired roles: </span>
                  <span className="text-sm text-on-surface">{data.desired_roles.join(", ")}</span>
                </div>
              )}

              {(data.min_budget || data.preferred_duration) && (
                <p className="text-sm text-on-surface-variant mb-3">
                  {data.min_budget && `Min: $${data.min_budget.toLocaleString()} · `}
                  {data.preferred_duration}
                </p>
              )}

              <button
                onClick={() => setEditing(true)}
                className="text-sm text-primary hover:underline"
              >
                Edit preferences
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function OpenToOffersEditor({
  data,
  onSave,
  onCancel,
  saving,
}: {
  data: OpenToOffersData;
  onSave: (data: OpenToOffersData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState(data);
  const [roleInput, setRoleInput] = useState("");

  const toggleOfferType = (type: OfferType) => {
    const current = formData.preferred_offer_types;
    if (current.includes(type)) {
      setFormData({
        ...formData,
        preferred_offer_types: current.filter((t) => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        preferred_offer_types: [...current, type],
      });
    }
  };

  const addRole = () => {
    if (roleInput.trim() && !formData.desired_roles.includes(roleInput.trim())) {
      setFormData({
        ...formData,
        desired_roles: [...formData.desired_roles, roleInput.trim()],
      });
      setRoleInput("");
    }
  };

  const removeRole = (role: string) => {
    setFormData({
      ...formData,
      desired_roles: formData.desired_roles.filter((r) => r !== role),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-on-surface">Offer Types</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(offerTypeConfig) as OfferType[]).map((type) => (
            <button
              key={type}
              onClick={() => toggleOfferType(type)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                formData.preferred_offer_types.includes(type)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant bg-surface-container text-on-surface-variant"
              }`}
            >
              {offerTypeConfig[type].icon}
              {offerTypeConfig[type].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Min Budget (USD)</label>
          <input
            type="number"
            value={formData.min_budget || ""}
            onChange={(e) => setFormData({ ...formData, min_budget: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="5000"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface">Notice Period</label>
          <select
            value={formData.notice_period || ""}
            onChange={(e) => setFormData({ ...formData, notice_period: e.target.value || undefined })}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select...</option>
            <option value="Immediately">Immediately</option>
            <option value="1 week">1 week</option>
            <option value="2 weeks">2 weeks</option>
            <option value="1 month">1 month</option>
            <option value="2 months">2 months</option>
            <option value="3+ months">3+ months</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={formData.remote_only}
            onChange={(e) => setFormData({ ...formData, remote_only: e.target.checked })}
            className="rounded border-outline-variant"
          />
          Remote only
        </label>
        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={formData.willing_to_relocate}
            onChange={(e) => setFormData({ ...formData, willing_to_relocate: e.target.checked })}
            className="rounded border-outline-variant"
          />
          Willing to relocate
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-on-surface">Desired Roles</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole())}
            placeholder="e.g., Senior Developer"
            className="flex-1 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={addRole}
            className="rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
          >
            Add
          </button>
        </div>
        {formData.desired_roles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.desired_roles.map((role) => (
              <span
                key={role}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
              >
                {role}
                <button onClick={() => removeRole(role)} className="hover:text-rose-500">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
