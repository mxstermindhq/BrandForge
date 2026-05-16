import { NextRequest } from "next/server";
import { proxyApiGet } from "@/lib/proxy-api-route";

export async function GET(request: NextRequest) {
  return proxyApiGet(request, "/api/activity/recent", { items: [] });
}
