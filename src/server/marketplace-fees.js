/** Platform take on marketplace escrow (basis points). 1500 = 15%. */
const PLATFORM_FEE_BPS = 1500;

function computeEscrowQuote(bidAmountDollars) {
  const amount = Number(bidAmountDollars);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid bid amount for payment quote');
  }
  const amountCents = Math.max(1, Math.round(amount * 100));
  const platformFeeCents = Math.floor((amountCents * PLATFORM_FEE_BPS) / 10000);
  const specialistReceivesCents = amountCents - platformFeeCents;
  const toUsd = (c) => Math.round(c) / 100;
  return {
    currency: 'usd',
    bidAmount: toUsd(amountCents),
    amountCents,
    platformFeeBps: PLATFORM_FEE_BPS,
    platformFeePct: PLATFORM_FEE_BPS / 100,
    platformFee: toUsd(platformFeeCents),
    platformFeeCents,
    specialistReceives: toUsd(specialistReceivesCents),
    specialistReceivesCents,
  };
}

module.exports = {
  PLATFORM_FEE_BPS,
  computeEscrowQuote,
};
