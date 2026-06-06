import type { NextRequest } from "next/server";
import { getEnv, waitUntil } from "@/lib/cloudflare";
import { getPackById } from "@/lib/constants";
import { constructWebhookEvent, getStripe } from "@/lib/stripe";
import {
  addCredits,
  createTransaction,
  getCreditBalance,
  getTransactionByStripeSession,
  getUserById,
  updateTransaction,
} from "@/lib/db";
import { sendLowCredits } from "@/lib/resend";
import { fail, ok } from "@/lib/http";

export async function POST(request: NextRequest): Promise<Response> {
  const env = getEnv();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return fail(400, "Missing signature");

  const payload = await request.text();

  let event;
  try {
    const stripe = getStripe(env.STRIPE_SECRET_KEY);
    event = await constructWebhookEvent(
      stripe,
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return fail(400, `Webhook verification failed: ${message}`);
  }

  if (event.type !== "checkout.session.completed") {
    return ok({ received: true });
  }

  const sessionObj = event.data.object as {
    id: string;
    payment_status?: string;
    payment_intent?: string;
    amount_total?: number;
    metadata?: Record<string, string>;
  };

  if (sessionObj.payment_status && sessionObj.payment_status !== "paid") {
    return ok({ received: true });
  }

  // Idempotency: skip if we've already credited this Stripe session.
  const existing = await getTransactionByStripeSession(env.DB, sessionObj.id);
  if (existing && existing.status === "complete") {
    return ok({ received: true, duplicate: true });
  }

  const userId = sessionObj.metadata?.userId;
  const packId = sessionObj.metadata?.packId;
  const pack = getPackById(packId ?? "");
  if (!userId || !pack) {
    return fail(400, "Missing or invalid checkout metadata");
  }

  if (existing) {
    await updateTransaction(env.DB, existing.id, {
      status: "complete",
      stripe_payment_intent: sessionObj.payment_intent ?? null,
    });
  } else {
    await createTransaction(env.DB, {
      user_id: userId,
      amount_cents: sessionObj.amount_total ?? pack.priceUsd * 100,
      credits_purchased: pack.credits,
      stripe_session_id: sessionObj.id,
      stripe_payment_intent: sessionObj.payment_intent ?? null,
      status: "complete",
    });
  }

  await addCredits(env.DB, userId, pack.credits, true);
  const balance = await getCreditBalance(env.DB, userId);

  if (balance.balance < 100) {
    const user = await getUserById(env.DB, userId);
    if (user) {
      waitUntil(sendLowCredits(env.RESEND_API_KEY, user.email, balance.balance));
    }
  }

  return ok({ received: true, credited: pack.credits });
}
