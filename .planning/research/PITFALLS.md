# Pitfalls Research — Verdict Studio & MCP Control Plane

## 1. MCP stdout Contamination (CRITICAL)
**Risk:** The #1 cause of MCP server failure is non-JSON output on stdout. Any `console.log()`, library banner, or error message on stdout corrupts the JSON-RPC stream and crashes the connection.
**Mitigation:** All logging in the MCP Gateway MUST use `console.error()` (stderr). Lint rules to ban `console.log` in gateway code. Automated tests that verify stdout cleanliness.
**Confidence:** HIGH — documented in official MCP troubleshooting

## 2. React Flow Performance with Large DAGs
**Risk:** @xyflow/react can become sluggish with >50 nodes if custom nodes render heavy components (editors, streaming consoles).
**Mitigation:** Use `React.memo()` aggressively on custom nodes. Virtualize node content. Debounce position updates. Keep streaming viewer in a separate panel, not inside nodes.
**Confidence:** HIGH — common issue in React Flow projects

## 3. WebSocket Connection Management
**Risk:** WebSocket connections can drop silently. Without reconnection logic, users lose live debate streams and audit logs mid-session.
**Mitigation:** Implement exponential backoff reconnection. Use heartbeat ping/pong. Show connection status indicator in UI.
**Confidence:** HIGH — universal WebSocket challenge

## 4. Verdict Pipeline Cold Start Latency
**Risk:** First `verdict` pipeline execution requires LLM API calls to potentially 3-4 different models. Cold start can take 5-15 seconds depending on model providers.
**Mitigation:** Show clear loading states with progress indicators. Consider warming up connections. Use streaming responses where possible.
**Confidence:** MEDIUM — depends on verdict internals

## 5. Key Security in Local Development
**Risk:** Storing raw API keys in SQLite without encryption is acceptable for local dev but dangerous if the pattern leaks to production.
**Mitigation:** Always store SHA-256 hashes. Show raw key only once at creation time. Document that production deployment requires encrypted storage and HTTPS.
**Confidence:** HIGH — standard security practice

## 6. MCP Gateway ↔ FastAPI Communication Reliability
**Risk:** The MCP Gateway (Node.js) calling FastAPI (Python) over HTTP introduces a network dependency. If FastAPI is down, all MCP tool calls fail.
**Mitigation:** Health check endpoint. Graceful degradation (if verdict enforcement is enabled but FastAPI is unreachable, fail-open vs fail-closed is a policy decision). Circuit breaker pattern.
**Confidence:** HIGH — standard microservice concern

## 7. Code Export Accuracy
**Risk:** The 1-click Python code exporter must generate syntactically correct `verdict` code. If the generated code doesn't match the actual API, users lose trust immediately.
**Mitigation:** Build code generation from the verified API surface (Unit, Layer, Pipeline, >>). Include integration tests that actually execute generated code against `verdict`. Pin to known working API patterns.
**Confidence:** HIGH — critical for credibility

## 8. Race Conditions in Permission Checks
**Risk:** If permissions are cached (Redis) and updated in the UI simultaneously, there's a window where an agent uses stale permissions.
**Mitigation:** For v1 (no Redis), check permissions synchronously on every request. Add cache invalidation webhooks for v2.
**Confidence:** MEDIUM — v1 scope limits exposure

## 9. SQL Injection via SQL Read-Only Enforcement
**Risk:** Naive string matching (`if "DROP" in query`) can be bypassed with case manipulation, comments, or encoding tricks.
**Mitigation:** Use proper SQL parsing (e.g., `sqlparse` in Python). Block all non-SELECT statements rather than blacklisting keywords. Document that this is defense-in-depth, not a replacement for database-level permissions.
**Confidence:** HIGH — well-known security concern

---
*Researched: 2026-08-25 | Confidence levels marked per item*
