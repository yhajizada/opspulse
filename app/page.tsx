"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Server,
  PhoneCall,
  FileText,
  ShieldCheck,
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  Zap,
  Terminal,
  ExternalLink,
  Layers,
  Flame,
} from "lucide-react";

export default function HomePage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(0);
    setSimulationLogs(["[0.00s] Datadog Webhook Ingested: P99 latency > 6.2s on order-processing"]);

    setTimeout(() => {
      setActiveStep(1);
      setSimulationLogs((prev) => [
        ...prev,
        "[0.38s] AlertDeduplicationEngine: SHA-256 Fingerprint generated (dd_orders_lag_east). 42 firing bursts clustered.",
      ]);
    }, 800);

    setTimeout(() => {
      setActiveStep(2);
      setSimulationLogs((prev) => [
        ...prev,
        "[1.20s] Service Tier-1 Match: Declared INC-4091 (P1_CRITICAL). Auto-created Slack war room #war-room-inc-4091.",
      ]);
    }, 1800);

    setTimeout(() => {
      setActiveStep(3);
      setSimulationLogs((prev) => [
        ...prev,
        "[2.10s] Escalation Ladder Step 1: Paged Primary On-Call SRE Elena Rostova (+1-555-019-4820). Acknowledged.",
      ]);
      setIsSimulating(false);
    }, 2800);
  };

  const pillars = [
    {
      title: "Intelligent Alert Deduplication",
      icon: Layers,
      color: "border-blue-500/80 text-blue-400 bg-blue-950/20",
      description:
        "Normalizes ephemeral container IDs and cluster IPs using deterministic SHA-256 fingerprinting to eliminate alert fatigue.",
    },
    {
      title: "Multi-Tier Escalation Ladders",
      icon: PhoneCall,
      color: "border-amber-500/80 text-amber-400 bg-amber-950/20",
      description:
        "Guarantees response SLA by paging primary on-call, advancing to secondary SRE after 5 minutes, and escalating to directors.",
    },
    {
      title: "Live Incident War Room",
      icon: Flame,
      color: "border-rose-500/80 text-rose-400 bg-rose-950/20",
      description:
        "Dedicated command hub with structured timeline journaling, role assignments (IC, Ops, Comms), and customer impact banners.",
    },
    {
      title: "SLO Error Budget Governance",
      icon: Activity,
      color: "border-emerald-500/80 text-emerald-400 bg-emerald-950/20",
      description:
        "Continuous availability tracking against 99.95% SLO targets with real-time error budget burn rate calculations.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 bg-ops-grid pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs font-semibold mb-6 shadow-sm shadow-rose-900/20">
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <span>OpsPulse v1.0 Production Platform</span>
          <span className="text-rose-600">•</span>
          <span className="text-slate-300">Open-Source Incident Management</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Enterprise Incident Response,{" "}
          <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-indigo-400 bg-clip-text text-transparent">
            Built for Mission-Critical SRE
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Unify alert ingestion across Datadog, Prometheus, and Sentry. Auto-cluster alert floods,
          page on-call engineers via multi-tier escalation ladders, coordinate live war rooms,
          and automate Five Whys post-mortems.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/incidents"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-rose-600/25 transition transform hover:-translate-y-0.5"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Open Incident Command</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/services"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold transition"
          >
            <Server className="w-5 h-5 text-emerald-400" />
            <span>Service Catalog & SLOs</span>
          </Link>

          <a
            href="https://github.com/yhajizada/opspulse"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800 font-medium transition"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Interactive Live Triage Simulator Widget */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="rounded-2xl border border-slate-800 bg-[#0c101c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-rose-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
                <h3 className="text-base font-semibold text-white">
                  Live Outage Ingestion & Triage Simulator
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulating Datadog Alert Flood → Fingerprint Clustering → P1 Declaration → On-Call Paging
              </p>
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                isSimulating
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? "Simulating Outage..." : "Simulate Production Outage"}</span>
            </button>
          </div>

          {/* Interactive Steps Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
            <div
              className={`p-4 rounded-xl border transition-all duration-300 ${
                activeStep === 0
                  ? "border-rose-500 bg-rose-950/30 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500"
                  : activeStep > 0
                  ? "border-slate-800 bg-slate-900/60 opacity-80"
                  : "border-slate-800/80 bg-slate-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  ALERT INGESTION
                </span>
                {activeStep > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h4 className="text-sm font-semibold text-white">Datadog Webhook</h4>
              <p className="text-xs text-slate-400 mt-1">Order Processing P99 spike</p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all duration-300 ${
                activeStep === 1
                  ? "border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500"
                  : activeStep > 1
                  ? "border-slate-800 bg-slate-900/60 opacity-80"
                  : "border-slate-800/80 bg-slate-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  DE-DUPLICATION
                </span>
                {activeStep > 1 && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <h4 className="text-sm font-semibold text-white">SHA-256 Fingerprint</h4>
              <p className="text-xs text-slate-400 mt-1">42 alerts clustered to 1</p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all duration-300 ${
                activeStep === 2
                  ? "border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500"
                  : activeStep > 2
                  ? "border-slate-800 bg-slate-900/60 opacity-80"
                  : "border-slate-800/80 bg-slate-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  INCIDENT CREATED
                </span>
                {activeStep > 2 && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <h4 className="text-sm font-semibold text-white">INC-4091 (P1)</h4>
              <p className="text-xs text-slate-400 mt-1">Slack #war-room created</p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all duration-300 ${
                activeStep === 3
                  ? "border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500"
                  : "border-slate-800/80 bg-slate-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  ON-CALL PAGED
                </span>
                {activeStep === 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h4 className="text-sm font-semibold text-white">Elena Rostova</h4>
              <p className="text-xs text-emerald-300/80 mt-1">Acknowledged in 4 mins</p>
            </div>
          </div>

          {/* Console Output */}
          <div className="rounded-lg bg-black/60 border border-slate-800 p-4 font-mono text-xs">
            <div className="flex items-center space-x-2 text-slate-500 mb-2 border-b border-slate-900 pb-2">
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              <span>SRE RELIABILITY TELEMETRY</span>
            </div>
            {simulationLogs.length === 0 ? (
              <p className="text-slate-600">Click &quot;Simulate Production Outage&quot; to test auto-triage...</p>
            ) : (
              <div className="space-y-1 text-slate-300">
                {simulationLogs.map((log, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-rose-400">❯</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Designed for 99.99% Reliability
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Everything production engineering teams need to survive major outages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-800 bg-[#0c101c]/60 hover:border-slate-700 transition"
              >
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${pillar.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{pillar.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Launch Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/incidents"
            className="p-6 rounded-xl border border-slate-800 bg-[#0c101c]/90 hover:border-rose-500/50 transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-rose-400 tracking-wider">
                Live Incidents
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-lg font-semibold text-white">Active War Rooms</h3>
            <p className="text-xs text-slate-400 mt-2">
              Inspect P1 and P2 outages, assign Incident Commanders, and update real-time timelines.
            </p>
          </Link>

          <Link
            href="/services"
            className="p-6 rounded-xl border border-slate-800 bg-[#0c101c]/90 hover:border-emerald-500/50 transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-emerald-400 tracking-wider">
                Service Catalog
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-lg font-semibold text-white">SLOs & Dependencies</h3>
            <p className="text-xs text-slate-400 mt-2">
              Track 99.99% availability targets, error budget burn rates, and upstream critical dependencies.
            </p>
          </Link>

          <Link
            href="/on-call"
            className="p-6 rounded-xl border border-slate-800 bg-[#0c101c]/90 hover:border-amber-500/50 transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-amber-400 tracking-wider">
                24x7 SRE Rotations
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-1" />
            </div>
            <h3 className="text-lg font-semibold text-white">On-Call Shifts</h3>
            <p className="text-xs text-slate-400 mt-2">
              View active primary and secondary engineers, rotation handovers, and escalation delay policies.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
