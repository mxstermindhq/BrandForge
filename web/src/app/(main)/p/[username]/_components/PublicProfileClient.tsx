"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { safeImageSrc } from "@/lib/image-url";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { useAuth } from "@/providers/AuthProvider";
import { FollowSaveButton } from "@/components/FollowSaveButton";
import { SkillEndorsements } from "@/components/SkillEndorsements";

function responseTimeLabel(availability?: string | null): string {
  const a = String(availability || "available").toLowerCase();
  if (a === "busy") return "High load — may take 24–48h";
  if (a === "unavailable") return "Not accepting new work";
  return "Usually responds same day";
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

type PortfolioItem = {
  id: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  tags?: string[] | null;
  project_url?: string | null;
  featured?: boolean | null;
};

type PublicProfile = {
  id?: string;
  full_name?: string | null;
  headline?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  role?: string | null;
  skills?: string[] | null;
  reputation?: number | null;
  dealWins?: number | null;
  dealLosses?: number | null;
  rating_avg?: number | null;
  kyc_status?: string | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  availability?: string | null;
  completed_projects_count?: number | null;
  credits?: number | null;
  publicServices?: ServiceCard[];
  openRequests?: RequestCard[];
  recentContracts?: ContractCard[];
  portfolios?: PortfolioItem[];
  currencySnapshot?: {
    honor_points: number;
    conquest_points: number;
    neonScore: number;
    total_conquest_earned?: number;
  } | null;
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

export function PublicProfileClient({ username }: { username: string }) {
  const { session } = useAuth();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [profileTab, setProfileTab] = useState<"about" | "services" | "reviews" | "portfolio">("about");

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

  if (loading) {
    return <PageRouteLoading title="Loading profile" variant="inline" />;
  }

  if (err || !data) {
    return (
      <div className="page-content">
        <div className="empty-state mx-auto max-w-[420px] py-16">
          <h1 className="page-title text-[22px]">Couldn’t load profile</h1>
          <p className="mt-3 text-[13px] font-body leading-[1.6] text-on-surface-variant" role="status">
            {err || "Something went wrong loading this profile."}
          </p>
          <p className="mt-4 text-[13px] font-body leading-[1.6] text-on-surface-variant">
            Double-check the URL and try again. You can manage your profile under{" "}
            <Link href="/settings" className="text-primary font-500 underline-offset-2 hover:underline">
              Settings
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary min-h-[44px]">
              Home
            </Link>
            <Link href="/marketplace" className="btn-secondary min-h-[44px]">
              Marketplace
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
  const dealWins = Number(data.dealWins) || 0;
  const kycVerified = String(data.kyc_status || "").toLowerCase() === "verified" || Boolean(data.is_verified);
  const bioText = String(data.bio || "").trim();
  const BIO_COLLAPSE_AT = 320;
  const bioLong = bioText.length > BIO_COLLAPSE_AT;
  const bioDisplay =
    bioLong && !bioExpanded ? `${bioText.slice(0, BIO_COLLAPSE_AT).trimEnd()}…` : bioText;

  const completedProjects = Number(data.completed_projects_count) || 0;
  const creditsUsd = data.credits != null && Number.isFinite(Number(data.credits)) ? Number(data.credits) : null;

  const services = data.publicServices || [];
  const openRequests = data.openRequests || [];
  const recentContracts = data.recentContracts || [];
  const reviews = data.reviews || [];
  const portfolios = Array.isArray(data.portfolios) ? data.portfolios : [];

  const memberSince = data.created_at
    ? new Date(data.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <article className="min-h-screen bg-surface text-on-surface max-w-6xl mx-auto px-6 py-8 pb-24">
      {data.banner_url ? (
        <div className="mb-6 h-40 w-full overflow-hidden rounded-2xl border border-outline-variant/60">
          <Image src={data.banner_url} alt="" width={1400} height={400} className="h-full w-full object-cover" />
        </div>
      ) : null}
      <header className="flex flex-wrap items-start gap-6">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-outline-variant/80">
          {av ? (
            <Image src={av} alt="" fill className="object-cover" sizes="64px" />
          ) : (
            <span className="bg-primary/10 text-primary flex h-full items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">star</span>
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title !mb-0 max-w-[520px]">{display}</h1>
            {kycVerified ? (
              <span className="text-primary text-[11px] font-headline font-600" title="Verified">
                Verified
              </span>
            ) : null}
          </div>
          <p className="text-on-surface-variant mt-1 text-[13px]">
            @{handle}
            {memberSince ? ` · Joined ${memberSince}` : null}
          </p>
          {titleLine ? (
            <p className="text-on-surface-variant mt-2 text-[14px] leading-[1.6]">{titleLine}</p>
          ) : null}

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3">
              <dt className="stat-label !text-[10px] text-sky-600 dark:text-sky-400">Projects</dt>
              <dd className="stat-number mt-1 tabular-nums text-on-surface">{completedProjects.toLocaleString()}</dd>
            </div>
            <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3">
              <dt className="stat-label !text-[10px] text-emerald-600 dark:text-emerald-400">Deals won</dt>
              <dd className="stat-number mt-1 tabular-nums text-emerald-600 dark:text-emerald-400">
                {dealWins.toLocaleString()}
              </dd>
            </div>
            <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3">
              <dt className="stat-label !text-[10px] text-teal-600 dark:text-teal-400">Response</dt>
              <dd className="mt-1 text-[12px] font-medium leading-snug text-on-surface">{responseTimeLabel(data.availability)}</dd>
            </div>
          </dl>

          {creditsUsd != null && creditsUsd > 0 ? (
            <p className="text-on-surface-variant mt-3 text-[12px]">
              Platform credits balance:{" "}
              <span className="font-semibold tabular-nums text-on-surface">${creditsUsd.toLocaleString()}</span>
            </p>
          ) : null}

          {isSelf ? (
            <Link
              href="/store"
              className="bg-surface-container border-outline-variant mt-4 flex items-center justify-between rounded-xl border px-4 py-3 text-[13px] text-on-surface transition-colors hover:bg-surface-container-high"
            >
              <span>Visit Store for boosts &amp; privileges</span>
              <span className="text-amber-500 font-semibold">→</span>
            </Link>
          ) : null}

          {!isSelf && data.id && data.username ? (
            <div className="mt-4">
              <FollowSaveButton targetUserId={data.id} username={data.username} />
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-10">
        <nav className="flex flex-wrap gap-1 border-b border-outline-variant pb-px" aria-label="Profile sections">
          {(
            [
              ["about", "About"],
              ["services", `Services · Requests`],
              ["reviews", `Feedback (${reviews.length})`],
              ["portfolio", `Portfolio (${portfolios.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setProfileTab(id)}
              className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
                profileTab === id
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {profileTab === "about" ? (
            <div className="space-y-8">
              <div className="rounded-xl border border-outline-variant bg-surface-container p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">About</p>
                {bioText ? (
                  <>
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-on-surface-variant">{bioDisplay}</p>
                    {bioLong ? (
                      <button
                        type="button"
                        onClick={() => setBioExpanded((e) => !e)}
                        className="mt-3 px-0 text-[12px] text-amber-500 hover:text-amber-600 transition"
                      >
                        {bioExpanded ? "Show less" : "Read more"}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-on-surface-variant">No bio yet.</p>
                )}
              </div>
              {data.id && data.username ? (
                <div>
                  <SkillEndorsements profileId={data.id} username={data.username} skills={sk} isOwnProfile={isSelf} />
                </div>
              ) : null}
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Recent contracts</p>
                {recentContracts.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No recent contracts.</p>
                ) : (
                  <ul className="space-y-3">
                    {recentContracts.map((c) => (
                      <li
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-3"
                      >
                        <p className="min-w-0 font-semibold text-on-surface">{c.title}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[12px] tabular-nums text-on-surface-variant">
                            {new Date(c.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="rounded-full border border-outline-variant bg-surface-container-high px-2 py-1 text-[10px] text-on-surface-variant">
                            {contractStatusLabel(c.status)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          ) : null}

          {profileTab === "services" ? (
            <div className="space-y-10">
              <section>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Services</p>
                {services.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No services listed yet.</p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {services.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-col rounded-xl border border-outline-variant bg-surface-container p-4 transition hover:border-sky-500/40"
                      >
                        <span className="mb-2 w-fit rounded-full border border-outline-variant bg-surface-container-high px-2 py-1 text-[10px] text-on-surface-variant">
                          {s.category}
                        </span>
                        <p className="font-semibold text-on-surface">{s.title}</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-500">${Number(s.base_price).toLocaleString()}</p>
                        <Link
                          href={`/services/${encodeURIComponent(s.id)}`}
                          className="mt-3 min-h-[40px] rounded-lg bg-sky-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-sky-500"
                        >
                          View &amp; bid
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Open requests</p>
                {openRequests.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No open requests.</p>
                ) : (
                  <ul className="space-y-3">
                    {openRequests.map((r) => (
                      <li key={r.id} className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-3">
                        <p className="font-semibold text-on-surface">{r.title}</p>
                        <p className="mt-1 text-[12px] text-on-surface-variant">
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
            </div>
          ) : null}

          {profileTab === "reviews" ? (
            <section>
              {reviews.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No feedback yet.</p>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-xl border border-outline-variant bg-surface-container p-4">
                      <p className="text-[12px] text-on-surface-variant">
                        @
                        {r.reviewerUsername || r.reviewerName?.replace(/\s+/g, "").toLowerCase() || "member"}
                      </p>
                      <p className="mt-2 text-[13px] leading-snug text-on-surface-variant">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {profileTab === "portfolio" ? (
            <section>
              {portfolios.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No portfolio pieces published yet.</p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {portfolios.map((p) => (
                    <li key={p.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-semibold text-on-surface">{p.title || "Project"}</p>
                        {p.featured ? (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      {p.category ? (
                        <p className="mb-2 text-[11px] uppercase tracking-wide text-violet-400">{p.category}</p>
                      ) : null}
                      {p.description ? (
                        <p className="line-clamp-4 text-[13px] text-on-surface-variant">{p.description}</p>
                      ) : null}
                      {p.project_url ? (
                        <a
                          href={p.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm font-semibold text-sky-500 hover:text-sky-400"
                        >
                          Open link →
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
