import asyncio
import os
from src.graph.builder import build_planner_graph
from src.config import settings

async def main():
    print("Testing LangGraph Pipeline...")
    if not settings.groq_api_key and not settings.google_api_key:
        print("ERROR: No API keys configured in .env")
        return

    graph = build_planner_graph()
    
    # We will test with a non-Dubai destination to prove the multi-dest refactor works
    query = "Plan a 3-day trip to Tokyo for a couple focusing on food and culture, budget $4000"
    
    print(f"\nSubmitting Query: '{query}'\n")
    print("-" * 50)
    
    try:
        # Run the graph and stream the outputs
        async for output in graph.astream({"raw_query": query}, stream_mode="updates"):
            for node_name, state in output.items():
                print(f"[OK] Node Completed: [{node_name}]")
                if "travel_request" in state and node_name == "parse_request":
                    req = state["travel_request"]
                    print(f"   -> Extracted Destination: {req.destination}")
                    print(f"   -> Days: {req.duration_days}, Budget: ${req.budget_usd}")
                    
                if "review_result" in state and node_name == "review_itinerary":
                    res = state["review_result"]
                    print(f"   -> Passed: {res.passed}")
                    print(f"   -> Feedback: {res.feedback}")
                    
        print("-" * 50)
        print("Pipeline Execution Completed Successfully.")
        
    except Exception as e:
        print(f"\n[X] Pipeline failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
