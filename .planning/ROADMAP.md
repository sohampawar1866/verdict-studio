# Roadmap — Verdict Studio & MCP Control Plane

## Milestone 1: Full V1 Platform

### Progress

| Phase | Name | Status | Plans | Date |
|-------|------|--------|-------|------|
| 1 | Project Scaffolding & Foundation | Complete ✓ | 3/3 | 2026-08-25 |
| 2 | Visual DAG Builder (React Flow Canvas) | Complete ✓ | 3/3 | 2026-08-25 |
| 3 | Verdict Pipeline Executor & Live Debate Streaming | Complete ✓ | 3/3 | 2026-08-25 |
| 4 | MCP Key Manager & Permission Engine (Backend + UI) | Complete ✓ | 3/3 | 2026-08-25 |
| 5 | TypeScript MCP Gateway & Verdict Enforcement | Planned | — | — |
| 6 | Audit Logs, Dashboard & Polish | Planned | — | — |
| 7 | Integration Testing & Documentation | Planned | — | — |

---

### Phases

#### Phase 1: Project Scaffolding & Foundation
**Goal:** Set up both frontend and backend projects with proper tooling, dependencies, and shared types. Establish the monorepo structure, development workflow, and inter-process communication patterns.
**Requirements:** R1, R2

- [x] Initialize Next.js 14 project in `frontend/` with App Router, TypeScript, Tailwind CSS
- [x] Install and configure Shadcn UI / Lucide component primitives
- [x] Install `@xyflow/react`, `lucide-react`, and WebSocket client dependencies
- [x] Create app layout with sidebar navigation skeleton (DAG Studio, MCP Keys, Audit Logs)
- [x] Initialize FastAPI project in `backend/` with project structure (`app/main.py`, `mcp_gateway/`, `engine/`, `models/`)
- [x] Install `verdict`, `fastapi`, `uvicorn`, `pydantic`, `websockets`, `sqlparse` dependencies
- [x] Configure CORS middleware for frontend ↔ backend communication
- [x] Set up WebSocket endpoint skeleton in FastAPI
- [x] Initialize TypeScript MCP Gateway in `mcp-gateway/` with `@modelcontextprotocol/sdk`, `zod`, `tsx`
- [x] Create shared TypeScript types (`frontend/lib/types.ts` & `mcp-gateway/src/types.ts`)
- [x] Verify all servers start and frontend can reach backend API

**Verification:** `npm run dev` serves frontend on :3000, `uvicorn` serves backend on :8000, CORS-enabled fetch succeeds from frontend.

---

#### Phase 2: Visual DAG Builder (React Flow Canvas)
**Goal:** Build the complete interactive DAG canvas with custom nodes matching `verdict` primitives, edge connection validation, node configuration panels, and DAG serialization.
**Requirements:** R3, R4, R5, R6, R7

- [x] Create `Canvas.tsx` with React Flow provider, background grid, minimap, controls
- [x] Build `InputNode` custom node — text input for candidate/context/query fields (maps to `Schema.of(...)`)
- [x] Build `ProsecutorUnit` custom node — adversarial debater (maps to `Unit` subclass with `ResponseSchema(argument: str)`)
- [x] Build `DefenseUnit` custom node — constructive debater (maps to `Unit` subclass with `ResponseSchema(argument: str)`)
- [x] Build `FactCheckerUnit` custom node — claim verification (maps to `Unit` subclass with `ResponseSchema(findings: str)`)
- [x] Build `ChiefJusticeUnit` custom node — final adjudicator (maps to `CategoricalJudgeUnit(categories=DiscreteScale([...]))`)
- [x] Build `CoTUnit` custom node — chain-of-thought reasoning (maps to `verdict.common.cot.CoTUnit`)
- [x] Build `AggregatorNode` custom node — MaxPool (majority vote via `statistics.mode`), MeanPool, MapUnit selection
- [x] Create draggable node palette sidebar with all node types (`NodePalette.tsx`)
- [x] Implement typed handles (input/output) with connection validation rules
- [x] Build node configuration sidebar panel (`NodeConfigDrawer.tsx`)
  - Model selector dropdown for `.via()` (gpt-4o, claude-3-5-sonnet, gpt-4o-mini, etc.)
  - Prompt template editor (textarea with `{source.*}`, `{previous.*}`, `{input.*}` autocomplete hints)
  - Temperature slider, max tokens input (passed as inference_parameters)
  - Scale selector for Judge nodes: DiscreteScale (custom values or range), BooleanScale, ContinuousScale, LikertScale
  - Extractor selector: StructuredOutput (default), Raw, Regex, PostHoc, ArgmaxScore, WeightedSummedScore
  - Layer mode selectors: inner (none/chain), outer (dense/broadcast/cumulative/last), repeat count
  - `explanation: bool` toggle for Judge nodes
- [x] Implement DAG state serialization to JSON (nodes + edges + configs)
- [x] Implement DAG state deserialization / load from JSON & pre-built presets (`dagPresets.ts`)
- [x] Add clear canvas and backend DAG persistence (`/api/dags`) Add undo/redo support for canvas operations
- [x] Create `dag-studio/page.tsx` route with canvas and toolbars

