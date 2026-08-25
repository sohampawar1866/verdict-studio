export type VerdictNodeType =
  | "input"
  | "prosecutor"
  | "defense"
  | "factchecker"
  | "chiefjustice"
  | "cot"
  | "aggregator";

export type VerdictScaleType = "discrete" | "boolean" | "continuous" | "likert";

export type AggregatorType = "maxpool" | "meanpool" | "map";

export type ExtractorType =
  | "structured"
  | "raw"
  | "regex"
  | "posthoc"
  | "argmax"
  | "sample"
  | "weighted_summed";

export interface NodeData {
  label?: string;
  name?: string;
  role?: string;
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
  scaleType?: VerdictScaleType;
  scaleValues?: string[] | [number, number];
  explanation?: boolean;
  aggregatorType?: AggregatorType;
  extractorType?: ExtractorType;
  regexFields?: Record<string, string>;
  layerRepeat?: number;
  layerInner?: "none" | "chain";
  layerOuter?: "dense" | "broadcast" | "cumulative" | "last";
  // Live execution status
  executionState?: "idle" | "running" | "completed" | "failed";
  streamingTokens?: string;
  outputScore?: string | number | boolean;
  [key: string]: unknown;
}

export interface DAGNode {
  id: string;
  type: VerdictNodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface DAGEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface DAGGraph {
  id: string;
  name: string;
  description?: string;
  nodes: DAGNode[];
  edges: DAGEdge[];
  createdAt: number;
  updatedAt: number;
}

export interface MCPKey {
  id: string;
  name: string;
  keyPrefix: string;
  rawKey?: string;
  hashedKey: string;
  allowedTools: string[];
  prohibitedTools: string[];
  enforceVerdictEval: boolean;
  verdictTokenThreshold: number;
  sqlReadOnly: boolean;
  allowedDomains: string[];
  maxRpm: number;
  createdAt: number;
  isActive: boolean;
}

export type AuditLogStatus = "ALLOWED" | "BLOCKED" | "VERDICT_REVIEW";

export interface AuditLog {
  id: string;
  timestamp: number;
  key_id?: string;
  keyName?: string;
  tool_name?: string;
  toolName?: string;
  status: AuditLogStatus | string;
  parameters?: Record<string, unknown>;
  reason: string;
  latency_ms?: number;
  executionTimeMs?: number;
  verdictScore?: number;
  clientIp?: string;
}

export type AuditLogEntry = AuditLog;

export interface DebateStreamToken {
  unitId: string;
  unitName: string;
  role: string;
  token: string;
  isFinal: boolean;
  verdict?: "PASSED" | "FAILED" | string;
}
