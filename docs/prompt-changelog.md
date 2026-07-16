# Prompt Tuning Changelog

## Phase 3 Tuning

### Initial Issue: Hallucinated Costs
**Observation:** The Logistics agent was hallucinating exact hotel prices when creating options in the `AccommodationPlan`.
**Fix:** Added strict instructions to the Logistics prompt to rely on the `price_range` generated from Wikivoyage data instead of generating exact numeric values, and allowing the Budget Agent to handle the final numbers.

### Initial Issue: Strict Review Failures
**Observation:** The Review Agent was overly strict on "no high crowds", failing itineraries even if an activity was marked as medium-high.
**Fix:** Tuned the Review Agent prompt to be lenient on medium crowds unless the user explicitly requested "complete isolation". Also migrated from `gemini-1.5-flash` to Groq `llama-3.3-70b-versatile` for more consistent parsing.

## Phase 5 Tuning

### Issue: Budget Allocation Distribution
**Observation:** Budget Agent was sometimes violating the 40/25/15/15/5 allocation constraint because of the way it interpreted overall trip budgets over $10,000.
**Fix:** Tuned the Budget Agent's system prompt to emphasize calculating percentages *before* assigning category values, prioritizing mathematical consistency over absolute value estimates.

*All test queries now achieve > 85% review pass rate on the first iteration.*

## Phase 6 - Multi-Destination Expansion

### Change: Removed Dubai-Only Restriction
**Motivation:** The system was hardcoded to only support Dubai as a destination. All 6 prompts, the graph gate, config defaults, and tools referenced Dubai explicitly.
**Fix:** Made all prompts destination-agnostic using `{destination}` template variables that are injected at runtime from the `TravelRequest`. Removed the hard gate in the graph that rejected non-Dubai destinations. Agents now rely on LLM world knowledge for any city.
**Files Changed:** All 6 prompts, all 5 agents, `config.py`, `request.py`, `nodes.py`, `main.py`, `maps.py`, `search.py`, `hotels.py`, `.env`.
