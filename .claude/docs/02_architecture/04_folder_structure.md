# VocaPDF - 폴더 구조

## 📌 개요

이 문서는 VocaPDF 프로젝트의 전체 폴더 구조를 설명합니다. 각 폴더와 파일의 역할, 그리고 프로젝트 전반에 적용되는 명명 규칙을 정의합니다.

---

## 📁 전체 프로젝트 구조

최상위 레벨은 프론트엔드, 백엔드, 그리고 프로젝트 관련 문서로 구성됩니다.

```
vocapdf/
├── frontend/         # 프론트엔드 (React + Vite)
├── backend/          # 백엔드 (Node.js + Express)
├── .claude/          # AI 에이전트 개발 문서
├── .gitignore        # Git 추적 제외 파일 목록
└── README.md         # 프로젝트 개요
```

---

## 🎨 프론트엔드 구조 (`frontend/`)

### 전체 구조

Vite 기반의 표준 React 프로젝트 구조를 따릅니다.

```
frontend/
├── public/               # 정적 파일 (빌드 시 그대로 복사됨)
│
├── src/                  # 소스 코드 루트
│   ├── components/       # 재사용 가능한 React 컴포넌트
│   ├── services/         # API 통신 및 외부 서비스 연동
│   ├── utils/            # 순수 함수 유틸리티
│   ├── hooks/            # 커스텀 React Hooks
│   ├── styles/           # 전역 스타일시트
│   ├── App.jsx           # 메인 애플리케이션 컴포넌트
│   ├── main.jsx          # 애플리케이션 진입점 (Entry Point)
│   └── ...
│
├── .eslintrc.js          # ESLint 설정
├── .prettierrc           # Prettier 설정
├── index.html            # HTML 템플릿
├── package.json          # 프로젝트 의존성 및 스크립트
├── vite.config.js        # Vite 설정
└── .gitignore
```

### 주요 폴더 상세 설명

#### `components/`

-   UI를 구성하는 독립적인 컴포넌트들을 기능 단위로 그룹화합니다.
-   **예시**:
    ```
    components/
    ├── WordInput/        # 단어 입력 (텍스트, 파일) 관련 컴포넌트
    ├── OptionsPanel/     # PDF 생성 옵션 패널 컴포넌트
    ├── PDFPreview/       # 생성 전 PDF 미리보기 모달 컴포넌트
    └── PDFGenerator/     # PDF 생성 및 다운로드 버튼 컴포넌트
    ```

#### `services/`

-   백엔드 API 서버와의 통신을 담당합니다.
-   **`api.js`**: `axios` 인스턴스를 생성하고 `baseURL`, `timeout` 등 공통 설정을 관리합니다.
    ```javascript
    // services/api.js
    import axios from 'axios';

    const api = axios.create({
      baseURL: 'http://localhost:5000',
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    export default api;
    ```
-   **`dictionaryApi.js`**: 사전 API와 관련된 함수들을 정의합니다.
    ```javascript
    // services/dictionaryApi.js
    import api from './api';

    export const lookupWords = async (words, options) => {
      const response = await api.post('/api/dictionary/lookup', { words, options });
      return response.data;
    };
    ```

#### `utils/`

-   애플리케이션 전반에서 사용되는 순수 함수들을 모아둡니다.
    -   `pdfGenerator.js`: `jsPDF`를 사용하여 PDF 문서를 생성하는 로직.
    -   `fileParser.js`: 업로드된 텍스트 파일을 파싱하여 단어 배열로 변환하는 로직.
    -   `dataFormatter.js`: API 응답 데이터를 UI에 맞게 가공하는 로직.

#### `hooks/`

-   상태 관련 로직을 분리하여 재사용하기 위한 커스텀 훅을 정의합니다.
-   **`useWordLookup.js`**: 단어 조회 API 호출과 관련된 상태(로딩, 데이터, 에러)를 관리합니다.
    ```javascript
    // hooks/useWordLookup.js
    import { useState } from 'react';
    import { lookupWords } from '../services/dictionaryApi';

    export const useWordLookup = () => {
      const [loading, setLoading] = useState(false);
      const [data, setData] = useState(null);
      const [error, setError] = useState(null);

      const lookup = async (words, options) => {
        setLoading(true);
        setData(null);
        setError(null);
        try {
          const result = await lookupWords(words, options);
          setData(result);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      return { lookup, loading, data, error };
    };
    ```

