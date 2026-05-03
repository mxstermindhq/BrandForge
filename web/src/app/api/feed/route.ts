import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement feed
  return NextResponse.json({ items: [], total: 0, page: 1, limit: 20 });
}