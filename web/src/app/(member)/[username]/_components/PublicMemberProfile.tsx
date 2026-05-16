"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { safeImageSrc } from "@/lib/image-url";
import { talentInitials, formatMemberSince } from "@/lib/talent-types";
import { profilePath, profileRequestPath, profileServicePath } from "@/lib/reserved-paths";
import { useAuth } from "@/providers/AuthProvider";
import { useLandingUI } from "@/app/(landing)/_components/LandingUIProvider";
import { ContactCTA } from "@/app/(landing)/_components/ContactCTA";

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
};

type PublicProfile = {
  id?: string;
  full_name?: string | null;
  username?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  skills?: string[] | null;
  availability?: string | null;
  location?: string | null;
  rate_label?: string | null;
  min_budget?: number | null;
  remote_only?: boolean | null;
  open_to_offers?: boolean | null;
  created_at?: string | null;
  publicServices?: ServiceCard[];
  openRequests?: RequestCard[];
};

export function PublicMemberProfile({ username }: { username: string }) {
  const { session } = useAuth();
  const { openProfileEditor } = useLandingUI();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"services" | "requests" | "about">("services");

  const load = useCallback(async () => {
    const json = await apiGetJson<{ profile: PublicProfile }>(
      `/api/profiles/${encodeURIComponent(username)}/public`,
      null,
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
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-surface-container-high" />
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-headline text-2xl font-bold">Profile not found</h1>
        <p className="mt-2 text-on-surface-variant">{err || "This user does not exist."}</p>
        <Link href="/" className="btn-primary mt-6 inline-flex min-h-11">
          Back to directory
        </Link>
      </div>
    );
  }

  const handle = String(data.username || username).replace(/^@+/, "");
  const display = data.full_name?.trim() || handle;
  const av = safeImageSrc(data.avatar_url);
  const viewerId = session?.user?.id ? String(session.user.id) : null;
  const isSelf = Boolean(viewerId && data.id && viewerId === data.id);
  const services = data.publicServices || [];
  const requests = data.openRequests || [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const since = formatMemberSince(data.created_at || null);
  const tg = contactMessage(`Hire ${display} on BrandForge`);

  const availLabel =
    data.availability === "busy"
      ? "Limited slots"
      : data.availability === "unavailable"
        ? "Fully booked"
        : "Available";

  return (
    <article className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6">
      <div className="surface-card overflow-hidden rounded-2xl border border-outline-variant/60">
        {data.banner_url ? (
          <div className="h-32 w-full overflow-hidden sm:h-40">
            <Image src={data.banner_url} alt="" width={1200} height={320} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-r from-primary/15 via-surface-container to-tertiary/10 sm:h-32" />
        )}

        <div className="relative px-5 pb-6 pt-0 sm:px-8">
          <div className="-mt-10 mb-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-surface shadow-lg sm:h-24 sm:w-24">
                {av ? (
                  <Image src={av} alt="" fill className="object-cover" sizes="96px" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-primary/15 font-headline text-xl font-bold text-primary">
                    {talentInitials(display)}
                  </span>
                )}
              </div>
              <div className="pb-1">
                <h1 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl">{display}</h1>
                {data.headline ? <p className="text-primary font-medium">{data.headline}</p> : null}
                <p className="text-sm text-on-surface-variant">
                  brandforge.gg/{handle}
                  {since ? ` · Member since ${since}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-outline-variant px-3 py-1 text-xs font-semibold">{availLabel}</span>
              {isSelf ? (
                <button type="button" onClick={openProfileEditor} className="btn-primary min-h-10 text-sm">
                  Edit profile
                </button>
              ) : (
                <a href={tg} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-10 text-sm">
                  Contact
                </a>
              )}
            </div>
          </div>

          {data.bio ? <p className="mt-4 max-w-2xl text-on-surface-variant leading-relaxed">{data.bio}</p> : null}

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {data.rate_label ? <span className="font-semibold text-on-surface">{data.rate_label}</span> : null}
            {data.min_budget != null && data.min_budget > 0 ? (
              <span className="text-on-surface-variant">from €{Number(data.min_budget).toLocaleString()}</span>
            ) : null}
            {data.location ? <span className="text-on-surface-variant">· {data.location}</span> : null}
            {data.remote_only ? <span className="text-on-surface-variant">· Remote</span> : null}
            {data.open_to_offers ? <span className="text-on-surface-variant">· Open to offers</span> : null}
          </div>

          {skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="rounded border border-outline-variant/60 bg-surface-container-low px-2 py-0.5 text-xs">
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex gap-2 border-b border-outline-variant">
        {(["services", "requests", "about"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === t ? "border-b-2 border-primary text-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t}
            {t === "services" && services.length ? ` (${services.length})` : ""}
            {t === "requests" && requests.length ? ` (${requests.length})` : ""}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "services" ? (
          services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant py-12 text-center">
              <p className="text-on-surface-variant">No published services yet.</p>
              {isSelf ? (
                <Link href="/services/new" className="btn-primary mt-4 inline-flex min-h-10 text-sm">
                  Create a service
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {services.map((svc) => (
                <li key={svc.id}>
                  <Link
                    href={profileServicePath(handle, svc.id)}
                    className="surface-card block rounded-xl border border-outline-variant/60 p-4 transition hover:border-primary/40"
                  >
                    <p className="text-xs text-on-surface-variant">{svc.category}</p>
                    <p className="font-headline font-semibold text-on-surface">{svc.title}</p>
                    <p className="mt-2 text-lg font-bold text-primary">${Number(svc.base_price).toLocaleString()}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === "requests" ? (
          requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant py-12 text-center">
              <p className="text-on-surface-variant">No open requests.</p>
              {isSelf ? (
                <Link href="/requests/new" className="btn-primary mt-4 inline-flex min-h-10 text-sm">
                  Post a request
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {requests.map((req) => (
                <li key={req.id}>
                  <Link
                    href={profileRequestPath(handle, req.id)}
                    className="surface-card block rounded-xl border border-outline-variant/60 p-4 transition hover:border-primary/40"
                  >
                    <p className="font-headline font-semibold">{req.title}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Budget:{" "}
                      {req.budget_min != null && req.budget_max != null
                        ? `$${req.budget_min}–$${req.budget_max}`
                        : req.budget_min != null
                          ? `$${req.budget_min}+`
                          : "Open"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === "about" ? (
          <div className="space-y-4 text-sm text-on-surface-variant">
            <p>{data.bio || "No bio yet."}</p>
            <p>
              All hires go through {CONTACT.guarantor} via{" "}
              <a href={CONTACT.telegram} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                {CONTACT.telegramHandle}
              </a>{" "}
              or Discord.
            </p>
            {!isSelf ? <ContactCTA subject={`Hire ${display}`} label="Start conversation" variant="primary" /> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
