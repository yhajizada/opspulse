import React from "react";
import { db } from "@/lib/db";
import {
  FileText,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldCheck,
  ListOrdered,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostMortemsPage() {
  const postMortems = await db.postMortem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      incident: { include: { service: true } },
      actionItems: { include: { assignee: true } },
    },
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Post-Mortems &amp; Retrospectives
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800 font-mono">
              Five Whys
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Blameless root-cause analysis, chronological failure chains, and preventative action items.
          </p>
        </div>
      </div>

      {/* Post-Mortem Cards */}
      <div className="space-y-6">
        {postMortems.map((pm) => {
          const fiveWhys: string[] = pm.fiveWhysJson ? JSON.parse(pm.fiveWhysJson) : [];

          return (
            <div
              key={pm.id}
              className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#0c101c]/90 space-y-6 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {pm.status}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {pm.incident.id.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{pm.incident.title}</h2>
                </div>

                <div className="text-xs text-slate-500">
                  Published {formatRelativeTime(pm.createdAt)}
                </div>
              </div>

              {/* Summary & Root Cause */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Incident Summary
                  </p>
                  <p className="text-slate-300 leading-relaxed">{pm.summary}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Root Cause
                  </p>
                  <p className="text-slate-300 leading-relaxed">{pm.rootCause}</p>
                </div>
              </div>

              {/* Five Whys Breakdown */}
              {fiveWhys.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4" />
                    <span>The Five Whys Investigation</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    {fiveWhys.map((why, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/60 flex items-start space-x-3"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-slate-200 leading-relaxed">{why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items Tracker */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Preventative Action Items ({pm.actionItems.length})
                </h3>

                <div className="space-y-2">
                  {pm.actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.status === "DONE" ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        ></span>
                        <span className="font-medium text-white">{item.title}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                        <span>Assignee: {item.assignee?.name || "Unassigned"}</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            item.status === "DONE"
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
