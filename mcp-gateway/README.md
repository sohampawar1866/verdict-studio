# Haize Sentinel MCP Gateway (TypeScript)

The **Haize Sentinel MCP Gateway** is a Model Context Protocol (MCP) proxy designed for **Claude Desktop, Cursor IDE, and Devin**. It enforces granular tool permissions (AST SQL inspection, Bash quarantine, domain whitelists) and triggers inline Verdict multi-agent debate evaluations on unverified tool returns.

---

## Installation & Build

```bash
cd mcp-gateway
npm install
npm run build
```

---

## Running the Gateway

### Connect with a Scoped MCP Key:
```bash
npx tsx src/index.ts --key haize_mcp_live_YOUR_KEY --backend-url https://verdict-studio-backend.onrender.com
```

Or for local development:
```bash
npx tsx src/index.ts --key haize_mcp_live_YOUR_KEY --backend-url http://localhost:8000
```

---

## Agent Client Configurations

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "haize-sentinel": {
      "command": "npx",
      "args": [
        "-y",
        "@haizelabs/sentinel-mcp",
        "--key",
        "haize_mcp_live_YOUR_KEY",
        "--backend-url",
        "https://verdict-studio-backend.onrender.com"
      ]
    }
  }
}
```

### Cursor IDE (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "haize-sentinel": {
      "command": "node",
      "args": [
        "/path/to/verdict_studio/mcp-gateway/dist/index.js",
        "--key",
        "haize_mcp_live_YOUR_KEY"
      ],
      "env": {
        "HAIZE_BACKEND_URL": "https://verdict-studio-backend.onrender.com"
      }
    }
  }
}
```

---

## Testing

Run the automated stdio JSON-RPC test runner:
```bash
node tests/e2e_test.js
```
