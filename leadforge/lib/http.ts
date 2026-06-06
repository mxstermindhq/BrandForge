import type { ApiResponse } from "@/types";
import { AuthError } from "@/lib/auth";

export function jsonResponse<T>(
  body: ApiResponse<T>,
  status = 200,
  headers?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function ok<T>(data: T, message?: string): Response {
  return jsonResponse<T>({ success: true, data, message });
}

export function created<T>(data: T, message?: string): Response {
  return jsonResponse<T>({ success: true, data, message }, 201);
}

export function fail(status: number, error: string): Response {
  return jsonResponse({ success: false, error }, status);
}

/** Maps thrown errors to a response. AuthError carries its own status. */
export function handleError(err: unknown): Response {
  if (err instanceof AuthError) return fail(err.status, err.message);
  const message = err instanceof Error ? err.message : "Internal error";
  console.error("Route error:", message);
  return fail(500, "Something went wrong");
}

export function parsePagination(url: URL): { page: number; limit: number } {
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "20");
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20,
  };
}
