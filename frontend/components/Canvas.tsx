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
            style: { stroke: "#1264a3", strokeWidth: 2.5 },
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.5}
            color="#3b153d"
            className="bg-[#0e040f]"
          />
          <Controls position="bottom-left" />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              switch (node.type) {
                case "input":
                  return "#1264a3";
                case "prosecutor":
                  return "#cc4117";
                case "defense":
                  return "#007a5a";
                case "factchecker":
                  return "#38bdf8";
                case "chiefjustice":
                  return "#f59e0b";
                case "cot":
                  return "#a855f7";
                default:
                  return "#d9bdde";
              }
            }}
            maskColor="rgba(14, 4, 15, 0.85)"
            className="!bg-[#1a071b] !border !border-[#4a154b]/50 !rounded-2xl !overflow-hidden"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
