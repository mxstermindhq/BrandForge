function isLoopbackApiUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]";
  } catch {
    return true;
  }
}

function apiBase(): string {
  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "1") return "";
  // Dev + default rewrites in next.config.mjs: browser hits same-origin /api → Next forwards to Node.
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_API_DIRECT !== "1"
  ) {
    return "";
  }
  const raw = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
  // Production: never call the viewer's loopback — use same-origin /api (rewrites + API_PROXY_DESTINATION on the host).
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production" && isLoopbackApiUrl(raw)) {
    return "";
  }
  return raw;
}

/** Public origin of the Node API (OAuth redirect URI, direct fetches). Not used for JSON client when USE_API_PROXY=1. */
export function getApiOrigin(): string {
  const b = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
  return b;
}

export type ApiFetchInit = RequestInit & {
  accessToken?: string | null;
};

const API_FETCH_TIMEOUT_MS = 28_000;

export async function apiFetch<T = unknown>(
  path: string,
  init: ApiFetchInit = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const { accessToken, headers: h, ...rest } = init;
  const headers = new Headers(h);
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && rest.body && typeof rest.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), API_FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path.startsWith("/") ? path : `/${path}`}`, {
      ...rest,
      headers,
      signal: rest.signal ? AbortSignal.any([rest.signal, ctrl.signal]) : ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export async function apiGetJson<T = unknown>(
  path: string,
  accessToken: string | null | undefined,
): Promise<T> {
  const { ok, data, status } = await apiFetch<T>(path, { method: "GET", accessToken });
  if (!ok) {
    const err = (data as { error?: string })?.error || `HTTP ${status}`;
    throw new Error(err);
  }
  return data;
}

export async function apiMutateJson<T = unknown>(
  path: string,
  method: string,
  body: unknown,
  accessToken: string | null | undefined,
): Promise<T> {
  const { ok, data, status } = await apiFetch<T>(path, {
    method,
    accessToken,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!ok) {
    const err = (data as { error?: string })?.error || `HTTP ${status}`;
    throw new Error(err);
  }
  return data;
}
