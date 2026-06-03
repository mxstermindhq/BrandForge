type TechChipProps = {
  label: string;
  icon?: string;
};

export function TechChip({ label, icon }: TechChipProps): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-b2 bg-bg px-2 py-1 font-mono text-[9px] text-text-secondary">
      {icon ? <span aria-hidden>{icon}</span> : null}
      {label}
    </span>
  );
}
