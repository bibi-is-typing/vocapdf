# VocaPDF Backend

VocaPDF 프로젝트의 백엔드 서버입니다. Express.js 기반으로 구현되었으며, Free Dictionary API를 연동하여 단어 조회 및 데이터 가공 기능을 제공합니다.

## 기술 스택

- **Node.js** 18.x 이상
- **Express.js** 4.x
- **Axios** - HTTP 클라이언트
- **Multer** - 파일 업로드 처리
- **CORS** - 크로스 오리진 리소스 공유
- **dotenv** - 환경 변수 관리

## 프로젝트 구조

```
backend/
├── src/
│   ├── routes/           # API 엔드포인트 및 라우팅
│   │   ├── dictionary.js # 단어 조회 API
│   │   └── upload.js     # 파일 업로드 API
│   ├── services/         # 비즈니스 로직
│   │   └── dictionaryService.js  # Dictionary API 연동 및 단어 조회
│   ├── utils/            # 유틸리티 함수
│   │   ├── meaningExtractor.js   # 다의어 데이터 가공
│   │   └── fileParser.js         # 파일 파싱
│   ├── middleware/       # Express 미들웨어
│   │   └── errorHandler.js       # 에러 핸들링
│   ├── config/           # 설정 및 상수
│   │   └── constants.js          # 상수 정의
│   └── server.js         # 서버 진입점
├── uploads/              # 파일 업로드 임시 저장소
├── .env                  # 환경 변수
├── package.json
└── README.md
```

## 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요시 포트나 설정을 수정하세요:

```env
PORT=5000
DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2/entries/en
MAX_FILE_SIZE=5242880
```

### 3. 서버 실행

**개발 모드** (자동 재시작):
```bash
npm run dev
```

**프로덕션 모드**:
```bash
npm start
```

서버가 성공적으로 시작되면 다음과 같은 메시지가 표시됩니다:
```
==================================================
🚀 VocaPDF Backend Server
📡 Server running on http://localhost:5000
🏥 Health check: http://localhost:5000/health
⏰ Started at: 2025-10-09T...
==================================================
```

## API 엔드포인트

### 1. Health Check

서버 상태를 확인합니다.

**Endpoint**: `GET /health`

**응답 예시**:
```json
{
  "success": true,
  "message": "VocaPDF Backend is running",
  "timestamp": "2025-10-09T13:49:41.948Z"
}
```

### 2. 단어 조회 (Dictionary Lookup)

여러 단어를 조회하고 사용자 옵션에 맞게 가공된 데이터를 반환합니다.

**Endpoint**: `POST /api/dictionary/lookup`

**요청 예시**:
```json
{
  "words": ["apple", "bank"],
  "options": {
    "meanings": 2,
    "definitions": 1,
    "synonyms": 2,
    "antonyms": 0,
    "related": 0
  }
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "word": "apple",
      "meanings": [
        {
          "meaningNumber": 1,
          "partOfSpeech": "noun",
          "definition": "A common, round fruit...",
          "synonyms": [],
          "antonyms": [],
          "related": []
        }
      ]
    }
  ],
  "meta": {
    "totalWords": 2,
    "processedWords": 2,
    "failedWords": 0,
    "processingTime": "1.3s"
  }
}
```

### 3. 파일 업로드

텍스트 파일을 업로드하여 단어 배열을 추출합니다.

**Endpoint**: `POST /api/upload`

**Headers**: `Content-Type: multipart/form-data`

**지원 파일 형식**: `.txt`, `.csv`, `.md`

**최대 파일 크기**: 5MB

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "words": ["apple", "banana", "computer"],
    "count": 3,
    "filename": "words.txt"
  }
}
```

## 에러 처리

모든 에러는 일관된 JSON 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 설명",
    "details": {}
  }
}
```

### 주요 에러 코드

| HTTP 상태 | 코드 | 설명 |
|-----------|------|------|
| 400 | INVALID_REQUEST | 요청 형식이 잘못되었습니다 |
| 413 | FILE_TOO_LARGE | 파일 크기가 5MB를 초과했습니다 |
| 422 | VALIDATION_ERROR | 유효성 검증 실패 |
| 500 | SERVER_ERROR | 서버 내부 오류 |
| 503 | EXTERNAL_API_ERROR | 외부 API 연결 실패 |

## 테스트

### cURL을 사용한 테스트

**Health Check**:
```bash
curl http://localhost:5000/health
```

**단어 조회**:
```bash
curl -X POST http://localhost:5000/api/dictionary/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["apple", "bank"],
    "options": {
      "meanings": 2,
      "definitions": 1,
      "synonyms": 2,
      "antonyms": 0,
      "related": 0
    }
  }'
```

**파일 업로드**:
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@words.txt"
```

## 개발 가이드

### 새로운 라우트 추가

1. `src/routes/` 디렉토리에 새 라우트 파일 생성
2. `src/server.js`에 라우트 등록:
```javascript
const newRoute = require('./routes/newRoute');
app.use('/api/new', newRoute);
```

### 새로운 서비스 추가

1. `src/services/` 디렉토리에 새 서비스 파일 생성
2. 비즈니스 로직을 모듈화하여 구현
3. 라우트에서 서비스 import 후 사용

## 참고사항

- **포트 충돌**: macOS의 경우 포트 5000이 AirPlay Receiver에 의해 사용될 수 있습니다. `.env` 파일에서 `PORT=5001` 등으로 변경하거나, 시스템 환경설정에서 AirPlay Receiver를 비활성화하세요.

- **외부 API 의존성**: 이 서버는 Free Dictionary API (https://api.dictionaryapi.dev)에 의존합니다. 네트워크 연결이 필요하며, 해당 API의 가용성에 영향을 받습니다.

- **재시도 정책**: 외부 API 호출 실패 시 최대 2회까지 자동으로 재시도합니다.

## 라이선스

MIT
