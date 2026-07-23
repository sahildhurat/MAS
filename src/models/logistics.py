from pydantic import BaseModel
from typing import Optional

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
    estimated_cost_inr: float
    notes: str

class LogisticsPlan(BaseModel):
    recommended_accommodation: AccommodationOption
    alternative_accommodation: list[AccommodationOption]
    transport_recommendations: str
    route_optimization_notes: str
