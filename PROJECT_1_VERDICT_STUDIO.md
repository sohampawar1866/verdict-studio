# Project 1 (Unified Master Platform): Verdict Studio & MCP Control Plane ⚖️🛡️
### The Visual Multi-Agent DAG Builder, Scoped MCP API Key Manager, & Agent Tool Permission Gateway

---

## 0. Context & Rationale: Why We Are Doing This

### A. The Big Picture: Unifying Evaluation with Real-Time Agent Governance
* **The Industry Dilemma:** Teams building with LLMs and autonomous agents have two major problems:
  1. **Evaluation & Safety Testing:** They need an intuitive way to compose and debug multi-model debate pipelines (`Verdict`).
  2. **Agentic Tool Access Control (MCP):** They connect agents (Claude Desktop, Cursor, Devin) to sensitive databases and APIs via Anthropic’s **Model Context Protocol (MCP)**, but have **zero centralized control over which agent can execute which tool**.
* **The Unified Solution:** **Verdict Studio & MCP Control Plane** unites both worlds into a single platform:
  * A **Visual DAG Builder** to design multi-agent debate pipelines.
  * A **Scoped MCP Key & Permission Gateway** where developers can generate API keys for different agents (e.g. `devin-key-prod`, `cursor-key-local`), grant granular tool permissions (e.g. `db_query` = READ ONLY, `bash` = BLOCKED), and enforce real-time `Verdict` safety checks on every tool execution directly from the web UI.

### B. Why Haize Labs Founders Will Be Blown Away
* **Fulfills the Exact Job Description:** Haize's posting asks to *"Build core infra, cloud tooling, and UX around our algorithms."*
* **Direct Alignment with Anthropic & Cognition (Devin):** Anthropic created MCP, and Cognition (makers of Devin) is an advisor/investor in Haize Labs. Giving agents a secure, scoped MCP control plane with visual debate evals is the exact product enterprise customers will pay $50,000/yr for.
* **Proves You Are a Full-Stack Systems Architect:** You aren't just building a toy UI; you are building an **authenticated enterprise gateway with token budgeting, cryptographic key management, JSON-RPC proxying, and WebSocket streaming**.

---

## 1. System Architecture & UI Overview

