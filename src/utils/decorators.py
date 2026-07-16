import asyncio
from functools import wraps
from pydantic import ValidationError
from src.utils.logger import logger

def safe_llm_call(retries=2):
    """
    Decorator to wrap LLM calls that return structured output.
    Retries on ValidationError up to `retries` times.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(retries + 1):
                try:
                    return await func(*args, **kwargs)
                except ValidationError as e:
                    logger.warning("LLM ValidationError", attempt=attempt, max_retries=retries, error=str(e))
                    if attempt == retries:
                        raise
                except Exception as e:
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
