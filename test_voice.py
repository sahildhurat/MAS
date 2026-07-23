import asyncio
import logging
from src.agents.voice import VoiceAgent

logging.basicConfig(level=logging.DEBUG)

async def test_voice():
    agent = VoiceAgent()
    print("Testing VoiceAgent with Gemini...")
    res = await asyncio.wait_for(agent.answer_followup("Plan a trip to Mumbai", {}), timeout=10.0)
    print(res)

if __name__ == "__main__":
    asyncio.run(test_voice())
