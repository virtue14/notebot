import tempfile
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app


@pytest.fixture()
def db_session(tmp_path: Path) -> Generator[Session, None, None]:
    """테스트용 임시 SQLite DB 세션을 생성한다."""
    db_url = f"sqlite:///{tmp_path / 'test.db'}"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def _enable_fk(dbapi_connection, _):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session: Session, tmp_path: Path) -> Generator[TestClient, None, None]:
    """테스트용 FastAPI TestClient를 생성한다."""
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()

    def _override_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_db

    from app.config import settings
    original_upload_dir = settings.UPLOAD_DIR
    settings.UPLOAD_DIR = str(upload_dir)

    with TestClient(app) as c:
        yield c

    settings.UPLOAD_DIR = original_upload_dir
    app.dependency_overrides.clear()
