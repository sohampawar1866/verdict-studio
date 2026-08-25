# Requirements — Verdict Studio & MCP Control Plane

## Overview
Requirements for the unified visual DAG builder and scoped MCP key/permission gateway. Organized by subsystem with clear phase assignments.

## V1 — Must Have
These are table stakes. The platform doesn't deliver value without them.

| ID | Requirement | Phase | Status |
|----|-------------|-------|--------|
| R1 | **Next.js 14 project scaffold** with App Router, TypeScript, Tailwind CSS, Shadcn UI | 1 | Planned |
| R2 | **FastAPI backend scaffold** with project structure, Pydantic models, CORS, WebSocket support | 1 | Planned |
| R3 | **React Flow DAG Canvas** with zoom/pan, grid background, minimap, controls | 2 | Planned |
| R4 | **Custom draggable nodes**: InputNode, ProsecutorUnit (Unit subclass w/ ResponseSchema), DefenseUnit, FactCheckerUnit, ChiefJusticeUnit (CategoricalJudgeUnit), CoTUnit, AggregatorNode (MaxPool=majority vote, MeanPool, MapUnit) | 2 | Planned |
| R5 | **Node configuration sidebar**: model selection via `.via()`, prompt template editor with `{source.*}`/`{previous.*}` autocomplete, temperature/params, Scale selector, Extractor selector | 2 | Planned |
| R6 | **Edge connection validation** with typed handles mapping to verdict Schema conformance rules | 2 | Planned |
| R7 | **DAG serialization/deserialization** (save/load DAG state as JSON including node configs, edges, Layer inner/outer modes) | 2 | Planned |
| R8 | **1-Click Python Code Exporter** generating valid `verdict` Pipeline code: proper Unit subclasses with ResponseSchema, `Layer(repeat=N)` not `n=N`, correct import paths, `Schema.of()` inputs, `{source.*}`/`{previous.*}` prompt templates | 3 | Planned |
| R9 | **Live streaming WebSocket debate viewer** showing sub-models arguing token-by-token | 3 | Planned |
| R10 | **Verdict pipeline executor** in FastAPI: converts DAG JSON → verdict Pipeline/Unit/Layer objects, uses `pipeline.run(input_data=Schema.of(...), max_workers=128)` | 3 | Planned |
| R11 | **MCP Key Generator API** — create scoped keys with names, store hashed (SHA-256) | 4 | Planned |
| R12 | **Granular tool-level permission toggles** per key (allow/deny list) | 4 | Planned |
| R13 | **SQL read-only guardrail** — block DROP/DELETE/UPDATE/INSERT on read-only keys | 4 | Planned |
| R14 | **Domain whitelist enforcement** for web fetch tools | 4 | Planned |
| R15 | **MCP Key Manager UI** — modal to create keys, view permissions, copy config | 4 | Planned |
| R16 | **TypeScript MCP Gateway** — validates keys, enforces permissions, proxies to downstream servers | 5 | Planned |
| R17 | **Verdict debate enforcement toggle** — triggers safety debate on tool returns > N tokens | 5 | Planned |
| R18 | **1-Click Claude Desktop Config generator** — produces valid `claude_desktop_config.json` snippet | 5 | Planned |
| R19 | **Real-time audit log stream** — WebSocket feed of all tool executions with status/timestamps | 6 | Planned |
| R20 | **Audit log viewer page** — filterable, searchable, color-coded (ALLOWED/BLOCKED) | 6 | Planned |
| R21 | **Dashboard landing page** — navigation sidebar, system status overview | 6 | Planned |
| R22 | **Error handling & loading states** — production-grade error boundaries, skeleton loaders, toast notifications | 6 | Planned |

## V2 — Nice to Have
Differentiators and improvements for after v1 is stable.

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| R30 | **Persistent SQLite/PostgreSQL storage** via Prisma ORM | High | Backlog |
| R31 | **Redis rate limiting** — requests-per-minute enforcement per key | High | Backlog |
| R32 | **DAG template gallery** — pre-built debate templates (safety, factuality, bias) | Medium | Backlog |
| R33 | **Token budget tracking** per key with usage analytics | Medium | Backlog |
| R34 | **Multi-round debate** — Prosecutor rebuts Defense, iterative argumentation | Medium | Backlog |
| R35 | **Export DAG as Docker image** — containerized verdict pipeline | Low | Backlog |
| R36 | **User authentication** — multi-tenant key management | Low | Backlog |
| R37 | **Dark/Light theme toggle** | Low | Backlog |
| R38 | **DSPy integration** for verdict pipelines | Low | Backlog |

## Out of Scope
- Multi-tenant authentication / user accounts — v1 is single-developer local workflow
- Production database deployment (PostgreSQL) — SQLite for v1
- Kubernetes / Docker orchestration — local development only
- Payment / billing integration
- Mobile responsive design
- CI/CD pipeline setup (documentation only)

---
*Last updated: 2026-08-25*
