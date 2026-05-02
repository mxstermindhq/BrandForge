"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuth } from "@/providers/AuthProvider";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useAuthMe } from "@/hooks/useAuthMe";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { safeImageSrc } from "@/lib/image-url";
import { SettingsSocialPanel } from "./SettingsSocialPanel";
import { AvailabilityToggle, type AvailabilityStatus } from "@/components/AvailabilityToggle";
import { ReferralSystem } from "@/components/ReferralSystem";
import { PROFESSIONAL_TITLES, isProfessionalTitle } from "@/config/professional-titles";

type TabId = "account" | "billing" | "notifications" | "social" | "api" | "referral";

type ProfileRow = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  role?: string | null;
  top_member?: boolean | null;
  location?: string | null;
  banner_url?: string | null;
  updated_at?: string | null;
  availability_status?: AvailabilityStatus | null;
  available_from?: string | null;
};

function mergeProfile(boot: unknown, meProf: unknown): ProfileRow | null {
  const a = boot && typeof boot === "object" ? (boot as ProfileRow) : null;
  const b = meProf && typeof meProf === "object" ? (meProf as ProfileRow) : null;
  if (!a && !b) return null;
  return { ...b, ...a };
}

type FormBaseline = {
  username: string;
  bio: string;
  headline: string;
  location: string;
  bannerUrl: string;
};

function snapshotFromProfile(p: ProfileRow | null): FormBaseline | null {
  if (!p) return null;
  const hl = p.headline && isProfessionalTitle(p.headline) ? p.headline : "";
  return {
    username: p.username || "",
    bio: p.bio || "",
    headline: hl,
    location: p.location || "",
    bannerUrl: p.banner_url || "",
  };
}

const TABS: { id: TabId; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "billing", label: "Billing" },
  { id: "notifications", label: "Notifications" },
  { id: "social", label: "Social media" },
  { id: "referral", label: "Referral" },
  { id: "api", label: "API Keys" },
];

function roleBadgeLabel(role: string | null | undefined, pro: boolean): string {
  const r = String(role || "member").toLowerCase();
  if (pro && (r === "member" || r === "enterprise")) return "PRO MEMBER";
  if (r === "enterprise") return "ENTERPRISE";
  if (r === "admin") return "ADMIN";
  if (r === "moderator") return "MODERATOR";
  if (r === "affiliate") return "AFFILIATE";
  if (r === "member") return "MEMBER";
  return "MEMBER";
}

