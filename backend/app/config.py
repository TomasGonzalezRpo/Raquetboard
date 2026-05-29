from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Supabase
    supabase_url: str
    supabase_service_key: str          # service_role key (acceso total, solo backend)

    # Google OAuth
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7

    # App
    allowed_email: str
    frontend_url: str

    # Web Push
    vapid_private_key: str
    vapid_public_key: str
    vapid_claims_email: str


settings = Settings()
