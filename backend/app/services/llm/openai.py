import logging

from openai import AsyncOpenAI, AuthenticationError, APIError
from app.services.llm.base import BaseLLMProvider, LLMAuthError, LLMAPIError

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseLLMProvider):
    SUPPORTED_MODELS = {"gpt-5.4", "gpt-5-mini", "gpt-5.3-codex"}

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        try:
            client = AsyncOpenAI(api_key=self.api_key)
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            return response.choices[0].message.content or ""
        except AuthenticationError:
            raise LLMAuthError("API 키 인증에 실패했습니다. 키를 확인해주세요.")
        except APIError as e:
            logger.error("OpenAI API 오류: %s", e.message)
            raise LLMAPIError("AI 서비스 호출 중 오류가 발생했습니다.")
        except Exception:
            raise LLMAPIError("AI 서비스 호출 중 오류가 발생했습니다.")
