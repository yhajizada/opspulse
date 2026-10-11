"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Radio,
  ExternalLink,
  UserCheck,
  Send,
  Video,
  Hash,
  Server,
  Layers,
  Flame,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function IncidentWarRoomPage() {
  const params = useParams();
  const id = params?.id as string;

  const [incident, setIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchIncident = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/incidents/${id}`);
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchIncident();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/v1/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          authorName: "Incident Commander",
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchIncident();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/v1/incidents/${id}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newNote,
          authorName: "Yusif Hajizada (Commander)",
          eventType: "NOTE",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewNote("");
        fetchIncident();
      } else {
        alert(data.error || "Failed to post note");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (isLoading || !incident) {
    return (
      <div className="p-12 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
        <p className="text-sm">Connecting to Incident War Room...</p>
      </div>
    );
  }

  const isResolved = incident.status === "RESOLVED";

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/incidents"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Incidents</span>
        </Link>
      </div>

      {/* War Room Header Banner */}
      <div className="p-6 rounded-2xl border border-rose-900/60 bg-[#0d121f] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <span
              className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full border ${
                incident.severity === "P1_CRITICAL"
                  ? "bg-rose-950 text-rose-400 border-rose-700 animate-pulse"
                  : "bg-amber-950 text-amber-400 border-amber-700"
              }`}
            >
              {incident.severity.replace("_", " ")}
            </span>

            <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700 font-mono">
              {incident.status}
            </span>

            <span className="text-xs text-slate-500 font-mono">{incident.id}</span>
          </div>

          {/* Quick Status Progression Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {incident.status === "TRIGGERED" && (
              <button
                onClick={() => handleUpdateStatus("ACKNOWLEDGED")}
                disabled={isUpdatingStatus}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition"
              >
                Acknowledge Incident
              </button>
            )}

            {incident.status === "ACKNOWLEDGED" && (
              <button
                onClick={() => handleUpdateStatus("INVESTIGATING")}
                disabled={isUpdatingStatus}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
              >
                Mark Investigating
              </button>
            )}

            {incident.status === "INVESTIGATING" && (
              <button
                onClick={() => handleUpdateStatus("IDENTIFIED")}
                disabled={isUpdatingStatus}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
              >
                Root Cause Identified
              </button>
            )}

            {!isResolved ? (
              <button
                onClick={() => handleUpdateStatus("RESOLVED")}
                disabled={isUpdatingStatus}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
              >
                Resolve Incident
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                Resolved in {incident.mttrMinutes || 24} mins
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {incident.title}
          </h1>
          {incident.description && (
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {incident.description}
            </p>
          )}
        </div>

        {/* Channels & Commander Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Service</p>
              <p className="font-semibold text-white">{incident.service?.name}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Commander</p>
              <p className="font-semibold text-white">
                {incident.commander?.name || "Yusif Hajizada"}
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-2">
            <Hash className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Slack War Room</p>
              <p className="font-mono text-emerald-300">{incident.slackChannel || "#war-room"}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-2">
            <Video className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Live Bridge</p>
              <a
                href={incident.zoomMeetingUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:underline truncate block"
              >
                Join Audio Call
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Timeline + Alerts Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Timeline Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c101c]/90 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                <span>Incident Timeline Stream</span>
              </h2>
              <span className="text-xs text-slate-500">
                {incident.timelineEvents?.length || 0} event entries
              </span>
            </div>

            {/* Post Note Form */}
            {!isResolved && (
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post live update, command note, or investigation findings..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>
            )}

            {/* Timeline Stream Entries */}
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
              {incident.timelineEvents?.map((event: any) => (
                <div key={event.id} className="relative pl-7 text-xs space-y-1">
                  <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-rose-500"></div>

                  <div className="flex items-center space-x-2 text-slate-400">
                    <span className="font-semibold text-white">{event.authorName}</span>
                    <span>•</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {event.eventType}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>

                  <p className="text-slate-200 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                    {event.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Linked Monitoring Alerts */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c101c]/90 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Clustered Inbound Alerts</span>
            </h3>

            <div className="space-y-3">
              {incident.alerts?.length === 0 ? (
                <p className="text-xs text-slate-500">No raw alerts linked.</p>
              ) : (
                incident.alerts?.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono text-[11px]">
                        {alert.source}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-slate-300 font-medium">{alert.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Fingerprint: {alert.fingerprint}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
