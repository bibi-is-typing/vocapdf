# VocaPDF - 프론트엔드 개발 가이드

## 📌 개요

이 문서는 VocaPDF 프론트엔드 애플리케이션의 구조, 상태 관리, 주요 로직 및 개발 규칙에 대한 상세 가이드입니다.

---

## 🏗️ 아키텍처 및 컴포넌트 구조

프론트엔드는 **Vite** 기반의 **React** 애플리케이션이며, 기능별로 컴포넌트를 분리하는 구조를 따릅니다. 모든 핵심 로직은 `App.jsx` 컴포넌트에 집중되어 있습니다.

-   **`App.jsx`**: 애플리케이션의 메인 컴포넌트로, 모든 UI 요소와 상태, 비즈니스 로직을 포함합니다.
-   **`services/dictionaryApi.js`**: 백엔드 API와의 통신을 담당하는 함수들을 정의합니다. (`lookupWords`, `uploadFile`)
-   **`utils/pdfGenerator.js`**: `jsPDF`와 `jspdf-autotable`을 사용하여 PDF를 생성하는 로직을 담당합니다.

---

## 🔄 상태 관리 (State Management)

MVP 버전에서는 별도의 전역 상태 관리 라이브러리(Redux, Zustand 등)를 사용하지 않고, `App.jsx` 내에서 `useState` Hook을 사용하여 모든 상태를 관리합니다.

### 주요 상태 변수

-   `words`: 사용자가 텍스트 영역에 입력한 단어 문자열.
-   `wordData`: 백엔드로부터 받아온 가공된 단어 데이터 배열.
-   `options`: 사용자가 선택한 모든 PDF 생성 옵션 객체.
-   `loading`: API 요청이나 PDF 생성 등 비동기 작업의 진행 상태.
-   `error`: 에러 발생 시 에러 메시지.
-   `progress`: 로딩 중에 표시할 구체적인 진행 상황 텍스트.
-   `success`: 작업 완료 시 표시할 성공 메시지.

---

## 🔑 주요 로직 설명

### 1. 단어 조회 (`handleLookup`)

1.  `words` 상태에서 입력된 텍스트를 가져와 파싱하여 단어 배열(`wordList`)을 만듭니다.
2.  단어 개수가 0개이거나 500개를 초과하는 경우 유효성 검사를 수행하고 `error` 상태를 업데이트합니다.
3.  `setLoading(true)`, `setProgress(...)`를 호출하여 로딩 상태를 활성화합니다.
4.  `services/dictionaryApi.js`의 `lookupWords` 함수를 호출하여 백엔드에 API 요청을 보냅니다.
5.  요청이 성공하면 응답 데이터를 `wordData` 상태에 저장하고, `success` 메시지를 설정합니다.
6.  요청이 실패하면 `error` 상태에 에러 메시지를 설정합니다.
7.  `finally` 블록에서 `setLoading(false)`를 호출하여 로딩 상태를 비활성화합니다.

### 2. PDF 생성 (`handleGeneratePDF`)

1.  `wordData`가 있는지 확인하여, 데이터가 없으면 에러를 표시합니다.
2.  `setLoading(true)`로 로딩 상태를 시작합니다.
3.  `utils/pdfGenerator.js`의 `generatePDF` 함수를 `wordData`와 `options`를 인자로 전달하여 호출합니다.
4.  `generatePDF` 함수 내부에서는 `jsPDF`와 `jspdf-autotable`을 사용하여 테이블 헤더와 본문을 동적으로 구성하고, 다의어 처리를 위한 `rowSpan` 등을 적용하여 PDF 문서를 생성합니다.
5.  생성된 PDF는 `.save()` 메소드를 통해 사용자의 브라우저에서 자동으로 다운로드됩니다.
6.  `success` 메시지를 설정하고 로딩 상태를 종료합니다.

### 3. 파일 업로드 (`handleFileUpload`)

1.  `input[type="file"]`의 `onChange` 이벤트를 통해 파일 객체를 가져옵니다.
2.  `services/dictionaryApi.js`의 `uploadFile` 함수를 호출하여 백엔드에 `multipart/form-data` 요청을 보냅니다.
3.  백엔드에서 파싱된 단어 배열을 응답으로 받으면, `words` 상태를 업데이트하여 텍스트 영역에 표시합니다.

---

## 📝 개발 규칙

-   **API 통신**: 모든 백엔드 API 호출은 `services/` 폴더 내의 함수를 통해 이루어져야 합니다. 컴포넌트 내에서 직접 `axios`를 사용하지 마세요.
-   **유틸리티 함수**: 순수하고 재사용 가능한 로직(e.g., PDF 생성, 데이터 포맷팅)은 `utils/` 폴더로 분리하세요.
-   **CSS**: 전역 스타일은 `index.css`에, 컴포넌트별 스타일은 `App.css`에 작성합니다. (CSS Modules는 현재 미사용)

---

## 📝 문서 이력
- 2025-10-10: 초안 작성