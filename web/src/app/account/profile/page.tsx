"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ForgePage } from "@/components/forge/ForgePage";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

export default function EditProfilePage() {
  const { session, accessToken, authReady } = useAuth();
  const { me, loading: meLoading, reload } = useAuthMe();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [rateLabel, setRateLabel] = useState("");
  const [skills, setSkills] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authReady && !session) return;
    if (authReady && !session) router.replace("/login?next=/account/profile");
  }, [authReady, session, router]);

  useEffect(() => {
    if (!meLoading && (me?.publishedServiceCount ?? 0) > 0) return;
    if (!meLoading && me?.pendingOnboarding) router.replace("/onboarding");
    if (me?.profile) {
      setFullName(me.profile.full_name || "");
      setHeadline(me.profile.headline || "");
      setBio(me.profile.bio || "");
      setLocation(me.profile.location || "");
      setRateLabel(me.profile.rate_label || "");
      if (Array.isArray(me.profile.skills)) setSkills(me.profile.skills.join(", "));
    }
  }, [me, meLoading, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await apiMutateJson("/api/profile", "PUT", {
        full_name: fullName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        location: location.trim(),
        rate_label: rateLabel.trim(),
        skills: skills.split(/[,|\n]/).map((s) => s.trim()).filter(Boolean),
      }, accessToken);
      await reload();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  if (!authReady || meLoading) {
    return (
      <ForgePage title="Edit profile" narrow backHref="/account" backLabel="← Account">
        <p className="text-sm text-[var(--forge-text-muted)]">Loading…</p>
      </ForgePage>
    );
  }

  return (
    <ForgePage
      title="Edit profile"
      eyebrow="Public page"
      description="What buyers see on your BrandForge profile and listings."
      narrow
      backHref="/account"
      backLabel="← Account"
    >
      <form onSubmit={submit} className="forge-page-card mx-auto max-w-lg space-y-5">
        <div>
          <label className="forge-label" htmlFor="fullName">
            Display name
          </label>
          <input
            id="fullName"
            className="forge-input mt-2 w-full"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="forge-label" htmlFor="headline">
            Professional title
          </label>
          <input
            id="headline"
            className="forge-input mt-2 w-full"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="forge-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            className="forge-input mt-2 min-h-[120px] w-full"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div>
          <label className="forge-label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            className="forge-input mt-2 w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="forge-label" htmlFor="rate">
            Starting rate label
          </label>
          <input
            id="rate"
            className="forge-input mt-2 w-full"
            value={rateLabel}
            onChange={(e) => setRateLabel(e.target.value)}
            placeholder="From $299"
          />
        </div>
        <div>
          <label className="forge-label" htmlFor="skills">
            Skills (comma-separated)
          </label>
          <input
            id="skills"
            className="forge-input mt-2 w-full"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-[var(--forge-fire)]">{error}</p> : null}
        {saved ? <p className="text-sm text-[var(--forge-gold)]">Profile saved.</p> : null}
        <button type="submit" className="forge-btn forge-btn-primary w-full" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </ForgePage>
  );
}
