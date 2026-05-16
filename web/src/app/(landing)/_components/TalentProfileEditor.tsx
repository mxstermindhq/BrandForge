"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/content/landing-directory";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useBootstrap } from "@/hooks/useBootstrap";
import { PROFESSIONAL_TITLES, isProfessionalTitle } from "@/config/professional-titles";
import { AvailabilityToggle } from "@/components/AvailabilityToggle";

const DIRECTORY_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

type TalentProfileEditorProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export function TalentProfileEditor({ open, onClose, onSaved }: TalentProfileEditorProps) {
  const { me, reload: reloadMe } = useAuthMe();
  const { data, reload: reloadBoot } = useBootstrap();

  const bootProfile = data?.profile as Record<string, unknown> | null;
  const meProfile = me?.profile as Record<string, unknown> | null;
  const profile = bootProfile && meProfile ? { ...meProfile, ...bootProfile } : bootProfile || meProfile;

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [directoryCategory, setDirectoryCategory] = useState("");
  const [rateLabel, setRateLabel] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [openToOffers, setOpenToOffers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !profile) return;
    setUsername(String(profile.username || ""));
    setBio(String(profile.bio || ""));
    const hl = profile.headline && isProfessionalTitle(String(profile.headline)) ? String(profile.headline) : "";
    setHeadline(hl);
    setLocation(String(profile.location || ""));
    const sk = Array.isArray(profile.skills) ? (profile.skills as string[]).join(", ") : "";
    setSkillsText(sk);
    setDirectoryCategory(String(profile.directory_category || ""));
    setRateLabel(String(profile.rate_label || ""));
    setMinBudget(profile.min_budget != null ? String(profile.min_budget) : "");
    setRemoteOnly(profile.remote_only !== false);
    setOpenToOffers(profile.open_to_offers !== false);
    setErr(null);
    setMsg(null);
  }, [open, profile]);

  const getToken = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data: s } = await supabase.auth.getSession();
    return s.session?.access_token ?? null;
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      const skills = skillsText
        .split(/[,|\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 15);
      await apiMutateJson(
        "/api/profile",
        "PUT",
        {
          username: username.trim() || null,
          bio: bio.trim() || null,
          headline: headline.trim() || null,
          location: location.trim() || null,
          skills,
          directory_category: directoryCategory || null,
          rate_label: rateLabel.trim() || null,
          min_budget: minBudget.trim() === "" ? null : Number(minBudget),
          remote_only: remoteOnly,
          open_to_offers: openToOffers,
          is_public: true,
        },
        t,
      );
      setMsg("Profile saved — you appear in the talent directory.");
      await reloadBoot();
      await reloadMe();
      onSaved?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-outline-variant bg-surface p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface">Your talent profile</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              This is what visitors see in the directory. Same fields as Settings.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <span className="section-label !mb-1">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
              placeholder="yourname"
            />
          </label>

          <label className="block">
            <span className="section-label !mb-1">Role / headline</span>
            <select
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
            >
              <option value="">Select role</option>
              {PROFESSIONAL_TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="section-label !mb-1">Directory category</span>
            <select
              value={directoryCategory}
              onChange={(e) => setDirectoryCategory(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
            >
              <option value="">Auto-detect from bio & services</option>
              {DIRECTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="section-label !mb-1">Bio / highlight</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
              placeholder="What you do and outcomes you deliver"
            />
          </label>

          <label className="block">
            <span className="section-label !mb-1">Tools & skills (comma-separated)</span>
            <input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
              placeholder="n8n, Next.js, TikTok Ads"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="section-label !mb-1">Rate label</span>
              <input
                value={rateLabel}
                onChange={(e) => setRateLabel(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
                placeholder="€80–120/hr"
              />
            </label>
            <label className="block">
              <span className="section-label !mb-1">Min budget (€)</span>
              <input
                type="number"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
                placeholder="500"
              />
            </label>
          </div>

          <label className="block">
            <span className="section-label !mb-1">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm"
              placeholder="Remote · EU"
            />
          </label>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
              Remote only
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={openToOffers} onChange={(e) => setOpenToOffers(e.target.checked)} />
              Open to offers
            </label>
          </div>

          <AvailabilityToggle />

          {msg ? <p className="text-sm text-success">{msg}</p> : null}
          {err ? <p className="text-sm text-critical">{err}</p> : null}

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 min-h-11">
              {saving ? "Saving…" : "Save profile"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary min-h-11 px-4">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
