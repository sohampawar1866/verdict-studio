"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { SearchCheck, Cpu, Sparkles } from "lucide-react";
import { NodeData } from "@/lib/types";

function FactCheckerNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const isExecuting = nodeData.executionState === "running";

  return (
    <div
      className={`w-72 rounded-2xl bg-[#1e0d20] border transition-all shadow-xl backdrop-blur relative select-none ${
        selected
          ? "border-[#1264a3] ring-2 ring-[#1264a3]/40 shadow-[#1264a3]/20"
          : "border-[#4a154b]/40 hover:border-[#1264a3]/50"
      } ${isExecuting ? "border-[#1264a3] animate-pulse shadow-lg shadow-[#1264a3]/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-[#1264a3] !border-2 !border-white hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2a102d] border-b border-[#4a154b]/40 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#1264a3]/20 border border-[#1264a3]/40 flex items-center justify-center text-[#38bdf8] shadow-sm">
            <SearchCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">
              {nodeData.name || "FactCheckerUnit"}
            </span>
            <span className="text-[10px] text-[#d9bdde]/80 block font-mono">Claim Verifier</span>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-[#1264a3]/20 text-[#38bdf8] border border-[#1264a3]/30">
          Unit
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        {/* Model Badge */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#d9bdde] flex items-center gap-1.5 font-mono">
            <Cpu className="w-3 h-3 text-[#38bdf8]" />
            <span>{nodeData.model || "gpt-4o-mini"}</span>
          </span>
          <span className="text-[10px] font-mono text-[#d9bdde]/60">
            T={nodeData.temperature !== undefined ? nodeData.temperature : 0.0}
          </span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-[#120613] rounded-xl p-2.5 border border-[#4a154b]/40 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Verify factual claims against reference context: {source.document}"}
        </div>

        {/* Live Streaming Token Preview if active */}
        {nodeData.streamingTokens && (
          <div className="p-2.5 rounded-xl bg-[#091b2c] border border-[#1264a3]/40 text-[10px] font-mono text-[#38bdf8] animate-fade-in">
            <span className="flex items-center gap-1 text-[#38bdf8] font-bold mb-0.5">
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              Verifying:
            </span>
            <div className="line-clamp-2">{nodeData.streamingTokens}</div>
          </div>
        )}
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-[#1264a3] !border-2 !border-white hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(FactCheckerNodeComponent);
