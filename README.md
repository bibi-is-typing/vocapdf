# 📚 VocaPDF

영어 단어, 숙어, 문장을 조회하고 PDF 단어장으로 만들어주는 웹 애플리케이션입니다.

## ✨ 주요 기능

### v0.3.0 (최신)
- **CEFR 레벨별 맞춤 정의**: A2~C1 레벨에 맞춘 단어 설명 제공
- **Google Gemini AI 통합**: Gemini 2.0 Flash를 통한 정확한 번역 및 정의
- **Oxford Dictionary 통합**: 고품질 영어 사전 데이터 제공
- **입력 유형 자동 감지**: 단어, 숙어, 문장 자동 구분 및 처리
- **실시간 진행률 표시**: 단어 조회 중 실시간 진행 상황 확인
- **레이아웃 옵션**: 학습용 (예문 포함) / 암기용 (빈칸 채우기) 선택 가능
- **파일 업로드**: .txt, .csv, .md 파일에서 단어 목록 불러오기 (최대 5MB)
- **shadcn/ui + Tailwind CSS**: 모던하고 깔끔한 사용자 인터페이스
- **PDF 생성**: A4 형식의 깔끔한 단어장 다운로드

## 🛠️ 기술 스택

### Backend
- **Node.js** 18+ + **Express.js** - REST API 서버
- **Google Gemini 2.0 Flash** - AI 번역 및 정의 생성
- **Oxford Dictionary API** - 영어 사전 데이터 (옵션)
- **Free Dictionary API** - Fallback 사전 데이터
- **Axios** - HTTP 요청 처리
- **Multer** - 파일 업로드 처리

### Frontend
- **React** 19 - UI 라이브러리
- **Vite** 7 - 빌드 도구 및 개발 서버
- **shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **Tailwind CSS** 3 - 유틸리티 우선 CSS 프레임워크
- **jsPDF** + **jspdf-autotable** - PDF 생성
- **Axios** - API 통신
- **Lucide React** - 아이콘 라이브러리

## 📦 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Google Gemini API 키 (필수)
- Oxford Dictionary API 키 (선택)

### 1. 저장소 클론
```bash
git clone https://github.com/bibi-is-typing/vocapdf.git
cd vocapdf
```

### 2. 백엔드 설정 및 실행
```bash
cd backend
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 API 키를 입력하세요
# - GEMINI_API_KEY (필수): https://aistudio.google.com/apikey
# - OXFORD_APP_ID, OXFORD_APP_KEY (선택): https://developer.oxforddictionaries.com

# 개발 서버 실행
npm run dev
```

백엔드가 `http://localhost:5001`에서 실행됩니다.

### 3. 프론트엔드 설정 및 실행
새 터미널을 열고:
```bash
cd frontend
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

## 📖 사용 방법

### 1. 입력
두 가지 방법으로 입력할 수 있습니다:
- **직접 입력**: 텍스트 영역에 단어, 숙어, 문장을 입력 (줄바꿈으로 구분)
  - 예: `sustainable`, `make up for`, `How are you doing?`
- **파일 업로드**: .txt, .csv, .md 파일 업로드 (최대 500개 항목, 5MB 이하)

**자동 감지**: 입력된 내용이 단어/숙어/문장인지 자동으로 구분합니다.

### 2. CEFR 레벨 선택
- **A2 (초급)**: 기초적인 어휘로 쉽게 설명
- **B1 (중급)**: 일상적인 어휘로 명확하게 설명
- **B2 (중상급)**: 다양한 어휘로 자세하게 설명
- **C1 (고급)**: 학술적인 용어로 정확하게 설명

### 3. 조회
"검색" 버튼을 클릭하여 AI와 사전에서 정보를 가져옵니다.

### 4. 레이아웃 선택 및 PDF 생성
- **학습용**: 원문 + 예문/번역 포함
- **암기용**: 원문 + 빈칸 (암기 확인용)

조회가 완료되면 "PDF 다운로드" 버튼으로 PDF를 다운로드할 수 있습니다.

## 🏗️ 프로젝트 구조

```
vocapdf/
├── backend/
│   ├── src/
│   │   ├── config/           # 설정 파일
│   │   │   └── constants.js
│   │   ├── middleware/       # Express 미들웨어
│   │   │   └── errorHandler.js
│   │   ├── routes/          # API 라우트
│   │   │   ├── dictionary.js
│   │   │   └── upload.js
│   │   ├── services/        # 비즈니스 로직
│   │   │   ├── dictionaryService.js
│   │   │   ├── geminiService.js
│   │   │   └── oxfordDictionaryService.js
│   │   ├── utils/           # 유틸리티 함수
│   │   │   ├── fileParser.js
│   │   │   ├── inputTypeDetector.js
│   │   │   └── meaningExtractor.js
│   │   └── server.js        # Express 서버
│   ├── uploads/             # 업로드된 파일 임시 저장
│   ├── .env                 # 환경 변수
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   │   ├── ui/          # shadcn/ui 컴포넌트
│   │   │   └── PDFPreview.jsx
│   │   ├── services/        # API 통신
│   │   │   └── dictionaryApi.js
│   │   ├── utils/           # 유틸리티 함수
│   │   │   └── pdfGenerator.js
│   │   ├── App.jsx          # 메인 컴포넌트
│   │   ├── App.css          # 스타일
│   │   ├── main.jsx         # 엔트리 포인트
│   │   └── index.css        # 글로벌 스타일
│   ├── public/
│   └── package.json
│
├── .claude/                 # 프로젝트 문서
│   ├── commands/            # 커스텀 슬래시 커맨드
│   └── docs/               # 상세 문서
│
├── README.md
├── CHANGELOG.md
└── CLAUDE.md
```

## 🔌 API 엔드포인트

### POST /api/dictionary/lookup
단어 조회 API

**Request Body:**
```json
{
  "words": ["apple", "make up for", "How are you?"],
  "options": {
    "meanings": 1,
    "definitions": 1,
    "synonyms": 0,
    "antonyms": 0,
    "related": 0,
    "meaningDisplay": "english",
    "cefrLevel": "A2",
    "outputFormat": "input-order"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "word": "apple",
      "type": "word",
      "meanings": [
        {
          "meaningNumber": 1,
          "partOfSpeech": "noun",
          "definition": "the round fruit of a tree...",
          "synonyms": [],
          "antonyms": []
        }
      ],
      "source": "oxford-api",
      "success": true
    }
  ],
  "meta": {
    "totalInputs": 3,
    "processedInputs": 3,
    "failedInputs": 0,
    "processingTime": "2.1s"
  }
}
```

### POST /api/upload
파일 업로드 API

**Request:** multipart/form-data
- `file`: .txt, .csv, .md 파일 (최대 5MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "words": ["apple", "banana", "computer"],
    "count": 3
  }
}
```

