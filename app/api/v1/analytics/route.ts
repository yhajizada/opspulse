import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      activeIncidentsCount,
      resolvedIncidentsCount,
      totalServices,
      degradedServicesCount,
      activeAlertsCount,
      incidentsBySeverity,
      recentIncidents,
      resolvedMetrics,
    ] = await Promise.all([
      db.incident.count({ where: { status: { not: "RESOLVED" } } }),
      db.incident.count({ where: { status: "RESOLVED" } }),
      db.service.count(),
      db.service.count({ where: { status: { not: "OPERATIONAL" } } }),
      db.alert.count({ where: { status: "FIRING" } }),
      db.incident.groupBy({
        by: ["severity"],
        _count: { id: true },
      }),
      db.incident.findMany({
        take: 6,
        orderBy: { startedAt: "desc" },
        include: {
          service: { select: { name: true, tier: true } },
          commander: { select: { name: true } },
        },
      }),
      db.incident.aggregate({
        where: { status: "RESOLVED" },
        _avg: {
          mttaMinutes: true,
          mttrMinutes: true,
        },
      }),
    ]);

    // Active On-Call shifts
    const now = new Date();
    const activeShifts = await db.onCallShift.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        schedule: { select: { name: true } },
      },
    });

    const mttaMinutes = Math.round(resolvedMetrics._avg.mttaMinutes || 3.5);
    const mttrMinutes = Math.round(resolvedMetrics._avg.mttrMinutes || 22.0);

    return NextResponse.json({
      success: true,
      metrics: {
        activeIncidentsCount,
        resolvedIncidentsCount,
        totalServices,
        degradedServicesCount,
        activeAlertsCount,
        mttaMinutes,
        mttrMinutes,
        overallSystemAvailability: 99.96,
      },
      incidentsBySeverity: incidentsBySeverity.map((s) => ({
        severity: s.severity,
        count: s._count.id,
      })),
      activeOnCall: activeShifts.map((s) => ({
        scheduleName: s.schedule.name,
        role: s.role,
        user: s.user,
      })),
      recentIncidents,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
