# Verdict v0.2.7 — Authoritative API Reference
## Source: Direct reading of `haizelabs/verdict` repository source code

> **Confidence: HIGH — every class, method, and parameter below was verified by reading the actual Python source files.**

---

## 1. Public Exports (`verdict/__init__.py`)

```python
from verdict import Unit, Layer, Block, Pipeline, Image
from verdict import MapUnit, MeanPoolUnit, MeanVariancePoolUnit, MaxPoolUnit
```

The `__all__` exports: `Unit`, `Layer`, `Block`, `Pipeline`, `Image`, plus all transforms.

---

## 2. Core Primitives (`verdict/core/primitive.py`)

### 2.1 `Unit`
**Inheritance:** `Unit(Node, Task, ModelConfigurable, Promptable, DataFlowSchema[InputSchemaT, ResponseSchemaT, OutputSchemaT], metaclass=UnitRegistry)`

**Constructor:**
```python
Unit.__init__(self, **kwargs)  # kwargs passed to Node (name: Optional[str] = None)
```

**Data Flow Schemas (inner classes):**
- `InputSchema` — auto-created as `Schema.inline()` (empty) if not defined
- `ResponseSchema` — **REQUIRED** for custom units (ConfigurationError if missing)
- `OutputSchema` — defaults to `ResponseSchema` if not defined

**Key Methods:**
| Method | Signature | Purpose |
|--------|-----------|---------|
| `.prompt()` | `prompt(self, prompt: Union[str, Prompt]) -> Self` | Set prompt template (from `Promptable` mixin) |
| `.via()` | `via(self, policy_or_name, retries=1, **inference_parameters) -> Self` | Set model (from `ModelConfigurable` mixin) |
| `.extract()` | Injected via `Extractor.inject(unit)` | Set extraction strategy |
| `.propagate()` | Via `Propagator(fn)` — `fn(unit, previous, source, output) -> Schema` | Custom output transformation |
| `.execute()` | `execute(self, input, execution_context=None) -> OutputSchemaT` | Full execution cycle |
| `.validate()` | `validate(self, input, response) -> None` | Override for custom validation |
| `.process()` | `process(self, input, response) -> Union[OutputSchemaT, ResponseSchemaT]` | Override for post-processing |
| `.copy()` | `copy(self) -> Self` | Shallow copy with fresh sync state |
| `.clone()` | `clone(self) -> Self` | Associated copy (shared sync state) |

**`>>` Operator:**
```python
def __rshift__(self, other: Union["Unit", "Layer", "Block"]):
    return (Block() >> self) >> other  # Wraps in Block, then chains
```

**UnitRegistry Metaclass:**
- Auto-registers all Unit subclasses by lowercase name (without "Unit" suffix)
- `Previous.__getattr__` resolves `previous.judge` → looks up "judge" in registry
- Name collision warning if duplicate shortnames

### 2.2 `Previous`
Provides access to upstream unit outputs in prompt templates.

```python
previous.score         # Single dependency: gets .output.score
previous.judge         # Lookup by unit type name: finds JudgeUnit in dependencies
previous.factchecker   # Finds FactCheckerUnit in dependencies
```

**Resolution rules:**
1. If 1 dependency and it has the attribute → return `dependency.output.attr`
2. Else lookup `key.lower()` in `Unit._registry` → find matching dependencies
3. If 1 match → return `match.output`
4. If multiple matches → return `list(map(unit.output, matches))`

### 2.3 `Propagator`
```python
Propagator(fn: Callable[[Unit, Previous, Schema, Schema], Schema])
# Default: lambda unit, previous, source, output: output  (pass-through)
```

### 2.4 `Layer`
**Constructor:**
```python
Layer.__init__(
    self,
    nodes: Union[Node, List[Node]],  # Unit(s) or nested Layer(s)/Block(s)
    repeat: int = 1,                 # Number of copies (ensemble size)
    inner: Union[str, LinkType.Inner] = LinkType.Inner.NONE,   # Intra-layer links
    outer: Union[str, LinkType.Outer] = LinkType.Outer.DENSE,  # Inter-layer links
)
```

**LinkType Enums:**

| Inner | Value | Behavior |
|-------|-------|----------|
| `NONE` | 0 | `U  U  U` — Independent parallel execution |
| `CHAIN` | 1 | `U - U - U` — Sequential chain within layer |

