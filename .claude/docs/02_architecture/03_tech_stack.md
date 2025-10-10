# VocaPDF - 기술 스택

## 📌 개요

이 문서는 VocaPDF에서 사용하는 모든 기술, 라이브러리, 도구를 설명합니다. 각 기술의 선택 이유와 버전 정보를 포함합니다.

---

## 🎨 프론트엔드

### 코어 기술

#### React

-   **버전**: 18.x
-   **역할**: UI 라이브러리
-   **선택 이유**:
    -   컴포넌트 기반 구조로 재사용성과 유지보수성이 높음.
    -   풍부한 생태계와 커뮤니티를 통해 자료 및 라이브러리 확보가 용이함.
    -   AI 증강 코딩(Augmented Coding)에 최적화된 구조.

#### Vite

-   **버전**: 5.x
-   **역할**: 빌드 도구 및 번들러
-   **선택 이유**:
    -   ESM(ECMAScript Modules) 기반의 빠른 개발 서버 구동.
    -   HMR(Hot Module Replacement) 성능이 뛰어나 개발 생산성 향상.
    -   CRA(Create React App)보다 가볍고 빠른 빌드 속도.

### 라이브러리

#### jsPDF

-   **버전**: 2.5.x
-   **역할**: PDF 생성
-   **선택 이유**:
    -   서버 의존성 없이 클라이언트 측에서 동적으로 PDF 생성 가능.
    -   서버 부하를 줄일 수 있어 비용 효율적임.
    -   API가 직관적이고 사용법이 간단함.
-   **설치**:
    ```bash
    npm install jspdf
    ```
-   **사용 예시**:
    ```javascript
    import jsPDF from 'jspdf';

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.text('Hello World', 10, 10);
    doc.save('document.pdf');
    ```

#### jsPDF-AutoTable

-   **버전**: 3.8.x
-   **역할**: jsPDF용 테이블 생성 플러그인
-   **선택 이유**:
    -   복잡한 테이블 데이터를 PDF에 쉽게 추가 가능.
    -   자동 페이지 나누기, 스타일링, 셀 병합 등 고급 기능 지원.
-   **설치**:
    ```bash
    npm install jspdf-autotable
    ```
-   **사용 예시**:
    ```javascript
    import jsPDF from 'jspdf';
    import 'jspdf-autotable';

    const doc = new jsPDF();
    doc.autoTable({
      head: [['단어', '뜻']],
      body: [
        ['apple', 'a fruit'],
        ['banana', 'a fruit']
      ]
    });
    doc.save('table.pdf');
    ```

#### Axios

-   **버전**: 1.6.x
-   **역할**: HTTP 클라이언트
-   **선택 이유**:
    -   Promise 기반으로 비동기 통신을 깔끔하게 처리.
    -   요청/응답 인터셉터, 타임아웃 설정 등 다양한 기능 제공.
    -   브라우저와 Node.js 환경 모두에서 사용 가능.
-   **설치**:
    ```bash
    npm install axios
    ```

#### React Hook Form

-   **버전**: 7.x
-   **역할**: 폼(Form) 상태 관리
-   **선택 이유**:
    -   불필요한 리렌더링을 최소화하여 폼 성능 최적화.
    -   직관적인 API로 폼 상태 및 유효성 검증을 쉽게 구현.
-   **설치**:
    ```bash
    npm install react-hook-form
    ```

### 스타일링

#### CSS Modules

-   **역할**: 컴포넌트 단위 스타일링
-   **선택 이유**:
    -   스타일을 각 컴포넌트 파일에 종속시켜 전역 스코프 오염 방지.
    -   클래스명 충돌 문제로부터 자유로움.
    -   별도 라이브러리 설치 없이 Vite에서 기본 지원.
-   **사용 예시**:
    ```css
    /* App.module.css */
    .container {
      padding: 20px;
      border: 1px solid #ddd;
    }
    ```
    ```javascript
    // App.jsx
    import styles from './App.module.css';

    function App() {
      return <div className={styles.container}>...</div>;
    }
    ```

---

## ⚙️ 백엔드

### 코어 기술

#### Node.js

-   **버전**: 18.x 이상
-   **역할**: JavaScript 런타임 환경
-   **선택 이유**:
    -   프론트엔드와 동일한 JavaScript 언어를 사용하여 풀스택 개발 용이.
    -   이벤트 기반, 논블로킹 I/O 모델로 비동기 처리에 강점.
    -   npm을 통한 거대한 패키지 생태계 활용.

#### Express.js

-   **버전**: 4.x
-   **역할**: 웹 프레임워크
-   **선택 이유**:
    -   최소한의 기능만 갖춘 가볍고 유연한 프레임워크.
    -   강력한 미들웨어 시스템을 통해 필요한 기능을 쉽게 확장 가능.
    -   간결한 라우팅 처리 방식으로 빠르게 API 서버 구축 가능.
-   **설치**:
    ```bash
    npm install express
    ```

