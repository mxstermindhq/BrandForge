"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { CONTACT, PACKAGES, contactMessage } from "@/content/landing-directory";
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
type ServiceFilter = "all" | "popular" | "urgent";
type ServiceSort = "default" | "price-low" | "price-high";
type WorkStage = "all" | "done" | "doing" | "planned";

const viewOptions: DirectoryView[] = ["profiles", "services", "work"];

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

function parsePackagePrice(price: string): number {
  const n = Number(String(price).replace(/[^\d.]/g, "").split(".")[0]);
  return Number.isFinite(n) ? n : 0;
}

export function TalentDirectory({ operators }: TalentDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const { openProfileEditor, directoryVersion } = useLandingUI();
  const { category, availability, sort, setCategory, setAvailability, setSort, hydrate } = useTalentFilters();
  const [view, setView] = useState<DirectoryView>("profiles");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [serviceSort, setServiceSort] = useState<ServiceSort>("default");
  const [workStage, setWorkStage] = useState<WorkStage>("all");
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
    const queryServiceFilter = (searchParams.get("serviceFilter") || "all") as ServiceFilter;
    const queryServiceSort = (searchParams.get("serviceSort") || "default") as ServiceSort;
    const queryWorkStage = (searchParams.get("workStage") || "all") as WorkStage;
    hydrate({ category: queryCategory, availability: queryAvailability, sort: querySort });
    setView(["profiles", "services", "work"].includes(queryView) ? queryView : "profiles");
    setServiceFilter(["all", "popular", "urgent"].includes(queryServiceFilter) ? queryServiceFilter : "all");
    setServiceSort(["default", "price-low", "price-high"].includes(queryServiceSort) ? queryServiceSort : "default");
    setWorkStage(["all", "done", "doing", "planned"].includes(queryWorkStage) ? queryWorkStage : "all");
  }, [hydrate, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category);
    params.set("availability", availability);
    params.set("sort", sort);
    params.set("view", view);
    params.set("serviceFilter", serviceFilter);
    params.set("serviceSort", serviceSort);
    params.set("workStage", workStage);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [availability, category, pathname, router, searchParams, serviceFilter, serviceSort, sort, view, workStage]);

  const filtered = useMemo(() => {
    let rows = [...liveOperators];
    if (category !== "all") rows = rows.filter((op) => classifyCategory(op) === category);
    if (availability !== "all") rows = rows.filter((op) => toAvailabilityFilter(op.availability) === availability);
    if (sort === "amanah") rows.sort((a, b) => b.amanahScore - a.amanahScore);
    if (sort === "years") rows.sort((a, b) => b.yearsExp - a.yearsExp);
    if (sort === "default") rows.sort((a, b) => a.displayOrder - b.displayOrder);
    return rows;
  }, [availability, category, liveOperators, sort]);

  const serviceRows = useMemo(() => {
    let rows = [...PACKAGES];
    if (serviceFilter === "popular") rows = rows.filter((p) => p.popular);
    if (serviceFilter === "urgent") rows = rows.filter((p) => p.urgent);
    if (serviceSort === "price-low") rows.sort((a, b) => parsePackagePrice(a.price) - parsePackagePrice(b.price));
    if (serviceSort === "price-high") rows.sort((a, b) => parsePackagePrice(b.price) - parsePackagePrice(a.price));
    return rows;
  }, [serviceFilter, serviceSort]);

  const workRows = useMemo(() => {
    const mapped = liveOperators.slice(0, 18).map((op, index) => ({
      operator: op,
      stage: (index % 3 === 0 ? "done" : index % 3 === 1 ? "doing" : "planned") as Exclude<WorkStage, "all">,
    }));
    if (workStage === "all") return mapped;
    return mapped.filter((item) => item.stage === workStage);
  }, [liveOperators, workStage]);

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

            {view === "services" ? (
              <div className="mb-6 rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Type</span>
                  {(["all", "popular", "urgent"] as ServiceFilter[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setServiceFilter(f)}
                      className="rounded-full border px-3 py-1 text-xs capitalize"
                      style={{
                        borderColor: serviceFilter === f ? "var(--color-gold-border)" : "var(--color-border)",
                        background: serviceFilter === f ? "var(--color-gold-subtle)" : "transparent",
                        color: serviceFilter === f ? "var(--color-gold)" : "var(--color-text-secondary)",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                  <span className="ml-2 text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Sort</span>
                  {(["default", "price-low", "price-high"] as ServiceSort[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setServiceSort(s)}
                      className="rounded-full border px-3 py-1 text-xs"
                      style={{
                        borderColor: serviceSort === s ? "var(--color-gold-border)" : "var(--color-border)",
                        background: serviceSort === s ? "var(--color-gold-subtle)" : "transparent",
                        color: serviceSort === s ? "var(--color-gold)" : "var(--color-text-secondary)",
                      }}
                    >
                      {s === "price-low" ? "Price ↑" : s === "price-high" ? "Price ↓" : "Default"}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {view === "work" ? (
              <div className="mb-6 rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Stage</span>
                  {(["all", "done", "doing", "planned"] as WorkStage[]).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setWorkStage(stage)}
                      className="rounded-full border px-3 py-1 text-xs capitalize"
                      style={{
                        borderColor: workStage === stage ? "var(--color-gold-border)" : "var(--color-border)",
                        background: workStage === stage ? "var(--color-gold-subtle)" : "transparent",
                        color: workStage === stage ? "var(--color-gold)" : "var(--color-text-secondary)",
                      }}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
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
                {serviceRows.map((pkg) => (
                  <article
                    key={pkg.id}
                    className="rounded-xl border p-4"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{pkg.target}</p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{pkg.tagline}</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{pkg.price}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <a
                        href={contactMessage(`Interest in service: ${pkg.name}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                      >
                        Show interest
                      </a>
                      <Link
                        href={`/offer/${encodeURIComponent(pkg.id)}`}
                        className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                      >
                        View service
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {view === "work" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workRows.map(({ operator: op, stage }) => (
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
                      <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{stage}</p>
                      <h3 className="mt-1 text-base font-semibold text-[var(--color-text-primary)]">{op.name}</h3>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{op.bestResult}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <a
                          href={contactMessage(`Interest in work: ${op.name} (@${op.username})`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs"
                          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                        >
                          Show interest
                        </a>
                        <Link
                          href={`/work/${encodeURIComponent(op.username)}`}
                          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs"
                          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                        >
                          View work
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