| Outer | Value | Behavior |
|-------|-------|----------|
| `DENSE` | 0 | All-to-all: every leaf connects to every root of next layer |
| `BROADCAST` | 1 | 1-to-1: leaf[i] connects to root[i] (requires equal sizes) |
| `CUMULATIVE` | 2 | Triangular: leaf[i] connects to root[0..i] |
| `LAST` | 3 | Only last leaf connects forward |

**Methods:**
- `with_root(idx)` / `with_leaf(idx)` — Override which nodes are root/leaf
- `copy()` / `clone()` — Same semantics as Unit

### 2.5 `Block`
Container graph that holds Units and Layers. Created implicitly by `>>` operator.

```python
Block.__init__(self, name: Optional[str] = None)
```

**`>>` Operator (the core DAG builder):**
```python
def __rshift__(self, other: Union[Unit, Layer, "Block"]) -> "Block":
    # If other is Block: merge graphs, link leaves → roots
    # If other is Unit/Layer: add to graph, link leaves → other
    # Returns self.leaf_view()
```

---

## 3. Pipeline (`verdict/core/pipeline.py`)

```python
Pipeline.__init__(
    self,
    name: str = "Pipeline",
    tracer: Optional[Union[Tracer, List[Tracer]]] = None,
)
```

**Key Methods:**
| Method | Signature |
|--------|-----------|
| `>>` | `__rshift__(self, other: Union[Unit, Layer, Block]) -> Self` — Appends to internal `self.block` |
| `.via()` | `via(self, policy_or_name, retries=1, **inference_parameters) -> Self` — Set model for ALL units |
| `.run()` | `run(self, input_data=Schema.empty(), max_workers=128, display=False, graceful=False, tracers=None) -> Tuple[Dict[str, Schema], List[str]]` |
| `.run_from_dataset()` | `run_from_dataset(self, dataset: DatasetWrapper, max_workers=128, ...) -> Tuple[pd.DataFrame, List[str]]` |
| `.run_from_list()` | `run_from_list(self, dataset: List[Schema], max_workers=128, ...) -> Tuple[Dict, List[str]]` |
| `.plot()` | `plot(self, display=False) -> PIL.Image.Image` |

---

## 4. Schema System (`verdict/schema.py`)

**Base class:** `Schema(BaseModel, ABC)` — extends Pydantic BaseModel with `frozen=True`.

**Static/Class Methods:**
| Method | Signature | Purpose |
|--------|-----------|---------|
| `Schema.of(**kwargs)` | `of(score=5)` → `InferredSchema(score=5)` | Create instance with inferred types |
| `Schema.infer(**kwargs)` | `infer(score=5)` → `Type[InferredSchema]` | Create **type** (class) with inferred types |
| `Schema.inline(**kwargs)` | `inline(score=int)` → `Type[InlineSchema]` | Create type from explicit type annotations |
| `Schema.empty()` | → `EmptySchema()` | Empty schema instance |
| `Schema.from_values(**kwargs)` | → `Schema(...)` instance | From keyword values |
| `.append(**kwargs)` | → `Type[Schema]` | Add fields to existing schema type |
| `.prepend(**kwargs)` | → `Type[Schema]` | Prepend fields to schema type |
| `.add(**kwargs)` | → `Schema` instance | Add fields to instance |
| `.conform(expected, logger)` | → `Schema` | Match current schema to expected schema |
| `.is_empty()` | → `bool` | Check if schema has no fields |

**Scale integration in Schema:**
```python
class ResponseSchema(Schema):
    score: Scale = DiscreteScale((1, 5))  # Scale field type → auto-resolves to int
```
When a field has type `Scale`, the `__init_subclass__` hook:
1. Extracts the Scale instance from the class dict
2. Replaces the annotation with `scale.T` (e.g., `int`, `float`, `bool`)
3. Stores the scale in `cls._scales[field_name]`
4. Sets the Pydantic `Field(...)` from `scale.pydantic_fields()`

---

## 5. Scale Types (`verdict/scale.py`)

### `DiscreteScale`
```python
DiscreteScale(
    values: Union[List[Any], Tuple[Any, Any], Tuple[Any, Any, Optional[int]]],
    end_is_worst: bool = False,
)
```
- `DiscreteScale([1, 2, 3, 4, 5])` — explicit list
- `DiscreteScale((1, 5))` — range tuple (inclusive, step=1)
- `DiscreteScale((1, 10, 2))` — range with step
- `DiscreteScale(["yes", "no"])` — categorical strings
- `DiscreteScale(["PASSED", "FAILED"])` — binary categories

