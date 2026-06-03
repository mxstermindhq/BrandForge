import type { ProjectStatus } from "@/types/portfolio";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; dotClass: string; badgeClass: string; pulse?: boolean }
> = {
  live: {
    label: "Live",
    dotClass: "bg-[var(--green)]",
    badgeClass: "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]",
    pulse: true,
  },
  upcoming: {
    label: "In Development",
    dotClass: "bg-amber",
    badgeClass: "border-amber/30 bg-amber/10 text-amber",
    pulse: true,
  },
  archived: {
    label: "Archived",
    dotClass: "bg-muted",
    badgeClass: "border-b2 bg-s2 text-muted",
    pulse: false,
  },
};

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
  className?: string;
};

export function ProjectStatusBadge({ status, className = "" }: ProjectStatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider ${config.badgeClass} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotClass} ${config.pulse ? "animate-pulse" : ""}`}
        aria-hidden
      />
      {config.label}
    </span>
  );
}
