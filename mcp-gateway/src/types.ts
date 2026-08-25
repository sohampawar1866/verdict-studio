export interface GatewayConfig {
  apiKey?: string;
  backendUrl: string;
  enforceVerdict: boolean;
  sqlReadOnly: boolean;
  allowedDomains: string[];
}

export interface ScopedPermissions {
  name: string;
  allowedTools: string[];
  prohibitedTools: string[];
  enforceVerdictEval: boolean;
  verdictTokenThreshold: number;
  sqlReadOnly: boolean;
  allowedDomains: string[];
  maxRpm: number;
}

export interface ToolCallPayload {
  toolName: string;
  parameters: Record<string, unknown>;
}

export interface ToolCallResult {
  status: "ALLOWED" | "BLOCKED" | "VERDICT_REVIEW";
  content?: Array<{ type: "text" | "image"; text?: string; data?: string; mimeType?: string }>;
  isError?: boolean;
  violationReason?: string;
}
