import pytest
import asyncio
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

from src.graph.builder import build_planner_graph
from src.graph.state import PlannerState

@pytest.mark.asyncio
async def test_full_pipeline_success():
    graph = build_planner_graph()
    
    # Simulate a request query
    queries = [
        "Plan a 3 day trip to Dubai for 2 people with a budget of 3000 USD. We love food and modern architecture, but hate crowds.",
        "I need a 5-day luxury trip to Dubai for my family of 4, focusing on shopping and beaches. Budget $10,000.",
        "A quick 2-day layover in Dubai for a solo traveler on a tight budget. Just want to see the Burj Khalifa and eat some cheap local food."
    ]
    
    for query in queries:
        state: PlannerState = {
            "raw_query": query,
            "retry_count": 0
        }
        
        # Execute graph
        final_state = await graph.ainvoke(state)
        
        # Assertions
        assert "error" not in final_state or not final_state["error"]
        assert "travel_request" in final_state
        assert final_state["travel_request"] is not None
        
        print("FINAL STATE KEYS:", final_state.keys())
        if "error" in final_state: print("ERROR:", final_state["error"])
        
        assert "draft_itinerary" in final_state
        itinerary = final_state["draft_itinerary"]
        assert itinerary is not None
        assert hasattr(itinerary, "title")
        
        # Phase 3 asserts
        assert "review_result" in final_state
        review_result = final_state["review_result"]
        assert review_result is not None
        assert hasattr(review_result, "approved")
        assert hasattr(review_result, "confidence_score")
        assert isinstance(review_result.confidence_score, float)
        assert hasattr(review_result, "checks")
        assert len(itinerary.days) == final_state["travel_request"].duration_days
        assert hasattr(itinerary, "total_cost_usd")
        
        # Ensure budget was somewhat coherent (not throwing errors)
        assert hasattr(itinerary, "accommodation")
