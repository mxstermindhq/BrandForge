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

/**
 * One-off Checkout session (e.g. chat-linked deposit). Amount is total charged in USD.
 */
async function createSimpleUsdCheckoutSession(stripe, options) {
  const { publicAppUrl, title, amountDollars, metadata } = options;
  const amt = Number(amountDollars);
  if (!Number.isFinite(amt) || amt <= 0) throw new Error('Invalid amount');
  const amountCents = Math.max(50, Math.round(amt * 100));
  const base = normalizePublicAppUrl(publicAppUrl);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: {
            name: String(title || 'Payment').slice(0, 120),
            description: 'Held for the active deal — confirm delivery in chat.',
          },
        },
      },
    ],
    success_url: `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/payment/cancelled`,
    metadata:
      metadata && typeof metadata === 'object'
        ? Object.fromEntries(
            Object.entries(metadata).map(([k, v]) => [String(k).slice(0, 40), String(v ?? '').slice(0, 500)]),
          )
        : {},
  });
  return { session, amountCents };
}

module.exports = {
  getStripeClient,
  createEscrowCheckoutSession,
  createSimpleUsdCheckoutSession,
  constructWebhookEvent,
  normalizePublicAppUrl,
  retrieveCheckoutSession,
};
