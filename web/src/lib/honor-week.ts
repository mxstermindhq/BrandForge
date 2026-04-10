/** Monday 00:00 UTC — matches server `honorWeekStartUtcISO` in platform-repository.js */
export function utcMondayWeekStart(d = new Date()): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay();
  const diff = (day + 6) % 7;
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export function formatUtcWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function nextUtcMondayStart(from = new Date()): Date {
  const cur = utcMondayWeekStart(from);
  const next = new Date(cur);
  next.setUTCDate(next.getUTCDate() + 7);
  return next;
}

/** Whole days from `from` until `until` (UTC instants), minimum 0; partial days round up. */
export function wholeUtcDaysUntil(from: Date, until: Date): number {
  const ms = until.getTime() - from.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}
