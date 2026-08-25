# Phase 3: Verdict Pipeline Executor & Live Debate Streaming — Research

## Implementation Approach
Phase 3 bridges the visual canvas with real execution and standalone Python code generation:

1. **DAG Graph $\to$ Verdict v0.2.x Pipeline Compilation (`verdict_runner.py`)**:
   - Parse `DAGNode` and `DAGEdge` topologies into topological layers.
   - For custom debaters (Prosecutor, Defense, FactChecker), instantiate custom `Unit` subclasses with defined `ResponseSchema` (`class ResponseSchema(Schema): argument: str`).
   - For judges, map to `CategoricalJudgeUnit` or `JudgeUnit` with appropriate `Scale` (`DiscreteScale`, `BooleanScale`, `LikertScale`).
   - For aggregators, map to `MaxPoolUnit` (majority voting via `statistics.mode`), `MeanPoolUnit`, or `MapUnit`.
   - Chain layers together using `Layer([nodes], repeat=N, inner=..., outer=...)` and the `>>` pipe operator into `Pipeline(name)`.
   - Provide a high-performance execution engine that runs `pipeline.run(input_data=Schema.of(...))` when API keys are available, and a realistic token-streaming simulator for instant zero-config interactive demos.

2. **Real-time WebSocket Debate Streamer (`live_streamer.py`)**:
   - Emits structured WebSocket events:
     - `DEBATE_STARTED`: `execution_id`, `dag_name`, timestamp
     - `NODE_ACTIVATED`: `node_id`, `unit_name`, `role` (triggers canvas glowing animation!)
     - `TOKEN_CHUNK`: `node_id`, `token`, `chunk_index`
     - `NODE_COMPLETED`: `node_id`, `output_text`, `latency_ms`
     - `DEBATE_COMPLETED`: `execution_id`, `final_verdict`, `total_time_ms`

3. **1-Click Python Code Exporter (`codeExporter.ts`)**:
   - Generates clean, standalone Python scripts runnable via `python debate_pipeline.py`.
   - Includes all required imports: `from verdict import Pipeline, Layer, Unit`, `from verdict.common.judge import CategoricalJudgeUnit`, `from verdict.scale import DiscreteScale`, `from verdict.transform import MaxPoolUnit`, `from verdict.schema import Schema`.
   - Formats prompt templates cleanly preserving `{source.*}` and `{previous.*}` syntax.
   - Includes comments explaining the execution flow and `MaxPoolUnit` majority voting behavior.

---
*Researched: 2026-08-25*
