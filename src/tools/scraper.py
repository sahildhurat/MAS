import asyncio
import json
import httpx
from bs4 import BeautifulSoup
from pathlib import Path
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = Path("src/data")
WIKIVOYAGE_BASE = "https://en.wikivoyage.org/wiki"


def _normalize_destination(destination: str) -> str:
    """Normalize destination name for use in directory names and URLs.
    
    Wikivoyage uses title-case with underscores for spaces (e.g., 'New_York_City').
    Directory names use lowercase with underscores.
    """
    return destination.strip().replace(" ", "_")


def _get_dest_dir(destination: str) -> Path:
    """Get the data directory for a specific destination."""
    normalized = _normalize_destination(destination).lower()
    return DATA_DIR / normalized


def _get_wiki_url(destination: str) -> str:
    """Build the Wikivoyage URL for a destination."""
    # Wikivoyage uses title case with underscores
    slug = _normalize_destination(destination).title()
    return f"{WIKIVOYAGE_BASE}/{slug}"


def extract_listings(soup, section_ids, source_url, destination):
    """Extract vcard listings from Wikivoyage HTML under the given section headings."""
    listings = []
    current_section = None
    
    for tag in soup.find_all(['h2', 'span', 'bdi']):
        if tag.name == 'h2':
            current_section = tag.get('id')
        elif 'vcard' in tag.get('class', []):
            if current_section in section_ids:
                name_tag = tag.find(class_="listing-name")
                name = name_tag.get_text(strip=True) if name_tag else "Unknown"
                desc_tag = tag.find(class_="listing-content")
                desc = desc_tag.get_text(strip=True) if desc_tag else ""
                address_tag = tag.find(class_="listing-address")
                address = address_tag.get_text(strip=True) if address_tag else ""
                price_tag = tag.find(class_="listing-price")
                price = price_tag.get_text(strip=True) if price_tag else ""
                
                listings.append({
                    "name": name,
                    "description": desc,
                    "address": address,
                    "price_range": price,
                    "source_url": source_url,
                    "_source": f"Wikivoyage {destination}"
                })
    return listings


def _infer_budget_tier(price_range: str) -> str:
    """Infer a budget tier from a price range string."""
    lower = price_range.lower()
    if any(w in lower for w in ["splurge", "luxury", "expensive", "high-end"]):
        return "luxury"
    elif any(w in lower for w in ["budget", "cheap", "free", "low"]):
        return "budget"
    return "mid-range"


