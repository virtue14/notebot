import logging

from sqlalchemy.orm import Session

from app.models.upload import AiSummary, SttResult, Upload
from app.prompts.summary import build_system_prompt, build_user_prompt
from app.services.file_reader import read_file_content
from app.services.llm import create_provider

logger = logging.getLogger(__name__)


def _extract_text(upload: Upload, db: Session) -> tuple[str, str | None, bool]:
    """업로드에서 텍스트를 추출한다. (텍스트, stt_result_id, is_stt) 반환."""
    stt_result = (
        db.query(SttResult).filter(SttResult.upload_id == upload.id).first()
    )
    if stt_result:
        return stt_result.content, stt_result.id, True
    return read_file_content(upload.file_path, upload.mime_type), None, False


async def run_summary(
    upload_ids: list[str],
    provider: str,
    model: str,
    api_key: str,
    db: Session,
) -> AiSummary:
    """업로드 파일들의 텍스트를 합산하여 LLM으로 학습 노트를 생성한다."""
    texts: list[str] = []
    first_stt_result_id: str | None = None
    has_stt = False

    for upload_id in upload_ids:
        upload = db.query(Upload).filter(Upload.id == upload_id).first()
        if not upload:
            raise ValueError(f"업로드를 찾을 수 없습니다: {upload_id}")

        logger.info("텍스트 추출: id=%s file=%s mime=%s", upload.id, upload.file_name, upload.mime_type)
        text, stt_result_id, is_stt = _extract_text(upload, db)
        logger.info("텍스트 추출 완료: len=%d is_stt=%s", len(text), is_stt)
        texts.append(text)

        if is_stt:
            has_stt = True
        if stt_result_id and not first_stt_result_id:
            first_stt_result_id = stt_result_id

    source_text = "\n\n---\n\n".join(texts)
    logger.info("합산 텍스트: total_len=%d files=%d", len(source_text), len(texts))

    llm = create_provider(provider, api_key, model)
    system_prompt = build_system_prompt(has_stt)
    user_prompt = build_user_prompt(source_text, has_stt)
    logger.info("LLM 요청: provider=%s model=%s prompt_len=%d", provider, model, len(user_prompt))
    content = await llm.generate(system_prompt, user_prompt)
    logger.info("LLM 응답: content_len=%d", len(content))

    if not content.strip():
        raise RuntimeError("AI 서비스에서 빈 응답을 반환했습니다.")

    # 첫 번째 upload_id를 대표로 저장
    summary = AiSummary(
        upload_id=upload_ids[0],
        stt_result_id=first_stt_result_id,
        provider=provider,
        model=model,
        content=content,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    return summary
