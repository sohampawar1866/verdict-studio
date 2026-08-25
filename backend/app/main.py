import time
import json
import logging
from typing import Dict, List, Set, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.models import (
    MCPKeyCreateRequest,
    MCPKeyRecord,
    ToolExecutionRequest,
    ToolExecutionResponse,
    AuditLogEntry,
    AuditLogStatus,
    DAGGraph,
    DAGExecutionRequest,
    DAGExecutionResponse,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("verdict_sentinel")

# In-memory Datastores (with clean migration interface to SQLite)
MCP_KEYS_DB: Dict[str, MCPKeyRecord] = {}
AUDIT_LOGS_DB: List[AuditLogEntry] = []
DAG_STORE_DB: Dict[str, DAGGraph] = {}


class ConnectionManager:
    """Manages real-time WebSocket clients for debate token streaming & audit logs."""
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Active subscribers: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        dead_connections = []
        payload = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)


ws_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Verdict Studio & Haize Sentinel API Server starting up...")
    yield
    logger.info("🛑 Shutting down server...")


app = FastAPI(
    title="Verdict Studio & Haize Sentinel API",
    description="Unified API & WebSocket Control Plane for Multi-Agent Debate Evals & Scoped MCP Governance",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint for frontend and monitoring."""
    return {
        "status": "ok",
        "service": "verdict-studio-backend",
        "version": "1.0.0",
        "active_keys": len(MCP_KEYS_DB),
        "audit_logs_count": len(AUDIT_LOGS_DB),
        "ws_subscribers": len(ws_manager.active_connections),
        "timestamp": time.time(),
    }


@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """Real-time WebSocket stream for tool execution audits and live debate token streams."""
    await ws_manager.connect(websocket)
    try:
        # Send initial connected greeting with current server status
        await websocket.send_json({
            "type": "SYSTEM_CONNECTED",
            "message": "Connected to Haize Sentinel Real-Time Telemetry Stream",
            "timestamp": time.time(),
        })
        while True:
            data = await websocket.receive_text()
            # Echo ping / pong or process client commands
            try:
                msg = json.loads(data)
                if msg.get("type") == "PING":
                    await websocket.send_json({"type": "PONG", "timestamp": time.time()})
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
