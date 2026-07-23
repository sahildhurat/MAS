from pydantic import BaseModel, Field
from typing import Optional

class TravelRequest(BaseModel):
    destination: str = Field(..., description="Target city (e.g. Paris, Tokyo, Mumbai)")
    duration_days: int = Field(..., ge=1, le=30, description="Trip length in days")
    budget_inr: float = Field(..., gt=0, description="Total budget in INR (Indian Rupees)")
    preferences: list[str] = Field(default_factory=list, description="E.g. ['food', 'architecture']")
    avoidances: list[str] = Field(default_factory=list, description="E.g. ['crowds']")
    travelers: int = Field(default=1, ge=1)
    start_date: Optional[str] = None
    raw_query: str = Field(..., description="Original natural-language request")
