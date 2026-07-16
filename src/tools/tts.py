import logging
from typing import Optional

logger = logging.getLogger(__name__)

class TTSTool:
    """
    Text-to-Speech tool.
    In Phase 4, this was intended to use Google Cloud TTS or similar.
    However, the frontend currently uses the native browser Web Speech API for TTS.
    This tool serves as a stub for potential future backend TTS generation (e.g., generating MP3/OGG).
    """
    def __init__(self, use_fallback: bool = True):
        self.use_fallback = use_fallback

    async def speak(self, text: str) -> Optional[bytes]:
        """
        Convert text to speech audio bytes.
        Returns None to indicate the client should use its native browser TTS fallback.
        """
        logger.info(f"TTS requested for text (length: {len(text)}). Relying on client-side native TTS.")
        return None
