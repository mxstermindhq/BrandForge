"use client";

import { useMemo, useState } from "react";
import { PortfolioProjectCard } from "@/components/portfolio/PortfolioProjectCard";
import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";
import type { PortfolioProject, ProjectStatus } from "@/types/portfolio";

type FilterKey = "all" | ProjectStatus;

const FILTERS: readonly { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "archived", label: "Archived" },
] as const;

export function PortfolioFilterGrid(): React.JSX.Element {
  const [filter, setFilter] = useState<FilterKey>("all");

  const grouped = useMemo(() => {
    const list =
      filter === "all" ? PORTFOLIO_PROJECTS : PORTFOLIO_PROJECTS.filter((p) => p.status === filter);
    return list;
  }, [filter]);

  const live = PORTFOLIO_PROJECTS.filter((p) => p.status === "live");
  const upcoming = PORTFOLIO_PROJECTS.filter((p) => p.status === "upcoming");
  const archived = PORTFOLIO_PROJECTS.filter((p) => p.status === "archived");

  const showSections = filter === "all";

  return (
    <div>
      <div
        className="content-wrap flex flex-wrap gap-2 pb-8"
        role="tablist"
        aria-label="Filter portfolio by status"
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              filter === f.key
                ? "border-accent bg-accent text-white"
                : "border-b2 text-muted hover:border-accent hover:text-text"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showSections ? (
        <>
          <PortfolioSection title="Live Projects" projects={live} />
          <PortfolioSection
            title="In Development"
            projects={upcoming}
            subtitle="Active builds and confidential engagements in progress."
          />
          <PortfolioSection
            title="Archived Projects"
            projects={archived}
            subtitle="Projects we delivered that clients later discontinued — still proof of range."
          />
        </>
      ) : (
        <section className="pb-16">
          <div className="content-wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((project) => (
              <PortfolioProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type PortfolioSectionProps = {
  title: string;
  subtitle?: string;
  projects: readonly PortfolioProject[];
};

function PortfolioSection({ title, subtitle, projects }: PortfolioSectionProps): React.JSX.Element {
  if (projects.length === 0) return <></>;

  return (
    <section className="border-t border-b1 py-12 first:border-t-0 first:pt-0">
      <div className="content-wrap">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-text-secondary">{subtitle}</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <PortfolioProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
