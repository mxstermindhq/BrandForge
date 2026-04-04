export interface CreativeRequest {
  brief: string;
  format: 'brand' | 'copy' | 'layout';
}

export class CreativeAgent {
  run(request: CreativeRequest) {
    return {
      conceptCount: request.format === 'brand' ? 20 : 3,
      status: 'draft_ready' as const,
      brief: request.brief,
    };
  }
}
