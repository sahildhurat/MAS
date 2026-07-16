from src.models.request import TravelRequest
from pydantic import ValidationError
import pytest

def test_travel_request_valid():
    req = TravelRequest(
        destination="Dubai",
        duration_days=5,
        budget_usd=2000,
        raw_query="5 days in dubai with 2000 bucks"
    )
    assert req.destination == "Dubai"
    assert req.duration_days == 5

def test_travel_request_invalid_duration():
    with pytest.raises(ValidationError):
        TravelRequest(
            duration_days=50, # over 30
            budget_usd=2000,
            raw_query="50 days"
        )
