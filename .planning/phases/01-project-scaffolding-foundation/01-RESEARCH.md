# Phase 1: Project Scaffolding & Foundation — Research

## Implementation Approach
Phase 1 establishes the monorepo foundation across three decoupled environments:
1. **`backend/` (FastAPI / Python 3.11)**: Orchestrates DAG execution (`verdict`), stores API keys & security policies in memory (with clean SQLite migration path), and exposes REST endpoints and a high-performance WebSocket hub.
2. **`mcp-gateway/` (TypeScript / Node.js 20+)**: Runs the Anthropic MCP proxy server (`@modelcontextprotocol/sdk`) over `stdio`, intercepting tool calls, querying FastAPI for key authorization, and dispatching to downstream tool providers.
3. **`frontend/` (Next.js 14 App Router / TypeScript)**: Provides the dashboard layout, navigation sidebar, theme primitives, `@xyflow/react` dependencies, Lucide icons, and shared data contracts.

## Libraries & Tools

| Subsystem | Package / Tool | Version | Purpose | Confidence |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | `fastapi` | `^0.115.0` | ASGI REST API framework | HIGH |
| **Backend** | `uvicorn[standard]` | `^0.32.0` | High-performance ASGI server | HIGH |
| **Backend** | `websockets` | `^13.1` | Native WebSocket handling for real-time telemetry | HIGH |
| **Backend** | `pydantic` | `^2.9.0` | Data modeling and schema validation | HIGH |
| **Backend** | `sqlparse` | `^0.5.1` | AST-level SQL query inspection | HIGH |
| **Gateway** | `@modelcontextprotocol/sdk` | `^1.30.0` | Official MCP TypeScript SDK (Server, Client, stdio) | HIGH |
| **Gateway** | `zod` | `^3.23.8` | Schema validation | HIGH |
| **Gateway** | `tsx` | `^4.19.0` | Zero-config TypeScript runner for Node.js | HIGH |
| **Frontend** | `next` | `14.2.x` | React 18 / Next.js App Router | HIGH |
| **Frontend** | `@xyflow/react` | `^12.3.0` | Interactive node graph canvas | HIGH |
| **Frontend** | `lucide-react` | `^0.454.0` | Enterprise UI icons | HIGH |
| **Frontend** | `clsx`, `tailwind-merge` | Latest | Styling utilities | HIGH |

## Patterns to Follow
- **Strict Stdio Hygiene in MCP Gateway**: All logging in `mcp-gateway/` must strictly use `console.error` (stderr) to prevent JSON-RPC frame corruption on stdout.
- **Unified TypeScript Contracts**: Keep shared data interfaces (`DAG`, `MCPKey`, `AuditLog`, `ToolExecution`) synchronized between frontend and backend.
- **FastAPI Lifespan Context**: Use modern async lifespan event handlers in FastAPI for clean startup and teardown.

---
*Researched: 2026-08-25*
