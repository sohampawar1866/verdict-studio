"use client";

import React, { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "@xyflow/react";
import Canvas from "@/components/Canvas";
import NodePalette from "@/components/NodePalette";
import NodeConfigDrawer from "@/components/NodeConfigDrawer";
import { SAMPLE_DAG_PRESETS } from "@/lib/dagPresets";
import { downloadDAGAsJSON, parseDAGFromJSON } from "@/lib/dagSerializer";
import { DAGNode, NodeData, VerdictNodeType } from "@/lib/types";
import {
  Play,
  Save,
  Download,
  Upload,
  Trash,
  LayoutGrid,
  Layers,
  Sparkles,
  Check,
} from "lucide-react";

export default function DAGStudioPage() {
  const initialPreset = SAMPLE_DAG_PRESETS.adversarial_safety;
  const [dagTitle, setDagTitle] = useState(initialPreset.name);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialPreset.nodes as unknown as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialPreset.edges as Edge[]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Update node data from drawer
  const handleUpdateNode = useCallback(
    (nodeId: string, updatedData: Partial<NodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...updatedData,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  // Delete selected node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
    },
    [setNodes, setEdges]
  );

  // Add node from palette
  const handleAddNode = useCallback(
    (type: VerdictNodeType, position = { x: 300, y: 200 }) => {
      const newNodeId = `node-${Date.now()}`;
      const defaultLabels: Record<VerdictNodeType, string> = {
        input: "Input Schema",
        prosecutor: "ProsecutorUnit",
        defense: "DefenseUnit",
        factchecker: "FactCheckerUnit",
        chiefjustice: "ChiefJustice",
        cot: "CoTUnit",
        aggregator: "MaxPoolUnit",
      };

      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: {
          name: defaultLabels[type] || `${type}Unit`,
          model: type === "prosecutor" ? "claude-3-5-sonnet" : "gpt-4o",
          temperature: type === "factchecker" ? 0.0 : 0.7,
          scaleType: type === "chiefjustice" ? "discrete" : undefined,
          prompt: "",
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNodeId);
    },
    [setNodes]
  );

  // Load Preset
  const handleLoadPreset = (presetKey: string) => {
    const preset = SAMPLE_DAG_PRESETS[presetKey];
    if (!preset) return;
    setDagTitle(preset.name);
    setNodes(preset.nodes as unknown as Node[]);
    setEdges(preset.edges as Edge[]);
    setSelectedNodeId(null);
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (confirm("Are you sure you want to clear the canvas?")) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const currentDAG = {
      id: `dag-${Date.now()}`,
      name: dagTitle,
      nodes: nodes as unknown as DAGNode[],
      edges: edges as any,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    downloadDAGAsJSON(currentDAG);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseDAGFromJSON(content);
      if (parsed) {
        setDagTitle(parsed.name);
        setNodes(parsed.nodes as unknown as Node[]);
        setEdges(parsed.edges as Edge[]);
        setSelectedNodeId(null);
      }
    };
    reader.readAsText(file);
  };

  // Save DAG to Backend
  const handleSaveDAG = async () => {
    try {
      const currentDAG = {
        id: `dag-${dagTitle.toLowerCase().replace(/\s+/g, "-")}`,
        name: dagTitle,
        nodes: nodes as unknown as DAGNode[],
        edges: edges as any,
      };

      const res = await fetch("http://localhost:8000/api/dags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentDAG),
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save DAG:", err);
    }
  };

  const selectedNode = (nodes.find((n) => n.id === selectedNodeId) as unknown as DAGNode) || null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Toolbar */}
      <header className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-5 flex items-center justify-between z-20 select-none">
        {/* Title & Preset Dropdown */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={dagTitle}
            onChange={(e) => setDagTitle(e.target.value)}
            className="bg-transparent font-bold text-sm text-white hover:bg-slate-800/50 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono tracking-tight"
          />

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <select
              onChange={(e) => handleLoadPreset(e.target.value)}
              defaultValue="adversarial_safety"
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="adversarial_safety">Preset: Adversarial Safety Court</option>
              <option value="geval_coherence">Preset: G-Eval Coherence</option>
              <option value="ensemble_verify">Preset: Ensemble Verification</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleClearCanvas}
            title="Clear all nodes and edges"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white text-xs font-medium transition-colors"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleSaveDAG}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSaved
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isSaved ? "Saved!" : "Save DAG"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Left: Palette, Center: Canvas, Right: Config Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Palette */}
        <NodePalette onAddNode={(type) => handleAddNode(type)} />

        {/* Central Canvas */}
        <div className="flex-1 h-full relative">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onDropNode={(type, position) => handleAddNode(type, position)}
          />
        </div>

        {/* Right Node Config Drawer */}
        {selectedNode && (
          <NodeConfigDrawer
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
