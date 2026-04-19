"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { safeImageSrc } from "@/lib/image-url";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { TrustChipsRow } from "@/components/trust/TrustChipsRow";
import { useAuth } from "@/providers/AuthProvider";
import { TIER_FLOORS_SEASON_1 } from "@/config/marketplace-season";

function tierCssVar(tier: string): string {
  const t = String(tier || "").toLowerCase();
  if (t === "rival") return "var(--tier-rival)";
  if (t === "duelist") return "var(--tier-duelist)";
  if (t === "gladiator") return "var(--tier-gladiator)";
  if (t === "undisputed") return "var(--tier-undisputed)";
  return "var(--tier-challenger)";
}

function budgetLabel(min: number | null | undefined, max: number | null | undefined): string {
  if (min != null && max != null) return `$${Number(min).toLocaleString()}–$${Number(max).toLocaleString()}`;
  if (min != null) return `$${Number(min).toLocaleString()}+`;
  if (max != null) return `Up to $${Number(max).toLocaleString()}`;
  return "Budget on request";
}

function contractStatusLabel(status: string): string {
  const s = String(status || "").toLowerCase();
  if (s === "released") return "Completed";
  return "In progress";
}

type ServiceCard = {
  id: string;
  title: string;
  category: string;
  base_price: number;
  slug: string | null;
};

type RequestCard = {
  id: string;
  title: string;
  budget_min: number | null;
  budget_max: number | null;
  due_date: string | null;
  proposalCount?: number;
};

type ContractCard = {
  id: string;
  title: string;
  status: string;
  updated_at: string;
};

type ReviewCard = {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  reviewerName: string;
  reviewerUsername?: string | null;
};

type PublicProfile = {
  id?: string;
  full_name?: string | null;
  headline?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  skills?: string[] | null;
  reputation?: number | null;
  dealWins?: number | null;
  dealLosses?: number | null;
  rating_avg?: number | null;
  kyc_status?: string | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  publicServices?: ServiceCard[];
  openRequests?: RequestCard[];
  recentContracts?: ContractCard[];
  currencySnapshot?: { honor_points: number; conquest_points: number; neonScore: number } | null;
  ratingSnapshot?: Record<string, unknown> | null;
  reviews?: ReviewCard[];
};

type PublicProfilePayload = {
  profile: PublicProfile;
};

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

const TIER_ORDER = ["challenger", "rival", "duelist", "gladiator", "undisputed"] as const;

