from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@marketplace.com"
    FRONTEND_URL: str = "http://localhost:5173"
    # URLs adicionales permitidas en CORS (separadas por coma)
    CORS_ORIGINS: str = ""

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    MAPBOX_ACCESS_TOKEN: str = ""

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"

    SENTRY_DSN: str = ""
    ENVIRONMENT: str = "development"


settings = Settings()
