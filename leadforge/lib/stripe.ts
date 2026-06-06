import Stripe from "stripe";
import type { PricePack, StripeCheckoutMetadata } from "@/types";
import { getPackById } from "@/lib/constants";

export { getPackById };

/**
 * Edge-compatible Stripe client. The default Node HTTP client is unavailable on
 * workerd, so we use the Fetch HTTP client and the SubtleCrypto provider.
 */
export function getStripe(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export async function createCheckoutSession(
  stripe: Stripe,
  userId: string,
  packId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const pack = getPackById(packId);
  if (!pack) throw new Error("Unknown pack");

  const metadata: StripeCheckoutMetadata = { userId, packId };

  // Prefer a configured Stripe price; otherwise build an inline price so the app
  // works in development before price IDs are populated.
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = pack.stripePriceId
    ? { price: pack.stripePriceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pack.priceUsd * 100,
          product_data: {
            name: `LeadForge — ${pack.name} (${pack.credits} credits)`,
          },
        },
      };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [lineItem],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    client_reference_id: userId,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export async function constructWebhookEvent(
  stripe: Stripe,
  payload: string,
  signature: string,
  secret: string,
): Promise<Stripe.Event> {
  // Async variant uses SubtleCrypto — required in the edge runtime.
  return stripe.webhooks.constructEventAsync(payload, signature, secret);
}

export type { PricePack };
