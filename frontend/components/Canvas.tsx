"use client";

import React, { useCallback, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { VerdictNodeType } from "@/lib/types";

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onDropNode: (type: VerdictNodeType, position: { x: number; y: number }) => void;
}

export default function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onDropNode,
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow") as VerdictNodeType;
      if (!type || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      onDropNode(type, position);
    },
    [onDropNode]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full relative select-none min-h-[500px]"
      style={{ width: "100%", height: "100%" }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          proOptions={{ hideAttribution: true }}
          style={{ width: "100%", height: "100%" }}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: "#0ea5e9", strokeWidth: 2 },
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="#1e293b"
            className="bg-slate-950"
          />
          <Controls position="bottom-left" />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              switch (node.type) {
                case "input":
                  return "#3b82f6";
                case "prosecutor":
                  return "#ef4444";
                case "defense":
                  return "#10b981";
                case "factchecker":
                  return "#38bdf8";
                case "chiefjustice":
                  return "#f59e0b";
                case "cot":
                  return "#a855f7";
                default:
                  return "#64748b";
              }
            }}
            maskColor="rgba(2, 6, 23, 0.8)"
            className="!bg-slate-900 !border !border-slate-800 !rounded-xl !overflow-hidden"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
