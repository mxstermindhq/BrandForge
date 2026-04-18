/**
 * Stripe Connect (agency payouts) — Phase 2 in docs/ROADMAP_AI_AGENTS.md.
 * Wire when STRIPE_SECRET_KEY and partner onboarding flow are ready.
 */

async function assertStripeConfigured() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured (STRIPE_SECRET_KEY)');
  }
}

async function createConnectedAccount(/* agencyId, email */) {
  await assertStripeConfigured();
  throw new Error('Stripe Connect not implemented yet');
}

async function createOnboardingLink(/* accountId */) {
  await assertStripeConfigured();
  throw new Error('Stripe Connect not implemented yet');
}

async function createAgentSubscription(/* clientId, deploymentId, priceCents */) {
  await assertStripeConfigured();
  throw new Error('Stripe Connect not implemented yet');
}

module.exports = {
  createConnectedAccount,
  createOnboardingLink,
  createAgentSubscription,
};
