import type { NextRequest } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/http";
import { userToPublic } from "@/lib/route-helpers";
import { ValidationError, validateLogin } from "@/lib/validation";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    const input = validateLogin(body);

    const supabase = await createSupabaseRouteClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
    if (error) return fail(401, "Invalid email or password");

    const { getEnv } = await import("@/lib/cloudflare");
    const profile = await getUserByEmail(getEnv().DB, input.email);
    if (!profile) return fail(401, "Invalid email or password");

    return ok(userToPublic(profile));
  } catch (err) {
    if (err instanceof ValidationError) return fail(err.status, err.message);
    return handleError(err);
  }
}
