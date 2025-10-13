# VocaPDF - API 명세서

## 📌 개요

이 문서는 VocaPDF 프로젝트의 프론트엔드와 백엔드 간에 사용되는 HTTP API의 명세를 정의합니다. 모든 엔드포인트, 요청/응답 형식, 에러 코드를 포함합니다.

---

## 🌐 기본 정보

### Base URL

-   **개발 환경**: `http://localhost:5001`
-   **프로덕션 환경**: 배포 시 설정

### 공통 헤더

-   모든 요청은 `Content-Type: application/json` 헤더를 포함해야 합니다. (파일 업로드 제외)
-   CORS 정책에 따라 허용된 Origin 및 Method만 요청이 가능합니다.

---

## 📡 엔드포인트: 단어 조회

### `POST /api/dictionary/lookup`

여러 단어/숙어/문장의 사전 정보를 한 번에 조회하고, 사용자 옵션에 맞게 가공하여 반환합니다.

#### 요청 (Request)

-   **Body**:
    ```json
    {
      "words": ["apple", "make up for", "I grew up in London."],
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

-   **Body 필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
| :--- | :--- | :--: | :--- |
| `words` | `Array<string>` | ✅ | 조회할 단어/숙어/문장 목록 (최대 500개) |
| `options` | `Object` | ✅ | 데이터 가공 옵션 |
| `options.meanings` | `number` | ✅ | 추출할 의미 개수 (1 또는 2) |
| `options.definitions` | `number` | ✅ | 추출할 영영뜻 개수 (0, 1, 2) |
| `options.synonyms` | `number` | ✅ | 추출할 유의어 개수 (0, 1, 2) |
| `options.antonyms` | `number` | ✅ | 추출할 반의어 개수 (0, 1, 2) |
| `options.related` | `number` | ✅ | 추출할 관계어 개수 (0, 1, 2) |
| `options.meaningDisplay` | `string` | ✅ | 의미 표시 방식 ('english', 'korean', 'both') |
| `options.cefrLevel` | `string` | ✅ | CEFR 레벨 ('A2', 'B1', 'B2', 'C1') |
| `options.outputFormat` | `string` | ✅ | 출력 순서 ('input-order', 'type-grouped') |

**프론트엔드 실제 사용**: 프론트엔드는 `meanings: 1, definitions: 1, synonyms: 0, antonyms: 0, related: 0, meaningDisplay: 'english'`로 고정하여 전송합니다. 사용자가 변경할 수 있는 옵션은 `cefrLevel`뿐입니다.

#### 응답 (Response)

-   **성공 (200 OK)**:
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
              "definition": "A round fruit with red or green skin",
              "examples": ["I ate an apple for breakfast."],
              "synonyms": [],
              "antonyms": [],
              "related": []
            }
          ]
        },
        {
          "word": "make up for",
          "type": "phrase",
          "meanings": [
            {
              "meaningNumber": 1,
              "definition": "To compensate for something",
              "examples": ["I'll make up for lost time."],
              "synonyms": [],
              "antonyms": [],
              "related": []
            }
          ]
        },
        {
          "word": "I grew up in London.",
          "type": "sentence",
          "examples": [
            "This sentence means the speaker spent their childhood in London."
          ],
          "similarExpressions": [
            "I was raised in London."
          ]
        },
        {
          "word": "abcdefghijk",
          "type": "word",
          "error": "사전에서 찾을 수 없습니다",
          "meanings": []
        }
      ],
      "meta": {
        "totalWords": 4,
        "processedWords": 3,
        "failedWords": 1,
        "processingTime": "2.3s"
      }
    }
    ```

-   **특징**:
    - 일부 단어 조회에 실패하더라도 전체 요청은 성공(`success: true`)으로 처리됩니다.
    - 실패한 단어는 `error` 필드를 포함합니다.
    - `type` 필드로 단어/숙어/문장을 구분합니다.
    - 문장의 경우 `examples` 및 `similarExpressions`로 활용 예시를 제공합니다.

#### 다중 API Fallback 전략

백엔드는 다음 순서로 API를 호출하여 단어를 조회합니다:

1. **Free Dictionary API** (1차)
   - 무료, 단어만 지원
   - 영어 정의 제공

