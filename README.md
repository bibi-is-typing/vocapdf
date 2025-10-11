# 📚 VocaPDF

영어 단어를 입력하면 AI가 뜻을 찾아 PDF 단어장으로 만들어주는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **CEFR 레벨별 맞춤 정의**: A2~C1 레벨에 맞춘 단어 설명 제공
- **AI 기반 단어 조회**: Google Gemini AI + Oxford Dictionary + Free Dictionary API 연동
- **입력 유형 자동 감지**: 단어, 숙어, 문장 자동 구분 및 처리
- **레이아웃 선택**: 학습용 (예문 포함) / 암기용 (빈칸 채우기)
- **파일 업로드 지원**: .txt, .csv, .md 파일 (최대 5MB, 500개 항목)
- **실시간 진행률 표시**: 단어 조회 중 실시간 진행 상황 확인
- **PDF 다운로드**: A4 형식의 깔끔한 단어장

## 🛠️ 기술 스택

**Backend**: Node.js 18+ · Express · Google Gemini 2.0 Flash · Oxford Dictionary API · Free Dictionary API

**Frontend**: React 19 · Vite 7 · shadcn/ui · Tailwind CSS 3 · jsPDF

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
# .env 파일에 GEMINI_API_KEY 입력
npm run dev  # http://localhost:5001

# Frontend 실행 (새 터미널)
cd frontend
npm install
npm run dev  # http://localhost:5173
```

## 📖 사용 방법

1. **단어 입력**: 텍스트 입력 또는 파일 업로드 (.txt, .csv, .md)
2. **CEFR 레벨 선택**: A2 (초급) ~ C1 (고급)
3. **검색**: AI가 단어 뜻을 찾아줍니다
4. **레이아웃 선택**: 학습용 (예문 포함) / 암기용 (빈칸)
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
    │   ├── services/     # API 통신
    │   └── utils/        # PDF 생성
    └── App.jsx           # 메인 애플리케이션
```

## 🎯 핵심 기능

### CEFR 레벨별 맞춤 정의
AI가 영어 레벨에 맞춰 단어를 설명합니다:
- **A2**: 기초 어휘로 간단하게
- **B1**: 일상 어휘로 명확하게
- **B2**: 다양한 어휘로 상세하게
- **C1**: 학술 용어로 전문적으로

### 다중 API Fallback
1. Free Dictionary API (무료, 1차 - 단어만 지원)
2. Oxford Dictionary API (고품질, 2차 - CEFR 레벨 지원, API 키 필요)
3. Google Gemini 2.0 Flash (3차 - 단어/숙어/문장 모두 지원)

### 레이아웃 옵션
- **학습용**: 단어 + 뜻 + 예문
- **암기용**: 단어 + 빈칸

## 📝 API 엔드포인트

```bash
# 단어 조회
POST /api/dictionary/lookup
{
  "words": ["apple", "make up for", "How are you?"],
  "options": {
    "cefrLevel": "A2",
    "meanings": 1,
    "meaningDisplay": "english"
  }
}

# 파일 업로드 (최대 5MB, 500개 항목)
POST /api/upload
Content-Type: multipart/form-data
지원 형식: .txt, .csv, .md
```

## ⚠️ 주의사항

- **macOS**: AirPlay Receiver 포트 충돌 방지 → Backend `.env`에서 `PORT=5001` 설정
- **한글 미지원**: 영어 단어/숙어/문장만 입력 가능 (한글 입력 시 자동 제외)
- **최대 입력**: 500개 항목, 5MB 파일
- **API 제한**:
  - Gemini API: 무료 플랜 일일 요청 제한
  - Oxford API: 유료 플랜 필요 (선택 사항)
- **API 재시도**: 최대 2회 재시도, 500ms 지연
- **배치 처리**: 10개씩 배치로 처리, 배치 간 1초 대기

## 📄 라이선스 & 기여

**라이선스**: MIT

**기여**: 버그 리포트나 기능 제안은 [Issues](https://github.com/bibi-is-typing/vocapdf/issues)로 등록해주세요.

**개발**: Made by [@bibi-is-typing](https://github.com/bibi-is-typing)

**상세 문서**: 프로젝트 구조와 개발 가이드는 [`CLAUDE.md`](./CLAUDE.md) 참조

---

**Note**: 교육 목적 프로젝트입니다. 상업적 사용 시 각 API 정책을 확인하세요.
