from enum import Enum
from pydantic import BaseModel, Field


class ProviderEnum(str, Enum):
    openai = "openai"
    anthropic = "anthropic"
    gemini = "gemini"


class SummaryRequest(BaseModel):
    upload_ids: list[str] = Field(min_length=1, max_length=10)
    provider: ProviderEnum
    model: str
    api_key: str = Field(max_length=256)


class SummaryResponse(BaseModel):
    id: str
    upload_id: str
    provider: str
    model: str
    content: str

    model_config = {"from_attributes": True}
