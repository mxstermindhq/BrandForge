"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { CONTACT } from "@/content/landing-directory";
import { OperatorCard } from "./OperatorCard";
import { TalentFilterBar } from "./TalentFilterBar";
import { useTalentFilters, type AvailabilityFilter, type CategoryFilter, type SortFilter } from "./useTalentFilters";

type TalentDirectoryProps = {
  operators: CuratedOperator[];
};

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
  const { category, availability, sort, setCategory, setAvailability, setSort, hydrate } = useTalentFilters();

  useEffect(() => {
    const queryCategory = (searchParams.get("category") || "all") as CategoryFilter;
    const queryAvailability = (searchParams.get("availability") || "all") as AvailabilityFilter;
    const querySort = (searchParams.get("sort") || "default") as SortFilter;
    hydrate({ category: queryCategory, availability: queryAvailability, sort: querySort });
  }, [hydrate, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category);
    params.set("availability", availability);
    params.set("sort", sort);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [availability, category, pathname, router, searchParams, sort]);

  const filtered = useMemo(() => {
    let rows = [...operators];
    if (category !== "all") rows = rows.filter((op) => classifyCategory(op) === category);
    if (availability !== "all") rows = rows.filter((op) => toAvailabilityFilter(op.availability) === availability);
    if (sort === "amanah") rows.sort((a, b) => b.amanahScore - a.amanahScore);
    if (sort === "years") rows.sort((a, b) => b.yearsExp - a.yearsExp);
    if (sort === "default") rows.sort((a, b) => a.displayOrder - b.displayOrder);
    return rows;
  }, [availability, category, operators, sort]);

  return (
    <section id="talent" className="scroll-mt-24 border-t px-4 py-16 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-gold)]">Talent Directory Preview</p>
          <h2 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">Meet the operators.</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            {operators.length} verified builders. Real rates. Real track records. {CONTACT.guarantor} has worked with every one of them personally.
          </p>
        </div>

        <TalentFilterBar
          category={category}
          availability={availability}
          sort={sort}
          onCategoryChange={setCategory}
          onAvailabilityChange={setAvailability}
          onSortChange={setSort}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${availability}-${sort}`}
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
            No operators match your current filters. Try <button className="underline text-[var(--color-gold)]" onClick={() => hydrate({ category: "all", availability: "all", sort: "default" })}>resetting filters</button>.
          </div>
        ) : null}
      </div>
    </section>
  );
}