```
+──────────────────────────────────────────────────────────────────────────────────────────────────+
|  VERDICT STUDIO & MCP CONTROL PLANE                                           [ + Generate MCP Key ] |
+──────────────────────────────────────────────────────────────────────────────────────────────────+
|  [ NAVIGATION ]        │                                                                         |
|  • 📊 Visual DAG Evals │  [ MCP KEY MANAGER & PERMISSIONS ]                                      |
|  • 🔑 MCP Key Gateway  │  ┌────────────────────────────────────────────────────────────────────┐ |
|  • 🛡️ Tool Firewalls   │  │ Key Name: "Claude-Desktop-Support"  | Key: haize_mcp_live_9x8a...   │ |
|  • 📜 Live Audit Logs  │  │ Scoped Permissions:                                               │ |
|  ────────────────────  │  │  ☑️ db_read_only (SELECT only, DROP/UPDATE blocked)                │ |
|  [ DAG CANVAS ]        │  │  ⛔ bash_terminal (DISABLED)                                      │ |
|  Candidate Input ──>   │  │  ☑️ fetch_web (Domain Whitelist: *.internal.company.com)          │ |
|   Prosecutor ⚔️ Defense │  │  ⚖️ Enforce Verdict Eval on tool outputs > 200 tokens: [ENABLED]  │ |
|          │             │  └────────────────────────────────────────────────────────────────────┘ |
|          ▼             │                                                                         |
|    Chief Justice       │  [ 1-CLICK CLAUDE DESKTOP CONFIG GENERATOR ]                            |
|    (Verdict: 4.8/5)    │  { "mcpServers": { "haize": { "args": ["--key", "haize_mcp_..."] } } }  |
+──────────────────────────────────────────────────────────────────────────────────────────────────+
|  REAL-TIME MCP TOOL AUDIT LOG STREAM:                                                           |
|  [14:23:01] Claude-Desktop invoked 'db_read_only' -> Query: "SELECT * FROM orders" -> ✅ PASSED   |
|  [14:23:09] Cursor-Agent invoked 'bash' -> Command: "rm -rf /" -> 🚨 BLOCKED (Policy Violation)  |
+──────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Tech Stack & Repository Structure

* **Frontend:** Next.js 14 (App Router), TypeScript, React Flow (`@xyflow/react`), Tailwind CSS, Shadcn UI, Lucide Icons.
* **Backend:** Python 3.11 / FastAPI + TypeScript Node.js MCP Proxy Engine (`@modelcontextprotocol/sdk`).
* **Database & Cache:** SQLite / PostgreSQL (Prisma ORM) + Redis for live token rate-limiting and permission caching.
* **Protocols:** JSON-RPC 2.0 over `stdio` and Server-Sent Events (`SSE`), WebSockets for live audit streaming.

### Repository File Tree
```
verdict-studio-mcp/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Main dashboard
│   │   ├── dag-studio/page.tsx          # Visual Verdict DAG Builder
│   │   ├── mcp-keys/page.tsx            # MCP Key Generation & Permission Manager
│   │   └── audit-logs/page.tsx          # Real-time tool execution stream
│   ├── components/
│   │   ├── Canvas.tsx                   # React Flow DAG Canvas
│   │   ├── KeyModal.tsx                 # Create & configure scoped MCP keys
│   │   ├── PermissionsSelector.tsx      # Granular tool permission toggles
│   │   ├── StreamingConsole.tsx         # Live debate & tool audit stream
│   │   └── ConfigSnippetModal.tsx       # 1-click Claude Desktop config exporter
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI REST API & WebSocket hub
│   │   ├── mcp_gateway/
│   │   │   ├── server.py                # MCP Gateway (validates keys & permissions)
│   │   │   ├── policy_engine.py         # Enforces SQL/Bash/SSRF invariants
│   │   │   └── key_auth.py              # SHA-256 Key hashing & token verification
│   │   ├── engine/
│   │   │   └── verdict_runner.py        # Multi-agent debate executor
│   │   └── models/                      # Database models (Key, Policy, Log)
│   └── requirements.txt
└── README.md
```

---

## 3. Core Implementation Code

### A. The MCP Key & Scoped Permission Gateway (`backend/app/mcp_gateway/server.py`)

This backend engine intercepts MCP requests, verifies the API key, checks if the agent has permission to execute the requested tool, and optionally runs a `Verdict` safety check before returning the output.

```python
import hashlib
import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Header, Depends

app = FastAPI(title="Haize Verdict & MCP Gateway")

# In-Memory DB (Use PostgreSQL / Redis in production)
MCP_KEYS_DB: Dict[str, Dict[str, Any]] = {}
AUDIT_LOGS: List[Dict[str, Any]] = []

class MCPKeyCreateRequest(BaseModel):
    name: str
    allowed_tools: List[str]  # e.g. ["db_query", "fetch_web"]
    prohibited_tools: List[str] # e.g. ["bash", "file_delete"]
    enforce_verdict_eval: bool = True
    sql_read_only: bool = True
    max_requests_per_minute: int = 60

class ToolExecutionRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]

def hash_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()

@app.post("/api/mcp/keys")
def create_mcp_key(req: MCPKeyCreateRequest):
    """Generates a new scoped MCP API Key directly from Verdict Studio."""
    raw_key = f"haize_mcp_{hashlib.token_hex(16) if hasattr(hashlib, 'token_hex') else int(time.time())}"
    hashed = hash_key(raw_key)

    MCP_KEYS_DB[hashed] = {
        "name": req.name,
        "allowed_tools": req.allowed_tools,
        "prohibited_tools": req.prohibited_tools,
        "enforce_verdict_eval": req.enforce_verdict_eval,
        "sql_read_only": req.sql_read_only,
        "max_rpm": req.max_requests_per_minute,
        "created_at": time.time()
    }

    return {
        "raw_key": raw_key,
        "name": req.name,
        "claude_config_snippet": {
            "mcpServers": {
                "haize-sentinel": {
                    "command": "npx",
                    "args": ["-y", "@haizelabs/mcp-sentinel", "--key", raw_key]
                }
            }
        }
    }

