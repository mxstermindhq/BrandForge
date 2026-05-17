"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, CONTACT, contactMessage, type TalentCategory } from "@/content/landing-directory";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { safeImageSrc } from "@/lib/image-url";
import {
  formatMemberSince,
  talentAccent,
  talentInitials,
  type TalentAvailability,
  type TalentMember,
} from "@/lib/talent-types";
import { profilePath, profileServicePath } from "@/lib/reserved-paths";
import { useLandingUI } from "./LandingUIProvider";

const AVAILABILITY: Record<TalentAvailability, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-success/15 text-success border-success/30" },
  limited: { label: "Limited slots", className: "bg-warning/15 text-warning border-warning/30" },
  waitlist: { label: "Waitlist", className: "bg-on-surface-variant/15 text-on-surface-variant border-outline-variant" },
};

const LOW_SIGNAL = new Set(["lol", "bro", "gg", "any", "test", "none", "n/a", "na"]);
const SHORT_ALLOW = new Set(["ui", "ux", "qa", "go", "ai"]);

function cleanToken(raw: string): string | null {
  const v = String(raw || "").trim();
  if (!v) return null;
  const lower = v.toLowerCase();
  if (LOW_SIGNAL.has(lower)) return null;
  if (lower.length < 3 && !SHORT_ALLOW.has(lower)) return null;
  if (lower === "figna") return "Figma";
  if (lower === "nextjs") return "Next.js";
  return v;
}

function cleanTools(tools: string[]): string[] {
  const out: string[] = [];
  for (const t of tools) {
    const c = cleanToken(t);
    if (c && !out.some((x) => x.toLowerCase() === c.toLowerCase())) out.push(c);
    if (out.length >= 8) break;
  }
  return out;
}

function cleanPreferences(prefs: string[]): string[] {
  const out: string[] = [];
  for (const p of prefs) {
    const v = String(p || "").trim();
    if (!v) continue;
    const lower = v.toLowerCase();
    if (LOW_SIGNAL.has(lower)) continue;
    let next = v;
    if (lower === "project") next = "Project-based";
    if (lower === "immediately") next = "Immediate start";
    if (lower === "open to offers") next = "Open to offers";
    if (!out.some((x) => x.toLowerCase() === next.toLowerCase())) out.push(next);
    if (out.length >= 4) break;
  }
  return out;
}

