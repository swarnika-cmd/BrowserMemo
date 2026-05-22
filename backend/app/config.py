from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://smarana_user:smarana_secure_pass_2026@localhost:5432/smarana_v2"
    JWT_SECRET: str = "5bf891ef60d5b060ee4515579f12d8a0c4f8d95eb079c6d3bc8f504de0f9b634"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 1 day

    class Config:
        env_file = ".env"

settings = Settings()
