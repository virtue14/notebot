# Notebot

강의 녹음, 교재 PDF 등을 업로드하면 텍스트로 변환하고 구조화된 학습 노트를 자동 생성하는 웹 서비스.

## 누구를 위한 서비스인가

- 강의를 수강하는 대학생
- 시험/자격증을 준비하는 수험생

## 주요 기능

### STT 변환
mp3, mp4 등 미디어 파일의 음성을 텍스트로 변환한다. 한국어 베이스에 영어 전문 용어(의학, IT 등)가 섞인 강의도 정확하게 인식한다.

### AI 학습 노트 생성
단순 요약이 아니라, 전체 내용을 파악해서 논리적인 목차를 구성하고 내용을 재배치한다. 여러 파일을 동시에 올리면 교차 분석해서 하나의 노트로 만들어준다. 결과물은 마크다운(.md) 형식.

## 기술 스택 (v1-mvp)

| 영역 | 기술 |
|---|---|
| Frontend | Next.js, TypeScript, TailwindCSS |
| Backend | FastAPI (Python) |
| STT | OpenAI Whisper (로컬) |
| DB | SQLite |

## 프로젝트 구조

```
notebot/
├── frontend/          # Next.js 프론트엔드
└── backend/           # FastAPI 백엔드
```

## 실행 방법

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:3000`에서 접속.

## 향후 계획

- v2: Spring Boot 도입으로 비즈니스 로직 분리, Python은 STT 전담 마이크로서비스로 축소
- v3: 다중 사용자 지원 (Spring Security, Redis)
