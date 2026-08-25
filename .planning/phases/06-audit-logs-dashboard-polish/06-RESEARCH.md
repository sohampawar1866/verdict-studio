# Phase 6: Audit Logs, Dashboard & Polish — Research

## Implementation Approach
Phase 6 delivers the live security operations center (SOC) dashboard and audit logs viewer:

1. **Real-Time Audit Logs Viewer (`app/audit-logs/page.tsx`)**:
   - Fetches initial historical log records from `GET /api/audit/logs`.
   - Subscribes to `ws://localhost:8000/ws/telemetry` for instant arrival of `TOOL_INVOCATION` events without requiring page refreshes.
   - Status color-coding:
     - `ALLOWED` (Emerald Green): Verified under security policy.
     - `BLOCKED` (Crimson Red): Blocked by AST SQL inspection, prohibited tool list, or domain filter.
     - `VERDICT_REVIEW` (Purple): Analyzed by Verdict multi-agent debate.
   - Interactive search and multi-criteria filtering (Key name, Tool, Status).
   - Expandable log entry drawer showing raw JSON request parameters, violation reasons, and latency metrics.
   - 1-Click Export to JSON / CSV.

2. **Threat Matrix & Security Telemetry (`ThreatMatrix.tsx`)**:
   - Visual summary of threat mitigation across four distinct security pillars:
     - **AST SQL Guardrails**: Destructive queries blocked (`DROP`, `DELETE`, `UPDATE`, `ALTER`).
     - **Indirect Prompt Injection Shield**: Malicious tool returns quarantined by Verdict debate court.
     - **SSRF & Domain Boundary**: Unapproved hostnames blocked by whitelist filter.
     - **Privileged Tool Quarantine**: Unpermitted `bash` or destructive file tool invocations stopped.

3. **Executive Dashboard Refresh (`app/page.tsx`)**:
   - Real-time status cards connected to backend `:8000/api/health` and live audit streams.
   - Quick navigation launchpad for DAG Studio, Scoped Keys, and Audit Logs.
   - Recent threat activity timeline with live timestamps.

---
*Researched: 2026-08-25*
