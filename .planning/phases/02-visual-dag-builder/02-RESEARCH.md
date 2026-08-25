# Phase 2: Visual DAG Builder (React Flow Canvas) — Research

## Implementation Approach
Phase 2 builds the interactive, visual multi-agent debate designer:
1. **`@xyflow/react` v12 Integration**:
   - Custom node types registered via `nodeTypes` map.
   - `Handle` components with `type="target"` and `type="source"` with custom styling.
   - React Flow custom events (`onNodesChange`, `onEdgesChange`, `onConnect`, `onNodeClick`, `onPaneClick`, `onDrop`, `onDragOver`).
2. **Node Visual Architecture**:
   - Distinct color themes per role:
     - **Input**: Blue/Indigo
     - **Prosecutor**: Crimson/Red (adversarial)
     - **Defense**: Emerald/Green (constructive)
     - **FactChecker**: Cyan/Sky (verification)
     - **ChiefJustice**: Amber/Gold (adjudicator)
     - **CoT**: Purple/Violet (reasoning)
     - **Aggregator**: Slate/Zinc (pooling/majority vote)
   - Real-time execution glow indicators (`animate-pulse`, border glow).
   - Display key configuration snippets on the node (Model name, prompt snippet, temperature).
3. **Configuration Drawer (`NodeConfigDrawer.tsx`)**:
   - Slide-over or side panel activated on node selection.
   - Model selection dropdown with frontier models (Claude 3.5 Sonnet, GPT-4o, GPT-4o-mini, o1-mini, Gemini 1.5 Pro, Llama-3.3-70b).
   - Prompt template editor with dynamic `{source.<field>}`, `{previous.<unittype>}`, `{input.<field>}` quick-insert pills.
   - Scale selector (`DiscreteScale`, `BooleanScale`, `ContinuousScale`, `LikertScale`).
   - Layer mode controls (`repeat` count, `inner="none"|"chain"`, `outer="dense"|"broadcast"`).
4. **Preset Debate Architectures**:
   - **Adversarial Safety Court**: `Input` $\to$ `Layer([Prosecutor, Defense, FactChecker])` $\to$ `ChiefJustice`
   - **G-Eval Coherence**: `Input` $\to$ `CoTUnit` $\to$ `JudgeUnit(1-5)`
   - **Ensemble Verification**: `Input` $\to$ `Layer([Judge, Verify], repeat=3)` $\to$ `MaxPoolUnit (Majority Vote)`

---
*Researched: 2026-08-25*