async def scrape_wikivoyage(destination: str, refresh: bool = False) -> dict:
    """Scrape Wikivoyage data for any destination and save to per-destination data directory.
    
    Args:
        destination: The city/destination to scrape (e.g., "Paris", "Tokyo", "New York City").
        refresh: If True, re-fetch HTML even if a cache exists.
        
    Returns:
        A dict summarizing what was scraped (counts per category).
    """
    dest_dir = _get_dest_dir(destination)
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    wiki_url = _get_wiki_url(destination)
    cache_file = dest_dir / "wikivoyage_cache.html"
    
    # Fetch or load cached HTML
    html = ""
    if not refresh and cache_file.exists():
        logger.info(f"Using cached HTML for {destination}")
        html = cache_file.read_text(encoding="utf-8")
    else:
        logger.info(f"Fetching {wiki_url}...")
        headers = {"User-Agent": "AITravelPlannerBot/2.0 (contact: test@example.com)"}
        async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
            try:
                resp = await client.get(wiki_url, timeout=30.0)
                resp.raise_for_status()
                html = resp.text
                cache_file.write_text(html, encoding="utf-8")
                logger.info(f"Cached HTML for {destination} ({len(html)} bytes)")
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    logger.error(f"Wikivoyage page not found for '{destination}'. Try a different spelling.")
                    return {"error": f"No Wikivoyage page found for '{destination}'"}
                raise
            except Exception as e:
                logger.error(f"Failed to fetch {wiki_url}: {e}")
                if cache_file.exists():
                    logger.info("Falling back to cached HTML")
                    html = cache_file.read_text(encoding="utf-8")
                else:
                    logger.error("No cache available.")
                    return {"error": f"Failed to fetch data for '{destination}': {e}"}

    soup = BeautifulSoup(html, "html.parser")
    summary = {"destination": destination}

    # 1. Attractions (See, Do)
    attractions = extract_listings(soup, ["See", "Do"], wiki_url, destination)
    for a in attractions:
        a["recommended_duration_hours"] = 2.0
        a["best_time"] = "morning"
    with open(dest_dir / "attractions.json", "w", encoding="utf-8") as f:
        json.dump(attractions, f, indent=2, ensure_ascii=False)
    summary["attractions"] = len(attractions)
    logger.info(f"Extracted {len(attractions)} attractions for {destination}")

    # 2. Food (Eat, Drink)
    food = extract_listings(soup, ["Eat", "Drink"], wiki_url, destination)
    for f_spot in food:
        f_spot["budget_tier"] = _infer_budget_tier(f_spot.get("price_range", ""))
    with open(dest_dir / "food.json", "w", encoding="utf-8") as f:
        json.dump(food, f, indent=2, ensure_ascii=False)
    summary["food"] = len(food)
    logger.info(f"Extracted {len(food)} food spots for {destination}")

    # 3. Hotels (Sleep)
    hotels = extract_listings(soup, ["Sleep"], wiki_url, destination)
    for h in hotels:
        h["budget_tier"] = _infer_budget_tier(h.get("price_range", ""))
    with open(dest_dir / "hotels.json", "w", encoding="utf-8") as f:
        json.dump(hotels, f, indent=2, ensure_ascii=False)
    summary["hotels"] = len(hotels)
    logger.info(f"Extracted {len(hotels)} hotels for {destination}")

    # 4. Shopping (Buy)
    shopping = extract_listings(soup, ["Buy"], wiki_url, destination)
    with open(dest_dir / "shopping.json", "w", encoding="utf-8") as f:
        json.dump(shopping, f, indent=2, ensure_ascii=False)
    summary["shopping"] = len(shopping)
    logger.info(f"Extracted {len(shopping)} shopping spots for {destination}")

    # 5. Extract district/neighborhood links from the page
    # Wikivoyage often lists districts as sub-articles
    districts = []
    dest_slug = _normalize_destination(destination).title()
    pattern = f"/wiki/{dest_slug}/"
    for link in soup.select("a[href]"):
        href = link.get("href", "")
        text = link.get_text(strip=True)
        # Match links like /wiki/Dubai/Deira or /wiki/Paris/Montmartre
        if pattern in href and text and len(text) > 1:
            district_name = href.split("/")[-1].replace("_", " ")
            if district_name not in [d["name"] for d in districts]:
                # Build proper URL - handle protocol-relative, absolute, and relative hrefs
                if href.startswith("http"):
                    url = href
                elif href.startswith("//"):
                    url = f"https:{href}"
                elif href.startswith("/wiki/"):
                    url = f"https://en.wikivoyage.org{href}"
                else:
                    url = f"{WIKIVOYAGE_BASE}/{href}"
                districts.append({
                    "name": district_name,
                    "wikivoyage_url": url
                })
    with open(dest_dir / "districts.json", "w", encoding="utf-8") as f:
        json.dump(districts, f, indent=2, ensure_ascii=False)
    summary["districts"] = len(districts)
    logger.info(f"Found {len(districts)} district links for {destination}")

    # 6. Extract the "Get around" section for transport info
    transport_info = []
    get_around = soup.find("h2", id="Get_around")
    if get_around:
        # Collect text from sibling paragraphs until next h2
        for sibling in get_around.find_next_siblings():
            if sibling.name == "h2":
                break
            text = sibling.get_text(strip=True)
            if text and len(text) > 20:
                transport_info.append(text)
    with open(dest_dir / "transport.json", "w", encoding="utf-8") as f:
        json.dump({"notes": transport_info[:10]}, f, indent=2, ensure_ascii=False)
    summary["transport_notes"] = len(transport_info)

    # Save a metadata file
    metadata = {
        "destination": destination,
        "source_url": wiki_url,
        "summary": summary
    }
    with open(dest_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    logger.info(f"Scraping complete for {destination}. Files saved to {dest_dir}/")
    return summary


async def scrape_districts(destination: str, max_districts: int = 5, refresh: bool = False) -> dict:
    """Scrape district sub-pages for a destination to get food, hotels, shopping data.
    
    Major cities on Wikivoyage (Paris, Tokyo, London) put detailed listings on
    district sub-pages rather than the main page. This function scrapes those.
    
    Args:
        destination: The destination that was already scraped.
        max_districts: Maximum number of district pages to scrape (to be polite to Wikivoyage).
        refresh: Force re-fetch even if cached.
        
    Returns:
        A summary dict with total counts.
    """
    dest_dir = _get_dest_dir(destination)
    districts_file = dest_dir / "districts.json"
    
    if not districts_file.exists():
        logger.error(f"No districts file for {destination}. Run main scrape first.")
        return {"error": "Run main scrape first"}
    
    with open(districts_file, "r", encoding="utf-8") as f:
        districts = json.load(f)
    
    if not districts:
        logger.info(f"No districts found for {destination}")
        return {"districts_scraped": 0}
    
    all_food = []
    all_hotels = []
    all_shopping = []
    
    headers = {"User-Agent": "AITravelPlannerBot/2.0 (contact: test@example.com)"}
    
    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        for i, district in enumerate(districts[:max_districts]):
            district_name = district["name"]
            district_url = district["wikivoyage_url"]
            cache_file = dest_dir / f"district_{district_name.replace(' ', '_').lower()}.html"
            
            html = ""
            if not refresh and cache_file.exists():
                html = cache_file.read_text(encoding="utf-8")
            else:
                try:
                    logger.info(f"  Scraping district {i+1}/{min(len(districts), max_districts)}: {district_name}")
                    resp = await client.get(district_url, timeout=30.0)
                    resp.raise_for_status()
                    html = resp.text
                    cache_file.write_text(html, encoding="utf-8")
                    # Be polite — small delay between requests
                    await asyncio.sleep(1.0)
                except Exception as e:
                    logger.warning(f"  Failed to scrape {district_name}: {e}")
                    continue
            
            soup = BeautifulSoup(html, "html.parser")
            
            food = extract_listings(soup, ["Eat", "Drink"], district_url, destination)
            for f_spot in food:
                f_spot["district"] = district_name
                f_spot["budget_tier"] = _infer_budget_tier(f_spot.get("price_range", ""))
            all_food.extend(food)
            
            hotels = extract_listings(soup, ["Sleep"], district_url, destination)
            for h in hotels:
                h["district"] = district_name
                h["budget_tier"] = _infer_budget_tier(h.get("price_range", ""))
            all_hotels.extend(hotels)
            
            shopping = extract_listings(soup, ["Buy"], district_url, destination)
            for s in shopping:
                s["district"] = district_name
            all_shopping.extend(shopping)
    
    # Merge with any existing data from the main page
    for filename, new_data in [("food.json", all_food), ("hotels.json", all_hotels), ("shopping.json", all_shopping)]:
        filepath = dest_dir / filename
        existing = []
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                existing = json.load(f)
        
        # Deduplicate by name
        existing_names = {item["name"] for item in existing}
        for item in new_data:
            if item["name"] not in existing_names:
                existing.append(item)
                existing_names.add(item["name"])
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)
    
    summary = {
        "districts_scraped": min(len(districts), max_districts),
        "food": len(all_food),
        "hotels": len(all_hotels),
        "shopping": len(all_shopping)
    }
    
    logger.info(f"District scraping complete for {destination}: {summary}")
    return summary


