import { DAGGraph, DAGNode, DAGEdge } from "./types";

export function serializeDAG(nodes: DAGNode[], edges: DAGEdge[], name = "Verdict Pipeline"): DAGGraph {
  return {
    id: `dag-${Date.now()}`,
    name,
    nodes,
    edges,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function downloadDAGAsJSON(dag: DAGGraph) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dag, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${dag.name.toLowerCase().replace(/\s+/g, "_")}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseDAGFromJSON(jsonString: string): DAGGraph | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
      throw new Error("Invalid DAG: missing nodes array");
    }
    if (!parsed.edges || !Array.isArray(parsed.edges)) {
      throw new Error("Invalid DAG: missing edges array");
    }
    return {
      id: parsed.id || `dag-${Date.now()}`,
      name: parsed.name || "Imported Pipeline",
      description: parsed.description,
      nodes: parsed.nodes,
      edges: parsed.edges,
      createdAt: parsed.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  } catch (err) {
    console.error("Failed to parse DAG JSON:", err);
    return null;
  }
}
