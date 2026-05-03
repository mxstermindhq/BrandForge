import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement user auth
  return NextResponse.json({ user: null });
}