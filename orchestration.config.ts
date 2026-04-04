export type SwarmPattern =
  | 'sequential'
  | 'concurrent'
  | 'group-chat'
  | 'handoff'
  | 'maker-checker';

export type HumanHandoffTrigger =
  | 'low_confidence'
  | 'creative_direction'
  | 'client_request'
  | 'policy_risk'
  | 'missing_context';

export const orchestrationConfig = {
  mcp: {
    version: '2025-04',
    toolRegistry: 'https://tools.mxstermind.ai',
    contextWindow: 128_000,
  },
  patterns: {
    default: 'sequential' as SwarmPattern,
    available: [
      'sequential',
      'concurrent',
      'group-chat',
      'handoff',
      'maker-checker',
    ] as SwarmPattern[],
  },
  quality: {
    autoApproveThreshold: 0.95,
    humanReviewThreshold: 0.7,
    maxIterations: 5,
  },
  collaboration: {
    humanHandoffTriggers: [
      'low_confidence',
      'creative_direction',
      'client_request',
    ] as HumanHandoffTrigger[],
    aiAssistLevel: 'full_autonomy' as 'suggest' | 'draft' | 'full_autonomy',
  },
} as const;
