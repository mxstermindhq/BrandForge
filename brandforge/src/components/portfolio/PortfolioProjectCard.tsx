import Link from "next/link";
import { ProjectMockup, ProjectStatusBadge, TechChip } from "@/components/visual";
import { resolveProjectScreenshot } from "@/lib/portfolio/screenshot-url";
import type { PortfolioProject } from "@/types/portfolio";

type PortfolioProjectCardProps = {
  project: PortfolioProject;
};

export function PortfolioProjectCard({ project }: PortfolioProjectCardProps): React.JSX.Element {
  const isArchived = project.status === "archived";
  const isUpcoming = project.status === "upcoming";
  const caseHref = `/portfolio/${project.slug}/`;
  const screenshotUrl = resolveProjectScreenshot(project);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-md border border-b1 bg-s1 transition-opacity ${
        isArchived ? "opacity-70 grayscale hover:opacity-100 hover:grayscale-0" : ""
      } ${isUpcoming ? "overflow-hidden" : ""}`}
    >
      {isUpcoming ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-bg/20 backdrop-blur-[1px]"
          aria-hidden
        />
      ) : null}
      <div className="relative p-4 pb-0">
        <div className="absolute right-4 top-4 z-[2]">
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
      </div>
      <div className="relative z-[2] flex flex-1 flex-col p-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{project.category}</p>
        <h3 className="mt-2 text-[17px] font-bold group-hover:text-accent-bright">{project.name}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-text-secondary">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <TechChip key={tag} label={tag} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-[10px]">
          <Link href={caseHref} className="text-accent-bright hover:text-text">
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
