import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.summary import SummaryRequest, SummaryResponse
from app.services.llm.base import LLMAuthError, LLMAPIError, LLMRateLimitError
from app.services.summary import run_summary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/summary", tags=["summary"])


@router.post("/", response_model=SummaryResponse)
async def create_summary(req: SummaryRequest, db: Session = Depends(get_db)):
    """업로드 파일들을 LLM으로 요약하여 학습 노트를 생성한다."""
    logger.info("요약 요청: upload_ids=%s provider=%s model=%s", req.upload_ids, req.provider, req.model)
    try:
        summary = await run_summary(
            upload_ids=req.upload_ids,
            provider=req.provider.value,
            model=req.model,
            api_key=req.api_key,
            db=db,
        )
        logger.info("요약 완료: id=%s content_len=%d", summary.id, len(summary.content))
        return summary
    except ValueError as e:
        logger.warning("요약 실패 (ValueError): %s", e)
        status = 404 if "찾을 수 없습니다" in str(e) or "없습니다" in str(e) else 400
        raise HTTPException(status_code=status, detail=str(e))
    except LLMRateLimitError as e:
        logger.warning("요약 실패 (RateLimit): %s", e)
        raise HTTPException(status_code=429, detail=str(e))
    except LLMAuthError as e:
        logger.warning("요약 실패 (Auth): %s", e)
        raise HTTPException(status_code=401, detail=str(e))
    except LLMAPIError as e:
        logger.error("요약 실패 (LLMAPIError): %s", e)
        raise HTTPException(status_code=502, detail=str(e))
    except RuntimeError as e:
        logger.error("요약 실패 (RuntimeError): %s", e)
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.exception("요약 실패 (예상치 못한 오류): %s", e)
        raise HTTPException(status_code=500, detail="서버 오류가 발생했습니다.")
