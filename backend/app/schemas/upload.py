from datetime import datetime

from pydantic import BaseModel


class UploadResponse(BaseModel):
    id: str
    file_name: str
    file_size: int
    mime_type: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


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