export function SettingsClient() {
  const searchParams = useSearchParams();
  const { session, signOut } = useAuth();
  const { me, reload: reloadMe } = useAuthMe();
  const { data, err, loading, reload: reloadBoot } = useBootstrap();

  const [tab, setTab] = useState<TabId>("account");
  const [oauthFlash, setOauthFlash] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [baseline, setBaseline] = useState<FormBaseline | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarErr, setAvatarErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const profile = mergeProfile(data?.profile, me?.profile);
  const settings = (data?.settings || {}) as Record<string, unknown>;
  const hasPaidPlan = Boolean(data?.hasPaidPlan);
  const email = me?.user?.email || "";
  const avatarUrl = safeImageSrc(profile?.avatar_url);
  const proVisual = Boolean(profile?.top_member || hasPaidPlan);
  const badge = roleBadgeLabel(profile?.role, proVisual);

  const publicProfileHref =
    username.trim() && /^[a-z0-9_-]+$/i.test(username.trim())
      ? `/p/${encodeURIComponent(username.trim())}`
      : null;

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "social" || t === "account" || t === "billing" || t === "notifications" || t === "api" || t === "referral") {
      setTab(t as TabId);
    }
    const ok = searchParams.get("ok");
    const er = searchParams.get("error");
    if (ok) {
      setOauthFlash(`Connected ${ok}.`);
      void reloadBoot();
    } else if (er) {
      setOauthFlash(`OAuth: ${er}`);
    }
  }, [searchParams, reloadBoot]);

  /* eslint-disable react-hooks/exhaustive-deps -- mergeProfile() may return new object each render; sync on listed fields only */
  useEffect(() => {
    if (!profile) return;
    const snap = snapshotFromProfile(profile);
    if (!snap) return;
    setUsername(snap.username);
    setBio(snap.bio);
    setHeadline(snap.headline);
    setLocation(snap.location);
    setBannerUrl(snap.bannerUrl);
    setBaseline(snap);
  }, [
    profile?.username,
    profile?.bio,
    profile?.headline,
    profile?.location,
    profile?.avatar_url,
    profile?.updated_at,
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const dirty = useMemo(() => {
    if (!baseline) return false;
    return (
      username !== baseline.username ||
      bio !== baseline.bio ||
      headline !== baseline.headline ||
      location !== baseline.location ||
      bannerUrl !== baseline.bannerUrl
    );
  }, [baseline, username, bio, headline, location, bannerUrl]);

  const getToken = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data: s } = await supabase.auth.getSession();
    return s.session?.access_token ?? null;
  }, []);

  const patchSettings = useCallback(
    async (patch: Record<string, unknown>) => {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      await apiMutateJson("/api/settings", "PUT", patch, t);
      await reloadBoot();
    },
    [getToken, reloadBoot],
  );

  async function saveProfile(e?: React.FormEvent) {
    e?.preventDefault();
    setSaveErr(null);
    setSaveMsg(null);
    setSaving(true);
    try {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      await apiMutateJson(
        "/api/profile",
        "PUT",
        {
          username: username.trim() || null,
          bio: bio.trim() || null,
          headline: headline.trim() || null,
          location: location.trim() || null,
          banner_url: bannerUrl.trim() || null,
        },
        t,
      );
      setSaveMsg("Changes saved.");
      await reloadBoot();
      await reloadMe();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function discardAccountForm() {
    if (!baseline) return;
    setUsername(baseline.username);
    setBio(baseline.bio);
    setHeadline(baseline.headline);
    setLocation(baseline.location);
    setBannerUrl(baseline.bannerUrl);
    setSaveErr(null);
    setSaveMsg(null);
  }

  async function onPickAvatar(f: File | null) {
    if (!f || !f.type.startsWith("image/")) return;
    setAvatarErr(null);
    setAvatarBusy(true);
    try {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => reject(new Error("Could not read file"));
        r.readAsDataURL(f);
      });
      await apiMutateJson<{ profile?: ProfileRow }>("/api/profile/avatar", "POST", { dataUrl }, t);
      await reloadBoot();
      await reloadMe();
    } catch (e) {
      setAvatarErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setAvatarBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function confirmDeleteAccount() {
    setDeleteErr(null);
    setDeleteBusy(true);
    try {
      const t = await getToken();
      if (!t) throw new Error("Sign in required.");
      await apiMutateJson("/api/account/delete", "POST", { confirmEmail: deleteEmail.trim() }, t);
      await signOut();
      window.location.href = "/";
    } catch (e) {
      setDeleteErr(e instanceof Error ? e.message : "Deletion failed");
    } finally {
      setDeleteBusy(false);
    }
  }

  if (loading) {
    return <PageRouteLoading title="Loading settings" variant="inline" />;
  }

  if (err) {
    return (
      <p className="page-content text-critical py-6" role="alert">
        {err}
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-32">
      <header className="mb-10">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-wider mb-1">Workspace</div>
        <h1 className="text-3xl font-bold max-w-[560px]">Settings</h1>
        <p className="text-on-surface-variant mt-1 max-w-[480px]">Profile, billing, notifications, and API keys in one place.</p>
      </header>

      {!session ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-5 max-w-lg">
          <p className="text-[14px] text-on-surface-variant leading-[1.6]">Sign in to manage your profile.</p>
          <Link href={`/login?next=${encodeURIComponent("/settings")}`} className="mt-4 inline-flex px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition">
            Sign in
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
          {/* Sub-nav */}
          <nav
            className="flex shrink-0 flex-row gap-1 overflow-x-auto pb-1 lg:w-[200px] lg:flex-col lg:gap-1 lg:border-r lg:border-outline-variant lg:pr-6 lg:pb-0"
            aria-label="Settings sections"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex w-full min-h-[44px] shrink-0 items-center rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors duration-150 lg:min-h-0 ${
                  tab === t.id
                    ? "bg-surface-container-high font-semibold text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 space-y-10">
            {tab === "account" ? (
              <form onSubmit={saveProfile} className="space-y-10">
                {/* Profile header card */}
                <section className="bg-surface-container border border-outline-variant rounded-xl p-5 md:p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start">
                    <div className="relative shrink-0">
                      <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-outline bg-surface-container-high md:h-32 md:w-32">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt="" fill className="object-cover" sizes="128px" unoptimized />
                        ) : (
                          <span className="bg-primary/10 text-primary flex h-full items-center justify-center">
                            <span className="material-symbols-outlined text-[38px]">star</span>
                          </span>
                        )}
                        {avatarBusy ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-inverse-surface/70 text-[12px] font-semibold text-on-inverse-surface">
                            …
                          </div>
                        ) : null}
                        <button
                          type="button"
                          aria-label="Change avatar"
                          onClick={() => fileRef.current?.click()}
                          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-outline bg-surface text-on-surface transition-colors hover:border-primary/50 hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                        </button>
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void onPickAvatar(e.target.files?.[0] || null)}
                      />
                      {avatarErr ? <p className="text-rose-400 mt-2 text-[12px]">{avatarErr}</p> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 gap-y-2">
                        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-on-surface">
                          {username || "Choose a username"}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium">{badge}</span>
                      </div>
                      <p className="text-[13px] text-on-surface-variant leading-[1.5] mt-2">
                        {[headline, location].filter(Boolean).join(" · ") || "Public profile preview"}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {publicProfileHref ? (
                          <a
                            href={publicProfileHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-[44px] items-center rounded-lg border border-outline-variant px-4 py-2 text-on-surface transition hover:bg-surface-container"
                          >
                            View public profile
                          </a>
                        ) : (
                          <span
                            title="Set a username to enable your public profile URL."
                            className="inline-flex min-h-[44px] cursor-not-allowed items-center rounded-md border border-outline-variant/40 px-4 text-[13px] text-on-surface-variant opacity-60"
                          >
                            View public profile
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Personal information */}
                <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 md:p-6">
                  <p className="section-label">Personal information</p>
                  <p className="mb-8 text-[13px] font-body leading-[1.6] text-on-surface-variant">
                    Manage how you appear on BrandForge.
                  </p>
                  {me?.pendingOnboarding ? (
                    <div
                      className="border border-primary/20 bg-primary/5 mb-6 rounded-xl p-4"
                      role="note"
                      title="Complete these fields, then save — your setup banner and reminders clear automatically."
                    >
                      <p className="text-[13px] font-body text-on-surface leading-[1.6]">
                        <span className="section-label mb-1 !block">Finish setup</span>
                        Finish on{" "}
                        <Link href="/welcome" className="text-primary font-600 underline-offset-2 hover:underline">
                          the welcome page
                        </Link>{" "}
                        (or save here): username and professional title. Notifications may also remind you.
                      </p>
                    </div>
                  ) : null}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label htmlFor="email_ro" className="input-label">
                        Email address
                      </label>
                      <input
                        id="email_ro"
                        readOnly
                        value={email}
                        className="input cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label htmlFor="headline" className="input-label">
                        Professional title
                      </label>
                      <select
                        id="headline"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        className="input min-h-[44px] cursor-pointer"
                      >
                        <option value="">— Select —</option>
                        {PROFESSIONAL_TITLES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <label htmlFor="location" className="input-label">
                        Location
                      </label>
                      <input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        className="input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="username" className="input-label">
                        Username
                      </label>
                      <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="input" />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="banner_url" className="input-label">
                        Banner image URL
                      </label>
                      <input
                        id="banner_url"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="https://..."
                        className="input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="input-label">
                        Bio
                      </label>
                      <textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} className="input min-h-[120px] resize-y" />
                      {profile?.role === "member" ? (
                        <p className="text-[12px] font-body text-on-surface-variant leading-[1.5] mt-2">
                          Members need at least 100 characters in bio to appear as sellers in marketplace discovery.
                        </p>
                      ) : null}
                    </div>
                    <div className="md:col-span-2">
                      <label className="input-label">
                        Availability Status
                      </label>
                      <div className="mt-2">
                        <AvailabilityToggle
                          currentStatus={profile?.availability_status || "BOOKED"}
                          availableFrom={profile?.available_from || undefined}
                        />
                      </div>
                      <p className="text-[12px] font-body text-on-surface-variant leading-[1.5] mt-2">
                        Let others know when you're available for new work. This is displayed on your profile.
                      </p>
                    </div>
                  </div>
                  {saveErr ? <p className="text-critical mt-6 text-[13px] font-body">{saveErr}</p> : null}
                  {saveMsg ? <p className="text-primary mt-6 text-[13px] font-body font-500">{saveMsg}</p> : null}
                </section>

                {/* Subscription & usage */}
                <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 md:p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="section-label !mb-0">Subscription &amp; usage</p>
                    <Link href="/plans" className="text-[12px] font-body text-on-surface-variant hover:text-on-surface transition-colors">
                      Compare plans →
                    </Link>
                  </div>
                  <div className="grid gap-6 xl:grid-cols-[1fr_200px]">
                    <div className="bg-surface-container-high/40 border border-outline-variant/40 relative rounded-xl p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[15px] font-headline font-600 tracking-[-0.01em] text-on-surface">
                            {hasPaidPlan ? "Pro plan" : "Free plan"}
                          </p>
                          <p className="text-[13px] font-body text-on-surface-variant leading-[1.5] mt-1">
                            {hasPaidPlan
                              ? "Paid plan active. Manage pricing and limits from Plans."
                              : "You are on Free. Upgrade when you need more capacity and premium tools."}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="text-[11px] font-headline font-600 tracking-[0.06em] uppercase text-on-surface-variant mb-2 flex justify-between">
                          <span>Plan status</span>
                          <span className="text-on-surface font-body normal-case tracking-normal">
                            {hasPaidPlan ? "Active" : "Free"}
                          </span>
                        </div>
                        <div className="bg-surface-container-high h-2 overflow-hidden rounded-full">
                          <div
                            className="from-primary to-secondary h-full rounded-full bg-gradient-to-r"
                            style={{ width: hasPaidPlan ? "100%" : "35%" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="border border-outline-variant/60 flex flex-1 flex-col rounded-xl bg-surface-container-low p-4 transition-colors hover:border-outline-variant">
                        <span className="material-symbols-outlined text-primary mb-2 text-[22px]">bolt</span>
                        <p className="text-[13px] font-headline font-600 text-on-surface">
                          {hasPaidPlan ? "Manage plan" : "Upgrade"}
                        </p>
                        <p className="text-[12px] font-body text-on-surface-variant mt-1 leading-[1.5]">
                          {hasPaidPlan ? "Review limits and billing options." : "Unlock advanced tools and more usage."}
                        </p>
                      </div>
                      <div className="rounded-xl border border-critical/30 bg-critical-container/30 p-4">
                        <span className="material-symbols-outlined mb-2 text-[22px] text-critical">cancel</span>
                        <p className="text-[13px] font-headline font-600 text-on-surface">Manage</p>
                        <p className="text-[12px] font-body text-on-surface-variant mt-1 leading-[1.5]">Cancel via billing provider.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Danger zone */}
                <section className="border border-critical/40 bg-critical-container/20 rounded-xl p-5 md:p-6">
                  <p className="section-label text-critical !mb-2">Delete workspace</p>
                  <p className="text-[13px] font-body text-on-surface-variant leading-[1.6] mb-6 max-w-xl">
                    Once you delete your workspace, there is no going back. Your auth login is removed and profile data is
                    scrubbed. Please be certain.
                  </p>
                  {!deleteOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteOpen(true);
                        setDeleteErr(null);
                        setDeleteEmail("");
                      }}
                      className="btn-danger min-h-[44px]"
                    >
                      Terminate
                    </button>
                  ) : (
                    <div className="max-w-md space-y-4">
                      <label htmlFor="delete_confirm_email" className="input-label">
                        Type your account email to confirm
                      </label>
                      <input
                        id="delete_confirm_email"
                        value={deleteEmail}
                        onChange={(e) => setDeleteEmail(e.target.value)}
                        placeholder={email}
                        className="input"
                      />
                      {deleteErr ? <p className="text-critical text-[13px] font-body">{deleteErr}</p> : null}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={deleteBusy}
                          onClick={() => void confirmDeleteAccount()}
                          className="btn-danger min-h-[44px] disabled:opacity-50"
                        >
                          {deleteBusy ? "Deleting…" : "Confirm delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteOpen(false);
                            setDeleteErr(null);
                          }}
                          className="btn-ghost min-h-[44px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </form>
            ) : null}

            {tab === "billing" ? (
              <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 md:p-6 space-y-4">
                <p className="section-label !mb-0">Billing</p>
                <p className="text-[13px] font-body text-on-surface-variant leading-[1.6]">
                  Plans, seats, and Stripe Checkout will appear here as billing is connected. You’re currently{" "}
                  {hasPaidPlan ? "on a paid-capable tier in preview." : "on the free Explorer tier."}
                </p>
                <Link href="/plans" className="btn-primary inline-flex min-h-[44px] gap-2">
                  View plans
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </section>
            ) : null}

            {tab === "notifications" ? (
              <NotificationSettingsPanel settings={settings} patchSettings={patchSettings} />
            ) : null}

            {tab === "social" ? (
              <div className="space-y-4">
                {oauthFlash ? (
                  <p
                    className={`rounded-xl border px-4 py-3 text-[13px] font-body leading-[1.6] ${
                      oauthFlash.startsWith("OAuth:")
                        ? "border-critical/40 bg-critical-container/40 text-critical"
                        : "border-primary/20 bg-primary/5 text-on-surface"
                    }`}
                    role="status"
                  >
                    {oauthFlash}
                  </p>
                ) : null}
                <SettingsSocialPanel />
              </div>
            ) : null}

            {tab === "api" ? (
              <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 md:p-6 space-y-4">
                <p className="section-label !mb-0">API keys</p>
                <p className="text-[13px] font-body text-on-surface-variant leading-[1.6]">
                  Personal API keys for automation are not available in this preview. Use the signed-in app and{" "}
                  <code className="text-primary bg-surface-container-high rounded-md px-1.5 py-0.5 text-[12px] font-mono">Bearer</code>{" "}
                  tokens from Supabase session where the API allows.
                </p>
              </section>
            ) : null}

            {tab === "referral" ? (
              <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 md:p-6">
                <p className="section-label !mb-4">Referral Program</p>
                <ReferralSystem />
              </section>
            ) : null}

          </div>
        </div>
      )}

      {/* Floating save bar — account tab only */}
      {session && tab === "account" && dirty ? (
        <div className="border-outline-variant fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-full border bg-surface-container-high px-4 py-2.5 shadow-lg backdrop-blur-md md:gap-4 md:px-5">
          <span className="text-on-surface-variant font-headline hidden text-[11px] font-600 uppercase tracking-[0.06em] sm:inline">
            Unsaved
          </span>
          <div className="bg-outline-variant/40 hidden h-6 w-px sm:block" />
          <button type="button" disabled={saving} onClick={() => void saveProfile()} className="btn-primary text-[12px] px-4 py-2 disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={discardAccountForm} className="btn-ghost text-[12px]">
            Discard
          </button>
        </div>
      ) : null}
    </div>
  );
}

