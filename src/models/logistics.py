from pydantic import BaseModel, Field
from typing import Optional, List

class AccommodationOption(BaseModel):
    name: str
    neighborhood: str
    stars: Optional[int] = None
    price_range: str
    budget_tier: str
    description: str
    address: Optional[str] = None
    phone: Optional[str] = None

class TransportSegment(BaseModel):
    mode: str
    estimated_time_minutes: int
    estimated_cost_aed: float
    notes: str

class LogisticsPlan(BaseModel):
    recommended_accommodation: list[AccommodationOption] = Field(default_factory=list)
    alternative_accommodation: list[AccommodationOption] = Field(default_factory=list)
    transport_recommendations: str = Field(default="")
    route_optimization_notes: str = Field(default="")
