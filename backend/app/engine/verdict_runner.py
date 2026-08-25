import time
import uuid
import asyncio
import logging
from typing import Dict, Any, Optional, Callable, List
from collections import defaultdict, deque

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


async def compile_and_run_dag(
    dag: DAGGraph,
    inputs: Dict[str, Any],
    broadcast_callback: Optional[Callable[[Dict[str, Any]], Any]] = None,
) -> DAGExecutionResponse:
    """
    Executes a visual Verdict DAG pipeline with real-time WebSocket token streaming.
    """
    execution_id = f"exec-{uuid.uuid4().hex[:8]}"
    start_time = time.time()
    outputs: Dict[str, Any] = {}
    leaf_nodes: List[str] = []

    logger.info(f"Starting DAG Execution [{execution_id}] for '{dag.name}'")

    if broadcast_callback:
        await broadcast_callback({
            "type": "DEBATE_STARTED",
            "execution_id": execution_id,
            "dag_id": dag.id,
            "dag_name": dag.name,
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
                    "model": node.data.get("model", "gpt-4o"),
                    "timestamp": time.time(),
                })

            # Retrieve text to stream
            node_dialogue = (
                DEBATE_DIALOGUES.get(node_type, {}).get(category_key)
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
                "model": node.data.get("model", "gpt-4o"),
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
