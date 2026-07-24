import asyncio
from functools import wraps
from pydantic import ValidationError
from src.utils.logger import logger


def _is_rate_limit_error(exc: Exception) -> bool:
    """Check if an exception is a Groq 429 rate-limit error."""
    err_str = str(exc).lower()
    return "rate_limit" in err_str or "429" in err_str or "rate limit" in err_str


def safe_llm_call(retries=2):
    """
    Decorator to wrap LLM calls that return structured output.
    Retries on ValidationError up to `retries` times.
    On a 429 rate-limit error, rotates to the next Groq API key,
    rebuilds the agent's self.llm, and retries.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # args[0] is `self` (the agent instance)
            agent = args[0] if args else None

            for attempt in range(retries + 1):
                try:
                    return await func(*args, **kwargs)
                except ValidationError as e:
                    logger.warning("LLM ValidationError", attempt=attempt, max_retries=retries, error=str(e))
                    if attempt == retries:
                        raise
                except Exception as e:
                    if _is_rate_limit_error(e) and agent and hasattr(agent, "llm"):
                        logger.warning(
                            "Rate limit hit – rotating Groq API key",
                            attempt=attempt,
                            error=str(e)[:200],
                        )
                        try:
                            from src.utils.groq_rotator import get_rotator
                            rotator = get_rotator()
                            rotator.next_key()

                            # Rebuild self.llm with the new key, preserving model & temperature
                            old_llm = agent.llm
                            model = getattr(old_llm, "model_name", None) or getattr(old_llm, "model", "llama-3.3-70b-versatile")
                            temp = getattr(old_llm, "temperature", 0)
                            agent.llm = rotator.get_llm(model=model, temperature=temp)
                            logger.info("Rebuilt agent LLM with new key", agent=type(agent).__name__)
                        except Exception as rotate_err:
                            logger.error("Failed to rotate key", error=str(rotate_err))
                            if attempt == retries:
                                raise e
                        continue  # Retry with the new key
                    else:
                        logger.warning("LLM Call Error", attempt=attempt, max_retries=retries, error=str(e))
                        if attempt == retries:
                            raise
        return wrapper
    return decorator

def with_timeout(seconds=30):
    """
    Decorator to wrap an async function with a timeout.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await asyncio.wait_for(func(*args, **kwargs), timeout=seconds)
            except asyncio.TimeoutError:
                logger.error("Function timeout", func_name=func.__name__, timeout_seconds=seconds)
                raise TimeoutError(f"Function {func.__name__} timed out after {seconds} seconds.")
        return wrapper
    return decorator

