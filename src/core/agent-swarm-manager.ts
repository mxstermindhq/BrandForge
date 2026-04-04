import type { WorkflowTask } from './orchestration-engine';

export interface AgentAssignment {
  taskId: string;
  assignee: string;
  role: WorkflowTask['role'];
  mode: 'ai' | 'human';
}

export class AgentSwarmManager {
  assign(tasks: WorkflowTask[]): AgentAssignment[] {
    return tasks.map((task) => ({
      taskId: task.id,
      assignee: this.defaultAssignee(task.role),
      role: task.role,
      mode: task.role === 'human' ? 'human' : 'ai',
    }));
  }

  private defaultAssignee(role: WorkflowTask['role']): string {
    switch (role) {
      case 'research':
        return 'research-agent';
      case 'creative':
        return 'creative-agent';
      case 'code':
        return 'code-agent';
      case 'pm':
        return 'pm-agent';
      case 'evaluator':
        return 'quality-gate';
      case 'human':
        return 'human-specialist';
      default:
        return 'unassigned';
    }
  }
}