---

## ⚙️ 백엔드 구조 (`backend/`)

### 전체 구조

Express.js의 일반적인 MVC(Model-View-Controller) 패턴을 변형한 레이어드 아키텍처를 사용합니다.

```
backend/
├── src/                  # 소스 코드 루트
│   ├── routes/           # API 엔드포인트 및 라우팅 정의
│   ├── services/         # 비즈니스 로직 처리
│   ├── utils/            # 보조 함수 및 유틸리티
│   ├── middleware/       # Express 미들웨어 (에러 처리 등)
│   ├── config/           # 프로젝트 설정 및 상수
│   └── server.js         # 서버 시작 및 Express 앱 설정
│
├── uploads/              # 파일 업로드 임시 저장 폴더
├── .env                  # 환경 변수 파일
├── package.json
└── .gitignore
```

### 주요 폴더 상세 설명

#### `routes/`

-   API 엔드포인트를 정의하고, 해당 요청을 처리할 서비스 로직으로 연결합니다.
    ```javascript
    // routes/dictionary.js
    const express = require('express');
    const router = express.Router();
    const dictionaryService = require('../services/dictionaryService');

    router.post('/lookup', async (req, res, next) => {
      try {
        const { words, options } = req.body;
        const result = await dictionaryService.lookupWords(words, options);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error); // 에러는 에러 핸들링 미들웨어로 전달
      }
    });

    module.exports = router;
    ```

#### `services/`

-   핵심 비즈니스 로직을 수행합니다. 외부 API 호출, 데이터 가공 등의 작업을 담당합니다.
    ```javascript
    // services/dictionaryService.js
    const axios = require('axios');
    const dataProcessService = require('./dataProcessService');

    async function lookupWords(words, options) {
      // ... 외부 API 호출 및 데이터 가공 로직 ...
    }
    ```

#### `middleware/`

-   요청과 응답 사이클에 개입하는 미들웨어를 정의합니다.
-   **`errorHandler.js`**: 프로젝트 전역에서 발생하는 에러를 처리하여 일관된 형식으로 응답합니다.
    ```javascript
    // middleware/errorHandler.js
    function errorHandler(err, req, res, next) {
      console.error(err);
      res.status(err.status || 500).json({
        success: false,
        error: err.message || '서버 에러가 발생했습니다'
      });
    }
    ```

#### `config/`

-   애플리케이션에서 사용되는 상수 값을 관리합니다.
    ```javascript
    // config/constants.js
    module.exports = {
      MAX_WORDS: 500,
      MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
      PORT: process.env.PORT || 5000
    };
    ```

---

## 🎯 명명 규칙

### 파일명

-   **컴포넌트**: `PascalCase` (e.g., `WordInput.jsx`)
-   **기타 JS 파일** (훅, 유틸, 서비스): `camelCase` (e.g., `useWordLookup.js`, `dictionaryApi.js`)
-   **CSS Modules**: `*.module.css` (e.g., `WordInput.module.css`)

### 폴더명

-   **모두 소문자** 사용.
-   내부에 여러 파일이 포함될 경우 **복수형** 사용 (e.g., `components`, `services`, `routes`).

### 변수명

-   **일반 변수/함수**: `camelCase` (e.g., `wordList`, `fetchData`)
-   **상수**: `UPPER_SNAKE_CASE` (e.g., `MAX_WORDS`)
-   **React 컴포넌트**: `PascalCase` (e.g., `const WordInput = () => ...`)

---

## 🔄 확장 시 추가 폴더 (Phase 2 이후)

### 프론트엔드

-   `src/store/`: Zustand, Redux 등 전역 상태 관리
-   `src/types/`: TypeScript 타입 정의
-   `src/constants/`: 프론트엔드 전용 상수

### 백엔드

-   `src/models/`: 데이터베이스 스키마 및 모델 (MongoDB, PostgreSQL 등)
-   `src/controllers/`: 라우트와 서비스 로직을 분리하는 컨트롤러 계층
-   `src/tests/`: 단위 테스트, 통합 테스트 코드

---

## 📝 문서 이력
- 2025-10-09: 초안 작성