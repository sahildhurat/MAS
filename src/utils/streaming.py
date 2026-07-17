import json
from typing import AsyncGenerator
from src.utils.logger import logger

async def stream_plan(graph, query: str, request_obj=None) -> AsyncGenerator[dict, None]:
    """
    Stream the execution of the planner graph.
    Yields dicts that EventSourceResponse will serialize as SSE data.
    """
    state = {
        "raw_query": query,
        "retry_count": 0
    }
    
    accumulated_state = {}
    
    try:
        # Yield the starting event
        yield {"event": "agent_started", "agent": "orchestrator"}
        
        async for event in graph.astream(state, stream_mode="updates"):
            if request_obj and await request_obj.is_disconnected():
                logger.info("Client disconnected during stream.")
                break
                
            for node_name, node_state in event.items():
                logger.info(f"Stream progress: {node_name} completed.")
                accumulated_state.update(node_state)
                
                if "error" in node_state and node_state["error"]:
                    yield {"event": "error", "error": node_state["error"]}
                    return
                
                # We can broadcast the completed agent
                yield {"event": "agent_completed", "agent": node_name}
                
        # Send final complete event
        itinerary = accumulated_state.get("draft_itinerary")
        if itinerary:
            yield {
                "event": "complete",
                "data": {
                    "travel_request": accumulated_state.get("travel_request").model_dump() if accumulated_state.get("travel_request") else None,
                    "itinerary": accumulated_state.get("draft_itinerary").model_dump() if accumulated_state.get("draft_itinerary") else None,
                    "budget": accumulated_state.get("budget_breakdown").model_dump() if accumulated_state.get("budget_breakdown") else None,
                    "review_result": accumulated_state.get("review_result").model_dump() if accumulated_state.get("review_result") else None
                }
            }
        else:
            yield {"event": "error", "error": "Failed to generate itinerary"}
            
    except Exception as e:
        logger.error("Error during streaming", exc_info=True)
        yield {"event": "error", "error": str(e)}
