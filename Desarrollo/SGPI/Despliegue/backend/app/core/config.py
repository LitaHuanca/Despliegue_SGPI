from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SGPI - CRUD API"
    VERSION: str = "1.0.0"
    
    # Supabase (PostgreSQL) Config
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sgpi"
    
    # Supabase Auth Config
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    JWT_SECRET: str = ""
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
