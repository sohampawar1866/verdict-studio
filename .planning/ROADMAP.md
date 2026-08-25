# Roadmap — Verdict Studio & MCP Control Plane

## Milestone 1: Full V1 Platform

### Progress

| Phase | Name | Status | Plans | Date |
|-------|------|--------|-------|------|
| 1 | Project Scaffolding & Foundation | Planned | — | — |
| 2 | Visual DAG Builder (React Flow Canvas) | Planned | — | — |
| 3 | Verdict Pipeline Executor & Live Debate Streaming | Planned | — | — |
| 4 | MCP Key Manager & Permission Engine (Backend + UI) | Planned | — | — |
| 5 | TypeScript MCP Gateway & Verdict Enforcement | Planned | — | — |
| 6 | Audit Logs, Dashboard & Polish | Planned | — | — |
| 7 | Integration Testing & Documentation | Planned | — | — |

---

### Phases

#### Phase 1: Project Scaffolding & Foundation
**Goal:** Set up both frontend and backend projects with proper tooling, dependencies, and shared types. Establish the monorepo structure, development workflow, and inter-process communication patterns.
**Requirements:** R1, R2

- [ ] Initialize Next.js 14 project in `frontend/` with App Router, TypeScript, Tailwind CSS
- [ ] Install and configure Shadcn UI component library
- [ ] Install `@xyflow/react`, `lucide-react`, and WebSocket client dependencies
- [ ] Create app layout with sidebar navigation skeleton (DAG Studio, MCP Keys, Audit Logs)
- [ ] Initialize FastAPI project in `backend/` with project structure (`app/main.py`, `mcp_gateway/`, `engine/`, `models/`)
- [ ] Install `verdict`, `fastapi`, `uvicorn`, `pydantic`, `websockets` dependencies
- [ ] Configure CORS middleware for frontend ↔ backend communication
- [ ] Set up WebSocket endpoint skeleton in FastAPI
- [ ] Create shared TypeScript types (`types/dag.ts`, `types/mcp.ts`, `types/audit.ts`)
- [ ] Verify both servers start and frontend can reach backend API

**Verification:** `npm run dev` serves frontend on :3000, `uvicorn` serves backend on :8000, CORS-enabled fetch succeeds from frontend.

---

#### Phase 2: Visual DAG Builder (React Flow Canvas)
**Goal:** Build the full visual DAG canvas with custom verdict-specific nodes, edge connections, node configuration, and DAG serialization. This is the visual heart of the platform.
**Requirements:** R3, R4, R5, R6, R7

- [ ] Create `Canvas.tsx` with React Flow provider, background grid, minimap, controls
- [ ] Build `InputNode` custom node — text input for candidate/context/query
- [ ] Build `ProsecutorUnit` custom node — adversarial debater with model/prompt config
- [ ] Build `DefenseUnit` custom node — constructive debater with model/prompt config
- [ ] Build `FactCheckerUnit` custom node — claim verification with model/prompt config
- [ ] Build `ChiefJusticeUnit` custom node — final adjudicator with verdict scale config
- [ ] Build `AggregatorNode` custom node — MaxPool/MeanPool/WeightedSum selection
- [ ] Create draggable node palette sidebar with all node types
- [ ] Implement typed handles (input/output) with connection validation rules
- [ ] Build node configuration sidebar panel (appears on node click)
  - Model selector dropdown (gpt-4o, claude-3-5-sonnet, gpt-4o-mini, etc.)
  - Prompt template editor (textarea with `{source.*}`, `{previous.*}` hints)
  - Temperature slider, max tokens input
  - Verdict scale selector (for ChiefJustice: Discrete, Boolean, Continuous)
- [ ] Implement DAG state serialization to JSON (nodes + edges + configs)
- [ ] Implement DAG state deserialization / load from JSON
- [ ] Add undo/redo support for canvas operations
- [ ] Create `dag-studio/page.tsx` route with canvas and toolbars

**Verification:** User can drag all 6 node types onto canvas, connect them with edges, configure each node's model/prompt, and save/load the DAG as JSON.

---

#### Phase 3: Verdict Pipeline Executor & Live Debate Streaming
**Goal:** Connect the visual DAG to actual `verdict` library execution. Implement the backend pipeline runner and real-time WebSocket streaming of debate arguments token-by-token. Build the 1-click code exporter.
**Requirements:** R8, R9, R10

