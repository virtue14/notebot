from datetime import datetime, timezone

from pydantic import BaseModel, field_validator


def _ensure_utc(v: datetime) -> datetime:
    """naive datetime에 UTC 타임존을 부여한다."""
    if v.tzinfo is None:
        return v.replace(tzinfo=timezone.utc)
    return v


class UploadResponse(BaseModel):
    id: str
    file_name: str
    file_size: int
    mime_type: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("created_at")
    @classmethod
    def set_utc(cls, v: datetime) -> datetime:
        return _ensure_utc(v)


class UploadStatusResponse(BaseModel):
    id: str
    status: str
    stt_content: str | None = None
    summary_content: str | None = None

    model_config = {"from_attributes": True}


class HistoryItemResponse(BaseModel):
    id: str
    file_name: str
    type: str
    created_at: datetime
    data: str

    model_config = {"from_attributes": True}
