"use client";

import React, { useState } from "react";
import { X, Check, Copy } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyCreated: () => void;
}

export default function KeyModal({ isOpen, onClose, onKeyCreated }: KeyModalProps) {
  const [keyName, setKeyName] = useState("");
  const [allowDb, setAllowDb] = useState(true);
  const [allowWeb, setAllowWeb] = useState(true);
  const [allowBash, setAllowBash] = useState(false);
  const [sqlReadOnly, setSqlReadOnly] = useState(true);
  const [enforceVerdict, setEnforceVerdict] = useState(true);
  const [domains, setDomains] = useState("*.company.com, api.github.com");
  const [isLoading, setIsLoading] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!keyName.trim()) {
      alert("Please provide an agent/key name identifier");
      return;
    }

    setIsLoading(true);

    const allowedTools: string[] = [];
    const prohibitedTools: string[] = [];

    if (allowDb) allowedTools.push("db_query");
    else prohibitedTools.push("db_query");

    if (allowWeb) allowedTools.push("fetch_web");
    else prohibitedTools.push("fetch_web");

    if (allowBash) allowedTools.push("bash");
    else prohibitedTools.push("bash");

    const domainList = domains
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`${API_BASE_URL}/api/mcp/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: keyName,
          allowed_tools: allowedTools,
          prohibited_tools: prohibitedTools,
          enforce_verdict_eval: enforceVerdict,
          verdict_token_threshold: 150,
          sql_read_only: sqlReadOnly,
          allowed_domains: domainList.length > 0 ? domainList : ["*"],
          max_requests_per_minute: 60,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedKeyData(data);
        onKeyCreated();
      }
    } catch (err) {
      console.error("Failed to create key:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRawKey = () => {
    if (!createdKeyData?.raw_key) return;
    navigator.clipboard.writeText(createdKeyData.raw_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyConfig = () => {
    if (!createdKeyData?.claude_config_snippet) return;
    navigator.clipboard.writeText(JSON.stringify(createdKeyData.claude_config_snippet, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleModalClose = () => {
    setCreatedKeyData(null);
    setKeyName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in select-none">
      <div className="bg-[#170718] border border-[#4a154b]/40 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#4a154b]/30 flex items-center justify-between bg-[#230c25]/80">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Create Scoped MCP Key
            </h2>
            <p className="text-sm text-slate-300 mt-1 font-normal">
              Grant fine-grained tool permissions and active Verdict safety guardrails
            </p>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#4a154b] transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[78vh] overflow-y-auto">
          {!createdKeyData ? (
            <>
              {/* Key Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 block">
                  Agent / Key Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Claude Desktop Production, Cursor Agent Dev, Devin"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d9bdde] font-mono"
                />
              </div>

              {/* Scoped Permissions (Clean Unboxed Layout) */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-[#4a154b]/30 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Tool Access Permissions & Guardrails
                  </span>
                </div>

                {/* Database / SQL Tools */}
                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center gap-3 text-sm text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowDb}
                      onChange={(e) => setAllowDb(e.target.checked)}
                      className="rounded bg-[#100311] border-[#4a154b] text-[#4a154b] focus:ring-[#4a154b] w-4 h-4"
                    />
                    <span className="font-semibold text-white">Allow Database Tools (<code className="text-[#38bdf8] font-mono font-normal text-xs">db_query</code>)</span>
                  </label>

                  {allowDb && (
                    <div className="ml-7 pl-3 border-l-2 border-[#4a154b]/40 space-y-1.5">
                      <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sqlReadOnly}
                          onChange={(e) => setSqlReadOnly(e.target.checked)}
                          className="rounded bg-[#100311] border-[#4a154b] text-[#4a154b] w-3.5 h-3.5"
                        />
                        <span>Enforce Strict Read-Only SQL (Blocks DROP, DELETE, UPDATE, ALTER)</span>
                      </label>
                      <p className="text-xs text-slate-400">
                        Deep inspection via <code className="text-[#d9bdde] font-mono">sqlparse</code> blocks multi-statement injection.
                      </p>
                    </div>
                  )}
                </div>

                {/* Web Fetch Tools */}
                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center gap-3 text-sm text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowWeb}
                      onChange={(e) => setAllowWeb(e.target.checked)}
                      className="rounded bg-[#100311] border-[#4a154b] text-[#4a154b] w-4 h-4"
                    />
                    <span className="font-semibold text-white">Allow Web Requests (<code className="text-[#38bdf8] font-mono font-normal text-xs">fetch_web</code>)</span>
                  </label>

                  {allowWeb && (
                    <div className="ml-7 pl-3 border-l-2 border-[#4a154b]/40 space-y-2">
                      <label className="text-xs text-slate-300 block font-medium">
                        Domain Whitelist (comma-separated wildcards)
                      </label>
                      <input
                        type="text"
                        value={domains}
                        onChange={(e) => setDomains(e.target.value)}
                        placeholder="*.company.com, api.github.com"
                        className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#d9bdde]"
                      />
                    </div>
                  )}
                </div>

                {/* Terminal / Bash Tools */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 text-sm text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowBash}
                      onChange={(e) => setAllowBash(e.target.checked)}
                      className="rounded bg-[#100311] border-[#4a154b] text-[#cc4117] w-4 h-4"
                    />
                    <span className="font-semibold text-white">Allow Terminal Execution (<code className="text-[#ff8e75] font-mono font-normal text-xs">bash</code>)</span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#cc4117]/20 text-[#ff8e75] border border-[#cc4117]/40 font-bold ml-auto">
                      High Risk
                    </span>
                  </label>
                </div>

                {/* Verdict Multi-Agent Defense Toggle */}
                <div className="pt-4 border-t border-[#4a154b]/30 space-y-1.5">
                  <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enforceVerdict}
                      onChange={(e) => setEnforceVerdict(e.target.checked)}
                      className="rounded bg-[#100311] border-[#4a154b] text-[#007a5a] w-4 h-4"
                    />
                    <span className="text-white">
                      Enforce Inline Verdict Safety Debate on Tool Returns
                    </span>
                  </label>
                  <p className="text-xs text-slate-400 ml-7 leading-relaxed">
                    Automatically triggers a fast Prosecutor vs Defense debate on unverified payloads before agent context ingests them.
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full btn-primary-pill"
                >
                  {isLoading ? "Generating Secure Key..." : "Create Scoped MCP Key"}
                </button>
              </div>
            </>
          ) : (
            /* Post-Creation Success Screen */
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-[#081f14] border border-[#007a5a]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#2ecc71] flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Scoped MCP Key Generated Successfully
                  </span>
                  <span className="text-xs font-mono text-[#2ecc71] bg-[#007a5a]/30 px-2.5 py-0.5 rounded-full border border-[#007a5a]/40 font-bold">
                    SHA-256 HASHED
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  Please copy and store this raw secret key now. It will <strong>never be shown again</strong>.
                </p>

                <div className="flex items-center justify-between bg-[#100311] p-3.5 rounded-xl border border-[#4a154b]/50 mt-2">
                  <code className="text-sm font-mono text-[#38bdf8] break-all">
                    {createdKeyData.raw_key}
                  </code>
                  <button
                    onClick={handleCopyRawKey}
                    className="p-2 ml-2 rounded-full bg-[#4a154b] hover:bg-[#611f69] text-white transition-colors flex-shrink-0"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-[#2ecc71]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 1-Click Claude Config */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200">
                    Claude Desktop Configuration Snippet
                  </label>
                  <button
                    onClick={handleCopyConfig}
                    className="text-xs text-[#38bdf8] hover:underline font-mono flex items-center gap-1 font-semibold"
                  >
                    {copiedConfig ? <Check className="w-3.5 h-3.5 text-[#2ecc71]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedConfig ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-[#0d030e] border border-[#4a154b]/40 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  {JSON.stringify(createdKeyData.claude_config_snippet, null, 2)}
                </pre>
              </div>

              <button
                onClick={handleModalClose}
                className="w-full btn-primary-pill"
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
