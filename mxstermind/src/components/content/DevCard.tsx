import Link from "next/link";
import type { DevCardData } from "@/types/content";

type DevCardProps = {
  card: DevCardData;
};

/** Technical capability card — used on mxstermind developer platform (shared pattern). */
export function DevCard({ card }: DevCardProps): React.JSX.Element {
  return (
    <Link
      href={card.href}
      className="block rounded-md border border-b1 bg-s1 p-6 transition-colors hover:border-[var(--a-mid)]"
      data-cursor="hover"
    >
      <h3 className="text-lg font-bold">{card.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{card.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-sm border border-b2 px-1.5 py-0.5 font-mono text-[9px] text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
