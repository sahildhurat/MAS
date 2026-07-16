from langchain_core.tools import tool
import random

@tool
def get_directions(origin: str, destination: str, mode: str = "transit") -> dict:
    """Get estimated travel time and distance between two locations.
    
    Args:
        origin: The starting location name.
        destination: The destination location name.
        mode: The mode of transport (e.g., 'transit', 'driving', 'walking').
        
    Returns:
        A dictionary containing travel_time_mins, distance_km, and steps.
    """
    # Mock heuristic - in production, use a real Maps API
    
    if origin.lower() == destination.lower():
        return {"travel_time_mins": 0, "distance_km": 0.0, "steps": ["You are already there."]}
        
    if mode == "walking":
        base_time = random.randint(30, 60)
        base_dist = random.uniform(1.0, 5.0)
    elif mode == "transit":
        base_time = random.randint(20, 45)
        base_dist = random.uniform(10.0, 25.0)
    else: # driving
        base_time = random.randint(15, 40)
        base_dist = random.uniform(10.0, 30.0)
        
    return {
        "travel_time_mins": base_time,
        "distance_km": round(base_dist, 1),
        "steps": [
            f"Depart from {origin}",
            f"Travel via {mode}",
            f"Arrive at {destination}"
        ]
    }

@tool
def get_place_details(place_name: str) -> dict:
    """Get details for a specific place, like rating and address.
    
    Args:
        place_name: The name of the place.
        
    Returns:
        A dictionary containing address, rating, and opening_hours.
    """
    # Mock fallback - in production, use a real Places API
    return {
        "address": place_name,
        "rating": round(random.uniform(3.5, 4.9), 1),
        "opening_hours": "10:00 AM - 10:00 PM"
    }
