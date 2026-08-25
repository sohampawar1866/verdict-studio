# Verdict Studio & Haize Sentinel MCP Control Plane ⚖️🛡️

## Vision
An open-source unified platform that combines a **Visual Multi-Agent DAG Studio** for composing `haizelabs/verdict` debate evaluation pipelines with **Haize Sentinel**, a scoped Model Context Protocol (MCP) security gateway. Developers and security teams can design multi-model safety debates visually, generate scoped API keys for AI agents (Claude Desktop, Cursor, Devin), enforce granular tool-level permissions (AST SQL read-only, bash quarantine, SSRF whitelists), and trigger **inline test-time Verdict safety debates** on untrusted tool returns in real time.

## Core Value
The ONE thing that must work: **A developer can visually compose a multi-agent debate DAG, generate a scoped MCP key with granular permissions, and see tool executions blocked/allowed in real-time** — proving the complete loop from evaluation design → agent governance → live enforcement.

## Target Users
- **AI/ML Engineers** building evaluation pipelines with `verdict` who want a visual alternative to writing Python DAG code.
- **Platform/Security Engineers** deploying agents (Claude Desktop, Cursor, Devin) in production who need centralized tool permission management.
- **Enterprise Teams** requiring audit trails, rate limiting, and safety enforcement on agent tool calls via MCP.

## Technical Context

### Stack (USER-chosen)
| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI | User-specified |
| DAG Canvas | `@xyflow/react` (React Flow) | User-specified |
| Backend API | Python 3.11 / FastAPI | User-specified |
| MCP Gateway | TypeScript / `@modelcontextprotocol/sdk` | User-specified |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma ORM | User-specified |
| Cache | Redis (rate limiting, permission caching) | User-specified |
| Protocols | JSON-RPC 2.0 (stdio/SSE), WebSockets | User-specified |
| Icons | Lucide React | User-specified |

### Key Dependencies (AI-researched & source-code-verified)
| Dependency | Version | Confidence |
|-----------|---------|------------|
| `verdict` (PyPI) | 0.2.7 | HIGH — source code cloned and read |
| `@modelcontextprotocol/sdk` (npm) | 1.30.0 | HIGH — verified on npm |
| `@xyflow/react` (npm) | 12.x | HIGH — verified |
| `zod` (npm) | 3.23+ | HIGH — MCP SDK peer dep |
| `instructor` (verdict dep) | 1.7.2 (pinned) | HIGH — from pyproject.toml |
| `litellm` (verdict dep) | latest | HIGH — LLM provider interface |

## Requirements

### Validated
(None yet — ship to validate)

### Active
- [ ] R1: Visual DAG Canvas with custom draggable nodes (Input, Prosecutor, Defense, FactChecker, ChiefJustice, Aggregator)
- [ ] R2: Node configuration panels (model selection, prompt templates, parameters)
- [ ] R3: Edge connection validation (type-safe I/O matching)
- [ ] R4: Live streaming WebSocket debate viewer (token-by-token)
- [ ] R5: 1-Click Python Code Exporter (generates native `verdict` Pipeline code)
- [ ] R6: Scoped MCP Key Generator (create/revoke keys with names)
- [ ] R7: Granular tool-level permission toggles per key (allow/deny/read-only)
- [ ] R8: SQL read-only guardrail enforcement (block DROP/DELETE/UPDATE/INSERT)
- [ ] R9: Domain whitelist enforcement for web fetch tools
- [ ] R10: Verdict Debate enforcement toggle on tool returns (>N tokens triggers safety debate)
- [ ] R11: 1-Click Claude Desktop Config (`claude_desktop_config.json`) generator
- [ ] R12: Real-time tool execution audit log stream via WebSockets
- [ ] R13: MCP Gateway (TypeScript) that validates keys, enforces permissions, proxies to downstream servers
- [ ] R14: FastAPI backend with REST APIs for key management, DAG persistence, and debate execution
- [ ] R15: SHA-256 key hashing and secure token verification

### Out of Scope (v1)
- User authentication / multi-tenant accounts — focus on single-developer local workflow
- Persistent PostgreSQL deployment — SQLite for v1
- Kubernetes / Docker orchestration — local development only
- Payment / billing integration
- Mobile responsive design
- DSPy integration

## Key Decisions

| Decision | Source | Rationale | Outcome |
|----------|--------|-----------|---------|
| Monorepo structure (`frontend/` + `backend/`) | User | Matches spec file tree | Decided |
| In-memory store for v1, migrate to Prisma/SQLite later | AI-suggested | Faster iteration, spec shows in-memory pattern | Pending user approval |
| Use `verdict` Pipeline/Unit/Layer API directly in backend | AI-researched | Verified API: `Pipeline >> Layer([units], repeat=N) >> aggregator` pattern | Decided |
| MCP Gateway as separate TypeScript process | User | Spec requires `@modelcontextprotocol/sdk` TS gateway | Decided |
| WebSocket for live debate + audit streaming | User | Spec requires real-time token-by-token streaming | Decided |
| Custom Unit subclasses for debate nodes (NOT plain `Unit(name="...")`) | AI-researched (source code) | verdict's `UnitRegistry` metaclass requires `ResponseSchema` on all custom units | Decided |
| `Layer(repeat=N)` NOT `Layer(n=N)` | AI-researched (source code) | Verified actual constructor parameter name in `primitive.py:522` | Decided |
| MaxPoolUnit labeled as "Majority Vote" in UI | AI-researched (source code) | Uses `statistics.mode`, not `max()` — name is misleading | Decided |
| `Schema.of(...)` for pipeline input, NOT raw dicts | AI-researched (source code) | `pipeline.run(input_data=Schema.of(...))` per `pipeline.py:113` | Decided |

---
*Last updated: 2026-08-25 after initialization*