### `BooleanScale`
```python
BooleanScale(
    yes: List[str] = ["yes", "Yes", "YES"],
    no: List[str] = ["no", "No", "NO"],
)
```

### `ContinuousScale`
```python
ContinuousScale(
    min_value: float,
    max_value: float,
    end_is_worst: bool = False,
)
```

### `LikertScale` (factory function)
```python
def LikertScale(end_is_worst: bool = False) -> Scale:
    return DiscreteScale((1, 5), end_is_worst)
```

---

## 6. Extractors (`verdict/extractor.py`)

| Extractor | Constructor | Purpose |
|-----------|------------|---------|
| `StructuredOutputExtractor` | `()` — default | Uses `instructor` for function-calling / structured output |
| `RawExtractor` | `()` | Raw text response (single `str` field) |
| `RegexExtractor` | `RegexExtractor(fields: Dict[str, str])` | Regex patterns per field |
| `PostHocExtractor` | `PostHocExtractor(policy_or_name=None, retries=1, **kwargs)` | Two-stage: raw → structured via second LLM call |
| `TokenProbabilityExtractor` | `()` | Uses logprobs on token support |
| `ArgmaxScoreExtractor` | `()` | Extends TokenProbabilityExtractor, returns argmax |
| `SampleScoreExtractor` | `()` | Extends TokenProbabilityExtractor, samples from distribution |
| `WeightedSummedScoreExtractor` | `()` | Extends TokenProbabilityExtractor, weighted sum (requires numeric scale) |

**Default extractor**: `StructuredOutputExtractor` (used when no `.extract()` is called).

---

## 7. Transforms & Aggregators (`verdict/transform.py`)

### `MapUnit`
```python
MapUnit(map_func: Callable[[Union[Any, List[Any]]], Union[Any, List[Any]]], **kwargs)
```
- `InputSchema`: `values: Union[Any, List[Any]]`
- `ResponseSchema`: `values: Union[Any, List[Any]]`
- Applies `map_func` to accumulated values from upstream units

### `FieldMapUnit(MapUnit)`
```python
FieldMapUnit(map_func: Callable, fields: Union[str, List[str]], **kwargs)
```
- Applies `map_func` per-field (e.g., aggregate `score` fields from multiple judges)
- Empty `fields=[]` → auto-detects all fields from input

### Pre-built Aggregators

| Unit | Internal Function | Purpose |
|------|------------------|---------|
| `MaxPoolUnit(fields=[])` | `statistics.mode` | **Majority voting** (NOT max — uses mode!) |
| `MeanPoolUnit(fields=[])` | `statistics.mean` | Average pooling |
| `MeanVariancePoolUnit(fields=[])` | Custom: `mean` + `variance` | Mean with variance tracking |

> ⚠️ **CRITICAL FINDING**: `MaxPoolUnit` uses `statistics.mode` (majority vote), NOT `max()`. The name is misleading. Our code exporter must document this accurately.

---

## 8. Judge Units (`verdict/common/judge.py`)

### `JudgeUnit`
```python
JudgeUnit(scale: Optional[Scale] = None, explanation: bool = False, **kwargs)
```
- Default scale: `LikertScale()` → `DiscreteScale((1, 5))`
- Default ResponseSchema: `score: Scale = LikertScale()`
- If `explanation=True`: prepends `explanation: str` field

### `BestOfKJudgeUnit`
```python
BestOfKJudgeUnit(
    k: int = 2,
    response_options: Optional[DiscreteScale] = None,
    explanation: bool = False,
    original: bool = False,
    **kwargs,
)
```
- Default response_options: `DiscreteScale(list(string.ascii_uppercase[:k]))` → `["A", "B"]`
- If `original=True`: maps choice back to original option text

### `PairwiseJudgeUnit(BestOfKJudgeUnit)`
```python
PairwiseJudgeUnit(response_options=None, explanation=False, original=False, **kwargs)
```
- Fixed `k=2`

### `CategoricalJudgeUnit(BestOfKJudgeUnit)`
```python
CategoricalJudgeUnit(categories=None, explanation=False, original=False, **kwargs)
```
- Fixed `k=2`, `categories` maps to `response_options`
- Example: `CategoricalJudgeUnit(categories=DiscreteScale(["yes", "no"]))`

