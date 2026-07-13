"use client";

import { useMemo, useState } from "react";
import { PortfolioProjectCard } from "@/components/portfolio/PortfolioProjectCard";
import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";
import { isFeaturedProject } from "@/lib/portfolio/related";
import type { PortfolioProject, ProjectStatus } from "@/types/portfolio";

type FilterKey = "all" | ProjectStatus;

const STATUS_FILTERS: readonly { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "archived", label: "Archived" },
] as const;

const NICHE_FILTERS = [
  { key: "all", label: "All niches" },
  { key: "saas-startups", label: "SaaS" },
  { key: "gaming-server-owners", label: "Gaming" },
  { key: "web3-crypto-projects", label: "Web3" },
  { key: "forum-sellers", label: "Forums" },
  { key: "ecommerce-brands", label: "E-commerce" },
  { key: "mobile-app-founders", label: "Mobile" },
  { key: "automation-ops-teams", label: "Automation" },
] as const;

export function PortfolioFilterGrid(): React.JSX.Element {
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PORTFOLIO_PROJECTS.filter((p) => {
      const statusOk = statusFilter === "all" || p.status === statusFilter;
      const nicheOk =
        nicheFilter === "all" ||
        p.nicheTags?.includes(nicheFilter) ||
        p.tags.some((t) => t.toLowerCase().includes(nicheFilter.replace(/-/g, " ").slice(0, 4)));
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return statusOk && nicheOk && qOk;
    });
  }, [statusFilter, nicheFilter, query]);

  const featured = PORTFOLIO_PROJECTS.filter((p) => isFeaturedProject(p.slug) || p.featured);
  const live = filtered.filter((p) => p.status === "live");
  const upcoming = filtered.filter((p) => p.status === "upcoming");
  const archived = filtered.filter((p) => p.status === "archived");
  const showSections = statusFilter === "all" && !query && nicheFilter === "all";

  return (
    <div>
      <div className="content-wrap space-y-4 pb-8">
        <label className="sr-only" htmlFor="portfolio-search">
          Search portfolio
        </label>
        <input
          id="portfolio-search"
          type="search"
          placeholder="Search by client, niche, or stack…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-lg border border-b1/60 bg-s2 px-4 py-2.5 text-sm text-text placeholder:text-muted"
        />
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter portfolio by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={statusFilter === f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`border px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === f.key
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-b1/60 text-muted hover:border-accent/60 hover:text-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter portfolio by niche">
          {NICHE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={nicheFilter === f.key}
              onClick={() => setNicheFilter(f.key)}
              className={`border px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                nicheFilter === f.key
                  ? "border-accent/60 bg-accent/15 text-accent"
                  : "border-b1/60 text-muted hover:border-accent/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {showSections && featured.length > 0 ? (
        <PortfolioSection
          title="Featured work"
          subtitle="Top case studies — full scope, stack, and outcomes."
          projects={featured}
          showFeaturedBadge
        />
      ) : null}

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
            subtitle="Delivered work clients later discontinued — still proof of range."
          />
        </>
      ) : (
        <section className="pb-16">
          <div className="content-wrap">
            <p className="mb-6 font-mono text-[10px] text-muted">
              {filtered.length} project{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <PortfolioProjectCard
                  key={project.slug}
                  project={project}
                  featured={isFeaturedProject(project.slug) || project.featured}
                />
              ))}
            </div>
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
  showFeaturedBadge?: boolean;
};

function PortfolioSection({
  title,
  subtitle,
  projects,
  showFeaturedBadge,
}: PortfolioSectionProps): React.JSX.Element {
  if (projects.length === 0) return <></>;

  return (
    <section className="border-t border-b1 py-12 first:border-t-0 first:pt-0">
      <div className="content-wrap">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-text-secondary">{subtitle}</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <PortfolioProjectCard
              key={project.slug}
              project={project}
              featured={showFeaturedBadge || isFeaturedProject(project.slug) || project.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
