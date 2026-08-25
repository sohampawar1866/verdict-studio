"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  Shield,
  Key,
  ShieldAlert,
  GitBranch,
  Terminal,
  ArrowRight,
  CheckCircle,
  Zap,
  Activity,
  Cpu,
  Flame,
} from "lucide-react";

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState({
    activeKeys: 0,
    auditLogsCount: 0,
    wsSubscribers: 0,
    serverStatus: "checking",
  });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/health", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setMetrics({
            activeKeys: data.active_keys || 0,
            auditLogsCount: data.audit_logs_count || 0,
            wsSubscribers: data.ws_subscribers || 0,
            serverStatus: "online",
          });
        } else {
          setMetrics((m) => ({ ...m, serverStatus: "error" }));
        }
      } catch {
        setMetrics((m) => ({ ...m, serverStatus: "offline" }));
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>HAIZE SENTINEL ACTIVE • TEST-TIME AGENT GOVERNANCE</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Verdict Studio & Scoped MCP Control Plane
          </h1>
          <p className="text-sm lg:text-base text-slate-400 leading-relaxed">
            Visually compose multi-agent debate pipelines on top of{" "}
            <span className="text-cyan-400 font-mono">haizelabs/verdict</span> and protect agents (Claude Desktop, Devin, Cursor) with scoped MCP keys, AST SQL guardrails, and real-time debate firewalls.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/dag-studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <GitBranch className="w-4 h-4" />
              <span>Launch DAG Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/mcp-keys"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs transition-colors"
            >
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Generate Scoped MCP Key</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live System Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Gateway Core</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics.serverStatus === "online" ? "Active" : "Offline"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                metrics.serverStatus === "online" ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-mono">FastAPI :8000</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Scoped MCP Keys</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.activeKeys}</span>
            <span className="text-xs text-slate-400">active</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">SHA-256 Hashed</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tool Invocations</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.auditLogsCount}</span>
            <span className="text-xs text-slate-400">intercepted</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Audit Telemetry</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Live Subscribers</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.wsSubscribers}</span>
            <span className="text-xs text-slate-400">clients</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">/ws/telemetry</p>
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">Visual Compound Evaluation Studio</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drag-and-drop sub-judges (Prosecutor, Defense, FactChecker, Chief Justice) on an interactive canvas.
            Test debate architectures and export 1-click native Python code for <code className="text-cyan-300 font-mono">haizelabs/verdict</code>.
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Token-by-token streaming debate viewer</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ensemble verification & majority voting poolers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Typed Schema handles & connection validation</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">Haize Sentinel MCP Security Gateway</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Control which agents can invoke database queries, bash terminals, or web requests. Protect your production systems with AST SQL parsers and inline Verdict safety debates.
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>AST Read-Only SQL Guardrails (blocks DROP/DELETE/ALTER)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inline Verdict safety debate on unverified tool returns</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>1-Click Claude Desktop & Cursor config snippets</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
