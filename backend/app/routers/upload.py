import fnmatch
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.database import get_db
from app.models.upload import AiSummary, SttResult, Upload
from app.schemas.upload import UploadResponse, UploadStatusResponse

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])


def _is_allowed_mime(mime_type: str) -> bool:
    """MIME 타입이 허용 목록에 포함되는지 와일드카드 패턴으로 검사한다."""
    return any(
        fnmatch.fnmatch(mime_type, pattern)
        for pattern in settings.ALLOWED_MIME_TYPES
    )


def _is_stt_target(mime_type: str) -> bool:
    """오디오 또는 비디오 MIME 타입인지 확인한다."""
    return mime_type.startswith("audio/") or mime_type.startswith("video/")


@router.post("/", response_model=UploadResponse)
async def upload_file(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """파일을 업로드하고 메타데이터를 DB에 저장한다."""
    if not file.content_type or not _is_allowed_mime(file.content_type):
        raise HTTPException(
            status_code=400,
            detail=f"허용되지 않는 파일 타입입니다: {file.content_type}",
        )

    chunks = []
    total_size = 0
    chunk_size = 1024 * 1024  # 1MB

    while chunk := await file.read(chunk_size):
        total_size += len(chunk)
        if total_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"파일 크기가 {settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB를 초과합니다.",
            )
        chunks.append(chunk)

    content = b"".join(chunks)

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_uuid = uuid.uuid4()
    original_filename = file.filename or "unnamed"
    saved_name = f"{file_uuid}_{original_filename}"
    file_path = upload_dir / saved_name
    file_path.write_bytes(content)

    upload = Upload(
        file_name=original_filename,
        file_path=str(file_path),
        file_size=len(content),
        mime_type=file.content_type,
        status="pending",
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    if _is_stt_target(upload.mime_type):
        from app.services.stt import run_stt_task

        background_tasks.add_task(run_stt_task, upload.id)

    return upload


@router.get("/{file_id}", response_model=UploadStatusResponse)
def get_upload_status(file_id: str, db: Session = Depends(get_db)):
    """업로드 ID로 변환 상태와 결과를 조회한다."""
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