def list_scraped_destinations() -> list[str]:
    """List all destinations that have been scraped (have data directories)."""
    if not DATA_DIR.exists():
        return []
    return [
        d.name for d in DATA_DIR.iterdir()
        if d.is_dir() and (d / "metadata.json").exists()
    ]


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Scrape Wikivoyage data for a travel destination")
    parser.add_argument("destination", nargs="?", default="Dubai",
                        help="Destination city to scrape (e.g., Paris, Tokyo, 'New York City')")
    parser.add_argument("--refresh", action="store_true", help="Force refresh of cached HTML")
    parser.add_argument("--list", action="store_true", help="List all scraped destinations")
    parser.add_argument("--with-districts", action="store_true",
                        help="Also scrape district sub-pages for food/hotel/shopping data")
    parser.add_argument("--max-districts", type=int, default=5,
                        help="Max number of district pages to scrape (default: 5)")
    args = parser.parse_args()

    if args.list:
        destinations = list_scraped_destinations()
        if destinations:
            print("Scraped destinations:")
            for d in destinations:
                print(f"  - {d}")
        else:
            print("No destinations scraped yet.")
    else:
        result = asyncio.run(scrape_wikivoyage(args.destination, refresh=args.refresh))
        print(json.dumps(result, indent=2))
        
        if args.with_districts:
            print("\nScraping district sub-pages...")
            district_result = asyncio.run(scrape_districts(
                args.destination,
                max_districts=args.max_districts,
                refresh=args.refresh
            ))
            print(json.dumps(district_result, indent=2))
