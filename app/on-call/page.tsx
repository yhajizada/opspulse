import React from "react";
import { db } from "@/lib/db";
import {
  PhoneCall,
  User,
  Clock,
  ShieldCheck,
  ArrowRight,
  Layers,
  Calendar,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OnCallPage() {
  const now = new Date();

  const [schedules, activeShifts, escalationPolicies] = await Promise.all([
    db.onCallSchedule.findMany({
      include: {
        shifts: {
          include: { user: true },
          orderBy: { startDate: "asc" },
        },
      },
    }),
    db.onCallShift.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { user: true, schedule: true },
    }),
    db.escalationPolicy.findMany({
      include: {
        steps: {
          include: { targetUser: true },
          orderBy: { stepOrder: "asc" },
        },
      },
    }),
  ]);

  const primaryShift = activeShifts.find((s) => s.role === "PRIMARY");
  const secondaryShift = activeShifts.find((s) => s.role === "SECONDARY");

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            On-Call Rotations &amp; Escalations
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800 font-mono">
              24x7 Paging
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Active primary responders, shift handover schedules, and automated escalation ladder timeouts.
          </p>
        </div>
      </div>

      {/* Currently On-Call Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-rose-900/60 bg-[#0d121f] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 animate-pulse">
              Primary On-Call
            </span>
            <span className="text-xs text-slate-500 font-mono">SLA: 5m Response</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-600/30">
              {primaryShift?.user.name ? primaryShift.user.name[0] : "E"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {primaryShift?.user.name || "Elena Rostova"}
              </h3>
              <p className="text-xs text-rose-400/90 font-medium">Senior SRE Engineer</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{primaryShift?.user.email || "elena.sre@nexus.cloud"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{primaryShift?.user.phone || "+1 (555) 019-4820"}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d121f] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
              Secondary On-Call
            </span>
            <span className="text-xs text-slate-500 font-mono">SLA: 15m Response</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
              {secondaryShift?.user.name ? secondaryShift.user.name[0] : "M"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {secondaryShift?.user.name || "Marcus Vance"}
              </h3>
              <p className="text-xs text-indigo-400/90 font-medium">Core Infrastructure Lead</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{secondaryShift?.user.email || "marcus.v@nexus.cloud"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{secondaryShift?.user.phone || "+1 (555) 019-7711"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Policies Ladder */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Configured Escalation Ladders</h2>

        {escalationPolicies.map((policy) => (
          <div
            key={policy.id}
            className="p-6 rounded-2xl border border-slate-800 bg-[#0c101c]/90 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{policy.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{policy.description}</p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                Repeats {policy.repeatCount} times
              </span>
            </div>

            {/* Visual Steps Ladder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {policy.steps.map((step) => (
                <div
                  key={step.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-slate-800">
                      Step {step.stepOrder}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {step.delayMinutes === 0 ? "Immediate Page" : `After ${step.delayMinutes} mins`}
                    </span>
                  </div>

                  <p className="font-semibold text-white mt-1">
                    {step.targetUser?.name || "On-Call Shift"}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {step.targetUser?.role?.replace("_", " ") || "Assigned SRE"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
