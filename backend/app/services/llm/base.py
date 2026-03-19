from abc import ABC, abstractmethod


class LLMAuthError(Exception):
    """API 키 인증 실패."""
    pass


class LLMAPIError(Exception):
    """LLM API 호출 실패."""
    pass


class LLMRateLimitError(Exception):
    """API 요청 한도 초과."""
    pass


class BaseLLMProvider(ABC):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model

    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """LLM에 프롬프트를 전송하고 텍스트 응답을 반환한다."""
        ...
