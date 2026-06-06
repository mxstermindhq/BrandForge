import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { getPackById } from "@/lib/constants";
import { createCheckoutSession, getStripe } from "@/lib/stripe";
import { fail, handleError, ok } from "@/lib/http";
import { authed } from "@/lib/route-helpers";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { session } = await authed(request);
    const env = getEnv();
    const body = (await request.json().catch(() => null)) as { packId?: string } | null;
    const pack = getPackById(body?.packId ?? "");
    if (!pack) return fail(400, "Unknown credit pack");

    const stripe = getStripe(env.STRIPE_SECRET_KEY);
    const url = await createCheckoutSession(
      stripe,
      session.userId,
      pack.id,
      `${env.APP_URL}/billing?status=success`,
      `${env.APP_URL}/billing?status=cancelled`,
    );

    return ok({ url });
  } catch (err) {
    return handleError(err);
  }
}
