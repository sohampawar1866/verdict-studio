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
      className={`w-72 rounded-2xl bg-[#1e0d20] border transition-all shadow-xl backdrop-blur relative select-none ${
        selected
          ? "border-[#cc4117] ring-2 ring-[#cc4117]/40 shadow-[#cc4117]/20"
          : "border-[#4a154b]/40 hover:border-[#cc4117]/50"
      } ${isExecuting ? "border-[#cc4117] animate-pulse shadow-lg shadow-[#cc4117]/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-[#cc4117] !border-2 !border-white hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2a102d] border-b border-[#4a154b]/40 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#cc4117]/20 border border-[#cc4117]/40 flex items-center justify-center text-[#ff6b4a] shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">
              {nodeData.name || "ProsecutorUnit"}
            </span>
            <span className="font-mono text-[11px] text-[#d9bdde]/80 block font-semibold">Adversarial Debater</span>
          </div>
        </div>
        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#cc4117]/20 text-[#ff8e75] border border-[#cc4117]/30">
          Unit
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        {/* Model Badge */}
        <div className="flex items-center justify-between font-mono text-[11px] font-semibold">
          <span className="text-[#d9bdde] flex items-center gap-1.5 font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#ff6b4a]" />
            <span>{nodeData.model || "claude-3-5-sonnet"}</span>
          </span>
          <span className="font-mono text-[11px] text-[#d9bdde]/70 font-semibold">
            T={nodeData.temperature !== undefined ? nodeData.temperature : 0.7}
          </span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-[#120613] rounded-xl p-2.5 border border-[#4a154b]/40 text-xs font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Identify all factual risks, policy violations, or hallucinations..."}
        </div>

        {/* Live Streaming Token Preview if active */}
        {nodeData.streamingTokens && (
          <div className="p-2.5 rounded-xl bg-[#2a0b12] border border-[#cc4117]/40 font-mono text-[11px] text-[#ff8e75] animate-fade-in">
            <span className="flex items-center gap-1 text-[#ff6b4a] font-bold mb-0.5">
              <Sparkles className="w-3 h-3 animate-spin" />
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
        className="!w-3.5 !h-3.5 !bg-[#cc4117] !border-2 !border-white hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(ProsecutorNodeComponent);
