# VocaPDF - API 에러 처리 가이드

## 📌 개요

이 문서는 VocaPDF 백엔드 API의 에러 처리 전략과 표준 에러 응답 형식을 정의합니다.

---

## 🎯 에러 처리 원칙

1. **일관성**: 모든 에러는 일관된 JSON 형식으로 응답하여 클라이언트가 예측 가능하게 처리할 수 있도록 합니다.
2. **명확성**: 에러 코드와 메시지를 통해 문제의 원인을 명확하게 전달합니다.
3. **보안**: 서버 내부의 민감한 정보(스택 트레이스 등)가 클라이언트에 노출되지 않도록 합니다.

---

## 📦 표준 에러 응답 형식

모든 API 에러는 다음 구조를 따릅니다.

{“success”: false,“error”: {“code”: “ERROR_CODE”,“message”: “사용자 친화적인 에러 메시지”}}


- **success**: 항상 `false`
- **error.code**: 에러 유형을 식별하는 고유한 문자열 코드
- **error.message**: 프론트엔드에서 사용자에게 표시할 수 있는 설명

---

## ⚙️ 중앙 집중식 에러 처리

모든 에러는 Express의 에러 핸들링 미들웨어(`middleware/errorHandler.js`)에서 최종적으로 처리됩니다.

라우터나 서비스 로직에서는 `try...catch` 블록을 사용하여 에러를 잡은 뒤 `next(error)`를 호출하여 미들웨어로 전달합니다.

// routes/dictionary.jsrouter.post(’/lookup’, async (req, res, next) => {try {// … 비즈니스 로직 …} catch (error) {next(error); // 에러를 중앙 핸들러로 전달}});


---

## 🏷️ 주요 에러 코드 및 상태

| HTTP 상태 코드 | 에러 코드 (code) | 설명 | 발생 위치 |
|----------------|------------------|------|-----------|
| 400 Bad Request | INVALID_REQUEST | 요청 본문(body)이 유효하지 않거나 필수 필드가 누락됨 | routes |
| 404 Not Found | NOT_FOUND | 요청한 API 엔드포인트가 존재하지 않음 | middleware |
| 413 Payload Too Large | FILE_TOO_LARGE | 업로드 파일 크기가 5MB를 초과함 | middleware (multer) |
| 422 Unprocessable Entity | VALIDATION_ERROR | 요청 데이터가 유효성 검증을 통과하지 못함 (e.g., 단어 500개 초과) | routes |
| 500 Internal Server Error | SERVER_ERROR | 예측하지 못한 서버 내부 오류 | middleware |
| 503 Service Unavailable | EXTERNAL_API_ERROR | 외부 사전 API 호출에 실패함 (네트워크 오류, 타임아웃 등) | services |

---

## 💡 커스텀 에러 클래스: AppError

예측 가능한 에러(e.g., 유효성 검증 실패)를 생성하기 위해 `AppError` 클래스를 사용합니다.

이 클래스는 `message`, `statusCode`, `code`를 인자로 받아 표준화된 에러 객체를 생성합니다.

// 사용 예시if (words.length > MAX_WORDS) {throw new AppError( 단어 개수가 최대 허용치(${MAX_WORDS}개)를 초과했습니다 ,422,‘VALIDATION_ERROR’);}


---

## 📝 문서 이력
- 2025-10-10: 초안 작성
