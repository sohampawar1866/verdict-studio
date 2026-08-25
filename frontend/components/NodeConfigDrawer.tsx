"use client";

import React from "react";
import { X, Cpu, Sliders, FileText, Layers, Trash2, HelpCircle, Scale } from "lucide-react";
import { DAGNode, NodeData, VerdictScaleType, AggregatorType } from "@/lib/types";

interface NodeConfigDrawerProps {
  selectedNode: DAGNode | null;
  onUpdateNode: (nodeId: string, updatedData: Partial<NodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

const AVAILABLE_MODELS = [
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet (Anthropic)", provider: "anthropic" },
  { id: "gpt-4o", name: "GPT-4o (OpenAI)", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast/Cost-efficient)", provider: "openai" },
  { id: "o1-mini", name: "o1-mini (Reasoning)", provider: "openai" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Google)", provider: "google" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B (Open-Weights)", provider: "open-source" },
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
    <div className="w-84 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto select-none p-5 space-y-6 z-20 shadow-2xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
            Node Configuration
          </span>
          <h3 className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
            {data.name || `${type} Node`}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Basic Node Info */}
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">
            Unit Name / Identifier
          </label>
          <input
            type="text"
            value={data.name || ""}
            onChange={(e) => onUpdateNode(id, { name: e.target.value })}
            placeholder="e.g. ProsecutorUnit"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Model Selection (.via()) for LLM Units */}
        {type !== "input" && type !== "aggregator" && (
          <div>
            <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                Backend Model (<code className="text-cyan-300 font-mono">.via()</code>)
              </span>
            </label>
            <select
              value={data.model || "gpt-4o"}
              onChange={(e) => onUpdateNode(id, { model: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
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
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-amber-400" />
                Temperature
              </span>
              <span className="font-mono text-cyan-400 font-bold">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        )}
      </div>

      {/* Scale Selector for Chief Justice & Judges */}
      {(type === "chiefjustice" || data.scaleType) && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Scale className="w-3 h-3 text-amber-400" />
            Verdict Scale (<code className="text-cyan-300 font-mono">verdict.scale</code>)
          </label>
          <select
            value={data.scaleType || "discrete"}
            onChange={(e) =>
              onUpdateNode(id, { scaleType: e.target.value as VerdictScaleType })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
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
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-purple-400" />
            Aggregation Method (<code className="text-cyan-300 font-mono">verdict.transform</code>)
          </label>
          <select
            value={data.aggregatorType || "maxpool"}
            onChange={(e) =>
              onUpdateNode(id, { aggregatorType: e.target.value as AggregatorType })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="maxpool">MaxPoolUnit (Majority Vote - mode)</option>
            <option value="meanpool">MeanPoolUnit (Average Score - mean)</option>
            <option value="map">MapUnit (Custom Transform Function)</option>
          </select>
        </div>
      )}

      {/* Prompt Template Editor for LLM Units */}
      {type !== "input" && type !== "aggregator" && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <FileText className="w-3 h-3 text-cyan-400" />
              Prompt Template (<code className="text-cyan-300 font-mono">.prompt()</code>)
            </label>
          </div>

          {/* Quick Insert Variable Chips */}
          <div className="flex flex-wrap gap-1 pb-1">
            {["{source.query}", "{source.document}", "{source.tool_output}", "{previous.thinking}", "{previous.prosecutor}", "{previous.defense}"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => insertVariableChip(chip)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-300 transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>

          <textarea
            rows={5}
            value={data.prompt || ""}
            onChange={(e) => onUpdateNode(id, { prompt: e.target.value })}
            placeholder="Enter unit evaluation prompt template with {source.*} and {previous.*} variables..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
          />
        </div>
      )}

      {/* Layer Replication Setting */}
      {type !== "input" && type !== "aggregator" && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" />
              Layer Replicas (<code className="text-cyan-300 font-mono">repeat=N</code>)
            </span>
            <span className="font-mono text-xs text-white font-bold">
              {data.layerRepeat || 1}x
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="10"
            value={data.layerRepeat || 1}
            onChange={(e) => onUpdateNode(id, { layerRepeat: parseInt(e.target.value) || 1 })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      )}

      {/* Delete Action */}
      <div className="pt-4 border-t border-slate-800 mt-auto">
        <button
          onClick={() => onDeleteNode(id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Node from Canvas</span>
        </button>
      </div>
    </div>
  );
}
