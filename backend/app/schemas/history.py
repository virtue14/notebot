from datetime import datetime

from pydantic import BaseModel


class HistoryListItem(BaseModel):
    """이력 목록 항목."""

    id: str
    file_name: str
    mime_type: str
    status: str
    has_stt: bool
    has_summary: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryDetail(BaseModel):
    """이력 상세."""

    id: str
    file_name: str
    file_size: int
    mime_type: str
    status: str
    stt_content: str | None = None
    summary_content: str | None = None
    summary_provider: str | None = None
    summary_model: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
