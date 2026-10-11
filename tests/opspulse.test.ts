import { describe, it, expect } from "vitest";
import { AlertDeduplicationEngine } from "../lib/engine/alert-dedup";
import { SLOCalculator } from "../lib/engine/slo-calculator";
import { EscalationEngine, EscalationRuleStep } from "../lib/engine/escalation-engine";

describe("OpsPulse Reliability Engines", () => {
  describe("AlertDeduplicationEngine", () => {
    it("should generate identical fingerprints for alerts differing only by dynamic pod IP or UUID", () => {
      const alert1 = {
        source: "DATADOG" as const,
        title: "Kafka consumer lag pod-worker-8921-bc19 10.244.1.42 timeout 123e4567-e89b-12d3-a456-426614174000",
        serviceSlug: "order-processing",
        severity: "CRITICAL" as const,
        cluster: "us-east-1",
      };

      const alert2 = {
        source: "DATADOG" as const,
        title: "Kafka consumer lag pod-worker-9944-aa02 10.244.3.88 timeout 987f6543-e21b-43d2-b789-512314174999",
        serviceSlug: "order-processing",
        severity: "CRITICAL" as const,
        cluster: "us-east-1",
      };

      const fp1 = AlertDeduplicationEngine.generateFingerprint(alert1);
      const fp2 = AlertDeduplicationEngine.generateFingerprint(alert2);

      expect(fp1).toBe(fp2);
    });

    it("should prioritize critical alerts on Tier-1 services to P1_CRITICAL", () => {
      const priorityTier1 = AlertDeduplicationEngine.mapSeverityToPriority("CRITICAL", "TIER_1");
      expect(priorityTier1).toBe("P1_CRITICAL");

      const priorityTier2 = AlertDeduplicationEngine.mapSeverityToPriority("CRITICAL", "TIER_2");
      expect(priorityTier2).toBe("P2_MAJOR");

      const priorityLow = AlertDeduplicationEngine.mapSeverityToPriority("INFO", "TIER_1");
      expect(priorityLow).toBe("P4_LOW");
    });
  });

  describe("SLOCalculator", () => {
    it("should correctly compute 30-day downtime and remaining error budget for 99.95% SLO", () => {
      const res = SLOCalculator.calculate({
        sloTargetPercent: 99.95,
        periodDays: 30,
        outageMinutesInPeriod: 10.8,
      });

      // Allowed downtime for 99.95% in 30 days (43,200 min) = 21.6 mins
      expect(res.allowedDowntimeMinutes).toBe(21.6);
      expect(res.consumedDowntimeMinutes).toBe(10.8);
      expect(res.remainingBudgetMinutes).toBe(10.8);
      expect(res.errorBudgetRemainingPercent).toBe(50);
      expect(res.status).toBe("HEALTHY");
    });

    it("should flag status as EXHAUSTED when outage exceeds allowed error budget", () => {
      const res = SLOCalculator.calculate({
        sloTargetPercent: 99.9,
        periodDays: 30,
        outageMinutesInPeriod: 50.0, // allowed is 43.2 min
      });

      expect(res.errorBudgetRemainingPercent).toBe(0);
      expect(res.remainingBudgetMinutes).toBe(0);
      expect(res.status).toBe("EXHAUSTED");
    });
  });

  describe("EscalationEngine", () => {
    it("should evaluate active escalation step based on elapsed unacknowledged minutes", () => {
      const steps: EscalationRuleStep[] = [
        { stepOrder: 1, delayMinutes: 0, targetRole: "PRIMARY_ON_CALL", targetName: "Elena Rostova" },
        { stepOrder: 2, delayMinutes: 5, targetRole: "SECONDARY_ON_CALL", targetName: "Marcus Vance" },
        { stepOrder: 3, delayMinutes: 15, targetRole: "INCIDENT_COMMANDER", targetName: "Yusif Hajizada" },
      ];

      // At 2 minutes elapsed: still on step 1
      const eval1 = EscalationEngine.evaluate(steps, 2, 1);
      expect(eval1.activeTarget.stepOrder).toBe(1);
      expect(eval1.activeTarget.targetName).toBe("Elena Rostova");
      expect(eval1.shouldEscalateNow).toBe(false);

      // At 6 minutes elapsed: should be on step 2
      const eval2 = EscalationEngine.evaluate(steps, 6, 1);
      expect(eval2.activeTarget.stepOrder).toBe(2);
      expect(eval2.activeTarget.targetName).toBe("Marcus Vance");
      expect(eval2.shouldEscalateNow).toBe(true);

      // At 22 minutes elapsed: escalated to step 3
      const eval3 = EscalationEngine.evaluate(steps, 22, 2);
      expect(eval3.activeTarget.stepOrder).toBe(3);
      expect(eval3.activeTarget.targetName).toBe("Yusif Hajizada");
      expect(eval3.isMaxEscalationReached).toBe(true);
    });
  });
});
