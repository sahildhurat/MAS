from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from src.models.request import TravelRequest
from pathlib import Path
from src.utils.decorators import safe_llm_call
from src.config import settings

class OrchestratorAgent:
    """
    Phase 1: Parses NL query -> TravelRequest.
    Phase 2+: Will also assemble itinerary and handle retries.
    """
    def __init__(self, prompt_path: str = "src/prompts/orchestrator.md"):
        # We assume the key is provided via env var or settings
        self.llm = ChatGroq(model=settings.groq_model, temperature=0, api_key=settings.groq_api_key)
        with open(prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()

    @safe_llm_call()
    async def parse_request(self, raw_query: str) -> TravelRequest:
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Raw Query: {raw_query}"}
        ]
        llm_with_tool = self.llm.with_structured_output(TravelRequest)
        result = await llm_with_tool.ainvoke(messages)
        # Ensure raw_query is set
        result.raw_query = raw_query
        return result

    @safe_llm_call()
    async def assemble_itinerary(self, request, destination_report, logistics_plan, budget_breakdown, revision_notes=None):
        from src.models.itinerary import Itinerary
        prompt = """
        You are the chief travel planner.
        Your task is to take the raw outputs from the Destination, Logistics, and Budget agents,
        and combine them into a final structured day-by-day Itinerary for the requested destination.
        Ensure all information is consistent and respects the budget.
        """
        if revision_notes:
            prompt += f"\n\nCRITICAL REVISION NOTES TO INCORPORATE:\n{revision_notes}"
            
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Request: {request}\nDestination: {destination_report}\nLogistics: {logistics_plan}\nBudget: {budget_breakdown}"}
        ]
        llm_with_tool = self.llm.with_structured_output(Itinerary)
        return await llm_with_tool.ainvoke(messages)
