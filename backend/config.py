"""
Application settings loaded from .env.local (or environment variables).
Secrets are never logged or exposed via API responses.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"
    FRONTEND_ORIGIN: str = "http://localhost:3000"


settings = Settings()  # type: ignore[call-arg]
