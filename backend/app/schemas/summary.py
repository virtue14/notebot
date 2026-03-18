from enum import Enum
from pydantic import BaseModel


class ProviderEnum(str, Enum):
    openai = "openai"
    anthropic = "anthropic"
    gemini = "gemini"


class SummaryRequest(BaseModel):
    upload_id: str
    provider: ProviderEnum
    model: str
    api_key: str


class SummaryResponse(BaseModel):
    id: str
    upload_id: str
    provider: str
    model: str
    content: str

    model_config = {"from_attributes": True}
