/** Compact label for marketplace copy: "Deals 3–1", or null if no recorded outcomes. */
export function formatDealRecordShort(
  wins: number | null | undefined,
  losses: number | null | undefined,
): string | null {
  const w = wins != null ? Number(wins) : 0;
  const l = losses != null ? Number(losses) : 0;
  if (!Number.isFinite(w) || !Number.isFinite(l)) return null;
  if (w <= 0 && l <= 0) return null;
  return `Deals ${Math.max(0, Math.round(w))}–${Math.max(0, Math.round(l))}`;
}
