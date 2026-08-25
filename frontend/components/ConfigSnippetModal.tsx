"use client";

import React, { useState } from "react";
import { X, Copy, Check, Terminal, Laptop, Code2 } from "lucide-react";
import { MCPKey } from "@/lib/types";

interface ConfigSnippetModalProps {
  keyData: MCPKey | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigSnippetModal({
  keyData,
  isOpen,
  onClose,
}: ConfigSnippetModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"claude" | "cursor" | "devin">("claude");

  if (!isOpen || !keyData) return null;

  const keyToUse = keyData.rawKey || `${keyData.keyPrefix}...[SECRET]`;

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
        command: "node",
        args: [
          "/path/to/verdict_studio/mcp-gateway/dist/index.js",
          "--key",
          keyToUse,
        ],
        env: {
          HAIZE_BACKEND_URL: "http://localhost:8000",
        },
      },
    },
  };

  const devinSnippet = `# Run in Devin Shell / Custom Agent Environment
export HAIZE_MCP_KEY="${keyToUse}"
export HAIZE_BACKEND_URL="http://localhost:8000"

# Launch Sentinel Gateway
npx -y @haizelabs/sentinel-mcp --key $HAIZE_MCP_KEY
`;

  const currentSnippet =
    activeTab === "claude"
      ? JSON.stringify(claudeConfig, null, 2)
      : activeTab === "cursor"
      ? JSON.stringify(cursorConfig, null, 2)
      : devinSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#4a154b]/30 flex items-center justify-between bg-[#230c25]">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Agent Integration Snippets
            </h2>
            <p className="text-xs text-[#d9bdde]/80 mt-0.5">
              Target configuration for <strong className="text-white">{keyData.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#d9bdde]/70 hover:text-white hover:bg-[#4a154b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-3 bg-[#1e0a20] border-b border-[#4a154b]/30">
          <button
            onClick={() => setActiveTab("claude")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "claude"
                ? "bg-[#4a154b] text-white shadow-sm border border-[#d9bdde]/30"
                : "text-[#d9bdde]/70 hover:text-white hover:bg-[#2e1030]"
            }`}
          >
            Claude Desktop
          </button>
          <button
            onClick={() => setActiveTab("cursor")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "cursor"
                ? "bg-[#4a154b] text-white shadow-sm border border-[#d9bdde]/30"
                : "text-[#d9bdde]/70 hover:text-white hover:bg-[#2e1030]"
            }`}
          >
            Cursor IDE
          </button>
          <button
            onClick={() => setActiveTab("devin")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "devin"
                ? "bg-[#4a154b] text-white shadow-sm border border-[#d9bdde]/30"
                : "text-[#d9bdde]/70 hover:text-white hover:bg-[#2e1030]"
            }`}
          >
            Devin / Bash
          </button>
        </div>

        {/* Code Snippet */}
        <div className="p-5 space-y-4">
          <div className="text-[11px] text-[#d9bdde] flex items-center justify-between">
            <span>
              Paste into{" "}
              <code className="text-[#38bdf8] font-mono font-semibold">
                {activeTab === "claude"
                  ? "claude_desktop_config.json"
                  : activeTab === "cursor"
                  ? ".cursor/mcp.json"
                  : "Environment Variables"}
              </code>
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] text-[#38bdf8] hover:underline font-mono flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2ecc71]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Configuration"}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-[#0d030e] border border-[#4a154b]/40 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-64">
            <code>{currentSnippet}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#4a154b]/30 bg-[#230c25] flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn-primary-pill"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
