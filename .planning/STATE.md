# Project State — Verdict Studio & MCP Control Plane

## Current Position
**Phase:** 1 — Project Scaffolding & Foundation
**Status:** Ready to plan
**Last activity:** 2026-08-25 — Project initialized, research complete, roadmap created

## Key Decisions

| Decision | Phase | Source | Rationale |
|----------|-------|--------|-----------|
| Next.js 14 + App Router + Tailwind + Shadcn UI | Init | User | Spec-defined frontend stack |
| FastAPI (Python 3.11) for backend | Init | User | Spec-defined; required for `verdict` (Python-only) |
| TypeScript MCP Gateway (separate process) | Init | User | Spec-defined; `@modelcontextprotocol/sdk` is TS-only |
| 3-process architecture (Next.js + FastAPI + MCP Gateway) | Init | AI-suggested | Unavoidable due to language constraints (Python verdict + TS MCP SDK) |
| In-memory storage for v1, SQLite later | Init | AI-suggested | Faster iteration; spec shows in-memory pattern |
| SHA-256 key hashing (never store raw keys) | Init | User + AI | Standard security practice; spec defines this |
| `sqlparse` for SQL safety instead of string matching | Init | AI-suggested | Prevents trivial bypass of read-only enforcement |
| Comprehensive GSD depth (7 phases, 5-10 plans each) | Init | AI-suggested | Large project scope requires thorough planning |
| `@xyflow/react` for DAG canvas | Init | User | Spec-defined; industry-standard React flow library |
| `verdict` v0.2.7 API: Pipeline >> Layer >> Unit pattern | Init | AI-researched | Verified API surface from PyPI/GitHub |

### Blockers/Concerns
- None currently. All dependencies verified and available.
- **Watch:** `verdict` is at v0.2.7 (pre-1.0). API may change. Pin version in requirements.txt.
- **Watch:** MCP SDK v1.30.0 vs v2.x modular packages. Using v1.x for broader compatibility.

---
*Last updated: 2026-08-25*