## 🎨 주요 특징

### CEFR 레벨별 맞춤 정의
Google Gemini AI가 사용자의 영어 레벨에 맞춰 단어를 설명합니다:
- **A2**: 매우 기초적인 어휘로 짧고 간단하게
- **B1**: 일상적인 어휘로 명확하게
- **B2**: 다양한 어휘로 상세하게
- **C1**: 학술적 용어로 정확하고 전문적으로

### 다중 API Fallback 시스템
1. **Free Dictionary API** (1차) - 무료, 기본 영어 사전
2. **Oxford Dictionary API** (2차) - 고품질 영어 정의 (API 키 필요)
3. **Google Gemini AI** (3차) - AI 번역 및 정의 (숙어/문장 지원)

### 레이아웃 옵션
- **학습용**: 단어 + 뜻 + 예문으로 학습에 최적화
- **암기용**: 단어 + 빈칸으로 암기 확인용

### 에러 처리
- 백엔드: 일관된 에러 응답 형식
- 프론트엔드: 사용자 친화적인 에러 메시지
- API 재시도 로직: 최대 2회 재시도, 500ms 지연

### 로딩 UX
- 전체 화면 로딩 오버레이
- 실시간 진행률 표시 (%)
- 예상 소요 시간 안내
- 애니메이션 스피너

## 📝 환경 변수

### Backend `.env`
```env
# 서버 포트 (macOS에서는 5001 권장)
PORT=5001

# Free Dictionary API URL (fallback)
DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2/entries/en

# Lingua Robot API 설정 (더 이상 사용하지 않음)
# LINGUA_ROBOT_API_URL=https://lingua-robot.p.rapidapi.com
# LINGUA_ROBOT_API_KEY=your_rapidapi_key_here
# LINGUA_ROBOT_API_HOST=lingua-robot.p.rapidapi.com

# 파일 업로드 최대 크기 (바이트)
MAX_FILE_SIZE=5242880

# Google Gemini API (Free Dictionary API의 fallback)
# https://aistudio.google.com/apikey 에서 API 키를 발급받아 입력하세요
GEMINI_API_KEY=your_gemini_api_key_here

# Oxford Dictionary API (선택)
# https://developer.oxforddictionaries.com 에서 API 키를 발급받아 입력하세요
OXFORD_APP_ID=your_oxford_app_id_here
OXFORD_APP_KEY=your_oxford_app_key_here
```

**API 키 발급**:
- **Gemini API** (필수, 무료): [Google AI Studio](https://aistudio.google.com/apikey)
- **Oxford API** (선택, 유료): [Oxford Dictionaries API](https://developer.oxforddictionaries.com)

## 🚀 배포

### 백엔드
```bash
cd backend
npm run start
```

### 프론트엔드
```bash
cd frontend
npm run build
npm run preview
```

빌드된 파일은 `frontend/dist` 폴더에 생성됩니다.

## ⚠️ 알려진 이슈

1. **macOS AirPlay 포트 충돌**: macOS에서 AirPlay Receiver가 5000번 포트를 사용합니다. `.env`에서 `PORT=5001`로 설정하세요.

2. **한글 입력 제한**: 현재 한글 단어 입력을 지원하지 않습니다. 영어 단어만 입력 가능합니다.

3. **API 제한**:
   - **Gemini API**: 무료 플랜에서 일일 요청 제한이 있습니다.
   - **Oxford Dictionary API**: 유료 플랜 필요
   - **Free Dictionary API**: 무료이며 rate limit이 있을 수 있습니다.

## 🤝 기여

버그 리포트와 기능 제안은 [GitHub Issues](https://github.com/bibi-is-typing/vocapdf/issues)로 등록해주세요.

## 📄 라이선스

MIT License

## 👨‍💻 개발자

Made with ❤️ by [@bibi-is-typing](https://github.com/bibi-is-typing)

---

## 📚 추가 문서

프로젝트의 상세한 구조와 개발 가이드는 [`CLAUDE.md`](./CLAUDE.md) 파일을 참조하세요.
- 프로젝트 아키텍처
- API 전환 전략
- 개발 가이드
- 커스텀 슬래시 커맨드

---

**Note**: 이 프로젝트는 교육 목적으로 개발되었습니다. Google Gemini API, Oxford Dictionary API, Free Dictionary API를 사용하므로 상업적 사용 시 각 API의 정책을 확인하시기 바랍니다.
