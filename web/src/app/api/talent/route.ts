import { NextRequest, NextResponse } from "next/server";
import { apiProxyOrigin } from "@/lib/api-proxy-origin";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.searchParams.toString();
    const url = `${apiProxyOrigin()}/api/talent${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Talent directory proxy error:", error);
    return NextResponse.json({ members: [], total: 0, error: "Failed to load directory" }, { status: 502 });
  }
}
