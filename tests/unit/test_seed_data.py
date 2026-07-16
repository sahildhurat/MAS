import pytest
import json
from pathlib import Path

DATA_DIR = Path("src/data")

@pytest.mark.parametrize("filename", [
    "dubai_attractions.json",
    "dubai_food.json",
    "dubai_hotels.json",
    "dubai_shopping.json",
    "dubai_transport.json",
    "dubai_neighborhoods.json",
    "dubai_budget_tiers.json"
])
def test_seed_data_exists_and_valid(filename):
    file_path = DATA_DIR / filename
    assert file_path.exists(), f"{filename} does not exist. Did you run the scraper?"
    
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    assert isinstance(data, list)
    assert len(data) > 0
