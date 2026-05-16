import { NextRequest, NextResponse } from "next/server";
import { apiProxyOrigin } from "./api-proxy-origin";

/** Forward a GET to the Node API (path includes leading `/api/...`). */
export async function proxyApiGet(
  request: NextRequest,
  apiPath: string,
  fallback: unknown,
): Promise<NextResponse> {
  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  try {
    const url = `${apiProxyOrigin()}${path}${request.nextUrl.search}`;
    const response = await fetch(url, {
      method: "GET",
      headers: Object.fromEntries(request.headers.entries()),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`API proxy error (${path}):`, error);
    return NextResponse.json(fallback, { status: 502 });
  }
}
