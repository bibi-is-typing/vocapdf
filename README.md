# 📚 VocaPDF

영어 단어를 조회하고 PDF 단어장으로 만들어주는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **단어 조회**: Free Dictionary API를 통한 영어 단어 검색
- **다중 의미 지원**: 한 단어의 여러 의미를 모두 표시
- **파일 업로드**: .txt, .csv, .md 파일에서 단어 목록 불러오기 (최대 5MB)
- **맞춤 옵션**: 의미, 영영뜻, 유의어, 반의어, 관계어 개수 선택 가능
- **PDF 생성**: 깔끔한 테이블 형식의 A4 PDF 다운로드
- **체크박스 & 날짜**: 학습 진행도 체크와 날짜 표시 옵션

## 🛠️ 기술 스택

### Backend
- **Node.js** + **Express.js** - REST API 서버
- **Axios** - HTTP 요청 처리
- **Multer** - 파일 업로드 처리
- **Free Dictionary API** - 단어 데이터 소스

### Frontend
- **React** 19 - UI 라이브러리
- **Vite** - 빌드 도구
- **jsPDF** + **jspdf-autotable** - PDF 생성
- **Axios** - API 통신

## 📦 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 1. 저장소 클론
```bash
git clone <repository-url>
cd vocapdf
```

### 2. 백엔드 설정 및 실행
```bash
cd backend
npm install

# 환경 변수 설정 (.env)
# PORT=5001 (기본값: 5000, macOS AirPlay 충돌 시 5001 사용)

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

### 1. 단어 입력
두 가지 방법으로 단어를 입력할 수 있습니다:
- **직접 입력**: 텍스트 영역에 단어를 입력 (줄바꿈, 쉼표, 세미콜론으로 구분)
- **파일 업로드**: .txt, .csv, .md 파일 업로드 (최대 500개 단어, 5MB 이하)

### 2. 옵션 선택
- **의미 개수**: 1개 또는 2개 (기본: 2개)
- **영영뜻**: 0~2개 (기본: 1개)
- **유의어**: 0~2개 (기본: 2개)
- **반의어**: 0~2개 (기본: 0개)
- **관계어**: 0~2개 (기본: 0개)
- **체크박스 추가**: PDF에 체크박스 열 추가
- **날짜 표시**: PDF 상단에 학습일 표시

### 3. 단어 조회
"단어 조회" 버튼을 클릭하여 API에서 단어 정보를 가져옵니다.

### 4. PDF 생성
조회가 완료되면 "PDF 생성하기" 버튼으로 PDF를 다운로드할 수 있습니다.

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
│   │   │   └── dictionaryService.js
│   │   ├── utils/           # 유틸리티 함수
│   │   │   ├── fileParser.js
│   │   │   └── meaningExtractor.js
│   │   └── server.js        # Express 서버
│   ├── uploads/             # 업로드된 파일 임시 저장
│   ├── .env                 # 환경 변수
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── services/        # API 통신
│   │   │   ├── api.js
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
│   ├── folder_structure.md
│   ├── api_spec.md
│   ├── meaning_handling.md
│   ├── backend_guide.md
│   ├── tech_stack.md
│   └── error_handling.md
│
└── README.md
```

## 🔌 API 엔드포인트

### POST /api/dictionary/lookup
단어 조회 API

**Request Body:**
```json
{
  "words": ["apple", "banana", "computer"],
  "options": {
    "meanings": 2,
    "definitions": 1,
    "synonyms": 2,
    "antonyms": 0,
    "related": 0
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
      "meanings": [
        {
          "meaning": "사과",
          "definition": "the round fruit of a tree...",
          "synonyms": ["fruit"],
          "antonyms": [],
          "related": []
        }
      ]
    }
  ],
  "meta": {
    "totalWords": 3,
    "processedWords": 3,
    "failedWords": 0
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

### 다의어(Polysemy) 처리
한 단어가 여러 의미를 가질 경우, PDF 테이블에서 `rowSpan`을 사용하여 단어 셀을 병합하고 각 의미를 별도 행으로 표시합니다.

### 에러 처리
- 백엔드: 일관된 에러 응답 형식
- 프론트엔드: 사용자 친화적인 에러 메시지
- API 재시도 로직: 최대 2회 재시도, 500ms 지연

### 로딩 UX
- 전체 화면 로딩 오버레이
- 애니메이션 스피너
- 진행 상황 텍스트 표시
- 성공/실패 메시지

## 📝 환경 변수

### Backend `.env`
```env
PORT=5001
DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2/entries/en
MAX_FILE_SIZE=5242880
```

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

2. **PDF 한글 폰트**: jsPDF는 기본적으로 한글 폰트를 포함하지 않아 한글이 제대로 표시되지 않을 수 있습니다. 현재는 ASCII 문자로 표시됩니다.

3. **API 제한**: Free Dictionary API는 무료이며 rate limit이 있을 수 있습니다. 많은 단어를 한번에 조회할 경우 일부 실패할 수 있습니다.

## 🤝 기여

버그 리포트와 기능 제안은 이슈로 등록해주세요.

## 📄 라이선스

MIT License

## 👨‍💻 개발자

Made with ❤️ by VocaPDF Team

---

**Note**: 이 프로젝트는 교육 목적으로 개발되었습니다. Free Dictionary API를 사용하므로 상업적 사용 시 API 정책을 확인하시기 바랍니다.