- [ ] Build `verdict_runner.py` — converts DAG JSON to `verdict` Pipeline/Unit/Layer objects
  - Map `InputNode` → pipeline input data
  - Map `ProsecutorUnit` → `Unit(name="Prosecutor").prompt(...).via(model)`
  - Map `DefenseUnit` → `Unit(name="Defense").prompt(...).via(model)`
  - Map `FactCheckerUnit` → `Unit(name="FactChecker").prompt(...).via(model)`
  - Map `ChiefJusticeUnit` → `CategoricalJudgeUnit(name="ChiefJustice", categories=scale).prompt(...).extract(...).via(model)`
  - Map `AggregatorNode` → `MaxPoolUnit()` / `MeanPoolUnit()`
  - Map edges → `>>` operator / `Layer([...])` grouping
- [ ] Create `/api/dag/execute` POST endpoint — accepts DAG JSON, runs verdict pipeline
- [ ] Implement WebSocket streaming of pipeline execution progress
  - Stream each unit's prompt → model → response in real-time
  - Include unit name, role, model used, and token-by-token response text
- [ ] Build `StreamingConsole.tsx` — live debate viewer component
  - Split-pane view: Prosecutor (red) vs Defense (green) arguments
  - FactChecker findings (blue) panel
  - ChiefJustice final ruling (gold) panel
  - Auto-scroll with timestamp per message
- [ ] Build Python Code Exporter (`codeExporter.ts`)
  - Traverse DAG graph → generate `verdict` import statements
  - Generate Unit definitions with `.prompt()`, `.via()`, `.extract()` chains
  - Generate `Pipeline("name") >> Layer([...]) >> ...` composition
  - Copy-to-clipboard button with syntax-highlighted preview modal
- [ ] Create `/api/dag/export-code` POST endpoint as backend alternative
- [ ] Add "Run Debate" and "Export Code" buttons to DAG Studio toolbar

**Verification:** User builds a DAG visually, clicks "Run Debate", sees live streaming debate, and can export working Python code that runs with `verdict`.

---

#### Phase 4: MCP Key Manager & Permission Engine (Backend + UI)
**Goal:** Build the complete MCP key management system with scoped permissions, security policies, and the frontend UI for creating/managing keys.
**Requirements:** R11, R12, R13, R14, R15

- [ ] Build `key_auth.py` — SHA-256 key hashing, generation (`secrets.token_hex`), verification
- [ ] Build `policy_engine.py` — permission checking logic
  - Tool allow/deny list evaluation
  - SQL read-only enforcement using `sqlparse` (proper AST parsing, not string matching)
  - Domain whitelist checking for web fetch tools
  - Verdict enforcement flag checking
- [ ] Create Pydantic models for Key, Policy, AuditLogEntry
- [ ] Build REST API endpoints:
  - `POST /api/mcp/keys` — create new scoped key
  - `GET /api/mcp/keys` — list all keys (hashed, no raw values)
  - `DELETE /api/mcp/keys/{key_id}` — revoke a key
  - `PUT /api/mcp/keys/{key_id}/permissions` — update tool permissions
  - `POST /api/mcp/execute-tool` — tool execution with permission enforcement
  - `GET /api/mcp/keys/{key_id}/config` — generate Claude Desktop config snippet
- [ ] Build `KeyModal.tsx` — create new scoped MCP key modal
  - Agent/key name input
  - Tool permission toggles (db_query, bash, fetch_web, file operations)
  - SQL read-only checkbox
  - Domain whitelist input
  - Verdict enforcement toggle
  - Rate limit (requests/minute) input
- [ ] Build `PermissionsSelector.tsx` — granular tool permission toggle grid
- [ ] Build `ConfigSnippetModal.tsx` — 1-click Claude Desktop config viewer/copier
- [ ] Create `mcp-keys/page.tsx` route with key list table + create button
- [ ] Show raw key ONLY once at creation (with copy button), then only show hashed prefix

**Verification:** User can create MCP keys with scoped permissions, view/revoke keys, copy Claude Desktop config, and the backend correctly blocks prohibited tool calls.

---

#### Phase 5: TypeScript MCP Gateway & Verdict Enforcement
**Goal:** Build the actual MCP Gateway server that agents (Claude Desktop, Cursor) connect to. The gateway validates keys, enforces permissions, proxies to downstream MCP servers, and optionally triggers verdict safety debates on tool returns.
**Requirements:** R16, R17, R18

- [ ] Initialize TypeScript MCP gateway project in `mcp-gateway/` (or `backend/mcp_gateway_ts/`)
  - `package.json` with `@modelcontextprotocol/sdk`, `zod`, `tsx`
  - `tsconfig.json` with strict mode
- [ ] Build gateway server using low-level `Server` class from MCP SDK
  - `StdioServerTransport` for Claude Desktop / local agent connections
  - Implement `tools/list` handler — aggregate and namespace downstream tools
  - Implement `tools/call` handler — validate key, check permissions, proxy call
- [ ] Implement key extraction from MCP request metadata / environment
- [ ] Implement permission enforcement middleware
  - Call FastAPI `/api/mcp/execute-tool` for validation
  - Parse and check tool-specific policies (SQL read-only, domain whitelist)
