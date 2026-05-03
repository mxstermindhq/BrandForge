import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({ test: "worker is working" }), {
    headers: { 'Content-Type': 'application/json' },
  });
}