export const saasBrandingWorkflow = {
  name: 'SaaS Brand Identity System',
  agents: [
    { id: 'research', type: 'research', task: 'competitor_analysis' },
    { id: 'strategy', type: 'creative', dependsOn: ['research'], task: 'positioning' },
    { id: 'logo_gen', type: 'creative', dependsOn: ['strategy'], task: 'logo_concepts' },
    { id: 'human_refine', type: 'human', role: 'senior_designer', dependsOn: ['logo_gen'], task: 'refine_winner' },
    { id: 'brand_system', type: 'creative', dependsOn: ['human_refine'], task: 'full_system' },
    { id: 'qa', type: 'evaluator', dependsOn: ['brand_system'], task: 'brand_consistency_check' },
  ],
  pricing: {
    base: 299,
    aiOnly: 49,
    hybrid: 299,
    whiteGlove: 1299,
  },
  delivery: {
    aiOnly: '24h',
    hybrid: '3-5 days',
    whiteGlove: '7-14 days',
  },
} as const;
