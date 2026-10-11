import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (severity && severity !== "ALL") where.severity = severity;

    const incidents = await db.incident.findMany({
      where,
      orderBy: { startedAt: "desc" },
      include: {
        service: { select: { id: true, name: true, slug: true, tier: true } },
        commander: { select: { id: true, name: true, email: true } },
        _count: { select: { timelineEvents: true, alerts: true } },
      },
    });

    return NextResponse.json({ success: true, count: incidents.length, incidents });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, severity, serviceId, commanderId } = body;

    if (!title || !serviceId) {
      return NextResponse.json(
        { success: false, error: "Title and serviceId are required" },
        { status: 400 }
      );
    }

    const org = await db.organization.findFirst();
    if (!org) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 500 }
      );
    }

    const incident = await db.incident.create({
      data: {
        title,
        description,
        severity: severity || "P2_MAJOR",
        status: "TRIGGERED",
        serviceId,
        commanderId: commanderId || null,
        organizationId: org.id,
        slackChannel: `#war-room-${Date.now().toString().slice(-4)}`,
        zoomMeetingUrl: `https://zoom.internal/j/auto-${Date.now().toString().slice(-6)}`,
      },
    });

    // Write initial timeline event
    await db.incidentTimelineEvent.create({
      data: {
        incidentId: incident.id,
        authorName: "System Automated",
        eventType: "STATUS_CHANGE",
        message: `Incident declared with severity ${incident.severity}. Paging active escalation policy.`,
      },
    });

    return NextResponse.json({ success: true, incident });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to declare incident" },
      { status: 500 }
    );
  }
}
