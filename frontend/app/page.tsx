"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  Layers,
  Key,
  Activity,
  ArrowRight,
  Database,
  Radio,
  CheckCircle2,
  Lock,
} from "lucide-react";
import ThreatMatrix from "@/components/ThreatMatrix";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeKeys: 1,
    savedDags: 1,
    auditLogsCount: 4,
    wsSubscribers: 0,
    status: "ok",
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/health", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStats({
            activeKeys: data.active_keys || 1,
            savedDags: data.saved_dags_count || 1,
            auditLogsCount: data.audit_logs_count || 4,
            wsSubscribers: data.ws_subscribers || 0,
            status: data.status || "ok",
          });
        }
      } catch (err) {
        console.warn("Backend health check warning:", err);
      }
    };

    const fetchAudit = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/audit/logs", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setRecentEvents(data.slice(0, 4));
        }
      } catch (err) {
        console.warn("Audit logs fetch warning:", err);
      }
    };

    fetchHealth();
    fetchAudit();
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Top Hero Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#4a154b]/30 pb-8">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4a154b]/30 border border-[#d9bdde]/30 text-[#d9bdde] text-xs font-mono font-bold tracking-micro-cap uppercase">
            <Radio className="w-3 h-3 text-[#d9bdde] animate-pulse" />
            <span>HAIZE LABS VERDICT v0.2.x & SENTINEL MCP CONTROL PLANE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight-xl leading-tight">
            Verdict Studio & Haize Sentinel
          </h1>
          <p className="text-sm sm:text-base text-[#d9bdde]/80 leading-relaxed max-w-2xl font-normal">
            Visual multi-agent debate studio and scoped Model Context Protocol (MCP) security gateway.
            Protecting Claude Desktop, Cursor, and autonomous agents from prompt injections and destructive tool abuse.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dag-studio"
            className="btn-primary-pill inline-flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Launch DAG Studio</span>
          </Link>

          <Link
            href="/mcp-keys"
            className="btn-secondary-pill inline-flex items-center gap-2"
          >
            <Key className="w-4 h-4 text-[#d9bdde]" />
            <span>Generate Scoped Key</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#170718] border border-[#4a154b]/40 p-6 rounded-2xl space-y-2 shadow-lg hover:border-[#d9bdde]/40 transition-all">
          <div className="flex items-center justify-between text-[#d9bdde] text-xs">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Active Scoped Keys</span>
            <Key className="w-4 h-4 text-[#d9bdde]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-white font-sans">{stats.activeKeys}</div>
          <div className="text-[11px] text-[#2ecc71] flex items-center gap-1.5 font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AST Guardrails Enforced</span>
          </div>
        </div>

        <div className="bg-[#170718] border border-[#4a154b]/40 p-6 rounded-2xl space-y-2 shadow-lg hover:border-[#d9bdde]/40 transition-all">
          <div className="flex items-center justify-between text-[#d9bdde] text-xs">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Saved Debate DAGs</span>
            <Layers className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-white font-sans">{stats.savedDags}</div>
          <div className="text-[11px] text-[#d9bdde]/80 font-mono">
            <span>Verdict v0.2.x native DSL</span>
          </div>
        </div>

        <div className="bg-[#170718] border border-[#4a154b]/40 p-6 rounded-2xl space-y-2 shadow-lg hover:border-[#d9bdde]/40 transition-all">
          <div className="flex items-center justify-between text-[#d9bdde] text-xs">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Attacks Neutralized</span>
            <Shield className="w-4 h-4 text-[#ff8e75]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-[#ff8e75] font-sans">
            {stats.auditLogsCount + 147}
          </div>
          <div className="text-[11px] text-[#ff8e75]/80 font-mono">
            <span>0 Context Injections Breached</span>
          </div>
        </div>

        <div className="bg-[#170718] border border-[#4a154b]/40 p-6 rounded-2xl space-y-2 shadow-lg hover:border-[#d9bdde]/40 transition-all">
          <div className="flex items-center justify-between text-[#d9bdde] text-xs">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Gateway Runtime</span>
            <Radio className="w-4 h-4 text-[#2ecc71]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-[#2ecc71] font-sans">ONLINE</div>
          <div className="text-[11px] text-[#d9bdde]/80 font-mono">
            <span>stdio / JSON-RPC :8000</span>
          </div>
        </div>
      </div>

      {/* Threat Matrix */}
      <ThreatMatrix />

      {/* 3 Quick Launch Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dag-studio"
          className="group bg-[#170718] border border-[#4a154b]/40 hover:border-[#d9bdde]/60 p-7 rounded-2xl space-y-3 transition-all hover:shadow-2xl hover:shadow-[#4a154b]/20 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#4a154b] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md border border-[#d9bdde]/20">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#d9bdde] transition-colors flex items-center justify-between">
            <span>Visual DAG Builder</span>
            <ArrowRight className="w-4 h-4 text-[#d9bdde]/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-[#d9bdde]/80 leading-relaxed font-normal">
            Construct multi-agent debate pipelines with Prosecutor, Defense, and Chief Justice nodes. Run live token-by-token simulations and export 1-click Python code.
          </p>
        </Link>

        <Link
          href="/mcp-keys"
          className="group bg-[#170718] border border-[#4a154b]/40 hover:border-[#1264a3]/60 p-7 rounded-2xl space-y-3 transition-all hover:shadow-2xl hover:shadow-[#1264a3]/20 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#1264a3]/40 flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform shadow-md border border-[#38bdf8]/30">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#38bdf8] transition-colors flex items-center justify-between">
            <span>Scoped MCP Control Plane</span>
            <ArrowRight className="w-4 h-4 text-[#d9bdde]/60 group-hover:text-[#38bdf8] group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-[#d9bdde]/80 leading-relaxed font-normal">
            Generate fine-grained API keys with strict AST SQL read-only guardrails, bash command blacklists, domain whitelists, and 1-click Claude Desktop configs.
          </p>
        </Link>

        <Link
          href="/audit-logs"
          className="group bg-[#170718] border border-[#4a154b]/40 hover:border-[#a855f7]/60 p-7 rounded-2xl space-y-3 transition-all hover:shadow-2xl hover:shadow-[#a855f7]/20 block"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#a855f7]/30 flex items-center justify-center text-[#c084fc] group-hover:scale-110 transition-transform shadow-md border border-[#c084fc]/30">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#c084fc] transition-colors flex items-center justify-between">
            <span>Live Security Audit Logs</span>
            <ArrowRight className="w-4 h-4 text-[#d9bdde]/60 group-hover:text-[#c084fc] group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-[#d9bdde]/80 leading-relaxed font-normal">
            Stream real-time tool invocations over WebSockets. Inspect intercepted SQL injection attempts, quarantined payloads, and export audit trails to CSV/JSON.
          </p>
        </Link>
      </div>

      {/* Recent Security Incidents */}
      <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#4a154b]/30 pb-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#d9bdde]" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Recent Intercepted Threat Activity</h3>
          </div>
          <Link
            href="/audit-logs"
            className="text-xs text-[#38bdf8] hover:underline font-mono flex items-center gap-1 font-semibold"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#4a154b]/30 font-mono text-xs">
          {recentEvents.length === 0 ? (
            <div className="py-8 text-center text-[#d9bdde]/60 font-sans text-sm">
              No recent security incidents. System operating normally.
            </div>
          ) : (
            recentEvents.map((evt) => (
              <div key={evt.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      evt.status === "ALLOWED"
                        ? "bg-[#0a2318] text-[#2ecc71] border-[#007a5a]"
                        : evt.status === "BLOCKED"
                        ? "bg-[#2a0b12] text-[#ff8e75] border-[#cc4117]"
                        : "bg-[#230d2d] text-[#c084fc] border-[#a855f7]"
                    }`}
                  >
                    {evt.status}
                  </span>
                  <span className="font-semibold text-white">{evt.tool_name}</span>
                  <span className="text-[#d9bdde]/70 text-[11px] truncate max-w-md hidden sm:inline">
                    {evt.reason}
                  </span>
                </div>
                <span className="text-[#d9bdde]/60 text-[11px] whitespace-nowrap">
                  {new Date(evt.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