- [ ] Implement verdict enforcement on tool returns
  - If `enforce_verdict_eval` is true AND tool response exceeds token threshold:
  - Call FastAPI `/api/dag/execute` with configured safety debate DAG
  - If verdict is FAILED → return safety warning instead of raw tool output
  - If verdict is PASSED → return original tool output
- [ ] Implement downstream MCP client connections
  - Use `Client` class with `StdioClientTransport` to connect to downstream MCP servers
  - Dynamic server registration from config file
- [ ] Emit audit events to FastAPI WebSocket hub on every tool call (allowed/blocked)
- [ ] Build CLI entry point: `npx @haizelabs/mcp-sentinel --key <key> --backend-url <url>`
- [ ] Generate `claude_desktop_config.json` that points to this gateway

**Verification:** Claude Desktop connects to the MCP gateway via stdio, attempts tool calls that are correctly allowed/blocked based on key permissions, and audit events appear in the FastAPI WebSocket stream.

---

#### Phase 6: Audit Logs, Dashboard & Polish
**Goal:** Build the real-time audit log viewer, the main dashboard landing page, and polish the entire UI with production-grade error handling, loading states, and visual consistency.
**Requirements:** R19, R20, R21, R22

- [ ] Build WebSocket-based audit log streaming in FastAPI
  - `/ws/audit` endpoint — broadcasts tool execution events to all connected clients
  - Event schema: timestamp, key_name, tool_name, status (ALLOWED/BLOCKED), reason, latency_ms
- [ ] Build `audit-logs/page.tsx` — real-time audit log viewer
  - Live-updating event list with color coding (green=ALLOWED, red=BLOCKED, yellow=VERDICT_CHECK)
  - Filter by key name, tool name, status
  - Search functionality
  - Timestamp formatting and relative time display
  - Export logs as CSV/JSON
- [ ] Build `page.tsx` dashboard landing page
  - Navigation sidebar (DAG Studio, MCP Keys, Audit Logs) with active state
  - System status cards (active keys count, total tool calls, blocked calls, active debates)
  - Recent activity feed
  - Quick action buttons (New DAG, Generate Key, View Logs)
- [ ] Implement production-grade error handling
  - React Error Boundaries with fallback UI
  - Toast notification system (success, error, warning)
  - API error handling with user-friendly messages
  - Network failure detection and retry prompts
- [ ] Implement loading states
  - Skeleton loaders for all data-fetching views
  - Optimistic updates for key creation/deletion
  - Streaming indicators for active debates
- [ ] Visual polish pass
  - Consistent dark theme (slate-900/950 backgrounds per spec)
  - Responsive layout for desktop (1280px+ minimum)
  - Keyboard shortcuts (Ctrl+S save DAG, Ctrl+E export code, Ctrl+K create key)
  - Tooltips on all icon buttons

**Verification:** Dashboard shows live metrics, audit logs stream in real-time as agents execute tools, error states are handled gracefully, and the entire UI feels production-grade.

---

#### Phase 7: Integration Testing & Documentation
**Goal:** End-to-end integration tests verifying the complete workflow, comprehensive README, and deployment documentation.
**Requirements:** All

- [ ] Write end-to-end test: Build DAG → Execute Debate → Verify streaming output
- [ ] Write end-to-end test: Create MCP Key → Connect Claude Desktop → Execute tool → Verify audit log
- [ ] Write end-to-end test: SQL read-only enforcement blocks destructive queries
- [ ] Write end-to-end test: Verdict enforcement blocks unsafe tool output
- [ ] Write end-to-end test: Code export generates valid, runnable `verdict` code
- [ ] Create comprehensive `README.md` with:
  - Architecture diagram
  - Quick start guide (3 commands to run)
  - Screenshot gallery
  - API reference
  - Claude Desktop integration guide
- [ ] Create `CONTRIBUTING.md`
- [ ] Create demo script for 45-second screen recording (per spec)
- [ ] Final dependency audit and version pinning

**Verification:** All integration tests pass. README is complete and accurate. A new developer can clone → install → run in under 5 minutes.

---

## Milestone 2: Production Hardening (V2 — Future)

| Phase | Name | Status | Requirements |
|-------|------|--------|--------------|
| 8 | Persistent Storage (Prisma/SQLite → PostgreSQL) | Backlog | R30 |
| 9 | Redis Rate Limiting & Caching | Backlog | R31 |
| 10 | DAG Template Gallery | Backlog | R32 |
| 11 | Token Budget & Usage Analytics | Backlog | R33 |
| 12 | Multi-round Debate | Backlog | R34 |

---
*Last updated: 2026-08-25*
