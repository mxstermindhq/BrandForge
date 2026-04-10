"use client";

import {
  formatUtcWeekLabel,
  nextUtcMondayStart,
  utcMondayWeekStart,
  wholeUtcDaysUntil,
} from "@/lib/honor-week";

type Props = {
  weekStartsAtISO?: string | null;
  strictFilterActive?: boolean;
  context?: "services" | "requests";
};

export function WeeklyResetBanner({ weekStartsAtISO, strictFilterActive, context = "services" }: Props) {
  let weekStart = utcMondayWeekStart();
  if (weekStartsAtISO) {
    const p = new Date(weekStartsAtISO);
    if (!Number.isNaN(p.getTime())) weekStart = p;
  }
  const weekLabel = formatUtcWeekLabel(weekStart);
  const now = new Date();
  const nextReset = nextUtcMondayStart(now);
  const nextLabel = formatUtcWeekLabel(nextReset);
  const daysUntil = wholeUtcDaysUntil(now, nextReset);
  const daysLine =
    daysUntil === 0
      ? "Next reset is today at 00:00 UTC."
      : daysUntil === 1
        ? "Next reset in 1 day."
        : `Next reset in ${daysUntil} days.`;

  const subtle =
    context === "requests"
      ? "Open briefs rotate on the Monday cadence so the board stays competitive."
      : "New and relisted packages stack each cycle — check back after every Monday reset for the freshest desk.";

  return (
    <aside
      className="mb-6 flex items-start gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low p-5"
      aria-label="Weekly marketplace reset"
    >
      <div className="mt-1 flex shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary/80" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="section-label !mb-1">Weekly reset · Monday 00:00 UTC</p>
        <p className="text-[13px] font-body leading-[1.6] text-on-surface">
          {daysLine}{" "}
          <span className="font-500 text-primary tabular-nums">{nextLabel}</span>
          <span className="text-on-surface-variant"> (UTC)</span>
        </p>
        <p className="mt-0.5 text-[12px] font-body text-on-surface-variant">
          Fresh board this cycle: <span className="tabular-nums text-on-surface">{weekLabel}</span>
        </p>
        <p className="mt-2 text-[12px] font-body leading-[1.6] text-on-surface-variant">{subtle}</p>
      </div>
      <div className="ml-4 flex shrink-0 flex-col items-end gap-2">
        <span className="inline-flex border border-outline-variant px-3 py-1.5 text-[11px] font-headline font-600 uppercase tracking-[0.04em] text-on-surface-variant">
          Honor cadence
        </span>
               {strictFilterActive ? (
          <span className="pill-primary text-[10px]">Strict filter on</span>
        ) : (
          <span className="text-[11px] font-body text-on-surface-variant/60">Full catalog</span>
        )}
      </div>
    </aside>
  );
}
