# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-01-11

### Added
- **CEFR 레벨별 맞춤 정의**: A2~C1 레벨에 맞춘 단어 설명 제공
- **Google Gemini 2.0 Flash 통합**: AI 기반 번역 및 정의 생성
  - Lingua Robot API 대체 (무료 API 사용)
  - 숙어와 문장 번역 지원
  - CEFR 레벨에 맞춘 설명 생성
- **Oxford Dictionary API 통합**: 고품질 영어 사전 데이터 (선택적)
- **shadcn/ui + Tailwind CSS**: 모던한 UI 컴포넌트 라이브러리
  - 재사용 가능한 Button, Card, Input, Select, Alert 컴포넌트
  - 반응형 디자인 및 다크 모드 대응
  - Toss 스타일의 친근한 한국어 UI
- **실시간 진행률 표시**: 단어 조회 중 퍼센트 기반 진행 상황 확인
- **레이아웃 옵션**: 학습용 (예문 포함) / 암기용 (빈칸 채우기)
- **한글 입력 검증**: 한글 입력 시 사용자 친화적 에러 메시지 표시
- **파일 재업로드 지원**: 파일 input 초기화로 같은 파일 재업로드 가능

### Changed
- **API 우선순위 변경**: Free Dictionary → Oxford → Gemini 순서로 변경
- **프론트엔드 UI 전면 개편**: shadcn/ui 기반 컴포넌트로 마이그레이션
- **PDF 테이블 스타일 개선**: 테두리 가시성 향상 (theme: 'grid')
- **폰트 시스템 개선**: Google Fonts (Poppins, Roboto Mono) 적용

### Removed
- **Lingua Robot API 의존성 제거**: Gemini API로 완전 대체
- **한국어 폰트 파일 제거**: NotoSansKR, Pretendard 폰트 삭제
  - 한글 지원 중단 (영어 전용 앱으로 전환)
  - 폰트 파일로 인한 번들 크기 감소 (~1.5MB)
- **사용하지 않는 console.log 제거**: ~40개 이상의 디버그 로그 정리
- **Dead code 제거**: 사용하지 않는 함수 및 import 정리

### Fixed
- **입력 파싱 로직 개선**: 쉼표가 포함된 문장 보호
- **파일 input 리셋 버그 수정**: 같은 파일 재업로드 가능하도록 수정
- **PDF 테이블 테두리 표시 개선**: 셀 경계선 가시성 향상

### Documentation
- README.md 최신 기술 스택 및 기능 반영
- CHANGELOG.md 상세한 변경 내역 작성
- CLAUDE.md 프로젝트 메모리 업데이트
- .env.example 최신 API 키 정보 반영

---

## [0.2.0] - 2025-01-10

### Added
- **입력 유형 확장**: 단어, 숙어, 문장 자동 감지 및 처리
- **Lingua Robot API 통합**: 빠르고 정확한 사전 조회
  - Free Dictionary API fallback 지원
  - 숙어 및 문장 지원
- **의미 표시 옵션**: 영영 뜻만 / 한영 뜻만 / 영영+한영 선택 가능
- **출력 형식 옵션**: 통합 형식 / 분류 형식 (단어/숙어/문장 별도 섹션)
- **다중 의미 지원**: 한 단어의 여러 의미를 모두 표시

### Changed
- 백엔드 아키텍처 개선: 모듈화된 서비스 구조
- API 재시도 로직 강화: 최대 2회 재시도, 500ms 지연

---

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
- 단어 즐겨찾기 기능
- 학습 히스토리 저장
- 다크 모드 완전 지원
- 발음 기호 표시 개선
- 예문 추가 옵션
- PWA 지원 (오프라인 사용)
- 사용자 계정 시스템
- 단어장 공유 기능
