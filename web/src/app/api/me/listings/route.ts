import { NextRequest, NextResponse } from "next/server";
import { apiProxyOrigin } from "@/lib/api-proxy-origin";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = `${apiProxyOrigin()}/api/me/listings`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: auth },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Me listings proxy error:", error);
    return NextResponse.json({ listings: [], error: "Failed to load" }, { status: 502 });
  }
}
