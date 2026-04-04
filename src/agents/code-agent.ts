export interface CodeRequest {
  brief: string;
  stack: string;
}

export class CodeAgent {
  run(request: CodeRequest) {
    return {
      stack: request.stack,
      status: 'implementation_ready' as const,
      summary: `Prepared implementation plan for ${request.brief}`,
    };
  }
}
