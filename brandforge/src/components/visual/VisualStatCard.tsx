type VisualStatCardProps = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  sublabel?: string;
};

export function VisualStatCard({ value, label, icon, sublabel }: VisualStatCardProps): React.JSX.Element {
  return (
    <article className="rounded-md border border-b1 bg-s1 p-6">
      {icon ? <div className="mb-3 text-2xl text-accent-bright" aria-hidden>{icon}</div> : null}
      <p className="font-mono text-[clamp(2rem,5vw,2.75rem)] font-bold leading-none text-text">{value}</p>
      <p className="mt-2 text-sm font-semibold text-text">{label}</p>
      {sublabel ? <p className="mt-1 font-mono text-[10px] text-muted">{sublabel}</p> : null}
    </article>
  );
}
