# Evaluation Framework (eval.md)

This document defines the evaluation criteria, metrics, and testing strategies for each phase of the **Dubai AI Travel Planner** implementation. It serves as the benchmark to determine if a phase is truly "complete" and ready for production.

---

## Phase 1: Foundation

**Focus:** Data extraction, schema validation, and fundamental routing.

### 1. LLM Evaluation (Orchestrator Agent)
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Schema Adherence** | 100% | The LLM must output valid JSON matching the `TravelRequest` Pydantic model. | Run 50 diverse queries; assert 0 Pydantic validation errors. |
| **Constraint Extraction Precision** | ≥ 95% | Exact match on explicitly stated budget, duration, and dates. | Automated script comparing LLM output against a golden dataset of 50 query/JSON pairs. |
| **Preference Recall** | ≥ 90% | Successfully capturing subjective preferences (e.g., "likes modern art" -> `["modern art"]`). | Manual review of 20 complex queries. |
| **Out-of-Scope Rejection** | 100% | Correctly rejecting non-Dubai destinations. | Automated test with 10 non-Dubai queries; assert early-exit error response. |

### 2. Code & Tooling Evaluation
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Scraper Completeness** | 100% | The Wikivoyage scraper successfully generates all required JSON seed files. | Run scraper; assert file existence, non-empty arrays, and schema validity. |
| **Scraper Fallback** | Pass | Graceful degradation if Wikivoyage is offline or structurally altered. | Disconnect network; verify scraper loads local cached HTML successfully. |
| **Test Coverage** | ≥ 80% | Unit test coverage for `src/models/` and `src/agents/orchestrator.py`. | Run `pytest --cov`. |

---

## Phase 2: Worker Agents

**Focus:** Parallel agent execution, specific domain reasoning (Destinations, Logistics, Budget).

### 1. LLM Evaluation (Worker Agents)
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Destination Relevance** | ≥ 85% | Recommended attractions strictly align with extracted user preferences and avoidances. | Qualitative grading (1-5 scale) across 20 test outputs by a human reviewer. |
| **Budget Accuracy** | ± 10% | The total estimated cost calculated by the Budget agent is within 10% of the mathematically derived cost from seed data. | Automated assertion comparing LLM sum vs. programmatic sum of line items. |
| **Logistical Realism** | ≥ 90% | Daily itineraries group activities by neighborhood to minimize travel. | Algorithmic check: measure total daily distance between consecutive activities using distance matrix. Target < 40km per day. |
| **Hallucination Rate** | 0% | No fictitious hotels, attractions, or neighborhoods are recommended. | Automated cross-reference of LLM output against the Wikivoyage seed JSON keys. |

### 2. System Performance
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Parallel Execution** | Pass | Destination, Logistics, and Budget agents execute concurrently. | Inspect LangSmith trace timestamps; assert total fan-out time is roughly equal to the slowest single agent. |
| **Pipeline Latency** | < 15s | Time from query to draft itinerary generation. | Automated load test (`locust`) with 10 concurrent requests. |

---

## Phase 3: Review & Quality

**Focus:** Self-correction, retry loops, and error resilience.

### 1. LLM Evaluation (Review Agent)
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **False Positive Rate** | < 10% | Review agent rejects a perfectly valid itinerary. | Manual review of 30 "approved" and "rejected" LangSmith traces. |
| **False Negative Rate** | < 5% | Review agent approves an itinerary that violates hard constraints (e.g., over budget). | Automated injection of 10 deliberately flawed itineraries; assert 100% rejection. |
| **Correction Success** | ≥ 80% | If an itinerary is rejected, the subsequent retry successfully fixes the issue. | Automated test tracking state transitions from `Retry` -> `Approved`. |

### 2. System Resilience
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Retry Limit Enforcement** | 100% | The system never exceeds the `max_review_retries` (2) limit. | Induce guaranteed failure; assert graph exits after exactly 3 total attempts. |
| **Tool Fallback Trigger** | Pass | External API failures cleanly fallback to static/cached data. | Mock `httpx` to return 500s for Serper/Google Maps; assert pipeline completes successfully. |

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

---

## Phase 5: Polish & Deploy

**Focus:** Production readiness, load bearing, and final prompt tuning.

### 1. End-to-End System Evaluation
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **End-to-End Latency (p95)** | < 45s | 95% of full request cycles complete in under 45 seconds. | Sustained `locust` load test simulating 5 concurrent users over 10 minutes. |
| **Container Cold Start** | < 10s | Time for the API Docker container to become healthy. | `docker-compose up` timing script. |
| **Overall Success Rate** | ≥ 95% | A random natural language prompt successfully yields an approved, valid itinerary. | Automated batch run of 100 diverse prompts through the final LangGraph compiled pipeline. |

### 2. Cost & Observability
| Metric | Target | Description | Evaluation Method |
|---|---|---|---|
| **Cost Per Request** | < $0.05 | Average LLM API cost per generated itinerary. | LangSmith cost analytics dashboard review. |
| **Trace Completeness** | 100% | Every request has a full LangSmith trace including tool inputs/outputs and token usage. | Manual verification of LangSmith UI post-load test. |
