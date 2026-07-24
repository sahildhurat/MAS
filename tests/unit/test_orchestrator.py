import pytest
from src.graph.state import PlannerState
from src.graph.nodes import parse_request_node
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
@patch("src.graph.nodes.orchestrator_agent.parse_request")
async def test_parse_request_node_success(mock_parse_request):
    mock_parse_request.return_value = type("MockReq", (), {"destination": "Dubai"})()
    state = PlannerState(raw_query="Trip to Dubai")
    result = await parse_request_node(state)
    assert "travel_request" in result
    assert result["retry_count"] == 0

@pytest.mark.asyncio
@patch("src.graph.nodes.orchestrator_agent.parse_request")
async def test_parse_request_node_error(mock_parse_request):
    mock_parse_request.side_effect = Exception("Invalid input")
    state = PlannerState(raw_query="Invalid Query")
    result = await parse_request_node(state)
    assert "error" in result
    assert "Failed to parse request" in result["error"]
