from pydantic_settings import BaseSettings
from pydantic import field_validator
import logging
from typing import List, Any

logger = logging.getLogger("uvicorn.error")

DEFAULT_DATABASE_URL = "postgresql+asyncpg://smarana_user:smarana_secure_pass_2026@localhost:5432/smarana_v2"
DEFAULT_JWT_SECRET = "5bf891ef60d5b060ee4515579f12d8a0c4f8d95eb079c6d3bc8f504de0f9b634"

class Settings(BaseSettings):
    DATABASE_URL: str = DEFAULT_DATABASE_URL
    JWT_SECRET: str = DEFAULT_JWT_SECRET
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 1 day
    CORS_ORIGINS: Any = ["*"]
    ENVIRONMENT: str = "development"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    class Config:
        env_file = ".env"

settings = Settings()

# Check for production defaults
if settings.ENVIRONMENT.lower() == "production":
    if settings.DATABASE_URL == DEFAULT_DATABASE_URL:
        logger.warning(
            "SECURITY WARNING: Using default development DATABASE_URL in production! "
            "Please configure a unique DATABASE_URL in your environment or .env file."
        )
    if settings.JWT_SECRET == DEFAULT_JWT_SECRET:
        logger.warning(
            "SECURITY WARNING: Using default development JWT_SECRET in production! "
            "Please configure a unique JWT_SECRET in your environment or .env file."
        )

