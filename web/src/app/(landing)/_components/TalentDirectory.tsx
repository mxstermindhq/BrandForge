"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { CONTACT, PACKAGES, contactMessage } from "@/content/landing-directory";
import { apiGetJson } from "@/lib/api";
import type { TalentDirectoryResponse } from "@/lib/talent-types";
import { mapTalentMemberToOperator } from "@/lib/operator-mappers";
import { useLandingUI } from "./LandingUIProvider";

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

function parsePackagePrice(price: string): number {
  const n = Number(String(price).replace(/[^\d.]/g, "").split(".")[0]);
  return Number.isFinite(n) ? n : 0;
}

function workStageFromIndex(index: number): Exclude<UnifiedFilter, "all" | "available" | "limited" | "popular" | "urgent"> {
  if (index % 3 === 0) return "done";
  if (index % 3 === 1) return "doing";
  return "planned";
}

export function TalentDirectory({ operators }: TalentDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const { directoryVersion } = useLandingUI();
  const [view, setView] = useState<DirectoryView>("profiles");
  const [filter, setFilter] = useState<UnifiedFilter>("all");
  const [query, setQuery] = useState("");
  const [liveOperators, setLiveOperators] = useState<CuratedOperator[]>(operators);

  const refreshFromRegisteredProfiles = useCallback(async () => {
    try {
      const data = await apiGetJson<TalentDirectoryResponse>("/api/talent", null);
      const mapped = (data.members || []).map((member, index) => mapTalentMemberToOperator(member, index));
      if (mapped.length > 0) setLiveOperators(mapped);
    } catch {
      // Keep server-rendered operators as fallback.
    }
  }, []);

  useEffect(() => {
    setLiveOperators(operators);
  }, [operators]);

  useEffect(() => {
    void refreshFromRegisteredProfiles();
  }, [refreshFromRegisteredProfiles, directoryVersion]);

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
    return liveOperators.filter((op) => {
      const availabilityOk =
        filter === "all" ? true : filter === "available" ? op.availability === "available" || op.availability === "available-now" : filter === "limited" ? op.availability === "limited" : true;
      const queryBlob = `${op.name} ${op.role} ${op.bio} ${op.skills.join(" ")}`.toLowerCase();
      const queryOk = !q || queryBlob.includes(q);
      return availabilityOk && queryOk;
    });
  }, [filter, liveOperators, query]);

  const serviceRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = [...PACKAGES];
    if (filter === "popular") rows = rows.filter((p) => p.popular);
    if (filter === "urgent") rows = rows.filter((p) => p.urgent);
    if (q) {
      rows = rows.filter((p) =>
        `${p.name} ${p.tagline} ${p.target} ${p.includes.join(" ")}`.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => parsePackagePrice(a.price) - parsePackagePrice(b.price));
    return rows;
  }, [filter, query]);

  const workRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const mapped = liveOperators.slice(0, 18).map((op, index) => ({
      operator: op,
      stage: workStageFromIndex(index),
    }));
    return mapped.filter((item) => {
      const stageOk = filter === "all" ? true : item.stage === filter;
      const queryOk = !q || `${item.operator.name} ${item.operator.role} ${item.operator.bestResult}`.toLowerCase().includes(q);
      return stageOk && queryOk;
    });
  }, [filter, liveOperators, query]);

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
            { id: "urgent", label: "Urgent" },
          ]
        : [
            { id: "all", label: "All" },
            { id: "done", label: "Done" },
            { id: "doing", label: "Doing" },
            { id: "planned", label: "Planned" },
          ];

  return (
    <section id="talent" className="scroll-mt-24 border-t px-4 py-16 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-2">
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
            <div className="mb-4 rounded-xl border p-3" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search profiles, services, and work…"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)", color: "var(--color-text-primary)" }}
              />
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border p-3" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
              <span className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Filter</span>
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
                className="space-y-4"
              >
                {profileRows.map((op, index) => (
                  <Link
                    key={op.username}
                    href={`/${encodeURIComponent(op.username)}`}
                    className="group block overflow-hidden rounded-2xl border transition-all hover:border-[var(--color-border-hover)]"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <article className="flex flex-col md:flex-row">
                      <div
                        className="h-44 md:h-auto md:w-72"
                        style={{
                          background:
                            "linear-gradient(145deg, color-mix(in srgb, var(--color-gold) 16%, white), color-mix(in srgb, var(--color-gold) 6%, white))",
                        }}
                      />
                      <div className="flex-1 p-5">
                        <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">Profile #{index + 1}</p>
                        <h3 className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">{op.name}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">{op.role}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{op.bio}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {op.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                          <a
                            href={contactMessage(`Interest in profile: ${op.name} (@${op.username})`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border px-3 py-1.5"
                            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Show interest
                          </a>
                          <span className="text-[var(--color-text-muted)]">Open profile →</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </motion.div>
            ) : null}

            {view === "services" ? (
              <div className="space-y-4">
                {serviceRows.map((pkg) => (
                  <Link
                    key={pkg.id}
                    href={`/offer/${encodeURIComponent(pkg.id)}`}
                    className="group block overflow-hidden rounded-2xl border transition-all hover:border-[var(--color-border-hover)]"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <article className="flex flex-col md:flex-row">
                      <div
                        className="h-44 md:h-auto md:w-72"
                        style={{
                          background:
                            "linear-gradient(145deg, color-mix(in srgb, var(--color-gold) 16%, white), color-mix(in srgb, var(--color-gold) 6%, white))",
                        }}
                      />
                      <div className="flex-1 p-5">
                        <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{pkg.target}</p>
                        <h3 className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">{pkg.name}</h3>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{pkg.tagline}</p>
                        <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{pkg.price}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <a
                            href={contactMessage(`Interest in service: ${pkg.name}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border px-3 py-1.5"
                            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Show interest
                          </a>
                          <span className="text-[var(--color-text-muted)]">Open service →</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : null}

            {view === "work" ? (
              <div className="space-y-4">
                {workRows.map(({ operator: op, stage }) => (
                  <Link
                    key={`work-${op.username}`}
                    href={`/work/${encodeURIComponent(op.username)}`}
                    className="group block overflow-hidden rounded-2xl border transition-all hover:border-[var(--color-border-hover)]"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <article className="flex flex-col md:flex-row">
                      <div
                        className="h-44 md:h-auto md:w-72"
                        style={{
                          background:
                            "linear-gradient(145deg, color-mix(in srgb, var(--color-gold) 16%, white), color-mix(in srgb, var(--color-gold) 6%, white))",
                        }}
                      />
                      <div className="flex-1 p-5">
                        <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{stage}</p>
                        <h3 className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">{op.name}</h3>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{op.bestResult}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <a
                          href={contactMessage(`Interest in work: ${op.name} (@${op.username})`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border px-3 py-1.5"
                          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Show interest
                        </a>
                          <span className="text-[var(--color-text-muted)]">Open work →</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
