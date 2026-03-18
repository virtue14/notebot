import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_uuid() -> str:
    return str(uuid.uuid4())


class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    file_name: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_size: Mapped[int] = mapped_column(Integer)
    mime_type: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    stt_results: Mapped[list["SttResult"]] = relationship(back_populates="upload")
    ai_summaries: Mapped[list["AiSummary"]] = relationship(back_populates="upload")


class SttResult(Base):
    __tablename__ = "stt_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    upload_id: Mapped[str] = mapped_column(ForeignKey("uploads.id"))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    upload: Mapped["Upload"] = relationship(back_populates="stt_results")


class AiSummary(Base):
    __tablename__ = "ai_summaries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    upload_id: Mapped[str] = mapped_column(ForeignKey("uploads.id"))
    stt_result_id: Mapped[str | None] = mapped_column(
        ForeignKey("stt_results.id"), nullable=True
    )
    provider: Mapped[str] = mapped_column(String(20))
    model: Mapped[str] = mapped_column(String(50))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    upload: Mapped["Upload"] = relationship(back_populates="ai_summaries")
