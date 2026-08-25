# Research Summary — Verdict Studio & MCP Control Plane

## Key Findings

### 1. `verdict` Library (Haize Labs) — Confidence: HIGH
- **Version:** 0.2.7 on PyPI, Python >= 3.9
- **Core API:** `Pipeline`, `Unit`, `Layer`, `Block` — compose DAGs with `>>` operator
- **Judge types:** `JudgeUnit`, `CategoricalJudgeUnit`, `PairwiseJudgeUnit`, `BestOfKJudgeUnit`
- **Scales:** `DiscreteScale`, `BooleanScale`, `ContinuousScale`
- **Extractors:** `ArgmaxScoreExtractor`, `RegexExtractor`, `PostHocExtractor`
- **Transforms:** `MaxPoolUnit`, `MeanPoolUnit`, `MapUnit`
- **Model backend:** LiteLLM (supports OpenAI, Anthropic, Gemini, local vLLM)
- **Prompt templates:** `{source.<field>}`, `{previous.<field>}`, `{input.<field>}}`
- **Visualization:** `pipeline.plot()` via Graphviz

### 2. MCP TypeScript SDK — Confidence: HIGH
- **Version:** 1.30.0 on npm (also modular 2.x packages available)
- **High-level API:** `McpServer` class with Zod schema validation
- **Low-level API:** `Server` class for custom protocol handling (needed for our gateway)
- **Transports:** `StdioServerTransport`, `StreamableHTTPServerTransport`
- **Client SDK:** `Client` class with `StdioClientTransport` for downstream proxying
- **Protocol:** JSON-RPC 2.0 — `tools/list`, `tools/call`, `resources/list`, `resources/read`
- **Gateway pattern:** Verified — namespace tools by prefix, route calls to downstream servers

### 3. Architecture Decision — 3-Process Model
The platform requires 3 separate processes:
1. **Next.js frontend** (port 3000) — UI, React Flow canvas
2. **FastAPI backend** (port 8000) — REST API, WebSocket hub, verdict executor
3. **MCP Gateway** (stdio) — TypeScript MCP server that agents connect to

This is unavoidable because `verdict` is Python-only and MCP SDK is TypeScript-only.

### 4. Critical Pitfalls Identified
1. **stdout contamination** in MCP gateway (MUST use stderr for all logs)
2. **SQL injection bypass** in read-only enforcement (use `sqlparse`, not string matching)
3. **Code export accuracy** (must generate syntactically valid `verdict` code)
4. **WebSocket reconnection** (implement exponential backoff)

### 5. Differentiating Features
The combination of visual verdict DAG building + scoped MCP key management + real-time verdict enforcement on tool calls is **unique in the ecosystem**. No existing tool offers this unified workflow.

---
*Research completed: 2026-08-25 | All claims verified via web search, PyPI, npm, GitHub*
