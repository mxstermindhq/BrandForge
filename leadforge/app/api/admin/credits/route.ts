import type { NextRequest } from "next/server";
import { addCredits, getCreditBalance, getUserById } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/http";
import { adminAuthed } from "@/lib/route-helpers";
import type { AdminCreditInput } from "@/types";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { env } = await adminAuthed(request);
    const body = (await request.json().catch(() => null)) as AdminCreditInput | null;

    if (!body?.userId || typeof body.amount !== "number" || !Number.isFinite(body.amount)) {
      return fail(400, "userId and a numeric amount are required");
    }

    const user = await getUserById(env.DB, body.userId);
    if (!user) return fail(404, "User not found");

    await addCredits(env.DB, body.userId, Math.floor(body.amount));
    const balance = await getCreditBalance(env.DB, body.userId);

    return ok({ userId: body.userId, balance: balance.balance }, "Credits adjusted");
  } catch (err) {
    return handleError(err);
  }
}
