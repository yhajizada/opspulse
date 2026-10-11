"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Filter,
  RefreshCw,
  Server,
  User,
  ArrowRight,
  Flame,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface IncidentItem {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  startedAt: string;
  mttaMinutes?: number;
  mttrMinutes?: number;
  service: { id: string; name: string; tier: string };
  commander?: { id: string; name: string; email: string };
  _count: { timelineEvents: number; alerts: number };
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  // Declare Incident Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newServiceId, setNewServiceId] = useState("");
  const [newSeverity, setNewSeverity] = useState("P1_CRITICAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const url = `/api/v1/incidents?status=${statusFilter}&severity=${severityFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/v1/services");
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
        if (data.services.length > 0 && !newServiceId) {
          setNewServiceId(data.services[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchServices();
  }, [statusFilter, severityFilter]);

  const handleDeclareIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newServiceId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          severity: newSeverity,
          serviceId: newServiceId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        fetchIncidents();
      } else {
        alert(data.error || "Failed to declare incident");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "P1_CRITICAL":
        return "bg-rose-950/80 text-rose-400 border-rose-800/80 animate-pulse";
      case "P2_MAJOR":
        return "bg-amber-950/80 text-amber-400 border-amber-800/80";
      case "P3_MODERATE":
        return "bg-blue-950/80 text-blue-400 border-blue-800/80";
      default:
        return "bg-slate-900 text-slate-400 border-slate-700";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TRIGGERED":
        return "bg-rose-950 text-rose-400 border-rose-800";
      case "INVESTIGATING":
        return "bg-amber-950 text-amber-300 border-amber-800";
      case "IDENTIFIED":
      case "MONITORING":
        return "bg-indigo-950 text-indigo-300 border-indigo-800";
      case "RESOLVED":
        return "bg-emerald-950 text-emerald-400 border-emerald-800";
      default:
        return "bg-slate-900 text-slate-300 border-slate-700";
    }
  };

  const activeCount = incidents.filter((i) => i.status !== "RESOLVED").length;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Incident Command Center
            {activeCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800 font-mono animate-pulse">
                {activeCount} Active Outage{activeCount > 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time incident response coordination, escalation tracking, and war room bridge.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchIncidents}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Declare Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0c101c]/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Active War Rooms</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeCount}</div>
          <p className="text-[11px] text-rose-400/80 mt-1">P1 & P2 outages underway</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#0c101c]/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Mean Time to Acknowledge</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">3.5 mins</div>
          <p className="text-[11px] text-emerald-400 mt-1">Target &lt; 5m (Exceeding SLA)</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#0c101c]/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Mean Time to Resolve</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">22.0 mins</div>
          <p className="text-[11px] text-slate-400 mt-1">P90 resolution under 30 mins</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#0c101c]/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Overall Availability</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">99.96%</div>
          <p className="text-[11px] text-emerald-400 mt-1">Error budget healthy</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0c101c]/60">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="TRIGGERED">Triggered</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="IDENTIFIED">Identified</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Severities</option>
              <option value="P1_CRITICAL">P1 - Critical</option>
              <option value="P2_MAJOR">P2 - Major</option>
              <option value="P3_MODERATE">P3 - Moderate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.length === 0 ? (
          <div className="p-12 rounded-xl border border-slate-800 bg-[#0c101c]/50 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-semibold text-white">No Incidents Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              All infrastructure services are operating within normal parameters.
            </p>
          </div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc.id}
              className={`p-6 rounded-xl border bg-[#0c101c]/90 transition hover:border-slate-700 flex flex-col justify-between gap-4 ${
                inc.status !== "RESOLVED"
                  ? "border-rose-900/60 shadow-lg shadow-rose-950/20"
                  : "border-slate-800/80"
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getSeverityBadge(
                        inc.severity
                      )}`}
                    >
                      {inc.severity.replace("_", " ")}
                    </span>

                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                        inc.status
                      )}`}
                    >
                      {inc.status}
                    </span>

                    <span className="text-xs text-slate-500 font-mono">
                      {inc.id.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500">
                    Started {formatRelativeTime(inc.startedAt)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white hover:text-rose-400 transition">
                  <Link href={`/incidents/${inc.id}`}>{inc.title}</Link>
                </h3>

                {inc.description && (
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {inc.description}
                  </p>
                )}
              </div>

              {/* Metadata Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{inc.service.name}</span>
                    <span className="text-[10px] text-slate-500">({inc.service.tier})</span>
                  </span>

                  {inc.commander && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>IC: {inc.commander.name}</span>
                    </span>
                  )}

                  <span>{inc._count.timelineEvents} updates</span>
                  <span>{inc._count.alerts} alerts</span>
                </div>

                <Link
                  href={`/incidents/${inc.id}`}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  <span>Open War Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Declare Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Declare Incident</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeclareIncident} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment Gateway API: Elevated 504 timeouts on checkout"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Impacted Service *
                </label>
                <select
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} ({svc.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Severity Level *
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="P1_CRITICAL">P1 - Critical Outage (Customer facing down)</option>
                  <option value="P2_MAJOR">P2 - Major Degradation (Redundant system degraded)</option>
                  <option value="P3_MODERATE">P3 - Moderate Issue (Workaround available)</option>
                  <option value="P4_LOW">P4 - Low / Minor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description / Observed Symptoms
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed context, error logs, and initial impact..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/20"
                >
                  {isSubmitting ? "Declaring..." : "Declare & Page On-Call"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
