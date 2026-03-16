import io

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.upload import SttResult, Upload


class TestUploadFile:
    def test_upload_audio_file(self, client: TestClient):
        file = io.BytesIO(b"fake audio data")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("test.mp3", file, "audio/mpeg")},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["file_name"] == "test.mp3"
        assert data["mime_type"] == "audio/mpeg"
        assert data["file_size"] == 15
        assert data["status"] == "pending"
        assert "id" in data
        assert "created_at" in data

    def test_upload_video_file(self, client: TestClient):
        file = io.BytesIO(b"fake video data")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("test.mp4", file, "video/mp4")},
        )

        assert response.status_code == 200
        assert response.json()["mime_type"] == "video/mp4"

    def test_upload_text_file(self, client: TestClient):
        file = io.BytesIO(b"hello world")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("note.txt", file, "text/plain")},
        )

        assert response.status_code == 200
        assert response.json()["mime_type"] == "text/plain"

    def test_upload_pdf_file(self, client: TestClient):
        file = io.BytesIO(b"%PDF-1.4 fake pdf")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("doc.pdf", file, "application/pdf")},
        )

        assert response.status_code == 200
        assert response.json()["mime_type"] == "application/pdf"

    def test_upload_mov_file(self, client: TestClient):
        file = io.BytesIO(b"fake mov data")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("test.mov", file, "video/quicktime")},
        )

        assert response.status_code == 200
        assert response.json()["mime_type"] == "video/quicktime"

    def test_reject_disallowed_mime_type(self, client: TestClient):
        file = io.BytesIO(b"MZ executable")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("malware.exe", file, "application/x-msdownload")},
        )

        assert response.status_code == 400
        assert "허용되지 않는 파일 타입" in response.json()["detail"]

    def test_reject_oversized_file(self, client: TestClient):
        from app.config import settings

        original = settings.MAX_UPLOAD_SIZE
        settings.MAX_UPLOAD_SIZE = 10  # 10 bytes

        file = io.BytesIO(b"x" * 100)
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("big.mp3", file, "audio/mpeg")},
        )

        settings.MAX_UPLOAD_SIZE = original

        assert response.status_code == 400
        assert "초과" in response.json()["detail"]

    def test_file_saved_to_disk(self, client: TestClient):
        from app.config import settings
        from pathlib import Path

        file = io.BytesIO(b"audio content here")
        response = client.post(
            "/api/v1/upload/",
            files={"file": ("save_test.mp3", file, "audio/mpeg")},
        )

        assert response.status_code == 200
        upload_dir = Path(settings.UPLOAD_DIR)
        saved_files = list(upload_dir.glob("*save_test.mp3"))
        assert len(saved_files) == 1
        assert saved_files[0].read_bytes() == b"audio content here"


class TestGetUploadStatus:
    def test_get_existing_upload(self, client: TestClient):
        file = io.BytesIO(b"test data")
        upload_resp = client.post(
            "/api/v1/upload/",
            files={"file": ("test.mp3", file, "audio/mpeg")},
        )
        upload_id = upload_resp.json()["id"]

        response = client.get(f"/api/v1/upload/{upload_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == upload_id
        assert data["status"] == "pending"
        assert data["stt_content"] is None
        assert data["summary_content"] is None

    def test_get_nonexistent_upload(self, client: TestClient):
        response = client.get("/api/v1/upload/nonexistent-id")

        assert response.status_code == 404
        assert "찾을 수 없습니다" in response.json()["detail"]

    def test_get_upload_with_stt_result(self, client: TestClient, db_session: Session):
        file = io.BytesIO(b"audio data")
        upload_resp = client.post(
            "/api/v1/upload/",
            files={"file": ("test.mp3", file, "audio/mpeg")},
        )
        upload_id = upload_resp.json()["id"]

        stt = SttResult(upload_id=upload_id, content="변환된 텍스트입니다.")
        db_session.add(stt)
        db_session.commit()

        response = client.get(f"/api/v1/upload/{upload_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["stt_content"] == "변환된 텍스트입니다."
        assert data["summary_content"] is None
