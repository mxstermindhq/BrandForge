"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { CONTACT, PACKAGES } from "@/content/landing-directory";
import { apiGetJson } from "@/lib/api";
import type { TalentDirectoryResponse } from "@/lib/talent-types";
import { mapTalentMemberToOperator } from "@/lib/operator-mappers";
import { OperatorCard } from "./OperatorCard";
import { TalentFilterBar } from "./TalentFilterBar";
import { useTalentFilters, type AvailabilityFilter, type CategoryFilter, type SortFilter } from "./useTalentFilters";
import { useLandingUI } from "./LandingUIProvider";

type TalentDirectoryProps = {
  operators: CuratedOperator[];
};
type DirectoryView = "profiles" | "services" | "work";

const categoryLabels: Record<CategoryFilter, string> = {
  all: "All",
  "ai-automation": "AI & Automation",
  "web-apps": "Web & Apps",
  design: "Design",
  growth: "Growth",
  data: "Data",
  web3: "Web3",
};

function classifyCategory(operator: CuratedOperator): CategoryFilter {
  const blob = `${operator.role} ${operator.skills.join(" ")}`.toLowerCase();
  if (blob.includes("web3") || blob.includes("blockchain")) return "web3";
  if (blob.includes("data") || blob.includes("analytics") || blob.includes("ml")) return "data";
  if (blob.includes("design") || blob.includes("motion") || blob.includes("brand")) return "design";
  if (blob.includes("growth") || blob.includes("marketing") || blob.includes("campaign")) return "growth";
  if (blob.includes("automation") || blob.includes("ai") || blob.includes("n8n")) return "ai-automation";
  return "web-apps";
}

function spanClass(layoutSpan: CuratedOperator["layoutSpan"]) {
  if (layoutSpan === "featured") return "lg:col-span-6";
  if (layoutSpan === "compact") return "lg:col-span-3";
  return "lg:col-span-4";
}

function toAvailabilityFilter(value: CuratedOperator["availability"]): AvailabilityFilter {
  if (value === "available-now") return "available-now";
  if (value === "limited") return "limited";
  if (value === "available") return "available";
  return "all";
}

export function TalentDirectory({ operators }: TalentDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const { openProfileEditor, directoryVersion } = useLandingUI();
  const { category, availability, sort, setCategory, setAvailability, setSort, hydrate } = useTalentFilters();
  const [view, setView] = useState<DirectoryView>("profiles");
  const [liveOperators, setLiveOperators] = useState<CuratedOperator[]>(operators);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshFromRegisteredProfiles = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await apiGetJson<TalentDirectoryResponse>("/api/talent", null);
      const mapped = (data.members || []).map((member, index) => mapTalentMemberToOperator(member, index));
      if (mapped.length > 0) setLiveOperators(mapped);
    } catch {
      // Keep server-rendered operators as fallback.
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLiveOperators(operators);
  }, [operators]);

  useEffect(() => {
    void refreshFromRegisteredProfiles();
  }, [refreshFromRegisteredProfiles, directoryVersion]);

  useEffect(() => {
    const queryCategory = (searchParams.get("category") || "all") as CategoryFilter;
    const queryAvailability = (searchParams.get("availability") || "all") as AvailabilityFilter;
    const querySort = (searchParams.get("sort") || "default") as SortFilter;
    const queryView = (searchParams.get("view") || "profiles") as DirectoryView;
    hydrate({ category: queryCategory, availability: queryAvailability, sort: querySort });
    setView(["profiles", "services", "work"].includes(queryView) ? queryView : "profiles");
  }, [hydrate, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category);
    params.set("availability", availability);
    params.set("sort", sort);
    params.set("view", view);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [availability, category, pathname, router, searchParams, sort, view]);

  const filtered = useMemo(() => {
    let rows = [...liveOperators];
    if (category !== "all") rows = rows.filter((op) => classifyCategory(op) === category);
    if (availability !== "all") rows = rows.filter((op) => toAvailabilityFilter(op.availability) === availability);
    if (sort === "amanah") rows.sort((a, b) => b.amanahScore - a.amanahScore);
    if (sort === "years") rows.sort((a, b) => b.yearsExp - a.yearsExp);
    if (sort === "default") rows.sort((a, b) => a.displayOrder - b.displayOrder);
    return rows;
  }, [availability, category, liveOperators, sort]);

  return (
    <section id="talent" className="scroll-mt-24 border-t px-4 py-16 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-gold)]">Talent Directory Preview</p>
          <h2 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">Meet the operators.</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            {liveOperators.length} registered operators. Real rates. Real track records. {CONTACT.guarantor} coordinates fit, intros, and next steps.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}>
            <span className="text-[var(--color-text-secondary)]">
              Registered user? Complete your profile to be listed in the directory.
            </span>
            <button type="button" onClick={openProfileEditor} className="rounded-md border px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-gold-subtle)] hover:text-[var(--color-gold)]" style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}>
              Complete profile
            </button>
            {isRefreshing ? <span className="text-xs text-[var(--color-text-muted)]">Syncing…</span> : null}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {(["profiles", "services", "work"] as DirectoryView[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition-colors"
              style={{
                borderColor: view === mode ? "var(--color-gold-border)" : "var(--color-border)",
                background: view === mode ? "var(--color-gold-subtle)" : "var(--color-surface)",
                color: view === mode ? "var(--color-gold)" : "var(--color-text-secondary)",
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {view === "profiles" ? (
          <TalentFilterBar
            category={category}
            availability={availability}
            sort={sort}
            onCategoryChange={setCategory}
            onAvailabilityChange={setAvailability}
            onSortChange={setSort}
          />
        ) : null}

        {view === "profiles" ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${view}-${category}-${availability}-${sort}`}
                layout
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-12"
              >
                {filtered.map((operator, index) => (
                  <div key={operator.username} className={spanClass(operator.layoutSpan)}>
                    <OperatorCard operator={operator} index={index} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 ? (
              <div className="mt-6 rounded-xl border px-4 py-5 text-sm text-[var(--color-text-secondary)]" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                No operators match your current filters. Try <button className="underline text-[var(--color-gold)]" onClick={() => hydrate({ category: "all", availability: "all", sort: "default" })}>resetting filters</button>, or <button className="underline text-[var(--color-gold)]" onClick={openProfileEditor}>complete your profile</button> to get listed.
              </div>
            ) : null}
          </>
        ) : null}

        {view === "services" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {PACKAGES.map((pkg) => (
              <article
                key={pkg.id}
                className="rounded-xl border p-4"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{pkg.target}</p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">{pkg.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{pkg.tagline}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{pkg.price}</p>
              </article>
            ))}
          </div>
        ) : null}

        {view === "work" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveOperators.slice(0, 9).map((op, index) => {
              const lane = index % 3 === 0 ? "Done" : index % 3 === 1 ? "Doing" : "Planned";
              return (
                <article
                  key={`work-${op.username}`}
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                >
                  <div
                    className="h-44 w-full"
                    style={{
                      background:
                        "linear-gradient(145deg, color-mix(in srgb, var(--color-gold) 14%, white), color-mix(in srgb, var(--color-gold) 4%, white))",
                    }}
                  />
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{lane}</p>
                    <h3 className="mt-1 text-base font-semibold text-[var(--color-text-primary)]">{op.name}</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{op.bestResult}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
