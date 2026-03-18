from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.database import get_db
from app.models.upload import AiSummary, SttResult, Upload
from app.schemas.history import HistoryDetail, HistoryListItem

router = APIRouter(prefix="/api/v1/history", tags=["history"])


@router.get("/", response_model=list[HistoryListItem])
def list_history(db: Session = Depends(get_db)):
    """이력 목록을 최신순으로 조회한다."""
    uploads = (
        db.query(Upload)
        .options(joinedload(Upload.stt_results), joinedload(Upload.ai_summaries))
        .order_by(Upload.created_at.desc())
        .all()
    )
    return [
        HistoryListItem(
            id=u.id,
            file_name=u.file_name,
            mime_type=u.mime_type,
            status=u.status,
            has_stt=len(u.stt_results) > 0,
            has_summary=len(u.ai_summaries) > 0,
            created_at=u.created_at,
        )
        for u in uploads
    ]


@router.get("/{history_id}", response_model=HistoryDetail)
def get_history(history_id: str, db: Session = Depends(get_db)):
    """이력 상세를 조회한다."""
    upload = (
        db.query(Upload)
        .options(joinedload(Upload.stt_results), joinedload(Upload.ai_summaries))
        .filter(Upload.id == history_id)
        .first()
    )
    if not upload:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다.")

    stt = upload.stt_results[0] if upload.stt_results else None
    summary = upload.ai_summaries[0] if upload.ai_summaries else None

    return HistoryDetail(
        id=upload.id,
        file_name=upload.file_name,
        file_size=upload.file_size,
        mime_type=upload.mime_type,
        status=upload.status,
        stt_content=stt.content if stt else None,
        summary_content=summary.content if summary else None,
        summary_provider=summary.provider if summary else None,
        summary_model=summary.model if summary else None,
        created_at=upload.created_at,
    )


@router.delete("/{history_id}", status_code=204)
def delete_history(history_id: str, db: Session = Depends(get_db)):
    """이력과 관련 데이터를 삭제한다."""
    upload = db.query(Upload).filter(Upload.id == history_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="이력을 찾을 수 없습니다.")

    # 물리 파일 삭제
    file_path = Path(upload.file_path).resolve()
    upload_dir = Path(settings.UPLOAD_DIR).resolve()
    if file_path.is_relative_to(upload_dir) and file_path.exists():
        file_path.unlink()

    # 관련 데이터 삭제 (SttResult, AiSummary)
    db.query(AiSummary).filter(AiSummary.upload_id == history_id).delete()
    db.query(SttResult).filter(SttResult.upload_id == history_id).delete()
    db.delete(upload)
    db.commit()
