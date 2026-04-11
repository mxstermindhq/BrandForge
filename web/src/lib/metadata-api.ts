/**
 * Server-side fetches for generateMetadata (uses API URL from env; safe fallbacks when offline).
 */

const DEFAULT_API = "http://127.0.0.1:3000";

export function metadataApiBase(): string {
  const raw =
    process.env.API_PROXY_DESTINATION || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API;
  return String(raw).replace(/\/+$/, "");
}

export type PublicProfileMeta = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

export async function fetchPublicProfileForMetadata(username: string): Promise<PublicProfileMeta | null> {
  const u = String(username || "").trim();
  if (!u) return null;
  try {
    const r = await fetch(`${metadataApiBase()}/api/profiles/${encodeURIComponent(u)}/public`, {
      next: { revalidate: 120 },
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { profile?: PublicProfileMeta | null };
    return j.profile ?? null;
  } catch {
    return null;
  }
}

export type ServiceMeta = {
  title?: string | null;
  description?: string | null;
  price?: number | null;
};

export async function fetchServiceForMetadata(id: string): Promise<ServiceMeta | null> {
  const sid = String(id || "").trim();
  if (!sid) return null;
  try {
    const r = await fetch(`${metadataApiBase()}/api/services/${encodeURIComponent(sid)}`, {
      next: { revalidate: 120 },
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { service?: ServiceMeta | null };
    return j.service ?? null;
  } catch {
    return null;
  }
}

export type RequestMeta = {
  title?: string | null;
  desc?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
};

export async function fetchRequestForMetadata(id: string): Promise<RequestMeta | null> {
  const rid = String(id || "").trim();
  if (!rid) return null;
  try {
    const r = await fetch(`${metadataApiBase()}/api/requests/${encodeURIComponent(rid)}`, {
      next: { revalidate: 120 },
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { request?: RequestMeta | null };
    return j.request ?? null;
  } catch {
    return null;
  }
}

export function requestBudgetSnippet(req: RequestMeta | null): number | null {
  if (!req) return null;
  const minRaw = req.budgetMin ?? req.budget_min;
  const maxRaw = req.budgetMax ?? req.budget_max;
  const min = minRaw != null ? Number(minRaw) : null;
  const max = maxRaw != null ? Number(maxRaw) : null;
  if (min != null && max != null) return Math.round((min + max) / 2);
  if (min != null) return min;
  if (max != null) return max;
  return null;
}
