import Link from "next/link";
import { ProjectMockup, ProjectStatusBadge, TechChip } from "@/components/visual";
import { resolveProjectScreenshot } from "@/lib/portfolio/screenshot-url";
import type { PortfolioProject } from "@/types/portfolio";

type PortfolioProjectCardProps = {
  project: PortfolioProject;
  featured?: boolean;
};

export function PortfolioProjectCard({
  project,
  featured = false,
}: PortfolioProjectCardProps): React.JSX.Element {
  const isArchived = project.status === "archived";
  const isUpcoming = project.status === "upcoming";
  const caseHref = `/portfolio/${project.slug}/`;
  const screenshotUrl = resolveProjectScreenshot(project);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden border border-b1/50 bg-s1/30 transition-all hover:border-b1 hover:bg-s1/50 ${
        isArchived ? "opacity-70 grayscale hover:opacity-100 hover:grayscale-0" : ""
      }`}
    >
      {isUpcoming ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-bg/20"
          aria-hidden
        />
      ) : null}
      <div className="absolute right-3 top-3 z-[2] flex flex-col items-end gap-1">
        {featured ? (
          <span className="border border-accent/60 bg-accent/15 px-2 py-0.5 font-mono text-[8px] font-bold uppercase text-accent">
            Featured
          </span>
        ) : null}
        <ProjectStatusBadge status={project.status} />
      </div>
      <ProjectMockup
        type={project.mockupType}
        projectName={project.name}
        screenshotUrl={screenshotUrl}
        gradientFrom={project.brandGradient[0]}
        gradientTo={project.brandGradient[1]}
        className={isUpcoming ? "opacity-90" : ""}
      />
      <div className="relative flex flex-1 flex-col px-4 sm:px-5 py-4">
        <div
          className="absolute top-0 left-0 w-8 h-8"
          style={{ background: `linear-gradient(135deg, ${project.brandGradient[0]}80, ${project.brandGradient[1]}20)` }}
        />
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{project.category}</p>
        <h3 className="mt-2 text-[17px] font-bold group-hover:text-accent">{project.name}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-t2">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="border border-b1/60 px-2 py-0.5 font-mono text-[8px] text-t2">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-[10px]">
          <Link href={caseHref} className="text-accent hover:text-text">
            View case study →
          </Link>
          {project.url && project.status === "live" ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-muted hover:text-text"
            >
              Live site ↗
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
