"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Gavel, Cpu, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { NodeData } from "@/lib/types";

function ChiefJusticeNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const isExecuting = nodeData.executionState === "running";
  const outputScore = nodeData.outputScore;

  return (
    <div
      className={`w-72 rounded-2xl bg-[#230c25] border-2 transition-all shadow-2xl backdrop-blur relative select-none ${
        selected
          ? "border-[#f59e0b] ring-4 ring-[#f59e0b]/20 shadow-[#f59e0b]/30"
          : "border-[#4a154b] hover:border-[#f59e0b]/60"
      } ${isExecuting ? "border-[#f59e0b] animate-pulse shadow-lg shadow-[#f59e0b]/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-[#f59e0b] !border-2 !border-white hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#331137] border-b border-[#4a154b] rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#4a154b] border border-[#f59e0b]/40 flex items-center justify-center text-[#f59e0b] shadow-sm">
            <Gavel className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">
              {nodeData.name || "ChiefJustice"}
            </span>
            <span className="text-[10px] text-[#d9bdde]/80 block font-mono">CategoricalJudgeUnit</span>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
          Judge
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        {/* Model & Scale */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#d9bdde] flex items-center gap-1.5 font-mono">
            <Cpu className="w-3 h-3 text-[#f59e0b]" />
            <span>{nodeData.model || "gpt-4o"}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#120613] text-[#f59e0b] border border-[#f59e0b]/30">
            Scale: {nodeData.scaleType || "discrete"}
          </span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-[#120613] rounded-xl p-2.5 border border-[#4a154b]/40 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Weigh arguments from Prosecution and Defense. Render final ruling..."}
        </div>

        {/* Live Streaming Token Preview if active */}
        {nodeData.streamingTokens && (
          <div className="p-2.5 rounded-xl bg-[#2a1a0c] border border-[#f59e0b]/40 text-[10px] font-mono text-[#f59e0b] animate-fade-in">
            <span className="flex items-center gap-1 text-[#f59e0b] font-bold mb-0.5">
              <Sparkles className="w-2.5 h-2.5 animate-spin" />
              Adjudicating:
            </span>
            <div className="line-clamp-2">{nodeData.streamingTokens}</div>
          </div>
        )}

        {/* Final Decision Output Badge */}
        {outputScore !== undefined && (
          <div
            className={`p-2.5 rounded-xl text-center text-xs font-mono font-bold border flex items-center justify-center gap-2 ${
              String(outputScore).includes("BLOCK")
                ? "bg-[#2a0b12] text-[#ff8e75] border-[#cc4117]/50"
                : "bg-[#0a2318] text-[#2ecc71] border-[#007a5a]/50"
            }`}
          >
            {String(outputScore).includes("BLOCK") ? (
              <AlertTriangle className="w-4 h-4 text-[#ff6b4a]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#2ecc71]" />
            )}
            <span>RULING: {String(outputScore)}</span>
          </div>
        )}
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-[#f59e0b] !border-2 !border-white hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(ChiefJusticeNodeComponent);
