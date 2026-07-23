from pydantic import BaseModel
from typing import Optional

class Attraction(BaseModel):
    name: str
    category: str
    crowd_level: str
    entry_fee_inr: float
    recommended_duration_hours: float
    best_time: str
    neighborhood: str
    description: str
    source_url: Optional[str] = None

class FoodSpot(BaseModel):
    name: str
    cuisine: str
    price_range: str
    budget_tier: str
    neighborhood: str
    description: str
    address: Optional[str] = None

class Neighborhood(BaseModel):
    name: str
    aka: list[str]
    vibe: str
    crowd_level: str
    budget_tier: str
    highlights: list[str]
    avg_hotel_inr_per_night: Optional[float] = None

class DestinationReport(BaseModel):
    recommended_neighborhoods: list[Neighborhood]
    must_do_attractions: list[Attraction]
    nice_to_have_attractions: list[Attraction]
    food_spots: list[FoodSpot]
    tips: list[str]