function TalentCard({
  person,
  isOwn,
  onEdit,
}: {
  person: TalentMember;
  isOwn?: boolean;
  onEdit?: () => void;
}) {
  const avail = AVAILABILITY[person.availability];
  const accent = talentAccent(person.username);
  const avatar = safeImageSrc(person.avatarUrl);
  const since = formatMemberSince(person.memberSince);
  const tg = contactMessage(`Hire ${person.name} — ${person.role}`);
  const tools = cleanTools(person.tools);
  const preferences = cleanPreferences(person.preferences);
  const displayRole = person.role?.trim() || "Operator";

  return (
    <article
      className={`group surface-card flex flex-col overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:border-primary/40 ${
        isOwn ? "border-primary/50 ring-1 ring-primary/20" : "border-outline-variant/60"
      }`}
    >
      <div className={`bg-gradient-to-br ${accent} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={profilePath(person.username)} className="shrink-0">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-xl border border-outline-variant/50 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant/50 bg-surface/80 font-headline text-sm font-bold text-on-surface backdrop-blur">
                  {talentInitials(person.name)}
                </div>
              )}
            </Link>
            <div className="min-w-0">
              <Link href={profilePath(person.username)} className="hover:text-primary">
                <h3 className="truncate font-headline text-base font-semibold text-on-surface">{person.name}</h3>
              </Link>
              <p className="truncate text-sm font-medium text-primary">{displayRole}</p>
              <p className="truncate text-[11px] text-on-surface-variant">@{person.username}</p>
              {since ? <p className="text-[10px] text-on-surface-variant">Member since {since}</p> : null}
            </div>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${avail.className}`}>
            {avail.label}
          </span>
        </div>
        {person.highlight ? (
          <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{person.highlight}</p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-surface-container-high px-2 py-1 font-medium text-on-surface-variant">
            {person.category}
          </span>
          <span className="text-on-surface-variant">{person.yearsExp}+ yrs</span>
          <span className="font-semibold text-on-surface">{person.rateLabel}</span>
          {person.location ? <span className="text-on-surface-variant">· {person.location}</span> : null}
        </div>

        {person.services.length > 0 ? (
          <div>
            <p className="section-label !mb-2 !text-[10px]">Services</p>
            <ul className="space-y-1.5">
              {person.services.map((svc) => (
                <li key={svc.id}>
                  <Link
                    href={profileServicePath(person.username, svc.id)}
                    className="flex items-center justify-between gap-2 rounded-md border border-outline-variant/50 bg-surface-container-low px-2 py-1.5 text-[11px] transition hover:border-primary/40"
                  >
                    <span className="truncate font-medium text-on-surface">{svc.title}</span>
                    <span className="shrink-0 text-primary">${svc.price.toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tools.length > 0 ? (
          <div>
            <p className="section-label !mb-2 !text-[10px]">Skills</p>
            <div className="flex flex-wrap gap-2">
              {tools.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-outline-variant/60 bg-surface-container-low px-2.5 py-1 text-[11px] text-on-surface-variant"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {preferences.length > 0 ? (
          <div>
            <p className="section-label !mb-2 !text-[10px]">Preferences</p>
            <div className="flex flex-wrap gap-2">
              {preferences.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-outline-variant/60 bg-surface-container-low px-2.5 py-1 text-[11px] text-on-surface-variant"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {isOwn && onEdit ? (
            <button type="button" onClick={onEdit} className="btn-primary min-h-10 flex-1 text-sm">
              Edit profile
            </button>
          ) : (
            <>
              <a href={tg} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-10 flex-1 justify-center text-sm">
                Contact
              </a>
              <Link href={profilePath(person.username)} className="btn-secondary min-h-10 flex-1 justify-center text-sm">
                View profile
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function TalentDirectory() {
  const [category, setCategory] = useState<TalentCategory>("All");
  const [members, setMembers] = useState<TalentMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { me } = useAuthMe();
  const { directoryVersion, openProfileEditor } = useLandingUI();

  const myUsername = me?.profile?.username?.toLowerCase() || "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
      const res = await fetch(`/api/talent${qs}`, { headers: { Accept: "application/json" } });
      const data = (await res.json()) as { members?: TalentMember[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setMembers(data.members || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load directory");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load, directoryVersion]);

  const sorted = useMemo(() => {
    if (!myUsername) return members;
    const mine = members.filter((m) => m.username.toLowerCase() === myUsername);
    const rest = members.filter((m) => m.username.toLowerCase() !== myUsername);
    return [...mine, ...rest];
  }, [members, myUsername]);

  return (
    <section id="talent" className="scroll-mt-24 border-t border-outline-variant bg-surface-container-lowest px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">Talent Directory</p>
            <h2 className="font-headline text-3xl font-bold text-on-surface sm:text-4xl">Hire from a verified shortlist</h2>
            <p className="mt-3 text-on-surface-variant">
              This is a trust-first directory, not an open gig marketplace. Contact via{" "}
              <a href={CONTACT.telegram} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                {CONTACT.telegramHandle}
              </a>{" "}
              and {CONTACT.guarantor} coordinates fit, introductions, and next steps.
            </p>
          </div>
          {session ? (
            <button type="button" onClick={openProfileEditor} className="btn-primary min-h-10 shrink-0 px-4 text-sm">
              Complete your profile
            </button>
          ) : null}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                category === cat
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-surface-container-high" />
            ))}
          </div>
        ) : error ? (
          <p className="py-12 text-center text-critical">{error}</p>
        ) : sorted.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-on-surface-variant">No members in this category yet.</p>
            {session ? (
              <button type="button" onClick={openProfileEditor} className="btn-primary mt-4 min-h-10">
                Be the first — set up your profile
              </button>
            ) : (
              <Link href="/login?next=/" className="btn-primary mt-4 inline-flex min-h-10">
                Sign in to join the directory
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((person) => (
              <TalentCard
                key={person.id}
                person={person}
                isOwn={myUsername === person.username.toLowerCase()}
                onEdit={openProfileEditor}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
