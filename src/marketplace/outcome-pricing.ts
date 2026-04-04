export type DeliveryTier = 'ai-only' | 'hybrid' | 'white-glove';

export interface PricingInput {
  basePrice: number;
  tier: DeliveryTier;
  complexityMultiplier?: number;
}

export function calculateOutcomePrice(input: PricingInput): number {
  const tierMultiplier =
    input.tier === 'ai-only' ? 1 : input.tier === 'hybrid' ? 2.5 : 6;

  return Math.round(input.basePrice * tierMultiplier * (input.complexityMultiplier ?? 1));
}
