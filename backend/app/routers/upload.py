import fnmatch
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.database import get_db
from app.models.upload import AiSummary, SttResult, Upload
from app.schemas.upload import UploadResponse, UploadStatusResponse

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])


def _is_allowed_mime(mime_type: str) -> bool:
    return any(
        fnmatch.fnmatch(mime_type, pattern)
        for pattern in settings.ALLOWED_MIME_TYPES
    )


@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile, db: Session = Depends(get_db)):
    if not file.content_type or not _is_allowed_mime(file.content_type):
        raise HTTPException(
            status_code=400,
            detail=f"허용되지 않는 파일 타입입니다: {file.content_type}",
        )

    content = await file.read()

    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"파일 크기가 {settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB를 초과합니다.",
        )

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_uuid = uuid.uuid4()
    saved_name = f"{file_uuid}_{file.filename}"
    file_path = upload_dir / saved_name
    file_path.write_bytes(content)

    upload = Upload(
        file_name=file.filename,
        file_path=str(file_path),
        file_size=len(content),
        mime_type=file.content_type,
        status="pending",
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    return upload


@router.get("/{file_id}", response_model=UploadStatusResponse)
def get_upload_status(file_id: str, db: Session = Depends(get_db)):
    upload = (
        db.query(Upload)
        .options(joinedload(Upload.stt_results), joinedload(Upload.ai_summaries))
        .filter(Upload.id == file_id)
        .first()
    )

    if not upload:
        raise HTTPException(status_code=404, detail="업로드를 찾을 수 없습니다.")

    stt_content = upload.stt_results[0].content if upload.stt_results else None
    summary_content = upload.ai_summaries[0].content if upload.ai_summaries else None

    return UploadStatusResponse(
        id=upload.id,
        status=upload.status,
        stt_content=stt_content,
        summary_content=summary_content,
    )
