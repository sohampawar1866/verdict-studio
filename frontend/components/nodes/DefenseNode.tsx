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
      className={`w-72 rounded-2xl bg-[#1e0d20] border transition-all shadow-xl backdrop-blur relative select-none ${
        selected
          ? "border-[#007a5a] ring-2 ring-[#007a5a]/40 shadow-[#007a5a]/20"
          : "border-[#4a154b]/40 hover:border-[#007a5a]/50"
      } ${isExecuting ? "border-[#007a5a] animate-pulse shadow-lg shadow-[#007a5a]/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-[#007a5a] !border-2 !border-white hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2a102d] border-b border-[#4a154b]/40 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#007a5a]/20 border border-[#007a5a]/40 flex items-center justify-center text-[#2ecc71] shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">
              {nodeData.name || "DefenseUnit"}
            </span>
            <span className="text-[10px] text-[#d9bdde]/80 block font-mono">Constructive Counsel</span>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-[#007a5a]/20 text-[#2ecc71] border border-[#007a5a]/30">
          Unit
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        {/* Model Badge */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#d9bdde] flex items-center gap-1.5 font-mono">
            <Cpu className="w-3 h-3 text-[#2ecc71]" />
            <span>{nodeData.model || "gpt-4o"}</span>
          </span>
          <span className="text-[10px] font-mono text-[#d9bdde]/60">
            T={nodeData.temperature !== undefined ? nodeData.temperature : 0.7}
          </span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-[#120613] rounded-xl p-2.5 border border-[#4a154b]/40 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Defend candidate payload merits, normal business intent, and utility..."}
        </div>

        {/* Live Streaming Token Preview if active */}
        {nodeData.streamingTokens && (
          <div className="p-2.5 rounded-xl bg-[#0a2318] border border-[#007a5a]/40 text-[10px] font-mono text-[#2ecc71] animate-fade-in">
            <span className="flex items-center gap-1 text-[#2ecc71] font-bold mb-0.5">
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
        className="!w-3.5 !h-3.5 !bg-[#007a5a] !border-2 !border-white hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(DefenseNodeComponent);
