# LuxeTravel AI — Dubai Multi-Agent Planner

![Project Status](https://img.shields.io/badge/status-active-success.svg)

LuxeTravel AI is an advanced Multi-Agent System (MAS) designed to orchestrate bespoke, luxury travel itineraries specifically for Dubai. Leveraging LangGraph and FastAPI, the system distributes complex planning tasks across specialized AI agents.

## Architecture

The system utilizes a parallel fan-out / fan-in architecture:

1. **Orchestrator Agent**: Parses natural language requests into structured `TravelRequest` objects.
2. **Parallel Worker Agents**:
   - **Destination Research Agent**: Recommends attractions, dining, and neighborhoods based on user preferences and crowd avoidance.
   - **Logistics Agent**: Sequences activities, optimizes travel routes, and suggests accommodations.
   - **Budget Agent**: Analyzes costs and ensures the itinerary adheres to strict budget constraints.
3. **Review Agent (Quality Gate)**: Validates the drafted itinerary against a 6-point rubric (budget, constraints, preferences). If it fails, the itinerary is routed back through the pipeline for revision.
4. **Voice Agent (Upcoming)**: Narrates the itinerary with TTS capabilities.

## Prerequisites

- Python 3.11+
- Node.js 20+
- API Keys:
  - `GROQ_API_KEY` (Powers the core reasoning agents)
  - `GOOGLE_API_KEY` (Powers the Review Agent)
  - `SERPER_API_KEY` (Web search)

## Quick Start (Local)

1. **Clone & Setup Backend:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```
2. **Configure Environment:**
   Copy `.env.example` to `.env` and fill in your API keys.

3. **Start Backend:**
   ```bash
   python -m uvicorn src.main:app --reload
   ```

4. **Start Frontend (Next.js):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the App:** Navigate to `http://localhost:3000`

## Quick Start (Docker)

To run the entire stack (FastAPI Backend, Next.js Frontend, Redis) using Docker Compose:

```bash
docker-compose up --build
```
*Frontend will be available on port 3000, Backend on port 8000.*

## Demo

Watch our AI autonomously generate a bespoke itinerary!

![LuxeTravel AI Demo](docs/demo/demo_recording.webp)

## Contributing
Please see the [Architecture Document](docs/architecture.md) for details on adding new agents or modifying the LangGraph state.
