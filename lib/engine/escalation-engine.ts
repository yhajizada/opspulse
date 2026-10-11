export interface EscalationRuleStep {
  stepOrder: number;
  delayMinutes: number; // Cumulative or step delay
  targetRole: string; // "PRIMARY_ON_CALL" | "SECONDARY_ON_CALL" | "INCIDENT_COMMANDER"
  targetName: string;
}

export interface EscalationEvaluation {
  currentStepIndex: number;
  activeTarget: EscalationRuleStep;
  nextTarget?: EscalationRuleStep;
  minutesElapsed: number;
  minutesUntilNextEscalation?: number;
  isMaxEscalationReached: boolean;
  shouldEscalateNow: boolean;
}

export class EscalationEngine {
  /**
   * Evaluates escalation policy steps based on unacknowledged elapsed time.
   */
  public static evaluate(
    steps: EscalationRuleStep[],
    elapsedMinutes: number,
    currentStepOrder: number = 1
  ): EscalationEvaluation {
    if (!steps || steps.length === 0) {
      throw new Error("Escalation policy must have at least one step configured");
    }

    const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

    // Calculate cumulative thresholds
    let cumulativeDelay = 0;
    let targetIndex = 0;

    for (let i = 0; i < sortedSteps.length; i++) {
      cumulativeDelay += sortedSteps[i].delayMinutes;
      if (elapsedMinutes >= cumulativeDelay) {
        targetIndex = i;
      } else {
        break;
      }
    }

    const activeTarget = sortedSteps[targetIndex];
    const nextTarget = sortedSteps[targetIndex + 1];

    const isMaxEscalationReached = targetIndex === sortedSteps.length - 1;
    const shouldEscalateNow = activeTarget.stepOrder > currentStepOrder;

    let minutesUntilNextEscalation: number | undefined;
    if (nextTarget) {
      minutesUntilNextEscalation = Math.max(0, cumulativeDelay - elapsedMinutes);
    }

    return {
      currentStepIndex: targetIndex,
      activeTarget,
      nextTarget,
      minutesElapsed: elapsedMinutes,
      minutesUntilNextEscalation,
      isMaxEscalationReached,
      shouldEscalateNow,
    };
  }
}
