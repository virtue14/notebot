from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.upload import AiSummary, SttResult, Upload


class TestCreateSummary:
    """POST /api/v1/summary/ 통합 테스트."""

    def _create_upload_with_stt(self, db: Session) -> tuple[str, str]:
        """테스트용 Upload + SttResult를 생성하고 (upload_id, stt_content)를 반환한다."""
        upload = Upload(
            file_name="test.mp3",
            file_path="/fake/test.mp3",
            file_size=100,
            mime_type="audio/mpeg",
            status="completed",
        )
        db.add(upload)
        db.commit()

        stt = SttResult(upload_id=upload.id, content="테스트 강의 내용입니다.")
        db.add(stt)
        db.commit()

        return upload.id, stt.content

    @patch("app.services.llm.openai.AsyncOpenAI")
    def test_summary_success(self, mock_openai_cls, client: TestClient, db_session: Session):
        upload_id, _ = self._create_upload_with_stt(db_session)

        mock_choice = MagicMock()
        mock_choice.message.content = "# 학습 노트\n\n요약 내용"
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        mock_openai_cls.return_value = mock_client

        response = client.post("/api/v1/summary/", json={
            "upload_id": upload_id,
            "provider": "openai",
            "model": "gpt-5-mini",
            "api_key": "test-key",
        })

        assert response.status_code == 200
        data = response.json()
        assert data["upload_id"] == upload_id
        assert data["provider"] == "openai"
        assert data["model"] == "gpt-5-mini"
        assert "학습 노트" in data["content"]

    def test_summary_upload_not_found(self, client: TestClient):
        response = client.post("/api/v1/summary/", json={
            "upload_id": "nonexistent",
            "provider": "openai",
            "model": "gpt-5-mini",
            "api_key": "test-key",
        })
        assert response.status_code == 404

    @patch("app.services.file_reader.settings")
    @patch("app.services.llm.openai.AsyncOpenAI")
    def test_summary_no_stt_text_file(
        self, mock_openai_cls, mock_fr_settings, client: TestClient, db_session: Session, tmp_path: Path
    ):
        """STT 결과 없는 텍스트 파일 → 파일에서 직접 읽어서 요약 성공."""
        mock_fr_settings.UPLOAD_DIR = str(tmp_path)

        txt_file = tmp_path / "note.txt"
        txt_file.write_text("텍스트 파일 내용입니다.", encoding="utf-8")

        upload = Upload(
            file_name="note.txt",
            file_path=str(txt_file),
            file_size=100,
            mime_type="text/plain",
            status="completed",
        )
        db_session.add(upload)
        db_session.commit()

        mock_choice = MagicMock()
        mock_choice.message.content = "# 학습 노트\n\n텍스트 요약"
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        mock_openai_cls.return_value = mock_client

        response = client.post("/api/v1/summary/", json={
            "upload_id": upload.id,
            "provider": "openai",
            "model": "gpt-5-mini",
            "api_key": "test-key",
        })

        assert response.status_code == 200
        data = response.json()
        assert data["upload_id"] == upload.id
        assert "학습 노트" in data["content"]

    def test_summary_invalid_provider(self, client: TestClient):
        response = client.post("/api/v1/summary/", json={
            "upload_id": "some-id",
            "provider": "invalid",
            "model": "gpt-5-mini",
            "api_key": "test-key",
        })
        assert response.status_code == 422

    def test_summary_invalid_model(self, client: TestClient, db_session: Session):
        upload_id, _ = self._create_upload_with_stt(db_session)

        response = client.post("/api/v1/summary/", json={
            "upload_id": upload_id,
            "provider": "openai",
            "model": "invalid-model",
            "api_key": "test-key",
        })
        assert response.status_code == 400
        assert "지원하지 않는 모델" in response.json()["detail"]

    @patch("app.services.llm.openai.AsyncOpenAI")
    def test_summary_auth_error(self, mock_openai_cls, client: TestClient, db_session: Session):
        upload_id, _ = self._create_upload_with_stt(db_session)

        from openai import AuthenticationError
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(
            side_effect=AuthenticationError(
                message="Invalid API key",
                response=MagicMock(status_code=401),
                body=None,
            )
        )
        mock_openai_cls.return_value = mock_client

        response = client.post("/api/v1/summary/", json={
            "upload_id": upload_id,
            "provider": "openai",
            "model": "gpt-5-mini",
            "api_key": "bad-key",
        })
        assert response.status_code == 401


class TestLLMFactory:
    """프로바이더 팩토리 단위 테스트."""

    def test_create_openai(self):
        from app.services.llm.factory import create_provider
        provider = create_provider("openai", "key", "gpt-5-mini")
        assert provider.__class__.__name__ == "OpenAIProvider"

    def test_create_anthropic(self):
        from app.services.llm.factory import create_provider
        provider = create_provider("anthropic", "key", "claude-sonnet-4-6")
        assert provider.__class__.__name__ == "AnthropicProvider"

    def test_create_gemini(self):
        from app.services.llm.factory import create_provider
        provider = create_provider("gemini", "key", "gemini-3-flash")
        assert provider.__class__.__name__ == "GeminiProvider"

    def test_invalid_provider(self):
        from app.services.llm.factory import create_provider
        with pytest.raises(ValueError, match="지원하지 않는 프로바이더"):
            create_provider("invalid", "key", "model")

    def test_invalid_model(self):
        from app.services.llm.factory import create_provider
        with pytest.raises(ValueError, match="지원하지 않는 모델"):
            create_provider("openai", "key", "invalid-model")
