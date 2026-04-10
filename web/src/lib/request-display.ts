/** Shared request brief formatting for list cards and explore. */

export function formatRequestBudget(r: {
  budget?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
}): string {
  const min = r.budgetMin;
  const max = r.budgetMax;
  const finites = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
  if (finites(min) && finites(max)) {
    if (min === max) return `$${Math.round(min).toLocaleString()}`;
    return `$${Math.round(min).toLocaleString()} – $${Math.round(max).toLocaleString()}`;
  }
  if (finites(min)) return `$${Math.round(min).toLocaleString()}+`;
  if (finites(max)) return `Up to $${Math.round(max).toLocaleString()}`;
  const raw = (r.budget || "").trim();
  if (!raw || raw === "Budget on request") return "Budget TBD";
  const collapsed = raw.replace(/\s+/g, "").replace(/,/g, "");
  const m = collapsed.match(/^\$(\d+)-\$(\d+)$/);
  if (m && m[1] === m[2]) return `$${Number(m[1]).toLocaleString()}`;
  return raw;
}

/** Value for budget `<input>` when editing a brief (matches server `parseBudget`). */
export function budgetInputFromRequest(r: {
  budgetMin?: number | null;
  budgetMax?: number | null;
}): string {
  const min = r.budgetMin;
  const max = r.budgetMax;
  const finites = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
  if (finites(min) && finites(max)) {
    if (min === max) return String(Math.round(min));
    return `${Math.round(min)}–${Math.round(max)}`;
  }
  if (finites(min)) return `${Math.round(min)}+`;
  if (finites(max)) return String(Math.round(max));
  return "";
}

export function requestTimelineLabel(days: number | null | undefined): string {
  if (days == null || days < 0) return "Timeline TBD";
  if (days < 7) {
    const d = Math.max(1, Math.round(days));
    return `${d} Day${d === 1 ? "" : "s"}`;
  }
  const w = Math.max(1, Math.round(days / 7));
  return `${w} Week${w === 1 ? "" : "s"}`;
}
