"use client";

import React from "react";
import {
  ShieldAlert,
  Database,
  Sparkles,
  Globe,
  Terminal,
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
    <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4a154b]/30 pb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-[#4a154b] flex items-center justify-center text-white shadow-sm border border-[#d9bdde]/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span>Haize Sentinel Security & Threat Matrix</span>
          </h2>
          <p className="text-xs text-[#d9bdde]/80 mt-1">
            Active real-time threat mitigation metrics across AST SQL, Prompt Injections, and Tool Governance
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#007a5a]/20 border border-[#007a5a]/40 text-[#2ecc71] text-xs font-mono font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{totalPrevented} Total Attacks Neutralized</span>
        </div>
      </div>

      {/* 4 Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* SQL AST Guardrails */}
        <div className="p-5 rounded-2xl bg-[#1e0a20] border border-[#4a154b]/40 space-y-2 relative overflow-hidden group hover:border-[#1264a3]/60 transition-all">
          <div className="flex items-center justify-between text-xs text-[#d9bdde]">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">AST SQL Guardrails</span>
            <Database className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-white font-sans">{sqlCount}</div>
          <p className="text-[11px] text-[#d9bdde]/70 leading-normal">
            Destructive queries (<code className="text-[#38bdf8] font-mono">DROP</code>, <code className="text-[#38bdf8] font-mono">DELETE</code>) blocked via <code className="text-slate-300">sqlparse</code>
          </p>
        </div>

        {/* Verdict Prompt Injection Quarantine */}
        <div className="p-5 rounded-2xl bg-[#1e0a20] border border-[#4a154b]/40 space-y-2 relative overflow-hidden group hover:border-[#a855f7]/60 transition-all">
          <div className="flex items-center justify-between text-xs text-[#d9bdde]">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Prompt Injections Quarantined</span>
            <Sparkles className="w-4 h-4 text-[#c084fc]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-white font-sans">{promptCount}</div>
          <p className="text-[11px] text-[#d9bdde]/70 leading-normal">
            Indirect prompt injections blocked by <code className="text-[#c084fc] font-mono">ChiefJustice</code> debate
          </p>
        </div>

        {/* SSRF & Domain Boundaries */}
        <div className="p-5 rounded-2xl bg-[#1e0a20] border border-[#4a154b]/40 space-y-2 relative overflow-hidden group hover:border-[#1264a3]/60 transition-all">
          <div className="flex items-center justify-between text-xs text-[#d9bdde]">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">SSRF & Domain Boundaries</span>
            <Globe className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-white font-sans">{ssrfCount}</div>
          <p className="text-[11px] text-[#d9bdde]/70 leading-normal">
            Unapproved external hostnames blocked by key domain whitelist
          </p>
        </div>

        {/* Privileged Tool RBAC */}
        <div className="p-5 rounded-2xl bg-[#1e0a20] border border-[#4a154b]/40 space-y-2 relative overflow-hidden group hover:border-[#cc4117]/60 transition-all">
          <div className="flex items-center justify-between text-xs text-[#d9bdde]">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Privileged Tool Blocks</span>
            <Terminal className="w-4 h-4 text-[#ff8e75]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-white font-sans">{toolCount}</div>
          <p className="text-[11px] text-[#d9bdde]/70 leading-normal">
            Unauthorized <code className="text-[#ff8e75] font-mono">bash</code> & file deletion attempts intercepted
          </p>
        </div>
      </div>
    </div>
  );
}
