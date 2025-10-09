# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-09

### Added
- 초기 MVP 버전 릴리스
- Free Dictionary API를 통한 영어 단어 조회 기능
- 단어 파일 업로드 기능 (.txt, .csv, .md 지원)
- 맞춤형 옵션 설정 (의미, 영영뜻, 유의어, 반의어, 관계어)
- PDF 단어장 생성 및 다운로드 기능
- 다의어(Polysemy) 처리 - rowSpan을 사용한 테이블 병합
- 로딩 스피너 및 진행 상태 표시
- 성공/에러 메시지 알림
- 체크박스 및 날짜 표시 옵션
- API 재시도 로직 (최대 2회, 500ms 지연)
- 포괄적인 에러 처리

### Backend
- Express.js REST API 서버
- `/api/dictionary/lookup` - 단어 조회 엔드포인트
- `/api/upload` - 파일 업로드 엔드포인트
- Multer를 통한 파일 처리
- 일관된 에러 응답 형식

### Frontend
- React 19 + Vite
- jsPDF를 사용한 클라이언트 사이드 PDF 생성
- 반응형 UI 디자인
- 실시간 단어 개수 카운팅
- 결과 미리보기

### Documentation
- 상세한 README.md
- API 명세 문서
- 프로젝트 구조 문서
- 의미 처리 가이드

### Known Issues
- PDF 한글 폰트 미지원 (ASCII 문자로 표시)
- macOS에서 포트 5000 충돌 (AirPlay Receiver)
- Free Dictionary API rate limit 가능성

---

## [Unreleased]

### Planned Features
- 한글 폰트 지원
- 단어 즐겨찾기 기능
- 학습 히스토리 저장
- 다크 모드 완전 지원
- 다국어 지원
- 발음 기호 표시
- 예문 추가 옵션
