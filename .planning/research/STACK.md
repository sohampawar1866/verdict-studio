# Stack Research — Verdict Studio & MCP Control Plane

## Frontend Stack (2025 Standard)

| Technology | Purpose | Confidence |
|-----------|---------|------------|
| **Next.js 14 (App Router)** | Full-stack React framework with RSC, streaming, API routes | HIGH — industry standard |
| **TypeScript 5.x** | Type safety across frontend | HIGH |
| **Tailwind CSS 3.x** | Utility-first styling | HIGH |
| **Shadcn UI** | Accessible, composable component primitives (built on Radix) | HIGH |
| **@xyflow/react 12.x** | DAG/flow canvas (successor to `reactflow`) | HIGH — verified on npm |
| **Lucide React** | Icon library | HIGH |
| **Zustand or React Context** | State management for DAG graph state | HIGH |

## Backend Stack

| Technology | Purpose | Confidence |
|-----------|---------|------------|
| **Python 3.11 + FastAPI** | REST API, WebSocket hub, verdict pipeline executor | HIGH |
| **verdict 0.2.7** (PyPI) | Multi-agent debate DAG framework by Haize Labs | HIGH — verified |
| **LiteLLM** (verdict dependency) | Unified LLM provider interface (OpenAI, Anthropic, Gemini, etc.) | HIGH |
| **Pydantic v2** | Request/response validation (FastAPI native) | HIGH |
| **uvicorn** | ASGI server | HIGH |

## MCP Gateway Stack

| Technology | Purpose | Confidence |
|-----------|---------|------------|
| **@modelcontextprotocol/sdk 1.30.0** | MCP Server/Client TypeScript SDK | HIGH — verified on npm |
| **zod 3.23+** | Schema validation (MCP SDK peer dep) | HIGH |
| **Node.js 20+** | Runtime for TS MCP gateway | HIGH |

## Database & Cache

| Technology | Purpose | Confidence |
|-----------|---------|------------|
| **SQLite** (v1) | Local key/policy/log storage | HIGH |
| **Prisma ORM** | Type-safe database access from TS gateway | HIGH |
| **Redis** (optional v1) | Rate limiting, permission caching | MEDIUM — may defer to v2 |

## Protocols

| Protocol | Use Case | Confidence |
|----------|----------|------------|
| **JSON-RPC 2.0** | MCP wire protocol (stdio + HTTP/SSE) | HIGH — MCP standard |
| **WebSockets** | Live debate streaming, audit log streaming | HIGH |
| **REST (HTTP/JSON)** | Key management, DAG CRUD, config generation | HIGH |

---
*Researched: 2026-08-25 | Sources: PyPI, npm, GitHub, official MCP docs*
