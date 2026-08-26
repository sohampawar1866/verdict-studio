"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { AuditLogEntry } from "@/lib/types";
import { API_BASE_URL, WS_BASE_URL } from "@/lib/config";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEntry | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/audit/logs`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        throw new Error("Backend response error");
      }
    } catch {
      // Fallback initial dataset
      if (logs.length === 0) {
        setLogs([
          {
            id: "evt-001",
            timestamp: (Date.now() - 120000) / 1000,
            key_id: "key-claude-prod",
            tool_name: "db_query",
            parameters: { query: "DROP TABLE users; --" },
            status: "BLOCKED",
            reason: "AST Violation: Destructive query DROP is forbidden by strict read-only policy.",
            latency_ms: 1.4,
          },
          {
            id: "evt-002",
            timestamp: (Date.now() - 95000) / 1000,
            key_id: "key-cursor-dev",
            tool_name: "fetch_web",
            parameters: { url: "https://api.github.com/repos/haizelabs/verdict" },
            status: "ALLOWED",
            reason: "Domain api.github.com matched key domain whitelist (*.github.com).",
            latency_ms: 18.2,
          },
          {
            id: "evt-003",
            timestamp: (Date.now() - 40000) / 1000,
            key_id: "key-devin-agent",
            tool_name: "bash",
            parameters: { command: "rm -rf /" },
            status: "BLOCKED",
            reason: "Tool bash is explicitly prohibited in key policy.",
            latency_ms: 0.8,
          },
          {
            id: "evt-004",
            timestamp: (Date.now() - 10000) / 1000,
            key_id: "key-claude-prod",
            tool_name: "fetch_web",
            parameters: { url: "http://malicious-internal-server.local/metadata" },
            status: "BLOCKED",
            reason: "Domain not present in allowed domain whitelist.",
            latency_ms: 2.1,
          },
        ]);
      }
    }
  };

  useEffect(() => {
    fetchLogs();

    let ws: WebSocket;
    const connectWS = () => {
      try {
        ws = new WebSocket(`${WS_BASE_URL}/ws/telemetry`);
        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWS, 4000);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "AUDIT_EVENT") {
              setLogs((prev) => [data.event, ...prev]);
            }
          } catch (e) {
            console.error("Error parsing WS audit event:", e);
          }
        };
      } catch {
        setWsConnected(false);
      }
    };

    connectWS();
    return () => ws?.close();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const tool = log.tool_name || log.toolName || "";
    const key = log.key_id || log.keyName || "";
    const matchesStatus =
      filterStatus === "ALL" || log.status === filterStatus;
    const matchesQuery =
      tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sentinel_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "Key ID", "Tool Name", "Status", "Latency (ms)", "Reason"];
    const rows = filteredLogs.map((l) => [
      new Date(l.timestamp * 1000).toISOString(),
      l.key_id || l.keyName || "",
      l.tool_name || l.toolName || "",
      l.status,
      l.latency_ms ?? l.executionTimeMs ?? 0,
      `"${(l.reason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `sentinel_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#4a154b]/30 pb-8">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#4a154b]/30 border border-[#d9bdde]/30 text-[#d9bdde] text-xs font-mono font-medium tracking-wide">
            <span>Security Forensics • Real-Time Stream</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight-xl leading-tight">
            Security Interception & Audit Logs
          </h1>
          <p className="text-sm sm:text-base text-[#d9bdde]/80 leading-relaxed font-normal">
            Real-time tool execution logs, AST SQL blocks, prompt injection debate transcripts, and threat forensics.
          </p>
        </div>

        {/* Live Stream Status Pill & Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#230c25] border border-[#4a154b]/40 text-xs font-mono">
            <div
              className={`w-2 h-2 rounded-full ${
                wsConnected
                  ? "bg-[#007a5a] shadow-sm shadow-[#007a5a] animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-white font-semibold">{wsConnected ? "STREAM ONLINE" : "CONNECTING..."}</span>
          </div>

          <button
            onClick={exportJSON}
            className="btn-secondary-pill flex items-center gap-1.5 !px-4 !py-2 !text-xs"
          >
            <FileJson className="w-3.5 h-3.5 text-[#d9bdde]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={exportCSV}
            className="btn-secondary-pill flex items-center gap-1.5 !px-4 !py-2 !text-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#d9bdde]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#170718] border border-[#4a154b]/40 rounded-2xl p-4 shadow-md">
        <div className="flex-1 flex items-center gap-3 bg-[#100311] border border-[#4a154b]/50 rounded-full px-4 py-2 w-full">
          <Search className="w-4 h-4 text-[#d9bdde] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by tool name, key prefix, or security reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full text-xs text-white focus:outline-none placeholder:text-[#d9bdde]/50 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#d9bdde] flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#100311] border border-[#4a154b]/50 rounded-full px-4 py-2 text-xs text-white focus:outline-none font-mono cursor-pointer"
          >
            <option value="ALL">Status: ALL EVENTS</option>
            <option value="ALLOWED">Status: ALLOWED ONLY</option>
            <option value="BLOCKED">Status: BLOCKED ONLY</option>
            <option value="VERDICT_REVIEW">Status: VERDICT_REVIEW</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#230c25] border-b border-[#4a154b]/30 text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Tool</th>
                <th className="py-4 px-5">Key Identity</th>
                <th className="py-4 px-5">Latency</th>
                <th className="py-4 px-6">Security Rationale / Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a154b]/30 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 font-sans text-sm">
                    No matching audit log events found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedEvent(log)}
                    className="hover:bg-[#230c25]/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 text-slate-300 font-mono text-xs whitespace-nowrap">
                      {new Date(log.timestamp * 1000).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                          log.status === "ALLOWED"
                            ? "bg-[#0a2318] text-[#2ecc71] border-[#007a5a]"
                            : log.status === "BLOCKED"
                            ? "bg-[#2a0b12] text-[#ff8e75] border-[#cc4117]"
                            : "bg-[#230d2d] text-[#c084fc] border-[#a855f7]"
                        }`}
                      >
                        {log.status === "ALLOWED" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2ecc71]" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#ff6b4a]" />
                        )}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-white text-sm group-hover:text-[#38bdf8] transition-colors">
                      {log.tool_name}
                    </td>
                    <td className="py-4 px-5 font-mono text-[#38bdf8] text-xs">
                      {log.key_id}
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-300 text-xs">
                      {log.latency_ms} ms
                    </td>
                    <td className="py-4 px-6 text-slate-200 max-w-md truncate font-sans text-sm">
                      {log.reason || "Executed within nominal security invariants."}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="p-5 border-b border-[#4a154b]/30 flex items-center justify-between bg-[#230c25]">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Audit Event Details
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  ID: {selectedEvent.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#4a154b] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-[#100311] border border-[#4a154b]/40 space-y-1">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Tool Invocation
                  </span>
                  <div className="font-bold text-white font-mono text-sm">{selectedEvent.tool_name}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#100311] border border-[#4a154b]/40 space-y-1">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Gateway Verdict
                  </span>
                  <div
                    className={`font-bold font-mono text-sm ${
                      selectedEvent.status === "ALLOWED"
                        ? "text-[#2ecc71]"
                        : "text-[#ff8e75]"
                    }`}
                  >
                    {selectedEvent.status}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-200">
                  Policy Evaluation & Rationale
                </span>
                <div className="p-3.5 rounded-2xl bg-[#100311] border border-[#4a154b]/40 text-sm text-white leading-relaxed font-sans">
                  {selectedEvent.reason}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#d9bdde]">
                  Raw Payload Parameters
                </span>
                <pre className="p-4 rounded-2xl bg-[#0d030e] border border-[#4a154b]/40 text-xs font-mono text-[#38bdf8] overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedEvent.parameters, null, 2)}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#4a154b]/30 bg-[#230c25] flex items-center justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="btn-primary-pill"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