function NotificationSettingsPanel({
  settings,
  patchSettings,
}: {
  settings: Record<string, unknown>;
  patchSettings: (p: Record<string, unknown>) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const row = useCallback(
    async (key: string, value: boolean) => {
      setErr(null);
      setBusy(key);
      try {
        await patchSettings({ [key]: value });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Update failed");
      } finally {
        setBusy(null);
      }
    },
    [patchSettings],
  );

  const toggle = (key: string, current: boolean) => (
    <button
      type="button"
      role="switch"
      aria-checked={current}
      disabled={busy !== null}
      onClick={() => void row(key, !current)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
        current ? "border-primary/40 bg-primary/25" : "border-outline-variant/40 bg-surface-container-high"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-0.5 h-6 w-6 rounded-full shadow transition-all ${
          current ? "left-[calc(100%-1.375rem)] bg-primary" : "left-0.5 bg-on-surface"
        }`}
      />
    </button>
  );

  const emailOn = settings.emailNotifications !== false;
  const newMessages = settings.newMessages !== false;
  const projectUpdates = settings.projectUpdates !== false;
  const emailRewards = settings.emailRewards !== false;
  const newBids = settings.newBids !== false;

  return (
    <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 md:p-6 space-y-6">
      <div>
        <p className="section-label !mb-2">Notifications</p>
        <p className="text-[13px] font-body text-on-surface-variant leading-[1.6]">Control how we reach you. Changes save immediately.</p>
      </div>
      {err ? <p className="text-critical text-[13px] font-body">{err}</p> : null}
      <ul className="divide-outline-variant/40 divide-y">
        {[
          { key: "emailNotifications", label: "Email notifications", sub: "Master switch for account emails", on: emailOn },
          { key: "newMessages", label: "New messages", sub: "Chat and inbox activity", on: newMessages },
          { key: "projectUpdates", label: "Project updates", sub: "Milestones and delivery events", on: projectUpdates },
          { key: "newBids", label: "New bids", sub: "When someone bids on your requests", on: newBids },
          { key: "emailRewards", label: "Rewards & seasons", sub: "Credits, seasons, and leaderboard", on: emailRewards },
        ].map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-4 py-5 first:pt-0">
            <div>
              <p className="text-[14px] font-body font-500 text-on-surface">{item.label}</p>
              <p className="text-[12px] font-body text-on-surface-variant leading-[1.5]">{item.sub}</p>
            </div>
            {busy === item.key ? (
              <span className="text-on-surface-variant text-[12px]">…</span>
            ) : (
              toggle(item.key, item.on)
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

