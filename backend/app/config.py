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
    ALLOWED_EXTENSIONS: list[str] = [
        ".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg", ".opus", ".wma",
        ".mp4", ".mov", ".mkv", ".webm", ".avi", ".wmv", ".3gp",
        ".txt", ".pdf",
    ]
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    WHISPER_MODEL: str = "base"
    WHISPER_DEVICE: str = "cpu"
    STT_LANGUAGE: str = "ko"
    STT_VAD_ENABLED: bool = True
    STT_VAD_MIN_SILENCE_MS: int = 500
    STT_DEFAULT_INITIAL_PROMPT: str = (
        "다음은 한국어 강의 또는 학습 자료 녹음입니다. "
        "강의, 교재, 노트, 정리, 챕터, 예제, 핵심 정리."
    )

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
