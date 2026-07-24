from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from src.models.request import TravelRequest
from src.models.budget import BudgetBreakdown
from pathlib import Path
from src.utils.decorators import safe_llm_call
from src.config import settings

class BudgetAgent:
    def __init__(self, llm=None, prompt_path=None):
        self.llm = llm or ChatGroq(model=settings.groq_planner_model, temperature=0, api_key=settings.groq_api_key)
        
        if not prompt_path:
            prompt_path = Path(__file__).parent.parent / "prompts" / "budget.md"
            
        with open(prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()

    @safe_llm_call()
    async def analyze(self, request: TravelRequest) -> BudgetBreakdown:
        # Inject destination into the prompt template
        system_prompt = self.system_prompt.replace("{destination}", request.destination)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "User Request: {request}")
        ])
        
        chain = prompt | self.llm.with_structured_output(BudgetBreakdown)
        
        return await chain.ainvoke({"request": request.model_dump_json()})
