"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Shield,
  Database,
  Terminal,
  Globe,
  Trash2,
  Laptop,
  CheckCircle,
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
      } else {
        throw new Error("Backend response error");
      }
    } catch {
      // Fallback demo state
      if (keys.length === 0) {
        setKeys([
          {
            id: "key-demo-claude",
            name: "Claude Desktop Support (Demo)",
            keyPrefix: "haize_mcp_live_demo",
            hashedKey: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            allowedTools: ["db_query", "fetch_web"],
            prohibitedTools: ["bash", "file_delete"],
            enforceVerdictEval: true,
            verdictTokenThreshold: 150,
            sqlReadOnly: true,
            allowedDomains: ["*.company.com", "api.github.com"],
            maxRpm: 60,
            createdAt: Date.now() - 3600000,
            isActive: true,
          },
        ]);
      }
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
      } else {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
      }
    } catch {
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
    }
  };

  const filteredKeys = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-10 select-none font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#4a154b]/30 pb-8">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4a154b]/30 border border-[#d9bdde]/30 text-[#d9bdde] text-xs font-mono font-bold tracking-micro-cap uppercase">
            <Shield className="w-3.5 h-3.5 text-[#d9bdde]" />
            <span>HAIZE SENTINEL SECURITY CONTROL PLANE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight-xl leading-tight">
            Scoped MCP Keys & Tool Permissions
          </h1>
          <p className="text-sm sm:text-base text-[#d9bdde]/80 leading-relaxed font-normal">
            Generate and govern API keys for Claude Desktop, Cursor, and Devin with AST SQL guardrails and inline Verdict debate protection.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary-pill inline-flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Scoped Key</span>
        </button>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#170718] border border-[#4a154b]/40 p-6 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-[#d9bdde] text-xs">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Total Managed Keys</span>
            <Key className="w-4 h-4 text-[#d9bdde]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-white font-sans">{keys.length}</div>
        </div>

        <div className="bg-[#170718] border border-[#4a154b]/40 p-6 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-[#d9bdde] text-xs">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Active Keys</span>
            <CheckCircle className="w-4 h-4 text-[#2ecc71]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-[#2ecc71] font-sans">
            {keys.filter((k) => k.isActive).length}
          </div>
        </div>

        <div className="bg-[#170718] border border-[#4a154b]/40 p-6 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-[#d9bdde] text-xs">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">AST SQL Guardrails</span>
            <Database className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-[#38bdf8] font-sans">
            {keys.filter((k) => k.sqlReadOnly && k.isActive).length}
          </div>
        </div>

        <div className="bg-[#170718] border border-[#4a154b]/40 p-6 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-[#d9bdde] text-xs">
            <span className="font-bold tracking-micro-cap uppercase text-[11px]">Verdict Debate Firewalls</span>
            <Sparkles className="w-4 h-4 text-[#c084fc]" />
          </div>
          <div className="text-4xl font-extrabold tracking-tight-lg text-[#c084fc] font-sans">
            {keys.filter((k) => k.enforceVerdictEval && k.isActive).length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-[#170718] border border-[#4a154b]/40 rounded-full px-5 py-3 shadow-md">
        <Search className="w-4 h-4 text-[#d9bdde]" />
        <input
          type="text"
          placeholder="Filter scoped keys by agent name or prefix..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent w-full text-xs text-white focus:outline-none placeholder:text-[#d9bdde]/50 font-mono"
        />
      </div>

      {/* Keys Table */}
      <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#230c25] border-b border-[#4a154b]/30 text-[11px] font-mono text-[#d9bdde] uppercase tracking-micro-cap font-bold">
              <tr>
                <th className="py-4 px-6">Agent / Key Identifier</th>
                <th className="py-4 px-5">Display Prefix</th>
                <th className="py-4 px-5">Security Policies & RBAC</th>
                <th className="py-4 px-5">Created</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a154b]/30 font-mono">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#d9bdde]/60 font-sans text-sm">
                    No scoped MCP keys found. Click <strong className="text-white font-bold">"Generate Scoped Key"</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-[#230c25]/50 transition-colors">
                    <td className="py-4 px-6 font-sans font-bold text-white text-sm">
                      {key.name}
                    </td>
                    <td className="py-4 px-5 text-[#38bdf8] text-[11px]">
                      {key.keyPrefix}...
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1.5">
                        {key.sqlReadOnly && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1264a3]/20 border border-[#1264a3]/40 text-[#38bdf8] text-[10px] font-mono font-semibold">
                            <Database className="w-3 h-3" />
                            SQL Read-Only
                          </span>
                        )}
                        {key.enforceVerdictEval && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4a154b]/40 border border-[#d9bdde]/30 text-[#d9bdde] text-[10px] font-mono font-semibold">
                            <Sparkles className="w-3 h-3 text-[#c084fc]" />
                            Verdict Review
                          </span>
                        )}
                        {key.prohibitedTools.includes("bash") && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#cc4117]/20 border border-[#cc4117]/40 text-[#ff8e75] text-[10px] font-mono font-semibold">
                            <Terminal className="w-3 h-3" />
                            Bash Blocked
                          </span>
                        )}
                        {key.allowedDomains && key.allowedDomains[0] !== "*" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#007a5a]/20 border border-[#007a5a]/40 text-[#2ecc71] text-[10px] font-mono font-semibold">
                            <Globe className="w-3 h-3" />
                            Scoped Whitelist
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[#d9bdde]/70 text-[11px]">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          key.isActive
                            ? "bg-[#007a5a]/20 text-[#2ecc71] border-[#007a5a]/40"
                            : "bg-[#cc4117]/20 text-[#ff8e75] border-[#cc4117]/40"
                        }`}
                      >
                        {key.isActive ? "ACTIVE" : "REVOKED"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedKeyForSnippet(key)}
                          title="View Client Config Snippets"
                          className="btn-secondary-pill !px-3 !py-1.5 !text-[11px] inline-flex items-center gap-1.5"
                        >
                          <Laptop className="w-3.5 h-3.5 text-[#d9bdde]" />
                          <span>Config</span>
                        </button>
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          title="Revoke Key"
                          className="p-1.5 rounded-full bg-[#cc4117]/15 hover:bg-[#cc4117]/30 border border-[#cc4117]/40 text-[#ff8e75] hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Key Modal */}
      <KeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onKeyCreated={fetchKeys}
      />

      {/* Config Snippet Modal */}
      <ConfigSnippetModal
        keyData={selectedKeyForSnippet}
        isOpen={Boolean(selectedKeyForSnippet)}
        onClose={() => setSelectedKeyForSnippet(null)}
      />
    </div>
  );
}
