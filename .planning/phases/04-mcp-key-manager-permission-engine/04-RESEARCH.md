# Phase 4: MCP Key Manager & Permission Engine — Research

## Implementation Approach
Phase 4 implements the scoped authorization and security firewall sub-system:

1. **Cryptographic Key Authentication (`key_auth.py`)**:
   - Keys follow the format: `haize_mcp_live_<32-hex-chars>`.
   - The raw secret key is generated with `secrets.token_hex(16)` and returned to the user **exactly once** upon creation.
   - Only the SHA-256 hash `hashlib.sha256(raw_key.encode()).hexdigest()` and display prefix `haize_mcp_live_...` are stored in the database.
   - Header authentication supports `X-Haize-MCP-Key` and `Authorization: Bearer <key>`.

2. **Policy Engine & AST SQL Verification (`policy_engine.py`)**:
   - **Tool Permission Whitelist/Blacklist**: Checks whether `tool_name` is explicitly prohibited or omitted from allowed tools.
   - **AST-Level SQL Guardrails**: Rather than fragile regex matching, uses `sqlparse` to tokenize and parse SQL statements:
     - Detects statement types (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `REPLACE`, `CREATE`).
     - Blocks any statement that is not a strictly read-only `SELECT` query on read-only keys.
   - **Domain Whitelist Sentry**: Parses target URLs for `fetch_web`/HTTP tools and evaluates domain glob patterns (e.g. `*.internal.company.com`).
   - **Verdict Debate Evaluator**: Checks if payload length exceeds `verdict_token_threshold` (default 150 tokens) to trigger inline debate evaluation.

3. **Frontend Key Manager (`mcp-keys/page.tsx`)**:
   - Complete table listing all created keys, active status badges, tool permission tags, and revoke actions.
   - `KeyModal.tsx`: Creation dialog with permission toggles (Allow DB, Strict Read-Only SQL, Allow Bash, Inline Verdict Debate, Allowed Domains).
   - `ConfigSnippetModal.tsx`: 1-Click copy-pasteable JSON configuration for `claude_desktop_config.json`, Cursor, and Devin.

---
*Researched: 2026-08-25*
