from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from src.utils.logger import logger
from src.utils.streaming import stream_plan
from src.graph.builder import build_planner_graph
from src.models.request import TravelRequest

app = FastAPI(title="AI Travel Planner", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://mas-git-main-spd2.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compile graph once
planner_graph = build_planner_graph()

class PlanRequest(BaseModel):
    query: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/v1/plan")
async def plan_trip(request: PlanRequest, req: Request):
    logger.info("Received plan request for stream", query=request.query)
    
    # Return an EventSourceResponse that streams the generator
    return EventSourceResponse(
        stream_plan(planner_graph, request.query, request_obj=req),
        media_type="text/event-stream"
    )

import base64
import httpx
from src.config import settings

class TranscribeRequest(BaseModel):
    audio_base64: str

@app.post("/api/v1/transcribe")
async def transcribe_audio(request: TranscribeRequest):
    logger.info("Received audio transcription request")
    try:
        # Strip data URL prefix if present
        b64_data = request.audio_base64
        if "," in b64_data:
            b64_data = b64_data.split(",")[1]
            
        audio_bytes = base64.b64decode(b64_data)
        
        files = {
            'file': ('audio.webm', audio_bytes, 'audio/webm')
        }
        data = {
            'model': 'whisper-large-v3', # More accurate than turbo
            'language': 'en',
            'prompt': "LuxeTravel AI, luxury travel, itinerary, budget, flights, hotels, booking, destination, let's go."
        }
        
        async with httpx.AsyncClient() as client:
            from src.utils.groq_rotator import get_rotator
            response = await client.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {get_rotator().current_key}"},
                data=data,
                files=files,
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            return {"transcript": result.get("text", "")}
            
    except Exception as e:
        logger.error("Error transcribing audio", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


from fastapi import WebSocket, WebSocketDisconnect
from src.agents.voice import VoiceAgent
import json

# Instantiate the voice agent globally
voice_agent = VoiceAgent()

@app.websocket("/ws/v1/voice/{session_id}")
async def websocket_voice_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    logger.info("WebSocket connected", session_id=session_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                question = payload.get("question", "")
                itinerary = payload.get("itinerary", {})
                destination = payload.get("destination", "your destination")
                chat_history = payload.get("chat_history", [])
                
                if question:
                    logger.info("Voice question received", session_id=session_id, question=question)
                    voice_res = await voice_agent.answer_followup(question, itinerary, destination, chat_history)
                    
                    await websocket.send_json({
                        "response": voice_res.response,
                        "trigger_planner": voice_res.trigger_planner
                    })
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON payload"})
            except Exception as e:
                logger.error("Error in websocket processing", exc_info=True)
                await websocket.send_json({"error": str(e)})
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected", session_id=session_id)
