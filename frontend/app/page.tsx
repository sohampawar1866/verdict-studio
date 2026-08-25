"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeKeys: 1,
    savedDags: 1,
    auditLogsCount: 4,
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
          setRecentEvents(data.slice(0, 5));
        }
      } catch (err) {
        console.warn("Audit logs fetch warning:", err);
      }
    };

    fetchHealth();
    fetchAudit();
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-12 select-none font-sans">
      {/* Top Hero Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#4a154b]/30 pb-10">
        <div className="space-y-3.5 max-w-2xl">
          <div className="font-mono text-xs text-slate-300 inline-flex items-center px-3.5 py-1 rounded-full bg-[#4a154b]/30 border border-[#d9bdde]/30 font-medium tracking-wide">
            <span>Verdict Studio • v0.2.x Open Source</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight-xl leading-tight">
            Verdict Studio & Haize Sentinel
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Visual multi-agent debate editor and scoped Model Context Protocol (MCP) gateway for production AI applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dag-studio"
            className="btn-primary-pill"
          >
            <span>New Visual DAG</span>
          </Link>

          <Link
            href="/mcp-keys"
            className="btn-secondary-pill"
          >
            <span>Manage MCP Keys</span>
          </Link>
        </div>
      </div>

      {/* 3 Quick-Start Cards (Linear Style Template Gallery) */}
      <div className="space-y-4">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick-Start Templates
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Template 1 */}
          <Link
            href="/dag-studio"
            className="group bg-[#170718] border border-[#4a154b]/40 hover:border-[#d9bdde]/50 p-6 rounded-2xl space-y-3.5 transition-all hover:bg-[#200a22] flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                // MULTI-AGENT DEBATE
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#d9bdde] transition-colors">
                Adversarial Safety Court
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Dual-judge debate (Prosecutor vs Defense) with Chief Justice synthesis for model red-teaming and prompt injection detection.
              </p>
            </div>
            <div className="pt-2 text-sm font-semibold text-[#38bdf8] flex items-center gap-1 group-hover:underline">
              <span>Open Template</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Template 2 */}
          <Link
            href="/mcp-keys"
            className="group bg-[#170718] border border-[#4a154b]/40 hover:border-[#1264a3]/50 p-6 rounded-2xl space-y-3.5 transition-all hover:bg-[#200a22] flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                // MCP SECURITY
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                Database & Tool Firewall
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Scoped tool gateway enforcing strict Read-Only SQL, domain whitelisting, and blocking destructive shell executions.
              </p>
            </div>
            <div className="pt-2 text-sm font-semibold text-[#38bdf8] flex items-center gap-1 group-hover:underline">
              <span>Configure Key</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Template 3 */}
          <Link
            href="/dag-studio"
            className="group bg-[#170718] border border-[#4a154b]/40 hover:border-[#a855f7]/50 p-6 rounded-2xl space-y-3.5 transition-all hover:bg-[#200a22] flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                // CONSENSUS & AGGREGATION
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#c084fc] transition-colors">
                Factuality & Hallucination Check
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Chain-of-thought verification pipeline with MaxPool majority voting for factual consistency evaluation.
              </p>
            </div>
            <div className="pt-2 text-sm font-semibold text-[#38bdf8] flex items-center gap-1 group-hover:underline">
              <span>Open Template</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* System Status & Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Tool Interceptions
          </span>
          <Link
            href="/audit-logs"
            className="text-sm text-[#38bdf8] hover:underline font-mono flex items-center gap-1 font-semibold"
          >
            <span>View Full Audit Feed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#230c25] border-b border-[#4a154b]/30 text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Tool</th>
                <th className="py-4 px-6">Policy Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a154b]/30 font-mono">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-sans text-sm">
                    No recent events logged. System operating nominally.
                  </td>
                </tr>
              ) : (
                recentEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#230c25]/40 transition-colors">
                    <td className="py-4 px-6 text-slate-300 font-mono text-xs whitespace-nowrap">
                      {new Date(evt.timestamp * 1000).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                          evt.status === "ALLOWED"
                            ? "bg-[#0a2318] text-[#2ecc71] border-[#007a5a]"
                            : evt.status === "BLOCKED"
                            ? "bg-[#2a0b12] text-[#ff8e75] border-[#cc4117]"
                            : "bg-[#230d2d] text-[#c084fc] border-[#a855f7]"
                        }`}
                      >
                        {evt.status === "ALLOWED" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2ecc71]" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#ff6b4a]" />
                        )}
                        <span>{evt.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-white font-mono text-sm">
                      {evt.tool_name}
                    </td>
                    <td className="py-4 px-6 text-slate-200 font-sans text-sm max-w-md truncate">
                      {evt.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
