import { NextRequest } from "next/server";
import { proxyApiGet } from "@/lib/proxy-api-route";

export async function GET(request: NextRequest) {
  return proxyApiGet(request, "/api/ai/status", { configured: false, providers: [] });
}
