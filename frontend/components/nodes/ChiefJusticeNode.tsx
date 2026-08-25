"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Gavel, Cpu, CheckCircle2, XCircle } from "lucide-react";
import { NodeData } from "@/lib/types";

function ChiefJusticeNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const isExecuting = nodeData.executionState === "running";
  const outputScore = nodeData.outputScore;

  return (
    <div
      className={`w-72 rounded-xl bg-slate-900/95 border transition-all shadow-xl backdrop-blur relative ${
        selected
          ? "border-amber-400 ring-2 ring-amber-500/30 shadow-amber-500/20"
          : "border-slate-800 hover:border-slate-700"
      } ${isExecuting ? "border-amber-400 animate-pulse shadow-lg shadow-amber-500/30" : ""}`}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Gavel className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200">
              {nodeData.name || "ChiefJustice"}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">CategoricalJudgeUnit</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
          Judge
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-amber-400" />
            <span className="font-mono">{nodeData.model || "gpt-4o"}</span>
          </span>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/30">
            {nodeData.scaleType ? `Scale: ${nodeData.scaleType}` : "DiscreteScale"}
          </span>
        </div>

        <div className="bg-slate-950/90 rounded-lg p-2 border border-slate-800/80 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Weigh prosecution arguments, defense justifications, and render final verdict..."}
        </div>

        {/* Final Verdict Output Badge */}
        {outputScore !== undefined && outputScore !== null && (
          <div
            className={`p-2 rounded-lg border flex items-center justify-between font-mono text-xs font-bold ${
              String(outputScore).toUpperCase().includes("PASS") || outputScore === true || Number(outputScore) >= 4
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {String(outputScore).toUpperCase().includes("PASS") || outputScore === true || Number(outputScore) >= 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              Ruling:
            </span>
            <span className="text-sm tracking-wide">{String(outputScore)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ChiefJusticeNodeComponent);