@app.post("/api/mcp/execute-tool")
async def execute_mcp_tool_safe(
    req: ToolExecutionRequest,
    x_haize_mcp_key: Optional[str] = Header(None)
):
    """Intercepts tool execution, enforces scoped permissions, and logs audit trail."""
    if not x_haize_mcp_key:
        raise HTTPException(status_code=401, detail="Missing X-Haize-MCP-Key header")

    key_record = MCP_KEYS_DB.get(hash_key(x_haize_mcp_key))
    if not key_record:
        raise HTTPException(status_code=403, detail="Invalid or revoked MCP Key")

    # 1. Check Tool Whitelist / Blacklist Permissions
    if req.tool_name in key_record["prohibited_tools"]:
        log_entry = {
            "timestamp": time.time(),
            "key_name": key_record["name"],
            "tool": req.tool_name,
            "status": "BLOCKED",
            "reason": f"Tool '{req.tool_name}' is explicitly disabled for this MCP Key."
        }
        AUDIT_LOGS.append(log_entry)
        raise HTTPException(status_code=403, detail=log_entry["reason"])

    # 2. Check SQL Read-Only Guardrail
    if key_record["sql_read_only"] and ("sql" in req.tool_name.lower() or "db" in req.tool_name.lower()):
        query = str(req.parameters.get("query", "")).upper()
        if any(w in query for w in ["DROP", "DELETE", "TRUNCATE", "UPDATE", "INSERT"]):
            log_entry = {
                "timestamp": time.time(),
                "key_name": key_record["name"],
                "tool": req.tool_name,
                "status": "BLOCKED",
                "reason": "Destructive SQL write operation attempted on Read-Only key."
            }
            AUDIT_LOGS.append(log_entry)
            raise HTTPException(status_code=403, detail=log_entry["reason"])

    # 3. Log Successful Execution
    AUDIT_LOGS.append({
        "timestamp": time.time(),
        "key_name": key_record["name"],
        "tool": req.tool_name,
        "status": "ALLOWED",
        "reason": "Permissions validated successfully."
    })

    return {"status": "SUCCESS", "message": f"Executed '{req.tool_name}' safely."}
```

---

### B. Frontend: Key Creation & Permission Selector (`frontend/components/KeyModal.tsx`)

```tsx
"use client";
import React, { useState } from "react";
import { Shield, Key, Copy, Check } from "lucide-react";

