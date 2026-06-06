import type { NextRequest } from "next/server";
import { getCreditBalance, getRecentTransactions } from "@/lib/db";
import { handleError, ok } from "@/lib/http";
import { authed } from "@/lib/route-helpers";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const balance = await getCreditBalance(env.DB, session.userId);
    const transactions = await getRecentTransactions(env.DB, session.userId, 10);
    return ok({ balance, transactions });
  } catch (err) {
    return handleError(err);
  }
}
