import logging
import threading

from faster_whisper import WhisperModel

from app.config import settings
from app.database import SessionLocal
from app.models.upload import SttResult, Upload

logger = logging.getLogger(__name__)

_model: WhisperModel | None = None
_model_lock = threading.Lock()


def get_model() -> WhisperModel:
    """WhisperModel 싱글턴을 반환한다 (lazy loading, thread-safe)."""
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = WhisperModel(
                    settings.WHISPER_MODEL,
                    device=settings.WHISPER_DEVICE,
                    compute_type="int8",
                )
    return _model


def transcribe_file(file_path: str) -> str:
    """파일 경로를 받아 STT 변환 텍스트를 반환한다."""
    model = get_model()
    segments, _ = model.transcribe(file_path, beam_size=5)
    text = " ".join(segment.text.strip() for segment in segments)
    if not text.strip():
        raise ValueError("STT 변환 결과가 비어 있습니다.")
    return text


def run_stt_task(upload_id: str) -> None:
    """백그라운드에서 STT 변환을 수행한다."""
    db = SessionLocal()
    try:
        upload = db.query(Upload).filter(Upload.id == upload_id).first()
        if not upload:
            logger.error("Upload를 찾을 수 없습니다: %s", upload_id)
            return

        upload.status = "processing"
        db.commit()

        text = transcribe_file(upload.file_path)

        stt_result = SttResult(upload_id=upload_id, content=text)
        db.add(stt_result)
        upload.status = "completed"
        db.commit()

        logger.info("STT 변환 완료: %s", upload_id)
    except Exception:
        logger.exception("STT 변환 실패: %s", upload_id)
        db.rollback()
        upload = db.query(Upload).filter(Upload.id == upload_id).first()
        if upload:
            upload.status = "failed"
            db.commit()
    finally:
        db.close()
