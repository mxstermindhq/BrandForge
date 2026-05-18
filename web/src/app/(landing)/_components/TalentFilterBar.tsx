"use client";

import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  type AvailabilityFilter,
  type CategoryFilter,
  type SortFilter,
  AVAILABILITY_FILTERS,
  CATEGORY_FILTERS,
  SORT_FILTERS,
} from "./useTalentFilters";

const labels = {
  category: {
    all: "All",
    "ai-automation": "AI & Automation",
    "web-apps": "Web & Apps",
    design: "Design",
    growth: "Growth",
    data: "Data",
    web3: "Web3",
  } as Record<CategoryFilter, string>,
  availability: {
    all: "All",
    "available-now": "Available now",
    available: "Available",
    limited: "Limited",
  } as Record<AvailabilityFilter, string>,
  sort: {
    default: "Default",
    amanah: "Reviews",
    years: "Years exp",
  } as Record<SortFilter, string>,
};

type TalentFilterBarProps = {
  category: CategoryFilter;
  availability: AvailabilityFilter;
  sort: SortFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  onAvailabilityChange: (value: AvailabilityFilter) => void;
  onSortChange: (value: SortFilter) => void;
};

function PillGroup<T extends string>({
  title,
  values,
  value,
  onChange,
  mapLabel,
}: {
  title: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
  mapLabel: Record<T, string>;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <LayoutGroup>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={title}>
        <span className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">{title}</span>
        {values.map((item) => {
          const active = value === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className="relative rounded-full px-3 py-1 text-xs transition-colors duration-[var(--duration-fast)]"
              style={{
                color: active ? "var(--color-gold)" : "var(--color-text-secondary)",
                border: active ? "1px solid var(--color-gold-border)" : "1px solid transparent",
                background: active ? "var(--color-gold-subtle)" : "transparent",
              }}
            >
              {!prefersReducedMotion && active ? (
                <motion.span
                  layoutId={`${title}-active`}
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{ background: "var(--color-gold-subtle)" }}
                  transition={{ duration: 0.2 }}
                />
              ) : null}
              {mapLabel[item]}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function TalentFilterBar({
  category,
  availability,
  sort,
  onCategoryChange,
  onAvailabilityChange,
  onSortChange,
}: TalentFilterBarProps) {
  return (
    <div className="mb-6 space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <PillGroup title="Category" values={CATEGORY_FILTERS} value={category} onChange={onCategoryChange} mapLabel={labels.category} />
      <PillGroup
        title="Availability"
        values={AVAILABILITY_FILTERS}
        value={availability}
        onChange={onAvailabilityChange}
        mapLabel={labels.availability}
      />
      <PillGroup title="Sort" values={SORT_FILTERS} value={sort} onChange={onSortChange} mapLabel={labels.sort} />
    </div>
  );
}
