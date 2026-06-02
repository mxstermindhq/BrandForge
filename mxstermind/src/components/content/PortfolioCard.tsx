import Link from "next/link";
import type { PortfolioCardData } from "@/types/content";

type PortfolioCardProps = {
  project: PortfolioCardData;
};

export function PortfolioCard({ project }: PortfolioCardProps): React.JSX.Element {
  return (
    <Link
      href={project.href}
      className="group block rounded-sm border border-b1 bg-s1 p-6 transition-colors hover:border-accent"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent-bright">{project.tag}</p>
      <h3 className="mt-2 font-serif text-xl font-light group-hover:text-accent-bright">{project.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.chips.map((chip) => (
          <span key={chip} className="rounded-sm border border-b2 px-1.5 py-0.5 font-mono text-[9px] text-muted">
            {chip}
          </span>
        ))}
      </div>
    </Link>
  );
}
