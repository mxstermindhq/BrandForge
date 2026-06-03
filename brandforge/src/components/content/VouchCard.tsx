import type { VouchCardData } from "@/types/content";

type VouchCardProps = {
  vouch: VouchCardData;
};

export function VouchCard({ vouch }: VouchCardProps): React.JSX.Element {
  const stars = "★".repeat(vouch.stars) + (vouch.stars < 5 ? "☆".repeat(5 - vouch.stars) : "");

  return (
    <blockquote className="relative overflow-hidden rounded-md border border-b1 bg-s1 p-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gradient-to-b before:from-amber before:to-transparent">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{vouch.from}</p>
      <p className="mt-2 text-amber text-sm" aria-label={`${vouch.stars} out of 5 stars`}>
        {stars}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">&ldquo;{vouch.text}&rdquo;</p>
      <footer className="mt-4 font-mono text-[10px] text-accent-bright">
        {vouch.who}
        {vouch.amount ? <span className="block text-muted">{vouch.amount}</span> : null}
      </footer>
    </blockquote>
  );
}
