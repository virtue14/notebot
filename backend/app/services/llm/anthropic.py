from anthropic import AsyncAnthropic, AuthenticationError, APIError
from app.services.llm.base import BaseLLMProvider, LLMAuthError, LLMAPIError


class AnthropicProvider(BaseLLMProvider):
    SUPPORTED_MODELS = {"claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5"}

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        try:
            client = AsyncAnthropic(api_key=self.api_key)
            response = await client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            return response.content[0].text
        except AuthenticationError:
            raise LLMAuthError("API 키 인증에 실패했습니다. 키를 확인해주세요.")
        except APIError as e:
            raise LLMAPIError(f"Anthropic API 호출 중 오류가 발생했습니다: {e.message}")
        except Exception:
            raise LLMAPIError("AI 서비스 호출 중 오류가 발생했습니다.")