### 라이브러리

#### Axios (백엔드용)

-   **역할**: 외부 API 호출 클라이언트
-   **선택 이유**:
    -   Free Dictionary API와 같은 외부 서비스와 통신하기 위해 사용.
    -   프론트엔드와 동일한 라이브러리를 사용하여 개발 경험 통일.

#### CORS

-   **역할**: Cross-Origin Resource Sharing 처리 미들웨어
-   **선택 이유**:
    -   다른 도메인(e.g., `localhost:5173` vs `localhost:5000`) 간의 API 요청을 허용하기 위해 필수.
    -   간단한 설정으로 보안 정책 적용 가능.
-   **설치**:
    ```bash
    npm install cors
    ```

#### Multer

-   **역할**: 파일 업로드 처리 미들웨어
-   **선택 이유**:
    -   `multipart/form-data` 형식의 요청을 쉽게 처리.
    -   파일 크기, 형식 제한 등 업로드 관련 정책 설정이 용이.
-   **설치**:
    ```bash
    npm install multer
    ```

#### dotenv

-   **역할**: 환경 변수 관리
-   **선택 이유**:
    -   API 키, 포트 번호 등 민감하거나 환경에 따라 달라지는 설정을 `.env` 파일로 분리.
    -   코드와 설정을 분리하여 보안 및 유지보수성 향상.
-   **설치**:
    ```bash
    npm install dotenv
    ```

### 개발 도구

#### Nodemon

-   **역할**: 개발 서버 자동 재시작
-   **선택 이유**:
    -   소스 코드 변경을 감지하여 서버를 자동으로 재시작함으로써 개발 효율 증대.
-   **설치**:
    ```bash
    npm install --save-dev nodemon
    ```
-   **`package.json` 설정**:
    ```json
    {
      "scripts": {
        "dev": "nodemon src/server.js"
      }
    }
    ```

---

## 🌐 외부 API

### Free Dictionary API

-   **기본 정보**:
    -   **URL**: `https://api.dictionaryapi.dev`
    -   **버전**: v2
    -   **인증**: 불필요
    -   **비용**: 무료
-   **엔드포인트**: `GET /api/v2/entries/en/{word}`
-   **선택 이유**:
    -   인증 절차 없이 즉시 사용 가능한 무료 오픈소스 API.
    -   유의어, 반의어, 발음 등 풍부한 사전 정보를 제공.
    -   MVP 단계의 프로젝트에 적합한 안정성과 기능.

---

## 🛠️ 개발 도구

### 버전 관리

-   **Git**: 소스 코드 버전 관리를 위한 표준 시스템.
-   **GitHub**: Git 원격 저장소 및 협업 플랫폼.

### 패키지 관리

-   **npm**: Node.js의 기본 패키지 관리자로, 방대한 패키지 생태계에 접근 가능.

### 코드 품질

-   **ESLint**: 코드의 잠재적 오류를 찾고 코딩 스타일을 강제하는 린터.
-   **Prettier**: 일관된 코드 스타일을 자동으로 적용하는 코드 포맷터.

---

## 🚀 배포 환경

### 프론트엔드 배포

-   **Vercel**:
    -   **역할**: 프론트엔드 정적 호스팅.
    -   **선택 이유**: 개인 프로젝트를 위한 무료 플랜, Git 연동을 통한 자동 빌드/배포(CI/CD), 빠른 속도를 위한 CDN 제공.

### 백엔드 배포

-   **맥미니 (로컬 서버)**:
    -   **역할**: 백엔드 애플리케이션 서버.
    -   **선택 이유**: 기존에 보유한 하드웨어를 활용하여 초기 비용 절약, 서버 환경에 대한 완전한 제어권 확보.
    -   **필요 도구**: **PM2** (Node.js 프로세스 매니저), **nginx** (리버스 프록시, 선택 사항).

---

## 📦 의존성 요약

### 프론트엔드 (`package.json`)

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "axios": "^1.6.0",
    "jspdf": "^2.5.0",
    "jspdf-autotable": "^3.8.0",
    "react-hook-form": "^7.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### 백엔드 (`package.json`)

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "axios": "^1.6.0",
    "cors": "^2.8.0",
    "multer": "^1.4.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

---

## 🔄 버전 호환성

-   **Node.js**: 최소 `18.x`, 권장 `20.x` (LTS)
-   **브라우저 지원**: Chrome, Safari, Firefox, Edge 최신 버전

---

## 📊 기술 선택 기준

1.  **단순함**: 학습 곡선이 낮고 직관적인 기술을 우선.
2.  **AI 증강 코딩 친화적**: AI 도구가 이해하고 코드를 생성하기 쉬운 검증된 기술.
3.  **안정성**: 커뮤니티가 활성화되어 있고 안정성이 검증된 기술.
4.  **확장성**: 향후 기능 확장을 고려한 모듈식 구조에 적합한 기술.

---

## 📝 문서 이력
- 2025-10-09: 초안 작성