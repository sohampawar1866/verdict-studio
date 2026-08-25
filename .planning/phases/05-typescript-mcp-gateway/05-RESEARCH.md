# Phase 5: TypeScript MCP Gateway & Verdict Enforcement — Research

## Implementation Approach
Phase 5 implements the runtime gateway interfacing between AI agents (Claude Desktop, Cursor, Devin) and downstream tools:

1. **Stdio Protocol & MCP SDK Architecture (`mcp-gateway/src/index.ts`)**:
   - Uses `@modelcontextprotocol/sdk/server/mcp.js` / `@modelcontextprotocol/sdk/server/stdio.js`.
   - **Crucial Rule**: `stdout` is dedicated strictly to JSON-RPC protocol frames. All telemetry, debugging, and audit logging must strictly write to `console.error` (stderr).
   - Accepts API key via `--key <key>` CLI flag or `HAIZE_MCP_KEY` environment variable.
   - Accepts backend URL via `--backend-url <url>` (defaults to `http://localhost:8000`).

2. **Tool Routing & Scoped Gateway Handlers**:
   - Exposes tools to the AI agent:
     - `db_query(query: string)`: Executes SQL query.
     - `fetch_web(url: string)`: Fetches web documents.
     - `bash(command: string)`: Runs shell command.
     - `read_file(path: string)`: Reads filesystem files.
   - Each `CallToolRequest` proxies to the FastAPI backend `/api/mcp/execute-tool` with header `X-Haize-MCP-Key: <raw_key>`.

3. **Inline Verdict Debate Safety Enforcement (`verdict_enforcer.ts`)**:
   - When a tool returns data that exceeds the token threshold or contains suspicious tokens, the gateway evaluates whether the key requires Verdict safety inspection.
   - If enabled, the gateway calls `POST /api/dag/execute` with the tool return as input to the **Adversarial Safety Court** DAG.
   - If the Chief Justice renders `BLOCKED` (indirect prompt injection / exploit detected), the gateway **quarantines the payload** and returns a structured Haize Sentinel Security Alert to the agent, shielding the model from jailbreak or exfiltration!
   - If `PASSED`, the clean tool return is passed through.

---
*Researched: 2026-08-25*
