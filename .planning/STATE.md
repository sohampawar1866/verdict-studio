# Project State — Verdict Studio & MCP Control Plane

## Current Position
**Phase:** 5 — TypeScript MCP Gateway & Verdict Enforcement
**Status:** Ready to plan
**Last activity:** 2026-08-25 — Phase 4 executed & verified (Key Auth, AST SQL guardrail with `sqlparse`, Policy Engine, Scoped MCP Key Manager UI, and 1-click config generator).

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
| Custom Unit subclasses with `ResponseSchema` for debate nodes | Research | AI-verified (source code) | `UnitRegistry` metaclass requires ResponseSchema — `primitive.py:134` |
| `Layer(repeat=N)` NOT `Layer(n=N)` | Research | AI-verified (source code) | Actual constructor parameter — `primitive.py:522` |
| MaxPoolUnit = majority vote (`statistics.mode`) | Research | AI-verified (source code) | NOT max — misleading name — `transform.py:134` |
| `pipeline.run(input_data=Schema.of(...))` | Research | AI-verified (source code) | Correct input format — `pipeline.py:113` |
| `{previous.<unittype>}` resolves via UnitRegistry | Research | AI-verified (source code) | Lowercase name sans "Unit" suffix — `primitive.py:59-90` |

## Research Completed
- [x] Verdict v0.2.7 source code — cloned and exhaustively read (20+ files)
- [x] MCP TypeScript SDK v1.30.0 — API verified
- [x] Full API reference created: `.planning/research/VERDICT_API_REFERENCE.md`
- [x] Architecture updated with exact node → verdict class mappings
- [x] Pitfalls updated with 5 new critical findings from source code
- [x] Requirements corrected with accurate API patterns
- [x] Roadmap updated with correct code generation patterns

### Blockers/Concerns
- None currently. All dependencies verified and available.
- **Watch:** `verdict` is at v0.2.7 (pre-1.0). API may change. Pin version in requirements.txt.
- **Watch:** `instructor==1.7.2` is pinned in verdict's `pyproject.toml`. Must not conflict.
- **Watch:** MCP SDK v1.30.0 vs v2.x modular packages. Using v1.x for broader compatibility.

---
*Last updated: 2026-08-25 — Deep research phase complete*
