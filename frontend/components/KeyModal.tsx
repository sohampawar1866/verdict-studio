"use client";

import React, { useState } from "react";
import {
  Key,
  X,
  Shield,
  Check,
  Copy,
  Terminal,
  Database,
  Globe,
  Sparkles,
} from "lucide-react";

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
      const res = await fetch("http://localhost:8000/api/mcp/keys", {
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#4a154b]/30 flex items-center justify-between bg-[#230c25]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4a154b] border border-[#d9bdde]/30 flex items-center justify-center text-white shadow-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Generate Scoped MCP Key
              </h2>
              <p className="text-xs text-[#d9bdde]/80 mt-0.5">
                Grant fine-grained tool permissions and active Verdict safety guardrails
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-full text-[#d9bdde]/70 hover:text-white hover:bg-[#4a154b] transition-colors"
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
                <label className="text-xs font-semibold text-[#d9bdde] block">
                  Agent / Key Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Claude Desktop Production, Cursor Agent Dev, Devin"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono"
                />
              </div>

              {/* Scoped Permissions Box */}
              <div className="p-4 rounded-2xl bg-[#1f0a21] border border-[#4a154b]/40 space-y-4">
                <div className="flex items-center justify-between border-b border-[#4a154b]/30 pb-2">
                  <span className="text-xs font-bold text-[#d9bdde] uppercase tracking-micro-cap font-mono">
                    Tool Access Permissions & Guardrails
                  </span>
                </div>

                {/* Database / SQL Tools */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowDb}
                      onChange={(e) => setAllowDb(e.target.checked)}
                      className="rounded bg-[#100311] border-[#4a154b] text-[#4a154b] focus:ring-[#4a154b]"
                    />
                    <Database className="w-4 h-4 text-[#1264a3]" />
                    <span className="font-semibold">Allow Database Tools (<code className="text-[#d9bdde] font-mono">db_query</code>)</span>
                  </label>

                  {allowDb && (
                    <div className="ml-6 pl-3 border-l-2 border-[#4a154b]/40 space-y-1">
                      <label className="flex items-center gap-2 text-xs text-[#d9bdde] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sqlReadOnly}
                          onChange={(e) => setSqlReadOnly(e.target.checked)}
                          className="rounded bg-[#100311] border-[#4a154b] text-[#4a154b]"
                        />
                        <span>Enforce Strict AST Read-Only (Blocks DROP, DELETE, UPDATE, ALTER)</span>
                      </label>
                      <p className="text-[10px] text-[#d9bdde]/60">
                        Deep inspection via <code className="text-[#d9bdde] font-mono">sqlparse</code> blocks multi-statement attacks.
                      </p>
                    </div>
                  )}
                </div>

                {/* Web Fetch Tools */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowWeb}
                      onChange={(e) => setAllowWeb(e.target.checked)}
                      className="rounded bg-[#100311] border-[#4a154b] text-[#4a154b]"
                    />
                    <Globe className="w-4 h-4 text-[#38bdf8]" />
                    <span className="font-semibold">Allow Web Tools (<code className="text-[#d9bdde] font-mono">fetch_web</code>)</span>
                  </label>

                  {allowWeb && (
                    <div className="ml-6 pl-3 border-l-2 border-[#4a154b]/40 space-y-1">
                      <label className="text-[11px] text-[#d9bdde] block font-medium">
                        Domain Whitelist (comma-separated wildcards)
                      </label>
                      <input
                        type="text"
                        value={domains}
                        onChange={(e) => setDomains(e.target.value)}
                        placeholder="*.company.com, api.github.com"
                        className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-[#d9bdde]"
                      />
                    </div>
                  )}
                </div>

                {/* Terminal / Bash Tools */}
                <div>
                  <label className="flex items-center gap-2.5 text-xs text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowBash}
                      onChange={(e) => setAllowBash(e.target.checked)}
                      className="rounded bg-[#100311] border-[#4a154b] text-[#cc4117]"
                    />
                    <Terminal className="w-4 h-4 text-[#ff6b4a]" />
                    <span className="font-semibold">Allow Bash Terminal (<code className="text-[#ff8e75] font-mono">bash</code>)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#cc4117]/20 text-[#ff8e75] border border-[#cc4117]/40 font-bold">
                      High Risk
                    </span>
                  </label>
                </div>

                {/* Verdict Multi-Agent Defense Toggle */}
                <div className="pt-2 border-t border-[#4a154b]/30 space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enforceVerdict}
                      onChange={(e) => setEnforceVerdict(e.target.checked)}
                      className="rounded bg-[#100311] border-[#4a154b] text-[#007a5a]"
                    />
                    <Sparkles className="w-4 h-4 text-[#2ecc71]" />
                    <span className="text-[#2ecc71]">
                      Enforce Inline Verdict Safety Debate on Tool Returns
                    </span>
                  </label>
                  <p className="text-[10px] text-[#d9bdde]/70 ml-6">
                    Automatically triggers a fast Prosecutor ⚔️ Defense debate on unverified payloads before agent context ingests them.
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full btn-primary-pill flex items-center justify-center gap-2"
              >
                {isLoading ? "Generating Secure Key..." : "Create Scoped MCP Key"}
              </button>
            </>
          ) : (
            /* Post-Creation Success Screen */
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[#081f14] border border-[#007a5a]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2ecc71] flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Scoped MCP Key Generated Successfully!
                  </span>
                  <span className="text-[10px] font-mono text-[#2ecc71] bg-[#007a5a]/30 px-2.5 py-0.5 rounded-full border border-[#007a5a]/40 font-bold">
                    SHA-256 HASHED
                  </span>
                </div>
                <p className="text-[11px] text-[#d9bdde]">
                  Please copy and store this raw secret key now. It will <strong>never be shown again</strong>.
                </p>

                <div className="flex items-center justify-between bg-[#100311] p-3 rounded-xl border border-[#4a154b]/50 mt-2">
                  <code className="text-xs font-mono text-[#38bdf8] break-all">
                    {createdKeyData.raw_key}
                  </code>
                  <button
                    onClick={handleCopyRawKey}
                    className="p-1.5 ml-2 rounded-full bg-[#4a154b] hover:bg-[#611f69] text-white transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-[#2ecc71]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 1-Click Claude Config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#d9bdde]">
                    1-Click Claude Desktop Configuration Snippet
                  </label>
                  <button
                    onClick={handleCopyConfig}
                    className="text-[11px] text-[#38bdf8] hover:underline font-mono flex items-center gap-1 font-semibold"
                  >
                    {copiedConfig ? <Check className="w-3 h-3 text-[#2ecc71]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedConfig ? "Copied!" : "Copy JSON"}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-[#0d030e] border border-[#4a154b]/40 text-[11px] font-mono text-slate-200 overflow-x-auto">
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
