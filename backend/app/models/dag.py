import time
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DAGNode(BaseModel):
    id: str
    type: str  # 'input' | 'prosecutor' | 'defense' | 'factchecker' | 'chiefjustice' | 'cot' | 'aggregator'
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0})
    data: Dict[str, Any] = Field(default_factory=dict)


class DAGEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class DAGGraph(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(default="Verdict Multi-Agent Debate")
    description: Optional[str] = None
    nodes: List[DAGNode] = Field(default_factory=list)
    edges: List[DAGEdge] = Field(default_factory=list)
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)


class DAGExecutionRequest(BaseModel):
    dag: DAGGraph
    inputs: Dict[str, Any] = Field(default_factory=dict)
    api_keys: Optional[Dict[str, Any]] = None
    custom_api_key: Optional[str] = None
    max_workers: int = 128
    stream_tokens: bool = True


class DAGExecutionResponse(BaseModel):
    execution_id: str
    status: str  # "COMPLETED" | "FAILED"
    outputs: Dict[str, Any]
    leaf_nodes: List[str]
    execution_time_ms: float
