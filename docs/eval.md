# Evaluation Framework (eval.md)

This document defines the evaluation criteria, metrics, and testing strategies for the **LuxeTravel AI Multi-Agent Travel Planner**. It has been updated to reflect the final project architecture including multi-destination support, Groq API key rotation, hybrid streaming, and the premium Next.js frontend.

---

## Phase 1: Foundation

**Focus:** Data extraction, schema validation, and fundamental routing.

### 1. LLM Evaluation (Orchestrator Agent)
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Schema Adherence** | 100% | The LLM must output valid JSON matching the `TravelRequest` Pydantic model. | Run 50 diverse queries; assert 0 Pydantic validation errors. |
| **Constraint Extraction Precision** | ≥ 95% | Exact match on explicitly stated budget, duration, and dates. | Automated script comparing LLM output against a golden dataset of 50 query/JSON pairs. |
| **Preference Recall** | ≥ 90% | Successfully capturing subjective preferences (e.g., "likes modern art" -> `["modern art"]`). | Manual review of 20 complex queries. |
| **Multi-Destination Acceptance** | 100% | Correctly accepting any valid global destination (not limited to Dubai). | Automated test with 20 diverse city queries; assert valid TravelRequest for each. |

### 2. Code & Tooling Evaluation
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Scraper Completeness** | 100% | The Wikivoyage scraper successfully generates all required JSON seed files for any destination. | Run scraper; assert file existence, non-empty arrays, and schema validity. |
| **Scraper Fallback** | Pass | Graceful degradation if Wikivoyage is offline or structurally altered. | Disconnect network; verify scraper loads local cached HTML successfully. |
| **Test Coverage** | ≥ 80% | Unit test coverage for `src/models/` and `src/agents/`. | Run `pytest --cov`. |

---

## Phase 2: Worker Agents

**Focus:** Parallel agent execution, specific domain reasoning (Destinations, Logistics, Budget).

### 1. LLM Evaluation (Worker Agents)
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Destination Relevance** | ≥ 85% | Recommended attractions strictly align with extracted user preferences and avoidances. | Qualitative grading (1-5 scale) across 20 test outputs by a human reviewer. |
| **Budget Accuracy** | ± 10% | The total estimated cost calculated by the Budget agent is within 10% of the mathematically derived cost. | Automated assertion comparing LLM sum vs. programmatic sum of line items. |
| **Logistical Realism** | ≥ 90% | Daily itineraries group activities by neighborhood to minimize travel. | Algorithmic check: measure total daily distance between consecutive activities. Target < 40km per day. |
| **Hallucination Rate** | 0% | No fictitious hotels, attractions, or neighborhoods are recommended. | Automated cross-reference of LLM output against Wikivoyage seed data where available. |

### 2. System Performance
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Parallel Execution** | Pass | Destination, Logistics, and Budget agents execute concurrently via LangGraph fan-out. | Inspect log timestamps; assert total fan-out time ≈ slowest single agent. |
| **Pipeline Latency** | < 30s | Time from query to draft itinerary generation. | Automated load test with 10 concurrent requests. |
| **API Key Rotation** | Pass | On 429 rate-limit errors, system automatically rotates to the next Groq API key and retries. | Inject rate-limit errors; verify automatic key rotation and successful retry. |

---

## Phase 3: Review & Quality

**Focus:** Self-correction, retry loops, and error resilience.

### 1. LLM Evaluation (Review Agent)
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **False Positive Rate** | < 10% | Review agent rejects a perfectly valid itinerary. | Manual review of 30 "approved" and "rejected" traces. |
| **False Negative Rate** | < 5% | Review agent approves an itinerary that violates hard constraints (e.g., over budget). | Automated injection of 10 deliberately flawed itineraries; assert 100% rejection. |
| **Correction Success** | ≥ 80% | If an itinerary is rejected, the subsequent retry successfully fixes the issue. | Automated test tracking state transitions from `Retry` -> `Approved`. |

### 2. System Resilience
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Retry Limit Enforcement** | 100% | The system never exceeds the `max_review_retries` (2) limit. | Induce guaranteed failure; assert graph exits after exactly 3 total attempts. |
| **Tool Fallback Trigger** | Pass | External API failures cleanly fallback to static/cached data. | Mock `httpx` to return 500s for Serper/Google Maps; assert pipeline completes successfully. |
| **Rate Limit Auto-Recovery** | Pass | When a Groq API key hits its daily TPD limit, the `safe_llm_call` decorator rotates to the next key and retries. | Mock a 429 response; assert key rotation and successful completion. |

---

## Phase 4: Voice & Frontend

**Focus:** User experience, streaming, and multimodal interaction.

### 1. Streaming & UI Performance
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Time to First Token (TTFT)** | < 3s | Time before the user sees the first SSE status update. | Browser DevTools network profiling. |
| **UI Responsiveness** | Pass | No browser thread blocking during massive itinerary rendering. | Lighthouse performance audit (Target > 90 Performance score). |
| **Streaming Integrity** | 100% | The final rendered UI exactly matches the final completed JSON state. | Automated Playwright test comparing DOM elements to raw API JSON response. |

### 2. LLM Evaluation (Voice Agent)
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Conversational Tone** | Pass | Voice script uses natural, spoken-word phrasing rather than reading JSON lists. | Human review of 10 generated audio transcripts. |
| **Contextual QA Memory** | Pass | Follow-up questions accurately reference the specific generated itinerary. | Playwright test: Generate itinerary -> Ask "Is the hotel near the metro?" -> Assert relevant response. |
| **Intent Routing** | Pass | The `trigger_planner` field correctly identifies trip-planning intents vs. general chat. | Automated test with 20 diverse queries; assert correct routing. |

### 3. Frontend Design Quality
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Visual Premium Feel** | Pass | Dark theme, glassmorphism panels, neon gradient accents, Material Symbols icons. | Manual visual inspection against design spec. |
| **Navigation Functionality** | Pass | Header nav links (Explore, Itinerary, Budget, Concierge) smooth-scroll to correct sections with active state highlighting. | Manual browser test. |
| **Budget Interactivity** | Pass | Each budget category has a draggable slider bar that updates allocated amounts and triggers re-planning. | Manual browser test. |

---

## Phase 5: Polish & Deploy

**Focus:** Production readiness, load bearing, and final prompt tuning.

### 1. End-to-End System Evaluation
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **End-to-End Latency (p95)** | < 60s | 95% of full request cycles complete in under 60 seconds. | Sustained load test simulating 5 concurrent users over 10 minutes. |
| **Overall Success Rate** | ≥ 90% | A random natural language prompt successfully yields an approved, valid itinerary. | Automated batch run of 100 diverse prompts through the final LangGraph pipeline. |
| **Multi-Key Throughput** | 4× baseline | With 4 Groq API keys, the system sustains 4× the requests before rate-limiting. | Load test comparing single-key vs. multi-key throughput. |

### 2. Cost & Observability
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Cost Per Request** | < $0.05 | Average LLM API cost per generated itinerary (using Groq free tier). | Manual calculation: ~5 LLM calls × Groq pricing per call. |
| **Structured Logging** | 100% | Every request has structured JSON logs with agent names, timestamps, and error details. | Verify `structlog` output in Render logs. |
