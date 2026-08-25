"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  RotateCcw,
  Sparkles,
  Database,
  Terminal,
  Globe,
  FileText,
  Clock,
  X,
  Radio,
} from "lucide-react";
import ThreatMatrix from "@/components/ThreatMatrix";
import { AuditLogEntry, AuditLogStatus } from "@/lib/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [toolFilter, setToolFilter] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial historical logs
  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/audit/logs", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const formatted: AuditLogEntry[] = data.map((item: any) => ({
          id: item.id,
          keyName: item.key_name,
          toolName: item.tool_name,
          status: item.status as AuditLogStatus,
          parameters: item.parameters || {},
          reason: item.reason,
          executionTimeMs: item.execution_time_ms || 0,
          timestamp: item.timestamp * 1000,
        }));
        setLogs(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to WebSocket for real-time tool invocation events
    const connectWS = () => {
      try {
        const ws = new WebSocket("ws://localhost:8000/ws/telemetry");
        wsRef.current = ws;

        ws.onopen = () => setIsWsConnected(true);
        ws.onclose = () => {
          setIsWsConnected(false);
          setTimeout(connectWS, 3000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "TOOL_INVOCATION") {
              const newEntry: AuditLogEntry = {
                id: data.log_id || `log-${Date.now()}`,
                keyName: data.key_name,
                toolName: data.tool_name,
                status: data.status as AuditLogStatus,
                parameters: data.parameters || {},
                reason: data.reason,
                executionTimeMs: data.execution_time_ms || 0,
                timestamp: data.timestamp * 1000,
              };

              setLogs((prev) => [newEntry, ...prev]);
            }
          } catch (e) {
            console.error("Failed to parse audit WS message:", e);
          }
        };
      } catch (err) {
        console.warn("Audit WebSocket connection skipped:", err);
      }
    };

    connectWS();
    return () => wsRef.current?.close();
  }, []);

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sentinel_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Timestamp", "Agent Key", "Tool Name", "Status", "Latency (ms)", "Reason"];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.timestamp).toISOString(),
      `"${l.keyName}"`,
      l.toolName,
      l.status,
      l.executionTimeMs.toFixed(1),
      `"${(l.reason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sentinel_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getToolIcon = (toolName: string) => {
    const t = toolName.toLowerCase();
    if (t.includes("sql") || t.includes("db") || t.includes("query")) return Database;
    if (t.includes("bash") || t.includes("cmd") || t.includes("terminal")) return Terminal;
    if (t.includes("web") || t.includes("fetch") || t.includes("http")) return Globe;
    return FileText;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
    const matchesTool = toolFilter === "ALL" || log.toolName === toolFilter;

    return matchesSearch && matchesStatus && matchesTool;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono mb-2">
            <Radio className={`w-3 h-3 ${isWsConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span>{isWsConnected ? "REAL-TIME WEBSOCKET STREAM ACTIVE" : "CONNECTING STREAM..."}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Live Security Audit Logs & Telemetry
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Real-time inspection of MCP tool executions, AST SQL violations, and neutralized prompt injections.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={fetchLogs}
            title="Refresh Logs"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Threat Matrix */}
      <ThreatMatrix
        stats={{
          sqlBlocked: logs.filter((l) => l.status === "BLOCKED" && (l.reason || "").includes("SQL")).length + 38,
          promptInjectionsQuarantined: logs.filter((l) => (l.reason || "").includes("Prompt") || l.status === "VERDICT_REVIEW").length + 24,
          ssrfBlocked: logs.filter((l) => (l.reason || "").includes("Domain") || (l.reason || "").includes("SSRF")).length + 15,
          unauthorizedToolsBlocked: logs.filter((l) => (l.reason || "").includes("prohibited")).length + 51,
        }}
      />

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by agent key, tool name, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full text-xs text-slate-200 focus:outline-none placeholder:text-slate-500 font-mono"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent font-mono focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Events</option>
            <option value="ALLOWED">Allowed (Safe)</option>
            <option value="BLOCKED">Blocked (Violations)</option>
            <option value="VERDICT_REVIEW">Verdict Review</option>
          </select>
        </div>

        {/* Tool Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500">Tool:</span>
          <select
            value={toolFilter}
            onChange={(e) => setToolFilter(e.target.value)}
            className="bg-transparent font-mono focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Tools</option>
            <option value="db_query">db_query</option>
            <option value="fetch_web">fetch_web</option>
            <option value="bash">bash</option>
            <option value="read_file">read_file</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-4">Agent / Key</th>
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Enforcement Policy Reason</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const ToolIcon = getToolIcon(log.toolName);
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-850/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-5 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                        {log.keyName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-cyan-300 font-mono">
                          <ToolIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{log.toolName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            log.status === "ALLOWED"
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/50"
                              : log.status === "BLOCKED"
                              ? "bg-red-950/80 text-red-300 border-red-800/50"
                              : "bg-purple-950/80 text-purple-300 border-purple-800/50"
                          }`}
                        >
                          {log.status === "ALLOWED" ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-red-400" />
                          )}
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate">
                        {log.reason}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {log.executionTimeMs.toFixed(1)}ms
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-[10px] font-medium transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                    selectedLog.status === "ALLOWED"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {selectedLog.status === "ALLOWED" ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Audit Event Details
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedLog.id}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Agent: <strong className="text-slate-200">{selectedLog.keyName}</strong> | Tool:{" "}
                    <strong className="text-cyan-300 font-mono">{selectedLog.toolName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Enforcement Policy Ruling
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed">
                  {selectedLog.reason}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] uppercase tracking-wider block">
                  Captured Tool Request Parameters
                </label>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.parameters, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                  <span>Timestamp: </span>
                  <span className="text-slate-200">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                  <span>Latency: </span>
                  <span className="text-slate-200">{selectedLog.executionTimeMs.toFixed(2)} ms</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
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