**Verification:** User can drag all 6 node types onto canvas, connect them with edges, configure each node's model/prompt, and save/load the DAG as JSON.

---

#### Phase 3: Verdict Pipeline Executor & Live Debate Streaming
**Goal:** Build the backend pipeline executor that converts visual DAGs into executable `verdict` objects, streams token-by-token debate reasoning over WebSockets, and provides 1-click Python code export.
**Requirements:** R8, R9, R10

- [x] Build `verdict_runner.py` — converts DAG JSON to `verdict` Pipeline/Unit/Layer objects
  - Map `InputNode` → `Schema.of(**fields)` for pipeline input data
  - Map `ProsecutorUnit` → Generate `class ProsecutorUnit(Unit): class ResponseSchema(Schema): argument: str` subclass, then `.prompt(...).via(model)`
  - Map `DefenseUnit` → Generate `class DefenseUnit(Unit): class ResponseSchema(Schema): argument: str` subclass, then `.prompt(...).via(model)`
  - Map `FactCheckerUnit` → Generate `class FactCheckerUnit(Unit): class ResponseSchema(Schema): findings: str` subclass, then `.prompt(...).via(model)`
  - Map `ChiefJusticeUnit` → `CategoricalJudgeUnit(name="ChiefJustice", categories=DiscreteScale([...]))` with `.prompt(...).via(model)`
  - Map `CoTUnit` → `CoTUnit(name=...).prompt(...).via(model)`
  - Map `AggregatorNode` → `MaxPoolUnit()` (majority vote) / `MeanPoolUnit()` / `MapUnit(fn)`
  - Map parallel edges → `Layer([unit1, unit2], repeat=N, inner="none"|"chain", outer="dense"|"broadcast")`
  - Map sequential edges → `>>` operator chaining
- [x] Create `/api/dag/execute` POST endpoint — accepts DAG JSON, runs `pipeline.run(input_data=Schema.of(...), max_workers=128)`
- [x] Implement WebSocket streaming of pipeline execution progress
  - Stream each unit's prompt → model → response in real-time
  - Include unit name, role, model used, and token-by-token response text
  - Stream final verdict decision (PASSED / FAILED or numerical score)
- [x] Build Live Streaming Debate Viewer component (`StreamingConsole.tsx`)
  - Split-pane drawer on DAG Studio canvas
  - Real-time token streaming with typing animation per debater
  - Role-colored debate bubbles: Prosecutor (red), Defense (green), FactChecker (blue), Chief Justice (gold)
  - Auto-scroll with timestamp per message
- [x] Build Python Code Exporter (`codeExporter.ts`)
  - Generate correct imports: `from verdict import Pipeline, Layer, Unit`, `from verdict.common.judge import CategoricalJudgeUnit`, `from verdict.scale import DiscreteScale`, `from verdict.transform import MaxPoolUnit`, `from verdict.schema import Schema`
  - Generate Unit subclasses with `class ResponseSchema(Schema): field: str` for custom debate nodes
  - Generate unit instances with `.prompt()`, `.via()`, `.extract()` chains
  - Generate `Pipeline("name") >> Layer([...], repeat=N, inner="...", outer="...") >> ...` composition
  - Use `Schema.of(...)` for pipeline input, NOT raw dicts
  - Preserve `{source.*}` / `{previous.*}` template syntax without escaping (verdict uses custom `auto_format`, not Python f-strings)
  - Add comment `# MaxPoolUnit uses statistics.mode (majority voting)` where applicable
  - Copy-to-clipboard button with syntax-highlighted preview modal (`CodeExportModal.tsx`)
- [x] Add "Run Debate" and "Export Code" buttons to DAG Studio toolbar

**Verification:** User builds a DAG visually, clicks "Run Debate", sees live streaming debate, and can export working Python code that runs with `verdict`.

---

#### Phase 4: MCP Key Manager & Permission Engine (Backend + UI)
**Goal:** Build the complete MCP key management system with scoped permissions, security policies, and the frontend UI for creating/managing keys.
**Requirements:** R11, R12, R13, R14, R15, R16

- [x] Build `key_auth.py` — SHA-256 key hashing, generation (`secrets.token_hex`), verification
- [x] Build `policy_engine.py` — permission checking logic
  - Tool allow/deny list evaluation
  - SQL read-only enforcement using `sqlparse` (proper AST parsing, not string matching)
  - Domain whitelist checking for web fetch tools
  - Verdict enforcement flag checking
- [x] Build REST API endpoints in FastAPI:
  - `POST /api/mcp/keys` — create new scoped key
  - `GET /api/mcp/keys` — list all keys (hashed, no raw values)
  - `DELETE /api/mcp/keys/{key_id}` — revoke a key
  - `POST /api/mcp/execute-tool` — tool execution with permission enforcement and audit logs
- [x] Build `KeyModal.tsx` — create new scoped MCP key modal with tool checkboxes, SQL read-only toggle, Verdict debate toggle
- [x] Build `ConfigSnippetModal.tsx` — 1-click Claude Desktop / Cursor / Devin config viewer/copier
- [x] Create `mcp-keys/page.tsx` route with key list table, active status filters, and revocation actions
- [x] Show raw key ONLY once at creation (with copy button), then only show hashed prefix

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
