"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { ShieldCheck, Cpu, Sparkles } from "lucide-react";
import { NodeData } from "@/lib/types";

function DefenseNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const isExecuting = nodeData.executionState === "running";

  return (
    <div
      className={`w-72 rounded-xl bg-slate-900/95 border transition-all shadow-xl backdrop-blur relative ${
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/20"
          : "border-slate-800 hover:border-slate-700"
      } ${isExecuting ? "border-emerald-400 animate-pulse shadow-lg shadow-emerald-500/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200">
              {nodeData.name || "DefenseUnit"}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">Constructive Counsel</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
          Unit
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2">
        {/* Model Badge */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span className="font-mono">{nodeData.model || "gpt-4o"}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            T={nodeData.temperature !== undefined ? nodeData.temperature : 0.7}
          </span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-slate-950/90 rounded-lg p-2 border border-slate-800/80 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Defend the safety, utility, and factual merits of the candidate response..."}
        </div>

        {/* Live Streaming Token Preview */}
        {nodeData.streamingTokens && (
          <div className="p-2 rounded bg-emerald-950/30 border border-emerald-800/40 text-[10px] font-mono text-emerald-300 animate-fade-in">
            <span className="flex items-center gap-1 text-emerald-400 font-bold mb-0.5">
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              Defending:
            </span>
            <div className="line-clamp-2">{nodeData.streamingTokens}</div>
          </div>
        )}
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(DefenseNodeComponent);
