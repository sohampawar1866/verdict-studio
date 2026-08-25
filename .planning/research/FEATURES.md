# Features Research — Verdict Studio & MCP Control Plane

## Visual DAG Builder Features (Table Stakes vs. Differentiating)

### Table Stakes
| Feature | Description | Found In |
|---------|-------------|----------|
| Drag-and-drop node placement | Users can drag nodes from a palette onto the canvas | Every DAG builder (Airflow UI, n8n, Langflow) |
| Edge connections with validation | Connect outputs to inputs with type checking | Standard in flow editors |
| Node configuration panel | Click a node to configure its properties | Universal |
| Canvas zoom/pan | Navigate large DAGs | Built into @xyflow/react |
| Undo/Redo | Ctrl+Z support for canvas operations | Expected UX |
| Save/Load DAG state | Persist DAG to backend | Standard |

### Differentiating (Our Unique Value)
| Feature | Description | Why It Matters |
|---------|-------------|----------------|
| **Multi-agent debate role nodes** | Specialized node types for Prosecutor, Defense, FactChecker, ChiefJustice | Unique to verdict — no existing UI does this |
| **Live debate streaming** | Token-by-token WebSocket stream showing sub-models arguing in real-time | No existing tool shows adversarial debate live |
| **1-Click Python Code Export** | Generates native `verdict` Pipeline code from visual DAG | Bridges visual → code workflow |
| **Verdict safety enforcement on MCP tool calls** | Triggers multi-agent debate before tool data reaches the agent | Novel security pattern |

## MCP Key & Permission Gateway Features

### Table Stakes
| Feature | Description | Found In |
|---------|-------------|----------|
| API key generation | Create keys with names | Every API gateway (Kong, Apigee) |
| Key revocation | Disable compromised keys | Standard |
| Rate limiting | Requests-per-minute caps | Standard API management |
| Audit logging | Record all API calls | Compliance requirement |

### Differentiating
| Feature | Description | Why It Matters |
|---------|-------------|----------------|
| **Tool-level permission scoping** | Per-key allow/deny on individual MCP tools (not just endpoints) | MCP-native — not available in traditional API gateways |
| **SQL read-only enforcement** | Parse SQL queries and block destructive operations | Agent-specific safety concern |
| **Domain whitelisting for fetch** | Restrict web scraping to approved domains | Prevents SSRF and data exfiltration |
| **Verdict debate on tool returns** | Run safety evaluation before agent ingests tool output | Novel — combines eval + gateway |
| **1-Click Claude Desktop config** | Generate `claude_desktop_config.json` snippet | Developer experience unique to MCP ecosystem |
| **Real-time audit stream** | WebSocket-based live tool execution feed | Enterprise observability |

---
*Researched: 2026-08-25 | Confidence: HIGH*
