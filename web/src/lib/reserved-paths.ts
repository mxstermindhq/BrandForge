/** Single-segment paths reserved for app routes — not usernames. */
export const RESERVED_PATHS = new Set([
  "about",
  "ai",
  "api",
  "auth",
  "bid",
  "blog",
  "chat",
  "cookies",
  "dashboard",
  "docs",
  "explore",
  "feed",
  "help",
  "icon.svg",
  "inbox",
  "leaderboard",
  "login",
  "marketing",
  "marketplace",
  "messages",
  "p",
  "payment",
  "plans",
  "press",
  "privacy",
  "product",
  "requests",
  "robots.txt",
  "services",
  "settings",
  "sitemap.xml",
  "squads",
  "status",
  "store",
  "terms",
  "u",
  "welcome",
  "_next",
  "favicon.ico",
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

export function profileRequestPath(username: string, requestId: string): string {
  return `${profilePath(username)}/request/${encodeURIComponent(requestId)}`;
}
