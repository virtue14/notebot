from google import genai
from google.genai import types
from app.services.llm.base import BaseLLMProvider, LLMAuthError, LLMAPIError


class GeminiProvider(BaseLLMProvider):
    SUPPORTED_MODELS = {"gemini-3.1-pro", "gemini-3-flash", "gemini-3.1-flash-lite"}

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
        except Exception as e:
            err_msg = str(e).lower()
            if "api key" in err_msg or "unauthorized" in err_msg or "403" in err_msg:
                raise LLMAuthError("API 키 인증에 실패했습니다. 키를 확인해주세요.")
            raise LLMAPIError("AI 서비스 호출 중 오류가 발생했습니다.")
