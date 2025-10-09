# VocaPDF - API 명세서

## 📌 개요

이 문서는 VocaPDF 프로젝트의 프론트엔드와 백엔드 간에 사용되는 HTTP API의 명세를 정의합니다. 모든 엔드포인트, 요청/응답 형식, 에러 코드를 포함합니다.

---

## 🌐 기본 정보

### Base URL

-   **개발 환경**: `http://localhost:5000`
-   **프로덕션 환경**: `https://api.vocapdf.com` (도메인 연결 시)

### 공통 헤더

-   모든 요청은 `Content-Type: application/json` 헤더를 포함해야 합니다. (파일 업로드 제외)
-   CORS 정책에 따라 허용된 Origin 및 Method만 요청이 가능합니다.

---

## 📡 엔드포인트: 단어 조회

### `POST /api/dictionary/lookup`

여러 단어의 사전 정보를 한 번에 조회하고, 사용자 옵션에 맞게 가공하여 반환합니다.

#### 요청 (Request)

-   **Body**:
    ```json
    {
      "words": ["apple", "bank", "computer"],
      "options": {
        "meanings": 2,
        "definitions": 1,
        "synonyms": 2,
        "antonyms": 0,
        "related": 2
      }
    }
    ```

-   **Body 필드 설명**:

| 필드 | 타입 | 필수 | 설명 |
| :--- | :--- | :--: | :--- |
| `words` | `Array<string>` | ✅ | 조회할 단어 목록 (최대 500개) |
| `options` | `Object` | ✅ | 데이터 가공 옵션 |
| `options.meanings` | `number` | ✅ | 추출할 의미 개수 (1 또는 2) |
| `options.definitions` | `number` | ✅ | 추출할 영영뜻 개수 (0, 1, 2) |
| `options.synonyms` | `number` | ✅ | 추출할 유의어 개수 (0, 1, 2) |
| `options.antonyms` | `number` | ✅ | 추출할 반의어 개수 (0, 1, 2) |
| `options.related` | `number` | ✅ | 추출할 관계어 개수 (0, 1, 2) |

#### 응답 (Response)

-   **성공 (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "word": "bank",
          "meanings": [
            {
              "meaningNumber": 1,
              "definition": "A financial institution",
              "synonyms": ["institution", "treasury"],
              "antonyms": [],
              "related": []
            },
            {
              "meaningNumber": 2,
              "definition": "The land alongside a river",
              "synonyms": ["shore", "riverside"],
              "antonyms": [],
              "related": []
            }
          ]
        },
        {
          "word": "abcdefghijk",
          "error": "사전에서 찾을 수 없습니다",
          "meanings": []
        }
      ],
      "meta": {
        "totalWords": 2,
        "processedWords": 1,
        "failedWords": 1,
        "processingTime": "1.8s"
      }
    }
    ```
    -   **특징**: 일부 단어 조회에 실패하더라도 전체 요청은 성공(`success: true`)으로 처리됩니다. 실패한 단어는 `error` 필드를 포함하며, `meta` 객체에 처리 결과가 요약됩니다.

---

## 📡 엔드포인트: 파일 업로드 (선택사항)

### `POST /api/upload`

사용자가 업로드한 텍스트 파일(`.csv`, `.txt`, `.md`)을 파싱하여 단어 배열을 반환합니다.

#### 요청 (Request)

-   **Headers**: `Content-Type: multipart/form-data`
-   **Body (FormData)**: `file` 키에 바이너리 파일 데이터 포함

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
    "details": { ... } // 추가 정보 (선택)
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

## 🧪 테스트 예시 (cURL)

-   **정상 케이스 (다의어 포함)**:
    ```bash
    curl -X POST http://localhost:5000/api/dictionary/lookup \
      -H "Content-Type: application/json" \
      -d '{
        "words": ["apple", "bank"],
        "options": { "meanings": 2, "definitions": 1, "synonyms": 2, "antonyms": 0, "related": 0 }
      }'
    ```

-   **에러 케이스 (단어 개수 초과)**:
    ```bash
    curl -X POST http://localhost:5000/api/dictionary/lookup \
      -H "Content-Type: application/json" \
      -d '{
        "words": ["word1", "word2", ..., "word501"],
        "options": { "meanings": 1, "definitions": 1, "synonyms": 0, "antonyms": 0, "related": 0 }
      }'
    # 예상 응답: 422 Unprocessable Entity
    ```

---

## 📝 문서 이력
- 2025-10-09: 초안 작성