"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Brain, Cpu, Sparkles } from "lucide-react";
import { NodeData } from "@/lib/types";

function CoTNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const isExecuting = nodeData.executionState === "running";

  return (
    <div
      className={`w-72 rounded-2xl bg-[#1e0d20] border transition-all shadow-xl backdrop-blur relative select-none ${
        selected
          ? "border-[#a855f7] ring-2 ring-[#a855f7]/40 shadow-[#a855f7]/20"
          : "border-[#4a154b]/40 hover:border-[#a855f7]/50"
      } ${isExecuting ? "border-[#a855f7] animate-pulse shadow-lg shadow-[#a855f7]/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-[#a855f7] !border-2 !border-white hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2a102d] border-b border-[#4a154b]/40 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#a855f7]/20 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc] shadow-sm">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">
              {nodeData.name || "CoTUnit"}
            </span>
            <span className="text-[10px] text-[#d9bdde]/80 block font-mono">Chain-of-Thought Reasoning</span>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/30">
          Reasoning
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        {/* Model Badge */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#d9bdde] flex items-center gap-1.5 font-mono">
            <Cpu className="w-3 h-3 text-[#c084fc]" />
            <span>{nodeData.model || "gpt-4o"}</span>
          </span>
          <span className="text-[10px] font-mono text-[#d9bdde]/60">
            T={nodeData.temperature !== undefined ? nodeData.temperature : 0.7}
          </span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-[#120613] rounded-xl p-2.5 border border-[#4a154b]/40 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Deconstruct the premise step-by-step before making a claim..."}
        </div>

        {/* Live Streaming Token Preview if active */}
        {nodeData.streamingTokens && (
          <div className="p-2.5 rounded-xl bg-[#230d2d] border border-[#a855f7]/40 text-[10px] font-mono text-[#c084fc] animate-fade-in">
            <span className="flex items-center gap-1 text-[#c084fc] font-bold mb-0.5">
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              Thinking:
            </span>
            <div className="line-clamp-2">{nodeData.streamingTokens}</div>
          </div>
        )}
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-[#a855f7] !border-2 !border-white hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(CoTNodeComponent);
