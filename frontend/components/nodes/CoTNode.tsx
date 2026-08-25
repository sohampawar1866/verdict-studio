"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Brain, Cpu } from "lucide-react";
import { NodeData } from "@/lib/types";

function CoTNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const isExecuting = nodeData.executionState === "running";

  return (
    <div
      className={`w-72 rounded-xl bg-slate-900/95 border transition-all shadow-xl backdrop-blur relative ${
        selected
          ? "border-purple-400 ring-2 ring-purple-500/30 shadow-purple-500/20"
          : "border-slate-800 hover:border-slate-700"
      } ${isExecuting ? "border-purple-400 animate-pulse shadow-lg shadow-purple-500/30" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />

      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200">
              {nodeData.name || "CoTUnit"}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">Chain of Thought</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
          Reasoning
        </span>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span className="font-mono">{nodeData.model || "gpt-4o"}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            T={nodeData.temperature !== undefined ? nodeData.temperature : 0.5}
          </span>
        </div>

        <div className="bg-slate-950/90 rounded-lg p-2 border border-slate-800/80 text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
          {nodeData.prompt || "Think step by step and evaluate the reasoning quality..."}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(CoTNodeComponent);
