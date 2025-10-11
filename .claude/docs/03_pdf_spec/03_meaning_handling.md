# VocaPDF - 다의어(Polysemy) 처리

## 📌 개요

이 문서는 하나의 단어가 여러 의미(다의어)를 가질 경우, 이를 VocaPDF에서 어떻게 처리하는지에 대한 규칙과 프로세스를 상세히 설명합니다. 의미별 정보 추출, 유의어/반의어 매칭, 최종 PDF 테이블 표시 방법을 다룹니다.

---

## 🎯 처리 원칙

1.  **의미 우선순위**: API 응답에서 가장 먼저 나오는 의미를 1번(가장 일반적인 뜻), 두 번째를 2번으로 간주합니다. 사용자는 최대 2개의 의미까지 선택할 수 있습니다.
2.  **정보의 1:1 매칭**: 각 의미(Meaning)에 해당하는 영영뜻, 유의어, 반의어, 관계어를 정확히 1:1로 매칭합니다. 예를 들어, `bank`의 1번 의미(금융 기관)와 2번 의미(강둑)의 유의어는 서로 섞이지 않습니다.
3.  **사용자 선택 존중**: 사용자가 요청한 의미/유의어/반의어 개수만큼만 추출하되, API가 제공하는 정보가 그보다 적을 경우 있는 만큼만 표시합니다.

---

## 🔄 의미 추출 프로세스

### 1단계: API 응답 수신

`Free Dictionary API`로부터 단어에 대한 정보를 JSON 형식으로 받습니다. 이 응답에는 `meanings`라는 배열이 포함되어 있으며, 각 요소가 하나의 의미 단위를 나타냅니다.

```json
// "bank"에 대한 API 응답 예시 (간소화)
[
  {
    "word": "bank",
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "A financial institution...",
            "synonyms": ["institution", "treasury"],
            "antonyms": []
          }
        ]
      },
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "The land alongside a river...",
            "synonyms": ["shore", "riverside"],
            "antonyms": []
          }
        ]
      }
    ]
  }
]
```

### 2단계: 추출할 의미 개수 결정

사용자가 선택한 의미 개수와 API가 제공하는 실제 의미 개수 중 **더 작은 값**을 기준으로 추출할 개수를 정합니다.

```javascript
// 사용자가 2개를 원하고, API에 3개가 있으면 -> 2개 추출
// 사용자가 2개를 원하고, API에 1개만 있으면 -> 1개 추출
const userWantsMeanings = options.meanings; // 사용자가 선택한 의미 개수 (1 or 2)
const availableMeanings = apiResponse[0].meanings.length; // API가 제공하는 의미 개수

const meaningsToExtract = Math.min(userWantsMeanings, availableMeanings);
```

### 3단계: 의미별 정보 추출 및 가공

결정된 개수만큼 `meanings` 배열을 순회하며 각 의미에 대한 정보를 추출합니다. 이때, 사용자가 요청한 유의어/반의어 개수에 맞춰 `slice()`를 사용해 데이터를 제한합니다.

```javascript
// utils/meaningExtractor.js

function extractMeanings(apiData, options) {
  const word = apiData[0].word;
  const allMeanings = apiData[0].meanings;
  const result = { word: word, meanings: [] };

  const meaningsCount = Math.min(options.meanings, allMeanings.length);

  for (let i = 0; i < meaningsCount; i++) {
    const meaning = allMeanings[i];
    // 각 의미마다 여러 definition이 있을 수 있으므로, 첫 번째 것을 기준으로 삼음
    const definition = meaning.definitions[0]; 

    result.meanings.push({
      meaningNumber: i + 1,
      definition: definition.definition,
      synonyms: (definition.synonyms || []).slice(0, options.synonyms),
      antonyms: (definition.antonyms || []).slice(0, options.antonyms),
      // 관계어는 API에서 제공하지 않으므로 별도 처리 또는 빈 배열 반환
      related: [] 
    });
  }
  return result;
}
```

### 4단계: 최종 데이터 구조 생성

추출 및 가공이 완료되면, PDF 생성을 위해 다음과 같이 정제된 데이터 구조를 만듭니다.

```json
// "bank"에 대한 최종 가공 데이터 예시
{
  "word": "bank",
  "meanings": [
    {
      "meaningNumber": 1,
      "definition": "A financial institution...",
      "synonyms": ["institution", "treasury"],
      "antonyms": [],
      "related": []
    },
    {
      "meaningNumber": 2,
      "definition": "The land alongside a river...",
      "synonyms": ["shore", "riverside"],
      "antonyms": [],
      "related": []
    }
  ]
}
```

---

## 🎨 PDF 테이블 표시 규칙

추출된 다의어 정보는 PDF 테이블에서 여러 행에 걸쳐 표시되며, **단어 셀은 수직으로 병합(rowspan)**하여 하나의 단어임을 시각적으로 명확하게 합니다.

-   **의미 2개인 `bank`의 경우**:
| ☐ | **bank** | *1* | A financial institution... | institution, treasury | - |
| :-: | | *2* | The land alongside... | shore, riverside | - |
-   **의미 1개인 `apple`의 경우** (병합 없음):
| ☐ | **apple** | *1* | A round fruit... | fruit, pomaceous | - |
| :-: | :-: | :-: | :--- | :--- | :--- |

---

## 🔍 특수 케이스 처리

-   **정보 부족**: 사용자가 유의어 2개를 요청했으나 API에 1개만 있는 경우, 있는 1개만 표시합니다.
-   **정보 없음**: 유의어/반의어 정보가 전혀 없는 경우, 해당 셀에 하이픈(`-`)을 표시합니다.
-   **의미 부족**: 사용자가 의미 2개를 요청했으나 API에 1개만 있는 경우, 1개의 의미만 테이블에 표시합니다.
-   **품사 다름**: `run`(달리다, verb)과 `run`(운영, verb)처럼 품사가 다른 의미가 있어도, MVP 단계에서는 품사를 별도로 표시하지 않고 순서대로 추출합니다.

---

## 📊 데이터 흐름 요약

```
[API 응답 (Raw JSON)]
         ↓
[의미 개수 확인 (사용자 옵션 vs API 데이터)]
         ↓
[의미별 루프 실행] -> [정보 추출] -> [개수 제한 적용]
         ↓
[가공된 데이터 객체 생성]
         ↓
[PDF 테이블 렌더링 (단어 셀 병합 적용)]
```

---

## 📝 문서 이력
- 2025-10-09: 초안 작성