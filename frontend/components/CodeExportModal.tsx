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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full flex flex-col max-h-[88vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                1-Click Python Code Exporter
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  haizelabs/verdict v0.2.x
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Native standalone script matching the visual DAG graph on canvas
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

        {/* Code Content */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed relative">
          <pre className="overflow-x-auto selection:bg-cyan-500/30">
            <code>{pythonCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>pip install verdict pydantic litellm</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download .py</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Code"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
