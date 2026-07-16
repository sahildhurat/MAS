import json
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from src.config import settings

class VoiceResponse(BaseModel):
    response: str = Field(description="The spoken text response")
    trigger_planner: bool = Field(description="True if the user asked to plan a full trip/itinerary. False for general chatter.")

class VoiceAgent:
    def __init__(self, prompt_path: str = "src/prompts/voice.md"):
        self.llm = ChatGroq(model=settings.groq_model, temperature=0.7, api_key=settings.groq_api_key)
        with open(prompt_path, "r", encoding="utf-8") as f:
            template = f.read()
            
        self.prompt = PromptTemplate(
            template=template,
            input_variables=["itinerary_json", "question", "destination"]
        )

    async def answer_followup(self, question: str, itinerary: dict, destination: str = "your destination") -> VoiceResponse:
        itinerary_json = json.dumps(itinerary, indent=2) if itinerary else "None"
        formatted_prompt = self.prompt.format(
            itinerary_json=itinerary_json,
            question=question,
            destination=destination
        )
        
        llm_with_tool = self.llm.with_structured_output(VoiceResponse)
        result = await llm_with_tool.ainvoke(formatted_prompt)
        return result