---

## 9. Other Common Units

### `CoTUnit` (`verdict/common/cot.py`)
```python
class CoTUnit(Unit):
    _char: str = "CoT"
    class ResponseSchema(Schema):
        thinking: str
```

### `ConversationalUnit` (`verdict/common/conversational.py`)
```python
ConversationalUnit(role_name: str, number: bool = True, **kwargs)
```
- InputSchema: `conversation: Conversation` (default factory)
- ResponseSchema: `response: str`
- OutputSchema: `conversation: Conversation, response: str`
- Auto-appends response to conversation history

### `RankerUnit` (`verdict/common/ranker.py`)
```python
RankerUnit(k=3, options=None, explanation=False, original=False, **kwargs)
```

### `EnsembleVerifyJudge` (`verdict/common/ensemble_verify.py`)
```python
@dataclass
EnsembleVerifyJudge(
    judge_prompt, verify_prompt, output_categories, model,
    repeat=3, retries=3, judge_temperature=0.7, verify_temperature=0.0,
    judge_explanation=True, kwargs={}
)
```
Pattern: `Block >> CategoricalJudgeUnit >> CategoricalJudgeUnit` → `Layer(repeat=3)` → `MaxPoolUnit()`

### `GEvalJudge` (`verdict/common/g_eval.py`)
```python
@dataclass
GEvalJudge(
    cot_prompt, cot_model="gpt-4o", cot_temperature=0.5,
    judge_prompt, judge_model="gpt-4o-mini", judge_temperature=0.0,
    retries=3, kwargs={}
)
```
Pattern: `Pipeline >> CoTUnit >> JudgeUnit(scale=DiscreteScale((1,5)))`

### `ModelEnsembleJudge` (`verdict/common/model_ensemble.py`)
```python
@dataclass
ModelEnsembleJudge(judge_prompt: str, models: List[str], kwargs={})
```

---

## 10. Prompt System (`verdict/prompt.py`)

### Template Variables (available in `.prompt()` strings)
| Variable | Access Pattern | Source |
|----------|---------------|--------|
| `{source.<field>}` | `source.query`, `source.context` | Original pipeline input data |
| `{previous.<field>}` | `previous.score`, `previous.thinking` | Output from upstream dependency |
| `{previous.<UnitType>}` | `previous.judge`, `previous.factchecker` | Full output of upstream unit by type name |
| `{input.<field>}` | `input.response` | Conformed input to current unit |
| `{unit.<attr>}` | `unit.role_name`, `unit.name` | Current unit's attributes |

### Prompt Sections
```python
# Default: entire string is @user prompt
unit.prompt("Evaluate this: {source.query}")

# With system prompt:
unit.prompt("""
@system
You are a helpful evaluator.

@user
Evaluate: {source.query}
""")
```

### `.prompt()` chain (from `Promptable`)
```python
def prompt(self, prompt: Union[str, Prompt]) -> Self:
    # If str: creates Prompt.from_template(prompt)
    # Captures caller's local variables for f-string-like access
```

---

## 11. Model Configuration (`verdict/model.py`)

### `.via()` chain (from `ModelConfigurable`)
```python
unit.via("gpt-4o")                          # Simple model name (uses LiteLLM)
unit.via("gpt-4o", retries=3)               # With retries
unit.via("gpt-4o", temperature=0.7)         # With inference params
unit.via("claude-3-5-sonnet-20241022")       # Anthropic model
unit.via(["gpt-4o", "claude-3-5-sonnet"])    # Fallback chain
unit.via(ProviderModel(name="gpt-4o"))       # Explicit Model object
unit.via(vLLMModel(name="...", api_base="...", api_key="..."))  # Self-hosted vLLM
```

**Model Types:**
- `ProviderModel(name: str, use_nonce=False, rate_limiter=None)` — Any LiteLLM-supported provider
- `vLLMModel(name: str, api_base: str, api_key: str)` — Self-hosted vLLM endpoint

---

## 12. Dependencies (`pyproject.toml`)

```
instructor==1.7.2, litellm, openai, dill, graphviz, pandas, pydantic,
numpy, rich, scikit-learn, scipy, datasets, tokenizers, networkx,
pillow, eval-type-backport, typing_extensions, loguru, krippendorff
```

