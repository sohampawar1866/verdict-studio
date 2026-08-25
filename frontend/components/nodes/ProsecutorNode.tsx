"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { ShieldAlert, Cpu, Sparkles } from "lucide-react";
import { NodeData } from "@/lib/types";

function ProsecutorNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const isExecuting = nodeData.executionState === "running";

  return (
    <div
      className={`w-72 rounded-xl bg-slate-900/95 border transition-all shadow-xl backdrop-blur relative ${
        selected
          ? "border-red-500 ring-2 ring-red-500/30 shadow-red-500/20"
          : "border-slate-800 hover:border-slate-700"
      } ${isExecuting ? "border-red-400 animate-pulse shadow-lg shadow-red-500/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-red-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200">
              {nodeData.name || "ProsecutorUnit"}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">Adversarial Debater</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
          Unit
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2">
        {/* Model Badge */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-red-400" />
            <span className="font-mono">{nodeData.model || "claude-3-5-sonnet"}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            T={nodeData.temperature !== undefined ? nodeData.temperature : 0.7}
          </span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-slate-950/90 rounded-lg p-2 border border-slate-800/80 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Identify all factual risks, policy violations, or hallucinations..."}
        </div>

        {/* Live Streaming Token Preview if active */}
        {nodeData.streamingTokens && (
          <div className="p-2 rounded bg-red-950/30 border border-red-800/40 text-[10px] font-mono text-red-300 animate-fade-in">
            <span className="flex items-center gap-1 text-red-400 font-bold mb-0.5">
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              Arguing:
            </span>
            <div className="line-clamp-2">{nodeData.streamingTokens}</div>
          </div>
        )}
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-red-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(ProsecutorNodeComponent);
