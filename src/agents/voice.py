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
        # Use Groq for ultra-fast voice responses, with JSON mode to guarantee valid output
        self.llm = ChatGroq(
            model=settings.groq_model, 
            temperature=0.7, 
            api_key=settings.groq_api_key
        ).bind(response_format={"type": "json_object"})
        
        with open(prompt_path, "r", encoding="utf-8") as f:
            template = f.read()
            
        self.prompt = PromptTemplate(
            template=template,
            input_variables=["itinerary_json", "question", "destination", "chat_history"]
        )

    async def answer_followup(self, question: str, itinerary: dict, destination: str = "your destination", chat_history: list = None) -> VoiceResponse:
        itinerary_json = json.dumps(itinerary, indent=2) if itinerary else "None"
        
        # Format chat history into a string
        history_str = "No previous conversation."
        if chat_history and len(chat_history) > 0:
            history_str = "\n".join([f"{msg.get('role', 'unknown').capitalize()}: {msg.get('text', '')}" for msg in chat_history])
            
        formatted_prompt = self.prompt.format(
            itinerary_json=itinerary_json,
            question=question,
            destination=destination,
            chat_history=history_str
        )
        
        # We manually parse the JSON to avoid Langchain's tool calling wrappers
        # which sometimes fail on Groq's smaller models
        result = await self.llm.ainvoke(formatted_prompt)
        
        try:
            parsed = json.loads(result.content)
            return VoiceResponse(
                response=parsed.get("response", "I'm sorry, I couldn't understand that."),
                trigger_planner=parsed.get("trigger_planner", False)
            )
        except Exception:
            # Fallback if parsing fails
            return VoiceResponse(
                response="I'm having trouble processing that right now.",
                trigger_planner=False
            )
