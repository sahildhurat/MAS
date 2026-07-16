from typing import TypedDict, Optional, Annotated
from langgraph.graph.message import add_messages
from src.models.request import TravelRequest
from src.models.itinerary import Itinerary
from src.models.budget import BudgetBreakdown
from src.models.destination import DestinationReport
from src.models.logistics import LogisticsPlan
from src.models.review import ReviewResult

def add_errors(left: Optional[str], right: Optional[str]) -> Optional[str]:
    return right if right else left

class PlannerState(TypedDict):
    raw_query: str
    travel_request: Optional[TravelRequest]
    
    # Worker outputs
    destination_report: Optional[DestinationReport]
    logistics_plan: Optional[LogisticsPlan]
    budget_breakdown: Optional[BudgetBreakdown]
    
    # Assembled output
    draft_itinerary: Optional[Itinerary]
    
    # Review
    review_result: Optional[ReviewResult]
    retry_count: int
    
    # Final
    approved_itinerary: Optional[Itinerary]
    voice_output: Optional[str]
    
    # Error state
    error: Annotated[Optional[str], add_errors]
