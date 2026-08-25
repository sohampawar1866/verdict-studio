"use client";

import React from "react";
import { X, Cpu, Sliders, FileText, Layers, Trash2, Scale } from "lucide-react";
import { DAGNode, NodeData, VerdictScaleType, AggregatorType } from "@/lib/types";

interface NodeConfigDrawerProps {
  selectedNode: DAGNode | null;
  onUpdateNode: (nodeId: string, updatedData: Partial<NodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

const AVAILABLE_MODELS = [
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  { id: "o1-mini", name: "o1-mini", provider: "openai" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "open-source" },
];

export default function NodeConfigDrawer({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onClose,
}: NodeConfigDrawerProps) {
  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;

  const insertVariableChip = (variable: string) => {
    const currentPrompt = data.prompt || "";
    onUpdateNode(id, { prompt: `${currentPrompt} ${variable}` });
  };

  return (
    <div className="w-72 bg-[#170718] border-l border-[#4a154b]/30 flex flex-col h-full overflow-y-auto select-none p-4 space-y-5 z-20 shadow-2xl font-sans flex-shrink-0">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-[#4a154b]/30 pb-3">
        <div>
          <span className="text-[10px] font-mono text-[#d9bdde] uppercase tracking-wider font-bold block">
            Node Configuration
          </span>
          <h3 className="text-sm font-bold text-white capitalize flex items-center gap-1.5 mt-0.5 truncate max-w-[180px]">
            {data.name || `${type} Node`}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-[#d9bdde]/70 hover:text-white hover:bg-[#4a154b] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Basic Node Info */}
      <div className="space-y-3.5">
        <div>
          <label className="text-xs font-semibold text-slate-200 block mb-1">
            Unit Name / Identifier
          </label>
          <input
            type="text"
            value={data.name || ""}
            onChange={(e) => onUpdateNode(id, { name: e.target.value })}
            placeholder="e.g. ProsecutorUnit"
            className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono"
          />
        </div>

        {/* Model Selection (.via()) for LLM Units */}
        {type !== "input" && type !== "aggregator" && (
          <div>
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#1264a3]" />
                Backend Model (<code className="text-[#38bdf8] font-mono text-[10px]">.via()</code>)
              </span>
            </label>
            <select
              value={data.model || "gpt-4o"}
              onChange={(e) => onUpdateNode(id, { model: e.target.value })}
              className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono cursor-pointer"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Temperature & Inference Parameters */}
        {type !== "input" && type !== "aggregator" && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 flex items-center gap-1.5 font-medium">
                <Sliders className="w-3.5 h-3.5 text-[#f59e0b]" />
                Temperature
              </span>
              <span className="font-mono text-white text-[10px] font-bold bg-[#4a154b]/40 px-2 py-0.5 rounded-full border border-[#d9bdde]/20">
                {data.temperature !== undefined ? data.temperature : 0.7}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={data.temperature !== undefined ? data.temperature : 0.7}
              onChange={(e) => onUpdateNode(id, { temperature: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#2a0e2d] rounded-full appearance-none cursor-pointer accent-[#4a154b]"
            />
          </div>
        )}
      </div>

      {/* Scale Selector for Chief Justice & Judges */}
      {(type === "chiefjustice" || data.scaleType) && (
        <div className="space-y-2 pt-3 border-t border-[#4a154b]/30">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#f59e0b]" />
            Verdict Scale (<code className="text-[#38bdf8] font-mono text-[10px]">verdict.scale</code>)
          </label>
          <select
            value={data.scaleType || "discrete"}
            onChange={(e) =>
              onUpdateNode(id, { scaleType: e.target.value as VerdictScaleType })
            }
            className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono cursor-pointer"
          >
            <option value="discrete">DiscreteScale (["PASSED", "FAILED"])</option>
            <option value="boolean">BooleanScale (yes / no)</option>
            <option value="likert">LikertScale (1 to 5)</option>
            <option value="continuous">ContinuousScale (0.0 to 1.0)</option>
          </select>
        </div>
      )}

      {/* Aggregator Type for Aggregator Nodes */}
      {type === "aggregator" && (
        <div className="space-y-2 pt-3 border-t border-[#4a154b]/30">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#a855f7]" />
            Aggregation Method (<code className="text-[#c084fc] font-mono text-[10px]">verdict.transform</code>)
          </label>
          <select
            value={data.aggregatorType || "maxpool"}
            onChange={(e) =>
              onUpdateNode(id, { aggregatorType: e.target.value as AggregatorType })
            }
            className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono cursor-pointer"
          >
            <option value="maxpool">MaxPoolUnit (Majority Vote - mode)</option>
            <option value="meanpool">MeanPoolUnit (Average Score - mean)</option>
            <option value="map">MapUnit (Custom Transform Function)</option>
          </select>
        </div>
      )}

      {/* Prompt Template Editor for LLM Units */}
      {type !== "input" && type !== "aggregator" && (
        <div className="space-y-2 pt-3 border-t border-[#4a154b]/30">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#1264a3]" />
            Prompt Template (<code className="text-[#38bdf8] font-mono text-[10px]">.prompt()</code>)
          </label>

          {/* Quick Insert Variable Chips */}
          <div className="flex flex-wrap gap-1 pb-0.5">
            {["{source.query}", "{source.document}", "{source.tool_output}", "{previous.prosecutor}", "{previous.defense}"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => insertVariableChip(chip)}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#100311] hover:bg-[#4a154b]/40 border border-[#4a154b]/50 hover:border-[#d9bdde]/40 text-[#d9bdde] hover:text-white transition-all"
              >
                + {chip}
              </button>
            ))}
          </div>

          <textarea
            rows={4}
            value={data.prompt || ""}
            onChange={(e) => onUpdateNode(id, { prompt: e.target.value })}
            placeholder="Enter unit prompt template with {source.*} and {previous.*} variables..."
            className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#d9bdde] leading-relaxed resize-y"
          />
        </div>
      )}

      {/* Layer Replication Setting */}
      {type !== "input" && type !== "aggregator" && (
        <div className="space-y-1.5 pt-3 border-t border-[#4a154b]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#007a5a]" />
              Layer Replicas (<code className="text-[#2ecc71] font-mono text-[10px]">repeat=N</code>)
            </span>
            <span className="font-mono text-[10px] text-white font-bold bg-[#4a154b]/40 px-2 py-0.5 rounded-full border border-[#d9bdde]/20">
              {data.layerRepeat || 1}x
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="10"
            value={data.layerRepeat || 1}
            onChange={(e) => onUpdateNode(id, { layerRepeat: parseInt(e.target.value) || 1 })}
            className="w-full bg-[#100311] border border-[#4a154b]/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d9bdde] font-mono"
          />
        </div>
      )}

      {/* Delete Action */}
      <div className="pt-3 border-t border-[#4a154b]/30 mt-auto">
        <button
          onClick={() => onDeleteNode(id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-5 rounded-full bg-[#cc4117]/15 hover:bg-[#cc4117]/30 border border-[#cc4117]/40 text-[#ff8e75] hover:text-white text-xs font-bold transition-all whitespace-nowrap shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  );
}
