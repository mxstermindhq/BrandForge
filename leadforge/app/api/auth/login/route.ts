import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { createSession, sessionCookieHeader, verifyPassword } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { fail, handleError, jsonResponse } from "@/lib/http";
import { userToPublic } from "@/lib/route-helpers";
import { ValidationError, validateLogin } from "@/lib/validation";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const env = getEnv();
    const body = await request.json().catch(() => null);
    const input = validateLogin(body);

    const user = await getUserByEmail(env.DB, input.email);
    if (!user) return fail(401, "Invalid email or password");

    const valid = await verifyPassword(input.password, user.password_hash);
    if (!valid) return fail(401, "Invalid email or password");

    const isAdmin = user.is_admin === 1;
    const token = await createSession(env.SESSIONS, env.JWT_SECRET, {
      userId: user.id,
      email: user.email,
      isAdmin,
    });

    return jsonResponse(
      { success: true, data: userToPublic(user) },
      200,
      { "Set-Cookie": sessionCookieHeader(token) },
    );
  } catch (err) {
    if (err instanceof ValidationError) return fail(err.status, err.message);
    return handleError(err);
  }
}
