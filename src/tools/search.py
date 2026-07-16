import httpx
import logging
from langchain_core.tools import tool
from src.config import settings

logger = logging.getLogger(__name__)

@tool
async def search_web(query: str) -> list[dict]:
    """Search the web for real-time information about travel destinations, attractions,
    restaurants, hotels, and activities anywhere in the world.
    
    Args:
        query: The search query string (e.g. "best restaurants in Tokyo", "top attractions Paris").
        
    Returns:
        A list of search results with title, snippet, and url.
    """
    if not settings.serper_api_key:
        logger.warning("SERPER_API_KEY not set — returning empty results. Set it in .env for live search.")
        return [{"title": "Search unavailable", "snippet": "No search API key configured. The AI agents will use their built-in knowledge instead.", "url": ""}]

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://google.serper.dev/search",
                headers={
                    "X-API-KEY": settings.serper_api_key,
                    "Content-Type": "application/json"
                },
                json={"q": query, "num": 10},
                timeout=15.0
            )
            response.raise_for_status()
            data = response.json()

        results = []

        # Extract organic search results
        for item in data.get("organic", []):
            results.append({
                "title": item.get("title", ""),
                "snippet": item.get("snippet", ""),
                "url": item.get("link", "")
            })

        # Also include the knowledge graph if available (great for travel queries)
        kg = data.get("knowledgeGraph")
        if kg:
            results.insert(0, {
                "title": kg.get("title", ""),
                "snippet": kg.get("description", ""),
                "url": kg.get("website", ""),
                "attributes": kg.get("attributes", {})
            })

        logger.info(f"Serper search returned {len(results)} results for: {query}")
        return results

    except httpx.HTTPStatusError as e:
        logger.error(f"Serper API error: {e.response.status_code} - {e.response.text}")
        return [{"title": "Search Error", "snippet": f"Search API returned status {e.response.status_code}", "url": ""}]
    except Exception as e:
        logger.error(f"Search failed: {e}")
        return [{"title": "Search Error", "snippet": str(e), "url": ""}]
