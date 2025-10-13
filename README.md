# 📚 VocaPDF

영어 단어를 입력하면 AI가 뜻을 찾아 PDF 단어장으로 만들어주는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **CEFR 레벨별 맞춤 정의**: A2~C1 레벨에 맞춘 단어 설명 제공
- **AI 기반 단어 조회**: Google Gemini AI + Oxford Dictionary + Free Dictionary API 연동
- **입력 유형 자동 감지**: 단어, 숙어, 문장 자동 구분 및 처리
- **레이아웃 선택**: 학습용 (예문 포함) / 암기용 (빈칸 채우기)
- **PDF 스타일 선택**: 테이블 형식 / 텍스트 형식
- **파일 업로드 지원**: .txt, .csv 파일 (최대 5MB, 500개 항목)
- **실시간 진행률 표시**: 단어 조회 중 실시간 진행 상황 확인
- **PDF 다운로드**: A4 형식의 깔끔한 단어장

## 🎨 스크린샷

### 메인 화면
단어 입력, CEFR 레벨 선택, 파일 업로드 기능을 제공합니다.

### PDF 미리보기
실시간으로 PDF 미리보기를 확인하고, 테이블/텍스트 형식을 선택할 수 있습니다.

## 🛠️ 기술 스택

**Backend**: Node.js 18+ · Express · Google Gemini 2.0 Flash · Oxford Dictionary API · Free Dictionary API

**Frontend**: React 19 · Vite 7 · shadcn/ui · Tailwind CSS 3 · pdfMake

**UI/UX**: Toss 스타일 디자인 · 반응형 레이아웃 · 실시간 진행률

## 🚀 빠른 시작

