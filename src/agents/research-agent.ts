export interface ResearchRequest {
  brief: string;
  sources?: number;
}

export class ResearchAgent {
  run(request: ResearchRequest) {
    return {
      summary: `Research brief created for: ${request.brief}`,
      sourceTarget: request.sources ?? 12,
      status: 'ready_for_review' as const,
    };
  }
}
