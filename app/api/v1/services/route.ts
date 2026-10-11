import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const services = await db.service.findMany({
      orderBy: { tier: "asc" },
      include: {
        upstreamDeps: { include: { targetService: { select: { id: true, name: true, status: true } } } },
        downstreamDeps: { include: { sourceService: { select: { id: true, name: true, status: true } } } },
        _count: {
          select: {
            incidents: true,
            alerts: { where: { status: "FIRING" } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, count: services.length, services });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch services" },
      { status: 500 }
    );
  }
}
