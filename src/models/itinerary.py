from pydantic import BaseModel, Field
from typing import Optional, List

class Activity(BaseModel):
    time: str = Field(default="")
    title: str = Field(default="")
    description: str = Field(default="")
    location: str = Field(default="")
    category: str = Field(default="")
    estimated_cost_usd: float = Field(default=0.0)
    duration_minutes: int = Field(default=0)
    crowd_level: str = Field(default="")
    tips: list[str] = Field(default_factory=list)

class DayPlan(BaseModel):
    day_number: int = Field(default=1)
    date: Optional[str] = None
    theme: str = Field(default="")
    activities: list[Activity] = Field(default_factory=list)
    meals: list[Activity] = Field(default_factory=list)
    transport_notes: str = Field(default="")
    daily_cost_usd: float = Field(default=0.0)

class AccommodationPlan(BaseModel):
    name: str = Field(default="")
    neighborhood: str = Field(default="")
    total_cost_usd: float = Field(default=0.0)
    notes: str = Field(default="")

class Itinerary(BaseModel):
    title: str = Field(default="")
    summary: str = Field(default="")
    days: list[DayPlan] = Field(default_factory=list)
    total_cost_usd: float = Field(default=0.0)
    budget_remaining_usd: float = Field(default=0.0)
    accommodation: Optional[AccommodationPlan] = None
    general_tips: list[str] = Field(default_factory=list)
