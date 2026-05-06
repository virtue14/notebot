# Changelog

## [1.1.0](https://github.com/virtue14/notebot/compare/notebot-backend-v1.0.0...notebot-backend-v1.1.0) (2026-05-06)


### Features

* **backend:** 업로드 확장자 화이트리스트 도입 및 .webm 지원 ([24d5d95](https://github.com/virtue14/notebot/commit/24d5d95a1e796ab15548bbccb0b28e0ff69d2671))
* Gemini 무료 API 안내 및 rate limit 에러 핸들링 ([#43](https://github.com/virtue14/notebot/issues/43)) ([c7cce32](https://github.com/virtue14/notebot/commit/c7cce324caed8fa0149fbcee96b754ce4aaed25f)), closes [#39](https://github.com/virtue14/notebot/issues/39)
* 이력 관리 CRUD API 구현 ([#36](https://github.com/virtue14/notebot/issues/36)) ([f98d084](https://github.com/virtue14/notebot/commit/f98d084a56ebbc64065dc29ee43332a81d9159b9)), closes [#22](https://github.com/virtue14/notebot/issues/22)
* 프롬프트 엔지니어링 및 마크다운 렌더러 개선 ([#51](https://github.com/virtue14/notebot/issues/51)) ([960d0df](https://github.com/virtue14/notebot/commit/960d0df368173e148aaeea87defc3bf4abe6ba40))


### Bug Fixes

* API 응답 datetime에 UTC 타임존 명시 ([#53](https://github.com/virtue14/notebot/issues/53)) ([c2b5bd5](https://github.com/virtue14/notebot/commit/c2b5bd50caa1ec0c67af6c00700c5f72ea800557)), closes [#50](https://github.com/virtue14/notebot/issues/50)
* Gemini 모델 목록에 2.5 무료 모델 추가 ([#46](https://github.com/virtue14/notebot/issues/46)) ([3849159](https://github.com/virtue14/notebot/commit/3849159b0d61ad9386baf5be0dfb675e3d4a6895)), closes [#39](https://github.com/virtue14/notebot/issues/39)
* PDF/텍스트 파일 요약 시 STT 결과 의존 제거 ([#42](https://github.com/virtue14/notebot/issues/42)) ([b7ef579](https://github.com/virtue14/notebot/commit/b7ef5796ebb2775179bc183cd4d6cc248c174c93)), closes [#38](https://github.com/virtue14/notebot/issues/38)
