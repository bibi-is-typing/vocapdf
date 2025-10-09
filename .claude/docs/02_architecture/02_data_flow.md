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

-   **입력 데이터**:
    ```
    apple
    banana
    computer
    ```
-   **처리 과정**:
    ```javascript
    // 프론트엔드
    const inputText = "apple\nbanana\ncomputer";
    ```

### 파일 업로드

-   **파일 내용 (`words.txt`)**:
    ```
    apple
    banana
    computer
    ```
-   **처리 과정**:
    ```javascript
    // 프론트엔드
    const file = event.target.files[0];
    const text = await file.text();
    ```

---

## 2️⃣ 입력 처리 및 검증

### 파싱

-   **입력 텍스트 → 단어 배열** (줄바꿈 기준):
    ```javascript
    // utils/fileParser.js
    const words = inputText
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    // 결과: ["apple", "banana", "computer"]
    ```
-   **쉼표로 구분된 경우**:
    ```javascript
    const input = "apple, banana, computer";
    const words = input
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    // 결과: ["apple", "banana", "computer"]
    ```

### 검증

-   **클라이언트 측 검증**:
    ```javascript
    // 1. 단어 개수 체크
    if (words.length === 0) {
      throw new Error("단어를 입력해주세요");
    }
    if (words.length > 500) {
      throw new Error("최대 500개까지 입력 가능합니다");
    }

    // 2. 경고 메시지
    if (words.length > 300) {
      showWarning("처리 시간이 오래 걸릴 수 있습니다");
    }
    ```

---

## 3️⃣ 옵션 선택

### 옵션 상태

-   **사용자 선택 값**:
    ```javascript
    const options = {
      meanings: 2,        // 의미 개수
      definitions: 1,     // 영영뜻 개수
      synonyms: 2,        // 유의어 개수
      antonyms: 0,        // 반의어 개수
      related: 2,         // 관계어 개수
      checkbox: true,     // 체크박스 추가
      date: false         // 날짜 표시
    };
    ```

---

## 4️⃣ 백엔드 API 호출

### 요청 데이터 구성

-   **프론트엔드 → 백엔드**:
    ```javascript
    // services/api.js
    const requestData = {
      words: ["apple", "banana", "computer"],
      options: {
        meanings: 2,
        definitions: 1,
        synonyms: 2,
        antonyms: 0,
        related: 2
      }
    };

    const response = await axios.post(
      'http://localhost:5000/api/dictionary/lookup',
      requestData
    );
    ```

### 백엔드 요청 수신

-   **백엔드 라우트**:
    ```javascript
    // routes/dictionary.js
    router.post('/lookup', async (req, res) => {
      const { words, options } = req.body;
      
      // 서비스 호출
      const result = await dictionaryService.lookupWords(words, options);
      
      res.json(result);
    });
    ```

---

## 5️⃣ 외부 사전 API 조회

### 단어별 조회

-   **백엔드 → Free Dictionary API**:
    ```javascript
    // services/dictionaryService.js
    async function lookupWords(words, options) {
      const results = [];
      for (const word of words) {
        try {
          // API 호출
          const response = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );
          
          // 데이터 처리
          const processed = processWordData(response.data, options);
          results.push(processed);

        } catch (error) {
          // 단어를 찾을 수 없는 경우
          results.push({
            word: word,
            error: "사전에서 찾을 수 없습니다"
          });
        }
      }
      return results;
    }
    ```

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

-   **다의어 처리 로직**:
    ```javascript
    // utils/meaningExtractor.js
    function extractMeanings(apiData, options) {
      const word = apiData.word;
      const meanings = apiData.meanings;
      const result = {
        word: word,
        meanings: []
      };

      // 의미 개수만큼 추출 (옵션 값과 실제 데이터 중 작은 값 기준)
      const maxMeanings = Math.min(options.meanings, meanings.length);

      for (let i = 0; i < maxMeanings; i++) {
        const meaning = meanings[i];
        const def = meaning.definitions[0]; // 각 의미의 첫 번째 definition 사용
        
        result.meanings.push({
          meaningNumber: i + 1,
          definition: def.definition,
          synonyms: extractSynonyms(def, options.synonyms),
          antonyms: extractAntonyms(def, options.antonyms),
          related: extractRelated(def, options.related) // 'related'는 별도 로직 필요
        });
      }
      return result;
    }
    ```

### 유의어/반의어 추출

-   **개수 제한 적용**:
    ```javascript
    // utils/meaningExtractor.js
    function extractSynonyms(definition, count) {
      if (count === 0) return [];
      const synonyms = definition.synonyms || [];
      return synonyms.slice(0, count); // 요청 개수만큼만 반환
    }

    function extractAntonyms(definition, count) {
      if (count === 0) return [];
      const antonyms = definition.antonyms || [];
      return antonyms.slice(0, count);
    }
    ```

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

### 백엔드 응답

-   **전체 응답 구조**:
    ```json
    {
      "success": true,
      "data": [
        {
          "word": "apple",
          "meanings": [...]
        },
        {
          "word": "banana",
          "meanings": [...]
        },
        {
          "word": "computer",
          "meanings": [...]
        }
      ]
    }
    ```

### 프론트엔드에서 수신

-   **상태 업데이트**:
    ```javascript
    // components/PDFGenerator.jsx
    const [wordData, setWordData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWordData = async () => {
      setLoading(true);
      try {
        const response = await api.lookupWords(words, options);
        if (response.success) {
          setWordData(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    ```

---

## 8️⃣ PDF 생성

### jsPDF 변환

`jspdf`와 `jspdf-autotable` 라이브러리를 사용해 동적으로 테이블 데이터를 구성하고 PDF를 생성합니다.

```javascript
// utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function generatePDF(wordData, options) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 날짜 표시 (옵션)
  if (options.date) {
    const today = new Date().toISOString().split('T')[0];
    doc.text(`학습일: ${today}`, 15, 15);
  }

  // 테이블 헤더
  const headers = [];
  if (options.checkbox) headers.push('☐');
  headers.push('단어', '의미', '영영뜻');
  if (options.synonyms > 0) headers.push('유의어');
  if (options.antonyms > 0) headers.push('반의어');
  if (options.related > 0) headers.push('관계어');

  // 테이블 데이터
  const body = [];
  for (const item of wordData) {
    for (let i = 0; i < item.meanings.length; i++) {
      const meaning = item.meanings[i];
      const row = [];

      if (options.checkbox) row.push('');
      row.push(i === 0 ? item.word : ''); // 첫 번째 의미에만 단어 표시
      row.push(meaning.meaningNumber);
      row.push(meaning.definition);
      if (options.synonyms > 0) row.push(meaning.synonyms.join(', ') || '-');
      if (options.antonyms > 0) row.push(meaning.antonyms.join(', ') || '-');
      if (options.related > 0) row.push(meaning.related.join(', ') || '-');
      
      body.push(row);
    }
  }

  // autoTable로 테이블 생성
  doc.autoTable({
    head: [headers],
    body: body,
    startY: options.date ? 20 : 15
  });

  return doc;
}
```

---

## 9️⃣ 다운로드

### 파일명 생성

타임스탬프를 포함하여 고유한 파일명을 생성합니다.

```javascript
function generateFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `vocapdf_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`;
  // 예: vocapdf_20251009_193552.pdf
}
```

### PDF 다운로드

생성된 PDF 문서를 브라우저에서 자동으로 다운로드합니다.

```javascript
function downloadPDF(doc) {
  const fileName = generateFileName();
  doc.save(fileName);
}
```

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