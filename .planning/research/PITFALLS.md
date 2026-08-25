# Pitfalls Research — Verdict Studio & MCP Control Plane
## Updated with verified Verdict v0.2.7 internals

## 1. MCP stdout Contamination (CRITICAL)
**Risk:** The #1 cause of MCP server failure is non-JSON output on stdout. Any `console.log()`, library banner, or error message on stdout corrupts the JSON-RPC stream.
**Mitigation:** All logging in MCP Gateway MUST use `console.error()`. Lint rules to ban `console.log` in gateway code.
**Confidence:** HIGH

## 2. Custom Unit ResponseSchema Requirement (CRITICAL — NEW)
**Risk:** Verdict **requires** every custom `Unit` subclass to define a `ResponseSchema` class. The `UnitRegistry` metaclass raises `ConfigurationError` if missing. Our Prosecutor/Defense/FactChecker nodes CANNOT be simple `Unit(name="...")` instances.
**Mitigation:** The code exporter must generate proper subclasses:
```python
class ProsecutorUnit(Unit):
    class ResponseSchema(Schema):
        argument: str
```
Alternatively, use `PostHocExtractor` or `RawExtractor` with a raw string schema, but this adds complexity.
**Confidence:** HIGH — verified in `verdict/core/primitive.py:134`

## 3. MaxPoolUnit is Majority Vote, NOT Max (CRITICAL — NEW)
**Risk:** `MaxPoolUnit` uses `statistics.mode` (majority voting), NOT `max()`. The name is misleading. If we document it as "max" in the UI, users will be confused when it performs majority voting.
**Mitigation:** Label it as "Majority Vote (MaxPool)" in the UI. The code exporter should add a comment: `# MaxPoolUnit uses statistics.mode (majority voting)`.
**Confidence:** HIGH — verified in `verdict/transform.py:134`

## 4. Previous Resolution Requires Unit Type Registration (CRITICAL — NEW)
**Risk:** `{previous.prosecutor}` in prompt templates works by looking up "prosecutor" (lowercase) in `Unit._registry`. This means the unit must be registered by the metaclass. Simple `Unit(name="Prosecutor")` registers as "" (empty string after removing "Unit"), NOT "prosecutor".
**Mitigation:** Custom Unit subclasses like `class ProsecutorUnit(Unit)` auto-register as "prosecutor". This MUST be reflected in the code exporter — generic `Unit(name="...")` won't work for `{previous.<type>}` references.
**Confidence:** HIGH — verified in `verdict/core/primitive.py:59-90, 119-151`

## 5. Schema.of() vs Schema.infer() Confusion
**Risk:** `Schema.of()` returns an **instance**, `Schema.infer()` returns a **type** (class). Using the wrong one causes type errors.
**Mitigation:** Pipeline input: `Schema.of(query="...")`. ResponseSchema definition: `Schema.infer(score=DiscreteScale(...))`. Document clearly in code exporter output.
**Confidence:** HIGH

## 6. Layer repeat Parameter (NOT n)
**Risk:** Our earlier research incorrectly documented the Layer ensemble parameter as `n`. The actual parameter is `repeat`.
**Mitigation:** Code exporter must use `Layer(unit, repeat=3)`, NOT `Layer(unit, n=3)`.
**Confidence:** HIGH — verified in `verdict/core/primitive.py:522-528`

## 7. React Flow Performance with Large DAGs
**Risk:** @xyflow/react can become sluggish with >50 nodes if custom nodes render heavy components.
**Mitigation:** Use `React.memo()` on custom nodes. Keep streaming viewer in separate panel, not inside nodes.
**Confidence:** HIGH

## 8. WebSocket Connection Management
**Risk:** WebSocket connections can drop silently. Without reconnection logic, users lose live streams.
**Mitigation:** Exponential backoff reconnection. Heartbeat ping/pong. Connection status indicator.
**Confidence:** HIGH

## 9. Verdict Pipeline Cold Start Latency
**Risk:** First pipeline execution requires LLM API calls to 3-4 models. Cold start can take 5-15 seconds.
**Mitigation:** Clear loading states with progress indicators. The `display=True` parameter in `pipeline.run()` enables rich streaming output — we should leverage this.
**Confidence:** MEDIUM

## 10. Key Security in Local Development
**Risk:** Storing raw API keys in SQLite without encryption.
**Mitigation:** Always store SHA-256 hashes. Show raw key only once at creation. Production requires HTTPS + encrypted storage.
**Confidence:** HIGH

## 11. SQL Injection via SQL Read-Only Enforcement
**Risk:** Naive string matching can be bypassed with case manipulation, comments, or encoding.
**Mitigation:** Use `sqlparse` Python library for proper SQL AST parsing. Block all non-SELECT statements.
**Confidence:** HIGH

## 12. Code Export Accuracy — Prompt Template Escaping (NEW)
**Risk:** Verdict prompts use Python f-string-like `{source.field}` syntax but with a custom `auto_format` evaluator. Double braces `{{` and `}}` trigger warnings in verdict. The code exporter must NOT escape braces in generated prompt strings.
**Mitigation:** Generate prompt strings as raw Python strings with single braces. Test generated code against verdict's `Prompt.auto_format()`.
**Confidence:** HIGH — verified in `verdict/prompt.py:222-228`

## 13. MCP Gateway ↔ FastAPI Reliability
**Risk:** If FastAPI is down, all MCP tool calls through the gateway fail.
**Mitigation:** Health check endpoint. Fail-open vs fail-closed policy decision. Circuit breaker.
**Confidence:** HIGH

## 14. Extractor Default Behavior (NEW)
**Risk:** The default extractor is `StructuredOutputExtractor`, which uses `instructor` for function-calling. This requires the LLM provider to support tool/function calling. Some models (especially vLLM or older models) don't support this.
**Mitigation:** Provide a fallback to `PostHocExtractor` or `RawExtractor` in the node configuration UI. Document model compatibility.
**Confidence:** HIGH — verified in `verdict/extractor.py`

---
*Updated: 2026-08-25 | Pitfalls verified against verdict v0.2.7 source code | Confidence levels marked per item*
