import { orchestrationConfig } from '../../orchestration.config';

export type AgentRole =
  | 'research'
  | 'creative'
  | 'code'
  | 'pm'
  | 'evaluator'
  | 'human';

export type TaskStatus =
  | 'queued'
  | 'running'
  | 'blocked'
  | 'needs_human'
  | 'completed'
  | 'failed';

export interface WorkflowTask {
  id: string;
  role: AgentRole;
  task: string;
  dependsOn?: string[];
  status?: TaskStatus;
}

export interface WorkflowContext {
  runId: string;
  projectId: string;
  brief: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowExecutionResult {
  runId: string;
  tasks: WorkflowTask[];
  status: TaskStatus;
  nextAction: 'continue' | 'handoff' | 'complete';
}

export class OrchestrationEngine {
  constructor(
    private readonly config = orchestrationConfig,
  ) {}

  startRun(
    context: WorkflowContext,
    tasks: WorkflowTask[],
  ): WorkflowExecutionResult {
    const hydratedTasks = tasks.map((task) => ({
      ...task,
      status: task.dependsOn?.length ? 'blocked' : 'queued',
    }));

    return {
      runId: context.runId,
      tasks: hydratedTasks,
      status: 'queued',
      nextAction: 'continue',
    };
  }

  releaseReadyTasks(tasks: WorkflowTask[]): WorkflowTask[] {
    const completed = new Set(
      tasks.filter((task) => task.status === 'completed').map((task) => task.id),
    );

    return tasks.map((task) => {
      if (task.status !== 'blocked') return task;
      const ready = (task.dependsOn || []).every((dependency) =>
        completed.has(dependency),
      );
      return ready ? { ...task, status: 'queued' } : task;
    });
  }

  maxIterations(): number {
    return this.config.quality.maxIterations;
  }
}
