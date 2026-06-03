import Link from "next/link";
import { PortfolioProjectCard } from "@/components/portfolio/PortfolioProjectCard";
import { projectsByStatus } from "@/content/portfolio/projects";

export function HomePortfolioPreview(): React.JSX.Element {
  const featured = projectsByStatus("live").slice(0, 6);

  return (
    <section id="work-preview" className="bf-below-fold border-b border-b1 py-[var(--spacing-section)]">
      <div className="content-wrap">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">Portfolio</p>
        <h2 className="mt-3 text-[clamp(28px,4vw,48px)] font-bold leading-[1.1]">
          Live work — <em className="text-accent-bright not-italic">not mockups.</em>
        </h2>
        <p className="mt-4 max-w-lg text-sm text-text-secondary">
          Six recent live builds. Full case studies with scope, stack, and outcomes on the portfolio hub.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <PortfolioProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <Link
          href="/portfolio/"
          className="mt-8 inline-block font-mono text-[11px] text-accent-bright hover:text-text"
        >
          View all projects →
        </Link>
      </div>
    </section>
  );
}
