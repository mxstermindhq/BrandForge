import { NextRequest, NextResponse } from "next/server";
import { apiProxyOrigin } from "@/lib/api-proxy-origin";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.searchParams.toString();
    const url = `${apiProxyOrigin()}/api/marketplace/listings${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Marketplace listings proxy error:", error);
    return NextResponse.json({ listings: [], total: 0, error: "Failed to load listings" }, { status: 502 });
  }
}
