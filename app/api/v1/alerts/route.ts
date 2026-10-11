import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AlertDeduplicationEngine, RawAlertPayload } from "@/lib/engine/alert-dedup";

export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      orderBy: { firedAt: "desc" },
      include: {
        service: { select: { id: true, name: true, slug: true } },
        incident: { select: { id: true, title: true, status: true, severity: true } },
      },
      take: 50,
    });

    return NextResponse.json({ success: true, count: alerts.length, alerts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: RawAlertPayload = await req.json();
    const { source, title, serviceSlug, severity, cluster, region } = body;

    if (!title || !serviceSlug) {
      return NextResponse.json(
        { success: false, error: "Title and serviceSlug are required" },
        { status: 400 }
      );
    }

    const service = await db.service.findUnique({
      where: { slug: serviceSlug },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: `Service with slug "${serviceSlug}" not found in catalog` },
        { status: 404 }
      );
    }

    const org = await db.organization.findFirst();
    const fingerprint = AlertDeduplicationEngine.generateFingerprint(body);

    // Check if there is an active incident for this service
    let activeIncident = await db.incident.findFirst({
      where: {
        serviceId: service.id,
        status: { in: ["TRIGGERED", "ACKNOWLEDGED", "INVESTIGATING", "IDENTIFIED", "MONITORING"] },
      },
    });

    let autoCreatedIncident = false;
    const suggestedSeverity = AlertDeduplicationEngine.mapSeverityToPriority(
      severity || "HIGH",
      service.tier as any
    );

    // If critical alert and no active incident, auto-declare incident!
    if (!activeIncident && (severity === "CRITICAL" || severity === "HIGH")) {
      activeIncident = await db.incident.create({
        data: {
          title: `[Auto-Declared] ${service.name}: ${title}`,
          description: `Automatically created by alert from ${source || "MONITORING"}. Cluster: ${cluster || "default"}, Region: ${region || "global"}.`,
          severity: suggestedSeverity,
          status: "TRIGGERED",
          serviceId: service.id,
          organizationId: org!.id,
          slackChannel: `#war-room-auto-${Date.now().toString().slice(-4)}`,
        },
      });

      autoCreatedIncident = true;

      // Log initial timeline event
      await db.incidentTimelineEvent.create({
        data: {
          incidentId: activeIncident.id,
          authorName: `${source || "System"} Alert Gateway`,
          eventType: "ALERT_LINKED",
          message: `Inbound alert "${title}" triggered automated P1/P2 incident creation.`,
        },
      });
    }

    // Ingest the alert record
    const alertRecord = await db.alert.create({
      data: {
        source: source || "CUSTOM_WEBHOOK",
        title,
        fingerprint,
        severity: severity || "HIGH",
        status: "FIRING",
        rawPayloadJson: JSON.stringify(body),
        serviceId: service.id,
        incidentId: activeIncident ? activeIncident.id : null,
      },
    });

    return NextResponse.json({
      success: true,
      alert: alertRecord,
      fingerprint,
      linkedIncidentId: activeIncident?.id || null,
      autoCreatedIncident,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to ingest alert" },
      { status: 500 }
    );
  }
}
