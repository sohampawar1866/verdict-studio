"use client";

import React from "react";
import {
  ShieldAlert,
  Database,
  Sparkles,
  Globe,
  Terminal,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface ThreatMatrixProps {
  stats?: {
    sqlBlocked?: number;
    promptInjectionsQuarantined?: number;
    ssrfBlocked?: number;
    unauthorizedToolsBlocked?: number;
  };
}

export default function ThreatMatrix({ stats }: ThreatMatrixProps) {
  const sqlCount = stats?.sqlBlocked ?? 42;
  const promptCount = stats?.promptInjectionsQuarantined ?? 29;
  const ssrfCount = stats?.ssrfBlocked ?? 17;
  const toolCount = stats?.unauthorizedToolsBlocked ?? 63;
  const totalPrevented = sqlCount + promptCount + ssrfCount + toolCount;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Haize Sentinel Security & Threat Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active real-time threat mitigation metrics across AST SQL, Prompt Injections, and Tool Governance
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{totalPrevented} Total Attacks Neutralized</span>
        </div>
      </div>

      {/* 4 Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SQL AST Guardrails */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">AST SQL Guardrails</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{sqlCount}</div>
          <p className="text-[11px] text-slate-400">
            Destructive queries (<code className="text-blue-300 font-mono">DROP</code>, <code className="text-blue-300 font-mono">DELETE</code>) blocked via <code className="text-slate-300">sqlparse</code>
          </p>
        </div>

        {/* Verdict Prompt Injection Quarantine */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Prompt Injections Quarantined</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{promptCount}</div>
          <p className="text-[11px] text-slate-400">
            Indirect prompt injections blocked by <code className="text-purple-300 font-mono">ChiefJustice</code> debate
          </p>
        </div>

        {/* SSRF & Domain Boundaries */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">SSRF & Domain Violations</span>
            <Globe className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{ssrfCount}</div>
          <p className="text-[11px] text-slate-400">
            Unapproved external hostnames blocked by key domain whitelist
          </p>
        </div>

        {/* Privileged Tool RBAC */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Privileged Tool Blocks</span>
            <Terminal className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{toolCount}</div>
          <p className="text-[11px] text-slate-400">
            Unauthorized <code className="text-red-300 font-mono">bash</code> & file deletion attempts intercepted
          </p>
        </div>
      </div>
    </div>
  );
}
