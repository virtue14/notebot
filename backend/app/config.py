from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/notebot.db"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    DEBUG: bool = False
    UPLOAD_DIR: str = "data/uploads"
    ALLOWED_MIME_TYPES: list[str] = [
        "audio/*",
        "video/*",
        "text/plain",
        "application/pdf",
    ]
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
