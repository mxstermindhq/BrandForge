"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { contactMessage } from "@/content/landing-directory";
import { OPERATOR_MEDIA, type WorkStage } from "@/content/operator-media";

type TalentDirectoryProps = {
  operators: CuratedOperator[];
};
type DirectoryView = "profiles" | "services" | "work";
type UnifiedFilter =
  | "all"
  | "available"
  | "limited"
  | "popular"
  | "urgent"
  | "done"
  | "doing"
  | "planned";

const viewOptions: DirectoryView[] = ["profiles", "services", "work"];

const PROFILE_FALLBACK_IMAGE = "/images/prince/portrait.png";
const SERVICE_FALLBACK_IMAGE = "/images/prince/service-design.png";
const WORK_FALLBACK_IMAGE = "/images/prince/work-motion.png";

function availabilityBadge(value: CuratedOperator["availability"]) {
  if (value === "available-now") return { label: "Available now", tone: "var(--color-emerald-text)" };
  if (value === "available") return { label: "Available", tone: "var(--color-emerald-text)" };
  if (value === "limited") return { label: "Limited slots", tone: "var(--color-warning)" };
  return { label: "Unavailable", tone: "var(--color-danger)" };
}

export function TalentDirectory({ operators }: TalentDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const [view, setView] = useState<DirectoryView>("profiles");
  const [filter, setFilter] = useState<UnifiedFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const queryView = (searchParams.get("view") || "profiles") as DirectoryView;
    const queryFilter = (searchParams.get("filter") || "all") as UnifiedFilter;
    const queryText = String(searchParams.get("q") || "");
    setView(["profiles", "services", "work"].includes(queryView) ? queryView : "profiles");
    setFilter(
      ["all", "available", "limited", "popular", "urgent", "done", "doing", "planned"].includes(queryFilter)
        ? queryFilter
        : "all",
    );
    setQuery(queryText);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    params.set("filter", filter);
    params.set("q", query);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filter, pathname, query, router, searchParams, view]);

  const profileRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return operators.filter((op) => {
      const availabilityOk =
        filter === "all"
          ? true
          : filter === "available"
            ? op.availability === "available" || op.availability === "available-now"
            : filter === "limited"
              ? op.availability === "limited"
              : true;
      const queryBlob = `${op.name} ${op.role} ${op.bio} ${op.skills.join(" ")}`.toLowerCase();
      const queryOk = !q || queryBlob.includes(q);
      return availabilityOk && queryOk;
    });
  }, [filter, operators, query]);

  const serviceRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = operators.flatMap((op) => {
      const media = OPERATOR_MEDIA[op.username.toLowerCase()];
      if (!media) return [];
      return media.services.map((service) => ({ operator: op, service }));
    });
    return rows.filter(({ service, operator }) => {
      const blob = `${service.name} ${service.tagline} ${operator.name} ${service.bullets.join(" ")}`.toLowerCase();
      return !q || blob.includes(q);
    });
  }, [operators, query]);

  const workRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = operators.flatMap((op) => {
      const media = OPERATOR_MEDIA[op.username.toLowerCase()];
      if (!media) return [];
      return media.workPieces.map((piece) => ({ operator: op, piece }));
    });
    return rows.filter(({ piece, operator }) => {
      const stageOk = filter === "all" ? true : piece.stage === (filter as WorkStage);
      const blob = `${piece.title} ${piece.description} ${operator.name}`.toLowerCase();
      const queryOk = !q || blob.includes(q);
      return stageOk && queryOk;
    });
  }, [filter, operators, query]);

  const availableFilters: Array<{ id: UnifiedFilter; label: string }> =
    view === "profiles"
      ? [
          { id: "all", label: "All" },
          { id: "available", label: "Available" },
          { id: "limited", label: "Limited" },
        ]
      : view === "services"
        ? [
            { id: "all", label: "All" },
            { id: "popular", label: "Popular" },
          ]
        : [
            { id: "all", label: "All" },
            { id: "done", label: "Done" },
            { id: "doing", label: "Doing" },
            { id: "planned", label: "Planned" },
          ];

  return (
    <section
      id="talent"
      className="scroll-mt-24 border-t px-4 py-16 sm:px-6 lg:px-8"
      style={{ borderColor: "var(--color-gold-border)", background: "var(--color-bg)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-2 lg:sticky lg:top-24 lg:self-start">
            {viewOptions.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium capitalize transition-colors"
                style={{
                  borderColor: view === mode ? "var(--color-gold-border)" : "var(--color-border)",
                  background: view === mode ? "var(--color-gold-subtle)" : "var(--color-surface)",
                  color: view === mode ? "var(--color-gold)" : "var(--color-text-secondary)",
                }}
              >
                {mode}
                <span>→</span>
              </button>
            ))}
          </aside>

          <div>
            <div
              className="mb-4 rounded-xl border p-3"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search profiles, services, and work…"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>

            <div
              className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border p-3"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <span className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                Filter
              </span>
              {availableFilters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{
                    borderColor: filter === item.id ? "var(--color-gold-border)" : "var(--color-border)",
                    background: filter === item.id ? "var(--color-gold-subtle)" : "transparent",
                    color: filter === item.id ? "var(--color-gold)" : "var(--color-text-secondary)",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {view === "profiles" ? (
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                className="space-y-5"
              >
                {profileRows.map((op) => {
                  const media = OPERATOR_MEDIA[op.username.toLowerCase()];
                  const badge = availabilityBadge(op.availability);
                  const portrait = media?.portrait ?? PROFILE_FALLBACK_IMAGE;
                  return (
                    <Link
                      key={op.username}
                      href={`/${encodeURIComponent(op.username)}`}
                      className="group block overflow-hidden rounded-3xl border bg-[var(--color-surface)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-md"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <article className="flex flex-col md:flex-row">
                        <div className="relative h-64 w-full overflow-hidden md:h-auto md:w-80">
                          <Image
                            src={portrait}
                            alt={`${op.name} portrait`}
                            fill
                            sizes="(max-width: 768px) 100vw, 320px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                          />
                          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                            <span
                              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur"
                              style={{
                                background: "color-mix(in srgb, white 80%, transparent)",
                                color: "var(--color-gold)",
                              }}
                            >
                              Featured
                            </span>
                            <span
                              className="rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur"
                              style={{
                                background: "color-mix(in srgb, white 80%, transparent)",
                                color: badge.tone,
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-headline text-2xl font-semibold text-[var(--color-text-primary)]">
                                  {op.name}
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">{op.role}</p>
                              </div>
                              <span className="text-xs font-semibold text-[var(--color-gold)]">
                                ★ {op.amanahScore}/100
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                              {op.bio}
                            </p>
                            {media ? (
                              <p className="mt-3 text-xs italic text-[var(--color-text-muted)]">
                                {media.accentTagline}
                              </p>
                            ) : null}
                            <div className="mt-4 flex flex-wrap gap-2">
                              {op.skills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border px-2 py-0.5 text-[10px]"
                                  style={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text-secondary)",
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                              {op.startingPrice}{" "}
                              <span className="text-xs font-normal text-[var(--color-text-secondary)]">
                                · {op.pricingModel}
                              </span>
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={contactMessage(`Interest in profile: ${op.name} (@${op.username})`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-md border px-3 py-1.5 text-xs font-medium"
                                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                              >
                                Show interest
                              </a>
                              <span className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white" style={{ background: "var(--color-gold)" }}>
                                Open profile →
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}

                {profileRows.length === 0 ? (
                  <div
                    className="rounded-xl border px-4 py-6 text-sm text-[var(--color-text-secondary)]"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    No profiles match your search yet — the directory is invite-only and growing.
                  </div>
                ) : null}
              </motion.div>
            ) : null}

            {view === "services" ? (
              <div className="space-y-5">
                {serviceRows.map(({ operator: op, service }) => (
                  <Link
                    key={`${op.username}-${service.id}`}
                    href={`/offer/${encodeURIComponent(service.id)}`}
                    className="group block overflow-hidden rounded-3xl border bg-[var(--color-surface)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-md"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <article className="flex flex-col md:flex-row">
                      <div className="relative h-56 w-full overflow-hidden md:h-auto md:w-80">
                        <Image
                          src={service.image || SERVICE_FALLBACK_IMAGE}
                          alt={service.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur"
                          style={{ background: "color-mix(in srgb, white 82%, transparent)", color: "var(--color-gold)" }}
                        >
                          Service
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                        <div>
                          <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                            by {op.name}
                          </p>
                          <h3 className="mt-1 font-headline text-2xl font-semibold text-[var(--color-text-primary)]">
                            {service.name}
                          </h3>
                          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{service.tagline}</p>
                          <ul className="mt-3 grid gap-1 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
                            {service.bullets.slice(0, 4).map((bullet) => (
                              <li key={bullet} className="flex items-center gap-2">
                                <span className="text-[var(--color-gold)]">✓</span>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                          <span className="text-base font-semibold text-[var(--color-text-primary)]">
                            {service.price}
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={contactMessage(`Interest in service: ${service.name} (${op.name})`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-md border px-3 py-1.5 text-xs font-medium"
                              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                            >
                              Show interest
                            </a>
                            <span className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white" style={{ background: "var(--color-gold)" }}>
                              Open service →
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}

                {serviceRows.length === 0 ? (
                  <div
                    className="rounded-xl border px-4 py-6 text-sm text-[var(--color-text-secondary)]"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    No services match your search yet.
                  </div>
                ) : null}
              </div>
            ) : null}

            {view === "work" ? (
              <div className="space-y-5">
                {workRows.map(({ operator: op, piece }) => (
                  <Link
                    key={`work-${op.username}-${piece.id}`}
                    href={`/work/${encodeURIComponent(op.username)}#${piece.id}`}
                    className="group block overflow-hidden rounded-3xl border bg-[var(--color-surface)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-md"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <article className="flex flex-col md:flex-row">
                      <div className="relative h-64 w-full overflow-hidden md:h-auto md:w-[420px]">
                        <Image
                          src={piece.image || WORK_FALLBACK_IMAGE}
                          alt={piece.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 420px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur"
                          style={{ background: "color-mix(in srgb, white 82%, transparent)", color: "var(--color-gold)" }}
                        >
                          {piece.stage}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                        <div>
                          <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                            by {op.name}
                          </p>
                          <h3 className="mt-1 font-headline text-2xl font-semibold text-[var(--color-text-primary)]">
                            {piece.title}
                          </h3>
                          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{piece.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                            Portfolio piece
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={contactMessage(`Interest in work: ${piece.title} (${op.name})`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-md border px-3 py-1.5 text-xs font-medium"
                              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                            >
                              Show interest
                            </a>
                            <span className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white" style={{ background: "var(--color-gold)" }}>
                              Open work →
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}

                {workRows.length === 0 ? (
                  <div
                    className="rounded-xl border px-4 py-6 text-sm text-[var(--color-text-secondary)]"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    No portfolio pieces match your filters yet.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
