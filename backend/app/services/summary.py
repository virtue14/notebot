import logging

from sqlalchemy.orm import Session

from app.models.upload import AiSummary, SttResult, Upload
from app.prompts.summary import SUMMARY_SYSTEM_PROMPT, build_user_prompt
from app.services.file_reader import read_file_content
from app.services.llm import create_provider

logger = logging.getLogger(__name__)


async def run_summary(
    upload_id: str,
    provider: str,
    model: str,
    api_key: str,
    db: Session,
) -> AiSummary:
    """업로드 파일의 텍스트를 LLM으로 요약한다."""
    upload = db.query(Upload).filter(Upload.id == upload_id).first()
    if not upload:
        raise ValueError("업로드를 찾을 수 없습니다.")

    # STT 결과가 있으면 사용, 없으면 파일에서 직접 추출
    stt_result = (
        db.query(SttResult).filter(SttResult.upload_id == upload_id).first()
    )

    if stt_result:
        source_text = stt_result.content
        stt_result_id = stt_result.id
    else:
        source_text = read_file_content(upload.file_path, upload.mime_type)
        stt_result_id = None

    llm = create_provider(provider, api_key, model)
    user_prompt = build_user_prompt(source_text)
    content = await llm.generate(SUMMARY_SYSTEM_PROMPT, user_prompt)

    if not content.strip():
        raise RuntimeError("AI 서비스에서 빈 응답을 반환했습니다.")

    summary = AiSummary(
        upload_id=upload_id,
        stt_result_id=stt_result_id,
        provider=provider,
        model=model,
        content=content,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    return summary
