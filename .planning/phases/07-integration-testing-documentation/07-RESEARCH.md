# Phase 7: Integration Testing & Documentation — Research

## Implementation Approach
Phase 7 provides the final end-to-end verification and production-grade documentation:

1. **Comprehensive Integration Test Harness (`backend/tests/test_integration.py`)**:
   - Uses `httpx.AsyncClient` or `fastapi.testclient.TestClient` to verify the entire system end-to-end:
     - **DAG Pipeline Workflow**: Save DAG $\to$ fetch DAG $\to$ execute pipeline via `compile_and_run_dag` $\to$ verify token streaming and leaf node resolution.
     - **MCP Authorization & AST SQL Verification**: Create scoped key with `sql_read_only=True` $\to$ execute `SELECT` (200 ALLOWED) $\to$ execute `DROP TABLE` (403 BLOCKED with AST violation reason).
     - **Tool Quarantine Verification**: Invoke `bash` on key with `bash` in `prohibited_tools` $\to$ verify 403 BLOCKED.
     - **Audit Log Verification**: Check `GET /api/audit/logs` reflects all blocked and allowed events with latency metrics.
     - **Python Code Exporter Validation**: Verify exporter produces valid Python AST syntax parseable by `ast.parse()`.

2. **Master `README.md`**:
   - Architectural Mermaid diagrams showing Frontend (Next.js 14) $\leftrightarrow$ Backend (FastAPI + Verdict) $\leftrightarrow$ Gateway (TypeScript MCP SDK) $\leftrightarrow$ Claude Desktop / Cursor IDE.
   - Clear 3-command local startup instructions.
   - Comprehensive documentation of all custom nodes and security policies.
   - Claude Desktop configuration snippets and screenshot placeholders.

---
*Researched: 2026-08-25*
