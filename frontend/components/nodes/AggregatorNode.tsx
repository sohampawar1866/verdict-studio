"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Layers, Combine } from "lucide-react";
import { NodeData } from "@/lib/types";

function AggregatorNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const aggregatorType = nodeData.aggregatorType || "maxpool";

  const getLabel = () => {
    switch (aggregatorType) {
      case "maxpool":
        return { name: "MaxPoolUnit", desc: "Majority Vote (mode)", color: "text-amber-400" };
      case "meanpool":
        return { name: "MeanPoolUnit", desc: "Average Score (mean)", color: "text-cyan-400" };
      case "map":
        return { name: "MapUnit", desc: "Custom Transform", color: "text-purple-400" };
      default:
        return { name: "MaxPoolUnit", desc: "Majority Vote", color: "text-amber-400" };
    }
  };

  const info = getLabel();

  return (
    <div
      className={`w-64 rounded-xl bg-slate-900/95 border transition-all shadow-xl backdrop-blur ${
        selected
          ? "border-slate-400 ring-2 ring-slate-500/30 shadow-slate-500/20"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Combine className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200">{info.name}</span>
            <span className="text-[10px] text-slate-500 block font-mono">Aggregation Layer</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Transform
        </span>
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Operation:</span>
          <span className={`font-mono text-[11px] font-bold ${info.color}`}>{info.desc}</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          {aggregatorType === "maxpool"
            ? "Applies statistics.mode across replicated units"
            : "Aggregates numerical score distributions"}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(AggregatorNodeComponent);
