"""
Configuration management for LexiFlow AI Backend
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./lexiflow.db"
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "lexiflow"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create a global settings instance
settings = Settings()

