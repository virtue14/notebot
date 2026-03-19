import pytest
from pathlib import Path
from unittest.mock import patch


class TestReadFileContent:
    def test_read_text_file(self, tmp_path: Path):
        from app.services.file_reader import read_file_content

        txt = tmp_path / "test.txt"
        txt.write_text("테스트 내용입니다.", encoding="utf-8")

        with patch("app.services.file_reader.settings") as mock_settings:
            mock_settings.UPLOAD_DIR = str(tmp_path)
            result = read_file_content(str(txt), "text/plain")

        assert result == "테스트 내용입니다."

    def test_read_pdf_file(self, tmp_path: Path):
        from app.services.file_reader import read_file_content
        from pypdf import PdfWriter

        pdf_path = tmp_path / "test.pdf"
        writer = PdfWriter()
        writer.add_blank_page(width=200, height=200)
        with open(pdf_path, "wb") as f:
            writer.write(f)

        with patch("app.services.file_reader.settings") as mock_settings:
            mock_settings.UPLOAD_DIR = str(tmp_path)
            with pytest.raises(ValueError, match="스캔된 이미지 PDF는 지원하지 않아요"):
                read_file_content(str(pdf_path), "application/pdf")

    def test_file_not_found(self, tmp_path: Path):
        from app.services.file_reader import read_file_content

        with patch("app.services.file_reader.settings") as mock_settings:
            mock_settings.UPLOAD_DIR = str(tmp_path)
            with pytest.raises(FileNotFoundError, match="파일을 찾을 수 없습니다."):
                read_file_content(str(tmp_path / "nonexistent.txt"), "text/plain")

    def test_unsupported_mime_type(self, tmp_path: Path):
        from app.services.file_reader import read_file_content

        f = tmp_path / "test.bin"
        f.write_bytes(b"binary data")

        with patch("app.services.file_reader.settings") as mock_settings:
            mock_settings.UPLOAD_DIR = str(tmp_path)
            with pytest.raises(ValueError, match="지원하지 않는 파일 타입"):
                read_file_content(str(f), "application/octet-stream")

    def test_path_traversal_blocked(self, tmp_path: Path):
        from app.services.file_reader import read_file_content

        outside_file = tmp_path / "outside.txt"
        outside_file.write_text("외부 파일", encoding="utf-8")

        with patch("app.services.file_reader.settings") as mock_settings:
            mock_settings.UPLOAD_DIR = str(tmp_path / "uploads")
            with pytest.raises(ValueError, match="허용되지 않는 파일 경로"):
                read_file_content(str(outside_file), "text/plain")

    def test_unicode_decode_error(self, tmp_path: Path):
        from app.services.file_reader import read_file_content

        f = tmp_path / "bad.txt"
        f.write_bytes(b"\xff\xfe\x00\x80\x81")

        with patch("app.services.file_reader.settings") as mock_settings:
            mock_settings.UPLOAD_DIR = str(tmp_path)
            with pytest.raises(ValueError, match="UTF-8 인코딩 파일을 사용해주세요"):
                read_file_content(str(f), "text/plain")

    def test_text_size_truncated(self, tmp_path: Path):
        from app.services.file_reader import read_file_content, MAX_TEXT_SIZE

        f = tmp_path / "large.txt"
        f.write_text("A" * (MAX_TEXT_SIZE + 1000), encoding="utf-8")

        with patch("app.services.file_reader.settings") as mock_settings:
            mock_settings.UPLOAD_DIR = str(tmp_path)
            result = read_file_content(str(f), "text/plain")

        assert len(result) == MAX_TEXT_SIZE
