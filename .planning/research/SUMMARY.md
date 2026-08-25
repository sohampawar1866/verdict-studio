# Research Summary — Verdict Studio & MCP Control Plane
## Updated with verified source code analysis (2026-08-25)

## Key Findings

### 1. `verdict` Library (Haize Labs) — Confidence: HIGH (source code verified)
- **Version:** 0.2.7 on PyPI, Python >= 3.9
- **Public exports:** `Unit`, `Layer`, `Block`, `Pipeline`, `Image`, `MapUnit`, `MeanPoolUnit`, `MeanVariancePoolUnit`, `MaxPoolUnit`
- **Core DAG API:** `Pipeline >> Layer >> Unit` with `>>` operator (wraps in `Block` internally)
- **Layer constructor:** `Layer(nodes, repeat=1, inner="none", outer="dense")` — NOT `n` for ensemble count
- **Judge types:** `JudgeUnit`, `CategoricalJudgeUnit`, `PairwiseJudgeUnit`, `BestOfKJudgeUnit`, `RankerUnit`
- **Other units:** `CoTUnit`, `ConversationalUnit`
- **Composite patterns:** `GEvalJudge`, `EnsembleVerifyJudge`, `ModelEnsembleJudge`
- **Scales:** `DiscreteScale(values)`, `BooleanScale(yes, no)`, `ContinuousScale(min, max)`, `LikertScale()`
- **Extractors:** `StructuredOutputExtractor` (default), `RawExtractor`, `RegexExtractor(fields)`, `PostHocExtractor(model)`, `ArgmaxScoreExtractor`, `SampleScoreExtractor`, `WeightedSummedScoreExtractor`
- **Transforms:** `MapUnit(fn)`, `FieldMapUnit(fn, fields)`, `MaxPoolUnit()` (uses `statistics.mode`!), `MeanPoolUnit()`, `MeanVariancePoolUnit()`
- **Prompt templates:** `{source.*}`, `{previous.*}`, `{input.*}`, `{unit.*}` with sections `@system`, `@user`, `@no_format`
- **Model backend:** LiteLLM + instructor (function calling / structured output)
- **Dependencies:** instructor==1.7.2, litellm, pydantic, numpy, rich, pandas, etc.

### 2. CRITICAL Corrections from Source Code

| Previous Assumption | Actual Behavior | Source |
|-------------------|-----------------|--------|
| `Layer(unit, n=3)` | `Layer(unit, repeat=3)` | primitive.py:522 |
| `MaxPoolUnit` uses `max()` | Uses `statistics.mode` (majority vote) | transform.py:134 |
| `Unit(name="Prosecutor")` works standalone | Custom units MUST define `ResponseSchema` | primitive.py:134 |
| `{previous.Prosecutor}` resolves by name | Resolves by **UnitRegistry** type lookup (lowercase, "Unit" stripped) | primitive.py:59-90 |
| `pipeline.run(input={...})` | `pipeline.run(input_data=Schema.of(...))` | pipeline.py:113 |

### 3. MCP TypeScript SDK — Confidence: HIGH (verified)
- **Version:** 1.30.0 on npm
- **High-level API:** `McpServer` class with Zod schema validation
- **Low-level API:** `Server` class for custom protocol handling (needed for our gateway)
- **Transports:** `StdioServerTransport`, `StreamableHTTPServerTransport`
- **Client SDK:** `Client` class with `StdioClientTransport` for downstream proxying
- **Protocol:** JSON-RPC 2.0 — `tools/list`, `tools/call`
- **Gateway pattern:** Namespace tools by prefix, route calls to downstream servers

### 4. Architecture: 3-Process Model (Confirmed)
1. **Next.js frontend** (port 3000) — UI, React Flow canvas
2. **FastAPI backend** (port 8000) — REST API, WebSocket hub, verdict executor
3. **MCP Gateway** (stdio) — TypeScript MCP server for agent connections

### 5. Visual Node System Design Implications
- Prosecutor/Defense/FactChecker nodes must generate **custom Unit subclasses** with `ResponseSchema`
- ChiefJustice node maps to `CategoricalJudgeUnit` with `categories=DiscreteScale([...])`
- Aggregator nodes: MaxPool = majority vote, MeanPool = average, MapUnit = custom function
- Edge connections must correctly map to `Layer([...])` groupings and `>>` chains
- Prompt template editor needs `{source.*}`, `{previous.*}` autocomplete with field validation

### 6. Code Exporter Requirements
The 1-click Python code exporter must:
1. Generate proper `Unit` subclasses with `ResponseSchema` for debate nodes
2. Use `Layer(nodes, repeat=N)` NOT `Layer(nodes, n=N)`
3. Import from correct paths (e.g., `from verdict.common.judge import CategoricalJudgeUnit`)
4. Use `Schema.of(...)` for pipeline input, NOT raw dicts
5. Generate `pipeline.run(input_data=Schema.of(...))` NOT `pipeline.run({...})`
6. Preserve prompt template `{source.*}` / `{previous.*}` syntax without escaping
7. Add comments documenting `MaxPoolUnit` = majority vote

---
*Research completed: 2026-08-25 | All claims verified via direct source code reading*
*Repository cloned locally at: /Users/sohamsanjaypawar/Documents/haize_labs/verdict_repo*
