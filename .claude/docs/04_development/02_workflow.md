# VocaPDF - 개발 워크플로우

## 📌 개요

이 문서는 VocaPDF 프로젝트의 일반적인 개발 워크플로우를 설명합니다. 새로운 기능 추가, 버그 수정, 코드 리뷰, 배포까지의 과정을 안내합니다.

---

## 🔄 전체 워크플로우

`기획/이슈 생성` → `브랜치 생성` → `코드 개발` → `테스트` → `Pull Request` → `코드 리뷰` → `머지` → `배포`

---

## 🛠️ 단계별 상세 가이드

### 1. 이슈 생성 및 브랜치 생성

-   **GitHub 이슈 생성**: 새로운 기능이나 버그에 대한 이슈를 생성합니다.
-   **브랜치 생성**: `main` 브랜치에서 새로운 기능 브랜치를 생성합니다.

    **브랜치 명명 규칙**:
    -   기능: `feat/{기능명}` (e.g., `feat/dark-mode`)
    -   버그 수정: `fix/{버그내용}` (e.g., `fix/pdf-font-error`)
    -   문서: `docs/{문서명}` (e.g., `docs/update-readme`)

    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/new-feature
    ```

### 2. 코드 개발 (프론트엔드 & 백엔드)

-   **동시 개발**: 프론트엔드와 백엔드 개발 서버를 동시에 실행합니다.

    ```bash
    # 터미널 1: 백엔드
    cd backend
    npm run dev

    # 터미널 2: 프론트엔드
    cd frontend
    npm run dev
    ```
-   **API 우선 개발**: 백엔드의 API 명세를 먼저 확정하고, 프론트엔드에서 해당 API를 호출하여 개발을 진행합니다. (`.claude/docs/05_api/01_api_spec.md` 참조)
-   **문서 기반 개발**: 개발 전 관련 문서를 먼저 확인합니다. (e.g., PDF 테이블 구조 변경 시 `.claude/docs/03_pdf_spec/02_table_structure.md` 확인)

### 3. 커밋 및 푸시

-   작업 단위를 기준으로 의미 있는 커밋 메시지를 작성합니다.

    **커밋 메시지 규칙**: `타입: 제목`
    -   `feat`: 새로운 기능 추가
    -   `fix`: 버그 수정
    -   `docs`: 문서 수정
    -   `style`: 코드 포맷팅, 세미콜론 누락 등
    -   `refactor`: 코드 리팩토링
    -   `test`: 테스트 코드 추가/수정

    ```bash
    git add .
    git commit -m "feat: Add dark mode toggle button"
    git push origin feat/dark-mode
    ```

### 4. 테스트

-   **백엔드 API 테스트**: `backend/test-api.sh` 스크립트를 실행하여 주요 API가 정상 작동하는지 확인합니다.
-   **프론트엔드 기능 테스트**: 브라우저에서 직접 기능을 실행하며 예상대로 동작하는지 확인합니다.

### 5. Pull Request (PR) 생성

-   GitHub에서 `main` 브랜치로 향하는 Pull Request를 생성합니다.
-   PR 템플릿에 따라 변경 사항, 테스트 방법 등을 상세히 기재합니다.

### 6. 코드 리뷰

-   동료 개발자 또는 AI 에이전트에게 코드 리뷰를 요청합니다.
-   피드백을 반영하여 코드를 수정하고, 모든 논의가 완료되면 PR을 승인합니다.

### 7. 머지 및 배포

-   PR이 승인되면 `main` 브랜치에 머지합니다.
-   **배포**: `.claude/commands/deploy.md` 문서의 절차에 따라 배포를 진행합니다.
    -   **Frontend**: `npm run build` 후 `dist` 폴더를 Vercel 등에 배포합니다.
    -   **Backend**: PM2를 사용하여 서버를 재시작합니다.

---

## 💡 개발 팁

-   **API 명세 우선**: 프론트엔드와 백엔드 간의 의존성을 줄이기 위해 API 명세를 먼저 확정하고 개발을 시작하세요.
-   **문서 활용**: 개발 시작 전 `.claude/docs` 폴더의 관련 문서를 반드시 읽어보세요. 프로젝트의 구조와 규칙을 이해하는 데 도움이 됩니다.
-   **점진적 커밋**: 너무 큰 단위로 커밋하지 말고, 논리적인 작업 단위로 나누어 커밋하세요.

---

## 📝 문서 이력
- 2025-10-10: 초안 작성