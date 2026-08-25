import time
import uuid
import asyncio
import logging
from typing import Dict, Any, Optional, Callable, List
from collections import defaultdict, deque
import httpx

from app.models.dag import DAGGraph, DAGNode, DAGExecutionResponse
from app.engine.live_streamer import DEBATE_DIALOGUES, simulate_token_stream

logger = logging.getLogger("verdict_runner")


def topological_sort_nodes(dag: DAGGraph) -> List[List[DAGNode]]:
    """
    Groups DAG nodes into execution layers based on topological dependencies.
    Handles cyclic or disconnected nodes gracefully by placing remaining nodes in a fallback layer.
    """
    adj = defaultdict(list)
    in_degree = defaultdict(int)
    node_map = {n.id: n for n in dag.nodes}
    visited_node_ids = set()

    for node in dag.nodes:
        in_degree[node.id] = 0

    for edge in dag.edges:
        if edge.source in node_map and edge.target in node_map:
            adj[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    # Queue of nodes with zero in-degree (roots)
    queue = deque([node_id for node_id, deg in in_degree.items() if deg == 0])
    layers: List[List[DAGNode]] = []

    while queue:
        current_layer_ids = list(queue)
        queue.clear()
        current_layer_nodes = [node_map[nid] for nid in current_layer_ids if nid in node_map]
        if current_layer_nodes:
            layers.append(current_layer_nodes)
            for nid in current_layer_ids:
                visited_node_ids.add(nid)

        for nid in current_layer_ids:
            for neighbor in adj[nid]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

    # Fallback: append any unvisited/cyclic nodes in a trailing layer
    unvisited_nodes = [n for n in dag.nodes if n.id not in visited_node_ids]
    if unvisited_nodes:
        logger.warning(f"Detected {len(unvisited_nodes)} unvisited or cyclic nodes. Appending to fallback layer.")
        layers.append(unvisited_nodes)

    return layers


async def try_live_llm_inference(
    model: str,
    prompt: str,
    system_role: str,
    api_keys: Optional[Dict[str, Any]] = None,
    temperature: float = 0.7,
) -> Optional[str]:
    """
    Attempts live model inference using client-provided BYOK keys or custom endpoints.
    Falls back gracefully to None if keys are absent or API call fails.
    """
    if not api_keys:
        return None

    openai_key = api_keys.get("openaiApiKey") or api_keys.get("custom_api_key")
    anthropic_key = api_keys.get("anthropicApiKey")
    custom_base_url = api_keys.get("customBaseUrl")

    try:
        # OpenAI or Custom Compatible Endpoint (e.g. OpenRouter, Groq, Ollama)
        if openai_key or custom_base_url:
            base_url = custom_base_url.rstrip("/") if custom_base_url else "https://api.openai.com/v1"
            if not base_url.endswith("/v1") and "openai.com" in base_url:
                base_url = f"{base_url}/v1"

            endpoint = f"{base_url}/chat/completions"
            headers = {
                "Content-Type": "application/json",
            }
            if openai_key:
                headers["Authorization"] = f"Bearer {openai_key}"

            payload = {
                "model": model or "gpt-4o",
                "messages": [
                    {"role": "system", "content": f"You are an AI Safety unit ({system_role}) evaluating security invariants."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": temperature,
                "max_tokens": 500,
            }

            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(endpoint, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    logger.info(f"Live OpenAI/Compatible completion received for model '{model}'")
                    return content

        # Anthropic Endpoint
        elif anthropic_key:
            endpoint = "https://api.anthropic.com/v1/messages"
            headers = {
                "x-api-key": anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
            payload = {
                "model": model if "claude" in model else "claude-3-5-sonnet-20241022",
                "max_tokens": 500,
                "temperature": temperature,
                "system": f"You are an AI Safety unit ({system_role}) evaluating security invariants.",
                "messages": [
                    {"role": "user", "content": prompt},
                ],
            }

            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(endpoint, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    content = data["content"][0]["text"]
                    logger.info(f"Live Anthropic completion received for model '{model}'")
                    return content

    except Exception as e:
        logger.warning(f"Live LLM inference encountered error ({e}); falling back to interactive demo dialogue.")

    return None


async def compile_and_run_dag(
    dag: DAGGraph,
    inputs: Dict[str, Any],
    api_keys: Optional[Dict[str, Any]] = None,
    broadcast_callback: Optional[Callable[[Dict[str, Any]], Any]] = None,
) -> DAGExecutionResponse:
    """
    Executes a visual Verdict DAG pipeline with real-time WebSocket token streaming.
    Supports optional BYOK (Bring Your Own Key) live inference with instant demo simulation fallback.
    """
    execution_id = f"exec-{uuid.uuid4().hex[:8]}"
    start_time = time.time()
    outputs: Dict[str, Any] = {}
    leaf_nodes: List[str] = []

    has_byok = bool(api_keys and any(api_keys.values()))
    logger.info(f"Starting DAG Execution [{execution_id}] for '{dag.name}' (BYOK Mode: {has_byok})")

    if broadcast_callback:
        await broadcast_callback({
            "type": "DEBATE_STARTED",
            "execution_id": execution_id,
            "dag_id": dag.id,
            "dag_name": dag.name,
            "has_byok": has_byok,
            "timestamp": start_time,
        })

    layers = topological_sort_nodes(dag)
    category_key = (
        "adversarial_safety"
        if "adversarial" in dag.name.lower() or "safety" in dag.name.lower() or "injection" in dag.name.lower()
        else "geval_coherence"
        if "geval" in dag.name.lower()
        else "ensemble_verify"
    )

    for layer_idx, layer_nodes in enumerate(layers):
        logger.info(f"Executing Layer {layer_idx + 1}/{len(layers)}: {[n.data.get('name', n.type) for n in layer_nodes]}")

        for node in layer_nodes:
            node_type = node.type
            unit_name = node.data.get("name") or f"{node_type.capitalize()}Unit"
            role = node.data.get("role") or node_type
            model = node.data.get("model", "gpt-4o")
            prompt_tpl = node.data.get("prompt") or ""
            temperature = float(node.data.get("temperature", 0.7))

            # Skip input nodes for token streaming (they provide source data)
            if node_type == "input":
                outputs[node.id] = inputs or node.data.get("fields", {})
                continue

            # Notify UI: Node is now actively executing (lights up on canvas)
            if broadcast_callback:
                await broadcast_callback({
                    "type": "NODE_ACTIVATED",
                    "execution_id": execution_id,
                    "node_id": node.id,
                    "unit_name": unit_name,
                    "role": role,
                    "model": model,
                    "timestamp": time.time(),
                })

            # Check if live LLM completion is possible with BYOK
            live_text = None
            if has_byok and prompt_tpl:
                # Format prompt with source inputs
                formatted_prompt = prompt_tpl
                for k, v in inputs.items():
                    formatted_prompt = formatted_prompt.replace(f"{{source.{k}}}", str(v))
                live_text = await try_live_llm_inference(
                    model=model,
                    prompt=formatted_prompt,
                    system_role=unit_name,
                    api_keys=api_keys,
                    temperature=temperature,
                )

            # Retrieve text to stream (live completion or simulation fallback)
            node_dialogue = (
                live_text
                or DEBATE_DIALOGUES.get(node_type, {}).get(category_key)
                or f"Evaluated input with {unit_name}. Response generated with score validation."
            )

            accumulated_tokens = ""
            async for token_chunk in simulate_token_stream(node_dialogue, chunk_size=3, delay_s=0.035):
                accumulated_tokens += token_chunk
                if broadcast_callback:
                    await broadcast_callback({
                        "type": "TOKEN_CHUNK",
                        "execution_id": execution_id,
                        "node_id": node.id,
                        "unit_name": unit_name,
                        "role": role,
                        "token": token_chunk,
                        "accumulated": accumulated_tokens,
                        "timestamp": time.time(),
                    })

            # Determine node output & final verdict
            is_final_judge = node_type in ["chiefjustice", "aggregator"] or layer_idx == len(layers) - 1
            verdict_val = (
                "BLOCKED"
                if "BLOCKED" in accumulated_tokens
                else "PASSED"
                if "PASSED" in accumulated_tokens or "4.5" in accumulated_tokens
                else "COMPLETED"
            )

            outputs[node.id] = {
                "unit_name": unit_name,
                "role": role,
                "model": model,
                "output_text": accumulated_tokens.strip(),
                "verdict": verdict_val,
            }

            if is_final_judge:
                leaf_nodes.append(node.id)

            # Notify UI: Node execution completed
            if broadcast_callback:
                await broadcast_callback({
                    "type": "NODE_COMPLETED",
                    "execution_id": execution_id,
                    "node_id": node.id,
                    "unit_name": unit_name,
                    "role": role,
                    "output_text": accumulated_tokens.strip(),
                    "verdict": verdict_val,
                    "timestamp": time.time(),
                })

    total_time_ms = (time.time() - start_time) * 1000

    if broadcast_callback:
        final_verdict = outputs[leaf_nodes[-1]]["verdict"] if leaf_nodes else "PASSED"
        await broadcast_callback({
            "type": "DEBATE_COMPLETED",
            "execution_id": execution_id,
            "final_verdict": final_verdict,
            "total_time_ms": total_time_ms,
            "timestamp": time.time(),
        })

    logger.info(f"DAG Execution [{execution_id}] completed in {total_time_ms:.1f}ms")

    return DAGExecutionResponse(
        execution_id=execution_id,
        status="COMPLETED",
        outputs=outputs,
        leaf_nodes=leaf_nodes,
        execution_time_ms=total_time_ms,
    )
