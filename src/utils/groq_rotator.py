import threading
from langchain_groq import ChatGroq
from src.utils.logger import logger


class GroqKeyRotator:
    """
    Thread-safe round-robin rotator for multiple Groq API keys.
    Falls back to the next key automatically when one is exhausted.
    """

    def __init__(self, api_keys: list[str]):
        if not api_keys:
            raise ValueError("At least one Groq API key is required.")
        self._keys = api_keys
        self._index = 0
        self._lock = threading.Lock()
        logger.info("GroqKeyRotator initialized", num_keys=len(self._keys))

    @property
    def current_key(self) -> str:
        with self._lock:
            return self._keys[self._index % len(self._keys)]

    def next_key(self) -> str:
        """Advance to the next key and return it."""
        with self._lock:
            self._index = (self._index + 1) % len(self._keys)
            logger.info("Rotated to next Groq API key", key_index=self._index)
            return self._keys[self._index]

    def get_llm(self, model: str, temperature: float = 0, **kwargs) -> ChatGroq:
        """Create a ChatGroq instance with the current API key."""
        return ChatGroq(
            model=model,
            temperature=temperature,
            api_key=self.current_key,
            **kwargs,
        )


# ---------------------------------------------------------------------------
# Singleton instance – import this wherever you need a Groq LLM
# ---------------------------------------------------------------------------
_rotator: GroqKeyRotator | None = None


def get_rotator() -> GroqKeyRotator:
    """
    Lazily initialise and return the global GroqKeyRotator singleton.

    Keys are read from settings.groq_api_keys (comma-separated string)
    with a fallback to settings.groq_api_key (single key).
    """
    global _rotator
    if _rotator is None:
        from src.config import settings

        raw = getattr(settings, "groq_api_keys", "") or ""
        keys = [k.strip() for k in raw.split(",") if k.strip()]

        # Fallback: use the single legacy key if no list was provided
        if not keys and settings.groq_api_key:
            keys = [settings.groq_api_key]

        _rotator = GroqKeyRotator(keys)
    return _rotator
