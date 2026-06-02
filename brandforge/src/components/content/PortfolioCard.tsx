import Link from "next/link";
import type { PortfolioCardData } from "@/types/content";

type PortfolioCardProps = {
  project: PortfolioCardData;
};

export function PortfolioCard({ project }: PortfolioCardProps): React.JSX.Element {
  return (
    <Link
      href={project.href}
      className="group block overflow-hidden rounded-md border border-b1 bg-s1"
      data-cursor="hover"
    >
      <div
        className="flex h-36 items-center justify-center border-b border-b1 bg-s2 font-mono text-[10px] uppercase tracking-wider text-muted"
        aria-hidden
      >
        {project.name}
      </div>
      <div className="p-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{project.tag}</p>
        <h3 className="mt-2 text-[17px] font-bold group-hover:text-accent-bright">{project.name}</h3>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-sm border border-b2 px-1.5 py-0.5 font-mono text-[9px] text-muted"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
