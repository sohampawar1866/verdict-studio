"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { FileInput, Database } from "lucide-react";
import { NodeData } from "@/lib/types";

function InputNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const fields = (nodeData.fields as string[]) || ["query", "document", "claim"];

  return (
    <div
      className={`w-64 rounded-xl bg-slate-900/95 border transition-all shadow-xl backdrop-blur ${
        selected
          ? "border-cyan-400 ring-2 ring-cyan-500/30 shadow-cyan-500/20"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileInput className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200">Input Schema</span>
            <span className="text-[10px] text-slate-500 block font-mono">verdict.schema.Schema</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
          Source
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2">
        <div className="text-[11px] text-slate-400">
          Pipeline input fields passed into downstream units via <code className="text-cyan-300 font-mono">{"{source.*}"}</code>
        </div>
        <div className="flex flex-wrap gap-1">
          {fields.map((f, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
            >
              <Database className="w-2.5 h-2.5 text-blue-400" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-950 hover:!scale-125 transition-transform"
      />
    </div>
  );
}

export default memo(InputNodeComponent);
