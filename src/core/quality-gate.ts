import { orchestrationConfig } from '../../orchestration.config';

export interface QualitySignal {
  confidence: number;
  policyRisk?: boolean;
  requestedHumanReview?: boolean;
}

export interface QualityDecision {
  outcome: 'approve' | 'iterate' | 'handoff';
  reason: string;
}

export class QualityGate {
  evaluate(signal: QualitySignal): QualityDecision {
    if (signal.policyRisk) {
      return { outcome: 'handoff', reason: 'Policy or compliance risk detected.' };
    }

    if (signal.requestedHumanReview) {
      return { outcome: 'handoff', reason: 'Client or workflow requested human review.' };
    }

    if (signal.confidence >= orchestrationConfig.quality.autoApproveThreshold) {
      return { outcome: 'approve', reason: 'Confidence exceeds auto-approve threshold.' };
    }

    if (signal.confidence < orchestrationConfig.quality.humanReviewThreshold) {
      return { outcome: 'handoff', reason: 'Confidence too low for autonomous approval.' };
    }

    return { outcome: 'iterate', reason: 'Improve output before approval.' };
  }
}
