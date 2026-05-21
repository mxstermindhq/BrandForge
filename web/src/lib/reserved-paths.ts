/** Single-segment paths reserved for app routes — not usernames. */
export const RESERVED_PATHS = new Set([
  "about",
  "auth",
  "blog",
  "cookies",
  "docs",
  "help",
  "login",
  "onboarding",
  "account",
  "marketplace",
  "mxstermind",
  "offer",
  "offers",
  "press",
  "privacy",
  "product",
  "profile",
  "status",
  "terms",
  "work",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function isReservedUsername(segment: string): boolean {
  const s = String(segment || "").trim().toLowerCase();
  if (!s) return true;
  if (RESERVED_PATHS.has(s)) return true;
  if (s.startsWith("_") || s.includes(".")) return true;
  return false;
}

export function profilePath(username: string): string {
  return `/${encodeURIComponent(String(username || "").trim().replace(/^@+/, ""))}`;
}

export function profileServicePath(username: string, serviceId: string): string {
  return `${profilePath(username)}/service/${encodeURIComponent(serviceId)}`;
}
