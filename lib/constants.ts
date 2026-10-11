export const APP_CONFIG = {
  name: "OpsPulse",
  tagline: "Enterprise Incident Response & Service Reliability Platform",
  version: "1.0.0",
  githubUrl: "https://github.com/yhajizada/opspulse",
};

export const SEVERITY_LEVELS = [
  {
    key: "P1_CRITICAL",
    label: "P1 - Critical Outage",
    color: "rose",
    description: "Customer-facing core revenue services unavailable or severe data integrity risk.",
  },
  {
    key: "P2_MAJOR",
    label: "P2 - Major Degradation",
    color: "amber",
    description: "Significant service impairment, partial failure, or critical redundant systems degraded.",
  },
  {
    key: "P3_MODERATE",
    label: "P3 - Moderate Issue",
    color: "blue",
    description: "Non-critical feature disruption with operational workaround available.",
  },
  {
    key: "P4_LOW",
    label: "P4 - Low / Minor",
    color: "slate",
    description: "Cosmetic defects, internal developer latency, or non-impacting telemetry alerts.",
  },
];

export const INCIDENT_STATUSES = [
  { key: "TRIGGERED", label: "Triggered", color: "rose" },
  { key: "ACKNOWLEDGED", label: "Acknowledged", color: "amber" },
  { key: "INVESTIGATING", label: "Investigating", color: "blue" },
  { key: "IDENTIFIED", label: "Identified", color: "indigo" },
  { key: "MONITORING", label: "Monitoring", color: "purple" },
  { key: "RESOLVED", label: "Resolved", color: "emerald" },
];
