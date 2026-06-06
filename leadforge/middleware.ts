import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Coarse edge gate: verifies the JWT signature and injects identity headers.
// Authoritative KV revocation + ownership checks happen in route handlers via
// requireAuth(); this keeps the middleware fast and binding-light.

const PROTECTED_PAGES = ["/dashboard", "/campaigns", "/leads", "/billing", "/admin"];
const PROTECTED_API = [
  "/api/campaigns",
  "/api/leads",
  "/api/billing/balance",
  "/api/billing/checkout",
  "/api/admin",
];

function isProtectedPage(path: string): boolean {
  return PROTECTED_PAGES.some((p) => path === p || path.startsWith(`${p}/`));
}

function isProtectedApi(path: string): boolean {
  return PROTECTED_API.some((p) => path === p || path.startsWith(`${p}/`));
}

async function verify(
  token: string | undefined,
  secret: string | undefined,
): Promise<{ userId: string; email: string; isAdmin: boolean } | null> {
  if (!token || !secret || secret.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      isAdmin: payload.isAdmin === true,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const page = isProtectedPage(pathname);
  const api = isProtectedApi(pathname);
  if (!page && !api) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAdminPath =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin");

  // No cookie at all → never authenticated.
  if (!token) {
    if (api) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // env var is exposed to the edge middleware via process.env under opennext.
  const secret = process.env.JWT_SECRET;
  const session = await verify(token, secret);

  // If the secret isn't available at the edge (e.g. the dev proxy doesn't expose
  // it to middleware), pass through and defer to the authoritative KV-backed
  // requireAuth()/requireAdmin() checks in the route/page layer.
  if (!secret) {
    return NextResponse.next();
  }

  if (!session) {
    if (api) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath && !session.isAdmin) {
    if (api) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const headers = new Headers(request.headers);
  headers.set("x-user-id", session.userId);
  headers.set("x-user-email", session.email);
  headers.set("x-user-admin", session.isAdmin ? "1" : "0");
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/campaigns/:path*",
    "/leads/:path*",
    "/billing/:path*",
    "/admin/:path*",
    "/api/campaigns/:path*",
    "/api/leads/:path*",
    "/api/billing/:path*",
    "/api/admin/:path*",
  ],
};
