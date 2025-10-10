# VocaPDF - 데이터 플로우

## 📌 개요

이 문서는 VocaPDF에서 데이터가 어떻게 흐르는지 단계별로 설명합니다. 사용자 입력부터 PDF 다운로드까지 전체 프로세스를 다룹니다.

---

## 🔄 전체 데이터 플로우

### 단계별 흐름

```
[1. 사용자 입력]
       ↓
[2. 입력 처리 및 검증]
       ↓
[3. 옵션 선택]
       ↓
[4. 백엔드 API 호출]
       ↓
[5. 외부 사전 API 조회]
       ↓
[6. 데이터 가공]
       ↓
[7. 프론트엔드 응답 수신]
       ↓
[8. PDF 생성]
       ↓
[9. 다운로드]
```

---

## 1️⃣ 사용자 입력

### 텍스트 입력

사용자가 텍스트 영역에 단어를 입력하거나 파일을 업로드합니다.

**예시**:
```
apple
banana
computer
```

---

## 2️⃣ 입력 처리 및 검증

### 파싱 및 검증

입력 텍스트를 줄바꿈 또는 쉼표 기준으로 분리하여 단어 배열로 변환합니다.

**결과**: `["apple", "banana", "computer"]`

**검증 규칙**:
- 빈 단어 제거
- 최대 500개 제한
- 300개 이상 시 경고 메시지

---

## 3️⃣ 옵션 선택

### 옵션 선택

사용자가 PDF 생성에 필요한 옵션을 선택합니다:
- 의미 개수 (1-2개)
- 영영뜻/유의어/반의어/관계어 개수 (0-2개)
- 체크박스/날짜 표시 여부

---

## 4️⃣ 백엔드 API 호출

### API 요청

프론트엔드가 단어 배열과 옵션을 백엔드 API(`POST /api/dictionary/lookup`)로 전송합니다.

---

## 5️⃣ 외부 사전 API 조회

### 단어별 조회

백엔드가 각 단어를 Lingua Robot API 또는 Free Dictionary API로 조회합니다.

**성공 시**: 의미, 정의, 유의어 등 데이터 반환
**실패 시**: 에러 메시지와 함께 반환

### API 응답 예시

-   **Free Dictionary API 응답 (간소화)**:
    ```json
    [
      {
        "word": "bank",
        "meanings": [
          {
            "partOfSpeech": "noun",
            "definitions": [
              {
                "definition": "A financial institution",
                "synonyms": ["institution", "treasury"],
                "antonyms": [],
                "example": "I need to go to the bank"
              }
            ]
          },
          {
            "partOfSpeech": "noun",
            "definitions": [
              {
                "definition": "The land alongside a river",
                "synonyms": ["shore", "riverside"],
                "antonyms": [],
                "example": "We sat on the river bank"
              }
            ]
          }
        ]
      }
    ]
    ```

---

## 6️⃣ 데이터 가공

### 의미별 정보 추출

API 응답에서 사용자가 선택한 옵션에 맞게 데이터를 추출합니다:
- 의미 개수만큼 분리
- 각 의미별로 유의어/반의어 추출 (요청 개수만큼만)

### 가공된 데이터 구조

-   **최종 데이터**:
    ```json
    {
      "word": "bank",
      "meanings": [
        {
          "meaningNumber": 1,
          "definition": "A financial institution",
          "synonyms": ["institution", "treasury"],
          "antonyms": [],
          "related": ["money", "account"]
        },
        {
          "meaningNumber": 2,
          "definition": "The land alongside a river",
          "synonyms": ["shore", "riverside"],
          "antonyms": [],
          "related": ["river", "water"]
        }
      ]
    }
    ```

---

## 7️⃣ 프론트엔드 응답 수신

### 응답 수신

백엔드가 처리된 데이터를 프론트엔드로 반환합니다.

**응답 구조**: 단어 배열, 각 단어는 의미별 정보 포함

---

## 8️⃣ PDF 생성

### jsPDF 변환

`jspdf`와 `jspdf-autotable`로 받은 데이터를 PDF 테이블로 변환합니다.

**처리 과정**:
1. 옵션에 따라 테이블 헤더 구성
2. 각 단어의 의미별로 행 생성
3. 다의어는 셀 병합 처리
4. 페이지 자동 나누기

---

## 9️⃣ 다운로드

### 파일 다운로드

타임스탬프를 포함한 파일명(`vocapdf_YYYYMMDD_HHMMSS.pdf`)으로 자동 다운로드됩니다.

---

## 🔄 에러 처리 플로우

### 단어 조회 실패

```
[백엔드 API 호출]
       ↓
[Free Dictionary API 조회]
       ↓
[404 에러 - 단어 없음]
       ↓
[에러 데이터 반환]
       ↓
[프론트엔드 수신]
       ↓
[PDF에 "정보 없음" 표시]
```

-   **데이터 구조**:
    ```json
    {
      "word": "abcdefghijk",
      "error": "사전에서 찾을 수 없습니다",
      "meanings": []
    }
    ```

### 네트워크 에러

```
[API 호출]
       ↓
[타임아웃 또는 연결 실패]
       ↓
[재시도 (최대 2회)]
       ↓
[실패 시 에러 메시지]
       ↓
[사용자에게 알림]
```

---

## 📊 데이터 변환 요약

```
입력 텍스트
"apple\nbanana"
       ↓ (파싱)
배열
["apple", "banana"]
       ↓ (API 호출)
API 응답
[{ "word": "apple", "meanings": [...] }, ...]
       ↓ (가공)
가공된 데이터
[{ "word": "apple", "meanings": [...] }, ...]
       ↓ (PDF 변환)
PDF 파일
vocapdf_20251009.pdf
```

---

## 📝 문서 이력
- 2025-10-09: 초안 작성