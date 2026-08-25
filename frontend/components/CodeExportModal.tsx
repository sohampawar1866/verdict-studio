"use client";

import React, { useState } from "react";
import { X, Copy, Check, Download, Terminal, Code2 } from "lucide-react";
import { DAGGraph } from "@/lib/types";
import { generateVerdictPythonCode } from "@/lib/codeExporter";

interface CodeExportModalProps {
  dag: DAGGraph;
  isOpen: boolean;
  onClose: () => void;
}

export default function CodeExportModal({ dag, isOpen, onClose }: CodeExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonCode = generateVerdictPythonCode(dag);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/x-python;charset=utf-8," + encodeURIComponent(pythonCode);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${dag.name.toLowerCase().replace(/\s+/g, "_")}.py`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-[#170718] border border-[#4a154b]/40 rounded-2xl max-w-4xl w-full flex flex-col max-h-[88vh] shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#4a154b]/30 flex items-center justify-between bg-[#230c25]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4a154b] border border-[#d9bdde]/30 flex items-center justify-center text-white shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
                1-Click Python Code Exporter
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#4a154b]/60 text-[#d9bdde] border border-[#d9bdde]/20 font-bold">
                  haizelabs/verdict v0.2.x
                </span>
              </h2>
              <p className="text-xs text-[#d9bdde]/80 mt-0.5">
                Native standalone script matching the visual DAG graph on canvas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#d9bdde]/70 hover:text-white hover:bg-[#4a154b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#0d030e] font-mono text-xs text-slate-200 leading-relaxed relative">
          <pre className="overflow-x-auto selection:bg-[#4a154b]/60">
            <code>{pythonCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#4a154b]/30 bg-[#230c25] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#d9bdde] font-mono">
            <Terminal className="w-4 h-4 text-[#d9bdde]" />
            <span>pip install verdict pydantic litellm</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="btn-secondary-pill flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download .py</span>
            </button>

            <button
              onClick={handleCopy}
              className="btn-primary-pill flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-[#2ecc71]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Code"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
