export interface SLOCalculationParams {
  sloTargetPercent: number; // e.g. 99.95
  periodDays?: number; // default 30
  outageMinutesInPeriod: number;
}

export interface SLOMetricsResult {
  sloTargetPercent: number;
  currentAvailabilityPercent: number;
  totalPeriodMinutes: number;
  allowedDowntimeMinutes: number;
  consumedDowntimeMinutes: number;
  remainingBudgetMinutes: number;
  errorBudgetRemainingPercent: number;
  burnRate: number;
  status: "HEALTHY" | "WARNING" | "EXHAUSTED";
}

export class SLOCalculator {
  public static calculate(params: SLOCalculationParams): SLOMetricsResult {
    const periodDays = params.periodDays || 30;
    const totalPeriodMinutes = periodDays * 24 * 60; // 43,200 mins for 30d

    const allowedDowntimeFraction = (100 - params.sloTargetPercent) / 100;
    const allowedDowntimeMinutes = Number((totalPeriodMinutes * allowedDowntimeFraction).toFixed(2));

    const consumedDowntimeMinutes = Math.max(0, params.outageMinutesInPeriod);
    const uptimeMinutes = Math.max(0, totalPeriodMinutes - consumedDowntimeMinutes);
    const currentAvailabilityPercent = Number(((uptimeMinutes / totalPeriodMinutes) * 100).toFixed(3));

    const remainingBudgetMinutes = Math.max(0, Number((allowedDowntimeMinutes - consumedDowntimeMinutes).toFixed(2)));

    const errorBudgetRemainingPercent =
      allowedDowntimeMinutes > 0
        ? Math.max(0, Number(((remainingBudgetMinutes / allowedDowntimeMinutes) * 100).toFixed(1)))
        : 100;

    // Daily average budget burn rate
    const dailyAllowed = allowedDowntimeMinutes / periodDays;
    const burnRate =
      dailyAllowed > 0 ? Number((consumedDowntimeMinutes / dailyAllowed).toFixed(2)) : 0;

    let status: "HEALTHY" | "WARNING" | "EXHAUSTED" = "HEALTHY";
    if (errorBudgetRemainingPercent <= 0) {
      status = "EXHAUSTED";
    } else if (errorBudgetRemainingPercent < 20) {
      status = "WARNING";
    }

    return {
      sloTargetPercent: params.sloTargetPercent,
      currentAvailabilityPercent,
      totalPeriodMinutes,
      allowedDowntimeMinutes,
      consumedDowntimeMinutes,
      remainingBudgetMinutes,
      errorBudgetRemainingPercent,
      burnRate,
      status,
    };
  }
}
