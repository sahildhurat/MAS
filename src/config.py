from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    groq_api_key: str = ""
    groq_api_keys: str = ""  # Comma-separated list of Groq API keys for rotation
    google_api_key: str = ""
    serper_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    groq_planner_model: str = "llama-3.3-70b-versatile"
    gemini_model: str = "gemini-2.5-flash"
    max_review_retries: int = 2
    log_level: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