### 1. 사전 준비
- Node.js 18 이상
- **Google Gemini API 키** (필수): [발급 받기](https://aistudio.google.com/apikey)
- Oxford Dictionary API 키 (선택): [발급 받기](https://developer.oxforddictionaries.com)

### 2. 설치 및 실행
```bash
# 저장소 클론
git clone https://github.com/bibi-is-typing/vocapdf.git
cd vocapdf

# Backend 설정 및 실행
cd backend
npm install
cp .env.example .env
# .env 파일에 GEMINI_API_KEY 입력 (필수)
# OXFORD_APP_ID, OXFORD_APP_KEY 입력 (선택)
npm run dev  # http://localhost:5001

# Frontend 실행 (새 터미널)
cd frontend
npm install
npm run dev  # http://localhost:5173
```

## 📖 사용 방법

1. **단어 입력**: 텍스트 입력 또는 파일 업로드 (.txt, .csv)
2. **CEFR 레벨 선택**: A2 (초급) ~ C1 (고급)
3. **검색**: AI가 단어 뜻을 찾아줍니다
4. **PDF 옵션 설정**:
   - 출력 형식: 텍스트 형식 / 표 형식
   - 보기 유형: 학습용 (예문 포함) / 암기용 (빈칸)
   - 번호 표시 옵션
   - 학습 날짜 설정
5. **PDF 다운로드**: 나만의 단어장 완성!

## 🏗️ 프로젝트 구조

```
vocapdf/
├── backend/              # Express REST API
│   ├── src/
│   │   ├── services/     # API 통합 (Gemini, Oxford, Free Dictionary)
│   │   ├── routes/       # API 엔드포인트 (dictionary, upload)
│   │   └── utils/        # 유틸리티 (파싱, 감지, 추출)
│   └── .env              # API 키 설정
│
└── frontend/             # React SPA
    ├── src/
    │   ├── components/   # UI 컴포넌트 (shadcn/ui)
    │   │   ├── ui/       # Button, Card, Input, etc.
    │   │   └── PDFPreview.jsx
    │   ├── services/     # API 통신
    │   └── utils/        # PDF 생성 (pdfMake)
    └── App.jsx           # 메인 애플리케이션
```

## 🎯 핵심 기능

### CEFR 레벨별 맞춤 정의
AI가 영어 레벨에 맞춰 단어를 설명합니다:
- **A2**: 기초 어휘로 간단하게
- **B1**: 일상 어휘로 명확하게
- **B2**: 다양한 어휘로 상세하게
- **C1**: 학술 용어로 전문적으로

### 다중 API Fallback 전략
1. **Free Dictionary API** (1차 - 단어만 지원)
   - 무료, rate limit 가능성
   - 영어 정의 제공
2. **Oxford Dictionary API** (2차 - CEFR 레벨 지원)
   - 고품질 영어 정의
   - CEFR 레벨별 정의 제공
   - API 키 필요 (유료, 선택사항)
3. **Google Gemini 2.0 Flash** (3차 - 모두 지원)
   - 단어, 숙어, 문장 모두 지원
   - CEFR 레벨별 맞춤 설명
   - 한국어 번역 제공

### PDF 스타일 옵션
- **텍스트 형식**: 읽기 편한 텍스트 형태 (기본값)
  - [번호] 단어
  - : 의미 (들여쓰기)
  - 500개 항목까지 번호 지원
- **표 형식**: 깔끔한 표 형태로 출력
  - 헤더: No. / Item / Meaning
  - 번호 매기기 옵션
  - 줄무늬 배경 (가독성 향상)

### 레이아웃 옵션
- **학습용**: 단어 + 뜻 + 예문
- **암기용**: 단어 + 빈칸 (시험지 스타일)

## 📝 API 엔드포인트

```bash
# 단어 조회
POST /api/dictionary/lookup
{
  "words": ["apple", "make up for", "How are you?"],
  "options": {
    "cefrLevel": "A2",
    "meanings": 1,
    "definitions": 1,
    "meaningDisplay": "english",
    "outputFormat": "input-order"
  }
}

# 파일 업로드 (최대 5MB, 500개 항목)
POST /api/upload
Content-Type: multipart/form-data
지원 형식: .txt, .csv
```

## 🎨 UI/UX 특징

- **shadcn/ui + Tailwind CSS**: 모던하고 일관된 디자인 시스템
- **Toss 스타일**: 친근하고 직관적인 한국어 UI
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **실시간 피드백**:
  - 진행률 표시 (0% → 90% 시뮬레이션)
  - 검색 후 입력 잠금
  - CEFR 레벨 변경 감지
- **통계 카드**: 입력/검색완료/제외 항목 실시간 표시
- **CEFR 배지**: 레벨별 색상 구분 (A2: 파랑, B1: 초록, B2: 주황, C1: 빨강)

## 🔧 개발 가이드

### 환경 변수 (.env)
```bash
# Backend
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here  # 필수

# Oxford API (선택)
OXFORD_APP_ID=your_oxford_app_id
OXFORD_APP_KEY=your_oxford_app_key
```

### 코딩 컨벤션
- **Backend**: CommonJS (require/module.exports)
- **Frontend**: ES6 Modules (import/export)
- **네이밍**: camelCase (함수/변수), PascalCase (컴포넌트)
- **에러 처리**: try-catch + 일관된 에러 응답
- **Console 로깅**: 프로덕션 코드에서 사용 금지

### 성능 최적화
- API 병렬 처리 (배치 크기 10)
- 재시도 로직 (최대 2회, 500ms 지연)
- 배치 간 500ms 대기 (rate limit 방지)
- 한글 폰트 제거 (번들 크기 ~1.5MB 감소)

## ⚠️ 주의사항

- **macOS**: AirPlay Receiver 포트 충돌 방지 → Backend `.env`에서 `PORT=5001` 설정
- **한글 미지원**: 영어 단어/숙어/문장만 입력 가능 (한글 입력 시 자동 제외)
- **파일 형식**: .txt, .csv만 지원 (.md 미지원)
- **최대 입력**: 500개 항목, 5MB 파일
- **API 제한**:
  - Gemini API: 무료 플랜 일일 요청 제한 (필수)
  - Oxford API: 유료 플랜 필요 (선택 사항)
- **브라우저 호환**: Chrome, Firefox, Safari, Edge (최신 버전)

## 🐛 알려진 이슈 및 제한사항

### 현재 미구현 기능
1. **체크박스 옵션**: 코드에는 존재하지만 UI에서 활성화 불가 (향후 추가 예정)
2. **의미 표시 옵션**: 영어 정의로 고정 (한국어/영어+한국어 선택 불가)

### 제한사항
1. **한글 입력 제한**: 영어만 지원 (한글 입력 시 자동 제외)
2. **Gemini API 제한**: 무료 플랜 일일 요청 제한 (필수 API)
3. **Oxford API 비용**: 유료 플랜 필요 (선택 사항)
4. **macOS 포트 충돌**: AirPlay Receiver (5000번 포트)

## 🔄 버전 히스토리

### v0.3.2 (2025-01-13)
- **빌드 수정**: 테이블 형식 PDF 생성 기능 통합
- **README 업데이트**: 실제 지원 기능과 문서 일치

### v0.3.1 (2025-01-13)
- **텍스트 PDF 출력 개선**: 행간, 들여쓰기, 넘버링 공간 최적화
- **UI 일관성**: 통계 카드, CEFR 배지 디자인 개선
- **검색 후 입력 잠금**: 재입력 방지

### v0.3.0 (2025-01-11)
- **shadcn/ui + Tailwind CSS**: UI 라이브러리 전환
- **pdfMake**: PDF 생성 라이브러리 변경
- **Gemini 2.0 Flash + Oxford API**: 다중 API 통합
- **PDF 스타일 옵션**: 테이블/텍스트 형식 선택

### v0.2.0
- Lingua Robot API 추가 (→ 제거됨)

### v0.1.0
- Free Dictionary API 기반 첫 버전

## 🤝 기여하기

오픈소스 기여를 환영합니다!

### 기여 가능한 영역
- **기능 개선**: 체크박스 옵션 UI 추가, 의미 표시 옵션 UI 추가
- **파일 형식**: .md 파일 파서 구현
- **번역**: 다국어 지원 (영어 UI)
- **테스트**: 단위 테스트, E2E 테스트 작성
- **문서**: API 문서, 개발 가이드 개선
- **버그 수정**: [Issues](https://github.com/bibi-is-typing/vocapdf/issues) 확인

### 기여 방법
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스 & 연락처

**라이선스**: MIT

**버그 리포트**: [Issues](https://github.com/bibi-is-typing/vocapdf/issues)에 등록해주세요

**개발**: Made with ❤️ by [@bibi-is-typing](https://github.com/bibi-is-typing)

**상세 문서**: 프로젝트 구조와 개발 가이드는 [`CLAUDE.md`](./CLAUDE.md) 참조

## 🙏 참고 자료

- [Google Gemini API](https://ai.google.dev/)
- [Oxford Dictionaries API](https://developer.oxforddictionaries.com/)
- [Free Dictionary API](https://dictionaryapi.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [pdfMake](http://pdfmake.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: 교육 목적 프로젝트입니다. 상업적 사용 시 각 API 정책을 확인하세요.
