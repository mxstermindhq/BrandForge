import { NextRequest, NextResponse } from "next/server";

/** Headers we do not forward to the origin (fetch sets Host from the target URL). */
const SKIP_REQ_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function apiOrigin(): string {
  return String(
    process.env.API_PROXY_DESTINATION || process.env.NEXT_PUBLIC_API_URL || "",
  )
    .trim()
    .replace(/\/+$/, "");
}

/**
 * OpenNext on Cloudflare often does not apply next.config.js `rewrites` to external URLs the same way as Node hosting.
 * Proxy `/api/*` here so the Worker always reaches the Node API (e.g. Railway). Wrangler `vars` + build env supply the URL.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const base = apiOrigin();
  if (!base) {
    return NextResponse.next();
  }

  try {
    const target = `${base}${pathname}${search}`;
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!SKIP_REQ_HEADERS.has(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const init: RequestInit = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const buf = await request.arrayBuffer();
      if (buf.byteLength > 0) {
        init.body = buf;
      }
    }

    const res = await fetch(target, init);

    const out = new Headers();
    res.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        out.append(key, value);
      }
    });

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: out,
    });
  } catch (err) {
    console.error("[middleware api proxy]", err);
    return NextResponse.json(
      { error: "Bad gateway", detail: String(err) },
      { status: 502 },
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
