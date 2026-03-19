"""
@file file_reader.py
@description 파일 경로와 MIME 타입으로 텍스트 내용을 추출하는 서비스.
"""

import logging
from pathlib import Path

from pypdf import PdfReader

from app.config import settings

logger = logging.getLogger(__name__)

MAX_TEXT_SIZE = 500 * 1024  # 500KB


def read_file_content(file_path: str, mime_type: str) -> str:
    """파일 경로와 MIME 타입으로 텍스트 내용을 추출한다."""
    path = Path(file_path).resolve()
    upload_dir = Path(settings.UPLOAD_DIR).resolve()
    if not path.is_relative_to(upload_dir):
        raise ValueError("허용되지 않는 파일 경로입니다.")

    if not path.exists():
        logger.error("파일을 찾을 수 없습니다: %s", file_path)
        raise FileNotFoundError("파일을 찾을 수 없습니다.")

    if mime_type == "text/plain":
        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            raise ValueError("텍스트 파일을 읽을 수 없어요. UTF-8 인코딩 파일을 사용해주세요.")
        if len(content) > MAX_TEXT_SIZE:
            content = content[:MAX_TEXT_SIZE]
        return content

    if mime_type == "application/pdf":
        reader = PdfReader(path)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        if not text.strip():
            raise ValueError("PDF에서 텍스트를 찾을 수 없어요. 스캔된 이미지 PDF는 지원하지 않아요.")
        if len(text) > MAX_TEXT_SIZE:
            text = text[:MAX_TEXT_SIZE]
        return text

    raise ValueError(f"지원하지 않는 파일 타입입니다: {mime_type}")
