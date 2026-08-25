"use client";

import React, { useState } from "react";
import { X, Copy, Check, Terminal, Shield, Laptop } from "lucide-react";
import { MCPKey } from "@/lib/types";

interface ConfigSnippetModalProps {
  keyRecord: MCPKey | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigSnippetModal({
  keyRecord,
  isOpen,
  onClose,
}: ConfigSnippetModalProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"claude" | "cursor" | "devin">("claude");

  if (!isOpen || !keyRecord) return null;

  const keyToUse = keyRecord.rawKey || `${keyRecord.keyPrefix}...[SECRET]`;

  const claudeConfig = {
    mcpServers: {
      "haize-sentinel": {
        command: "npx",
        args: [
          "-y",
          "@haizelabs/sentinel-mcp",
          "--key",
          keyToUse,
          "--backend-url",
          "http://localhost:8000",
        ],
      },
    },
  };

  const cursorConfig = {
    mcpServers: {
      "haize-sentinel": {
        type: "command",
        command: `npx -y @haizelabs/sentinel-mcp --key ${keyToUse} --backend-url http://localhost:8000`,
      },
    },
  };

  const devinConfig = {
    agentGovernance: {
      provider: "haize-sentinel-mcp",
      apiKey: keyToUse,
      gatewayEndpoint: "http://localhost:8000/api/mcp/execute-tool",
      sqlGuardrails: keyRecord.sqlReadOnly ? "STRICT_READ_ONLY" : "CUSTOM",
      inlineVerdictDebate: keyRecord.enforceVerdictEval ? "ENABLED" : "DISABLED",
    },
  };

  const getActiveCode = () => {
    switch (activeTab) {
      case "claude":
        return JSON.stringify(claudeConfig, null, 2);
      case "cursor":
        return JSON.stringify(cursorConfig, null, 2);
      case "devin":
        return JSON.stringify(devinConfig, null, 2);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedTab(activeTab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                1-Click Agent Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Configure Claude Desktop, Cursor IDE, or Devin with key: <strong className="text-slate-200">{keyRecord.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-5 pt-3 bg-slate-950/40 gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab("claude")}
            className={`pb-2.5 font-bold transition-all border-b-2 ${
              activeTab === "claude"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Claude Desktop
          </button>
          <button
            onClick={() => setActiveTab("cursor")}
            className={`pb-2.5 font-bold transition-all border-b-2 ${
              activeTab === "cursor"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Cursor IDE (.cursor/mcp.json)
          </button>
          <button
            onClick={() => setActiveTab("devin")}
            className={`pb-2.5 font-bold transition-all border-b-2 ${
              activeTab === "devin"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Devin Agent
          </button>
        </div>

        {/* Code Content */}
        <div className="p-5 space-y-3 bg-slate-950">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              {activeTab === "claude"
                ? "~/Library/Application Support/Claude/claude_desktop_config.json"
                : activeTab === "cursor"
                ? ".cursor/mcp.json"
                : "devin.config.json"}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition-colors"
            >
              {copiedTab === activeTab ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedTab === activeTab ? "Copied!" : "Copy Snippet"}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            <code>{getActiveCode()}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Haize Sentinel automatically proxies tools & validates AST SQL invariants.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
