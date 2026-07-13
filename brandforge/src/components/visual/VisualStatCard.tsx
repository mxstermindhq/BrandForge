type VisualStatCardProps = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  sublabel?: string;
  compact?: boolean;
};

export function VisualStatCard({ value, label, icon, sublabel, compact }: VisualStatCardProps): React.JSX.Element {
  return (
    <article className={`border border-b1 bg-s1 ${compact ? "p-3 sm:p-4" : "p-6"}`}>
      {icon ? <div className="mb-2 text-xl text-accent-bright" aria-hidden>{icon}</div> : null}
      <p className={`font-mono font-bold leading-none text-text ${compact ? "text-lg sm:text-xl" : "text-[clamp(2rem,5vw,2.75rem)]"}`}>{value}</p>
      <p className={`font-semibold text-text ${compact ? "mt-1 text-xs" : "mt-2 text-sm"}`}>{label}</p>
      {sublabel ? <p className={`font-mono text-muted ${compact ? "mt-0.5 text-[9px]" : "mt-1 text-[10px]"}`}>{sublabel}</p> : null}
    </article>
  );
}