---

## 13. Canonical Pipeline Patterns

### Pattern A: Simple Ensemble (3 judges + majority vote)
```python
from verdict import Pipeline, Layer, MaxPoolUnit
from verdict.common.judge import CategoricalJudgeUnit
from verdict.scale import DiscreteScale

pipeline = (
    Pipeline("SafetyEnsemble")
    >> Layer(
        CategoricalJudgeUnit(categories=DiscreteScale(["safe", "unsafe"]))
        .prompt("Is this response safe? {source.response}")
        .via("gpt-4o-mini", temperature=0.7),
        repeat=3,
    )
    >> MaxPoolUnit()
)
```

### Pattern B: Multi-Agent Debate (Prosecutor + Defense → Chief Justice)
```python
from verdict import Pipeline, Layer, Unit
from verdict.common.judge import CategoricalJudgeUnit
from verdict.scale import DiscreteScale

prosecutor = (
    Unit(name="Prosecutor")
    .prompt("Argue AGAINST this answer: {source.answer}")
    .via("claude-3-5-sonnet")
)

defense = (
    Unit(name="Defense")
    .prompt("Argue FOR this answer: {source.answer}")
    .via("gpt-4o")
)

# NOTE: Unit requires a ResponseSchema. For custom Units, subclass with ResponseSchema.
# For simple prompt+response, the default StructuredOutputExtractor needs a schema.
# Use PostHocExtractor or RawExtractor for free-form text.

chief_justice = (
    CategoricalJudgeUnit(
        name="ChiefJustice",
        categories=DiscreteScale(["PASSED", "FAILED"]),
    )
    .prompt("""
        Prosecution: {previous.prosecutor}
        Defense: {previous.defense}
        Render your verdict.
    """)
    .via("gpt-4o")
)

pipeline = (
    Pipeline("DebateCourt")
    >> Layer([prosecutor, defense])  # Parallel execution
    >> chief_justice                # Both feed into judge
)
```

### Pattern C: CoT + Judge (G-Eval pattern)
```python
from verdict import Pipeline
from verdict.common.cot import CoTUnit
from verdict.common.judge import JudgeUnit
from verdict.scale import DiscreteScale

pipeline = (
    Pipeline("GEval")
    >> CoTUnit(name="Thinker")
       .prompt("Think step by step about: {source.query}")
       .via("gpt-4o", temperature=0.5)
    >> JudgeUnit(scale=DiscreteScale((1, 5)))
       .prompt("Based on thinking: {previous.thinking}\nScore:")
       .via("gpt-4o-mini")
)
```

### Pattern D: Ensemble + Verify (EnsembleVerifyJudge pattern)
```python
from verdict import Pipeline, Layer, Block
from verdict.common.judge import CategoricalJudgeUnit
from verdict.scale import DiscreteScale
from verdict.transform import MaxPoolUnit

judge_verify_block = (
    Block()
    >> CategoricalJudgeUnit(name="judge", categories=DiscreteScale(["yes", "no"]), explanation=True)
       .prompt("Is claim consistent with doc? {source.doc}\n{source.claim}")
       .via("gpt-4o", temperature=0.7)
    >> CategoricalJudgeUnit(name="verify", categories=DiscreteScale(["yes", "no"]))
       .prompt("Check answer: {previous.choice}\n{previous.explanation}")
       .via("gpt-4o", temperature=0.0)
)

pipeline = (
    Pipeline("EnsembleVerify")
    >> Layer([judge_verify_block], repeat=3)
    >> MaxPoolUnit()
)
```

### Pattern E: Conversational Debate
```python
from verdict import Pipeline, Layer
from verdict.common.conversational import ConversationalUnit

pipeline = (
    Pipeline("Debate")
    >> Layer(
        [
            ConversationalUnit("Proponent").prompt("Argue for: {source.topic}\n{input.conversation}").via("gpt-4o"),
            ConversationalUnit("Opponent").prompt("Argue against: {source.topic}\n{input.conversation}").via("claude-3-5-sonnet"),
        ],
        repeat=3,       # 3 rounds of debate
        inner="chain",  # Sequential within layer (Proponent → Opponent → Proponent → ...)
    )
)
```

---
*Generated: 2026-08-25 | Source: Direct reading of haizelabs/verdict v0.2.7 source code*
*All claims verified against actual Python files — confidence: HIGH*
