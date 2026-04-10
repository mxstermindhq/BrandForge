const { computeEscrowQuote } = require('./marketplace-fees');

function getStripeClient(secretKey) {
  if (!secretKey || typeof secretKey !== 'string') return null;
  // Lazy load so installs without Stripe still boot.
  const Stripe = require('stripe');
  return new Stripe(secretKey);
}

function normalizePublicAppUrl(url) {
  const u = String(url || 'http://127.0.0.1:3000').replace(/\/+$/, '');
  return u || 'http://127.0.0.1:3000';
}

async function createEscrowCheckoutSession(stripe, options) {
  const {
    publicAppUrl,
    bidId,
    requestId,
    requestTitle,
    clientUserId,
    bidAmountDollars,
  } = options;
  const quote = computeEscrowQuote(bidAmountDollars);
  const base = normalizePublicAppUrl(publicAppUrl);
  const title = String(requestTitle || 'Project').slice(0, 120);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: quote.currency,
          unit_amount: quote.amountCents,
          product_data: {
            name: `Project escrow: ${title}`,
            description: 'Held until delivery is approved. Platform fee shown in app.',
          },
        },
      },
    ],
    success_url: `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/payment/cancelled`,
    metadata: {
      bid_id: String(bidId),
      request_id: String(requestId),
      client_user_id: String(clientUserId),
      platform_fee_cents: String(quote.platformFeeCents),
      amount_cents: String(quote.amountCents),
    },
  });

  return { session, quote };
}

function constructWebhookEvent(stripe, rawBodyBuffer, signature, webhookSecret) {
  if (!webhookSecret) return null;
  return stripe.webhooks.constructEvent(rawBodyBuffer, signature, webhookSecret);
}

function retrieveCheckoutSession(stripe, sessionId) {
  return stripe.checkout.sessions.retrieve(String(sessionId));
}

module.exports = {
  getStripeClient,
  createEscrowCheckoutSession,
  constructWebhookEvent,
  normalizePublicAppUrl,
  retrieveCheckoutSession,
};