export function PublicProfileClient({ username }: { username: string }) {
  const { session } = useAuth();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);

  const load = useCallback(async () => {
    const t = await getAccessToken();
    const json = await apiGetJson<PublicProfilePayload>(
      `/api/profiles/${encodeURIComponent(username)}/public`,
      t,
    );
    return json.profile || null;
  }, [username]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const p = await load();
        if (!cancelled) setData(p);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const ratingSnap = data?.ratingSnapshot as
    | {
        current_rp?: number;
        peak_rp_season?: number;
        current_tier?: string;
        win_streak?: number;
        deal_wins?: number;
        deal_losses?: number;
        winRate?: number;
      }
    | null
    | undefined;

  const tierProgress = useMemo(() => {
    const tier = String(ratingSnap?.current_tier || "challenger").toLowerCase();
    const idx = TIER_ORDER.indexOf(tier as (typeof TIER_ORDER)[number]);
    const rp = Number(ratingSnap?.current_rp) || 0;
    const curFloor =
      TIER_FLOORS_SEASON_1[tier as keyof typeof TIER_FLOORS_SEASON_1] ??
      TIER_FLOORS_SEASON_1.challenger;
    const nextIdx = idx >= 0 && idx < TIER_ORDER.length - 1 ? idx + 1 : null;
    const nextFloor = nextIdx != null ? TIER_FLOORS_SEASON_1[TIER_ORDER[nextIdx]] : TIER_FLOORS_SEASON_1.undisputed;
    const span = nextFloor - curFloor;
    const pct = nextIdx == null ? 100 : span > 0 ? Math.min(100, Math.max(0, Math.round(((rp - curFloor) / span) * 100))) : 0;
    return { pct, nextFloor, curFloor, tier };
  }, [ratingSnap]);

  if (loading) {
    return <PageRouteLoading title="Loading profile" variant="inline" />;
  }

  if (err || !data) {
    const msg = (err || "").toLowerCase();
    const is404 = msg.includes("not found") || msg.includes("404");
    return (
      <div className="page-content">
        <div className="empty-state mx-auto max-w-[420px] py-16">
          <h1 className="page-title text-[22px]">{is404 ? "Profile not found" : "Couldn’t load profile"}</h1>
          <p className="mt-3 text-[13px] font-body leading-[1.6] text-on-surface-variant" role="status">
            {is404
              ? "There’s no member with this handle, it matches a reserved route name, or the account hasn’t set a username yet."
              : err || "Something went wrong loading this profile."}
          </p>
          <p className="mt-4 text-[13px] font-body leading-[1.6] text-on-surface-variant">
            Double-check the URL. To publish your page, set a username under{" "}
            <Link href="/settings" className="text-primary font-500 underline-offset-2 hover:underline">
              Settings
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary min-h-[44px]">
              Home
            </Link>
            <Link href="/services" className="btn-secondary min-h-[44px]">
              Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const av = safeImageSrc(data.avatar_url);
  const handle = String(data.username || username || "").replace(/^@/, "");
  const display = data.full_name?.trim() || handle || username;
  const titleLine = data.headline?.trim() || null;
  const sk = Array.isArray(data.skills) ? data.skills : [];
  const viewerId = session?.user?.id ? String(session.user.id) : null;
  const profileId = data.id ? String(data.id) : null;
  const isSelf = Boolean(viewerId && profileId && viewerId === profileId);
  const dealWins = Number(ratingSnap?.deal_wins ?? data.dealWins) || 0;
  const dealLosses = Number(ratingSnap?.deal_losses ?? data.dealLosses) || 0;
  const ratingAvg = data.rating_avg != null ? Number(data.rating_avg) : null;
  const kycVerified = String(data.kyc_status || "").toLowerCase() === "verified" || Boolean(data.is_verified);
  const bioText = String(data.bio || "").trim();
  const BIO_COLLAPSE_AT = 320;
  const bioLong = bioText.length > BIO_COLLAPSE_AT;
  const bioDisplay =
    bioLong && !bioExpanded ? `${bioText.slice(0, BIO_COLLAPSE_AT).trimEnd()}…` : bioText;

  const honor = data.currencySnapshot?.honor_points ?? 0;
  const conquest = data.currencySnapshot?.conquest_points ?? 0;
  const neon = data.currencySnapshot?.neonScore ?? honor + conquest * 10;
  const currentRp = Number(ratingSnap?.current_rp) || 0;
  const peakRp = Number(ratingSnap?.peak_rp_season) || 0;
  const tierLabel = String(ratingSnap?.current_tier || "challenger");
  const winStreak = Number(ratingSnap?.win_streak) || 0;
  const winRate =
    ratingSnap?.winRate != null
      ? Number(ratingSnap.winRate)
      : dealWins + dealLosses > 0
        ? Math.round((dealWins / (dealWins + dealLosses)) * 1000) / 10
        : 0;

  const services = data.publicServices || [];
  const openRequests = data.openRequests || [];
  const recentContracts = data.recentContracts || [];
  const reviews = (data.reviews || []).slice(0, 5);

  const memberSince = data.created_at
    ? new Date(data.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <article className="min-h-screen bg-surface text-on-surface max-w-6xl mx-auto px-6 py-8 pb-24">
      <header className="flex flex-wrap items-start gap-6">
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full"
          style={{ boxShadow: `0 0 0 2px ${tierCssVar(tierLabel)}` }}
        >
          {av ? (
            <Image src={av} alt="" fill className="object-cover" sizes="64px" />
          ) : (
            <span className="bg-surface-container-high text-primary flex h-full items-center justify-center text-lg font-headline font-700">
              {handle.slice(0, 2).toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title !mb-0 max-w-[520px]">{display}</h1>
            <span
              className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-headline font-600 capitalize"
              style={{ borderColor: tierCssVar(tierLabel), color: tierCssVar(tierLabel) }}
            >
              {tierLabel}
            </span>
            {kycVerified ? (
              <span className="text-primary text-[11px] font-headline font-600" title="Verified">
                Verified
              </span>
            ) : null}
          </div>
          <p className="text-on-surface-variant mt-1 text-[13px]">
            @{handle}
            {memberSince ? ` · Member since ${memberSince}` : null}
          </p>
          {titleLine ? (
            <p className="text-on-surface-variant mt-2 text-[14px] leading-[1.6]">{titleLine}</p>
          ) : null}

          <TrustChipsRow
            className="mt-4"
            rating={ratingAvg}
            kycVerified={kycVerified}
            dealWins={dealWins}
            dealLosses={dealLosses}
          />

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="bg-surface-container-low border-outline-variant/60 rounded-xl border p-3">
              <dt className="stat-label !text-[10px]">Honor</dt>
              <dd className="text-secondary stat-number mt-1 tabular-nums">{honor.toLocaleString()}</dd>
            </div>
            <div className="bg-surface-container-low border-outline-variant/60 rounded-xl border p-3">
              <dt className="stat-label !text-[10px]">Conquest</dt>
              <dd
                className="stat-number mt-1 tabular-nums"
                style={{ color: "var(--color-primary-container)" }}
              >
                {conquest.toLocaleString()}
              </dd>
            </div>
            <div className="bg-surface-container-low border-outline-variant/60 rounded-xl border p-3">
              <dt className="stat-label !text-[10px]">RP</dt>
              <dd className="stat-number mt-1 tabular-nums">{currentRp.toLocaleString()}</dd>
            </div>
            <div className="bg-surface-container-low border-outline-variant/60 rounded-xl border p-3">
              <dt className="stat-label !text-[10px]">Tier</dt>
              <dd className="stat-number mt-1 capitalize">{tierLabel}</dd>
            </div>
          </dl>

          <div className="bg-surface-container-low border-outline-variant/60 mt-6 rounded-xl border p-5">
            <p className="section-label !mb-2">SEASON 1 STANDING</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="text-[13px] text-on-surface-variant">
                Current RP:{" "}
                <span className="font-headline font-700 text-on-surface tabular-nums">{currentRp.toLocaleString()}</span>
              </p>
              <p className="text-[13px] text-on-surface-variant">
                Season best:{" "}
                <span className="font-headline font-700 text-on-surface tabular-nums">{peakRp.toLocaleString()}</span>
              </p>
              <p className="text-[13px] text-on-surface-variant">
                Win streak:{" "}
                <span className="font-headline font-700 text-on-surface tabular-nums">
                  {winStreak >= 3 ? `${winStreak} 🔥` : winStreak.toLocaleString()}
                </span>
              </p>
              <p className="text-[13px] text-on-surface-variant">
                W / L:{" "}
                <span className="font-headline font-700 tabular-nums text-on-surface">
                  {dealWins.toLocaleString()} / {dealLosses.toLocaleString()}
                </span>
              </p>
              <p className="text-[13px] text-on-surface-variant sm:col-span-2">
                Win rate:{" "}
                <span className="font-headline font-700 text-on-surface tabular-nums">{winRate.toLocaleString()}%</span>
              </p>
            </div>
            <div className="mt-4">
              <div className="text-on-surface-variant mb-1 flex justify-between text-[10px] font-headline font-600 uppercase tracking-wider">
                <span>Progress to next tier</span>
                <span className="tabular-nums">{tierProgress.pct}%</span>
              </div>
              <div className="bg-surface-container-high h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${tierProgress.pct}%`,
                    backgroundColor: tierCssVar(tierProgress.tier),
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border-outline-variant/60 mt-6 rounded-xl border p-5">
            <p className="section-label !mb-2">THIS SEASON</p>
            <div className="flex flex-wrap items-baseline gap-6">
              <p className="text-[14px] text-on-surface-variant">
                <span className="text-secondary font-headline font-700 tabular-nums">{honor.toLocaleString()}</span>{" "}
                Honor
              </p>
              <p className="text-[14px] text-on-surface-variant">
                <span className="font-bold tabular-nums text-amber-400">
                  {conquest.toLocaleString()}
                </span>{" "}
                Conquest
              </p>
            </div>
            <p className="text-on-surface-variant mt-2 text-[12px]">
              Honor resets weekly (-5% Mondays) · Conquest is permanent this season
            </p>
            <p className="text-on-surface mt-3 font-semibold text-sm">
              Neon Score:{" "}
              <span className="text-purple-400 tabular-nums">{neon.toLocaleString()}</span>
            </p>
          </div>

          {isSelf ? (
            <Link
              href="/store"
              className="bg-surface-container border-outline-variant mt-4 flex items-center justify-between rounded-xl border px-4 py-3 text-[13px] text-on-surface transition-colors hover:bg-surface-container-high"
            >
              <span>Visit Store for boosts &amp; privileges</span>
              <span className="text-amber-500 font-semibold">→</span>
            </Link>
          ) : null}
        </div>
      </header>

      {bioText ? (
        <div className="bg-surface-container border-outline-variant mt-8 rounded-xl border p-5">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">About</p>
          <p className="text-on-surface-variant whitespace-pre-wrap text-[14px] leading-[1.6]">{bioDisplay}</p>
          {bioLong ? (
            <button
              type="button"
              onClick={() => setBioExpanded((e) => !e)}
              className="mt-3 px-0 text-[12px] text-amber-500 hover:text-amber-600 transition"
            >
              {bioExpanded ? "Show less" : "Read more"}
            </button>
          ) : null}
        </div>
      ) : null}

      {sk.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Skills</p>
          <ul className="flex flex-wrap gap-2">
            {sk.slice(0, 12).map((s, i) => (
              <li key={`${i}-${s}`} className="px-2 py-1 rounded-full bg-surface-container-high border border-outline-variant text-xs text-on-surface-variant">
                {s}
              </li>
            ))}
            {sk.length > 12 ? (
              <li className="text-on-surface-variant self-center text-[12px]">+{sk.length - 12} more</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <section className="mt-10">
        <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Services</p>
        {services.length === 0 ? (
          <p className="text-on-surface-variant mt-2 text-[13px]">No services listed yet.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <li
                key={s.id}
                className="bg-surface-container border-outline-variant flex flex-col rounded-xl border p-4"
              >
                <span className="px-2 py-1 rounded-full bg-surface-container-high border border-outline-variant text-[10px] text-on-surface-variant w-fit mb-2">{s.category}</span>
                <p className="font-semibold text-on-surface">{s.title}</p>
                <p className="text-amber-500 mt-1 text-sm font-semibold tabular-nums">${Number(s.base_price).toLocaleString()}</p>
                <Link href={`/services/${encodeURIComponent(s.id)}`} className="mt-3 min-h-[40px] text-center px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition">
                  Bid
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Open requests</p>
        {openRequests.length === 0 ? (
          <p className="text-on-surface-variant mt-2 text-[13px]">No open requests.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {openRequests.map((r) => (
              <li
                key={r.id}
                className="bg-surface-container-low border-outline-variant/60 rounded-xl border px-4 py-3"
              >
                <p className="font-semibold text-on-surface-variant">{r.title}</p>
                <p className="text-on-surface-variant mt-1 text-[12px]">
                  {budgetLabel(r.budget_min, r.budget_max)}
                  {r.due_date
                    ? ` · Due ${new Date(r.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : ""}
                  {" · "}
                  {(r.proposalCount ?? 0).toLocaleString()} proposals
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Recent contracts</p>
        {recentContracts.length === 0 ? (
          <p className="text-on-surface-variant mt-2 text-[13px]">No recent contracts.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {recentContracts.map((c) => (
              <li
                key={c.id}
                className="bg-surface-container-low border-outline-variant/60 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3"
              >
                <p className="min-w-0 font-semibold text-on-surface">{c.title}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-on-surface-variant text-[12px] tabular-nums">
                    {new Date(c.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-surface-container-high border border-outline-variant text-[10px] text-on-surface-variant">{contractStatusLabel(c.status)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Reviews</p>
        {reviews.length === 0 ? (
          <p className="text-on-surface-variant mt-2 text-[13px]">No reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="bg-surface-container border-outline-variant rounded-xl border p-4">
                <p className="text-[12px] text-on-surface-variant">
                  {r.rating}★ · @
                  {r.reviewerUsername || r.reviewerName?.replace(/\s+/g, "").toLowerCase() || "member"}
                </p>
                <p className="text-on-surface-variant mt-2 line-clamp-3 text-[13px] leading-snug">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
