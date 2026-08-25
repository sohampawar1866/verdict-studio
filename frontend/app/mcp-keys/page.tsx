"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Database,
  Terminal,
  Globe,
  Trash2,
  Laptop,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
} from "lucide-react";
import KeyModal from "@/components/KeyModal";
import ConfigSnippetModal from "@/components/ConfigSnippetModal";
import { MCPKey } from "@/lib/types";

export default function MCPKeysPage() {
  const [keys, setKeys] = useState<MCPKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedKeyForSnippet, setSelectedKeyForSnippet] = useState<MCPKey | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/mcp/keys", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // Transform backend keys to frontend model
        const formatted: MCPKey[] = data.map((k: any) => ({
          id: k.id,
          name: k.name,
          keyPrefix: k.key_prefix || "haize_mcp_live_...",
          hashedKey: k.hashed_key,
          allowedTools: k.allowed_tools || [],
          prohibitedTools: k.prohibited_tools || [],
          enforceVerdictEval: k.enforce_verdict_eval !== false,
          verdictTokenThreshold: k.verdict_token_threshold || 150,
          sqlReadOnly: k.sql_read_only !== false,
          allowedDomains: k.allowed_domains || ["*"],
          maxRpm: k.max_rpm || 60,
          createdAt: k.created_at * 1000,
          isActive: k.is_active !== false,
        }));
        setKeys(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this MCP API key? Any connected agents will lose access immediately.")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/mcp/keys/${keyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error("Failed to revoke key:", err);
    }
  };

  const filteredKeys = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>HAIZE SENTINEL SECURITY CONTROL PLANE</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Scoped MCP Keys & Tool Permissions
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Generate and govern API keys for Claude Desktop, Cursor, and Devin with AST SQL guardrails and inline Verdict debate protection.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Scoped Key</span>
        </button>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Managed Keys</span>
            <Key className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{keys.length}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Keys</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {keys.filter((k) => k.isActive).length}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AST SQL Guardrails</span>
            <Database className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">
            {keys.filter((k) => k.sqlReadOnly && k.isActive).length} Keys
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verdict Debate Firewalls</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">
            {keys.filter((k) => k.enforceVerdictEval && k.isActive).length} Keys
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter scoped keys by agent name or prefix..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent w-full text-xs text-slate-200 focus:outline-none placeholder:text-slate-500 font-mono"
        />
      </div>

      {/* Keys Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Agent / Key Identifier</th>
                <th className="py-3 px-4">Display Prefix</th>
                <th className="py-3 px-4">Security Policies & RBAC</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No scoped MCP keys found. Click <strong className="text-cyan-400">"Generate Scoped Key"</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-5 font-sans font-bold text-slate-200">
                      {key.name}
                    </td>
                    <td className="py-3.5 px-4 text-cyan-400 text-[11px]">
                      {key.keyPrefix}...
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {key.sqlReadOnly && (
                          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 text-[10px] flex items-center gap-1">
                            <Database className="w-2.5 h-2.5 text-blue-400" />
                            Read-Only SQL
                          </span>
                        )}
                        {key.prohibitedTools.includes("bash") && (
                          <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/40 text-[10px] flex items-center gap-1">
                            <Terminal className="w-2.5 h-2.5 text-red-400" />
                            Bash Blocked
                          </span>
                        )}
                        {key.enforceVerdictEval && (
                          <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[10px] flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                            Verdict Guard
                          </span>
                        )}
                        {key.allowedDomains.length > 0 && !key.allowedDomains.includes("*") && (
                          <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40 text-[10px] flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5 text-sky-400" />
                            Domain Whitelist
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          key.isActive
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/50"
                            : "bg-red-950/80 text-red-300 border-red-800/50"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            key.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                          }`}
                        />
                        {key.isActive ? "ACTIVE" : "REVOKED"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedKeyForSnippet(key)}
                        title="1-Click Agent Configuration Snippet"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                      >
                        <Laptop className="w-3 h-3 text-cyan-400" />
                        <span>Config</span>
                      </button>

                      {key.isActive && (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          title="Revoke API Key"
                          className="inline-flex items-center p-1 rounded-lg hover:bg-red-950 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Creation Modal */}
      <KeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onKeyCreated={fetchKeys}
      />

      {/* Config Snippet Modal */}
      <ConfigSnippetModal
        keyRecord={selectedKeyForSnippet}
        isOpen={!!selectedKeyForSnippet}
        onClose={() => setSelectedKeyForSnippet(null)}
      />
    </div>
  );
}
