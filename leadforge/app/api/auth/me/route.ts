import type { NextRequest } from "next/server";
import { getCreditBalance, getUserById } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/http";
import { authed, userToPublic } from "@/lib/route-helpers";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const user = await getUserById(env.DB, session.userId);
    if (!user) return fail(404, "User not found");
    const balance = await getCreditBalance(env.DB, user.id);
    return ok({ user: userToPublic(user), credits: balance });
  } catch (err) {
    return handleError(err);
  }
}
