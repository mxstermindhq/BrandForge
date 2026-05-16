/** Node API origin for server-side Next route proxies (Render, Fly, local, etc.). */
export function apiProxyOrigin(): string {
  const raw =
    process.env.API_PROXY_DESTINATION || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
  return String(raw).trim().replace(/\/+$/, "");
}
