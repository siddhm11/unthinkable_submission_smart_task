from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./taskplanner.db"

    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Groq
    groq_api_key: str = ""

    # App
    environment: str = "development"
    debug: bool = True
    api_v1_str: str = "/api/v1"
    project_name: str = "Smart Task Planner"

    class Config:
        env_file = ".env"

settings = Settings()
