from app.services.llm.base import BaseLLMProvider
from app.services.llm.openai import OpenAIProvider
from app.services.llm.anthropic import AnthropicProvider
from app.services.llm.gemini import GeminiProvider

_PROVIDERS: dict[str, type[BaseLLMProvider]] = {
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "gemini": GeminiProvider,
}


def create_provider(provider: str, api_key: str, model: str) -> BaseLLMProvider:
    """프로바이더 문자열로 LLM 프로바이더 인스턴스를 생성한다."""
    cls = _PROVIDERS.get(provider)
    if cls is None:
        raise ValueError(f"지원하지 않는 프로바이더: {provider}")
    if model not in cls.SUPPORTED_MODELS:
        raise ValueError(f"지원하지 않는 모델: {model} (프로바이더: {provider})")
    return cls(api_key=api_key, model=model)
