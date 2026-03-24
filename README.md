# Notebot

[![Release](https://img.shields.io/github/v/release/virtue14/notebot)](https://github.com/virtue14/notebot/releases/latest)

강의 녹음, 교재 PDF 등을 업로드하면 텍스트로 변환하고 구조화된 학습 노트를 자동 생성하는 웹 서비스.

## 누구를 위한 서비스인가

- 강의를 수강하는 대학생
- 시험/자격증을 준비하는 수험생

## 주요 기능

### STT 변환
음성/영상 파일(mp3, mp4 등)을 텍스트로 변환한다. faster-whisper 기반으로 로컬에서 처리하며, 한국어 베이스에 영어 전문 용어가 섞인 강의도 인식한다.

### AI 학습 노트 생성
텍스트/PDF 파일을 업로드하면 체계적인 마크다운 학습 노트를 생성한다. 서론, 구조도(mermaid), 정의/설명/예시 3단 구성, 비교표, 용어표, 요약까지 포함된다. 최대 10개 파일을 동시에 올려 하나의 노트로 합산할 수 있다.

### 멀티 프로바이더 LLM
OpenAI, Anthropic, Gemini 중 선택 가능. 사용자가 직접 API 키를 입력하며, 키는 서버에 저장되지 않는다. Gemini 무료 모델(2.5 Flash/Pro)도 지원한다.

### 변환 기록
이력 목록에서 이전 변환 결과를 확인하고, 상세 페이지에서 학습 노트/STT 원문을 다시 볼 수 있다. MD/PDF 다운로드를 지원한다.

## 기술 스택

<details>
<summary><b>v1 — MVP (FastAPI + Next.js)</b></summary>

| 영역 | 기술 |
|---|---|
| Frontend | Next.js (App Router), TypeScript, TailwindCSS v4, Radix UI |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| STT | faster-whisper (CTranslate2) |
| LLM | OpenAI SDK, Anthropic SDK, google-genai SDK |
| DB | SQLite |
| 마크다운 렌더링 | markdown-it, highlight.js, mermaid, DOMPurify |

### 프로젝트 구조

```
notebot/
├── frontend/                # Next.js 프론트엔드
│   └── src/
│       ├── app/             # 페이지 (App Router)
│       │   ├── stt/         # STT 변환 페이지
│       │   ├── stt-summary/ # 학습 노트 생성 페이지
│       │   └── history/     # 변환 기록 페이지
│       ├── components/      # 공통 컴포넌트
│       └── hooks/           # 커스텀 훅
└── backend/                 # FastAPI 백엔드
    └── app/
        ├── routers/         # API 라우터
        ├── services/        # 비즈니스 로직 (STT, LLM, 파일 리더)
        ├── models/          # SQLAlchemy 모델
        ├── schemas/         # Pydantic 스키마
        └── prompts/         # LLM 프롬프트
```

### 실행 방법

**Backend**

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:3000`에서 접속.

</details>
