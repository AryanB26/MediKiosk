import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "MediKiosk Clinical Intake & OPD Suite"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "medikiosk-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # Database & Redis
    DATABASE_URL: str = "sqlite+aiosqlite:///./medikiosk.db" # Default fallback for light dev/testing
    REDIS_URL: str = "redis://localhost:6379/0"

    # Modular Providers
    LLM_PROVIDER: str = "mock" # "gemini" or "mock"
    GEMINI_API_KEY: Optional[str] = None

    LANGUAGE_PROVIDER: str = "mock" # "bhashini" or "mock"
    BHASHINI_USER_ID: Optional[str] = None
    BHASHINI_ULCA_API_KEY: Optional[str] = None

    OCR_PROVIDER: str = "mock" # "vision" or "mock"

    ABDM_ENV: str = "mock" # "sandbox" or "mock"
    ABDM_CLIENT_ID: Optional[str] = None
    ABDM_CLIENT_SECRET: Optional[str] = None

    # Uploads
    STORAGE_DIR: str = "./uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
