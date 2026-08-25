"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Layers } from "lucide-react";
import { NodeData } from "@/lib/types";

function AggregatorNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const isExecuting = nodeData.executionState === "running";
  const aggType = nodeData.aggregatorType || "maxpool";

  return (
    <div
      className={`w-72 rounded-2xl bg-[#1e0d20] border transition-all shadow-xl backdrop-blur relative select-none ${
        selected
          ? "border-[#d9bdde] ring-2 ring-[#4a154b]/40 shadow-[#4a154b]/20"
          : "border-[#4a154b]/40 hover:border-[#d9bdde]/50"
      } ${isExecuting ? "border-[#d9bdde] animate-pulse shadow-lg shadow-[#4a154b]/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-[#d9bdde] !border-2 !border-white hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2a102d] border-b border-[#4a154b]/40 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#4a154b] flex items-center justify-center text-white shadow-sm">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">
              {nodeData.name || (aggType === "maxpool" ? "MaxPoolUnit" : "MeanPoolUnit")}
            </span>
            <span className="font-mono text-[11px] text-[#d9bdde]/80 block font-semibold">Transform / Aggregator</span>
          </div>
        </div>
        <span className="font-mono text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#4a154b]/40 text-[#d9bdde] border border-[#d9bdde]/30">
          Transform
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        <div className="text-xs text-[#d9bdde]/90 font-mono">
          {aggType === "maxpool" ? (
            <span className="text-emerald-400 font-semibold font-mono">● Majority Voting (statistics.mode)</span>
          ) : aggType === "meanpool" ? (
            <span className="text-sky-400 font-semibold font-mono">● Numerical Average (statistics.mean)</span>
          ) : (
            <span className="text-purple-400 font-semibold font-mono">● Custom Transformation Map</span>
          )}
        </div>

        <div className="bg-[#120613] rounded-xl p-2.5 border border-[#4a154b]/40 text-xs font-mono text-slate-300">
          Aggregates outputs from upstream parallel layer units into a unified consensus verdict.
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-[#d9bdde] !border-2 !border-white hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(AggregatorNodeComponent);
