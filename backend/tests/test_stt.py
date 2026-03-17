import io
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.upload import SttResult, Upload


class TestTranscribeFile:
    @patch("app.services.stt.get_model")
    def test_transcribe_joins_segments(self, mock_get_model):
        seg1 = MagicMock()
        seg1.text = " 안녕하세요 "
        seg2 = MagicMock()
        seg2.text = " 반갑습니다 "

        mock_model = MagicMock()
        mock_model.transcribe.return_value = ([seg1, seg2], None)
        mock_get_model.return_value = mock_model

        from app.services.stt import transcribe_file

        result = transcribe_file("/fake/path.mp3")

        assert result == "안녕하세요 반갑습니다"
        mock_model.transcribe.assert_called_once_with("/fake/path.mp3", beam_size=5)

    @patch("app.services.stt.get_model")
    def test_transcribe_empty_raises(self, mock_get_model):
        mock_model = MagicMock()
        mock_model.transcribe.return_value = ([], None)
        mock_get_model.return_value = mock_model

        from app.services.stt import transcribe_file

        import pytest

        with pytest.raises(ValueError, match="비어 있습니다"):
            transcribe_file("/fake/path.mp3")


class TestRunSttTask:
    @patch("app.services.stt.transcribe_file")
    def test_success(self, mock_transcribe, db_session: Session):
        mock_transcribe.return_value = "변환된 텍스트"

        upload = Upload(
            file_name="test.mp3",
            file_path="/fake/test.mp3",
            file_size=100,
            mime_type="audio/mpeg",
            status="pending",
        )
        db_session.add(upload)
        db_session.commit()
        upload_id = upload.id

        mock_session = MagicMock(wraps=db_session)
        mock_session.close = MagicMock()

        with patch("app.services.stt.SessionLocal", return_value=mock_session):
            from app.services.stt import run_stt_task

            run_stt_task(upload_id)

        db_session.refresh(upload)
        assert upload.status == "completed"

        stt = db_session.query(SttResult).filter_by(upload_id=upload_id).first()
        assert stt is not None
        assert stt.content == "변환된 텍스트"

    @patch("app.services.stt.transcribe_file")
    def test_failure_sets_status_failed(self, mock_transcribe, db_session: Session):
        mock_transcribe.side_effect = RuntimeError("Whisper 오류")

        upload = Upload(
            file_name="test.mp3",
            file_path="/fake/test.mp3",
            file_size=100,
            mime_type="audio/mpeg",
            status="pending",
        )
        db_session.add(upload)
        db_session.commit()
        upload_id = upload.id

        mock_session = MagicMock(wraps=db_session)
        mock_session.close = MagicMock()

        with patch("app.services.stt.SessionLocal", return_value=mock_session):
            from app.services.stt import run_stt_task

            run_stt_task(upload_id)

        db_session.refresh(upload)
        assert upload.status == "failed"

        stt = db_session.query(SttResult).filter_by(upload_id=upload_id).first()
        assert stt is None


class TestUploadSttTrigger:
    @patch("app.services.stt.run_stt_task")
    def test_audio_upload_triggers_stt(self, mock_run_stt, client: TestClient):
        file = io.BytesIO(b"fake audio data")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("test.mp3", file, "audio/mpeg")},
        )

        assert response.status_code == 200
        mock_run_stt.assert_called_once_with(response.json()["id"])

    @patch("app.services.stt.run_stt_task")
    def test_video_upload_triggers_stt(self, mock_run_stt, client: TestClient):
        file = io.BytesIO(b"fake video data")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("test.mp4", file, "video/mp4")},
        )

        assert response.status_code == 200
        mock_run_stt.assert_called_once_with(response.json()["id"])

    @patch("app.services.stt.run_stt_task")
    def test_text_upload_does_not_trigger_stt(self, mock_run_stt, client: TestClient):
        file = io.BytesIO(b"hello world")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("note.txt", file, "text/plain")},
        )

        assert response.status_code == 200
        mock_run_stt.assert_not_called()

    @patch("app.services.stt.run_stt_task")
    def test_pdf_upload_does_not_trigger_stt(self, mock_run_stt, client: TestClient):
        file = io.BytesIO(b"%PDF-1.4 fake pdf")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("doc.pdf", file, "application/pdf")},
        )

        assert response.status_code == 200
        mock_run_stt.assert_not_called()
