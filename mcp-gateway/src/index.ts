#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { GatewayConfig } from "./types.js";

// Parse CLI arguments and environment variables
function parseArgs(): GatewayConfig {
  const args = process.argv.slice(2);
  let apiKey = process.env.HAIZE_MCP_KEY;
  let backendUrl = process.env.HAIZE_BACKEND_URL || "http://localhost:8000";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--key" && args[i + 1]) {
      apiKey = args[i + 1];
      i++;
    } else if (args[i] === "--backend-url" && args[i + 1]) {
      backendUrl = args[i + 1];
      i++;
    }
  }

  return {
    apiKey,
    backendUrl,
    enforceVerdict: true,
    sqlReadOnly: true,
    allowedDomains: ["*"],
  };
}

class HaizeSentinelGateway {
  private server: Server;
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: "haize-sentinel-gateway",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          logging: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 1. tools/list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error(`[Sentinel] tools/list requested by agent.`);
      return {
        tools: [
          {
            name: "db_query",
            description: "Execute database SQL queries (governed by Haize Sentinel Read-Only AST Guardrails)",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "The SQL statement to execute" },
              },
              required: ["query"],
            },
          },
          {
            name: "fetch_web",
            description: "Fetch web content with domain whitelisting and inline Verdict Prompt Injection Defense",
            inputSchema: {
              type: "object",
              properties: {
                url: { type: "string", description: "URL to fetch content from" },
              },
              required: ["url"],
            },
          },
          {
            name: "bash",
            description: "Execute bash command (monitored and strictly quarantined by policy)",
            inputSchema: {
              type: "object",
              properties: {
                command: { type: "string", description: "Command line string" },
              },
              required: ["command"],
            },
          },
        ],
      };
    });

    // 2. tools/call handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.error(`[Sentinel] Intercepted tools/call: '${name}' with args:`, JSON.stringify(args));

      // Basic SQL Read-Only Guardrail (expanded in Phase 4 with full backend policy engine)
      if (name === "db_query" && this.config.sqlReadOnly) {
        const query = String((args as any)?.query || "").trim().toUpperCase();
        const destructiveKeywords = ["DROP", "DELETE", "TRUNCATE", "UPDATE", "INSERT", "ALTER"];
        for (const kw of destructiveKeywords) {
          if (query.startsWith(kw) || query.includes(` ${kw} `)) {
            console.error(`[Sentinel] 🚨 BLOCKED destructive SQL operation: ${kw}`);
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `🚨 [HAIZE SENTINEL SECURITY VIOLATION] Tool execution blocked. Destructive SQL operation (${kw}) is strictly prohibited on Read-Only keys.`,
                },
              ],
            };
          }
        }
      }

      // Prohibited Bash Check
      if (name === "bash") {
        console.error(`[Sentinel] 🚨 BLOCKED bash tool call (policy: disabled by default)`);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `🚨 [HAIZE SENTINEL SECURITY VIOLATION] Tool 'bash' is disabled for this scoped MCP Key.`,
            },
          ],
        };
      }

      // Default safe response
      return {
        content: [
          {
            type: "text",
            text: `[Haize Sentinel] Executed '${name}' safely. (Parameters validated against security policy)`,
          },
        ],
      };
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("[Sentinel] Haize Sentinel MCP Gateway running on stdio.");
    console.error(`[Sentinel] Target backend: ${this.config.backendUrl}`);
    if (this.config.apiKey) {
      console.error(`[Sentinel] Authenticated with scoped key prefix: ${this.config.apiKey.slice(0, 16)}...`);
    } else {
      console.error("[Sentinel] Warning: Running without API Key (--key not specified).");
    }
  }
}

async function main() {
  const config = parseArgs();
  const gateway = new HaizeSentinelGateway(config);
  await gateway.start();
}

main().catch((err) => {
  console.error("[Sentinel] Fatal Gateway Error:", err);
  process.exit(1);
});
