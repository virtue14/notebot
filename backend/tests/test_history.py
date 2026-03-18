import io

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.upload import AiSummary, SttResult, Upload


class TestListHistory:
    def test_empty_history(self, client: TestClient):
        response = client.get("/api/v1/history/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_returns_uploads(self, client: TestClient):
        # 파일 2개 업로드
        client.post("/api/v1/upload/", files={"file": ("a.mp3", io.BytesIO(b"audio"), "audio/mpeg")})
        client.post("/api/v1/upload/", files={"file": ("b.mp3", io.BytesIO(b"audio"), "audio/mpeg")})

        response = client.get("/api/v1/history/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        # 최신순 확인
        assert data[0]["file_name"] == "b.mp3"
        assert data[1]["file_name"] == "a.mp3"

    def test_list_shows_stt_summary_flags(self, client: TestClient, db_session: Session):
        upload_resp = client.post("/api/v1/upload/", files={"file": ("test.mp3", io.BytesIO(b"audio"), "audio/mpeg")})
        upload_id = upload_resp.json()["id"]

        # STT 결과 추가
        stt = SttResult(upload_id=upload_id, content="텍스트")
        db_session.add(stt)
        db_session.commit()

        response = client.get("/api/v1/history/")
        data = response.json()
        assert data[0]["has_stt"] is True
        assert data[0]["has_summary"] is False


class TestGetHistory:
    def test_get_detail(self, client: TestClient, db_session: Session):
        upload_resp = client.post("/api/v1/upload/", files={"file": ("test.mp3", io.BytesIO(b"audio"), "audio/mpeg")})
        upload_id = upload_resp.json()["id"]

        stt = SttResult(upload_id=upload_id, content="변환 텍스트")
        db_session.add(stt)
        db_session.commit()

        summary = AiSummary(upload_id=upload_id, stt_result_id=stt.id, provider="openai", model="gpt-5-mini", content="# 학습 노트")
        db_session.add(summary)
        db_session.commit()

        response = client.get(f"/api/v1/history/{upload_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["file_name"] == "test.mp3"
        assert data["stt_content"] == "변환 텍스트"
        assert data["summary_content"] == "# 학습 노트"
        assert data["summary_provider"] == "openai"
        assert data["summary_model"] == "gpt-5-mini"

    def test_get_nonexistent(self, client: TestClient):
        response = client.get("/api/v1/history/nonexistent")
        assert response.status_code == 404


class TestDeleteHistory:
    def test_delete_success(self, client: TestClient, db_session: Session):
        upload_resp = client.post("/api/v1/upload/", files={"file": ("del.mp3", io.BytesIO(b"audio"), "audio/mpeg")})
        upload_id = upload_resp.json()["id"]

        stt = SttResult(upload_id=upload_id, content="텍스트")
        db_session.add(stt)
        db_session.commit()

        response = client.delete(f"/api/v1/history/{upload_id}")
        assert response.status_code == 204

        # DB에서 삭제 확인
        assert db_session.query(Upload).filter_by(id=upload_id).first() is None
        assert db_session.query(SttResult).filter_by(upload_id=upload_id).first() is None

        # 이력 목록에서도 사라짐
        list_resp = client.get("/api/v1/history/")
        assert len(list_resp.json()) == 0

    def test_delete_nonexistent(self, client: TestClient):
        response = client.delete("/api/v1/history/nonexistent")
        assert response.status_code == 404
