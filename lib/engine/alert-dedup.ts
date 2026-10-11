import crypto from "crypto";

export interface RawAlertPayload {
  source: "DATADOG" | "PROMETHEUS" | "SENTRY" | "CLOUDWATCH" | "CUSTOM_WEBHOOK";
  title: string;
  serviceSlug: string;
  severity: "CRITICAL" | "HIGH" | "WARNING" | "INFO";
  cluster?: string;
  region?: string;
  tags?: Record<string, string>;
  details?: Record<string, any>;
}

export interface DeduplicationResult {
  fingerprint: string;
  isDuplicate: boolean;
  normalizedTitle: string;
  suggestedSeverity: "P1_CRITICAL" | "P2_MAJOR" | "P3_MODERATE" | "P4_LOW";
}

export class AlertDeduplicationEngine {
  /**
   * Generates a deterministic SHA-256 fingerprint for grouping related alerts.
   */
  public static generateFingerprint(payload: RawAlertPayload): string {
    // Normalize title by removing ephemeral timestamps, IP addresses, UUIDs, and dynamic pod names
    const normalizedTitle = payload.title
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ":id")
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, ":ip")
      .replace(/\bpod-[a-z0-9\-_]+\b/gi, ":pod")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const cluster = payload.cluster || "default";
    const region = payload.region || "global";
    const rawSignature = `${payload.source}|${payload.serviceSlug}|${normalizedTitle}|${cluster}|${region}`;

    return crypto.createHash("sha256").update(rawSignature).digest("hex").slice(0, 24);
  }

  /**
   * Evaluates alert severity into incident priority.
   */
  public static mapSeverityToPriority(
    severity: RawAlertPayload["severity"],
    serviceTier: "TIER_1" | "TIER_2" | "TIER_3" = "TIER_1"
  ): "P1_CRITICAL" | "P2_MAJOR" | "P3_MODERATE" | "P4_LOW" {
    if (severity === "CRITICAL" && serviceTier === "TIER_1") {
      return "P1_CRITICAL";
    }
    if (severity === "CRITICAL" || (severity === "HIGH" && serviceTier === "TIER_1")) {
      return "P2_MAJOR";
    }
    if (severity === "HIGH" || severity === "WARNING") {
      return "P3_MODERATE";
    }
    return "P4_LOW";
  }

  /**
   * Ingests and processes incoming alert payload.
   */
  public static processAlert(payload: RawAlertPayload, knownFingerprints: Set<string>): DeduplicationResult {
    const fingerprint = this.generateFingerprint(payload);
    const isDuplicate = knownFingerprints.has(fingerprint);
    const suggestedSeverity = this.mapSeverityToPriority(payload.severity);

    return {
      fingerprint,
      isDuplicate,
      normalizedTitle: payload.title,
      suggestedSeverity,
    };
  }
}