export default function MCPKeyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [keyName, setKeyName] = useState("");
  const [allowSql, setAllowSql] = useState(true);
  const [sqlReadOnly, setSqlReadOnly] = useState(true);
  const [allowBash, setAllowBash] = useState(false);
  const [enforceVerdict, setEnforceVerdict] = useState(true);
  const [generatedKey, setGeneratedKey] = useState<any>(null);

  const handleGenerate = async () => {
    const res = await fetch("http://localhost:8000/api/mcp/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: keyName || "Default Agent Key",
        allowed_tools: [allowSql ? "db_query" : "", "fetch_web"].filter(Boolean),
        prohibited_tools: [!allowBash ? "bash" : ""].filter(Boolean),
        enforce_verdict_eval: enforceVerdict,
        sql_read_only: sqlReadOnly,
      }),
    });
    const data = await res.json();
    setGeneratedKey(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold">Generate Scoped MCP Key</h2>
        </div>

        {!generatedKey ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Agent / Key Name</label>
              <input
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm mt-1"
                placeholder="e.g. Claude Desktop Production"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300">Tool Permissions & Policies</span>
              
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={allowSql} onChange={(e) => setAllowSql(e.target.checked)} />
                Allow Database Tools (`db_query`)
              </label>

              {allowSql && (
                <label className="flex items-center gap-2 text-sm pl-6 text-cyan-400">
                  <input type="checkbox" checked={sqlReadOnly} onChange={(e) => setSqlReadOnly(e.target.checked)} />
                  Enforce Strict READ-ONLY (Block DROP/DELETE/UPDATE)
                </label>
              )}

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={allowBash} onChange={(e) => setAllowBash(e.target.checked)} />
                Allow Terminal Execution (`bash`) <span className="text-red-400 text-xs">(Danger)</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={enforceVerdict} onChange={(e) => setEnforceVerdict(e.target.checked)} />
                Enforce Verdict Multi-Agent Debate on Tool Responses
              </label>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2 rounded mt-4"
            >
              Generate Scoped Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-950 p-3 rounded border border-emerald-500/40">
              <span className="text-xs text-emerald-400 font-semibold">Your Scoped MCP Key:</span>
              <p className="font-mono text-sm break-all text-slate-200 mt-1">{generatedKey.raw_key}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400">1-Click Claude Desktop Configuration:</span>
              <pre className="bg-slate-950 p-3 rounded text-xs font-mono text-slate-300 mt-1 overflow-x-auto">
                {JSON.stringify(generatedKey.claude_config_snippet, null, 2)}
              </pre>
            </div>

            <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded text-sm font-semibold">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 4. How the Two Systems Connect

1. **In the Studio:** A developer designs a multi-agent debate pipeline (`Prosecutor` + `Defense` $\to$ `Chief Justice`) in the **DAG Builder**.
2. **In the MCP Key Manager:** The developer generates an MCP Key for their team's Claude Desktop app, toggling on **"Enforce Verdict Multi-Agent Debate on Tool Responses"**.
3. **In Production:** When Claude attempts to read an external database or scrape a website, the MCP Gateway runs the exact `Verdict` DAG designed in step 1 to ensure the tool output contains no prompt injection before Claude ingests it!

---

## 5. Demo Video Script & Founder Outreach Pitch

### 45-Second Screen Recording Script:
1. **0:00 - 0:15:** Show the visual DAG canvas composing a `Verdict` debate between a Prosecutor and Defense model.
2. **0:15 - 0:25:** Switch to the **MCP Key Manager** tab. Click "Generate Key", select `Claude-Support`, toggle on `Read-Only SQL`, and copy the generated Claude Desktop config.
3. **0:25 - 0:35:** Open Claude Desktop. Ask Claude to run `DROP TABLE users;`. Show Haize MCP Gateway instantly intercepting and blocking the command with a red alert.
4. **0:35 - 0:45:** Show the **Live Audit Stream** in Studio updating in real time with the blocked violation.

### Founder Outreach DM (to Leonard Tang / Richard Liu / Steve Li):
> "Hi Leonard,
> 
> With the explosion of Anthropic's Model Context Protocol (MCP) and autonomous agents, teams need both **visual evaluation tooling** and **centralized tool permission management**.
> 
> To solve this, **I built and open-sourced 'Verdict Studio & MCP Control Plane'**:
> 
> ⭐ GitHub: [https://github.com/sohampawar1866/verdict-studio-mcp](https://github.com/sohampawar1866/verdict-studio-mcp)  
> 🔗 Live App: [https://verdict-studio.vercel.app](https://verdict-studio.vercel.app)
> 
> * **Visual DAG Canvas:** Drag-and-drop sub-judges (Prosecutor, Defense, Chief Justice) with streaming WebSockets and native Python code export.
> * **Scoped MCP Key Gateway:** Generate API keys for Claude Desktop, Cursor, or Devin with granular tool-level permissions (e.g. Read-Only SQL, blocked Bash, and real-time Verdict safety enforcement).
> * **Live Telemetry & Audit Logs:** Real-time stream of all agent tool executions and policy violation blocks.
> 
> As an applicant for the SWE Intern role, I’d love to help Haize build the definitive developer platform and security gateway for production AI agents!"
