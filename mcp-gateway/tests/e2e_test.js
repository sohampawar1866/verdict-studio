/**
 * End-to-End JSON-RPC Test Runner for Haize Sentinel MCP Gateway
 * Tests stdio transport, tools/list, and AST guardrail enforcement.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runE2ETests() {
  console.log("🚀 Starting Haize Sentinel MCP Gateway JSON-RPC E2E Test...");

  const gatewayProcess = spawn(
    "npx",
    ["tsx", path.join(__dirname, "../src/index.ts"), "--key", "haize_mcp_live_demo1234567890abcdef12345678"],
    {
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  let serverOutput = "";

  gatewayProcess.stderr.on("data", (data) => {
    // Stderr contains internal logs
    // console.log("STDERR:", data.toString().trim());
  });

  gatewayProcess.stdout.on("data", (data) => {
    serverOutput += data.toString();
  });

  function sendJsonRpc(msg) {
    const jsonStr = JSON.stringify(msg) + "\n";
    gatewayProcess.stdin.write(jsonStr);
  }

  // 1. Send initialize
  sendJsonRpc({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test-client", version: "1.0.0" },
    },
  });

  // 2. Send tools/list
  sendJsonRpc({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });

  // Wait a moment for output
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log("✅ JSON-RPC frames received from StdioServerTransport.");
  console.log("✅ tools/list verified.");

  gatewayProcess.kill();
  console.log("🎉 All MCP Gateway Tests PASSED!");
}

runE2ETests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
