import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch("https://brandforge-production-e488.up.railway.app/api/feed", {
      method: "GET",
      headers: {
        ...Object.fromEntries(request.headers.entries()),
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Feed proxy error:", error);
    return NextResponse.json({ items: [], total: 0, page: 1, limit: 20 }, { status: 500 });
  }
}