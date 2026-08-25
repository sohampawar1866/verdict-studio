import time
import uuid
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class AuditLogStatus(str, Enum):
    ALLOWED = "ALLOWED"
    BLOCKED = "BLOCKED"
    VERDICT_REVIEW = "VERDICT_REVIEW"


class AuditLogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = Field(default_factory=time.time)
    key_name: str
    tool_name: str
    status: AuditLogStatus
    parameters: Optional[Dict[str, Any]] = None
    reason: str
    execution_time_ms: float = 0.0
    verdict_score: Optional[float] = None
    client_ip: Optional[str] = None
