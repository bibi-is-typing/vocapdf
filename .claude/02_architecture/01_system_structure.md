# VocaPDF - 시스템 구조

## 📌 개요

이 문서는 VocaPDF의 전체 시스템 구조를 설명합니다. 프론트엔드, 백엔드, 외부 API의 관계와 각 컴포넌트의 역할을 정의합니다.

---

## 🏗️ 전체 아키텍처

### 시스템 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                     사용자 (User)                        │
│                  브라우저 (Browser)                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│              프론트엔드 (Frontend)                        │
│                    React App                             │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 입력 UI      │  │ 옵션 패널    │  │ 미리보기     │ │
│  │ WordInput    │  │ Options      │  │ Preview      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           PDF 생성 (jsPDF)                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
             HTTP/HTTPS (API 요청)
                           ↓
┌─────────────────────────────────────────────────────────┐
│              백엔드 (Backend)                             │
│              Node.js + Express                           │
│                    (맥미니)                               │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          API 라우트 (Routes)                      │  │
│  │  - POST /api/dictionary/lookup                    │  │
│  │  - POST /api/upload                               │  │
│  └──────────────────────────────────────────────────┘  │
│                            │                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │       비즈니스 로직 (Services)                     │  │
│  │  - dictionaryService.js                           │  │
│  │  - dataProcessService.js                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
             HTTP/HTTPS (API 요청)
                           ↓
