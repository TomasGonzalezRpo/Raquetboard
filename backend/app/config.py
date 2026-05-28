from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Google OAuth
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str = "https://raquetboard.vercel.app"

    # Google Sheets
    google_sheets_id: str
    google_service_account_json: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 días

    # Web Push
    vapid_private_key: str
    vapid_public_key: str
    vapid_claims_email: str

    # App
    allowed_email: str
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
