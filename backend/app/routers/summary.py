from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.summary import SummaryRequest, SummaryResponse
from app.services.llm.base import LLMAuthError, LLMAPIError
from app.services.summary import run_summary

router = APIRouter(prefix="/api/v1/summary", tags=["summary"])


@router.post("/", response_model=SummaryResponse)
async def create_summary(req: SummaryRequest, db: Session = Depends(get_db)):
    """STT 결과를 LLM으로 요약하여 학습 노트를 생성한다."""
    try:
        summary = await run_summary(
            upload_id=req.upload_id,
            provider=req.provider.value,
            model=req.model,
            api_key=req.api_key,
            db=db,
        )
        return summary
    except ValueError as e:
        status = 404 if "찾을 수 없습니다" in str(e) or "없습니다" in str(e) else 400
        raise HTTPException(status_code=status, detail=str(e))
    except LLMAuthError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except LLMAPIError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
