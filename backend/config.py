from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List

class Settings(BaseSettings):
    ENVIRONMENT: str = "development" # 'development' or 'production'
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    META_VERIFY_TOKEN: str
    META_ACCESS_TOKEN: str = ""
    META_PHONE_NUMBER_ID: str = ""
    SENDGRID_API_KEY: str = "" 
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""
    GOOGLE_API_KEY: str = "your-gemini-key"
    SECRET_KEY: str = "wesee-super-secret-crypto-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    BASE_URL: str = "http://localhost:8000" # Update when deployed

    @field_validator("SECRET_KEY")
    @classmethod
    def check_secret_key(cls, v: str):
        if "wesee-super-secret" in v.lower():
            # We don't have ENVIRONMENT here yet during field validation 
            # unless it's defined before. But better to check in model_validator.
            pass
        return v

    from pydantic import model_validator
    @model_validator(mode='after')
    def validate_production_security(self) -> 'Settings':
        if self.ENVIRONMENT == "production":
            if "wesee-super-secret" in self.SECRET_KEY.lower():
                raise ValueError("SECURITY FATAL: Default SECRET_KEY cannot be used in production environment.")
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
