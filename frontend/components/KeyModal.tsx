"use client";

import React, { useState } from "react";
import {
  Key,
  X,
  Shield,
  Copy,
  Check,
  Database,
  Terminal,
  Globe,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyCreated: () => void;
}

export default function KeyModal({ isOpen, onClose, onKeyCreated }: KeyModalProps) {
  const [keyName, setKeyName] = useState("");
  const [allowSql, setAllowSql] = useState(true);
  const [sqlReadOnly, setSqlReadOnly] = useState(true);
  const [allowBash, setAllowBash] = useState(false);
  const [allowWeb, setAllowWeb] = useState(true);
  const [domains, setDomains] = useState("*.company.com, api.github.com");
  const [enforceVerdict, setEnforceVerdict] = useState(true);
  const [verdictThreshold, setVerdictThreshold] = useState(150);

  const [isLoading, setIsLoading] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!keyName.trim()) {
      alert("Please enter a name for this MCP API key.");
      return;
    }

    setIsLoading(true);
    try {
      const allowedTools = [
        allowSql ? "db_query" : "",
        allowWeb ? "fetch_web" : "",
        allowBash ? "bash" : "",
      ].filter(Boolean);

      const prohibitedTools = [
        !allowBash ? "bash" : "",
        !allowSql ? "db_query" : "",
        !allowWeb ? "fetch_web" : "",
        "file_delete",
        "system_shutdown",
      ].filter(Boolean);

      const allowedDomainsList = domains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const res = await fetch("http://localhost:8000/api/mcp/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: keyName,
          allowed_tools: allowedTools,
          prohibited_tools: prohibitedTools,
          enforce_verdict_eval: enforceVerdict,
          verdict_token_threshold: verdictThreshold,
          sql_read_only: sqlReadOnly,
          allowed_domains: allowedDomainsList.length > 0 ? allowedDomainsList : ["*"],
          max_requests_per_minute: 60,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedKeyData(data);
        onKeyCreated();
      } else {
        alert("Failed to generate MCP key.");
      }
    } catch (err) {
      console.error("Error creating MCP key:", err);
      alert("Failed to reach backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRawKey = () => {
    if (createdKeyData?.raw_key) {
      navigator.clipboard.writeText(createdKeyData.raw_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyConfig = () => {
    if (createdKeyData?.claude_config_snippet) {
      navigator.clipboard.writeText(
        JSON.stringify(createdKeyData.claude_config_snippet, null, 2)
      );
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
  };

  const handleModalClose = () => {
    setCreatedKeyData(null);
    setKeyName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Generate Scoped MCP Key
              </h2>
              <p className="text-xs text-slate-400">
                Grant fine-grained tool permissions and active Verdict safety guardrails
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!createdKeyData ? (
            <>
              {/* Key Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Agent / Key Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Claude Desktop Production, Cursor Agent Dev, Devin"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Scoped Permissions Box */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Tool Access Permissions & Guardrails
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">RBAC Policy</span>
                </div>

                {/* Database Tools */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowSql}
                      onChange={(e) => setAllowSql(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold">Allow Database Tools (<code className="text-cyan-300 font-mono">db_query</code>)</span>
                  </label>

                  {allowSql && (
                    <div className="ml-6 pl-3 border-l-2 border-slate-800 space-y-1">
                      <label className="flex items-center gap-2 text-[11px] text-cyan-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sqlReadOnly}
                          onChange={(e) => setSqlReadOnly(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                        />
                        <span>Enforce Strict AST Read-Only (Blocks DROP, DELETE, UPDATE, ALTER)</span>
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Deep inspection via <code className="text-slate-400 font-mono">sqlparse</code> blocks multi-statement attacks.
                      </p>
                    </div>
                  )}
                </div>

                {/* Web Fetch Tools */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowWeb}
                      onChange={(e) => setAllowWeb(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold">Allow Web Tools (<code className="text-cyan-300 font-mono">fetch_web</code>)</span>
                  </label>

                  {allowWeb && (
                    <div className="ml-6 pl-3 border-l-2 border-slate-800 space-y-1">
                      <label className="text-[11px] text-slate-400 block">
                        Domain Whitelist (comma-separated wildcards)
                      </label>
                      <input
                        type="text"
                        value={domains}
                        onChange={(e) => setDomains(e.target.value)}
                        placeholder="*.company.com, api.github.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                </div>

                {/* Terminal / Bash Tools */}
                <div>
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowBash}
                      onChange={(e) => setAllowBash(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-red-500"
                    />
                    <Terminal className="w-4 h-4 text-red-400" />
                    <span className="font-semibold">Allow Bash Terminal (<code className="text-red-300 font-mono">bash</code>)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800/50">
                      High Risk
                    </span>
                  </label>
                </div>

                {/* Inline Verdict Debate Guardrail */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enforceVerdict}
                      onChange={(e) => setEnforceVerdict(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">
                      Enforce Inline Verdict Safety Debate on Tool Returns
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-500 ml-6">
                    Automatically triggers a fast Prosecutor ⚔️ Defense debate on unverified payloads before agent context ingests them.
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Generating Secure Key..." : "Create Scoped MCP Key"}
              </button>
            </>
          ) : (
            /* Post-Creation Success Screen */
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Scoped MCP Key Generated Successfully!
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                    SHA-256 HASHED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Please copy and store this raw secret key now. It will <strong>never be shown again</strong>.
                </p>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 mt-2">
                  <code className="text-xs font-mono text-cyan-300 break-all">
                    {createdKeyData.raw_key}
                  </code>
                  <button
                    onClick={handleCopyRawKey}
                    className="p-1.5 ml-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 1-Click Claude Config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    1-Click Claude Desktop Configuration Snippet
                  </label>
                  <button
                    onClick={handleCopyConfig}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedConfig ? "Copied!" : "Copy JSON"}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {JSON.stringify(createdKeyData.claude_config_snippet, null, 2)}
                </pre>
              </div>

              <button
                onClick={handleModalClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
