"use client";

import React from "react";
import {
  FileInput,
  ShieldAlert,
  ShieldCheck,
  SearchCheck,
  Gavel,
  Brain,
  Combine,
  Plus,
} from "lucide-react";
import { VerdictNodeType } from "@/lib/types";

interface NodePaletteProps {
  onAddNode?: (type: VerdictNodeType) => void;
}

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  const categories = [
    {
      title: "Data Sources",
      nodes: [
        {
          type: "input" as VerdictNodeType,
          name: "Input Schema",
          desc: "Source query & variables",
          icon: FileInput,
          border: "border-[#1264a3]/40 hover:border-[#1264a3]",
          iconColor: "text-[#38bdf8] bg-[#1264a3]/20",
        },
      ],
    },
    {
      title: "Debate & Judges",
      nodes: [
        {
          type: "prosecutor" as VerdictNodeType,
          name: "Prosecutor Unit",
          desc: "Adversarial critique",
          icon: ShieldAlert,
          border: "border-[#cc4117]/40 hover:border-[#cc4117]",
          iconColor: "text-[#ff8e75] bg-[#cc4117]/20",
        },
        {
          type: "defense" as VerdictNodeType,
          name: "Defense Unit",
          desc: "Constructive counsel",
          icon: ShieldCheck,
          border: "border-[#007a5a]/40 hover:border-[#007a5a]",
          iconColor: "text-[#2ecc71] bg-[#007a5a]/20",
        },
        {
          type: "factchecker" as VerdictNodeType,
          name: "Fact Checker Unit",
          desc: "Empirical claim verifier",
          icon: SearchCheck,
          border: "border-[#1264a3]/40 hover:border-[#1264a3]",
          iconColor: "text-[#38bdf8] bg-[#1264a3]/20",
        },
        {
          type: "chiefjustice" as VerdictNodeType,
          name: "Chief Justice",
          desc: "Adjudicator & final ruling",
          icon: Gavel,
          border: "border-[#f59e0b]/40 hover:border-[#f59e0b]",
          iconColor: "text-[#f59e0b] bg-[#f59e0b]/20",
        },
      ],
    },
    {
      title: "Reasoning & Aggregation",
      nodes: [
        {
          type: "cot" as VerdictNodeType,
          name: "CoT Unit",
          desc: "Step-by-step thinking",
          icon: Brain,
          border: "border-[#a855f7]/40 hover:border-[#a855f7]",
          iconColor: "text-[#c084fc] bg-[#a855f7]/20",
        },
        {
          type: "aggregator" as VerdictNodeType,
          name: "MaxPool (Majority)",
          desc: "Majority vote aggregator",
          icon: Combine,
          border: "border-[#d9bdde]/40 hover:border-[#d9bdde]",
          iconColor: "text-[#d9bdde] bg-[#4a154b]/40",
        },
      ],
    },
  ];

  const handleDragStart = (e: React.DragEvent, type: VerdictNodeType) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-[#140615] border-r border-[#4a154b]/30 flex flex-col h-full overflow-y-auto select-none p-4 space-y-5">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Verdict Node Palette
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Drag nodes to canvas or click to add
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              {cat.title}
            </span>
            <div className="space-y-2">
              {cat.nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    onClick={() => onAddNode && onAddNode(node.type)}
                    className={`p-2.5 rounded-2xl bg-[#1d0a1f] border ${node.border} cursor-grab active:cursor-grabbing hover:bg-[#280e2a] transition-all group flex items-center justify-between shadow-sm`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${node.iconColor}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate group-hover:text-[#d9bdde]">
                          {node.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {node.desc}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#4a154b] rounded-full text-[#d9bdde] hover:text-white transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
