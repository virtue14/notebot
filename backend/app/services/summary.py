import logging

from sqlalchemy.orm import Session

from app.models.upload import AiSummary, SttResult, Upload
from app.prompts.summary import SUMMARY_SYSTEM_PROMPT, build_user_prompt
from app.services.llm import create_provider

logger = logging.getLogger(__name__)


async def run_summary(
    upload_id: str,
    provider: str,
    model: str,
    api_key: str,
    db: Session,
) -> AiSummary:
    """STT 결과를 조회하고 LLM으로 요약한 뒤 DB에 저장한다."""
    upload = db.query(Upload).filter(Upload.id == upload_id).first()
    if not upload:
        raise ValueError("업로드를 찾을 수 없습니다.")

    stt_result = (
        db.query(SttResult).filter(SttResult.upload_id == upload_id).first()
    )
    if not stt_result:
        raise ValueError("STT 변환 결과가 없습니다. 먼저 STT 변환을 완료해주세요.")

    llm = create_provider(provider, api_key, model)
    user_prompt = build_user_prompt(stt_result.content)
    content = await llm.generate(SUMMARY_SYSTEM_PROMPT, user_prompt)

    if not content.strip():
        raise RuntimeError("AI 서비스에서 빈 응답을 반환했습니다.")

    summary = AiSummary(
        upload_id=upload_id,
        stt_result_id=stt_result.id,
        provider=provider,
        model=model,
        content=content,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    return summary
