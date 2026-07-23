from pydantic import BaseModel
from typing import Optional

class Activity(BaseModel):
    time: str
    title: str
    description: str
    location: str
    category: str
    estimated_cost_usd: float
    duration_minutes: int
    crowd_level: str
    tips: list[str]

class DayPlan(BaseModel):
    day_number: int
    date: Optional[str] = None
    theme: str
    activities: list[Activity]
    meals: list[Activity]
    transport_notes: str
    daily_cost_usd: float

class AccommodationPlan(BaseModel):
    name: str
    neighborhood: str
    total_cost_usd: float
    notes: str

class Itinerary(BaseModel):
    title: str
    summary: str
    days: list[DayPlan]
    total_cost_usd: float
    budget_remaining_usd: float
    accommodation: AccommodationPlan
    general_tips: list[str]
