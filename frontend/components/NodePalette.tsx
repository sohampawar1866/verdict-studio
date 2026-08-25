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
          desc: "Source query, document & claim variables",
          icon: FileInput,
          border: "border-blue-500/30 hover:border-blue-400",
          iconColor: "text-blue-400 bg-blue-500/10",
        },
      ],
    },
    {
      title: "Debate & Judges",
      nodes: [
        {
          type: "prosecutor" as VerdictNodeType,
          name: "Prosecutor Unit",
          desc: "Adversarial critique & risk finder",
          icon: ShieldAlert,
          border: "border-red-500/30 hover:border-red-400",
          iconColor: "text-red-400 bg-red-500/10",
        },
        {
          type: "defense" as VerdictNodeType,
          name: "Defense Unit",
          desc: "Constructive defense & merit advocate",
          icon: ShieldCheck,
          border: "border-emerald-500/30 hover:border-emerald-400",
          iconColor: "text-emerald-400 bg-emerald-500/10",
        },
        {
          type: "factchecker" as VerdictNodeType,
          name: "Fact Checker Unit",
          desc: "Empirical claim & context verifier",
          icon: SearchCheck,
          border: "border-sky-500/30 hover:border-sky-400",
          iconColor: "text-sky-400 bg-sky-500/10",
        },
        {
          type: "chiefjustice" as VerdictNodeType,
          name: "Chief Justice",
          desc: "Adjudicator & final verdict extractor",
          icon: Gavel,
          border: "border-amber-500/30 hover:border-amber-400",
          iconColor: "text-amber-400 bg-amber-500/10",
        },
      ],
    },
    {
      title: "Reasoning & Aggregation",
      nodes: [
        {
          type: "cot" as VerdictNodeType,
          name: "CoT Unit",
          desc: "Step-by-step thinking scratchpad",
          icon: Brain,
          border: "border-purple-500/30 hover:border-purple-400",
          iconColor: "text-purple-400 bg-purple-500/10",
        },
        {
          type: "aggregator" as VerdictNodeType,
          name: "MaxPool (Majority)",
          desc: "Majority voting / mode aggregation",
          icon: Combine,
          border: "border-slate-600 hover:border-slate-400",
          iconColor: "text-slate-300 bg-slate-800",
        },
      ],
    },
  ];

  const handleDragStart = (e: React.DragEvent, type: VerdictNodeType) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full overflow-y-auto select-none p-4 space-y-5">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Verdict Node Palette
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Drag nodes to canvas or click + to add
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-2">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
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
                    className={`p-2.5 rounded-xl bg-slate-950/80 border ${node.border} cursor-grab active:cursor-grabbing hover:bg-slate-900 transition-all group flex items-center justify-between shadow-sm`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${node.iconColor}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                          {node.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {node.desc}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-opacity"
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
