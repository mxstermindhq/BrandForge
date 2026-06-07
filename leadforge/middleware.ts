import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/server";

const PROTECTED_PAGES = ["/dashboard", "/search", "/campaigns", "/leads", "/billing", "/admin"];
const PROTECTED_API = [
  "/api/campaigns",
  "/api/leads",
  "/api/search",
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

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const page = isProtectedPage(pathname);
  const api = isProtectedApi(pathname);
  if (!page && !api) return NextResponse.next();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  const headers = new Headers(request.headers);
  headers.set("x-user-id", user.id);
  headers.set("x-user-email", user.email ?? "");
  response = NextResponse.next({ request: { headers } });
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/search/:path*",
    "/campaigns/:path*",
    "/leads/:path*",
    "/billing/:path*",
    "/admin/:path*",
    "/api/campaigns/:path*",
    "/api/leads/:path*",
    "/api/search/:path*",
    "/api/billing/:path*",
    "/api/admin/:path*",
  ],
};
