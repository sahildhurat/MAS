from src.graph.state import PlannerState
from src.agents.orchestrator import OrchestratorAgent
from src.agents.destination import DestinationResearchAgent
from src.agents.logistics import LogisticsAgent
from src.agents.budget import BudgetAgent
from src.agents.review import ReviewAgent
from src.utils.decorators import with_timeout
from src.utils.logger import logger
from langgraph.graph import END

orchestrator_agent = OrchestratorAgent()
destination_agent = DestinationResearchAgent()
logistics_agent = LogisticsAgent()
budget_agent = BudgetAgent()
review_agent = ReviewAgent()

@with_timeout(30)
async def parse_request_node(state: PlannerState) -> dict:
    raw_query = state.get("raw_query", "")
    logger.info("Agent started", agent_name="parse_request", input_summary=raw_query[:50])
    try:
        travel_request = await orchestrator_agent.parse_request(raw_query)
        logger.info("Agent completed", agent_name="parse_request", destination=travel_request.destination)
        return {"travel_request": travel_request, "retry_count": 0}
    except Exception as e:
        logger.warning("Error / fallback", error_type=type(e).__name__, fallback_used="None")
        return {"error": f"Failed to parse request: {str(e)}"}

@with_timeout(30)
async def destination_node(state: PlannerState) -> dict:
    req = state.get("travel_request")
    if not req:
        return {}
    logger.info("Agent started", agent_name="destination_research")
    try:
        report = await destination_agent.research(req)
        logger.info("Agent completed", agent_name="destination_research")
        return {"destination_report": report}
    except Exception as e:
        logger.warning("Error / fallback", error_type=type(e).__name__, fallback_used="None")
        return {"error": f"Destination agent failed: {str(e)}"}

@with_timeout(30)
async def logistics_node(state: PlannerState) -> dict:
    req = state.get("travel_request")
    dest = state.get("destination_report")
    if not req:
        return {}
    logger.info("Agent started", agent_name="logistics")
    try:
        plan = await logistics_agent.plan(req, dest)
        logger.info("Agent completed", agent_name="logistics")
        return {"logistics_plan": plan}
    except Exception as e:
        logger.warning("Error / fallback", error_type=type(e).__name__, fallback_used="None")
        return {"error": f"Logistics agent failed: {str(e)}"}

@with_timeout(30)
async def budget_node(state: PlannerState) -> dict:
    req = state.get("travel_request")
    if not req:
        return {}
    logger.info("Agent started", agent_name="budget")
    try:
        budget = await budget_agent.analyze(req)
        logger.info("Agent completed", agent_name="budget")
        return {"budget_breakdown": budget}
    except Exception as e:
        logger.warning("Error / fallback", error_type=type(e).__name__, fallback_used="None")
        return {"error": f"Budget agent failed: {str(e)}"}

@with_timeout(30)
async def assemble_itinerary_node(state: PlannerState) -> dict:
    req = state.get("travel_request")
    dest = state.get("destination_report")
    log = state.get("logistics_plan")
    bud = state.get("budget_breakdown")
    
    # Check if there are revision notes from a previous review
    review_result = state.get("review_result")
    revision_notes = review_result.revision_notes if review_result and not review_result.approved else []
    
    if not req:
        return {}
        
    logger.info("Agent started", agent_name="assemble_itinerary")
    try:
        dest_json = dest.model_dump_json() if dest else ""
        log_json = log.model_dump_json() if log else ""
        bud_json = bud.model_dump_json() if bud else ""
        
        itinerary = await orchestrator_agent.assemble_itinerary(
            request=req.model_dump_json(),
            destination_report=dest_json,
            logistics_plan=log_json,
            budget_breakdown=bud_json,
            revision_notes=revision_notes
        )
        logger.info("Agent completed", agent_name="assemble_itinerary")
        return {"draft_itinerary": itinerary}
    except Exception as e:
        logger.warning("Error / fallback", error_type=type(e).__name__, fallback_used="None")
        return {"error": f"Assembly failed: {str(e)}"}

@with_timeout(60)
async def review_node(state: PlannerState) -> dict:
    itinerary = state.get("draft_itinerary")
    req = state.get("travel_request")
    budget = state.get("budget_breakdown")
    
    if not itinerary or not req or not budget:
        return {}
        
    logger.info("Agent started", agent_name="review")
    try:
        result = await review_agent.review(itinerary, req, budget)
        logger.info("Review result", approved=result.approved, confidence_score=result.confidence_score, retry_count=state.get("retry_count", 0))
        
        # Increment retry_count if not approved
        new_retry_count = state.get("retry_count", 0)
        if not result.approved:
            new_retry_count += 1
            
        return {"review_result": result, "retry_count": new_retry_count}
    except Exception as e:
        logger.warning("Error / fallback", error_type=type(e).__name__, fallback_used="None")
        return {"error": f"Review failed: {str(e)}"}

def review_router(state: PlannerState) -> str:
    """Route based on review result and retry count."""
    review_result = state.get("review_result")
    
    # If error occurred somewhere, end
    if state.get("error"):
        return "fail"
        
    if not review_result:
        return "fail"
        
    if review_result.approved:
        return "voice" # Phase 4, acts as END for now in builder
        
    retry_count = state.get("retry_count", 0)
    if retry_count < 2:
        return "retry"
        
    return "fail"