┌─────────────────────────────────────────────────────────┐
│            외부 API (External API)                       │
│          Free Dictionary API                             │
│   [https://api.dictionaryapi.dev/api/v2/entries/en/](https://api.dictionaryapi.dev/api/v2/entries/en/)      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 계층 구조 (Layered Architecture)

### 3-Tier 아키텍처

```
┌─────────────────────────────┐
│   Presentation Layer        │  ← 프론트엔드 (React)
│   (사용자 인터페이스)         │
└─────────────────────────────┘
               ↕
┌─────────────────────────────┐
│   Application Layer         │  ← 백엔드 (Express)
│   (비즈니스 로직)             │
└─────────────────────────────┘
               ↕
┌─────────────────────────────┐
│   Data Layer                │  ← 외부 사전 API
│   (데이터 소스)               │
└─────────────────────────────┘
```

---

## 🖥️ 프론트엔드 구조

### 역할

-   사용자 인터페이스 제공
-   사용자 입력 처리
-   백엔드 API 호출
-   PDF 생성 및 다운로드

### 주요 컴포넌트

#### 1. 입력 계층 (Input Layer)

```
WordInput/
├── TextInput.jsx       # 텍스트 직접 입력
└── FileUpload.jsx      # 파일 업로드
```

-   **역할**:
    -   단어 입력 받기 (텍스트/파일)
    -   입력 유효성 검증 (클라이언트 측)
    -   파일 파싱 (CSV, TXT, MD)

#### 2. 옵션 계층 (Options Layer)

```
OptionsPanel/
├── OptionsPanel.jsx        # 전체 옵션 패널
├── FieldSelector.jsx       # 각 필드별 드롭다운
└── AdditionalOptions.jsx   # 체크박스, 날짜 옵션
```

-   **역할**:
    -   사용자 옵션 선택 UI
    -   옵션 상태 관리
    -   기본값 설정

#### 3. 미리보기 계층 (Preview Layer)

```
PDFPreview/
├── PDFPreview.jsx      # 미리보기 모달
└── TablePreview.jsx    # 테이블 미리보기
```

-   **역할**:
    -   선택한 옵션으로 테이블 렌더링
    -   미리보기 모달 표시
    -   최종 확인 전 검토

#### 4. PDF 생성 계층 (PDF Generation Layer)

```
PDFGenerator/
└── PDFGenerator.jsx    # PDF 생성 및 다운로드
```

-   **역할**:
    -   HTML 테이블 → PDF 변환
    -   jsPDF 라이브러리 활용
    -   자동 다운로드

### 상태 관리

-   **로컬 상태 (useState)**:
    -   단어 리스트
    -   선택한 옵션
    -   로딩 상태
    -   에러 상태
-   **전역 상태** (필요 시):
    -   MVP에서는 전역 상태 관리 불필요
    -   로컬 상태로 충분

---

## ⚙️ 백엔드 구조

### 역할

-   프론트엔드 API 요청 처리
-   외부 사전 API 호출
-   데이터 가공 및 필터링
-   에러 처리

### 주요 컴포넌트

#### 1. 라우트 계층 (Route Layer)

```
routes/
├── dictionary.js       # 사전 관련 라우트
└── upload.js           # 파일 업로드 라우트
```

-   **엔드포인트**:
    -   `POST /api/dictionary/lookup` - 단어 조회
    -   `POST /api/upload` - 파일 업로드 (선택사항)

#### 2. 서비스 계층 (Service Layer)

```
services/
├── dictionaryService.js    # 사전 API 호출
└── dataProcessService.js   # 데이터 가공
```

-   **역할**:
    -   `dictionaryService`: Free Dictionary API 호출 및 응답 처리
    -   `dataProcessService`: 의미별 데이터 분리 및 필터링

#### 3. 유틸리티 계층 (Utility Layer)

```
utils/
├── dataParser.js           # API 응답 파싱
├── meaningExtractor.js     # 의미별 정보 추출
└── validator.js            # 입력 유효성 검증
```

-   **역할**:
    -   API 응답 구조 파싱
    -   다의어 의미별 분리
    -   입력 데이터 검증

#### 4. 미들웨어 계층 (Middleware Layer)

```
middleware/
├── errorHandler.js         # 에러 핸들링
└── upload.js               # Multer 파일 업로드 설정
```

-   **역할**:
    -   전역 에러 처리
    -   파일 업로드 처리

---

## 🌐 외부 API

### Free Dictionary API

-   **기본 정보**:
    -   URL: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
    -   인증: 불필요
    -   Rate Limit: 없음 (공식 문서 기준)
    -   응답 형식: JSON
-   **특징**:
    -   무료 오픈소스 사전 API
    -   영영 사전 기반
    -   유의어, 반의어, 발음 등 제공
    -   다의어 지원
-   **제약사항**:
    -   모든 단어가 있는 것은 아님
    -   유의어/반의어가 항상 있는 것은 아님
    -   네트워크 의존적

---

## 🔄 컴포넌트 간 통신

### 프론트엔드 ↔ 백엔드

-   **통신 방식**:
    -   HTTP/HTTPS
    -   RESTful API
    -   JSON 형식

-   **요청 예시**:
    ```javascript
    // 프론트엔드 → 백엔드
    // POST /api/dictionary/lookup

    // Request Body:
    {
      "words": ["apple", "banana", "computer"],
      "options": {
        "meanings": 2,
        "definitions": 1,
        "synonyms": 2,
        "antonyms": 0,
        "related": 2
      }
    }
    ```

-   **응답 예시**:
    ```javascript
    // 백엔드 → 프론트엔드
    // Response:
    {
      "success": true,
      "data": [
        {
          "word": "apple",
          "meanings": [
            {
              "meaningNumber": 1,
              "definition": "A round fruit...",
              "synonyms": ["fruit", "pomaceous"],
              "antonyms": [],
              "related": ["tree", "orchard"]
            }
          ]
        }
      ]
    }
    ```

### 백엔드 ↔ 외부 API

-   **통신 방식**:
    -   HTTP/HTTPS
    -   GET 요청
    -   JSON 응답

-   **요청 예시**:
    ```javascript
    // 백엔드 → Free Dictionary API
    // GET [https://api.dictionaryapi.dev/api/v2/entries/en/apple](https://api.dictionaryapi.dev/api/v2/entries/en/apple)
    ```
-   **응답 예시** (간소화):
    ```json
    [
      {
        "word": "apple",
        "meanings": [
          {
            "partOfSpeech": "noun",
            "definitions": [
              {
                "definition": "A round fruit with red or green skin",
                "synonyms": ["fruit", "pomaceous"],
                "antonyms": []
              }
            ]
          }
        ]
      }
    ]
    ```

---

## 🔐 보안 고려사항

### CORS (Cross-Origin Resource Sharing)

-   **문제**: 프론트엔드와 백엔드가 다른 도메인일 수 있음
-   **해결**: 백엔드에서 `cors` 미들웨어 설정
    ```javascript
    // 백엔드에서 CORS 설정
    app.use(cors({
      origin: ['http://localhost:5173', '[https://vocapdf.com](https://vocapdf.com)'],
      methods: ['GET', 'POST']
    }));
    ```

### 입력 검증

-   **프론트엔드**:
    -   파일 크기 (5MB)
    -   파일 형식 (CSV, TXT, MD)
    -   단어 개수 (최대 500개)
-   **백엔드**:
    -   동일한 검증 재수행
    -   SQL Injection 방지 (현재 해당 없음)
    -   XSS 방지

---

## 📦 배포 구조

### 개발 환경

-   **로컬 개발**:
    -   프론트엔드: `http://localhost:5173` (Vite)
    -   백엔드: `http://localhost:5000` (Express)

### 프로덕션 환경

-   **배포**:
    -   프론트엔드: Vercel (또는 맥미니)
    -   백엔드: 맥미니 (로컬 서버)
-   **백엔드 배포 (맥미니)**:
    ```bash
    # PM2로 백엔드 실행
    pm2 start src/server.js --name vocapdf-backend

    # 포트 포워딩 설정 (예: 5000 → 외부 접근)
    ```

---

## 🔄 확장 가능성

### Phase 2 확장 포인트

-   **데이터베이스 추가**:
    -   **현재**: 없음 (Stateless)
    -   **Phase 2**: MongoDB/PostgreSQL
        -   → 단어 저장
        -   → 사용자 계정
        -   → 히스토리 관리
-   **캐싱 레이어 추가**:
    -   **현재**: 없음
    -   **Phase 2**: Redis
        -   → API 응답 캐싱
        -   → 성능 향상
-   **인증 레이어 추가**:
    -   **현재**: 없음
    -   **Phase 2**: JWT 인증
        -   → 사용자 로그인
        -   → 개인 단어장 관리

---

## 🧩 설계 원칙

1.  **단순성 (Simplicity)**
    -   불필요한 복잡도 제거
    -   MVP에 필요한 최소한의 구조
2.  **관심사 분리 (Separation of Concerns)**
    -   프론트/백엔드 명확히 분리
    -   각 계층의 역할 명확
3.  **확장성 (Scalability)**
    -   Phase 2, 3 확장 고려
    -   모듈식 구조
4.  **유지보수성 (Maintainability)**
    -   명확한 폴더 구조
    -   함수/컴포넌트 단일 책임

---

## 📝 문서 이력
- 2025-10-09: 초안 작성