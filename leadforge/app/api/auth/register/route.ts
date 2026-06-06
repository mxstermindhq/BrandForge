import type { NextRequest } from "next/server";
import { getEnv, waitUntil } from "@/lib/cloudflare";
import { createSession, hashPassword, sessionCookieHeader } from "@/lib/auth";
import { createUser, ensureCreditRow, getUserByEmail } from "@/lib/db";
import { WELCOME_CREDITS } from "@/lib/constants";
import { sendWelcome } from "@/lib/resend";
import { fail, handleError, jsonResponse } from "@/lib/http";
import { userToPublic } from "@/lib/route-helpers";
import { ValidationError, validateRegister } from "@/lib/validation";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const env = getEnv();
    const body = await request.json().catch(() => null);
    const input = validateRegister(body);

    const existing = await getUserByEmail(env.DB, input.email);
    if (existing) return fail(409, "An account with that email already exists");

    const passwordHash = await hashPassword(input.password);
    const isAdmin = input.email === env.ADMIN_EMAIL?.trim().toLowerCase();
    const user = await createUser(env.DB, {
      ...input,
      password_hash: passwordHash,
      is_admin: isAdmin,
    });
    await ensureCreditRow(env.DB, user.id, WELCOME_CREDITS);

    const token = await createSession(env.SESSIONS, env.JWT_SECRET, {
      userId: user.id,
      email: user.email,
      isAdmin,
    });

    waitUntil(sendWelcome(env.RESEND_API_KEY, user.email, user.name));

    return jsonResponse(
      { success: true, data: userToPublic(user), message: "Account created" },
      201,
      { "Set-Cookie": sessionCookieHeader(token) },
    );
  } catch (err) {
    if (err instanceof ValidationError) return fail(err.status, err.message);
    return handleError(err);
  }
}
