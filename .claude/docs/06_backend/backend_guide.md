# VocaPDF - 백엔드 개발 가이드

## 📌 개요

이 문서는 VocaPDF 백엔드 서버의 구조, 주요 로직, 개발 규칙에 대한 상세 가이드입니다.

---

## 🏗️ 아키텍처

백엔드는 **계층형 아키텍처(Layered Architecture)**를 따릅니다.

1.  **Routes (`routes/`)**: API 엔드포인트를 정의하고 요청의 유효성을 검증합니다.
2.  **Services (`services/`)**: 핵심 비즈니스 로직을 수행합니다. 외부 API 호출, 데이터 가공 등을 담당합니다.
3.  **Utils (`utils/`)**: 특정 도메인에 종속되지 않는 순수 함수들을 제공합니다. (e.g., 파싱, 데이터 변환)
4.  **Middleware (`middleware/`)**: 요청/응답 파이프라인에 관여하며, 주로 에러 처리나 파일 업로드 같은 공통 기능을 담당합니다.

---

## 🔄 데이터 처리 흐름 (`/api/dictionary/lookup`)

1.  **`routes/dictionary.js`**:
    -   `/lookup` 엔드포인트로 `POST` 요청을 받습니다.
    -   `req.body`에서 `words`와 `options`를 추출합니다.
    -   단어 개수(최대 500개)와 `options` 객체의 유효성을 검증합니다.
    -   `dictionaryService.lookupWords` 함수를 호출하여 비즈니스 로직을 위임합니다.

2.  **`services/dictionaryService.js`**:
    -   `lookupWords` 함수는 입력받은 단어 배열을 순회합니다.
    -   **`inputTypeDetector.js`**를 사용해 각 입력이 'word', 'phrase', 'sentence' 중 어떤 유형인지 감지합니다.
    -   **`linguaRobotService.js`**를 우선 호출합니다. API 키가 없거나 호출 실패 시 Fallback 로직으로 넘어갑니다.
    -   **Fallback**: `fetchWordWithRetry` 함수를 통해 Free Dictionary API를 호출합니다. (네트워크 오류 시 최대 2회 재시도)
    -   API 응답 성공 시, **`meaningExtractor.js`**를 사용해 사용자 `options`에 맞게 의미, 유의어 등의 데이터를 추출 및 가공합니다.
    -   API 응답 실패 또는 404 시, `{ error: '...' }` 형식의 객체를 결과 배열에 추가합니다.
    -   모든 단어 처리가 완료되면 최종 결과 배열과 메타데이터(처리 시간, 성공/실패 개수 등)를 반환합니다.

3.  **`middleware/errorHandler.js`**:
    -   `dictionaryService` 또는 `routes`에서 발생한 모든 에러는 `next(error)`를 통해 이 미들웨어로 전달됩니다.
    -   에러의 `statusCode`와 `code`에 따라 표준화된 JSON 형식으로 클라이언트에 응답합니다.

---

## 🔑 주요 로직 설명

### 다중 API 전략

-   **Primary**: **Lingua Robot API**를 우선 사용합니다. 더 빠르고, 숙어/문장 번역을 지원하며, 한영 뜻 데이터를 제공하기 때문입니다.
-   **Fallback**: Lingua Robot API 키가 없거나, 호출에 실패하면 **Free Dictionary API**를 사용합니다. 이는 서비스의 안정성을 높여줍니다.

### 입력 유형 자동 감지 (`utils/inputTypeDetector.js`)

-   입력된 문자열을 분석하여 단어, 숙어, 문장을 구분합니다.
-   **문장**: 대문자로 시작하고 구두점(.!?)으로 끝나며 3단어 이상인 경우.
-   **숙어**: 2~5개의 단어로 구성되고 관사/전치사가 포함된 경우.
-   **단어**: 그 외의 경우.

---

## 📝 개발 규칙

-   **환경 변수**: API 키, 포트 등 민감하거나 환경에 따라 바뀌는 정보는 반드시 `.env` 파일에서 관리합니다. 코드에 하드코딩하지 마세요.
-   **비동기 처리**: 모든 I/O 작업(API 호출 등)은 `async/await`를 사용하여 비동기적으로 처리합니다.
-   **에러 처리**: 모든 비동기 로직은 `try...catch`로 감싸고, `catch` 블록에서는 `next(error)`를 호출하여 에러를 중앙 핸들러로 위임하세요.
-   **모듈화**: 기능별로 파일을 분리하고 `module.exports`와 `require`를 사용하여 모듈을 관리합니다. (CommonJS)

---

## 📝 문서 이력
- 2025-10-10: 초안 작성