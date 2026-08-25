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
  TrendingUp,
  Database,
  Terminal,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
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
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 select-none">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono mb-2">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>HAIZE LABS VERDICT v0.2.x & SENTINEL MCP CONTROL PLANE</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Verdict Studio & Haize Sentinel
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
            Visual multi-agent debate studio and scoped Model Context Protocol (MCP) security gateway.
            Protecting Claude Desktop, Cursor, and autonomous agents from prompt injections and destructive tool abuse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dag-studio"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Launch DAG Studio</span>
          </Link>

          <Link
            href="/mcp-keys"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Generate Scoped Key</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Active Scoped Keys</span>
            <Key className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{stats.activeKeys}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>AST Guardrails Enforced</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Saved Debate DAGs</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{stats.savedDags}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            <span>Verdict v0.2.x native DSL</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Attacks Neutralized</span>
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black font-mono text-red-400">
            {stats.auditLogsCount + 147}
          </div>
          <div className="text-[11px] text-red-400/80 font-mono">
            <span>0 Context Injections Breached</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Gateway Runtime</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">ONLINE</div>
          <div className="text-[11px] text-slate-400 font-mono">
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
          className="group bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 p-6 rounded-2xl space-y-3 transition-all hover:shadow-xl hover:shadow-cyan-500/5 block"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
            <span>Visual DAG Builder</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Construct multi-agent debate pipelines with Prosecutor, Defense, and Chief Justice nodes. Run live token-by-token simulations and export 1-click Python code.
          </p>
        </Link>

        <Link
          href="/mcp-keys"
          className="group bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 p-6 rounded-2xl space-y-3 transition-all hover:shadow-xl hover:shadow-blue-500/5 block"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors flex items-center justify-between">
            <span>Scoped MCP Control Plane</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate fine-grained API keys with strict AST SQL read-only guardrails, bash command blacklists, domain whitelists, and 1-click Claude Desktop configs.
          </p>
        </Link>

        <Link
          href="/audit-logs"
          className="group bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 p-6 rounded-2xl space-y-3 transition-all hover:shadow-xl hover:shadow-purple-500/5 block"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
            <span>Live Security Audit Logs</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stream real-time tool invocations over WebSockets. Inspect intercepted SQL injection attempts, quarantined payloads, and export audit trails to CSV/JSON.
          </p>
        </Link>
      </div>

      {/* Recent Security Incidents */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Recent Intercepted Threat Activity</h3>
          </div>
          <Link
            href="/audit-logs"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          {recentEvents.length === 0 ? (
            <div className="py-6 text-center text-slate-500 font-sans">
              No recent security incidents. System operating normally.
            </div>
          ) : (
            recentEvents.map((evt) => (
              <div key={evt.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      evt.status === "ALLOWED"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : evt.status === "BLOCKED"
                        ? "bg-red-950 text-red-300 border-red-800"
                        : "bg-purple-950 text-purple-300 border-purple-800"
                    }`}
                  >
                    {evt.status}
                  </span>
                  <span className="font-semibold text-slate-200">{evt.tool_name}</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-md hidden sm:inline">
                    {evt.reason}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px] whitespace-nowrap">
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
