import type { NextRequest } from "next/server";
import { signOut } from "@/lib/auth";
import { handleError, ok } from "@/lib/http";

export async function POST(_request: NextRequest): Promise<Response> {
  try {
    await signOut();
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