2. **Oxford Dictionary API** (2차)
   - API 키 필요 (선택사항)
   - CEFR 레벨별 정의 제공
   - 고품질 영어 정의

3. **Google Gemini 2.5 Flash Lite** (3차)
   - API 키 필요 (필수)
   - 단어/숙어/문장 모두 지원
   - CEFR 레벨별 맞춤 설명
   - 한국어 번역 제공 (meaningDisplay가 'korean' 또는 'both'인 경우)

---

## 📡 엔드포인트: 파일 업로드

### `POST /api/upload`

사용자가 업로드한 텍스트 파일(`.txt`, `.csv`)을 파싱하여 단어 배열을 반환합니다.

**중요**: `.md` 파일은 지원하지 않습니다.

#### 요청 (Request)

-   **Headers**: `Content-Type: multipart/form-data`
-   **Body (FormData)**: `file` 키에 바이너리 파일 데이터 포함
-   **파일 제한**: 최대 5MB, 최대 500개 항목

#### 응답 (Response)

-   **성공 (200 OK)**:
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

-   **실패 (422 Unprocessable Entity)**: 파일이 500개 초과 항목을 포함하는 경우
    ```json
    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "파일 내 항목이 500개를 초과했습니다 (실제: 650개)"
      }
    }
    ```

---

## 🔄 에러 처리

### 에러 응답 형식

모든 에러는 일관된 JSON 형식으로 반환됩니다.

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러에 대한 설명",
    "details": { } // 추가 정보 (선택)
  }
}
```

### 주요 에러 코드

| HTTP 상태 | 코드 | 설명 |
| :--- | :--- | :--- |
| 400 Bad Request | `INVALID_REQUEST` | 요청 형식이 잘못되었습니다. (e.g., JSON 파싱 실패) |
| 413 Payload Too Large | `FILE_TOO_LARGE` | 업로드한 파일이 5MB를 초과했습니다. |
| 422 Unprocessable Entity | `VALIDATION_ERROR` | 유효성 검증에 실패했습니다. (e.g., 단어 개수 500개 초과) |
| 500 Internal Server Error | `SERVER_ERROR` | 예측하지 못한 서버 내부 오류가 발생했습니다. |
| 503 Service Unavailable | `EXTERNAL_API_ERROR` | 외부 사전 API 연결에 실패했습니다. |

---

## 🔁 재시도 정책

-   백엔드가 외부 사전 API를 호출할 때 네트워크 오류나 5xx대 에러가 발생하면 **최대 2회**까지 재시도를 수행합니다.
-   재시도 간격은 500ms이며, 각 요청의 타임아웃은 10초로 설정됩니다.
-   404 Not Found (단어를 찾을 수 없음)와 같은 클라이언트 측 에러는 재시도하지 않습니다.

---

## 🎯 배치 처리

-   단어 조회는 10개 단위로 배치 처리됩니다.
-   각 배치 간 500ms 대기 시간을 두어 rate limit을 방지합니다.
-   예상 소요 시간: 항목당 약 0.25초 (배치 처리로 최적화됨)

---

## 🧪 테스트 예시 (cURL)

-   **정상 케이스 (단어/숙어/문장 혼합)**:
    ```bash
    curl -X POST http://localhost:5001/api/dictionary/lookup \
      -H "Content-Type: application/json" \
      -d '{
        "words": ["apple", "make up for", "I grew up in London."],
        "options": {
          "meanings": 1,
          "definitions": 1,
          "synonyms": 0,
          "antonyms": 0,
          "related": 0,
          "meaningDisplay": "english",
          "cefrLevel": "B1",
          "outputFormat": "input-order"
        }
      }'
    ```

-   **에러 케이스 (단어 개수 초과)**:
    ```bash
    curl -X POST http://localhost:5001/api/dictionary/lookup \
      -H "Content-Type: application/json" \
      -d '{
        "words": ["word1", "word2", ..., "word501"],
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
      }'
    # 예상 응답: 422 Unprocessable Entity
    ```

---

## 📝 문서 이력
- 2025-01-13: 현재 코드베이스에 맞춰 전면 개정 (Gemini API, CEFR 레벨, 옵션 간소화 반영)
- 2025-10-09: 초안 작성
