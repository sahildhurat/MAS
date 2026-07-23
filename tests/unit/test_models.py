from src.models.request import TravelRequest
from pydantic import ValidationError
import pytest

def test_travel_request_valid():
    req = TravelRequest(
        destination="Mumbai",
        duration_days=5,
        budget_inr=125000,
        raw_query="5 days in Mumbai with 125000 rupees"
    )
    assert req.destination == "Mumbai"
    assert req.duration_days == 5

def test_travel_request_invalid_duration():
    with pytest.raises(ValidationError):
        TravelRequest(
            duration_days=50, # over 30
            budget_inr=125000,
            raw_query="50 days"
        )
