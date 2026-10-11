import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { message, authorName, eventType } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const event = await db.incidentTimelineEvent.create({
      data: {
        incidentId: id,
        authorName: authorName || "Incident Responder",
        eventType: eventType || "NOTE",
        message,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add timeline event" },
      { status: 500 }
    );
  }
}
