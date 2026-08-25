"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { FileInput, Database } from "lucide-react";
import { NodeData } from "@/lib/types";

function InputNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const fields = (nodeData.fields as string[]) || ["query", "document", "tool_output"];

  return (
    <div
      className={`w-72 rounded-2xl bg-[#1e0d20] border transition-all shadow-xl backdrop-blur select-none ${
        selected
          ? "border-[#d9bdde] ring-2 ring-[#4a154b]/50 shadow-[#4a154b]/30"
          : "border-[#4a154b]/40 hover:border-[#d9bdde]/50"
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2a102d] border-b border-[#4a154b]/40 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#4a154b] flex items-center justify-center text-white shadow-sm">
            <FileInput className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">Input Schema</span>
            <span className="text-[10px] text-[#d9bdde]/80 block font-mono">verdict.schema.Schema</span>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full bg-[#4a154b]/60 text-[#d9bdde] border border-[#d9bdde]/20">
          Source
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2.5">
        <p className="text-[11px] text-[#d9bdde]/90 leading-relaxed font-sans">
          Pipeline input fields passed into downstream units via <code className="text-[#38bdf8] font-mono">{"{source.*}"}</code>
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {fields.map((f, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#120613] border border-[#4a154b]/50 text-slate-200 flex items-center gap-1.5"
            >
              <Database className="w-2.5 h-2.5 text-[#1264a3]" />
              <span>{f}</span>
            </span>
          ))}
        </div>
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

export default memo(InputNodeComponent);
