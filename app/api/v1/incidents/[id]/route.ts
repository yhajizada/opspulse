import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = await db.incident.findUnique({
      where: { id },
      include: {
        service: true,
        commander: true,
        timelineEvents: { orderBy: { timestamp: "desc" } },
        alerts: { orderBy: { firedAt: "desc" } },
        postMortem: { include: { actionItems: true } },
      },
    });

    if (!incident) {
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, incident });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, severity, commanderId, note, authorName } = body;

    const existing = await db.incident.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 }
      );
    }

    const updates: any = {};
    const now = new Date();

    if (severity && severity !== existing.severity) {
      updates.severity = severity;
    }

    if (commanderId && commanderId !== existing.commanderId) {
      updates.commanderId = commanderId;
    }

    if (status && status !== existing.status) {
      updates.status = status;

      if (status === "ACKNOWLEDGED" && !existing.acknowledgedAt) {
        updates.acknowledgedAt = now;
        const diffMins = Math.round((now.getTime() - existing.startedAt.getTime()) / (1000 * 60));
        updates.mttaMinutes = diffMins;
      }

      if (status === "RESOLVED" && !existing.resolvedAt) {
        updates.resolvedAt = now;
        const diffMins = Math.round((now.getTime() - existing.startedAt.getTime()) / (1000 * 60));
        updates.mttrMinutes = diffMins;
      }
    }

    const updated = await db.incident.update({
      where: { id },
      data: updates,
      include: { service: true, commander: true },
    });

    // Automatically append timeline event
    let eventMessage = "";
    if (status && status !== existing.status) {
      eventMessage = `Status changed from ${existing.status} to ${status}.`;
    } else if (severity && severity !== existing.severity) {
      eventMessage = `Severity escalated from ${existing.severity} to ${severity}.`;
    } else if (note) {
      eventMessage = note;
    } else {
      eventMessage = "Incident metadata updated.";
    }

    await db.incidentTimelineEvent.create({
      data: {
        incidentId: id,
        authorName: authorName || "Incident Commander",
        eventType: status ? "STATUS_CHANGE" : "NOTE",
        message: eventMessage,
      },
    });

    return NextResponse.json({ success: true, incident: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update incident" },
      { status: 500 }
    );
  }
}
