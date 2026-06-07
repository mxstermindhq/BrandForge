import type { NextRequest } from "next/server";
import { getEnv, waitUntil } from "@/lib/cloudflare";
import { createProfile, ensureCreditRow, getUserByEmail } from "@/lib/db";
import { WELCOME_CREDITS } from "@/lib/constants";
import { sendWelcome } from "@/lib/resend";
import { created, fail, handleError } from "@/lib/http";
import { userToPublic } from "@/lib/route-helpers";
import { ValidationError, validateRegister } from "@/lib/validation";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const env = getEnv();
    const body = await request.json().catch(() => null);
    const input = validateRegister(body);

    const existing = await getUserByEmail(env.DB, input.email);
    if (existing) return fail(409, "An account with that email already exists");

    const supabase = await createSupabaseRouteClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: { data: { name: input.name.trim() } },
    });
    if (error) return fail(400, error.message);
    if (!data.user) return fail(500, "Failed to create account");

    const isAdmin = input.email.trim().toLowerCase() === env.ADMIN_EMAIL?.trim().toLowerCase();
    const user = await createProfile(env.DB, {
      id: data.user.id,
      email: input.email,
      name: input.name,
      is_admin: isAdmin,
    });
    await ensureCreditRow(env.DB, user.id, WELCOME_CREDITS);

    waitUntil(sendWelcome(env.RESEND_API_KEY, user.email, user.name));

    return created(userToPublic(user), "Account created");
  } catch (err) {
    if (err instanceof ValidationError) return fail(err.status, err.message);
    return handleError(err);
  }
}
