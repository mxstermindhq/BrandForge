import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement AI status
  return NextResponse.json({ status: "ok" });
}