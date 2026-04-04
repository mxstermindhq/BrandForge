export interface ProjectPlanRequest {
  brief: string;
  vertical: string;
}

export class PmAgent {
  plan(request: ProjectPlanRequest) {
    return {
      milestones: [
        'Scope validation',
        'Execution kickoff',
        'Quality review',
        'Client delivery',
      ],
      vertical: request.vertical,
      status: 'planned' as const,
    };
  }
}
