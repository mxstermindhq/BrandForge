"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES, CONTACT } from "@/content/landing-directory";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useBootstrap } from "@/hooks/useBootstrap";
import { safeImageSrc } from "@/lib/image-url";
import { talentInitials } from "@/lib/talent-types";
import { profilePath } from "@/lib/reserved-paths";

const DIRECTORY_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

type ProfileEditorProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

type ProfileRow = Record<string, unknown>;

function readProfile(boot: unknown, me: unknown): ProfileRow | null {
  const a = boot && typeof boot === "object" ? (boot as ProfileRow) : null;
  const b = me && typeof me === "object" ? (me as ProfileRow) : null;
  if (!a && !b) return null;
  return { ...b, ...a };
}

export function ProfileEditor({ open, onClose, onSaved }: ProfileEditorProps) {
  const { me, reload: reloadMe } = useAuthMe();
  const { data, reload: reloadBoot } = useBootstrap();
  const profile = readProfile(data?.profile, me?.profile);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [directoryCategory, setDirectoryCategory] = useState("");
  const [rateLabel, setRateLabel] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [availability, setAvailability] = useState("available");
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [openToOffers, setOpenToOffers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarErr, setAvatarErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const hydratedRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const displayName = String(profile?.full_name || username || "You").trim() || "You";
  const avatarUrl = safeImageSrc(profile?.avatar_url as string | undefined);

  useEffect(() => {
    if (!open) {
      hydratedRef.current = false;
      return;
    }
    if (!profile || hydratedRef.current) return;
    hydratedRef.current = true;
    setUsername(String(profile.username || ""));
    setBio(String(profile.bio || ""));
    setHeadline(String(profile.headline || ""));
    setLocation(String(profile.location || ""));
    const sk = Array.isArray(profile.skills) ? (profile.skills as string[]).join(", ") : "";
    setSkillsText(sk);
    setDirectoryCategory(String(profile.directory_category || ""));
    setRateLabel(String(profile.rate_label || ""));
    setMinBudget(profile.min_budget != null ? String(profile.min_budget) : "");
    setAvailability(String(profile.availability || "available"));
    setRemoteOnly(profile.remote_only !== false);
    setOpenToOffers(profile.open_to_offers !== false);
    setErr(null);
    setMsg(null);
    setAvatarErr(null);
  }, [open, profile?.username, profile?.updated_at]);

  const getToken = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data: s } = await supabase.auth.getSession();
    return s.session?.access_token ?? null;
  }, []);

  async function onPickAvatar(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarErr(null);
    setAvatarBusy(true);
    try {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => reject(new Error("Could not read file"));
        r.readAsDataURL(file);
      });
      await apiMutateJson("/api/profile/avatar", "POST", { dataUrl }, t);
      await reloadBoot();
      await reloadMe();
      setMsg("Photo updated.");
    } catch (e) {
      setAvatarErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setAvatarBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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
          availability,
          remote_only: remoteOnly,
          open_to_offers: openToOffers,
          is_public: true,
        },
        t,
      );
      setMsg("Profile saved. You appear on the homepage directory.");
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

  const publicHref = username.trim() ? profilePath(username.trim()) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" data-lenis-prevent>
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close" onClick={onClose} />
      <div
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-outline-variant bg-surface p-6 shadow-2xl sm:rounded-2xl"
        data-lenis-prevent
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface">Your profile</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Founders, creators, operators — advertise yourself and your services at brandforge.gg/
              {username || "username"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative flex h-16 w-16 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high"
              aria-label="Change profile photo"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-headline text-sm font-bold text-primary">
                  {talentInitials(displayName)}
                </span>
              )}
              {avatarBusy ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">…</span>
              ) : null}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onPickAvatar(e.target.files?.[0] || null)}
            />
          </div>
          <div className="text-sm">
            <p className="font-medium text-on-surface">Profile photo</p>
            <p className="text-on-surface-variant">Click to upload · JPG or PNG</p>
            {avatarErr ? <p className="text-critical mt-1 text-xs">{avatarErr}</p> : null}
            {publicHref ? (
              <a href={publicHref} className="text-primary mt-1 inline-block text-xs hover:underline" target="_blank" rel="noreferrer">
                Preview public page →
              </a>
            ) : null}
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <span className="section-label !mb-1">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input w-full"
              placeholder="mxstermind"
              autoComplete="off"
            />
          </label>

          <label className="block">
            <span className="section-label !mb-1">Headline</span>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="input w-full"
              placeholder="Founder · AI operator · Creator"
            />
          </label>

          <label className="block">
            <span className="section-label !mb-1">Directory category</span>
            <select
              value={directoryCategory}
              onChange={(e) => setDirectoryCategory(e.target.value)}
              className="input w-full cursor-pointer"
            >
              <option value="">Auto from bio & services</option>
              {DIRECTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="section-label !mb-1">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="input min-h-[100px] w-full resize-y"
              placeholder="What you build, who you help, outcomes you deliver…"
            />
          </label>

          <label className="block">
            <span className="section-label !mb-1">Tools & skills</span>
            <input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="input w-full"
              placeholder="n8n, Next.js, TikTok Ads"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="section-label !mb-1">Rate label</span>
              <input
                value={rateLabel}
                onChange={(e) => setRateLabel(e.target.value)}
                className="input w-full"
                placeholder="€80–120/hr"
              />
            </label>
            <label className="block">
              <span className="section-label !mb-1">Min budget (€)</span>
              <input
                type="number"
                min={0}
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="input w-full"
                placeholder="500"
              />
            </label>
          </div>

          <label className="block">
            <span className="section-label !mb-1">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input w-full"
              placeholder="Remote · EU"
            />
          </label>

          <label className="block">
            <span className="section-label !mb-1">Availability</span>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="input w-full cursor-pointer"
            >
              <option value="available">Available — taking work</option>
              <option value="busy">Limited slots</option>
              <option value="unavailable">Fully booked</option>
            </select>
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

          <p className="text-xs text-on-surface-variant">
            Contact on listings goes through {CONTACT.telegramHandle} — {CONTACT.guarantor} coordinates deals.
          </p>

          {msg ? <p className="text-sm text-success">{msg}</p> : null}
          {err ? <p className="text-sm text-critical">{err}</p> : null}

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving || avatarBusy} className="btn-primary min-h-11 flex-1">
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
