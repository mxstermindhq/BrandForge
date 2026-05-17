"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { CuratedOperator, getCuratedOperatorByUsername } from "@/content/curated-operators";
import { safeImageSrc } from "@/lib/image-url";
import { talentInitials, formatMemberSince } from "@/lib/talent-types";
import { profileServicePath } from "@/lib/reserved-paths";
import { useAuth } from "@/providers/AuthProvider";
import { useLandingUI } from "@/app/(landing)/_components/LandingUIProvider";
import { ContactCTA } from "@/app/(landing)/_components/ContactCTA";

type ServiceCard = {
  id: string;
  title: string;
  category: string;
  base_price: number;
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
};

function CuratedProfileFaq({ operator }: { operator: CuratedOperator }) {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <section className="mt-8 rounded-2xl border border-[#A67C2E]/16 bg-white p-5">
      <h2 className="font-headline text-2xl font-semibold text-[#1F2937]">Profile FAQ</h2>
      <div className="mt-4 space-y-3">
        {operator.faq.map((item, idx) => (
          <div key={item.question} className="rounded-lg border border-[#A67C2E]/16 bg-[#FCFAF5]">
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold text-[#1F2937]">{item.question}</span>
              <span className="text-[#6B7280]">{openFaq === idx ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {openFaq === idx ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm text-[#6B7280]">{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

function CuratedProfileView({ operator }: { operator: CuratedOperator }) {
  const tg = contactMessage(`Profile inquiry: ${operator.name}`);

  return (
    <article className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-2xl border border-[#A67C2E]/18 bg-white p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#A67C2E]/28 bg-[#A67C2E]/10 text-lg font-semibold text-[#5C4620]">
              {talentInitials(operator.name)}
            </div>
            <div>
              <h1 className="font-headline text-3xl font-semibold text-[#1F2937]">{operator.name}</h1>
              <p className="text-[#6B7280]">{operator.role}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide">
                <span className="rounded-full border border-[#A67C2E]/28 px-2 py-0.5 text-[#8A6A27]">Verified profile</span>
                <span className="rounded-full border border-[#1F7A4D]/35 bg-[#1F7A4D]/10 px-2 py-0.5 text-[#1F7A4D]">
                  {operator.availability === "limited" ? "Limited slots" : "Available"}
                </span>
              </div>
            </div>
          </div>
          <a href={tg} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11 px-5 text-sm">
            Start conversation →
          </a>
        </div>
      </motion.section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="rounded-xl border border-[#A67C2E]/16 bg-white p-5">
            <h2 className="font-headline text-2xl font-semibold text-[#1F2937]">About</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{operator.bio}</p>
          </div>
          <div className="rounded-xl border border-[#1F7A4D]/28 bg-[#EEF7F1] p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#1F7A4D]">Best result</p>
            <p className="mt-1 text-sm text-[#1F7A4D]">{operator.bestResult}</p>
          </div>
          <div className="rounded-xl border border-[#A67C2E]/16 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8A6A27]">Won't take</p>
            <p className="mt-1 text-sm text-[#6B7280]">{operator.wontTake}</p>
          </div>
          {operator.status === "building" ? (
            <div className="rounded-xl border border-[#A67C2E]/16 bg-[#FCFAF5] p-4 text-sm text-[#6B7280]">
              Profile being completed now. Core availability and experience are verified by {CONTACT.guarantor}.
            </div>
          ) : null}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="space-y-4"
        >
          <div className="rounded-xl border border-[#A67C2E]/16 bg-white p-5">
            <h3 className="font-headline text-xl font-semibold text-[#1F2937]">Stats</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
              <li>Experience: {operator.yearsExp} years</li>
              <li>Trust score: {operator.amanahScore}/100</li>
              <li>Completion rate: {operator.completionRate}%</li>
              <li>Pricing: {operator.startingPrice}</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[#A67C2E]/16 bg-white p-5">
            <h3 className="font-headline text-xl font-semibold text-[#1F2937]">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {operator.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-[#A67C2E]/20 bg-[#F7F3EA] px-2.5 py-1 text-[11px] text-[#374151]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>

      <CuratedProfileFaq operator={operator} />

      <div className="mt-8 flex justify-center">
        <a href={tg} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11 px-8 text-sm">
          Contact via mxstermind →
        </a>
      </div>
    </article>
  );
}

export function PublicMemberProfile({ username }: { username: string }) {
  const curated = useMemo(() => getCuratedOperatorByUsername(username), [username]);
  const { session } = useAuth();
  const { openProfileEditor } = useLandingUI();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"services" | "about">("services");

  const load = useCallback(async () => {
    const json = await apiGetJson<{ profile: PublicProfile }>(`/api/profiles/${encodeURIComponent(username)}/public`, null);
    return json.profile || null;
  }, [username]);

  useEffect(() => {
    if (curated) {
      setLoading(false);
      setErr(null);
      return;
    }
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
  }, [curated, load]);

  if (curated) {
    return <CuratedProfileView operator={curated} />;
  }

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
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const since = formatMemberSince(data.created_at || null);
  const tg = contactMessage(`Hire ${display} on BrandForge`);

  const availLabel =
    data.availability === "busy" ? "Limited slots" : data.availability === "unavailable" ? "Fully booked" : "Available";

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
              <span className="text-on-surface-variant">from EUR {Number(data.min_budget).toLocaleString()}</span>
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
        {(["services", "about"] as const).map((t) => (
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
                    <p className="mt-2 text-lg font-bold text-primary">EUR {Number(svc.base_price).toLocaleString()}</p>
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
