from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from src.models.review import ReviewResult
from src.models.request import TravelRequest
from src.models.budget import BudgetBreakdown
from src.models.itinerary import Itinerary
from pathlib import Path
from src.config import settings
from src.utils.decorators import safe_llm_call
import json

class ReviewAgent:
    def __init__(self, llm=None, prompt_path=None):
        self.llm = llm or ChatGroq(
            model=settings.groq_planner_model,
            temperature=0,
            api_key=settings.groq_api_key
        )
        
        if not prompt_path:
            prompt_path = Path(__file__).parent.parent / "prompts" / "review.md"
            
        with open(prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()

    @safe_llm_call()
    async def review(
        self,
        itinerary: Itinerary,
        request: TravelRequest,
        budget: BudgetBreakdown
    ) -> ReviewResult:
        # Inject destination into the prompt template
        system_prompt = self.system_prompt.replace("{destination}", request.destination)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "User Request: {request}\nBudget Breakdown: {budget}\nDraft Itinerary: {itinerary}")
        ])
        
        chain = prompt | self.llm.with_structured_output(ReviewResult)
        
        return await chain.ainvoke({
            "request": request.model_dump_json(),
            "budget": budget.model_dump_json(),
            "itinerary": itinerary.model_dump_json()
        })
