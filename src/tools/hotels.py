import json
from pathlib import Path
from langchain_core.tools import tool

DATA_DIR = Path(__file__).parent.parent / "data"

@tool
def search_hotels(budget_tier: str, neighborhood: str = None) -> list[dict]:
    """Search for hotels based on budget tier and optional neighborhood.
    
    Args:
        budget_tier: The budget tier ('budget', 'mid-range', 'luxury').
        neighborhood: (Optional) The specific neighborhood to search in.
        
    Returns:
        A list of hotels matching the criteria.
    """
    # In production, use a real hotel API. For now, check local data for backward
    # compatibility, but the LLM agents handle hotel recommendations directly.
    hotels_file = DATA_DIR / "dubai_hotels.json"
    
    if not hotels_file.exists():
        return []
        
    try:
        with open(hotels_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        hotels = data if isinstance(data, list) else data.get("hotels", [])
        results = []
        
        for hotel in hotels:
            # Match budget tier if provided
            if budget_tier and hotel.get("budget_tier", "").lower() != budget_tier.lower():
                continue
                
            # Match neighborhood if provided
            if neighborhood and neighborhood.lower() not in hotel.get("neighborhood", "").lower():
                continue
                
            results.append(hotel)
            
        return results
    except Exception as e:
        return [{"error": str(e)}]
