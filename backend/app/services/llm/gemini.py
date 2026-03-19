from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from app.services.llm.base import BaseLLMProvider, LLMAuthError, LLMAPIError, LLMRateLimitError


class GeminiProvider(BaseLLMProvider):
    SUPPORTED_MODELS = {"gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-3-flash", "gemini-3.1-pro", "gemini-3.1-flash-lite"}

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        try:
            client = genai.Client(api_key=self.api_key)
            response = await client.aio.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                ),
            )
            return response.text or ""
        except genai_errors.ClientError as e:
            if e.code == 429:
                raise LLMRateLimitError("요청이 너무 많아요. 잠시 후 다시 시도해주세요.")
            if e.code == 403 or "api key" in (e.message or "").lower():
                raise LLMAuthError("API 키 인증에 실패했습니다. 키를 확인해주세요.")
            raise LLMAPIError("AI 서비스 호출 중 오류가 발생했습니다.")
        except genai_errors.ServerError:
            raise LLMAPIError("AI 서비스 호출 중 오류가 발생했습니다.")
        except Exception:
            raise LLMAPIError("AI 서비스 호출 중 오류가 발생했습니다.")
