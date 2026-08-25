import time
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MCPKeyCreateRequest(BaseModel):
    name: str = Field(..., description="Human-readable identifier for the key (e.g. Claude Desktop Prod)")
    allowed_tools: List[str] = Field(default_factory=lambda: ["db_query", "fetch_web"], description="Whitelist of allowed MCP tool names")
    prohibited_tools: List[str] = Field(default_factory=lambda: ["bash", "file_delete"], description="Blacklist of strictly forbidden tools")
    enforce_verdict_eval: bool = Field(default=True, description="Whether to trigger inline Verdict debate before tool return is ingested")
    verdict_token_threshold: int = Field(default=150, description="Minimum output tokens in tool return to trigger Verdict debate")
    sql_read_only: bool = Field(default=True, description="Strict AST-level read-only SQL enforcement")
    allowed_domains: List[str] = Field(default_factory=lambda: ["*.company.com", "api.github.com"], description="Domain whitelist for fetch/http tools")
    max_requests_per_minute: int = Field(default=60, description="Rate limit ceiling per minute")


class MCPKeyRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    key_prefix: str = Field(..., description="First 16 chars of raw key for display")
    hashed_key: str = Field(..., description="SHA-256 hash of the secret key")
    allowed_tools: List[str]
    prohibited_tools: List[str]
    enforce_verdict_eval: bool = True
    verdict_token_threshold: int = 150
    sql_read_only: bool = True
    allowed_domains: List[str]
    max_rpm: int = 60
    created_at: float = Field(default_factory=time.time)
    is_active: bool = True


class ToolExecutionRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ToolExecutionResponse(BaseModel):
    status: str  # "ALLOWED" | "BLOCKED" | "VERDICT_REVIEW"
    message: str
    data: Optional[Any] = None
    violation_reason: Optional[str] = None
    execution_time_ms: float = 0.0
