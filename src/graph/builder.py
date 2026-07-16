from langgraph.graph import StateGraph, START, END
from src.graph.state import PlannerState
from src.graph.nodes import (
    parse_request_node,
    destination_node,
    logistics_node,
    budget_node,
    assemble_itinerary_node,
    review_node,
    review_router
)

def build_planner_graph() -> StateGraph:
    graph = StateGraph(PlannerState)

    # Nodes
    graph.add_node("parse_request", parse_request_node)
    graph.add_node("destination_research", destination_node)
    graph.add_node("logistics", logistics_node)
    graph.add_node("budget", budget_node)
    graph.add_node("assemble_itinerary", assemble_itinerary_node)
    graph.add_node("review", review_node)

    # Edges
    graph.add_edge(START, "parse_request")
    
    # Fan-out
    graph.add_edge("parse_request", "destination_research")
    graph.add_edge("parse_request", "logistics")
    graph.add_edge("parse_request", "budget")

    # Fan-in
    graph.add_edge("destination_research", "assemble_itinerary")
    graph.add_edge("logistics", "assemble_itinerary")
    graph.add_edge("budget", "assemble_itinerary")
    
    graph.add_edge("assemble_itinerary", "review")
    
    # Conditional Edges from review
    graph.add_conditional_edges(
        "review",
        review_router,
        {
            "voice": END,
            "retry": "destination_research",
            "fail": END
        }
    )

    return graph.compile()
