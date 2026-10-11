import React from "react";
import { db } from "@/lib/db";
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  Github,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await db.service.findMany({
    orderBy: { tier: "asc" },
    include: {
      upstreamDeps: { include: { targetService: true } },
      downstreamDeps: { include: { sourceService: true } },
      _count: {
        select: {
          incidents: { where: { status: { not: "RESOLVED" } } },
          alerts: { where: { status: "FIRING" } },
        },
      },
    },
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Service Catalog &amp; SLO Governance
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
              Topology
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Service tier classification, SLO availability targets, error budget burn rates, and dependency topology.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((svc) => {
          const isHealthy = svc.status === "OPERATIONAL";
          const hasActiveIncidents = svc._count.incidents > 0;

          return (
            <div
              key={svc.id}
              className={`p-6 rounded-2xl border bg-[#0c101c]/90 space-y-5 transition ${
                hasActiveIncidents
                  ? "border-amber-500/50 shadow-xl shadow-amber-950/20"
                  : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                      isHealthy
                        ? "border-emerald-800 bg-emerald-950/40 text-emerald-400"
                        : "border-amber-800 bg-amber-950/40 text-amber-400"
                    }`}
                  >
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{svc.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{svc.slug}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {svc.tier}
                  </span>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      isHealthy
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : "bg-amber-950 text-amber-400 border-amber-800 animate-pulse"
                    }`}
                  >
                    {svc.status}
                  </span>
                </div>
              </div>

              {svc.description && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  {svc.description}
                </p>
              )}

              {/* SLO & Error Budget Meter */}
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">SLO Target:</span>
                  <span className="font-bold text-white font-mono">
                    {svc.sloTargetPercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Error Budget Remaining:</span>
                  <span
                    className={`font-bold font-mono ${
                      svc.errorBudgetPercent > 50 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {svc.errorBudgetPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      svc.errorBudgetPercent > 50 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${svc.errorBudgetPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Dependencies */}
              <div className="text-xs space-y-2 pt-2 border-t border-slate-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Critical Dependencies
                </p>
                {svc.upstreamDeps.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No upstream dependencies configured.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {svc.upstreamDeps.map((dep) => (
                      <span
                        key={dep.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                      >
                        <GitBranch className="w-3 h-3 text-cyan-400" />
                        <span>{dep.targetService.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
